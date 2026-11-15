import { NextResponse, type NextRequest } from "next/server";
import { mapSquareStatus, verifySquareSignature } from "@/lib/square";
import { createServiceClient } from "@/lib/supabase/server";

// Square → PBC: keeps invoice status in sync (paid, canceled, overdue).
// Subscribe in the Square Developer Dashboard to invoice.payment_made, invoice.updated, invoice.canceled,
// with the notification URL https://<site>/api/square/webhook.
export async function POST(request: NextRequest) {
  const raw = await request.text();
  const notificationUrl = process.env.SQUARE_WEBHOOK_URL ?? `${request.nextUrl.origin}/api/square/webhook`;
  if (!verifySquareSignature(raw, request.headers.get("x-square-hmacsha256-signature"), notificationUrl)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(raw) as {
    type?: string;
    data?: { object?: { invoice?: { id: string; status: string; public_url?: string } } };
  };
  const inv = event.data?.object?.invoice;
  if (!inv?.id) return NextResponse.json({ ok: true });

  const supabase = createServiceClient();
  if (!supabase) return NextResponse.json({ error: "service key not configured" }, { status: 500 });

  let status = mapSquareStatus(inv.status);
  if (event.type === "invoice.scheduled_charge_failed") status = "overdue";
  if (!status) return NextResponse.json({ ok: true });

  const patch: Record<string, unknown> = { status };
  if (status === "paid") patch.paid_at = new Date().toISOString();
  if (inv.public_url) patch.square_public_url = inv.public_url;
  await supabase.from("invoices").update(patch).eq("square_invoice_id", inv.id);

  return NextResponse.json({ ok: true });
}
