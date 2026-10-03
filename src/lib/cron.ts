import type { NextRequest } from "next/server";

/** CRON_SECRET を設定していれば、Vercel Cron（Authorization ヘッダー付き）以外からの呼び出しを断る */
export function isAuthorizedCron(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  return !secret || request.headers.get("authorization") === `Bearer ${secret}`;
}
