import type { Metadata } from "next";
import { AppShell } from "@/components/AppShell";
import { getViewer } from "@/lib/auth";

export const metadata: Metadata = { title: "Customer Portal", robots: { index: false } };
export const instant = false;

const items = [
  { href: "/portal", label: "Overview", exact: true },
  { href: "/portal/schedule", label: "Schedule" },
  { href: "/portal/billing", label: "Billing" },
  { href: "/portal/agreements", label: "Agreements" },
  { href: "/portal/account", label: "Account" },
];

async function Who() {
  const v = await getViewer();
  if (!v) return null;
  return (
    <>
      <span className="block font-semibold text-ground">{v.fullName || "Signed in"}</span>
      <span className="block break-all">{v.email}</span>
      {v.role === "admin" && (
        <a href="/admin" className="mt-2 inline-block font-semibold text-gold underline">Open admin</a>
      )}
    </>
  );
}

export default function PortalLayout({ children }: LayoutProps<"/portal">) {
  return (
    <AppShell area="Customer portal" items={items} who={<Who />}>
      {children}
    </AppShell>
  );
}
