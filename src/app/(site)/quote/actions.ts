"use server";

import { createPublicClient } from "@/lib/supabase/server";
import { services } from "@/lib/site";

export type QuoteState = { ok: boolean; message: string; errors?: Record<string, string> };

const KINDS = ["quote", "subscription", "contact"] as const;

export async function submitQuote(_prev: QuoteState, form: FormData): Promise<QuoteState> {
  // Honeypot: real people never fill this hidden field.
  if (String(form.get("company") ?? "").trim()) {
    return { ok: true, message: "Thanks! We'll be in touch soon." };
  }

  const kindRaw = String(form.get("kind") ?? "quote");
  const kind = (KINDS as readonly string[]).includes(kindRaw) ? (kindRaw as (typeof KINDS)[number]) : "quote";
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40);
  const address = String(form.get("address") ?? "").trim().slice(0, 300);
  const frequency = String(form.get("frequency") ?? "").trim().slice(0, 60);
  const message = String(form.get("message") ?? "").trim().slice(0, 4000);
  const valid = new Set(services.map((s) => s.name));
  const picked = form.getAll("services").map(String).filter((s) => valid.has(s));

  const errors: Record<string, string> = {};
  if (!name) errors.name = "Please add your name.";
  if (!email && !phone) errors.phone = "Add a phone number or email so we can reach you.";
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "That email doesn't look right.";
  if (kind !== "contact" && !address) errors.address = "Add the property address so we can quote it.";
  if (Object.keys(errors).length) {
    return { ok: false, message: "Please fix the highlighted fields.", errors };
  }

  const supabase = createPublicClient();
  const { error } = await supabase.from("submissions").insert({
    kind,
    name,
    email: email || null,
    phone: phone || null,
    address: address || null,
    services: picked,
    frequency: frequency || null,
    message: message || null,
  });

  if (error) {
    console.error("submission insert failed", error);
    return {
      ok: false,
      message: "Something went wrong sending your request. Please call or text (704) 219-0676.",
    };
  }

  return {
    ok: true,
    message:
      kind === "contact"
        ? "Thanks! Your message is in. Cooper will get back to you shortly."
        : "Thanks! Your quote request is in. Cooper will reach out within one business day.",
  };
}
