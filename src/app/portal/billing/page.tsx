import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { billingLabel, day, frequencyLabel, money, nextBillingDates, todayISO } from "@/lib/format";
import { loadPortal } from "@/lib/portal-data";
import { NotLinked } from "../NotLinked";

export default function BillingPage() {
  return (
    <Suspense fallback={<><PageHead title="Billing" /><Skeleton /></>}>
      <Billing />
    </Suspense>
  );
}

async function Billing() {
  const { viewer, customers, plans, invoices } = await loadPortal();
  if (!customers.length) return <NotLinked email={viewer.email} />;
  const today = todayISO();
  const active = plans.filter((p) => p.status === "active");
  const schedule = active
    .flatMap((p) => nextBillingDates(p, today, 4).map((d) => ({ d, p })))
    .sort((a, b) => a.d.localeCompare(b.d))
    .slice(0, 6);
  const open = invoices.filter((i) => i.status === "sent" || i.status === "overdue");

  return (
    <>
      <PageHead title="Billing" sub="Payments are processed securely by Square." />
      <div className="grid gap-4 px-4 pb-12 sm:px-8 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <Panel title="Billing schedule">
            {active.length ? (
              <>
                <ul className="space-y-2">
                  {active.map((p) => (
                    <li key={p.id} className="rounded-xl bg-mist px-4 py-3">
                      <p className="font-semibold">{p.name} · {money(p.price_cents)}</p>
                      <p className="text-sm text-muted">
                        {billingLabel[p.billing_interval]}
                        {p.billing_interval === "monthly" && p.billing_day ? ` on day ${p.billing_day}` : ""} · {frequencyLabel[p.frequency] ?? p.frequency}
                      </p>
                    </li>
                  ))}
                </ul>
                {schedule.length > 0 && (
                  <>
                    <h3 className="mt-6 font-sans text-sm font-semibold tracking-normal text-muted">Upcoming bills</h3>
                    <ul className="mt-2 divide-y divide-mist">
                      {schedule.map(({ d, p }) => (
                        <li key={p.id + d} className="flex justify-between py-2.5">
                          <span>{day(d, { month: "long", day: "numeric", year: "numeric" })}</span>
                          <span className="font-semibold">{money(p.price_cents)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            ) : (
              <Empty>No active service plan.</Empty>
            )}
          </Panel>
        </div>

        <Panel title="Invoices">
          {invoices.length ? (
            <ul className="divide-y divide-mist">
              {invoices.map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-3.5 first:pt-0">
                  <div className="min-w-0">
                    <p className="font-semibold">
                      #{i.number} · {money(i.amount_cents)} <Badge status={i.status} />
                    </p>
                    <p className="text-sm text-muted">
                      {i.description} · {i.status === "paid" ? `Paid ${day(i.paid_at)}` : `Due ${day(i.due_date)}`}
                    </p>
                  </div>
                  {open.includes(i) && i.square_public_url && (
                    <a href={i.square_public_url} target="_blank" rel="noopener noreferrer" className="btn btn-gold !min-h-10 !px-4 text-sm">
                      Pay now
                    </a>
                  )}
                  {i.status === "paid" && i.square_public_url && (
                    <a href={i.square_public_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-stripe underline underline-offset-4">
                      Receipt
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>No invoices yet.</Empty>
          )}
        </Panel>
      </div>
    </>
  );
}
