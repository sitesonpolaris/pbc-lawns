import Link from "next/link";
import { PageHead, Panel } from "@/components/AppShell";
import { site } from "@/lib/site";

export function NotLinked({ name, email }: { name?: string; email: string }) {
  return (
    <>
      <PageHead title={name ? `Welcome, ${name}` : "Welcome"} />
      <div className="px-4 pb-12 sm:px-8">
        <Panel className="max-w-2xl">
          <p className="text-lg">
            Your account is set up, but it isn&rsquo;t connected to a PBC service record yet. We match accounts by email,
            so if you&rsquo;re already a customer, Cooper may have a different address on file than{" "}
            <strong className="break-all">{email}</strong>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a href={site.phoneHref} className="btn btn-ink">Call {site.phone}</a>
            <Link href="/quote" className="btn bg-mist hover:bg-mist-2">New here? Get a quote</Link>
          </div>
        </Panel>
      </div>
    </>
  );
}
