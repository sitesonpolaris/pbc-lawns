import Link from "next/link";
import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { Customer } from "@/lib/types";
import { CustomerForm } from "../forms";

export default function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  return (
    <>
      <PageHead title="Customers" sub="Everyone you service. A customer with an email can log in to the portal." />
      <Suspense fallback={<Skeleton />}>
        <Customers searchParams={searchParams} />
      </Suspense>
    </>
  );
}

async function Customers({ searchParams }: { searchParams: PageProps<"/admin/customers">["searchParams"] }) {
  await requireAdmin();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const supabase = await createClient();
  let query = supabase.from("customers").select("*").order("full_name");
  if (q) {
    const like = `%${q.replace(/[%_,()]/g, "")}%`;
    query = query.or(`full_name.ilike.${like},email.ilike.${like},address_line.ilike.${like},phone.ilike.${like}`);
  }
  const { data } = await query.limit(300);
  const rows = (data ?? []) as Customer[];

  return (
    <div className="grid gap-4 px-4 pb-12 sm:px-8 xl:grid-cols-[1.4fr_1fr]">
      <div>
        <form className="mb-4 flex gap-2" role="search">
          <label htmlFor="q" className="sr-only">Search customers</label>
          <input id="q" name="q" defaultValue={q} placeholder="Search name, email, address, phone" className="field" />
          <button className="btn btn-ink">Search</button>
        </form>
        {rows.length ? (
          <ul className="overflow-hidden rounded-2xl bg-white">
            {rows.map((c) => (
              <li key={c.id} className="border-b border-mist last:border-0">
                <Link href={`/admin/customers/${c.id}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-mist">
                  <span className="min-w-0">
                    <span className="block font-semibold">{c.full_name}</span>
                    <span className="block truncate text-sm text-muted">{[c.address_line, c.city].filter(Boolean).join(", ") || c.email || c.phone}</span>
                  </span>
                  <span className="flex items-center gap-2">
                    {c.profile_id && <span className="text-xs font-semibold text-stripe">Portal</span>}
                    <Badge status={c.status} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Empty>{q ? "No customers match that search." : "No customers yet. Add one, or convert a request from the inbox."}</Empty>
        )}
      </div>
      <Panel title="Add a customer" className="self-start">
        <CustomerForm />
      </Panel>
    </div>
  );
}
