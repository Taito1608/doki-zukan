import { NextResponse, type NextRequest } from "next/server";
import { todayJST } from "@/lib/birthday";
import { isAuthorizedCron } from "@/lib/cron";
import { planEveNotifications } from "@/lib/notifications";
import { sendPlannedNotifications } from "@/lib/push";
import { createAdminClient } from "@/lib/supabase/admin";

// 前日の夜（19時ごろ・vercel.json）：「明日は〇〇さんの誕生日です！」
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!isAuthorizedCron(request)) return NextResponse.json({ ok: false }, { status: 401 });
  try {
    const admin = createAdminClient();
    const [{ data: people, error: e1 }, { data: subs, error: e2 }] = await Promise.all([
      admin.from("profiles").select("id, display_name, birth_month, birth_day"),
      admin.from("push_subscriptions").select("user_id"),
    ]);
    if (e1 || e2) throw e1 ?? e2;

    const recipients = [...new Set((subs ?? []).map((s) => s.user_id as string))];
    const plans = planEveNotifications(people ?? [], recipients, todayJST());
    const result = await sendPlannedNotifications(admin, plans);
    return NextResponse.json({ ok: true, planned: plans.length, ...result });
  } catch (error) {
    console.error("notify-eve failed", error);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
