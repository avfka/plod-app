-- Keep legacy directions available for existing events, but remove them from
-- onboarding/filter pickers that only request active rows.
update public.dance_directions
set is_active = false,
    sort_order = case slug
      when 'bachata' then 91
      when 'kizomba' then 92
      when 'salsa' then 93
      else sort_order
    end
where slug in ('bachata', 'kizomba', 'salsa');

insert into public.dance_directions (name, slug, color_hex, is_active, sort_order)
values
  ('Hip-Hop', 'hiphop', '#36B7D7', true, 1),
  ('High Heels', 'high-heels', '#F05A7E', true, 2),
  ('Contemp', 'contemp', '#84C7AD', true, 3),
  ('Krump', 'krump', '#F04A32', true, 4),
  ('Frame Up', 'frame-up', '#9B6DFF', true, 5),
  ('Vogue', 'vogue', '#F1C453', true, 6),
  ('Pole Dance', 'pole-dance', '#3F7BEA', true, 7),
  ('Other', 'other', '#A8ADA6', true, 8)
on conflict (slug) do update
set name = excluded.name,
    color_hex = excluded.color_hex,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;

-- Expose only an aggregate count on the public choreographer record. Subscriber
-- identities remain protected by choreographer_subscriptions RLS.
alter table public.choreographers
add column follower_count integer not null default 0;

alter table public.choreographers
add constraint choreographers_follower_count_nonnegative
check (follower_count >= 0);

update public.choreographers as choreographer
set follower_count = (
  select count(*)::integer
  from public.choreographer_subscriptions as subscription
  where subscription.choreographer_name = choreographer.name
);

-- A user can subscribe before the choreographer gets a public profile. When
-- that profile is created later, initialize its aggregate from those existing
-- subscriptions instead of starting the visible count at zero.
create or replace function public.set_choreographer_follower_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.follower_count := (
    select count(*)::integer
    from public.choreographer_subscriptions as subscription
    where subscription.choreographer_name = new.name
  );

  return new;
end;
$$;

revoke execute on function public.set_choreographer_follower_count()
from public, anon, authenticated;

create trigger choreographers_set_follower_count
before insert or update of name on public.choreographers
for each row execute function public.set_choreographer_follower_count();

create or replace function public.sync_choreographer_follower_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    update public.choreographers
    set follower_count = follower_count + 1
    where name = new.choreographer_name;
    return new;
  end if;

  if tg_op = 'DELETE' then
    update public.choreographers
    set follower_count = greatest(0, follower_count - 1)
    where name = old.choreographer_name;
    return old;
  end if;

  if old.choreographer_name is distinct from new.choreographer_name then
    update public.choreographers
    set follower_count = greatest(0, follower_count - 1)
    where name = old.choreographer_name;

    update public.choreographers
    set follower_count = follower_count + 1
    where name = new.choreographer_name;
  end if;

  return new;
end;
$$;

revoke execute on function public.sync_choreographer_follower_count()
from public, anon, authenticated;

create trigger choreographer_subscriptions_sync_follower_count
after insert or update or delete on public.choreographer_subscriptions
for each row execute function public.sync_choreographer_follower_count();
