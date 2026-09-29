"use client";

import { useActionState, useState } from "react";
import { saveMessage, type ActionState } from "@/app/actions";
import { MESSAGE_MAX_LENGTH } from "@/lib/constants";
import { Icon } from "@/components/Icon";
import { Arrow, btnPrimary } from "@/components/ui";

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
    <form action={action} className="cut bg-panel p-5">
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
        placeholder="例：お誕生日おめでとう！また話そう🎉"
        className="w-full border border-stone-300 bg-white px-4 py-3 outline-none focus:border-brand-500"
      />
      <div className="mt-1 text-right text-xs text-stone-400">
        {body.length}/{MESSAGE_MAX_LENGTH}
      </div>
      {state.error && <p className="mb-2 text-sm text-red-600">{state.error}</p>}
      {state.ok && !pending && (
        <p className="mb-2 flex items-center gap-1 text-sm font-bold text-green-700">
          <Icon name="check" size={16} />
          届けました！
        </p>
      )}
      <button
        type="submit"
        disabled={pending || body.trim().length === 0}
        className={btnPrimary}
      >
        {pending ? "送信しています…" : existing ? "書き直す" : "寄せ書きに書く"}
        <Arrow />
      </button>
    </form>
  );
}
