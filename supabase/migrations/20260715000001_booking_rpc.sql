-- Atomic booking lifecycle for the MVP.
-- Event rows are locked so concurrent reservations cannot exceed capacity.

alter table public.bookings
  add column if not exists session_id uuid references public.event_sessions(id);

create or replace function public.book_event(p_event_id uuid, p_session_id uuid)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_event public.events%rowtype;
  v_status public.booking_status;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  select * into v_event
  from public.events
  where id = p_event_id
  for update;

  if not found or v_event.status <> 'active' then
    raise exception using errcode = 'P0002', message = 'EVENT_UNAVAILABLE';
  end if;

  if not exists (
    select 1 from public.event_sessions s
    where s.id = p_session_id
      and s.event_id = p_event_id
      and coalesce(s.ends_at, s.starts_at) > now()
  ) then
    raise exception using errcode = 'P0002', message = 'EVENT_UNAVAILABLE';
  end if;

  select status into v_status
  from public.bookings
  where user_id = v_user_id and event_id = p_event_id;

  if v_status in ('active', 'attended') then
    return v_status;
  end if;

  if v_event.seats_total is not null and v_event.seats_taken >= v_event.seats_total then
    raise exception using errcode = 'P0001', message = 'EVENT_FULL';
  end if;

  insert into public.bookings (user_id, event_id, session_id, status)
  values (v_user_id, p_event_id, p_session_id, 'active')
  on conflict (user_id, event_id)
  do update set session_id = excluded.session_id, status = 'active', created_at = now();

  update public.events
  set seats_taken = seats_taken + 1
  where id = p_event_id;

  return 'active';
end;
$$;

create or replace function public.cancel_booking(p_event_id uuid)
returns public.booking_status
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := auth.uid();
  v_status public.booking_status;
begin
  if v_user_id is null then
    raise exception using errcode = '42501', message = 'AUTH_REQUIRED';
  end if;

  perform 1 from public.events where id = p_event_id for update;
  if not found then
    raise exception using errcode = 'P0002', message = 'EVENT_UNAVAILABLE';
  end if;

  select status into v_status
  from public.bookings
  where user_id = v_user_id and event_id = p_event_id
  for update;

  if v_status is null then
    raise exception using errcode = 'P0002', message = 'BOOKING_NOT_FOUND';
  end if;

  if v_status = 'cancelled' then
    return 'cancelled';
  end if;

  if v_status = 'attended' then
    raise exception using errcode = 'P0001', message = 'BOOKING_ALREADY_ATTENDED';
  end if;

  update public.bookings set status = 'cancelled'
  where user_id = v_user_id and event_id = p_event_id;

  update public.events
  set seats_taken = greatest(seats_taken - 1, 0)
  where id = p_event_id;

  return 'cancelled';
end;
$$;

revoke execute on function public.book_event(uuid, uuid) from public, anon;
revoke execute on function public.cancel_booking(uuid) from public, anon;
grant execute on function public.book_event(uuid, uuid) to authenticated;
grant execute on function public.cancel_booking(uuid) to authenticated;

-- The client may read its rows through RLS, but all writes must preserve capacity
-- invariants and therefore go through the functions above.
revoke insert, update, delete on table public.bookings from anon, authenticated;
grant select on table public.bookings to authenticated;

create index if not exists bookings_user_id_status_idx
  on public.bookings (user_id, status);
create index if not exists bookings_event_id_idx
  on public.bookings (event_id);
create index if not exists bookings_session_id_idx
  on public.bookings (session_id);
