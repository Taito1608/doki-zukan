"use client";

import { useActionState, useState } from "react";
import { saveMessage, type ActionState } from "@/app/actions";
import { MESSAGE_MAX_LENGTH } from "@/lib/constants";

export function MessageForm({
  toUserId,
  toName,
  existing,
}: {
  toUserId: string;
  toName: string;
  existing: string | null;
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(saveMessage, {});
  const [body, setBody] = useState(existing ?? "");

  return (
    <form action={action} className="rounded-3xl bg-white p-4 shadow-sm">
      <input type="hidden" name="to_user_id" value={toUserId} />
      <label htmlFor="body" className="mb-2 block font-bold">
        {existing ? "あなたのメッセージ（書き直せます）" : `${toName}さんへ一言`}
      </label>
      <textarea
        id="body"
        name="body"
        required
        rows={3}
        maxLength={MESSAGE_MAX_LENGTH}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="例：お誕生日おめでとう！研修でまた話そう🎉"
        className="w-full rounded-xl border border-stone-300 px-4 py-3 outline-none focus:border-brand-500"
      />
      <div className="mt-1 text-right text-xs text-stone-400">
        {body.length}/{MESSAGE_MAX_LENGTH}
      </div>
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      {state.ok && !pending && <p className="mb-2 text-sm font-bold text-green-700">届けました！🎉</p>}
      <button
        type="submit"
        disabled={pending || body.trim().length === 0}
        className="w-full rounded-2xl bg-brand-500 py-3.5 text-lg font-bold text-white active:bg-brand-600 disabled:opacity-50"
      >
        {pending ? "送信しています…" : existing ? "書き直す" : "寄せ書きに書く"}
      </button>
    </form>
  );
}
