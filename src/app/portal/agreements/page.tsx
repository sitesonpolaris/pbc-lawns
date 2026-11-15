import { Suspense } from "react";
import { Badge, Empty, PageHead, Panel, Skeleton } from "@/components/AppShell";
import { stamp } from "@/lib/format";
import { loadPortal } from "@/lib/portal-data";
import { NotLinked } from "../NotLinked";
import { SignForm } from "./SignForm";

export default function AgreementsPage() {
  return (
    <Suspense fallback={<><PageHead title="Agreements" /><Skeleton /></>}>
      <Agreements />
    </Suspense>
  );
}

async function Agreements() {
  const { viewer, customers, contracts } = await loadPortal();
  if (!customers.length) return <NotLinked email={viewer.email} />;
  return (
    <>
      <PageHead title="Agreements" sub="Your service agreements with PBC Lawn Service." />
      <div className="space-y-4 px-4 pb-12 sm:px-8">
        {contracts.length ? (
          contracts.map((c) => (
            <Panel key={c.id} title={c.title} action={<Badge status={c.status} />}>
              <div className="max-h-[28rem] overflow-y-auto whitespace-pre-wrap rounded-xl bg-mist p-4 leading-relaxed">{c.body}</div>
              {c.status === "signed" ? (
                <p className="mt-4 text-muted">
                  Signed by <strong className="text-ink">{c.signed_name}</strong> on {stamp(c.signed_at)}.
                </p>
              ) : (
                <SignForm id={c.id} />
              )}
            </Panel>
          ))
        ) : (
          <Empty>No agreements yet.</Empty>
        )}
      </div>
    </>
  );
}
