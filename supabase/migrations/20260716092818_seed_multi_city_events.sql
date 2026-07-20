-- Multi-city beta fixtures. Fixed ids make the seed safe to replay.
-- System-owned fixtures bypass only the initial-status trigger; RLS remains enabled.
alter table public.events disable trigger events_before_insert_status;

insert into public.events (
  id, title, event_type, choreographer_id, direction_id, price, is_free,
  description, photo_url, contact_phone, age_restriction,
  seats_total, seats_taken, status, card_color, marker_icon
) values
  ('e1000000-0000-0000-0000-000000000101', 'Петербургский грув: от дворов до сцены', 'masterclass',
   'c0000000-0000-0000-0000-000000000001', (select id from public.dance_directions where slug = 'hiphop'),
   2400, false, 'Две связанные встречи о груве, импровизации и городском ритме Петербурга.',
   'https://picsum.photos/seed/spb-groove/800/600', '+7 921 410-12-12', '14+', 24, 8, 'active', '#E8352A', 'star'),
  ('e1000000-0000-0000-0000-000000000102', 'Neva Salsa Cup', 'championship',
   'c0000000-0000-0000-0000-000000000005', (select id from public.dance_directions where slug = 'salsa'),
   null, true, 'Открытый городской чемпионат по сальсе. Вход зрителей бесплатный.',
   'https://picsum.photos/seed/neva-salsa/800/600', '+7 921 520-22-22', '12+', 160, 67, 'active', '#141210', 'square'),
  ('e1000000-0000-0000-0000-000000000103', 'Контемп у Кремля: тело и пространство', 'masterclass',
   'c0000000-0000-0000-0000-000000000002', (select id from public.dance_directions where slug = 'contemp'),
   1700, false, 'Мягкая техника, работа с весом и импровизация для любого уровня.',
   'https://picsum.photos/seed/kazan-contemp/800/600', '+7 843 610-33-33', '16+', 20, 6, 'active', '#8C7B5F', 'circle'),
  ('e1000000-0000-0000-0000-000000000104', 'Казанская бачата: две стороны реки', 'masterclass',
   'c0000000-0000-0000-0000-000000000003', (select id from public.dance_directions where slug = 'bachata'),
   3200, false, 'Техника в студии и вечерняя практика на набережной — две точки одной красной нити.',
   'https://picsum.photos/seed/kazan-bachata/800/600', '+7 843 720-44-44', '18+', 30, 13, 'active', '#5B5F66', 'heart'),
  ('e1000000-0000-0000-0000-000000000105', 'Ural Street Dance Battle', 'championship',
   'c0000000-0000-0000-0000-000000000006', (select id from public.dance_directions where slug = 'hiphop'),
   900, false, 'Баттлы 1×1 и командные выходы. Регистрация участников на месте.',
   'https://picsum.photos/seed/ural-battle/800/600', '+7 343 810-55-55', '14+', 200, 91, 'active', '#3E4A3D', 'diamond'),
  ('e1000000-0000-0000-0000-000000000106', 'Open Floor на Урале', 'masterclass',
   null, (select id from public.dance_directions where slug = 'other'),
   null, true, 'Свободная практика без преподавателя: музыка, пространство и обмен движением.',
   'https://picsum.photos/seed/ural-open-floor/800/600', null, '16+', 45, 17, 'active', '#141210', 'circle'),
  ('e1000000-0000-0000-0000-000000000107', 'Сальса вдоль моря: маршрут из двух вечеров', 'masterclass',
   'c0000000-0000-0000-0000-000000000005', (select id from public.dance_directions where slug = 'salsa'),
   2900, false, 'Два класса на разных площадках побережья: база, партнёрство и социальная практика.',
   'https://picsum.photos/seed/sochi-salsa/800/600', '+7 862 910-66-66', '18+', 36, 14, 'active', '#E8352A', 'star'),
  ('e1000000-0000-0000-0000-000000000108', 'Контемп на рассвете', 'masterclass',
   'c0000000-0000-0000-0000-000000000007', (select id from public.dance_directions where slug = 'contemp'),
   null, true, 'Бесплатная утренняя практика у моря. Подходит начинающим.',
   'https://picsum.photos/seed/sochi-sunrise/800/600', null, '16+', 40, 19, 'active', '#8C7B5F', 'circle')
