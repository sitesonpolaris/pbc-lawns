import { Suspense } from "react";
import { PageHead, Panel, Skeleton } from "@/components/AppShell";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { AccountForm } from "./AccountForm";

export default function AccountPage() {
  return (
    <>
      <PageHead title="Account" />
      <Suspense fallback={<Skeleton rows={2} />}>
        <Account />
      </Suspense>
    </>
  );
}

async function Account() {
  const v = await requireViewer();
  const supabase = await createClient();
  const { data } = await supabase.from("profiles").select("full_name, phone, email").eq("id", v.id).maybeSingle();
  return (
    <div className="px-4 pb-12 sm:px-8">
      <Panel className="max-w-xl">
        <AccountForm fullName={data?.full_name ?? ""} phone={data?.phone ?? ""} email={data?.email ?? v.email} />
      </Panel>
    </div>
  );
}
