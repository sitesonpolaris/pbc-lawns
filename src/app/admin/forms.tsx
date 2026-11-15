import type { InputHTMLAttributes } from "react";
import { ActionForm } from "@/components/ActionForm";
import { defaultContract } from "@/lib/contract-template";
import { addDaysISO } from "@/lib/format";
import { services } from "@/lib/site";
import type { Customer, Plan } from "@/lib/types";
import { addPlan, addVisits, createContract, createCustomer, createInvoice, updateCustomer } from "./actions";

function F({ label, name, type = "text", defaultValue, required, className = "", ...rest }: {
  label: string; name: string; type?: string; defaultValue?: string | number | null; required?: boolean; className?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "defaultValue">) {
  return (
    <div className={className}>
      <label htmlFor={`a-${name}`} className="label">{label}</label>
      <input id={`a-${name}`} name={name} type={type} defaultValue={defaultValue ?? undefined} required={required} className="field" {...rest} />
    </div>
  );
}

function Sel({ label, name, options, defaultValue, className = "" }: { label: string; name: string; options: [string, string][]; defaultValue?: string; className?: string }) {
  return (
    <div className={className}>
      <label htmlFor={`a-${name}`} className="label">{label}</label>
      <select id={`a-${name}`} name={name} defaultValue={defaultValue} className="field">
        {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
      </select>
    </div>
  );
}

export function CustomerForm({ customer }: { customer?: Customer }) {
  return (
    <ActionForm action={customer ? updateCustomer : createCustomer} submit={customer ? "Save customer" : "Create customer"} className="grid gap-4 sm:grid-cols-2">
      {customer && <input type="hidden" name="id" value={customer.id} />}
      <F label="Full name" name="full_name" defaultValue={customer?.full_name} required autoComplete="off" />
      <Sel label="Status" name="status" defaultValue={customer?.status ?? "active"} options={[["active", "Active"], ["lead", "Lead"], ["paused", "Paused"], ["former", "Former"]]} />
      <F label="Email (portal login)" name="email" type="email" defaultValue={customer?.email} autoComplete="off" />
      <F label="Phone" name="phone" type="tel" defaultValue={customer?.phone} autoComplete="off" />
      <F label="Street address" name="address_line" defaultValue={customer?.address_line} className="sm:col-span-2" autoComplete="off" />
      <F label="City" name="city" defaultValue={customer?.city} autoComplete="off" />
      <div className="grid grid-cols-2 gap-4">
        <F label="State" name="state" defaultValue={customer?.state ?? "NC"} maxLength={2} />
        <F label="ZIP" name="zip" defaultValue={customer?.zip} inputMode="numeric" />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="a-notes" className="label">Notes (private)</label>
        <textarea id="a-notes" name="notes" rows={3} defaultValue={customer?.notes ?? ""} className="field" />
      </div>
    </ActionForm>
  );
}

export function PlanForm({ customerId, today }: { customerId: string; today: string }) {
  return (
    <ActionForm action={addPlan} submit="Add plan" resetOnSuccess className="grid gap-4 sm:grid-cols-2">
      <input type="hidden" name="customer_id" value={customerId} />
      <F label="Plan name" name="name" placeholder="Weekly mowing" required />
      <F label="Price ($)" name="price" inputMode="decimal" placeholder="140" required />
      <Sel label="Service frequency" name="frequency" options={[["weekly", "Weekly"], ["biweekly", "Every other week"], ["every-6-8-weeks", "Every 6–8 weeks"], ["monthly", "Monthly"], ["seasonal", "Seasonal"], ["one-time", "One-time"]]} />
      <Sel label="Billing" name="billing_interval" options={[["monthly", "Monthly"], ["per-visit", "Per visit"], ["per-round", "Per treatment round"], ["one-time", "One-time"]]} />
      <F label="Billing day of month (1–28)" name="billing_day" type="number" min={1} max={28} placeholder="1" />
      <F label="Starts" name="starts_on" type="date" defaultValue={today} required />
      <F label="Ends (optional)" name="ends_on" type="date" />
      <fieldset className="sm:col-span-2">
        <legend className="label">Services included</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {services.map((s) => (
            <label key={s.slug} className="flex items-center gap-2 text-[0.95rem]">
              <input type="checkbox" name="services" value={s.name} className="size-4 accent-stripe" /> {s.name}
            </label>
          ))}
        </div>
      </fieldset>
    </ActionForm>
  );
}

export function VisitForm({ customers, customerId, plans = [], today }: { customers?: Pick<Customer, "id" | "full_name">[]; customerId?: string; plans?: Plan[]; today: string }) {
  return (
    <ActionForm action={addVisits} submit="Schedule" resetOnSuccess className="grid gap-4 sm:grid-cols-2">
      {customerId ? (
        <input type="hidden" name="customer_id" value={customerId} />
      ) : (
        <Sel label="Customer" name="customer_id" options={[["", "Choose…"], ...(customers ?? []).map((c) => [c.id, c.full_name] as [string, string])]} className="sm:col-span-2" />
      )}
      <F label="Title" name="title" placeholder="Mow, edge & blow" required />
      <Sel label="Type" name="kind" options={[["mowing", "Mowing"], ["treatment", "Treatment"], ["cleanup", "Cleanup"], ["mulch", "Mulch / beds"], ["planting", "Planting"], ["aeration", "Aeration"], ["pressure-wash", "Pressure wash"], ["other", "Other"]]} />
      <F label="First date" name="scheduled_for" type="date" defaultValue={addDaysISO(today, 1)} required />
      <F label="Arrival window" name="time_window" placeholder="8–11 am" />
      <Sel label="Repeat" name="repeat" options={[["none", "Does not repeat"], ["weekly", "Weekly"], ["biweekly", "Every 2 weeks"], ["every-6-weeks", "Every 6 weeks"], ["every-7-weeks", "Every 7 weeks"], ["every-8-weeks", "Every 8 weeks"]]} />
      <F label="How many visits" name="count" type="number" min={1} max={40} defaultValue={1} />
      {plans.length > 0 && <Sel label="Plan" name="plan_id" options={[["", "None"], ...plans.map((p) => [p.id, p.name] as [string, string])]} />}
      <F label="Note for customer" name="notes" placeholder="Round 3 · broadleaf weed control" className={plans.length ? "" : "sm:col-span-2"} />
    </ActionForm>
  );
}

export function InvoiceForm({ customers, customerId, plans = [], today, squareReady }: { customers?: Pick<Customer, "id" | "full_name">[]; customerId?: string; plans?: Plan[]; today: string; squareReady: boolean }) {
  return (
    <ActionForm action={createInvoice} submit="Create invoice" submitClass="btn btn-gold" resetOnSuccess className="grid gap-4 sm:grid-cols-2">
      {customerId ? (
        <input type="hidden" name="customer_id" value={customerId} />
      ) : (
        <Sel label="Customer" name="customer_id" options={[["", "Choose…"], ...(customers ?? []).map((c) => [c.id, c.full_name] as [string, string])]} className="sm:col-span-2" />
      )}
      <F label="Description" name="description" placeholder="Lawn maintenance, June" required className="sm:col-span-2" />
      <F label="Amount ($)" name="amount" inputMode="decimal" placeholder="140.00" required />
      <F label="Due date" name="due_date" type="date" defaultValue={addDaysISO(today, 14)} required />
      {plans.length > 0 && <Sel label="Plan" name="plan_id" options={[["", "None"], ...plans.map((p) => [p.id, p.name] as [string, string])]} />}
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" name="send" defaultChecked={squareReady} className="size-5 accent-stripe" />
        <span>Send now through Square {squareReady ? "(emails the customer a pay link)" : "(Square not connected yet: saves as draft)"}</span>
      </label>
    </ActionForm>
  );
}

export function ContractForm({ customers, customer, planName }: { customers?: Pick<Customer, "id" | "full_name">[]; customer?: Pick<Customer, "id" | "full_name">; planName?: string }) {
  return (
    <ActionForm action={createContract} submit="Save agreement" resetOnSuccess className="grid gap-4">
      {customer ? (
        <input type="hidden" name="customer_id" value={customer.id} />
      ) : (
        <Sel label="Customer" name="customer_id" options={[["", "Choose…"], ...(customers ?? []).map((c) => [c.id, c.full_name] as [string, string])]} />
      )}
      <F label="Title" name="title" defaultValue="Lawn Service Agreement" required />
      <div>
        <label htmlFor="a-body" className="label">Terms</label>
        <textarea id="a-body" name="body" rows={12} defaultValue={defaultContract(customer?.full_name ?? "[Customer name]", planName)} className="field font-sans text-[0.95rem] leading-relaxed" />
      </div>
      <label className="flex items-center gap-2">
        <input type="checkbox" name="send" defaultChecked className="size-5 accent-stripe" />
        <span>Send to the customer&rsquo;s portal for signature</span>
      </label>
    </ActionForm>
  );
}
