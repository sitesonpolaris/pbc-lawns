export function money(cents: number | null | undefined) {
  return ((cents ?? 0) / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

/** Formats a 'YYYY-MM-DD' date without timezone drift. */
export function day(d: string | null | undefined, opts: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" }) {
  if (!d) return "—";
  const [y, m, dd] = d.slice(0, 10).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, dd)).toLocaleDateString("en-US", { ...opts, timeZone: "UTC" });
}

export function stamp(ts: string | null | undefined) {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZone: "America/New_York" });
}

/** Today's date in Charlotte as 'YYYY-MM-DD'. */
export function todayISO() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/New_York" });
}

export function addDaysISO(iso: string, days: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return t.toISOString().slice(0, 10);
}

export const frequencyLabel: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Every other week",
  monthly: "Monthly",
  "every-6-8-weeks": "Every 6–8 weeks",
  seasonal: "Seasonal",
  "one-time": "One-time",
};

export const billingLabel: Record<string, string> = {
  "per-visit": "Billed after each visit",
  monthly: "Billed monthly",
  "per-round": "Billed each treatment round",
  "one-time": "Billed once",
};

/** Upcoming billing dates for a plan (monthly plans only get exact dates). */
export function nextBillingDates(plan: { billing_interval: string; billing_day: number | null; starts_on: string; ends_on: string | null; status: string }, from: string, count = 3) {
  if (plan.status !== "active" || plan.billing_interval !== "monthly") return [];
  const dayOfMonth = plan.billing_day ?? Number(plan.starts_on.slice(8, 10)) ?? 1;
  const [fy, fm, fd] = from.split("-").map(Number);
  const out: string[] = [];
  let y = fy;
  let m = fm - 1;
  if (fd > dayOfMonth) m += 1;
  while (out.length < count) {
    const dt = new Date(Date.UTC(y, m, Math.min(dayOfMonth, 28)));
    const iso = dt.toISOString().slice(0, 10);
    if (iso >= plan.starts_on && (!plan.ends_on || iso <= plan.ends_on)) out.push(iso);
    else if (plan.ends_on && iso > plan.ends_on) break;
    m += 1;
    if (m > 11) { m = 0; y += 1; }
  }
  return out;
}
