"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { resetPassword, sendMagicLink, signIn, signUp, type AuthState } from "./actions";

type Mode = "signin" | "link" | "signup" | "reset";

const titles: Record<Mode, string> = {
  signin: "Sign in",
  link: "Email me a link",
  signup: "Create your account",
  reset: "Reset password",
};

export function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/portal";
  const [mode, setMode] = useState<Mode>(params.get("mode") === "signup" ? "signup" : "signin");

  const actionFor = { signin: signIn, link: sendMagicLink, signup: signUp, reset: resetPassword }[mode];

  return (
    <div>
      <h1 className="text-[clamp(2.4rem,5vw,3.5rem)] leading-none">{titles[mode]}</h1>
      <p className="mt-4 text-lg text-muted">
        {mode === "signup"
          ? "Use the same email PBC has on file and your schedule and invoices appear automatically."
          : "Your PBC customer portal: schedule, treatments, billing and agreements."}
      </p>
      <Form key={mode} mode={mode} action={actionFor} next={next} />
      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-[0.98rem]">
        {mode !== "signin" && <ModeLink onClick={() => setMode("signin")}>Sign in with password</ModeLink>}
        {mode !== "link" && <ModeLink onClick={() => setMode("link")}>Email me a sign-in link</ModeLink>}
        {mode !== "signup" && <ModeLink onClick={() => setMode("signup")}>New customer? Create account</ModeLink>}
        {mode === "signin" && <ModeLink onClick={() => setMode("reset")}>Forgot password</ModeLink>}
      </div>
    </div>
  );
}

function ModeLink({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className="font-semibold text-stripe underline decoration-2 underline-offset-4 hover:text-turf">
      {children}
    </button>
  );
}

function Form({
  mode,
  action,
  next,
}: {
  mode: Mode;
  action: (s: AuthState, f: FormData) => Promise<AuthState>;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  if (state.ok) {
    return <p role="status" className="mt-8 rounded-xl bg-turf p-5 text-lg text-ground">{state.message}</p>;
  }

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <input type="hidden" name="next" value={next} />
      {mode === "signup" && (
        <div>
          <label htmlFor="full_name" className="label">Full name</label>
          <input id="full_name" name="full_name" autoComplete="name" required className="field" />
        </div>
      )}
      <div>
        <label htmlFor="email" className="label">Email</label>
        <input id="email" name="email" type="email" autoComplete="email" required className="field" />
      </div>
      {(mode === "signin" || mode === "signup") && (
        <div>
          <label htmlFor="password" className="label">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
            minLength={mode === "signup" ? 8 : undefined}
            required
            className="field"
          />
        </div>
      )}
      {state.error && <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-medium text-danger">{state.error}</p>}
      <button type="submit" disabled={pending} className="btn btn-gold w-full text-lg disabled:opacity-70">
        {pending ? "One moment…" : titles[mode]}
      </button>
    </form>
  );
}
