import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { billingLabel, day, frequencyLabel, money, nextBillingDates, todayISO } from "@/lib/format";
import { loadPortal } from "@/lib/portal-data";
import { site } from "@/lib/site";
import { NotLinked } from "./NotLinked";

export default function PortalHome() {
  return (
    <Suspense fallback={<><PageHead title="Your lawn" /><Skeleton rows={4} /></>}>
      <Overview />
    </Suspense>
  );
}

async function Overview() {
  const { viewer, customers, plans, visits, invoices, contracts } = await loadPortal();
  const first = (viewer.fullName || "").split(" ")[0];

  if (!customers.length) return <NotLinked name={first} email={viewer.email} />;

  const today = todayISO();
  const upcoming = visits.filter((v) => v.scheduled_for >= today && v.status === "scheduled");
  const nextVisit = upcoming.find((v) => v.kind !== "treatment");
  const nextTreatment = upcoming.find((v) => v.kind === "treatment");
  const open = invoices.filter((i) => i.status === "sent" || i.status === "overdue");
  const balance = open.reduce((s, i) => s + i.amount_cents, 0);
  const toSign = contracts.filter((c) => c.status === "sent");
  const active = plans.filter((p) => p.status === "active");
  const nextBill = active
    .flatMap((p) => nextBillingDates(p, today, 1).map((d) => ({ d, p })))
    .sort((a, b) => a.d.localeCompare(b.d))[0];

  return (
    <>
      <PageHead title={first ? `Hi, ${first}` : "Your lawn"} sub={customers.map((c) => c.address_line).filter(Boolean).join(" · ")} />
      <div className="grid gap-4 px-4 pb-12 sm:px-8 lg:grid-cols-3">
        <Panel title="Next visit">
          {nextVisit ? (
            <>
              <p className="font-display text-3xl font-bold">{day(nextVisit.scheduled_for, { weekday: "long", month: "short", day: "numeric" })}</p>
              <p className="mt-1 text-lg">{nextVisit.title}</p>
              {nextVisit.time_window && <p className="text-muted">Arrival window {nextVisit.time_window}</p>}
            </>
          ) : (
            <Empty>No visit on the calendar yet.</Empty>
          )}
          <Link href="/portal/schedule" className="mt-4 inline-block font-semibold text-stripe underline underline-offset-4">Full schedule</Link>
        </Panel>

        <Panel title="Next treatment">
          {nextTreatment ? (
            <>
              <p className="font-display text-3xl font-bold">{day(nextTreatment.scheduled_for, { weekday: "long", month: "short", day: "numeric" })}</p>
              <p className="mt-1 text-lg">{nextTreatment.title}</p>
              <p className="text-muted">Treatments run every 6–8 weeks.</p>
            </>
          ) : (
            <Empty>No treatment scheduled. Ask about the 6–8 week program.</Empty>
          )}
        </Panel>

        <Panel title="Balance due">
          <p className="font-display text-3xl font-bold">{money(balance)}</p>
          <p className="mt-1 text-muted">
            {open.length ? `${open.length} open invoice${open.length > 1 ? "s" : ""}` : "You're all paid up."}
          </p>
          {nextBill && (
            <p className="mt-2 text-muted">
              Next bill {day(nextBill.d)} · {money(nextBill.p.price_cents)}
            </p>
          )}
          {open[0]?.square_public_url && (
            <a href={open[0].square_public_url} target="_blank" rel="noopener noreferrer" className="btn btn-gold mt-4">
              Pay {money(open[0].amount_cents)}
            </a>
          )}
        </Panel>

        {toSign.length > 0 && (
          <Panel title="Agreement to sign" className="lg:col-span-3 !bg-gold">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="text-lg">{toSign[0].title} is ready for your signature.</p>
              <Link href="/portal/agreements" className="btn btn-ink">Review &amp; sign</Link>
            </div>
          </Panel>
        )}

        <Panel title="Your service plan" className="lg:col-span-2">
          {active.length ? (
            <ul className="divide-y divide-mist">
              {active.map((p) => (
                <li key={p.id} className="flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-lg font-semibold">{p.name}</p>
                    <p className="text-muted">{frequencyLabel[p.frequency] ?? p.frequency} · {billingLabel[p.billing_interval]}</p>
                    {p.services.length > 0 && <p className="mt-1 text-sm text-muted">{p.services.join(", ")}</p>}
                  </div>
                  <p className="font-semibold">{money(p.price_cents)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No active plan. <Link className="underline" href="/quote">Request a quote</Link> to start one.</Empty>
          )}
        </Panel>

        <Panel title="Coming up">
          {upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.slice(0, 5).map((v) => (
                <li key={v.id} className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block font-semibold">{day(v.scheduled_for)}</span>
                    <span className="text-sm text-muted">{v.title}</span>
                  </span>
                  <Badge status={v.kind} />
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nothing scheduled.</Empty>
          )}
        </Panel>
      </div>
      <p className="px-4 pb-10 text-sm text-muted sm:px-8">
        Need to reschedule or have a question? Call or text <a className="underline" href={site.phoneHref}>{site.phone}</a>.
      </p>
    </>
  );
}
