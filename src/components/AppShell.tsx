import Image from "next/image";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { signOut } from "@/app/login/actions";
import { AppNav, type NavItem } from "./AppNav";

export function AppShell({
  area,
  items,
  who,
  children,
}: {
  area: string;
  items: NavItem[];
  who: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-ground lg:grid lg:grid-cols-[16rem_1fr]">
      <aside className="bg-turf text-ground lg:sticky lg:top-0 lg:h-dvh lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-4 py-4 lg:block lg:px-5 lg:py-6">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo-white.png" alt="" width={36} height={40} className="h-10 w-auto" />
            <span className="leading-tight">
              <span className="block font-display text-lg font-bold">PBC Lawns</span>
              <span className="block text-xs text-ground/70">{area}</span>
            </span>
          </Link>
          <form action={signOut} className="lg:hidden">
            <button className="rounded-full bg-ground/10 px-4 py-2 text-sm font-semibold hover:bg-ground/20">Sign out</button>
          </form>
        </div>
        <AppNav items={items} />
        <div className="hidden px-5 pb-6 pt-8 lg:block">
          <div className="text-sm text-ground/75">
            <Suspense fallback={<span>&nbsp;</span>}>{who}</Suspense>
          </div>
          <form action={signOut} className="mt-3">
            <button className="rounded-full bg-ground/10 px-4 py-2 text-sm font-semibold hover:bg-ground/20">Sign out</button>
          </form>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function PageHead({ title, sub, action }: { title: string; sub?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-6 pt-8 sm:flex-row sm:items-end sm:justify-between sm:px-8 lg:pt-12">
      <div>
        <h1 className="text-[clamp(2rem,4vw,3rem)] leading-none">{title}</h1>
        {sub && <p className="mt-2 text-muted">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function Panel({ title, children, action, className = "" }: { title?: string; children: ReactNode; action?: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl bg-white p-5 sm:p-6 ${className}`}>
      {(title || action) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-sans text-lg font-semibold tracking-normal">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="rounded-xl bg-mist px-4 py-5 text-muted">{children}</p>;
}

const tones: Record<string, string> = {
  new: "bg-gold text-ink",
  sent: "bg-gold text-ink",
  overdue: "bg-danger text-white",
  scheduled: "bg-mist text-ink",
  draft: "bg-mist-2 text-ink",
  paid: "bg-stripe text-white",
  completed: "bg-stripe text-white",
  signed: "bg-stripe text-white",
  active: "bg-stripe text-white",
  won: "bg-stripe text-white",
  contacted: "bg-mist-2 text-ink",
};

export function Badge({ status }: { status: string }) {
  return (
    <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${tones[status] ?? "bg-mist text-muted"}`}>
      {status.replace(/-/g, " ")}
    </span>
  );
}

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3 px-4 sm:px-8" aria-busy="true" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-24 animate-pulse rounded-2xl bg-mist" />
      ))}
    </div>
  );
}
