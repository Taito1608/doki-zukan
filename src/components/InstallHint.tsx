"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Icon";

const KEY = "install-hint-dismissed";

/** ホーム画面への追加を案内する（追加済み・非表示にした人には出さない） */
export function InstallHint() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

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
    setIsIOS(/iPhone|iPad|iPod/.test(navigator.userAgent));
    setShow(!standalone && !dismissed);
  }, []);

  if (!show) return null;

  function dismiss() {
    try {
      localStorage.setItem(KEY, "1");
    } catch {}
    setShow(false);
  }

  return (
    <div className="relative rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed">
      <button onClick={dismiss} className="absolute top-2 right-3 text-lg text-stone-400" aria-label="閉じる">
        ×
      </button>
      <p className="flex items-center gap-1.5 font-bold">
        <Icon name="smartphone" size={18} className="text-brand-600" />
        ホーム画面に追加しよう
      </p>
      {isIOS ? (
        <p className="mt-1 text-stone-700">
          Safariの下にある <b>共有ボタン（□に↑）</b> →「<b>ホーム画面に追加</b>」をタップすると、アプリのようにすぐ開けます。
        </p>
      ) : (
        <p className="mt-1 text-stone-700">
          ブラウザ右上の <b>︙メニュー</b> →「<b>ホーム画面に追加</b>」をタップすると、アプリのようにすぐ開けます。
        </p>
      )}
    </div>
  );
}
