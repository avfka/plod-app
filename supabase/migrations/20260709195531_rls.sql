-- Танц-Карта: RLS-политики (спек §5)
-- Роли: гость (не аутентифицирован) — read-only по активному контенту;
-- user — записи/добавления с модерацией; organizer — публикация без модерации;
-- admin — всё.

-- Хелперы ролей
create or replace function is_admin()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = 'admin'
  );
$$;

create or replace function is_organizer()
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role in ('organizer', 'admin')
  );
$$;

-- Видимость события для текущего клиента: активное — всем (в т.ч. гостю),
-- любой статус — автору и админу. Используется политиками дочерних таблиц.
create or replace function can_see_event(p_event_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from events e
    where e.id = p_event_id
      and (e.status = 'active' or e.created_by = auth.uid() or is_admin())
  );
$$;

-- ---------------------------------------------------------------- справочники

alter table dance_directions enable row level security;

create policy dance_directions_read on dance_directions
  for select using (is_active or is_admin());

create policy dance_directions_admin_write on dance_directions
  for all using (is_admin()) with check (is_admin());

alter table choreographers enable row level security;

create policy choreographers_read on choreographers
  for select using (true);

-- upsert по slug при создании события — любым аутентифицированным
create policy choreographers_insert on choreographers
  for insert with check (auth.uid() is not null);

create policy choreographers_admin_update on choreographers
  for update using (is_admin()) with check (is_admin());

create policy choreographers_admin_delete on choreographers
  for delete using (is_admin());

-- ------------------------------------------------------------------- профили

alter table profiles enable row level security;

-- Публичные данные организатора (имя, аватар, цвет карточки) нужны в карточке
-- события аутентифицированным; гостю профили не видны.
create policy profiles_read on profiles
  for select using (auth.uid() is not null);

create policy profiles_update_own on profiles
  for update using (id = auth.uid() or is_admin())
  with check (id = auth.uid() or is_admin());

alter table profile_directions enable row level security;

create policy profile_directions_own on profile_directions
  for all using (profile_id = auth.uid())
  with check (profile_id = auth.uid());

-- ------------------------------------------------------------------- события

alter table events enable row level security;

-- активные события видит кто угодно, в т.ч. гость
create policy events_read_public on events
  for select using (status = 'active');

-- автор видит свои события в любом статусе (бейдж «На модерации»)
create policy events_read_own on events
  for select using (created_by = auth.uid());

create policy events_read_admin on events
  for select using (is_admin());

-- вставка от своего имени; статус проставит триггер events_set_initial_status
create policy events_insert on events
  for insert with check (auth.uid() = created_by);

create policy events_update_own on events
  for update using (created_by = auth.uid() or is_admin())
  with check (created_by = auth.uid() or is_admin());

create policy events_delete_own on events
  for delete using (created_by = auth.uid() or is_admin());

alter table event_sessions enable row level security;

create policy event_sessions_read on event_sessions
  for select using (can_see_event(event_id));

create policy event_sessions_write on event_sessions
  for all using (
    exists (
      select 1 from events e
      where e.id = event_id and (e.created_by = auth.uid() or is_admin())
    )
  )
  with check (
    exists (
      select 1 from events e
      where e.id = event_id and (e.created_by = auth.uid() or is_admin())
    )
  );

-- ------------------------------------------------------------------ площадки

alter table venues enable row level security;

-- одобренные видят все (занятые показываем серыми, не скрываем — спек §10.7)
create policy venues_read_approved on venues
  for select using (moderation = 'approved');

create policy venues_read_own on venues
  for select using (created_by = auth.uid() or is_admin());

create policy venues_insert on venues
  for insert with check (auth.uid() = created_by);

create policy venues_update_own on venues
  for update using (created_by = auth.uid() or is_admin())
  with check (created_by = auth.uid() or is_admin());

create policy venues_delete_own on venues
  for delete using (created_by = auth.uid() or is_admin());

-- -------------------------------------------------------------- бронирования

alter table bookings enable row level security;

-- пользователь видит свои брони; организатор — брони на свои события
create policy bookings_read on bookings
  for select using (
    user_id = auth.uid()
    or exists (select 1 from events e where e.id = event_id and e.created_by = auth.uid())
    or is_admin()
  );

-- запись на событие идёт через RPC book_event (Фаза 3); прямой insert — только за себя
create policy bookings_insert_own on bookings
  for insert with check (user_id = auth.uid());

create policy bookings_update_own on bookings
  for update using (user_id = auth.uid() or is_admin())
  with check (user_id = auth.uid() or is_admin());

-- -------------------------------------------------------------------- отзывы

alter table reviews enable row level security;

create policy reviews_read on reviews
  for select using (true);

-- писать отзыв можно только посетив событие (booking.status = 'attended')
create policy reviews_insert on reviews
  for insert with check (
    user_id = auth.uid()
    and exists (
      select 1 from bookings b
      where b.user_id = auth.uid()
        and b.event_id = reviews.event_id
        and b.status = 'attended'
    )
  );

create policy reviews_update_own on reviews
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy reviews_delete_own on reviews
  for delete using (user_id = auth.uid() or is_admin());

-- --------------------------------------------------------------- уведомления

alter table notifications enable row level security;

create policy notifications_read_own on notifications
  for select using (user_id = auth.uid());

-- клиент только помечает прочитанным; создаёт уведомления сервер (service role)
create policy notifications_update_own on notifications
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ----------------------------------------------------------------- чат событий

alter table chat_messages enable row level security;

-- чат доступен записавшимся (активная бронь) и организатору события
create or replace function can_chat(p_event_id uuid)
returns boolean
language sql stable
security definer set search_path = public
as $$
  select exists (
    select 1 from bookings b
    where b.event_id = p_event_id and b.user_id = auth.uid()
      and b.status in ('active', 'attended')
  )
  or exists (
    select 1 from events e
    where e.id = p_event_id and e.created_by = auth.uid()
  )
  or is_admin();
$$;

create policy chat_messages_read on chat_messages
  for select using (can_chat(event_id));

create policy chat_messages_insert on chat_messages
  for insert with check (user_id = auth.uid() and can_chat(event_id));

-- ---------------------------------------------------- подписки на хореографов

alter table choreographer_subscriptions enable row level security;

create policy choreographer_subscriptions_own on choreographer_subscriptions
  for all using (user_id = auth.uid())
  with check (user_id = auth.uid());
