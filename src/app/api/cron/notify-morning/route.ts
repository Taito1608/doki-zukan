import { NextResponse, type NextRequest } from "next/server";
import { todayJST } from "@/lib/birthday";
import { isAuthorizedCron } from "@/lib/cron";
import { planMorningNotifications } from "@/lib/notifications";
import { sendPlannedNotifications } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";

// 当日の朝（8時ごろ・vercel.json）：本人には「おめでとう」、まだ書いていない同期には「今日は〇〇さんの誕生日です！」
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const admin = createAdminClient();
    const today = todayJST();
    const [{ data: people, error: e1 }, { data: subs, error: e2 }, { data: messages, error: e3 }] = await Promise.all([
      admin.from("profiles").select("id, display_name, birth_month, birth_day"),
      admin.from("push_subscriptions").select("user_id"),
      admin.from("birthday_messages").select("from_user_id, to_user_id, year").eq("year", today.year),
    ]);
    if (e1 || e2 || e3) throw e1 ?? e2 ?? e3;

    const recipients = [...new Set((subs ?? []).map((s) => s.user_id as string))];
    const plans = planMorningNotifications(people ?? [], recipients, messages ?? [], today);
    const result = await sendPlannedNotifications(admin, plans);
    return NextResponse.json({ ok: true, planned: plans.length, ...result });
  } catch (error) {
    console.error("notify-morning failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
