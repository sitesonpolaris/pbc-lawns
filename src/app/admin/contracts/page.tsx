import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { stamp } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { setContractStatus } from "../actions";
import { ContractForm } from "../forms";

type Row = {
  id: string; title: string; status: string; sent_at: string | null; signed_at: string | null; signed_name: string | null;
  created_at: string; customer_id: string; customers: { full_name: string } | null;
};

export default function ContractsPage() {
  return (
    <>
      <PageHead title="Contracts" sub="Service agreements customers review and sign in their portal." />
      <Suspense fallback={<Skeleton />}>
        <Contracts />
      </Suspense>
    </>
  );
}

async function Contracts() {
  await requireAdmin();
  const supabase = await createClient();
  const [{ data }, { data: customers }] = await Promise.all([
    supabase.from("contracts").select("id, title, status, sent_at, signed_at, signed_name, created_at, customer_id, customers(full_name)").order("created_at", { ascending: false }).limit(200),
    supabase.from("customers").select("id, full_name").order("full_name"),
  ]);
  const rows = (data ?? []) as unknown as Row[];

  return (
    <div className="grid gap-4 px-4 pb-12 sm:px-8 xl:grid-cols-[1.2fr_1fr]">
      <div>
        {rows.length ? (
          <ul className="overflow-hidden rounded-2xl bg-white">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 border-b border-mist px-5 py-3.5 last:border-0">
                <span>
                  <span className="block font-semibold">
                    <Link href={`/admin/customers/${r.customer_id}`} className="hover:underline">{r.customers?.full_name}</Link> · {r.title} <Badge status={r.status} />
                  </span>
                  <span className="text-sm text-muted">
                    {r.status === "signed" ? `Signed by ${r.signed_name} · ${stamp(r.signed_at)}` : r.sent_at ? `Sent ${stamp(r.sent_at)}` : `Created ${stamp(r.created_at)}`}
                  </span>
                </span>
                {r.status !== "signed" && r.status !== "void" && (
                  <form action={setContractStatus} className="flex gap-2">
                    <input type="hidden" name="id" value={r.id} />
                    {r.status === "draft" && <button name="status" value="sent" className="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold">Send</button>}
                    <button name="status" value="void" className="rounded-full bg-mist px-3 py-1.5 text-sm font-semibold text-danger hover:bg-mist-2">Void</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <Empty>No agreements yet.</Empty>
        )}
      </div>
      <Panel title="New agreement" className="self-start">
        {customers?.length ? <ContractForm customers={customers} /> : <Empty>Add a customer first.</Empty>}
      </Panel>
    </div>
  );
}
