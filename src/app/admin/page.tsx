import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { addDaysISO, day, money, stamp, todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setVisitStatus } from "./actions";

export default function AdminHome() {
  return (
    <>
      <PageHead title="Dashboard" action={<Link href="/admin/customers?new=1" className="btn btn-gold">New customer</Link>} />
      <Suspense fallback={<Skeleton rows={4} />}>
        <Dashboard />
      </Suspense>
    </>
  );
}

async function Dashboard() {
  await requireAdmin();
  const supabase = await createClient();
  const today = todayISO();
  const weekEnd = addDaysISO(today, 7);
  const [subs, visits, invoices, customers] = await Promise.all([
    supabase.from("submissions").select("id, name, kind, services, created_at, status").eq("status", "new").order("created_at", { ascending: false }).limit(6),
    supabase.from("visits").select("id, title, kind, scheduled_for, time_window, status, customer_id, customers(full_name, address_line)").gte("scheduled_for", today).lte("scheduled_for", weekEnd).order("scheduled_for"),
    supabase.from("invoices").select("id, number, amount_cents, due_date, status, customers(full_name)").in("status", ["sent", "overdue"]).order("due_date"),
    supabase.from("customers").select("id", { count: "exact", head: true }).eq("status", "active"),
  ]);

  const owed = (invoices.data ?? []).reduce((a, i) => a + i.amount_cents, 0);
  const todays = (visits.data ?? []).filter((v) => v.scheduled_for === today);
  const stats: [string, string, string][] = [
    ["New requests", String(subs.data?.length ?? 0), "/admin/inbox"],
    ["Visits this week", String(visits.data?.length ?? 0), "/admin/calendar"],
    ["Unpaid invoices", money(owed), "/admin/invoices"],
    ["Active customers", String(customers.count ?? 0), "/admin/customers"],
  ];

  return (
    <div className="space-y-4 px-4 pb-12 sm:px-8">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-2xl bg-white p-5 transition-colors hover:bg-mist">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Panel title={`Today · ${day(today, { weekday: "long", month: "short", day: "numeric" })}`}>
          {todays.length ? (
            <ul className="space-y-2">
              {todays.map((v) => {
                const c = v.customers as unknown as { full_name: string; address_line: string | null } | null;
                return (
                  <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-mist px-4 py-3">
                    <span>
                      <Link href={`/admin/customers/${v.customer_id}`} className="font-semibold hover:underline">{c?.full_name}</Link>
                      <span className="block text-sm text-muted">{[v.title, c?.address_line, v.time_window].filter(Boolean).join(" · ")}</span>
                    </span>
                    {v.status === "completed" ? (
                      <Badge status="completed" />
                    ) : (
                      <form action={setVisitStatus}>
                        <input type="hidden" name="id" value={v.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button className="btn btn-ink !min-h-9 !px-4 text-sm">Mark done</button>
                      </form>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Nothing scheduled today.</Empty>
          )}
        </Panel>

        <Panel title="New requests" action={<Link href="/admin/inbox" className="text-sm font-semibold text-stripe underline">Open inbox</Link>}>
          {subs.data?.length ? (
            <ul className="divide-y divide-mist">
              {subs.data.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-3 py-2.5">
                  <span className="min-w-0">
                    <span className="block font-semibold">{s.name}</span>
                    <span className="block truncate text-sm text-muted">{s.services?.join(", ") || s.kind}</span>
                  </span>
                  <span className="shrink-0 text-sm text-muted">{stamp(s.created_at)}</span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No new requests. Nice and clear.</Empty>
          )}
        </Panel>

        <Panel title="This week">
          {visits.data?.length ? (
            <ul className="divide-y divide-mist">
              {visits.data.map((v) => {
                const c = v.customers as unknown as { full_name: string } | null;
                return (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      <span className="block font-semibold">{day(v.scheduled_for)} · {c?.full_name}</span>
                      <span className="text-sm text-muted">{v.title}</span>
                    </span>
                    <Badge status={v.status === "scheduled" ? v.kind : v.status} />
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>No visits in the next 7 days.</Empty>
          )}
        </Panel>

        <Panel title="Waiting on payment">
          {invoices.data?.length ? (
            <ul className="divide-y divide-mist">
              {invoices.data.map((i) => {
                const c = i.customers as unknown as { full_name: string } | null;
                return (
                  <li key={i.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span>
                      <span className="block font-semibold">#{i.number} · {c?.full_name}</span>
                      <span className="text-sm text-muted">Due {day(i.due_date)}</span>
                    </span>
                    <span className="text-right font-semibold">{money(i.amount_cents)} <Badge status={i.due_date < today ? "overdue" : i.status} /></span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <Empty>Everything is paid.</Empty>
          )}
        </Panel>
      </div>
    </div>
  );
}
