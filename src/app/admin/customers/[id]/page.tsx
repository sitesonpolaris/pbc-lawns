import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { billingLabel, day, frequencyLabel, money, stamp, todayISO } from "@/lib/format";
import { squareConfigured } from "@/lib/square";
import { createClient } from "@/lib/supabase/server";
import type { Contract, Customer, Invoice, Plan, Visit } from "@/lib/types";
import { deleteVisit, inviteCustomer, sendInvoice, setContractStatus, setInvoiceStatus, setPlanStatus, setVisitStatus } from "../../actions";
import { ContractForm, CustomerForm, InvoiceForm, PlanForm, VisitForm } from "../../forms";

export default function CustomerPage({ params }: PageProps<"/admin/customers/[id]">) {
  return (
    <Suspense fallback={<><PageHead title="Customer" /><Skeleton rows={5} /></>}>
      <Detail params={params} />
    </Suspense>
  );
}

async function Detail({ params }: { params: PageProps<"/admin/customers/[id]">["params"] }) {
  await requireAdmin();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const supabase = await createClient();
  const [c, p, v, i, k] = await Promise.all([
    supabase.from("customers").select("*").eq("id", id).maybeSingle(),
    supabase.from("plans").select("*").eq("customer_id", id).order("created_at"),
    supabase.from("visits").select("*").eq("customer_id", id).order("scheduled_for"),
    supabase.from("invoices").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
    supabase.from("contracts").select("*").eq("customer_id", id).order("created_at", { ascending: false }),
  ]);
  const customer = c.data as Customer | null;
  if (!customer) notFound();
  const plans = (p.data ?? []) as Plan[];
  const visits = (v.data ?? []) as Visit[];
  const invoices = (i.data ?? []) as Invoice[];
  const contracts = (k.data ?? []) as Contract[];
  const today = todayISO();
  const upcoming = visits.filter((x) => x.scheduled_for >= today);
  const past = visits.filter((x) => x.scheduled_for < today).reverse().slice(0, 10);
  const squareReady = squareConfigured();
  const activePlan = plans.find((x) => x.status === "active");

  return (
    <>
      <PageHead
        title={customer.full_name}
        sub={
          <>
            {[customer.address_line, customer.city].filter(Boolean).join(", ")} <Badge status={customer.status} />{" "}
            {customer.profile_id ? <span className="text-sm font-semibold text-stripe">Portal connected</span> : <span className="text-sm">No portal login yet</span>}
          </>
        }
        action={
          <div className="flex flex-wrap gap-2">
            {customer.phone && <a href={`tel:${customer.phone}`} className="btn bg-white hover:bg-mist">Call</a>}
            {customer.phone && <a href={`sms:${customer.phone}`} className="btn bg-white hover:bg-mist">Text</a>}
            {customer.email && <a href={`mailto:${customer.email}`} className="btn bg-white hover:bg-mist">Email</a>}
          </div>
        }
      />
      <div className="grid gap-4 px-4 pb-12 sm:px-8 2xl:grid-cols-2">
        {/* Schedule */}
        <Panel title="Schedule">
          {upcoming.length ? (
            <ul className="mb-6 divide-y divide-mist">
              {upcoming.slice(0, 12).map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="block font-semibold">{day(x.scheduled_for)} · {x.title}</span>
                    <span className="text-sm text-muted">{[x.kind, x.time_window, x.notes].filter(Boolean).join(" · ")}</span>
                  </span>
                  <span className="flex gap-2">
                    <VisitButton id={x.id} customerId={customer.id} status="completed" label="Done" />
                    <VisitButton id={x.id} customerId={customer.id} status="skipped" label="Skip" />
                    <form action={deleteVisit}>
                      <input type="hidden" name="id" value={x.id} />
                      <input type="hidden" name="customer_id" value={customer.id} />
                      <button className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-danger hover:bg-mist-2" aria-label={`Delete ${x.title} on ${day(x.scheduled_for)}`}>Delete</button>
                    </form>
                  </span>
                </li>
              ))}
              {upcoming.length > 12 && <li className="py-2 text-sm text-muted">+{upcoming.length - 12} more on the calendar</li>}
            </ul>
          ) : (
            <div className="mb-6"><Empty>Nothing scheduled.</Empty></div>
          )}
          <h3 className="mb-3 font-sans text-base font-semibold tracking-normal">Add visits</h3>
          <VisitForm customerId={customer.id} plans={plans} today={today} />
          {past.length > 0 && (
            <>
              <h3 className="mb-2 mt-6 font-sans text-base font-semibold tracking-normal">Recent</h3>
              <ul className="space-y-1 text-[0.95rem]">
                {past.map((x) => (
                  <li key={x.id} className="flex justify-between gap-3">
                    <span>{day(x.scheduled_for)} · {x.title}</span>
                    <Badge status={x.status} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </Panel>

        {/* Billing */}
        <Panel title="Invoices">
          {invoices.length ? (
            <ul className="mb-6 divide-y divide-mist">
              {invoices.map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="block font-semibold">#{x.number} · {money(x.amount_cents)} <Badge status={x.status} /></span>
                    <span className="text-sm text-muted">{x.description} · due {day(x.due_date)}</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {x.status === "draft" && (
                      <ActionForm action={sendInvoice} submit="Send via Square" submitClass="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold">
                        <input type="hidden" name="id" value={x.id} />
                      </ActionForm>
                    )}
                    {x.square_public_url && <a href={x.square_public_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Square page</a>}
                    {(x.status === "sent" || x.status === "overdue") && <InvoiceButton id={x.id} status="paid" label="Mark paid" />}
                    {x.status !== "paid" && x.status !== "void" && <InvoiceButton id={x.id} status="void" label="Void" />}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mb-6"><Empty>No invoices yet.</Empty></div>
          )}
          <h3 className="mb-3 font-sans text-base font-semibold tracking-normal">New invoice</h3>
          <InvoiceForm customerId={customer.id} plans={plans} today={today} squareReady={squareReady} />
        </Panel>

        <Panel title="Service plans">
          {plans.length ? (
            <ul className="mb-6 divide-y divide-mist">
              {plans.map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="block font-semibold">{x.name} · {money(x.price_cents)} <Badge status={x.status} /></span>
                    <span className="text-sm text-muted">
                      {frequencyLabel[x.frequency]} · {billingLabel[x.billing_interval]}{x.billing_day ? ` (day ${x.billing_day})` : ""} · from {day(x.starts_on)}
                    </span>
                  </span>
                  <form action={setPlanStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={x.id} />
                    <input type="hidden" name="customer_id" value={customer.id} />
                    {x.status !== "active" && <button name="status" value="active" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Activate</button>}
                    {x.status === "active" && <button name="status" value="paused" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Pause</button>}
                    {x.status !== "cancelled" && <button name="status" value="cancelled" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-danger hover:bg-mist-2">Cancel</button>}
                  </form>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mb-6"><Empty>No plan yet. Add one to show a billing schedule in the portal.</Empty></div>
          )}
          <h3 className="mb-3 font-sans text-base font-semibold tracking-normal">Add a plan</h3>
          <PlanForm customerId={customer.id} today={today} />
        </Panel>

        <Panel title="Agreements">
          {contracts.length > 0 && (
            <ul className="mb-6 divide-y divide-mist">
              {contracts.map((x) => (
                <li key={x.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span>
                    <span className="block font-semibold">{x.title} <Badge status={x.status} /></span>
                    <span className="text-sm text-muted">
                      {x.status === "signed" ? `Signed by ${x.signed_name} · ${stamp(x.signed_at)}` : x.sent_at ? `Sent ${stamp(x.sent_at)}` : `Created ${stamp(x.created_at)}`}
                    </span>
                  </span>
                  {x.status !== "signed" && x.status !== "void" && (
                    <form action={setContractStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={x.id} />
                      <input type="hidden" name="customer_id" value={customer.id} />
                      {x.status === "draft" && <button name="status" value="sent" className="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold">Send</button>}
                      <button name="status" value="void" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-danger hover:bg-mist-2">Void</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          )}
          <h3 className="mb-3 font-sans text-base font-semibold tracking-normal">New agreement</h3>
          <ContractForm customer={customer} planName={activePlan ? `${activePlan.name}, ${money(activePlan.price_cents)} (${billingLabel[activePlan.billing_interval]})` : undefined} />
        </Panel>

        <Panel title="Details">
          <CustomerForm customer={customer} />
        </Panel>

        <Panel title="Portal access">
          <p className="mb-4 text-muted">
            {customer.profile_id
              ? "This customer can log in and see their schedule, billing and agreements."
              : customer.email
                ? `When ${customer.email} creates an account (or accepts an invite), it connects to this record automatically.`
                : "Add an email above so this customer can log in."}
          </p>
          {!customer.profile_id && customer.email && (
            <ActionForm action={inviteCustomer} submit="Invite to portal" submitClass="btn btn-gold">
              <input type="hidden" name="email" value={customer.email} />
            </ActionForm>
          )}
          <Link href="/admin/customers" className="mt-6 inline-block font-semibold text-stripe underline">Back to customers</Link>
        </Panel>
      </div>
    </>
  );
}

function VisitButton({ id, customerId, status, label }: { id: string; customerId: string; status: string; label: string }) {
  return (
    <form action={setVisitStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="customer_id" value={customerId} />
      <input type="hidden" name="status" value={status} />
      <button className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">{label}</button>
    </form>
  );
}

function InvoiceButton({ id, status, label }: { id: string; status: string; label: string }) {
  return (
    <form action={setInvoiceStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2 ${status === "void" ? "text-danger" : ""}`}>{label}</button>
    </form>
  );
}
