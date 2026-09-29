import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Supabase の無料プランは、1週間アクセスがないとプロジェクトが一時停止する。
// Vercel Cron（vercel.json）から1日1回呼び出し、軽い問い合わせをして止まらないようにする。
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  // CRON_SECRET を設定していれば、Vercel Cron 以外からの呼び出しを断る
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    auth: { persistSession: false },
  });
  // 行レベルセキュリティにより中身は返らないが、データベースへの問い合わせとして数えられる
  const { error } = await supabase.from("profiles").select("id", { head: true, count: "exact" });

  if (error) {
    // 失敗に気づけるよう、Vercel のログに残して500を返す（Cron の失敗として表示される）
    console.error("keepalive failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
