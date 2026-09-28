"use client";

import Script from "next/script";
import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

// Google Identity Services の最低限の型
type GoogleId = {
  initialize(options: {
    client_id: string;
    callback: (res: { credential: string }) => void;
    nonce: string;
    ux_mode: "popup";
    itp_support: boolean;
    use_fedcm_for_button: boolean;
  }): void;
  renderButton(el: HTMLElement, options: Record<string, unknown>): void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleId } };
  }
}

async function sha256Hex(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Google ログイン。クライアントIDが設定されていれば、Google のボタンをアプリ内に表示し、
 * 受け取ったIDトークンで Supabase にログインする（Google の画面に Supabase のURLが出ない）。
 * 未設定なら従来の Supabase 経由のログインにする。
 */
export function LoginButton() {
  return GOOGLE_CLIENT_ID ? <GoogleIdentityButton clientId={GOOGLE_CLIENT_ID} /> : <OAuthButton />;
}

function GoogleIdentityButton({ clientId }: { clientId: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function setup() {
    const google = window.google?.accounts.id;
    if (!google || !ref.current) return;

    // リプレイ攻撃を防ぐため、ハッシュ化したnonceをGoogleに渡し、元の値をSupabaseで照合する
    const rawNonce = crypto.randomUUID();
    const hashedNonce = await sha256Hex(rawNonce);

    google.initialize({
      client_id: clientId,
      nonce: hashedNonce,
      ux_mode: "popup",
      itp_support: true,
      use_fedcm_for_button: true,
      callback: async ({ credential }) => {
        setLoading(true);
        setError(null);
        const { error } = await createClient().auth.signInWithIdToken({
          provider: "google",
          token: credential,
          nonce: rawNonce,
        });
        if (error) {
          setError("ログインできませんでした。もう一度お試しください。");
          setLoading(false);
          return;
        }
        // サーバー側で新しいセッションを読み込むため、ページごと移動する
        window.location.assign("/");
      },
    });
    google.renderButton(ref.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "signin_with",
      shape: "rectangular",
      logo_alignment: "center",
      locale: "ja",
      width: Math.min(ref.current.clientWidth, 400),
    });
  }

  return (
    <div className="w-full">
      <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" onReady={() => void setup()} />
      <div ref={ref} className={`flex min-h-11 justify-center ${loading ? "pointer-events-none opacity-50" : ""}`} />
      {loading && <p className="mt-3 text-center text-sm text-stone-500">ログインしています…</p>}
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}

function OAuthButton() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError("ログインを開始できませんでした。もう一度お試しください。");
      setLoading(false);
    }
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={signIn}
        disabled={loading}
        className="cut flex w-full items-center justify-center gap-3 bg-panel px-5 py-4 text-lg font-bold active:scale-[0.99] disabled:opacity-60"
      >
        <svg viewBox="0 0 48 48" className="h-6 w-6" aria-hidden>
          <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
          <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
          <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
        </svg>
        {loading ? "移動しています…" : "Googleでログイン"}
      </button>
      {error && <p className="mt-3 text-center text-sm text-red-600">{error}</p>}
    </div>
  );
}
