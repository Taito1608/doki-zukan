"use client";

import { useActionState, useState } from "react";
import { joinWithInvite, type ActionState } from "@/app/actions";

export function JoinForm() {
  const [state, action, pending] = useActionState<ActionState, FormData>(joinWithInvite, {});
  const [code, setCode] = useState("");

  return (
    <form action={action} className="w-full space-y-4">
      <input
        name="code"
        required
        value={code}
        onChange={(e) => setCode(e.target.value)}
        autoComplete="off"
        autoCapitalize="characters"
        placeholder="例：DOKI2027"
        className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-4 text-center text-xl font-bold tracking-widest outline-none focus:border-brand-500"
      />
      {state.error && <p className="text-center text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-brand-500 py-4 text-lg font-bold text-white shadow-sm active:bg-brand-600 disabled:opacity-60"
      >
        {pending ? "確認しています…" : "参加する"}
      </button>
    </form>
  );
}
