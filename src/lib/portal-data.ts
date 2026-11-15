import "server-only";
import { requireViewer } from "./auth";
import { createClient } from "./supabase/server";
import type { Contract, Customer, Invoice, Plan, Visit } from "./types";

/** Everything the signed-in customer may see. RLS limits rows to their own. */
export async function loadPortal() {
  const viewer = await requireViewer();
  const supabase = await createClient();
  const [c, p, v, i, k] = await Promise.all([
    supabase.from("customers").select("*").eq("profile_id", viewer.id),
    supabase.from("plans").select("*").order("starts_on"),
    supabase.from("visits").select("*").order("scheduled_for"),
    supabase.from("invoices").select("*").order("due_date", { ascending: false }),
    supabase.from("contracts").select("*").order("created_at", { ascending: false }),
  ]);
  const customers = (c.data ?? []) as Customer[];
  const ids = new Set(customers.map((x) => x.id));
  // Admins can read every row; keep the portal to their own customer records only.
  const mine = <T extends { customer_id: string }>(rows: T[] | null) => (rows ?? []).filter((r) => ids.has(r.customer_id));
  return {
    viewer,
    customers,
    plans: mine(p.data as Plan[]),
    visits: mine(v.data as Visit[]),
    invoices: mine(i.data as Invoice[]),
    contracts: mine(k.data as Contract[]),
  };
}
