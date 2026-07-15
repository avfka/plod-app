-- Танц-Карта: таблицы (спек §4.2–4.5)

-- Справочник направлений танца. Цвета настраиваются админом — таблица, не enum.
create table dance_directions (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text unique not null,
  color_hex   text not null,
  is_active   boolean not null default true,
  sort_order  int not null default 0
);

create table choreographers (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  slug         text unique not null,   -- нормализованный ключ для матчинга
  is_verified  boolean not null default false,
  created_at   timestamptz not null default now()
);

create table profiles (
  id                        uuid primary key references auth.users(id) on delete cascade,
  full_name                 text,
  phone                     text,
  email                     text,
  avatar_url                text,
  city                      text,
  role                      user_role not null default 'user',
  -- дизайн карточки организатора
  card_color                text not null default '#45B7D1',
  marker_icon               marker_icon not null default 'circle',
  -- ответы опросника (null preferred_date = «любая дата»)
  preferred_date            date,
  interested_in_mc          boolean not null default true,
  interested_in_champ       boolean not null default false,
  favorite_choreographer_id uuid references choreographers(id),
  created_at                timestamptz not null default now()
);

-- Направления пользователя (множественный выбор из опросника)
create table profile_directions (
  profile_id   uuid references profiles(id) on delete cascade,
  direction_id uuid references dance_directions(id) on delete cascade,
  primary key (profile_id, direction_id)
);

create table events (
  id               uuid primary key default gen_random_uuid(),
  title            text not null,
  event_type       event_type not null default 'masterclass',
  choreographer_id uuid references choreographers(id),
  direction_id     uuid references dance_directions(id),
  price            numeric(10,2),            -- null если бесплатно
  is_free          boolean not null default false,
  description      text,
  photo_url        text,
  contact_phone    text,
  age_restriction  text,
  seats_total      int,                      -- null = без лимита
  seats_taken      int not null default 0,
  status           event_status not null default 'pending',
  card_color       text,                     -- копия из профиля на момент создания
  marker_icon      marker_icon,
  created_by       uuid references profiles(id),
  created_at       timestamptz not null default now(),
  check (seats_total is null or seats_taken <= seats_total)
);

-- Сессии = точки на карте. Обычный МК: 1 строка. «Красная нитка»: 2..5 строк.
create table event_sessions (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  day_number  int not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  address     text not null,
  lat         double precision not null,
  lng         double precision not null
);

create index event_sessions_event_id_starts_at_idx on event_sessions (event_id, starts_at);

create table venues (
  id             uuid primary key default gen_random_uuid(),
  name           text not null,
  address        text not null,
  lat            double precision,
  lng            double precision,
  district       text,
  metro          text,
  photo_url      text,
  description    text,
  owner_contact  text,
  rent_price     numeric(10,2),             -- null = бесплатно
  size_capacity  text,
  equipment      text[],
  status         venue_status not null default 'free',
  moderation     moderation_status not null default 'pending',
  created_by     uuid references profiles(id),
  created_at     timestamptz not null default now()
);

create table bookings (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  status      booking_status not null default 'active',
  created_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

create table reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  event_id    uuid not null references events(id) on delete cascade,
  rating      int check (rating between 1 and 5),
  text        text,
  created_at  timestamptz not null default now(),
  unique (user_id, event_id)
);

create table notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references profiles(id) on delete cascade,
  title       text,
  body        text,
  type        text,   -- 'booking' | 'reminder' | 'new_event' | 'review_request'
  is_read     boolean not null default false,
  created_at  timestamptz not null default now()
);

create table chat_messages (
  id          uuid primary key default gen_random_uuid(),
  event_id    uuid not null references events(id) on delete cascade,
  user_id     uuid references profiles(id),
  body        text not null,
  created_at  timestamptz not null default now()
);

-- Подписка «уведомить, когда появится хореограф» (Шаг 3 опросника)
create table choreographer_subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references profiles(id) on delete cascade,
  choreographer_name  text not null,
  created_at          timestamptz not null default now(),
  unique (user_id, choreographer_name)
);

-- Профиль создаётся автоматически при регистрации в auth.users
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, phone, email)
  values (new.id, new.phone, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Начальный статус события по роли автора: user → pending (модерация),
-- organizer/admin → active (публикация без модерации). Спек §7.4.
create or replace function events_set_initial_status()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_role user_role;
begin
  select role into v_role from public.profiles where id = auth.uid();
  if v_role in ('organizer', 'admin') then
    new.status := 'active';
  else
    new.status := 'pending';
  end if;
  return new;
end;
$$;

create trigger events_before_insert_status
  before insert on events
  for each row execute function events_set_initial_status();
