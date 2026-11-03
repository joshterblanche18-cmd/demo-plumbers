-- The chatbot's shared daily budget and per-visitor counts. No chat text is ever stored here.

create table public.chat_budget_days (
  day date primary key,
  spent_nano_usd bigint not null default 0 check (spent_nano_usd >= 0),
  updated_at timestamptz not null default now()
);

create table public.chat_visitor_days (
  day date not null,
  visitor_hash text not null,
  messages integer not null default 0 check (messages >= 0),
  primary key (day, visitor_hash)
);

-- Row-level security with no policies: visitors' keys can read and write nothing.
alter table public.chat_budget_days enable row level security;
alter table public.chat_visitor_days enable row level security;

revoke all on public.chat_budget_days, public.chat_visitor_days from public, anon, authenticated;
grant select, insert, update, delete on public.chat_budget_days, public.chat_visitor_days to service_role;

-- Reserves money before an AI call. A single statement, so two visitors at once cannot both take the last of the budget.
create function public.chat_reserve_budget(p_day date, p_amount bigint, p_limit bigint)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  changed integer;
begin
  if p_amount < 0 or p_amount > p_limit then
    return false;
  end if;
  insert into public.chat_budget_days as b (day, spent_nano_usd)
  values (p_day, p_amount)
  on conflict (day) do update
    set spent_nano_usd = b.spent_nano_usd + excluded.spent_nano_usd, updated_at = now()
    where b.spent_nano_usd + excluded.spent_nano_usd <= p_limit;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

-- Swaps the reservation for the real cost once the AI call has finished.
create function public.chat_settle_budget(p_day date, p_reserved bigint, p_actual bigint)
returns void
language sql
security invoker
set search_path = ''
as $$
  update public.chat_budget_days
  set spent_nano_usd = greatest(0, spent_nano_usd - p_reserved + p_actual), updated_at = now()
  where day = p_day;
$$;

-- Counts one message for a visitor, and clears old rows so nothing is kept for more than 7 days.
create function public.chat_count_visitor(p_day date, p_hash text, p_limit integer)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  changed integer;
begin
  delete from public.chat_visitor_days where day < p_day - 7;
  delete from public.chat_budget_days where day < p_day - 7;
  insert into public.chat_visitor_days as v (day, visitor_hash, messages)
  values (p_day, p_hash, 1)
  on conflict (day, visitor_hash) do update
    set messages = v.messages + 1
    where v.messages < p_limit;
  get diagnostics changed = row_count;
  return changed = 1;
end;
$$;

revoke all on function public.chat_reserve_budget(date, bigint, bigint) from public, anon, authenticated;
revoke all on function public.chat_settle_budget(date, bigint, bigint) from public, anon, authenticated;
revoke all on function public.chat_count_visitor(date, text, integer) from public, anon, authenticated;
grant execute on function public.chat_reserve_budget(date, bigint, bigint) to service_role;
grant execute on function public.chat_settle_budget(date, bigint, bigint) to service_role;
grant execute on function public.chat_count_visitor(date, text, integer) to service_role;
