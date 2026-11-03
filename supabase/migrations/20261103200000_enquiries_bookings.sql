-- Enquiries, call-out bookings and limits. All demo data, deleted after 7 days.

create table public.enquiries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 1 and 30),
  email text not null check (char_length(email) between 3 and 254),
  postcode_area text not null check (char_length(postcode_area) between 1 and 12),
  problem text not null check (char_length(problem) between 1 and 2000),
  urgency text not null check (urgency in ('emergency', 'soon', 'flexible')),
  contact_method text not null check (contact_method in ('phone', 'email')),
  preferred_time text not null check (preferred_time in ('morning', 'afternoon', 'evening', 'any')),
  consent boolean not null check (consent),
  email_sent boolean not null default false
);
create index enquiries_created_at_idx on public.enquiries (created_at);

create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null default 'pending' check (status in ('pending', 'paid', 'expired', 'refunded')),
  visit_date date not null,
  visit_window text not null check (visit_window in ('morning', 'afternoon')),
  name text not null check (char_length(name) between 1 and 100),
  phone text not null check (char_length(phone) between 1 and 30),
  email text not null check (char_length(email) between 3 and 254),
  postcode_area text not null check (char_length(postcode_area) between 1 and 12),
  problem text not null check (char_length(problem) between 1 and 2000),
  amount_pence integer not null check (amount_pence > 0),
  stripe_session_id text unique,
  stripe_payment_intent text unique,
  paid_at timestamptz,
  refunded_at timestamptz,
  email_sent boolean not null default false
);
create index bookings_created_at_idx on public.bookings (created_at);

-- Each webhook event is recorded once, so a repeat delivery changes nothing.
create table public.stripe_events (
  id text primary key,
  type text not null,
  received_at timestamptz not null default now()
);

create table public.action_limits (
  day date not null,
  action text not null,
  visitor_hash text not null,
  count integer not null default 0 check (count >= 0),
  primary key (day, action, visitor_hash)
);

-- Row-level security with no policies: only the server's secret key can reach these tables.
alter table public.enquiries enable row level security;
alter table public.bookings enable row level security;
alter table public.stripe_events enable row level security;
alter table public.action_limits enable row level security;

revoke all on public.enquiries, public.bookings, public.stripe_events, public.action_limits from public, anon, authenticated;
grant select, insert, update, delete on public.enquiries, public.bookings, public.stripe_events, public.action_limits to service_role;

create function public.count_action(p_day date, p_action text, p_hash text, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  changed integer;
begin
  insert into public.action_limits as a (day, action, visitor_hash, count)
  values (p_day, p_action, p_hash, 1)
  on conflict (day, action, visitor_hash) do update
    set count = a.count + 1
    where a.count < p_limit;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- Marks a booking paid only once, and only from pending or expired. Returns true the first time only.
create function public.mark_booking_paid(p_session text, p_intent text)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  changed integer;
begin
  update public.bookings
  set status = 'paid', stripe_payment_intent = p_intent, paid_at = now()
  where stripe_session_id = p_session and status in ('pending', 'expired');
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- Removes demo data after 7 days. The privacy page promises this.
create function public.delete_old_demo_data()
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  delete from public.enquiries where created_at < now() - interval '7 days';
  delete from public.bookings where created_at < now() - interval '7 days';
  delete from public.stripe_events where received_at < now() - interval '7 days';
  delete from public.action_limits where day < (now() - interval '7 days')::date;
  delete from public.chat_visitor_days where day < (now() - interval '7 days')::date;
  delete from public.chat_budget_days where day < (now() - interval '7 days')::date;
end;
$$;

revoke all on function public.count_action(date, text, text, integer) from public, anon, authenticated;
revoke all on function public.mark_booking_paid(text, text) from public, anon, authenticated;
revoke all on function public.delete_old_demo_data() from public, anon, authenticated;
grant execute on function public.count_action(date, text, text, integer) to service_role;
grant execute on function public.mark_booking_paid(text, text) to service_role;
grant execute on function public.delete_old_demo_data() to service_role;

create extension if not exists pg_cron;
select cron.schedule('delete-old-demo-data', '17 3 * * *', 'select public.delete_old_demo_data()');
