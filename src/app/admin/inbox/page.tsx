import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { stamp } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Submission } from "@/lib/types";
import { convertSubmission, setSubmissionStatus } from "../actions";

const tabs = ["new", "contacted", "won", "archived"] as const;
const kindLabel: Record<string, string> = { quote: "One-time quote", subscription: "Ongoing service", contact: "Question" };

export default function InboxPage({ searchParams }: PageProps<"/admin/inbox">) {
  return (
    <>
      <PageHead title="Inbox" sub="Quote, service sign-up and contact form submissions." />
      <Suspense fallback={<Skeleton />}>
        <Inbox searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Inbox({ searchParams }: { searchParams: PageProps<"/admin/inbox">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const tab = tabs.includes(sp.status as (typeof tabs)[number]) ? (sp.status as string) : "new";
  const supabase = await createClient();
  const { data } = await supabase.from("submissions").select("*").eq("status", tab).order("created_at", { ascending: false }).limit(100);
  const rows = (data ?? []) as Submission[];

  return (
    <div className="px-4 pb-12 sm:px-8">
      <nav aria-label="Filter" className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t}
            href={`/admin/inbox?status=${t}`}
            aria-current={t === tab ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${t === tab ? "bg-ink text-ground" : "bg-white hover:bg-mist"}`}
          >
            {t}
          </Link>
        ))}
      </nav>
      {rows.length ? (
        <ul className="space-y-3">
          {rows.map((s) => (
            <li key={s.id} className="rounded-2xl bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">
                    {s.name} <Badge status={s.status} />
                  </p>
                  <p className="text-sm text-muted">{kindLabel[s.kind] ?? s.kind} · {stamp(s.created_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {s.phone && <a href={`tel:${s.phone}`} className="btn bg-mist !min-h-9 !px-4 text-sm hover:bg-mist-2">Call</a>}
                  {s.phone && <a href={`sms:${s.phone}`} className="btn bg-mist !min-h-9 !px-4 text-sm hover:bg-mist-2">Text</a>}
                  {s.email && <a href={`mailto:${s.email}?subject=${encodeURIComponent("Your PBC Lawn Service quote")}`} className="btn bg-mist !min-h-9 !px-4 text-sm hover:bg-mist-2">Email</a>}
                </div>
              </div>
              <dl className="mt-4 grid gap-x-8 gap-y-2 text-[0.98rem] sm:grid-cols-2">
                {s.phone && <Row k="Phone" v={s.phone} />}
                {s.email && <Row k="Email" v={s.email} />}
                {s.address && <Row k="Address" v={s.address} />}
                {s.frequency && <Row k="Frequency" v={s.frequency} />}
                {s.services.length > 0 && <Row k="Services" v={s.services.join(", ")} />}
              </dl>
              {s.message && <p className="mt-3 whitespace-pre-wrap rounded-xl bg-mist p-3">{s.message}</p>}
              <div className="mt-4 flex flex-wrap gap-2">
                {s.status !== "won" && (
                  <form action={convertSubmission}>
                    <input type="hidden" name="id" value={s.id} />
                    <button className="btn btn-gold !min-h-9 !px-4 text-sm">Make customer</button>
                  </form>
                )}
                {s.customer_id && <Link href={`/admin/customers/${s.customer_id}`} className="btn btn-ink !min-h-9 !px-4 text-sm">Open customer</Link>}
                {tabs.filter((t) => t !== s.status && t !== "won").map((t) => (
                  <form key={t} action={setSubmissionStatus}>
                    <input type="hidden" name="id" value={s.id} />
                    <input type="hidden" name="status" value={t} />
                    <button className="btn bg-mist !min-h-9 !px-4 text-sm capitalize hover:bg-mist-2">Mark {t}</button>
                  </form>
                ))}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Empty>No {tab} submissions.</Empty>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 font-semibold">{k}:</dt>
      <dd className="min-w-0 break-words">{v}</dd>
    </div>
  );
}
