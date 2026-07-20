create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country_code text not null default 'RU' check (char_length(country_code) = 2),
  timezone text not null,
  center_lat double precision not null check (center_lat between -90 and 90),
  center_lng double precision not null check (center_lng between -180 and 180),
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.cities (
  id, name, slug, country_code, timezone, center_lat, center_lng, sort_order
) values
  ('a0000000-0000-0000-0000-000000000001', 'Москва', 'moscow', 'RU', 'Europe/Moscow', 55.7558, 37.6173, 10),
  ('a0000000-0000-0000-0000-000000000002', 'Санкт-Петербург', 'saint-petersburg', 'RU', 'Europe/Moscow', 59.9343, 30.3351, 20),
  ('a0000000-0000-0000-0000-000000000003', 'Казань', 'kazan', 'RU', 'Europe/Moscow', 55.7961, 49.1064, 30),
  ('a0000000-0000-0000-0000-000000000004', 'Екатеринбург', 'yekaterinburg', 'RU', 'Asia/Yekaterinburg', 56.8389, 60.6057, 40),
  ('a0000000-0000-0000-0000-000000000005', 'Сочи', 'sochi', 'RU', 'Europe/Moscow', 43.5855, 39.7231, 50)
on conflict (slug) do update set
  name = excluded.name,
  country_code = excluded.country_code,
  timezone = excluded.timezone,
  center_lat = excluded.center_lat,
  center_lng = excluded.center_lng,
  sort_order = excluded.sort_order;

alter table public.profiles
  add column city_id uuid references public.cities(id) on delete set null;

update public.profiles p
set city_id = c.id
from public.cities c
where p.city_id is null
  and (
    lower(btrim(p.city)) = lower(c.name)
    or (c.slug = 'saint-petersburg' and lower(btrim(p.city)) in ('спб', 'петербург', 'санкт-петербург'))
    or (c.slug = 'moscow' and lower(btrim(p.city)) in ('мск', 'москва'))
  );

comment on column public.profiles.city is
  'Legacy display value. New clients must use city_id; remove after client migration.';

alter table public.event_sessions
  add column city_id uuid references public.cities(id) on delete restrict;

update public.event_sessions
set city_id = 'a0000000-0000-0000-0000-000000000001'
where city_id is null;

alter table public.event_sessions
  alter column city_id set not null,
  alter column city_id set default 'a0000000-0000-0000-0000-000000000001';

alter table public.venues
  add column city_id uuid references public.cities(id) on delete restrict;

update public.venues
set city_id = 'a0000000-0000-0000-0000-000000000001'
where city_id is null;

alter table public.venues
  alter column city_id set not null,
  alter column city_id set default 'a0000000-0000-0000-0000-000000000001';

create index profiles_city_id_idx on public.profiles (city_id);
create index event_sessions_city_id_starts_at_idx
  on public.event_sessions (city_id, starts_at);
create index venues_city_id_moderation_idx
  on public.venues (city_id, moderation);

alter table public.cities enable row level security;

create policy cities_read_active
on public.cities for select
to anon, authenticated
using (is_active or private.is_admin());

create policy cities_admin_insert
on public.cities for insert
to authenticated
with check (private.is_admin());

create policy cities_admin_update
on public.cities for update
to authenticated
using (private.is_admin())
with check (private.is_admin());

create policy cities_admin_delete
on public.cities for delete
to authenticated
using (private.is_admin());

grant select on public.cities to anon, authenticated;
grant insert, update, delete on public.cities to authenticated;
