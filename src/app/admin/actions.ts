"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { addDaysISO } from "@/lib/format";
import { cancelSquareInvoice, createAndPublishInvoice, ensureSquareCustomer, squareConfigured } from "@/lib/square";
import { createClient, createServiceClient } from "@/lib/supabase/server";
import type { Customer, Invoice } from "@/lib/types";

export type Res = { ok?: boolean; error?: string; message?: string };

const s = (f: FormData, k: string, max = 500) => String(f.get(k) ?? "").trim().slice(0, max);
const cents = (v: string) => Math.round(Number(v.replace(/[$,\s]/g, "")) * 100);
const isDate = (v: string) => /^\d{4}-\d{2}-\d{2}$/.test(v);

async function db() {
  await requireAdmin();
  return createClient();
}

function done(paths: string[], message = "Saved.") {
  paths.forEach((p) => revalidatePath(p));
  return { ok: true, message } satisfies Res;
}

// ---------------------------------------------------------------- inbox
export async function setSubmissionStatus(form: FormData) {
  const supabase = await db();
  const status = s(form, "status");
  if (!["new", "contacted", "won", "archived"].includes(status)) return;
  await supabase.from("submissions").update({ status }).eq("id", s(form, "id"));
  revalidatePath("/admin/inbox");
  revalidatePath("/admin");
}

export async function convertSubmission(form: FormData) {
  const supabase = await db();
  const { data: sub } = await supabase.from("submissions").select("*").eq("id", s(form, "id")).single();
  if (!sub) return;
  let profile_id: string | null = null;
  if (sub.email) {
    const { data: p } = await supabase.from("profiles").select("id").ilike("email", sub.email).maybeSingle();
    profile_id = p?.id ?? null;
  }
  const { data: cust, error } = await supabase
    .from("customers")
    .insert({
      profile_id,
      full_name: sub.name,
      email: sub.email?.toLowerCase() ?? null,
      phone: sub.phone,
      address_line: sub.address,
      status: "active",
      notes: [sub.services?.length ? `Interested in: ${sub.services.join(", ")}` : "", sub.frequency ? `Frequency: ${sub.frequency}` : "", sub.message ?? ""]
        .filter(Boolean)
        .join("\n"),
    })
    .select("id")
    .single();
  if (error || !cust) return;
  await supabase.from("submissions").update({ status: "won", customer_id: cust.id }).eq("id", sub.id);
  revalidatePath("/admin/inbox");
  redirect(`/admin/customers/${cust.id}`);
}

// ---------------------------------------------------------------- customers
function customerFields(f: FormData) {
  return {
    full_name: s(f, "full_name", 120),
    email: s(f, "email", 200).toLowerCase() || null,
    phone: s(f, "phone", 40) || null,
    address_line: s(f, "address_line", 200) || null,
    city: s(f, "city", 80) || null,
    state: s(f, "state", 2).toUpperCase() || "NC",
    zip: s(f, "zip", 10) || null,
    notes: s(f, "notes", 4000) || null,
    status: ["lead", "active", "paused", "former"].includes(s(f, "status")) ? s(f, "status") : "active",
  };
}

export async function createCustomer(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const fields = customerFields(f);
  if (!fields.full_name) return { error: "Name is required." };
  // Link to an existing portal account with the same email, if one exists.
  let profile_id: string | null = null;
  if (fields.email) {
    const { data: p } = await supabase.from("profiles").select("id").ilike("email", fields.email).maybeSingle();
    profile_id = p?.id ?? null;
  }
  const { data, error } = await supabase.from("customers").insert({ ...fields, profile_id }).select("id").single();
  if (error) return { error: error.message };
  revalidatePath("/admin/customers");
  redirect(`/admin/customers/${data.id}`);
}

export async function updateCustomer(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const id = s(f, "id");
  const fields = customerFields(f);
  if (!fields.full_name) return { error: "Name is required." };
  const { error } = await supabase.from("customers").update(fields).eq("id", id);
  if (error) return { error: error.message };
  if (fields.email) {
    const { data: p } = await supabase.from("profiles").select("id").ilike("email", fields.email).maybeSingle();
    if (p) await supabase.from("customers").update({ profile_id: p.id }).eq("id", id).is("profile_id", null);
  }
  return done([`/admin/customers/${id}`, "/admin/customers"]);
}

