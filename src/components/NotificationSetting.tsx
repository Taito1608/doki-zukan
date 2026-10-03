"use client";

import { useEffect, useState } from "react";
import { disablePush, enablePush, getPushStatus, type PushStatus } from "@/lib/push-client";

const MESSAGES: Partial<Record<PushStatus, string>> = {
  "needs-install": "iPhone では、ホーム画面に追加したアプリから開くとオンにできます",
  denied: "ブラウザの設定で通知がブロックされています。設定から許可するとオンにできます",
  unsupported: "このブラウザは通知に対応していません。Safari・Chrome などで開いてください",
};

/** プロフィール編集の「通知」設定。この端末で誕生日のお知らせを受け取るかを切り替える */
export function NotificationSetting() {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPushStatus().then(setStatus).catch(() => setStatus("unsupported"));
  }, []);

  const on = status === "on";
  const available = status === "on" || status === "off";

  async function toggle() {
    setPending(true);
    setError(null);
    try {
      setStatus(on ? await disablePush() : await enablePush());
    } catch {
      setError("切り替えられませんでした。もう一度お試しください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <section id="notification" className="mt-12 scroll-mt-6 space-y-3 border-t border-stone-200 pt-8">
      <h2 className="text-lg font-bold">通知</h2>
      <div className="cut flex items-center gap-4 bg-panel p-4">
        <div className="min-w-0 flex-1">
          <p className="font-bold">誕生日のお知らせ</p>
          <p className={`mt-0.5 text-xs ${status && MESSAGES[status] ? "text-red-600" : "text-stone-500"}`}>
            {status && MESSAGES[status] ? MESSAGES[status] : "この端末で受け取る"}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="この端末で誕生日のお知らせを受け取る"
          onClick={toggle}
          disabled={!available || pending}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${on ? "bg-brand-500" : "bg-stone-300"}`}
        >
          <span
            className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`}
          />
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs leading-relaxed text-stone-500">
        前日19時ごろ：明日が誕生日の同期をお知らせ
        <br />
        当日8時ごろ：まだ寄せ書きを書いていない人だけにお知らせ
        <br />
        スマホとパソコンなど、端末ごとに設定できます。
      </p>
    </section>
  );
}
