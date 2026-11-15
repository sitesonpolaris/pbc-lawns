"use client";

import { useSearchParams } from "next/navigation";
import { useActionState, useState } from "react";
import { CheckIcon } from "@/components/Icons";
import { services } from "@/lib/site";
import { submitQuote, type QuoteState } from "./actions";

const initial: QuoteState = { ok: false, message: "" };

const kinds = [
  { value: "subscription", label: "Ongoing service", hint: "Regular mowing or a treatment program" },
  { value: "quote", label: "One-time job", hint: "Cleanup, mulch, planting, a wall, washing" },
  { value: "contact", label: "Just a question", hint: "Ask us anything" },
] as const;

export function QuoteForm() {
  const params = useSearchParams();
  const preselect = services.find((s) => s.slug === params.get("service"))?.name;
  const [state, action, pending] = useActionState(submitQuote, initial);
  const [kind, setKind] = useState<string>(params.get("type") === "contact" ? "contact" : "subscription");

  if (state.ok) {
    return (
      <div role="status" className="rounded-2xl bg-turf p-8 text-ground md:p-12">
        <CheckIcon className="size-12 text-gold" />
        <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)]">Request received.</h2>
        <p className="mt-4 max-w-[34rem] text-xl text-ground/90">{state.message}</p>
      </div>
    );
  }

  const err = state.errors ?? {};

  return (
    <form action={action} className="space-y-8" noValidate>
      <fieldset>
        <legend className="label text-lg">What can we help with?</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-3">
          {kinds.map((k) => (
            <label
              key={k.value}
              className={`cursor-pointer rounded-xl p-4 transition-colors ${
                kind === k.value ? "bg-turf text-ground" : "bg-mist hover:bg-mist-2"
              }`}
            >
              <input
                type="radio"
                name="kind"
                value={k.value}
                checked={kind === k.value}
                onChange={() => setKind(k.value)}
                className="sr-only"
              />
              <span className="block font-semibold">{k.label}</span>
              <span className={`mt-1 block text-sm ${kind === k.value ? "text-ground/80" : "text-muted"}`}>{k.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" autoComplete="name" required error={err.name} />
        <Field label="Phone" name="phone" type="tel" autoComplete="tel" error={err.phone} />
        <Field label="Email" name="email" type="email" autoComplete="email" error={err.email} />
        {kind !== "contact" && (
          <Field label="Property address" name="address" autoComplete="street-address" required error={err.address} />
        )}
      </div>

      {kind !== "contact" && (
        <fieldset>
          <legend className="label text-lg">Services you&rsquo;re interested in</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {services.map((s) => (
              <label key={s.slug} className="flex cursor-pointer items-center gap-3 rounded-xl bg-mist px-4 py-3 hover:bg-mist-2 has-[:checked]:bg-stripe has-[:checked]:text-ground">
                <input type="checkbox" name="services" value={s.name} defaultChecked={s.name === preselect} className="size-5 accent-gold" />
                <span>{s.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {kind === "subscription" && (
        <div className="max-w-sm">
          <label htmlFor="frequency" className="label">How often?</label>
          <select id="frequency" name="frequency" className="field" defaultValue="Weekly">
            <option>Weekly</option>
            <option>Every other week</option>
            <option>Treatments only (every 6–8 weeks)</option>
            <option>Not sure yet</option>
          </select>
        </div>
      )}

      <div>
        <label htmlFor="message" className="label">
          {kind === "contact" ? "Your question" : "Anything we should know?"}
        </label>
        <textarea id="message" name="message" rows={4} className="field" placeholder={kind === "contact" ? "" : "Gate code, dogs in the yard, problem spots…"} />
      </div>

      {/* Honeypot */}
      <div aria-hidden="true" className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label>Company<input type="text" name="company" tabIndex={-1} autoComplete="off" /></label>
      </div>

      {state.message && !state.ok && (
        <p role="alert" className="rounded-xl bg-danger/10 px-4 py-3 font-medium text-danger">{state.message}</p>
      )}

      <button type="submit" disabled={pending} className="btn btn-gold w-full text-lg disabled:opacity-70 sm:w-auto">
        {pending ? "Sending…" : kind === "contact" ? "Send message" : "Request my free quote"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  autoComplete,
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  error?: string;
}) {
  const id = `f-${name}`;
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-err` : undefined}
        className={`field ${error ? "!border-danger" : ""}`}
      />
      {error && (
        <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-danger">{error}</p>
      )}
    </div>
  );
}
