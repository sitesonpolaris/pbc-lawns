"use client";

import { useActionState, useEffect, useRef, type ReactNode } from "react";

type Res = { ok?: boolean; error?: string; message?: string };

/** Wraps a server action that returns { ok, error, message } and shows the result inline. */
export function ActionForm({
  action,
  children,
  className = "",
  submit,
  submitClass = "btn btn-ink",
  resetOnSuccess = false,
}: {
  action: (s: Res, f: FormData) => Promise<Res>;
  children: ReactNode;
  className?: string;
  submit: string;
  submitClass?: string;
  resetOnSuccess?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && resetOnSuccess) ref.current?.reset();
  }, [state, resetOnSuccess]);
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button disabled={pending} className={`${submitClass} disabled:opacity-70`}>
          {pending ? "Working…" : submit}
        </button>
        {state.error && <p role="alert" className="font-medium text-danger">{state.error}</p>}
        {state.ok && state.message && <p role="status" className="break-all font-semibold text-stripe">{state.message}</p>}
      </div>
    </form>
  );
}
