-- PBC Lawn Service — core schema
-- Roles: 'admin' (owner) and 'customer'. Customers see only their own records.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------- profiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- customers
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  address_line text,
  city text,
  state text default 'NC',
  zip text,
  notes text,
  status text not null default 'active' check (status in ('lead', 'active', 'paused', 'former')),
  square_customer_id text,
  created_at timestamptz not null default now()
);
create index customers_email_idx on public.customers (lower(email));

-- ---------------------------------------------------------------- submissions (quote / contact / subscription forms)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  kind text not null default 'quote' check (kind in ('quote', 'contact', 'subscription')),
  name text not null check (char_length(name) between 1 and 120),
  email text check (email is null or char_length(email) <= 200),
  phone text check (phone is null or char_length(phone) <= 40),
  address text check (address is null or char_length(address) <= 300),
  services text[] not null default '{}',
  frequency text check (frequency is null or char_length(frequency) <= 60),
  message text check (message is null or char_length(message) <= 4000),
  status text not null default 'new' check (status in ('new', 'contacted', 'won', 'archived')),
  customer_id uuid references public.customers (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- plans (service subscriptions + billing schedule)
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  name text not null,
  services text[] not null default '{}',
  frequency text not null default 'weekly' check (frequency in ('weekly', 'biweekly', 'monthly', 'every-6-8-weeks', 'seasonal', 'one-time')),
  price_cents integer not null default 0 check (price_cents >= 0),
  billing_interval text not null default 'monthly' check (billing_interval in ('per-visit', 'monthly', 'per-round', 'one-time')),
  billing_day integer check (billing_day between 1 and 28),
  starts_on date not null default current_date,
  ends_on date,
  status text not null default 'active' check (status in ('active', 'paused', 'cancelled')),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- visits (calendar: mowing, treatments, cleanups)
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  kind text not null default 'mowing' check (kind in ('mowing', 'treatment', 'cleanup', 'planting', 'mulch', 'pressure-wash', 'aeration', 'other')),
  title text not null,
  scheduled_for date not null,
  time_window text,
  status text not null default 'scheduled' check (status in ('scheduled', 'completed', 'skipped', 'rescheduled')),
  notes text,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create index visits_date_idx on public.visits (scheduled_for);
create index visits_customer_idx on public.visits (customer_id);

-- ---------------------------------------------------------------- invoices (synced with Square Invoices)
create sequence public.invoice_number_seq start 1001;
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  number integer not null default nextval('public.invoice_number_seq') unique,
  customer_id uuid not null references public.customers (id) on delete cascade,
  plan_id uuid references public.plans (id) on delete set null,
  description text not null,
  amount_cents integer not null check (amount_cents > 0),
  due_date date not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'void')),
  square_invoice_id text unique,
  square_public_url text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);
create index invoices_customer_idx on public.invoices (customer_id);

-- ---------------------------------------------------------------- contracts (service agreements)
create table public.contracts (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id) on delete cascade,
  title text not null,
  body text not null,
  status text not null default 'draft' check (status in ('draft', 'sent', 'signed', 'void')),
  sent_at timestamptz,
  signed_at timestamptz,
  signed_name text,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------- helpers
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function public.my_customer_ids()
returns setof uuid
language sql stable security definer set search_path = ''
as $$
  select id from public.customers where profile_id = auth.uid();
$$;

-- New auth user -> profile; link to an existing customer record by email.
-- The business inbox is promoted to admin automatically.
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    case when lower(new.email) = 'pbc.lawns@gmail.com' then 'admin' else 'customer' end
  );
  update public.customers
     set profile_id = new.id
   where profile_id is null and lower(email) = lower(new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Customer signs a contract that was sent to them.
create or replace function public.sign_contract(contract_id uuid, signer_name text)
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if char_length(trim(signer_name)) < 2 then
    raise exception 'Please type your full name to sign.';
  end if;
  update public.contracts
     set status = 'signed', signed_at = now(), signed_name = trim(signer_name)
   where id = contract_id
     and status = 'sent'
     and customer_id in (select public.my_customer_ids());
  if not found then
    raise exception 'This agreement is not available to sign.';
  end if;
end;
$$;

-- ---------------------------------------------------------------- RLS
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.submissions enable row level security;
alter table public.plans enable row level security;
alter table public.visits enable row level security;
alter table public.invoices enable row level security;
alter table public.contracts enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles for select
  using (id = (select auth.uid()) or (select public.is_admin()));
create policy "profiles: update own" on public.profiles for update
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()) and role = (select p.role from public.profiles p where p.id = (select auth.uid())));
create policy "profiles: admin manage" on public.profiles for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- customers
create policy "customers: read own" on public.customers for select
  using (id in (select public.my_customer_ids()));
create policy "customers: admin all" on public.customers for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- submissions: anyone may submit a new one; only admin reads/manages
create policy "submissions: public insert" on public.submissions for insert to anon, authenticated
  with check (status = 'new' and customer_id is null);
create policy "submissions: admin all" on public.submissions for all
  using ((select public.is_admin())) with check ((select public.is_admin()));

-- plans / visits / invoices / contracts: customer reads own, admin all
create policy "plans: read own" on public.plans for select using (customer_id in (select public.my_customer_ids()));
create policy "plans: admin all" on public.plans for all using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "visits: read own" on public.visits for select using (customer_id in (select public.my_customer_ids()));
create policy "visits: admin all" on public.visits for all using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "invoices: read own" on public.invoices for select
  using (customer_id in (select public.my_customer_ids()) and status <> 'draft');
create policy "invoices: admin all" on public.invoices for all using ((select public.is_admin())) with check ((select public.is_admin()));

create policy "contracts: read own" on public.contracts for select
  using (customer_id in (select public.my_customer_ids()) and status in ('sent', 'signed'));
create policy "contracts: admin all" on public.contracts for all using ((select public.is_admin())) with check ((select public.is_admin()));

revoke execute on function public.sign_contract(uuid, text) from anon;
grant execute on function public.sign_contract(uuid, text) to authenticated;

-- lock_down_functions
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.sign_contract(uuid, text) from public, anon;
grant execute on function public.sign_contract(uuid, text) to authenticated;