export async function inviteCustomer(_: Res, f: FormData): Promise<Res> {
  await requireAdmin();
  const email = s(f, "email", 200);
  if (!email) return { error: "Add an email to this customer first." };
  const svc = createServiceClient();
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!svc) {
    return { ok: true, message: `Send them this link to create their login: ${site}/login?mode=signup (use ${email}).` };
  }
  const { error } = await svc.auth.admin.inviteUserByEmail(email, { redirectTo: `${site}/auth/callback?next=/portal/account` });
  if (error) return { error: error.message };
  return { ok: true, message: `Invite sent to ${email}.` };
}

// ---------------------------------------------------------------- plans
export async function addPlan(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const customer_id = s(f, "customer_id");
  const price = cents(s(f, "price") || "0");
  const starts_on = s(f, "starts_on");
  if (!s(f, "name")) return { error: "Name the plan." };
  if (!isDate(starts_on)) return { error: "Pick a start date." };
  if (!Number.isFinite(price) || price < 0) return { error: "Price must be a number." };
  const billing_day = Number(s(f, "billing_day")) || null;
  const { error } = await supabase.from("plans").insert({
    customer_id,
    name: s(f, "name", 120),
    services: f.getAll("services").map(String),
    frequency: s(f, "frequency"),
    price_cents: price,
    billing_interval: s(f, "billing_interval"),
    billing_day: billing_day && billing_day >= 1 && billing_day <= 28 ? billing_day : null,
    starts_on,
    ends_on: isDate(s(f, "ends_on")) ? s(f, "ends_on") : null,
  });
  if (error) return { error: error.message };
  return done([`/admin/customers/${customer_id}`], "Plan added.");
}

export async function setPlanStatus(f: FormData) {
  const supabase = await db();
  await supabase.from("plans").update({ status: s(f, "status") }).eq("id", s(f, "id"));
  revalidatePath(`/admin/customers/${s(f, "customer_id")}`);
}

// ---------------------------------------------------------------- visits / calendar
const STEP: Record<string, number> = { none: 0, weekly: 7, biweekly: 14, "every-6-weeks": 42, "every-7-weeks": 49, "every-8-weeks": 56 };

export async function addVisits(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const customer_id = s(f, "customer_id");
  const start = s(f, "scheduled_for");
  const repeat = s(f, "repeat") || "none";
  const count = Math.min(Math.max(Number(s(f, "count")) || 1, 1), 40);
  if (!customer_id) return { error: "Pick a customer." };
  if (!isDate(start)) return { error: "Pick a date." };
  if (!s(f, "title")) return { error: "Add a title, e.g. “Mow, edge & blow”." };
  const step = STEP[repeat] ?? 0;
  const rows = Array.from({ length: step ? count : 1 }, (_, i) => ({
    customer_id,
    plan_id: s(f, "plan_id") || null,
    kind: s(f, "kind") || "mowing",
    title: s(f, "title", 120),
    scheduled_for: addDaysISO(start, i * step),
    time_window: s(f, "time_window", 40) || null,
    notes: s(f, "notes", 500) || null,
  }));
  const { error } = await supabase.from("visits").insert(rows);
  if (error) return { error: error.message };
  return done([`/admin/customers/${customer_id}`, "/admin/calendar", "/admin"], `${rows.length} visit${rows.length > 1 ? "s" : ""} scheduled.`);
}

export async function setVisitStatus(f: FormData) {
  const supabase = await db();
  const status = s(f, "status");
  const patch: Record<string, unknown> = { status };
  patch.completed_at = status === "completed" ? new Date().toISOString() : null;
  if (status === "rescheduled" && isDate(s(f, "to"))) {
    patch.scheduled_for = s(f, "to");
    patch.status = "scheduled";
  }
  await supabase.from("visits").update(patch).eq("id", s(f, "id"));
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  if (s(f, "customer_id")) revalidatePath(`/admin/customers/${s(f, "customer_id")}`);
}

export async function deleteVisit(f: FormData) {
  const supabase = await db();
  await supabase.from("visits").delete().eq("id", s(f, "id"));
  revalidatePath("/admin/calendar");
  if (s(f, "customer_id")) revalidatePath(`/admin/customers/${s(f, "customer_id")}`);
}

