"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { enablePush, getPushStatus, type PushStatus } from "@/lib/push-client";
import { Icon } from "./Icon";
import { Arrow } from "./ui";

const KEY = "notification-prompt-later";
const LATER_DAYS = 14;

/** ホームで、通知がオフの人にだけ「誕生日の通知を受け取ろう」と案内する */
export function NotificationPrompt() {
  const [status, setStatus] = useState<PushStatus | null>(null);
  const [hidden, setHidden] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let later = 0;
    try {
      later = Number(localStorage.getItem(KEY) ?? 0);
    } catch {
      // 保存領域が使えない環境でも表示は続ける
    }
    setHidden(Date.now() < later);
    getPushStatus().then(setStatus).catch(() => setStatus("unsupported"));
  }, []);

  if (done) {
    return (
      <p className="cut flex items-center gap-2 bg-panel p-4 text-sm font-bold text-green-700">
        <Icon name="check" size={18} />
        通知をオンにしました。誕生日の前日の夜にお知らせします。
      </p>
    );
  }
  if (hidden || (status !== "off" && status !== "needs-install")) return null;

  function later() {
    try {
      localStorage.setItem(KEY, String(Date.now() + LATER_DAYS * 24 * 60 * 60 * 1000));
    } catch {}
    setHidden(true);
  }

  async function turnOn() {
    setPending(true);
    setError(null);
    try {
      const next = await enablePush();
      if (next === "on") setDone(true);
      else if (next === "denied") setError("通知がブロックされました。ブラウザの設定から許可できます。");
      setStatus(next);
    } catch {
      setError("通知をオンにできませんでした。もう一度お試しください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="cut border-b-[3px] border-brand-500 bg-panel p-5 text-sm leading-relaxed">
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">NOTICE</p>
      <p className="mt-0.5 flex items-center gap-1.5 font-bold">
        <Icon name="bell" size={18} className="text-brand-600" />
        誕生日の通知を受け取ろう
      </p>

      {status === "needs-install" ? (
        <p className="mt-2 text-stone-700">
          iPhone では、<b>先にホーム画面に追加</b>し、追加したアプリから開くと通知をオンにできます。
        </p>
      ) : (
        <>
          <p className="mt-2 text-stone-700">同期の誕生日前日の夜に、お知らせが届きます。</p>
          <button
            onClick={turnOn}
            disabled={pending}
            className="cut mt-4 flex w-full items-center justify-between bg-brand-500 px-4 py-3 font-bold text-white active:bg-brand-600 disabled:opacity-60"
          >
            {pending ? "設定しています…" : "通知をオンにする"}
            <Arrow />
          </button>
          {error && <p className="mt-2 text-red-600">{error}</p>}
        </>
      )}

      <div className="mt-3 flex items-center gap-4 text-xs text-stone-500">
        <button onClick={later} className="underline">
          あとで
        </button>
        <Link href="/me/edit#notification" className="flex items-center gap-1">
          マイページからも設定できます
          <Arrow className="text-stone-400" />
        </Link>
      </div>
    </div>
  );
}
