import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { day, todayISO } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setVisitStatus } from "../actions";
import { VisitForm } from "../forms";

type Row = {
  id: string; title: string; kind: string; scheduled_for: string; time_window: string | null; status: string; customer_id: string;
  customers: { full_name: string; address_line: string | null } | null;
};

const kindTone: Record<string, string> = {
  mowing: "bg-stripe-light/25",
  treatment: "bg-gold/45",
  cleanup: "bg-mist-2",
};

export default function CalendarPage({ searchParams }: PageProps<"/admin/calendar">) {
  return (
    <>
      <PageHead title="Calendar" sub="Every scheduled visit, treatment and project." />
      <Suspense fallback={<Skeleton rows={5} />}>
        <Calendar searchParams={searchParams} />
      </Suspense>
    </>
  );
}

function shiftMonth(ym: string, by: number) {
  const [y, m] = ym.split("-").map(Number);
  const d = new Date(Date.UTC(y, m - 1 + by, 1));
  return d.toISOString().slice(0, 7);
}

async function Calendar({ searchParams }: { searchParams: PageProps<"/admin/calendar">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const today = todayISO();
  const ym = typeof sp.m === "string" && /^\d{4}-\d{2}$/.test(sp.m) ? sp.m : today.slice(0, 7);
  const [y, m] = ym.split("-").map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const lead = first.getUTCDay(); // 0 = Sunday
  const start = `${ym}-01`;
  const end = `${ym}-${String(daysIn).padStart(2, "0")}`;

  const supabase = await createClient();
  const [{ data }, { data: customers }] = await Promise.all([
    supabase.from("visits").select("id, title, kind, scheduled_for, time_window, status, customer_id, customers(full_name, address_line)").gte("scheduled_for", start).lte("scheduled_for", end).order("scheduled_for"),
    supabase.from("customers").select("id, full_name").in("status", ["active", "lead", "paused"]).order("full_name"),
  ]);
  const rows = (data ?? []) as unknown as Row[];
  const byDay = new Map<string, Row[]>();
  rows.forEach((r) => byDay.set(r.scheduled_for, [...(byDay.get(r.scheduled_for) ?? []), r]));

  const cells = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysIn }, (_, i) => `${ym}-${String(i + 1).padStart(2, "0")}`)];

  return (
    <div className="space-y-4 px-4 pb-12 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold">{day(start, { month: "long", year: "numeric" })}</h2>
        <div className="flex gap-2">
          <Link href={`/admin/calendar?m=${shiftMonth(ym, -1)}`} className="btn bg-white !min-h-10 hover:bg-mist">Previous</Link>
          <Link href="/admin/calendar" className="btn bg-white !min-h-10 hover:bg-mist">Today</Link>
          <Link href={`/admin/calendar?m=${shiftMonth(ym, 1)}`} className="btn bg-white !min-h-10 hover:bg-mist">Next</Link>
        </div>
      </div>

      {/* Month grid (tablet and up) */}
      <div className="hidden overflow-hidden rounded-2xl bg-white md:block">
        <div className="grid grid-cols-7 bg-turf text-center text-sm font-semibold text-ground">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="py-2">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-px bg-mist">
          {cells.map((d, i) => (
            <div key={d ?? `x${i}`} className={`min-h-28 bg-white p-1.5 ${d === today ? "ring-2 ring-inset ring-gold" : ""}`}>
              {d && (
                <>
                  <p className={`px-1 text-sm font-semibold ${d === today ? "text-gold-deep" : "text-muted"}`}>{Number(d.slice(8))}</p>
                  <ul className="mt-1 space-y-1">
                    {(byDay.get(d) ?? []).map((r) => (
                      <li key={r.id}>
                        <Link
                          href={`/admin/customers/${r.customer_id}`}
                          className={`block truncate rounded-md px-1.5 py-1 text-xs font-medium hover:brightness-95 ${kindTone[r.kind] ?? "bg-mist"} ${r.status !== "scheduled" ? "line-through opacity-60" : ""}`}
                          title={`${r.customers?.full_name}: ${r.title}`}
                        >
                          {r.customers?.full_name} · {r.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <Panel title="Visits this month">
          {rows.length ? (
            <ul className="divide-y divide-mist">
              {rows.map((r) => (
                <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <span className="min-w-0">
                    <Link href={`/admin/customers/${r.customer_id}`} className="block font-semibold hover:underline">
                      {day(r.scheduled_for)} · {r.customers?.full_name}
                    </Link>
                    <span className="block text-sm text-muted">{[r.title, r.customers?.address_line, r.time_window].filter(Boolean).join(" · ")}</span>
                  </span>
                  {r.status === "scheduled" ? (
                    <span className="flex gap-2">
                      <form action={setVisitStatus}>
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="completed" />
                        <button className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Done</button>
                      </form>
                      <form action={setVisitStatus} className="flex gap-1">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="status" value="rescheduled" />
                        <label className="sr-only" htmlFor={`to-${r.id}`}>Move to date</label>
                        <input id={`to-${r.id}`} type="date" name="to" required className="rounded-full bg-mist px-2 py-1 text-sm" />
                        <button className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold hover:bg-mist-2">Move</button>
                      </form>
                    </span>
                  ) : (
                    <Badge status={r.status} />
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No visits this month.</Empty>
          )}
        </Panel>
        <Panel title="Schedule visits" className="self-start">
          {customers?.length ? <VisitForm customers={customers} today={today} /> : <Empty>Add a customer first.</Empty>}
        </Panel>
      </div>
    </div>
  );
}