on conflict (id) do nothing;

alter table public.events enable trigger events_before_insert_status;

insert into public.event_sessions (
  id, event_id, city_id, day_number, starts_at, ends_at, address, lat, lng
) values
  ('d1000000-0000-0000-0000-000000000101', 'e1000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000002', 1,
   date_trunc('day', now()) + interval '2 days 19 hours', date_trunc('day', now()) + interval '2 days 21 hours',
   'Танцпол «Севкабель», Кожевенная линия, 40', 59.9249, 30.2416),
  ('d1000000-0000-0000-0000-000000000102', 'e1000000-0000-0000-0000-000000000101', 'a0000000-0000-0000-0000-000000000002', 2,
   date_trunc('day', now()) + interval '4 days 19 hours', date_trunc('day', now()) + interval '4 days 21 hours',
   'Лофт «Этажи», Лиговский пр., 74', 59.9165, 30.3548),
  ('d1000000-0000-0000-0000-000000000103', 'e1000000-0000-0000-0000-000000000102', 'a0000000-0000-0000-0000-000000000002', 1,
   date_trunc('day', now()) + interval '7 days 12 hours', date_trunc('day', now()) + interval '7 days 20 hours',
   'Ленполиграфмаш, наб. Карповки, 5', 59.9687, 30.3160),
  ('d1000000-0000-0000-0000-000000000104', 'e1000000-0000-0000-0000-000000000103', 'a0000000-0000-0000-0000-000000000003', 1,
   date_trunc('day', now()) + interval '3 days 18 hours', date_trunc('day', now()) + interval '3 days 20 hours',
   'Центр современной культуры «Смена», Бурхана Шахиди, 7', 55.7833, 49.1117),
  ('d1000000-0000-0000-0000-000000000105', 'e1000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000003', 1,
   date_trunc('day', now()) + interval '5 days 19 hours', date_trunc('day', now()) + interval '5 days 21 hours',
   'Студия «Соль», ул. Пушкина, 17', 55.7908, 49.1221),
  ('d1000000-0000-0000-0000-000000000106', 'e1000000-0000-0000-0000-000000000104', 'a0000000-0000-0000-0000-000000000003', 2,
   date_trunc('day', now()) + interval '6 days 20 hours', date_trunc('day', now()) + interval '6 days 22 hours',
   'Набережная озера Кабан, театр Камала', 55.7799, 49.1173),
  ('d1000000-0000-0000-0000-000000000107', 'e1000000-0000-0000-0000-000000000105', 'a0000000-0000-0000-0000-000000000004', 1,
   date_trunc('day', now()) + interval '8 days 13 hours', date_trunc('day', now()) + interval '8 days 21 hours',
   'Ельцин Центр, ул. Бориса Ельцина, 3', 56.8440, 60.5914),
  ('d1000000-0000-0000-0000-000000000108', 'e1000000-0000-0000-0000-000000000106', 'a0000000-0000-0000-0000-000000000004', 1,
   date_trunc('day', now()) + interval '4 days 20 hours', date_trunc('day', now()) + interval '4 days 23 hours',
   'Синара Центр, Верх-Исетский бульвар, 15/4', 56.8384, 60.5842),
  ('d1000000-0000-0000-0000-000000000109', 'e1000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000005', 1,
   date_trunc('day', now()) + interval '2 days 19 hours', date_trunc('day', now()) + interval '2 days 21 hours',
   'Морской вокзал, ул. Войкова, 1', 43.5808, 39.7185),
  ('d1000000-0000-0000-0000-000000000110', 'e1000000-0000-0000-0000-000000000107', 'a0000000-0000-0000-0000-000000000005', 2,
   date_trunc('day', now()) + interval '5 days 19 hours', date_trunc('day', now()) + interval '5 days 22 hours',
   'Парк «Ривьера», ул. Егорова, 1', 43.5930, 39.7155),
  ('d1000000-0000-0000-0000-000000000111', 'e1000000-0000-0000-0000-000000000108', 'a0000000-0000-0000-0000-000000000005', 1,
   date_trunc('day', now()) + interval '3 days 7 hours', date_trunc('day', now()) + interval '3 days 9 hours',
   'Пляж «Маяк», Приморская ул.', 43.5757, 39.7251)
on conflict (id) do nothing;
