"use client";

import { deletePushSubscription, savePushSubscription } from "@/app/actions";

// ブラウザ側の通知の登録・解除

export type PushStatus =
  | "unsupported" // この環境では通知を受け取れない
  | "needs-install" // iPhone で、ホーム画面に追加したアプリから開く必要がある
  | "denied" // ブラウザの設定で通知がブロックされている
  | "off"
  | "on";

function isIOS() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function urlBase64ToUint8Array(base64: string) {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/** この端末の通知の状態 */
export async function getPushStatus(): Promise<PushStatus> {
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;
  if (!supported) return isIOS() && !isStandalone() ? "needs-install" : "unsupported";
  if (Notification.permission === "denied") return "denied";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  return sub && Notification.permission === "granted" ? "on" : "off";
}

/** 通知をオンにする（ボタンを押したときに呼ぶこと。許可の確認はユーザー操作が必要） */
export async function enablePush(): Promise<PushStatus> {
  const key = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_VAPID_PUBLIC_KEY が設定されていません");

  const permission = await Notification.requestPermission();
  if (permission !== "granted") return permission === "denied" ? "denied" : "off";

  const reg = await registration();
  await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(key) }));

  const json = sub.toJSON();
  const result = await savePushSubscription({
    endpoint: sub.endpoint,
    p256dh: json.keys?.p256dh ?? "",
    auth: json.keys?.auth ?? "",
  });
  if (result.error) {
    await sub.unsubscribe();
    throw new Error(result.error);
  }
  return "on";
}

/** この端末の通知をオフにする */
export async function disablePush(): Promise<PushStatus> {
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = await reg?.pushManager.getSubscription();
  if (sub) {
    await deletePushSubscription(sub.endpoint);
    await sub.unsubscribe();
  }
  return "off";
}
