-- Дев-фикстуры Фазы 1: хореографы и события (Москва).
-- created_by = null (системные), поэтому вставляем с отключёнными триггерами,
-- иначе events_set_initial_status сбросит status в pending.
-- Применять под service role / postgres: supabase db reset подхватит только seed.sql,
-- этот файл — вручную (psql -f или SQL-редактор).

set local session_replication_role = replica;

insert into choreographers (id, name, slug, is_verified) values
  ('c0000000-0000-0000-0000-000000000001', 'Алексей Летучий', 'aleksey-letuchiy', true),
  ('c0000000-0000-0000-0000-000000000002', 'Мария Круг', 'maria-krug', true),
  ('c0000000-0000-0000-0000-000000000003', 'Диана Соул', 'diana-soul', false),
  ('c0000000-0000-0000-0000-000000000004', 'Тимур Брейк', 'timur-break', true),
  ('c0000000-0000-0000-0000-000000000005', 'Ольга Пламя', 'olga-plamya', false)
on conflict (slug) do nothing;

insert into events (id, title, event_type, choreographer_id, direction_id, price, is_free,
                    description, photo_url, contact_phone, age_restriction,
                    seats_total, seats_taken, status, card_color, marker_icon)
values
  ('e0000000-0000-0000-0000-000000000001', 'Хип-хоп интенсив: основа и грув', 'masterclass',
   'c0000000-0000-0000-0000-000000000001',
   (select id from dance_directions where slug = 'hiphop'),
   2500, false, 'Разбор базы, грув и работа с музыкой. Уровень: начинающие и продолжающие.',
   'https://picsum.photos/seed/hiphop1/800/600', '+7 900 111-22-33', '12+',
   20, 7, 'active', '#E8352A', 'star'),

  ('e0000000-0000-0000-0000-000000000002', 'Контемп: вечер импровизации', 'masterclass',
   'c0000000-0000-0000-0000-000000000002',
   (select id from dance_directions where slug = 'contemp'),
   null, true, 'Открытый бесплатный класс контемпорари. Приходите в удобной одежде.',
   'https://picsum.photos/seed/contemp1/800/600', '+7 900 222-33-44', '16+',
   30, 12, 'active', '#141210', 'circle'),

  ('e0000000-0000-0000-0000-000000000003', 'Бачата уикенд: соло и пары', 'masterclass',
   'c0000000-0000-0000-0000-000000000003',
   (select id from dance_directions where slug = 'bachata'),
   1800, false, 'Два часа бачаты: техника шага, вращения, работа в паре.',
   'https://picsum.photos/seed/bachata1/800/600', '+7 900 333-44-55', '18+',
   16, 16, 'active', '#5B5F66', 'heart'),

  ('e0000000-0000-0000-0000-000000000004', 'Кизомба-марафон: 3 дня по городу', 'masterclass',
   'c0000000-0000-0000-0000-000000000004',
   (select id from dance_directions where slug = 'kizomba'),
   5500, false, 'Марафон из трёх встреч в разных студиях города. Красная нитка соединяет точки.',
   'https://picsum.photos/seed/kizomba1/800/600', '+7 900 444-55-66', '18+',
   40, 18, 'active', '#8C7B5F', 'diamond'),

  ('e0000000-0000-0000-0000-000000000005', 'Чемпионат Москвы по сальсе', 'championship',
   'c0000000-0000-0000-0000-000000000005',
   (select id from dance_directions where slug = 'salsa'),
   800, false, 'Городской чемпионат: соло и пары, все уровни. Билет зрителя — 800 ₽.',
   'https://picsum.photos/seed/salsa1/800/600', '+7 900 555-66-77', null,
   null, 0, 'active', '#3E4A3D', 'square'),

  ('e0000000-0000-0000-0000-000000000006', 'Open Floor: свободная практика', 'masterclass',
   null,
   (select id from dance_directions where slug = 'other'),
   null, true, 'Свободный танцпол без преподавателя. Просто приходите танцевать.',
   'https://picsum.photos/seed/openfloor/800/600', null, null,
   null, 0, 'active', '#141210', 'circle');

insert into event_sessions (event_id, day_number, starts_at, ends_at, address, lat, lng) values
  -- одиночные события: сессии на ближайшие дни
  ('e0000000-0000-0000-0000-000000000001', 1,
   date_trunc('day', now()) + interval '1 day 19 hours',
   date_trunc('day', now()) + interval '1 day 21 hours',
   'Студия «Практика», ул. Правды, 24', 55.793, 37.581),
  ('e0000000-0000-0000-0000-000000000002', 1,
   date_trunc('day', now()) + interval '19 hours',
   date_trunc('day', now()) + interval '21 hours',
   'ДК «Рассвет», Столярный пер., 3к15', 55.766, 37.563),
  ('e0000000-0000-0000-0000-000000000003', 1,
   date_trunc('day', now()) + interval '2 days 18 hours',
   date_trunc('day', now()) + interval '2 days 20 hours',
   'Школа «Ритмо», Б. Новодмитровская, 36', 55.805, 37.585),
  -- «красная нитка»: 3 дня, 3 точки
  ('e0000000-0000-0000-0000-000000000004', 1,
   date_trunc('day', now()) + interval '3 days 19 hours',
   date_trunc('day', now()) + interval '3 days 22 hours',
   'Студия «Куба», Мясницкая, 15', 55.762, 37.633),
  ('e0000000-0000-0000-0000-000000000004', 2,
   date_trunc('day', now()) + interval '4 days 19 hours',
   date_trunc('day', now()) + interval '4 days 22 hours',
   'Лофт «Дежавю», Артплей, Ниж. Сыромятническая, 10', 55.752, 37.665),
  ('e0000000-0000-0000-0000-000000000004', 3,
   date_trunc('day', now()) + interval '5 days 12 hours',
   date_trunc('day', now()) + interval '5 days 18 hours',
   'Флакон, Б. Новодмитровская, 36с2', 55.807, 37.583),
  -- чемпионат
  ('e0000000-0000-0000-0000-000000000005', 1,
   date_trunc('day', now()) + interval '6 days 11 hours',
   date_trunc('day', now()) + interval '6 days 20 hours',
   'КЦ «Меридиан», Профсоюзная, 61', 55.663, 37.553),
  -- open floor сегодня вечером
  ('e0000000-0000-0000-0000-000000000006', 1,
   date_trunc('day', now()) + interval '20 hours',
   date_trunc('day', now()) + interval '23 hours',
   'Парк Горького, Пушкинская наб.', 55.727, 37.601);
