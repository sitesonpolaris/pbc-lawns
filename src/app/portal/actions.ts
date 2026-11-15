"use server";

import { revalidatePath } from "next/cache";
import { requireViewer } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type Res = { ok?: boolean; error?: string; message?: string };

export async function signContract(_: Res, form: FormData): Promise<Res> {
  await requireViewer();
  const id = String(form.get("id") ?? "");
  const name = String(form.get("signed_name") ?? "").trim();
  if (!form.get("agree")) return { error: "Check the box to confirm you agree." };
  const supabase = await createClient();
  const { error } = await supabase.rpc("sign_contract", { contract_id: id, signer_name: name });
  if (error) return { error: error.message };
  revalidatePath("/portal/agreements");
  return { ok: true, message: "Signed. Thank you!" };
}

export async function updateProfile(_: Res, form: FormData): Promise<Res> {
  const v = await requireViewer();
  const supabase = await createClient();
  const full_name = String(form.get("full_name") ?? "").trim().slice(0, 120);
  const phone = String(form.get("phone") ?? "").trim().slice(0, 40);
  const { error } = await supabase.from("profiles").update({ full_name, phone }).eq("id", v.id);
  if (error) return { error: "Couldn't save your details." };
  const password = String(form.get("password") ?? "");
  if (password) {
    if (password.length < 8) return { error: "New password must be at least 8 characters." };
    const { error: pe } = await supabase.auth.updateUser({ password });
    if (pe) return { error: pe.message };
  }
  revalidatePath("/portal/account");
  return { ok: true, message: "Saved." };
}
