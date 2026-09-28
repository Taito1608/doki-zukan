import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Member, Profile, ProfileWithPhoto } from "@/lib/types";

const SIGNED_URL_TTL = 60 * 60; // 1時間

/** ログイン中のユーザー・メンバー情報・プロフィールをまとめて取得（1リクエスト内でキャッシュ） */
export const getSession = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, member: null, profile: null };

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

/** 写真パスを署名付きURLに変換してプロフィールに付与する */
export async function attachPhotoUrls(profiles: Profile[]): Promise<ProfileWithPhoto[]> {
  const supabase = await createClient();
  const paths = profiles.map((p) => p.photo_path).filter((p): p is string => !!p);
  const urlByPath = new Map<string, string>();

  if (paths.length > 0) {
    const { data } = await supabase.storage.from("avatars").createSignedUrls(paths, SIGNED_URL_TTL);
    for (const item of data ?? []) {
      if (item.path && item.signedUrl) urlByPath.set(item.path, item.signedUrl);
    }
  }

  return profiles.map((p) => ({
    ...p,
    photo_url: p.photo_path ? (urlByPath.get(p.photo_path) ?? null) : null,
  }));
}

export async function getAllProfiles(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("*").order("display_name");
  return (data ?? []) as Profile[];
}
