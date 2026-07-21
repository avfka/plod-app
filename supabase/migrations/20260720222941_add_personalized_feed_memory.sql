-- Lightweight, explainable recommendation memory.
-- One signal per event/type/day is enough to learn affinities without keeping
-- a high-volume clickstream or precise viewing duration.
create table public.event_interest_signals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  signal_type text not null check (signal_type in ('view', 'open', 'map_open')),
  occurred_on date not null default current_date,
  created_at timestamptz not null default now(),
  unique (user_id, event_id, signal_type, occurred_on)
);

comment on table public.event_interest_signals is
  'Minimal first-party signals used to rank the signed-in user feed.';

create index event_interest_signals_user_recent_idx
  on public.event_interest_signals (user_id, created_at desc);

create index event_interest_signals_event_idx
  on public.event_interest_signals (event_id);

alter table public.event_interest_signals enable row level security;

create policy event_interest_signals_read_own
on public.event_interest_signals for select
to authenticated
using ((select auth.uid()) = user_id);

create policy event_interest_signals_insert_own
on public.event_interest_signals for insert
to authenticated
with check ((select auth.uid()) = user_id);

create policy event_interest_signals_delete_own
on public.event_interest_signals for delete
to authenticated
using ((select auth.uid()) = user_id);

-- New Supabase projects no longer expose SQL-created tables automatically.
-- Older projects may still have broad default privileges, so reset both roles
-- before exposing only the operations used by the client.
revoke all on public.event_interest_signals from anon, authenticated;
grant select, insert, delete on public.event_interest_signals to authenticated;
grant all on public.event_interest_signals to service_role;
