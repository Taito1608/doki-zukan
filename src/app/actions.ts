"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cleanHobbies } from "@/lib/common";
import { messageTarget } from "@/lib/birthday";
import { JOB_TYPES, MESSAGE_MAX_LENGTH, NAME_ROMAN_PATTERN, PREFECTURES } from "@/lib/constants";
import type { Profile } from "@/lib/types";

export type ActionState = { error?: string; ok?: boolean };

function str(formData: FormData, key: string, max = 200): string | null {
  const v = formData.get(key);
  if (typeof v !== "string") return null;
  const t = v.trim().slice(0, max);
  return t === "" ? null : t;
}

async function currentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, userId: user.id };
}

/* ---------------- 招待コード ---------------- */

export async function joinWithInvite(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase } = await currentUserId();
  const code = str(formData, "code", 50);
  if (!code) return { error: "招待コードを入力してください。" };

  const { data, error } = await supabase.rpc("join_with_invite", { p_code: code });
  if (error) return { error: "登録に失敗しました。時間をおいてもう一度お試しください。" };
  if (!data) return { error: "招待コードが正しくありません。" };

  revalidatePath("/", "layout");
  redirect("/onboarding");
}

/* ---------------- プロフィール ---------------- */

export async function saveProfile(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await currentUserId();

  const displayName = str(formData, "display_name", 30);
  if (!displayName) return { error: "名前を入力してください。" };

  // 全角英字やスペースの重なりを整えてから、ローマ字かどうかを確かめる
  const nameRoman = (str(formData, "name_roman", 80) ?? "").normalize("NFKC").replace(/\s+/g, " ").trim() || null;
  if (!nameRoman) return { error: "読み仮名（ローマ字）を入力してください。" };
  if (!NAME_ROMAN_PATTERN.test(nameRoman)) {
    return { error: "読み仮名は、ローマ字（半角英字）40文字以内で入力してください。" };
  }

  const jobType = str(formData, "job_type");
  const hometown = str(formData, "hometown");
  if (jobType && !(JOB_TYPES as readonly string[]).includes(jobType)) {
    return { error: "職種の値が正しくありません。" };
  }
  if (hometown && !(PREFECTURES as readonly string[]).includes(hometown)) {
    return { error: "出身地の値が正しくありません。" };
  }

  const month = Number(str(formData, "birth_month") ?? NaN);
  const day = Number(str(formData, "birth_day") ?? NaN);
  const hasBirthday = Number.isInteger(month) && Number.isInteger(day);
  if (hasBirthday) {
    const maxDay = new Date(Date.UTC(2024, month, 0)).getUTCDate(); // うるう年基準
    if (month < 1 || month > 12 || day < 1 || day > maxDay) {
      return { error: "誕生日の日付が正しくありません。" };
    }
  } else if (Number.isInteger(month) !== Number.isInteger(day)) {
    return { error: "誕生日は月と日の両方を選んでください。" };
  }

  let hobbies: string[] = [];
  try {
    const raw = JSON.parse(String(formData.get("hobbies") ?? "[]"));
    if (Array.isArray(raw)) hobbies = cleanHobbies(raw.map(String));
  } catch {
    hobbies = [];
  }

  // 写真：自分のフォルダ内のパスだけ受け付ける
  const newPhotoPath = str(formData, "photo_path", 300);
  if (newPhotoPath && !newPhotoPath.startsWith(`${userId}/`)) {
    return { error: "写真の保存先が正しくありません。" };
  }

  const { data: before } = await supabase
    .from("profiles")
    .select("photo_path")
    .eq("id", userId)
    .maybeSingle<Pick<Profile, "photo_path">>();

  const { error } = await supabase.from("profiles").upsert({
    id: userId,
    display_name: displayName,
    name_roman: nameRoman,
    photo_path: newPhotoPath,
    job_type: jobType,
    hometown,
    hobbies,
    birth_month: hasBirthday ? month : null,
    birth_day: hasBirthday ? day : null,
    message: str(formData, "message", 100),
    updated_at: new Date().toISOString(),
  });

  if (error) return { error: "保存に失敗しました。もう一度お試しください。" };

  // 差し替え・削除された古い写真を消す
  if (before?.photo_path && before.photo_path !== newPhotoPath) {
    await supabase.storage.from("avatars").remove([before.photo_path]);
  }

  revalidatePath("/", "layout");
  const next = str(formData, "next");
  redirect(next === "home" ? "/" : `/members/${userId}`);
}

/* ---------------- 寄せ書き ---------------- */

export async function saveMessage(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { supabase, userId } = await currentUserId();
  const toUserId = str(formData, "to_user_id", 64);
  const body = str(formData, "body", MESSAGE_MAX_LENGTH);

  if (!toUserId) return { error: "送り先が見つかりません。" };
  if (toUserId === userId) return { error: "自分には書けません。" };
  if (!body) return { error: "メッセージを入力してください。" };

  const { data: target } = await supabase
    .from("profiles")
    .select("birth_month, birth_day")
    .eq("id", toUserId)
    .maybeSingle<Pick<Profile, "birth_month" | "birth_day">>();

  if (!target?.birth_month || !target.birth_day) {
    return { error: "この同期は誕生日を登録していません。" };
  }

  const { year, canWrite } = messageTarget(target.birth_month, target.birth_day);
  if (!canWrite) return { error: "寄せ書きは誕生日の前後1週間だけ書けます。" };

  const { error } = await supabase.from("birthday_messages").upsert(
    {
      to_user_id: toUserId,
      from_user_id: userId,
      year,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "to_user_id,from_user_id,year" },
  );

  if (error) return { error: "送信に失敗しました。もう一度お試しください。" };

  revalidatePath(`/members/${toUserId}/birthday`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteMessage(formData: FormData) {
  const { supabase } = await currentUserId();
  const id = str(formData, "id", 64);
  const toUserId = str(formData, "to_user_id", 64);
  if (!id) return;

  // 権限（書いた人・本人・管理者）はRLSで判定される
  await supabase.from("birthday_messages").delete().eq("id", id);
  if (toUserId) revalidatePath(`/members/${toUserId}/birthday`);
}

/* ---------------- アカウント ---------------- */

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function deleteAccount(formData: FormData) {
  const { supabase, userId } = await currentUserId();
  if (formData.get("confirm") !== "削除") return;

  // 写真ファイルを先に消す
  const { data: files } = await supabase.storage.from("avatars").list(userId);
  if (files && files.length > 0) {
    await supabase.storage.from("avatars").remove(files.map((f) => `${userId}/${f.name}`));
  }

  await supabase.rpc("delete_my_account");
  await supabase.auth.signOut();
  redirect("/login");
}
