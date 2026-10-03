import { createClient } from "@supabase/supabase-js";

/**
 * 行レベルセキュリティを越えて読み書きできる管理用クライアント（サーバー専用）。
 * 誕生日の通知を全員の端末へ送るときだけ使う。SUPABASE_SERVICE_ROLE_KEY は
 * NEXT_PUBLIC_ を付けないのでブラウザには渡らないが、クライアントコンポーネントから import しないこと。
 */
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, { auth: { persistSession: false } });
}
