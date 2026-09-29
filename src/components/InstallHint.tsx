"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "./Icon";
import { Arrow } from "./ui";

const KEY = "install-hint-dismissed";

type Device = "ios" | "android" | "mac-safari" | "pc";

// Chrome・Edge がインストール可能なときに発生させるイベント（標準の型定義にないため自前で定義）
type InstallPromptEvent = Event & { prompt(): Promise<void>; userChoice: Promise<{ outcome: string }> };

function detectDevice(): Device {
  const ua = navigator.userAgent;
  // iPadOS のSafariはMacとして名乗るため、タッチ対応かどうかで見分ける
  const isIPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || isIPadOS) return "ios";
  if (/Android/.test(ua)) return "android";
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|Firefox/.test(ua)) return "mac-safari";
  return "pc";
}

/** ホーム画面への追加を、iPhone・Android・PC それぞれの手順で案内する（追加済み・非表示にした人には出さない） */
export function InstallHint() {
  const [show, setShow] = useState(false);
  const [device, setDevice] = useState<Device>("pc");
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    let dismissed = false;
    try {
      dismissed = localStorage.getItem(KEY) === "1";
    } catch {
      // 保存領域が使えない環境でも表示は続ける
    }
    setDevice(detectDevice());
    setShow(!standalone && !dismissed);

    // Android の Chrome や PC の Chrome・Edge では、ボタン1つでインストールできる
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as InstallPromptEvent);
    };
    const onInstalled = () => setShow(false);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") setShow(false);
  }

  const isPC = device === "pc" || device === "mac-safari";

  return (
    <div className="cut relative border-b-[3px] border-brand-500 bg-panel p-5 text-sm leading-relaxed">
      <button onClick={dismiss} className="absolute top-2 right-3 text-lg text-stone-400" aria-label="閉じる">
        ×
      </button>
      <p className="text-[11px] font-semibold tracking-[0.2em] text-brand-600">
        {device === "ios" ? "iPhone" : device === "android" ? "Android" : "PC"}
      </p>
      <p className="mt-0.5 flex items-center gap-1.5 font-bold">
        <Icon name={isPC ? "monitor" : "smartphone"} size={18} className="text-brand-600" />
        {isPC ? "すぐ開けるようにしよう" : "ホーム画面に追加しよう"}
      </p>

      <ol className="mt-3 space-y-2 text-stone-700">
        {device === "ios" && (
          <>
            <li className="flex flex-wrap items-center gap-1">
              1. Safari の画面下（Chrome は右上）の <Icon name="share" size={17} className="text-brand-600" />
              <b>共有ボタン</b> をタップ
            </li>
            <li>
              2. 「<b>ホーム画面に追加</b>」→「<b>追加</b>」をタップ
            </li>
          </>
        )}
        {device === "android" && (
          <>
            <li className="flex flex-wrap items-center gap-1">
              1. Chrome の右上の <Icon name="more" size={17} className="text-brand-600" />
              <b>メニュー</b> をタップ
            </li>
            <li>
              2. 「<b>ホーム画面に追加</b>」または「<b>アプリをインストール</b>」をタップ
            </li>
          </>
        )}
        {device === "mac-safari" && (
          <li>
            メニューバーの「<b>ファイル</b>」→「<b>Dockに追加</b>」を選ぶと、アプリのように Dock から開けます。
          </li>
        )}
        {device === "pc" && (
          <>
            <li>
              <b>Chrome・Edge</b>：アドレスバーの右端に出る <b>インストール</b> のアイコンを押すと、アプリとして開けます。
            </li>
            <li>
              そのほかのブラウザ：<b>ブックマーク</b>（Ctrl＋D、Macは ⌘＋D）に登録しておくと便利です。
            </li>
          </>
        )}
      </ol>

      {installEvent && (
        <button
          onClick={install}
          className="cut mt-4 flex w-full items-center justify-between bg-brand-500 px-4 py-3 font-bold text-white active:bg-brand-600"
        >
          今すぐインストールする
          <Arrow />
        </button>
      )}

      <Link href="/about" className="mt-3 flex items-center gap-1.5 text-xs text-stone-500">
        ほかの端末での手順を見る
        <Arrow className="text-stone-400" />
      </Link>
    </div>
  );
}
