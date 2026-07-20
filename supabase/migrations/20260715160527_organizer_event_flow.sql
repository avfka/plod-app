alter type public.event_status add value if not exists 'rejected' after 'pending';

alter table public.events
  add column if not exists moderation_reason text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-photos',
  'event-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy event_photos_insert_own
on storage.objects for insert to authenticated
with check (
  bucket_id = 'event-photos'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

create policy event_photos_update_own
on storage.objects for update to authenticated
using (
  bucket_id = 'event-photos'
  and owner_id = (select auth.uid())::text
)
with check (
  bucket_id = 'event-photos'
  and owner_id = (select auth.uid())::text
);

create policy event_photos_select_own
on storage.objects for select to authenticated
using (
  bucket_id = 'event-photos'
  and owner_id = (select auth.uid())::text
);

create policy event_photos_delete_own
on storage.objects for delete to authenticated
using (
  bucket_id = 'event-photos'
  and owner_id = (select auth.uid())::text
);

create or replace function public.create_event(p_event jsonb, p_sessions jsonb)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_event_id uuid;
  v_profile public.profiles%rowtype;
  v_session jsonb;
  v_session_count int;
  v_is_free boolean := coalesce((p_event->>'is_free')::boolean, false);
  v_price numeric(10,2);
begin
  if v_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then
    raise exception 'PROFILE_REQUIRED';
  end if;

  if nullif(btrim(p_event->>'title'), '') is null then
    raise exception 'TITLE_REQUIRED';
  end if;

  if p_event->>'event_type' not in ('masterclass', 'championship') then
    raise exception 'INVALID_EVENT_TYPE';
  end if;

  v_session_count := jsonb_array_length(coalesce(p_sessions, '[]'::jsonb));
  if v_session_count < 1 or v_session_count > 5 then
    raise exception 'SESSIONS_COUNT';
  end if;

  if not v_is_free then
    v_price := nullif(p_event->>'price', '')::numeric;
    if v_price is null or v_price < 0 then
      raise exception 'PRICE_REQUIRED';
    end if;
  end if;

  insert into public.events (
    title, event_type, choreographer_id, direction_id, price, is_free,
    description, photo_url, contact_phone, age_restriction, seats_total,
    card_color, marker_icon, created_by
  ) values (
    btrim(p_event->>'title'),
    (p_event->>'event_type')::public.event_type,
    nullif(p_event->>'choreographer_id', '')::uuid,
    nullif(p_event->>'direction_id', '')::uuid,
    case when v_is_free then null else v_price end,
    v_is_free,
    nullif(btrim(p_event->>'description'), ''),
    nullif(p_event->>'photo_url', ''),
    nullif(btrim(p_event->>'contact_phone'), ''),
    nullif(btrim(p_event->>'age_restriction'), ''),
    nullif(p_event->>'seats_total', '')::int,
    v_profile.card_color,
    v_profile.marker_icon,
    v_user_id
  ) returning id into v_event_id;

  for v_session in select value from jsonb_array_elements(p_sessions)
  loop
    if nullif(btrim(v_session->>'address'), '') is null
      or (v_session->>'starts_at')::timestamptz <= now()
      or (v_session->>'lat')::double precision not between -90 and 90
      or (v_session->>'lng')::double precision not between -180 and 180 then
      raise exception 'INVALID_SESSION';
    end if;

    insert into public.event_sessions (
      event_id, day_number, starts_at, ends_at, address, lat, lng
    ) values (
      v_event_id,
      (v_session->>'day_number')::int,
      (v_session->>'starts_at')::timestamptz,
      nullif(v_session->>'ends_at', '')::timestamptz,
      btrim(v_session->>'address'),
      (v_session->>'lat')::double precision,
      (v_session->>'lng')::double precision
    );
  end loop;

  return v_event_id;
end;
$$;

revoke all on function public.create_event(jsonb, jsonb) from public, anon;
grant execute on function public.create_event(jsonb, jsonb) to authenticated;

create or replace function public.moderate_event(
  p_event_id uuid,
  p_decision text,
  p_reason text default null
)
returns public.events
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  v_event public.events;
begin
  if not private.is_admin() then
    raise exception 'ADMIN_REQUIRED';
  end if;
  if p_decision not in ('active', 'rejected') then
    raise exception 'INVALID_DECISION';
  end if;
  if p_decision = 'rejected' and nullif(btrim(p_reason), '') is null then
    raise exception 'REASON_REQUIRED';
  end if;

  update public.events
  set status = p_decision::public.event_status,
      moderation_reason = case when p_decision = 'rejected' then btrim(p_reason) else null end
  where id = p_event_id and status in ('pending', 'rejected')
  returning * into v_event;

  if not found then
    raise exception 'EVENT_NOT_MODERATABLE';
  end if;
  return v_event;
end;
$$;

revoke all on function public.moderate_event(uuid, text, text) from public, anon;
grant execute on function public.moderate_event(uuid, text, text) to authenticated;
