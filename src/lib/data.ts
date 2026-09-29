import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { thumbPathOf } from "@/lib/photo";
import type { Member, Profile, ProfileWithPhoto } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60 * 24; // 24時間
const SIGNED_URL_REUSE_MARGIN = 60 * 60; // 残り1時間を切ったら新しく発行する

/** ログイン中のユーザー・メンバー情報・プロフィールをまとめて取得（1リクエスト内でキャッシュ） */
export const getSession = cache(async () => {
  const supabase = await createClient();
  // middleware と同じく getClaims で検証し、認証サーバーへの通信を減らす
  const { data } = await supabase.auth.getClaims();
  const claims = data?.claims;
  if (!claims) return { supabase, user: null, member: null, profile: null };
  const user = { id: claims.sub, user_metadata: (claims.user_metadata ?? {}) as Record<string, unknown> };

  const [{ data: member }, { data: profile }] = await Promise.all([
    supabase.from("members").select("*").eq("id", user.id).maybeSingle<Member>(),
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle<Profile>(),
  ]);

  return { supabase, user, member, profile };
});

/** 同期メンバーでプロフィール登録済みであることを保証する */
export async function requireProfile() {
  const session = await getSession();
  if (!session.user) redirect("/login");
  if (!session.member) redirect("/join");
  if (!session.profile) redirect("/onboarding");
  return {
    supabase: session.supabase,
    user: session.user,
    member: session.member,
    profile: session.profile,
  };
}

type Supabase = Awaited<ReturnType<typeof createClient>>;

// 署名付きURLは発行するたびに文字列が変わり、ブラウザのキャッシュが効かなくなる。
// 同じ写真には有効期限が十分残っている間は同じURLを返し、写真の再ダウンロード（通信量）を減らす。
// ここに入るのは requireProfile を通った同期メンバーのリクエストで発行したURLだけ。
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();
// サムネイルがない古い写真を、毎回問い合わせないよう覚えておく
const missingThumbs = new Set<string>();

async function signedUrlsFor(supabase: Supabase, paths: string[]) {
  const now = Date.now();
  const result = new Map<string, string>();
  const need: string[] = [];
  for (const path of new Set(paths)) {
    const cached = signedUrlCache.get(path);
    if (cached && cached.expiresAt - now > SIGNED_URL_REUSE_MARGIN * 1000) result.set(path, cached.url);
    else need.push(path);
  }
  if (need.length > 0) {
    const { data } = await supabase.storage.from("avatars").createSignedUrls(need, SIGNED_URL_TTL);
    for (const item of data ?? []) {
      if (!item.path) continue;
      if (item.signedUrl && !item.error) {
        result.set(item.path, item.signedUrl);
        signedUrlCache.set(item.path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_TTL * 1000 });
      } else if (item.path.endsWith("_s.jpg")) {
        missingThumbs.add(item.path);
      }
    }
  }
  return result;
}

/**
 * 写真パスを署名付きURLに変換してプロフィールに付与する。
 * size="thumb" なら一覧向けの小さい写真を使う（ない古い写真は元の写真で代用）。
 */
export async function attachPhotoUrls(
  profiles: Profile[],
  { size = "full" }: { size?: "full" | "thumb" } = {},
): Promise<ProfileWithPhoto[]> {
  const supabase = await createClient();
  const originals = profiles.map((p) => p.photo_path).filter((p): p is string => !!p);

  const wanted =
    size === "thumb"
      ? originals.map((p) => (missingThumbs.has(thumbPathOf(p)) ? p : thumbPathOf(p)))
      : originals;
  const urls = await signedUrlsFor(supabase, wanted);

  // サムネイルが見つからなかった写真は、元の写真で取り直す
  const fallback = originals.filter((p) => !urls.has(p) && !urls.has(thumbPathOf(p)));
  if (fallback.length > 0) {
    for (const [k, v] of await signedUrlsFor(supabase, fallback)) urls.set(k, v);
  }

  return profiles.map((p) => ({
    ...p,
    photo_url: p.photo_path ? (urls.get(size === "thumb" ? thumbPathOf(p.photo_path) : p.photo_path) ?? urls.get(p.photo_path) ?? null) : null,
  }));
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("display_name");
  return (data ?? []) as Profile[];
}
