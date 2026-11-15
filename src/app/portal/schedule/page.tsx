import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { day, todayISO } from "@/lib/format";
import { loadPortal } from "@/lib/portal-data";
import type { Visit } from "@/lib/types";
import { NotLinked } from "../NotLinked";

export default function SchedulePage() {
  return (
    <Suspense fallback={<><PageHead title="Schedule" /><Skeleton /></>}>
      <Schedule />
    </Suspense>
  );
}

function groupByMonth(visits: Visit[]) {
  const m = new Map<string, Visit[]>();
  for (const v of visits) {
    const k = v.scheduled_for.slice(0, 7);
    m.set(k, [...(m.get(k) ?? []), v]);
  }
  return [...m.entries()];
}

async function Schedule() {
  const { viewer, customers, visits } = await loadPortal();
  if (!customers.length) return <NotLinked email={viewer.email} />;
  const today = todayISO();
  const upcoming = visits.filter((v) => v.scheduled_for >= today);
  const past = visits.filter((v) => v.scheduled_for < today).reverse().slice(0, 20);

  return (
    <>
      <PageHead title="Schedule" sub="Mowing visits, treatments and projects on your calendar." />
      <div className="grid gap-4 px-4 pb-12 sm:px-8 xl:grid-cols-[1.4fr_1fr]">
        <Panel title="Upcoming">
          {upcoming.length ? (
            <div className="space-y-6">
              {groupByMonth(upcoming).map(([month, list]) => (
                <div key={month}>
                  <h3 className="font-sans text-sm font-semibold tracking-normal text-muted">{day(`${month}-01`, { month: "long", year: "numeric" })}</h3>
                  <ul className="mt-2 space-y-2">
                    {list.map((v) => (
                      <li key={v.id} className="flex items-center gap-4 rounded-xl bg-mist px-4 py-3">
                        <span className="w-14 shrink-0 text-center leading-tight">
                          <span className="block text-xs font-semibold uppercase text-muted">{day(v.scheduled_for, { weekday: "short" })}</span>
                          <span className="block font-display text-2xl font-bold">{Number(v.scheduled_for.slice(8, 10))}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-semibold">{v.title}</span>
                          <span className="block text-sm text-muted">{[v.time_window, v.notes].filter(Boolean).join(" · ") || " "}</span>
                        </span>
                        <Badge status={v.status === "scheduled" ? v.kind : v.status} />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <Empty>Nothing on the calendar yet. Cooper will add your visits here.</Empty>
          )}
        </Panel>
        <Panel title="Recent visits">
          {past.length ? (
            <ul className="space-y-3">
              {past.map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">{day(v.scheduled_for)}</span>
                    <span className="text-sm text-muted">{v.title}</span>
                  </span>
                  <Badge status={v.status} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No past visits yet.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
