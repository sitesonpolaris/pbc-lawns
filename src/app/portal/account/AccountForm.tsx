"use client";

import { useActionState } from "react";
import { updateProfile, type Res } from "../actions";

export function AccountForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState<Res, FormData>(updateProfile, {});
  return (
    <form action={action} className="space-y-5">
      <div>
        <span className="label">Email</span>
        <p className="break-all text-lg">{email}</p>
      </div>
      <div>
        <label htmlFor="full_name" className="label">Full name</label>
        <input id="full_name" name="full_name" defaultValue={fullName} autoComplete="name" className="field" />
      </div>
      <div>
        <label htmlFor="phone" className="label">Phone</label>
        <input id="phone" name="phone" type="tel" defaultValue={phone} autoComplete="tel" className="field" />
      </div>
      <div>
        <label htmlFor="password" className="label">New password (optional)</label>
        <input id="password" name="password" type="password" autoComplete="new-password" minLength={8} className="field" />
      </div>
      {state.error && <p role="alert" className="font-medium text-danger">{state.error}</p>}
      {state.ok && <p role="status" className="font-semibold text-stripe">{state.message}</p>}
      <button disabled={pending} className="btn btn-ink disabled:opacity-70">{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}