// ---------------------------------------------------------------- invoices
async function pushToSquare(supabase: Awaited<ReturnType<typeof createClient>>, invoice: Invoice) {
  const { data: customer } = await supabase.from("customers").select("*").eq("id", invoice.customer_id).single<Customer>();
  if (!customer) throw new Error("Customer not found.");
  const squareCustomerId = await ensureSquareCustomer(customer);
  if (!customer.square_customer_id) {
    await supabase.from("customers").update({ square_customer_id: squareCustomerId }).eq("id", customer.id);
  }
  const out = await createAndPublishInvoice({
    squareCustomerId,
    hasEmail: Boolean(customer.email),
    number: invoice.number,
    description: invoice.description,
    amountCents: invoice.amount_cents,
    dueDate: invoice.due_date,
  });
  await supabase
    .from("invoices")
    .update({ status: "sent", square_invoice_id: out.id, square_public_url: out.publicUrl })
    .eq("id", invoice.id);
}

export async function createInvoice(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const customer_id = s(f, "customer_id");
  const amount = cents(s(f, "amount"));
  const due = s(f, "due_date");
  if (!customer_id) return { error: "Pick a customer." };
  if (!s(f, "description")) return { error: "Add a description." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Amount must be more than $0." };
  if (!isDate(due)) return { error: "Pick a due date." };
  const { data: inv, error } = await supabase
    .from("invoices")
    .insert({ customer_id, plan_id: s(f, "plan_id") || null, description: s(f, "description", 500), amount_cents: amount, due_date: due })
    .select("*")
    .single<Invoice>();
  if (error || !inv) return { error: error?.message ?? "Could not create invoice." };

  const paths = ["/admin/invoices", `/admin/customers/${customer_id}`, "/admin"];
  if (f.get("send")) {
    if (!squareConfigured()) {
      return done(paths, `Invoice #${inv.number} saved as a draft. Square isn't connected yet, so it wasn't sent.`);
    }
    try {
      await pushToSquare(supabase, inv);
    } catch (e) {
      return { ok: true, message: `Invoice #${inv.number} saved as a draft, but Square returned: ${(e as Error).message}` };
    }
    return done(paths, `Invoice #${inv.number} sent through Square.`);
  }
  return done(paths, `Invoice #${inv.number} saved as a draft.`);
}

export async function sendInvoice(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  if (!squareConfigured()) return { error: "Connect Square first (add SQUARE_ACCESS_TOKEN and SQUARE_LOCATION_ID in Netlify)." };
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", s(f, "id")).single<Invoice>();
  if (!inv) return { error: "Invoice not found." };
  if (inv.status !== "draft") return { error: "Only drafts can be sent." };
  try {
    await pushToSquare(supabase, inv);
  } catch (e) {
    return { error: `Square: ${(e as Error).message}` };
  }
  return done(["/admin/invoices", `/admin/customers/${inv.customer_id}`], `Invoice #${inv.number} sent.`);
}

export async function setInvoiceStatus(f: FormData) {
  const supabase = await db();
  const id = s(f, "id");
  const status = s(f, "status");
  const { data: inv } = await supabase.from("invoices").select("*").eq("id", id).single<Invoice>();
  if (!inv) return;
  if (status === "void" && inv.square_invoice_id && squareConfigured() && inv.status !== "paid") {
    try {
      await cancelSquareInvoice(inv.square_invoice_id);
    } catch (e) {
      console.error("square cancel failed", e);
    }
  }
  await supabase
    .from("invoices")
    .update({ status, paid_at: status === "paid" ? new Date().toISOString() : inv.paid_at })
    .eq("id", id);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/customers/${inv.customer_id}`);
}

// ---------------------------------------------------------------- contracts
export async function createContract(_: Res, f: FormData): Promise<Res> {
  const supabase = await db();
  const customer_id = s(f, "customer_id");
  const title = s(f, "title", 160);
  const body = s(f, "body", 20000);
  if (!customer_id || !title || !body) return { error: "Customer, title and terms are required." };
  const send = Boolean(f.get("send"));
  const { error } = await supabase.from("contracts").insert({
    customer_id,
    title,
    body,
    status: send ? "sent" : "draft",
    sent_at: send ? new Date().toISOString() : null,
  });
  if (error) return { error: error.message };
  return done(["/admin/contracts", `/admin/customers/${customer_id}`], send ? "Agreement sent to the customer's portal." : "Draft saved.");
}

export async function setContractStatus(f: FormData) {
  const supabase = await db();
  const status = s(f, "status");
  if (!["sent", "void", "draft"].includes(status)) return;
  await supabase
    .from("contracts")
    .update({ status, sent_at: status === "sent" ? new Date().toISOString() : undefined })
    .eq("id", s(f, "id"))
    .neq("status", "signed");
  revalidatePath("/admin/contracts");
  if (s(f, "customer_id")) revalidatePath(`/admin/customers/${s(f, "customer_id")}`);
}
