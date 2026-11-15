import Link from "next/link";
import { Suspense } from "react";
import { ActionForm } from "@/components/ActionForm";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { day, money, todayISO } from "@/lib/format";
import { squareConfigured } from "@/lib/square";
import { createClient } from "@/lib/supabase/server";
import { sendInvoice, setInvoiceStatus } from "../actions";
import { InvoiceForm } from "../forms";

const tabs = ["open", "draft", "paid", "void", "all"] as const;

type Row = {
  id: string; number: number; description: string; amount_cents: number; due_date: string; status: string;
  square_public_url: string | null; customer_id: string; customers: { full_name: string } | null;
};

export default function InvoicesPage({ searchParams }: PageProps<"/admin/invoices">) {
  return (
    <>
      <PageHead title="Invoices" sub="Invoices are sent and paid through Square. Status updates come back automatically." />
      <Suspense fallback={<Skeleton />}>
        <Invoices searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Invoices({ searchParams }: { searchParams: PageProps<"/admin/invoices">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = tabs.includes(sp.status as (typeof tabs)[number]) ? (sp.status as string) : "open";
  const supabase = await createClient();
  let q = supabase.from("invoices").select("id, number, description, amount_cents, due_date, status, square_public_url, customer_id, customers(full_name)").order("due_date", { ascending: false }).limit(200);
  if (tab === "open") q = q.in("status", ["sent", "overdue"]);
  else if (tab !== "all") q = q.eq("status", tab);
  const [{ data }, { data: customers }] = await Promise.all([q, supabase.from("customers").select("id, full_name").order("full_name")]);
  const rows = (data ?? []) as unknown as Row[];
  const total = rows.reduce((a, r) => a + r.amount_cents, 0);
  const today = todayISO();
  const ready = squareConfigured();

  return (
    <div className="grid gap-4 px-4 pb-12 sm:px-8 xl:grid-cols-[1.4fr_1fr]">
      <div>
        {!ready && (
          <p className="mb-4 rounded-2xl bg-gold/30 p-4">
            Square isn&rsquo;t connected yet. Invoices save as drafts until <strong>SQUARE_ACCESS_TOKEN</strong> and <strong>SQUARE_LOCATION_ID</strong> are added in Netlify.
          </p>
        )}
        <nav aria-label="Filter" className="mb-4 flex flex-wrap items-center gap-2">
          {tabs.map((t) => (
            <Link key={t} href={`/admin/invoices?status=${t}`} aria-current={t === tab ? "page" : undefined} className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${t === tab ? "bg-ink text-ground" : "bg-white hover:bg-mist"}`}>
              {t}
            </Link>
          ))}
          <span className="ml-auto font-semibold">{money(total)}</span>
        </nav>
        {rows.length ? (
          <ul className="overflow-hidden rounded-2xl bg-white">
            {rows.map((r) => {
              const overdue = r.status === "sent" && r.due_date < today;
              return (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-mist px-5 py-3.5 last:border-0">
                  <span className="min-w-0">
                    <span className="block font-semibold">
                      #{r.number} · <Link className="hover:underline" href={`/admin/customers/${r.customer_id}`}>{r.customers?.full_name}</Link> · {money(r.amount_cents)}{" "}
                      <Badge status={overdue ? "overdue" : r.status} />
                    </span>
                    <span className="block text-sm text-muted">{r.description} · due {day(r.due_date)}</span>
                  </span>
                  <span className="flex flex-wrap gap-2">
                    {r.status === "draft" && (
                      <ActionForm action={sendInvoice} submit="Send via Square" submitClass="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold">
                        <input type="hidden" name="id" value={r.id} />
                      </ActionForm>
                    )}
                    {r.square_public_url && <a href={r.square_public_url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Square page</a>}
                    {(r.status === "sent" || r.status === "overdue") && (
                      <form action={setInvoiceStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="paid" />
                        <button className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Mark paid</button>
                      </form>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <Empty>No {tab === "all" ? "" : tab} invoices.</Empty>
        )}
      </div>
      <Panel title="New invoice" className="self-start">
        {customers?.length ? <InvoiceForm customers={customers} today={today} squareReady={ready} /> : <Empty>Add a customer first.</Empty>}
      </Panel>
    </div>
  );
}
