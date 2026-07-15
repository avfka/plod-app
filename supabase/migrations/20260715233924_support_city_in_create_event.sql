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
  v_city_id uuid;
  v_is_free boolean := coalesce((p_event->>'is_free')::boolean, false);
  v_price numeric(10,2);
begin
  if v_user_id is null then raise exception 'AUTH_REQUIRED'; end if;

  select * into v_profile from public.profiles where id = v_user_id;
  if not found then raise exception 'PROFILE_REQUIRED'; end if;

  if nullif(btrim(p_event->>'title'), '') is null then raise exception 'TITLE_REQUIRED'; end if;
  if p_event->>'event_type' not in ('masterclass', 'championship') then
    raise exception 'INVALID_EVENT_TYPE';
  end if;

  v_session_count := jsonb_array_length(coalesce(p_sessions, '[]'::jsonb));
  if v_session_count < 1 or v_session_count > 5 then raise exception 'SESSIONS_COUNT'; end if;

  if not v_is_free then
    v_price := nullif(p_event->>'price', '')::numeric;
    if v_price is null or v_price < 0 then raise exception 'PRICE_REQUIRED'; end if;
  end if;

  insert into public.events (
    title, event_type, choreographer_id, direction_id, price, is_free,
    description, photo_url, contact_phone, age_restriction, seats_total,
    card_color, marker_icon, created_by
  ) values (
    btrim(p_event->>'title'), (p_event->>'event_type')::public.event_type,
    nullif(p_event->>'choreographer_id', '')::uuid,
    nullif(p_event->>'direction_id', '')::uuid,
    case when v_is_free then null else v_price end, v_is_free,
    nullif(btrim(p_event->>'description'), ''), nullif(p_event->>'photo_url', ''),
    nullif(btrim(p_event->>'contact_phone'), ''), nullif(btrim(p_event->>'age_restriction'), ''),
    nullif(p_event->>'seats_total', '')::int, v_profile.card_color, v_profile.marker_icon, v_user_id
  ) returning id into v_event_id;

  for v_session in select value from jsonb_array_elements(p_sessions)
  loop
    if nullif(btrim(v_session->>'address'), '') is null
      or (v_session->>'starts_at')::timestamptz <= now()
      or (v_session->>'lat')::double precision not between -90 and 90
      or (v_session->>'lng')::double precision not between -180 and 180 then
      raise exception 'INVALID_SESSION';
    end if;

    v_city_id := coalesce(
      nullif(v_session->>'city_id', '')::uuid,
      v_profile.city_id,
      'a0000000-0000-0000-0000-000000000001'::uuid
    );
    if not exists (select 1 from public.cities where id = v_city_id and is_active) then
      raise exception 'INVALID_CITY';
    end if;

    insert into public.event_sessions (
      event_id, city_id, day_number, starts_at, ends_at, address, lat, lng
    ) values (
      v_event_id, v_city_id, (v_session->>'day_number')::int,
      (v_session->>'starts_at')::timestamptz, nullif(v_session->>'ends_at', '')::timestamptz,
      btrim(v_session->>'address'), (v_session->>'lat')::double precision,
      (v_session->>'lng')::double precision
    );
  end loop;

  return v_event_id;
end;
$$;

revoke all on function public.create_event(jsonb, jsonb) from public, anon;
grant execute on function public.create_event(jsonb, jsonb) to authenticated;
