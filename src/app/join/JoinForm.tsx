"use client";

import { useActionState, useState } from "react";
import { joinWithInvite, type ActionState } from "@/app/actions";
import { Arrow, btnPrimary } from "@/components/ui";

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
        className="w-full border-b-2 border-stone-300 bg-transparent px-4 py-4 text-center text-2xl font-semibold tracking-[0.3em] outline-none focus:border-brand-500"
      />
      {state.error && <p className="text-center text-sm text-red-600">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className={`${btnPrimary} text-lg`}
      >
        {pending ? "確認しています…" : "参加する"}
        <Arrow />
      </button>
    </form>
  );
}
