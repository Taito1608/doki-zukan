import webpush from "web-push";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlannedNotification } from "./notifications";

// Web Push の送信（サーバー専用）

type Subscription = { endpoint: string; user_id: string; p256dh: string; auth: string };

function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("VAPID の鍵が設定されていません");
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:noreply@example.com", publicKey, privateKey);
}

/**
 * 予定した通知を、各ユーザーの登録済みの端末すべてへ送る。
 * 端末側で無効になった登録（404/410）は削除する。
 */
export async function sendPlannedNotifications(admin: SupabaseClient, plans: PlannedNotification[]) {
  if (plans.length === 0) return { sent: 0, failed: 0, removed: 0 };
  configure();

  const { data, error } = await admin
    .from("push_subscriptions")
    .select("endpoint, user_id, p256dh, auth")
    .in("user_id", [...new Set(plans.map((p) => p.userId))]);
  if (error) throw error;
  const subs = (data ?? []) as Subscription[];

  const jobs = plans.flatMap((plan) =>
    subs
      .filter((s) => s.user_id === plan.userId)
      .map((s) => ({ sub: s, payload: JSON.stringify({ title: plan.title, body: plan.body, url: plan.url, tag: plan.tag }) })),
  );

  const results = await Promise.allSettled(
    jobs.map(({ sub, payload }) =>
      webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, {
        TTL: 60 * 60 * 6, // 6時間以内に届かなければ破棄（古いお知らせを後から出さない）
        urgency: "normal",
      }),
    ),
  );

  const expired: string[] = [];
  let failed = 0;
  results.forEach((r, i) => {
    if (r.status === "fulfilled") return;
    const status = (r.reason as { statusCode?: number })?.statusCode;
    if (status === 404 || status === 410) expired.push(jobs[i].sub.endpoint);
    else {
      failed++;
      console.error("push failed", status, r.reason);
    }
  });
  if (expired.length > 0) await admin.from("push_subscriptions").delete().in("endpoint", expired);

  return { sent: results.length - failed - expired.length, failed, removed: expired.length };
}
