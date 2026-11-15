import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Viewer = {
  id: string;
  email: string;
  fullName: string;
  role: "customer" | "admin";
};

/** Reads the session. Call only inside a <Suspense> boundary. */
export async function getViewer(): Promise<Viewer | null> {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const sub = data?.claims?.sub;
  if (!sub) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .eq("id", sub)
    .maybeSingle();
  return {
    id: sub,
    email: profile?.email ?? String(data.claims.email ?? ""),
    fullName: profile?.full_name ?? "",
    role: profile?.role === "admin" ? "admin" : "customer",
  };
}

export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/login");
  return v;
}

export async function requireAdmin(): Promise<Viewer> {
  const v = await getViewer();
  if (!v) redirect("/login?next=/admin");
  if (v.role !== "admin") redirect("/portal");
  return v;
}
