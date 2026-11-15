import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";

// Minimal Square REST client for Invoices. Docs: https://developer.squareup.com/reference/square/invoices-api
const VERSION = "2025-01-23";

function base() {
  return process.env.SQUARE_ENVIRONMENT === "sandbox"
    ? "https://connect.squareupsandbox.com/v2"
    : "https://connect.squareup.com/v2";
}

export function squareConfigured() {
  return Boolean(process.env.SQUARE_ACCESS_TOKEN && process.env.SQUARE_LOCATION_ID);
}

async function sq<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const res = await fetch(base() + path, {
    method: init.method ?? "GET",
    headers: {
      Authorization: `Bearer ${process.env.SQUARE_ACCESS_TOKEN}`,
      "Square-Version": VERSION,
      "Content-Type": "application/json",
    },
    body: init.body ? JSON.stringify(init.body) : undefined,
    cache: "no-store",
  });
  const json = (await res.json().catch(() => ({}))) as T & { errors?: { detail?: string; code?: string }[] };
  if (!res.ok) {
    const msg = json.errors?.map((e) => e.detail || e.code).join("; ") || `Square error ${res.status}`;
    throw new Error(msg);
  }
  return json;
}

type SqCustomer = { id: string };

/** Finds a Square customer by email or creates one. */
export async function ensureSquareCustomer(c: {
  square_customer_id: string | null;
  full_name: string;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
}): Promise<string> {
  if (c.square_customer_id) return c.square_customer_id;
  if (c.email) {
    const found = await sq<{ customers?: SqCustomer[] }>("/customers/search", {
      method: "POST",
      body: { query: { filter: { email_address: { exact: c.email } } }, limit: 1 },
    });
    if (found.customers?.[0]) return found.customers[0].id;
  }
  const [given, ...rest] = c.full_name.trim().split(/\s+/);
  const created = await sq<{ customer: SqCustomer }>("/customers", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      given_name: given,
      family_name: rest.join(" ") || undefined,
      email_address: c.email || undefined,
      phone_number: c.phone || undefined,
      address: c.address_line
        ? { address_line_1: c.address_line, locality: c.city || undefined, administrative_district_level_1: c.state || undefined, postal_code: c.zip || undefined, country: "US" }
        : undefined,
      reference_id: "pbc-portal",
    },
  });
  return created.customer.id;
}

/** Creates an order + invoice in Square, publishes it, and returns its ids and hosted payment page. */
export async function createAndPublishInvoice(args: {
  squareCustomerId: string;
  hasEmail: boolean;
  number: number;
  description: string;
  amountCents: number;
  dueDate: string;
}) {
  const location_id = process.env.SQUARE_LOCATION_ID!;
  const order = await sq<{ order: { id: string } }>("/orders", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      order: {
        location_id,
        customer_id: args.squareCustomerId,
        line_items: [
          {
            name: args.description.slice(0, 500),
            quantity: "1",
            base_price_money: { amount: args.amountCents, currency: "USD" },
          },
        ],
      },
    },
  });

  const draft = await sq<{ invoice: { id: string; version: number } }>("/invoices", {
    method: "POST",
    body: {
      idempotency_key: randomUUID(),
      invoice: {
        location_id,
        order_id: order.order.id,
        primary_recipient: { customer_id: args.squareCustomerId },
        payment_requests: [{ request_type: "BALANCE", due_date: args.dueDate, automatic_payment_source: "NONE" }],
        delivery_method: args.hasEmail ? "EMAIL" : "SHARE_MANUALLY",
        invoice_number: `PBC-${args.number}`,
        title: "PBC Lawn Service",
        description: args.description,
        accepted_payment_methods: { card: true, square_gift_card: false, bank_account: true, buy_now_pay_later: false, cash_app_pay: true },
      },
    },
  });

  const published = await sq<{ invoice: { id: string; public_url?: string; status: string } }>(
    `/invoices/${draft.invoice.id}/publish`,
    { method: "POST", body: { version: draft.invoice.version, idempotency_key: randomUUID() } },
  );

  return { id: published.invoice.id, publicUrl: published.invoice.public_url ?? null };
}

export async function cancelSquareInvoice(invoiceId: string) {
  const { invoice } = await sq<{ invoice: { version: number } }>(`/invoices/${invoiceId}`);
  await sq(`/invoices/${invoiceId}/cancel`, { method: "POST", body: { version: invoice.version } });
}

/** Verifies the x-square-hmacsha256-signature header. */
export function verifySquareSignature(rawBody: string, signature: string | null, notificationUrl: string) {
  const key = process.env.SQUARE_WEBHOOK_SIGNATURE_KEY;
  if (!key || !signature) return false;
  const expected = createHmac("sha256", key).update(notificationUrl + rawBody).digest("base64");
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Maps a Square invoice status to ours. */
export function mapSquareStatus(s: string): "sent" | "paid" | "overdue" | "void" | null {
  switch (s) {
    case "PAID":
      return "paid";
    case "UNPAID":
    case "SCHEDULED":
    case "PARTIALLY_PAID":
    case "PAYMENT_PENDING":
      return "sent";
    case "CANCELED":
    case "FAILED":
    case "REFUNDED":
      return "void";
    default:
      return null;
  }
}
