import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };
export const instant = false;

const items = [
  { href: "/admin", label: "Dashboard", exact: true },
  { href: "/admin/inbox", label: "Inbox" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/calendar", label: "Calendar" },
  { href: "/admin/invoices", label: "Invoices" },
  { href: "/admin/contracts", label: "Contracts" },
];

async function Who() {
  const v = await requireAdmin();
  return (
    <>
      <span className="block font-semibold text-ground">{v.fullName || "Admin"}</span>
      <span className="block break-all">{v.email}</span>
    </>
  );
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <AppShell area="Owner dashboard" items={items} who={<Who />}>
      {children}
    </AppShell>
  );
}
