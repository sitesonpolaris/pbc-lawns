"use client";

import { useActionState } from "react";
import { signContract, type Res } from "../actions";

export function SignForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState<Res, FormData>(signContract, {});
  if (state.ok) return <p role="status" className="mt-4 font-semibold text-stripe">{state.message}</p>;
  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="flex items-start gap-3">
        <input type="checkbox" name="agree" className="mt-1 size-5 accent-stripe" />
        <span>I have read this agreement and agree to its terms.</span>
      </label>
      <div className="max-w-sm">
        <label htmlFor={`sig-${id}`} className="label">Type your full name to sign</label>
        <input id={`sig-${id}`} name="signed_name" autoComplete="name" required className="field font-display text-xl" />
      </div>
      {state.error && <p role="alert" className="font-medium text-danger">{state.error}</p>}
      <button disabled={pending} className="btn btn-gold disabled:opacity-70">{pending ? "Signing…" : "Sign agreement"}</button>
    </form>
  );
}
