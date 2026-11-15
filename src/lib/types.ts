export type Customer = {
  id: string; profile_id: string | null; full_name: string; email: string | null; phone: string | null;
  address_line: string | null; city: string | null; state: string | null; zip: string | null; notes: string | null;
  status: string; square_customer_id: string | null; created_at: string;
};
export type Plan = {
  id: string; customer_id: string; name: string; services: string[]; frequency: string; price_cents: number;
  billing_interval: string; billing_day: number | null; starts_on: string; ends_on: string | null; status: string;
};
export type Visit = {
  id: string; customer_id: string; plan_id: string | null; kind: string; title: string; scheduled_for: string;
  time_window: string | null; status: string; notes: string | null; completed_at: string | null;
};
export type Invoice = {
  id: string; number: number; customer_id: string; plan_id: string | null; description: string; amount_cents: number;
  due_date: string; status: string; square_invoice_id: string | null; square_public_url: string | null; paid_at: string | null; created_at: string;
};
export type Contract = {
  id: string; customer_id: string; title: string; body: string; status: string; sent_at: string | null;
  signed_at: string | null; signed_name: string | null; created_at: string;
};
export type Submission = {
  id: string; kind: string; name: string; email: string | null; phone: string | null; address: string | null;
  services: string[]; frequency: string | null; message: string | null; status: string; customer_id: string | null; created_at: string;
};
