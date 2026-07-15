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

-- Дополнительная тестовая выборка: все направления, цены, типы и ещё одна красная нитка.
insert into choreographers (id, name, slug, is_verified) values
  ('c0000000-0000-0000-0000-000000000006', 'Саша Волна', 'sasha-volna', true),
  ('c0000000-0000-0000-0000-000000000007', 'Ника Рэй', 'nika-ray', true),
  ('c0000000-0000-0000-0000-000000000008', 'Макс Тишина', 'maks-tishina', false)
on conflict (slug) do nothing;

insert into events (id, title, event_type, choreographer_id, direction_id, price, is_free,
                    description, photo_url, contact_phone, age_restriction,
                    seats_total, seats_taken, status, card_color, marker_icon)
values
  ('e0000000-0000-0000-0000-000000000007', 'Popping: музыкальность и акценты', 'masterclass',
   'c0000000-0000-0000-0000-000000000006',
   (select id from dance_directions where slug = 'hiphop'),
   2200, false, 'Практический класс по popping: хиты, волны и музыкальные акценты.',
   'https://picsum.photos/seed/popping/800/600', '+7 900 777-10-10', '14+',
   24, 9, 'active', '#E8352A', 'circle'),
  ('e0000000-0000-0000-0000-000000000008', 'Контемп для начинающих: мягкое тело', 'masterclass',
   'c0000000-0000-0000-0000-000000000007',
   (select id from dance_directions where slug = 'contemp'),
   1500, false, 'Безопасное знакомство с полом, импульсом и свободным движением.',
   'https://picsum.photos/seed/softcontemp/800/600', '+7 900 888-20-20', '16+',
   18, 4, 'active', '#8C7B5F', 'heart'),
  ('e0000000-0000-0000-0000-000000000009', 'Бачата на закате', 'masterclass',
   'c0000000-0000-0000-0000-000000000003',
   (select id from dance_directions where slug = 'bachata'),
   null, true, 'Открытый класс на набережной. Партнёр и опыт не обязательны.',
   'https://picsum.photos/seed/sunsetbachata/800/600', null, '18+',
   50, 21, 'active', '#3E4A3D', 'diamond'),
  ('e0000000-0000-0000-0000-000000000010', 'Salsa Rookie Cup', 'championship',
   'c0000000-0000-0000-0000-000000000005',
   (select id from dance_directions where slug = 'salsa'),
   null, true, 'Любительский турнир для первого соревновательного опыта.',
   'https://picsum.photos/seed/rookiecup/800/600', '+7 900 101-30-30', null,
   120, 46, 'active', '#141210', 'star'),
  ('e0000000-0000-0000-0000-000000000011', 'Кизомба: город как сцена', 'masterclass',
   'c0000000-0000-0000-0000-000000000004',
   (select id from dance_directions where slug = 'kizomba'),
   3900, false, 'Две связанные встречи: техника в студии и практика в городском пространстве.',
   'https://picsum.photos/seed/citykizomba/800/600', '+7 900 111-40-40', '18+',
   28, 11, 'active', '#5B5F66', 'square'),
  ('e0000000-0000-0000-0000-000000000012', 'Лаборатория движения: без жанров', 'masterclass',
   'c0000000-0000-0000-0000-000000000008',
   (select id from dance_directions where slug = 'other'),
   1200, false, 'Исследуем внимание, пространство и собственный танцевальный язык.',
   'https://picsum.photos/seed/movementlab/800/600', '+7 900 121-50-50', '16+',
   15, 3, 'active', '#E8352A', 'circle')
on conflict (id) do nothing;

insert into event_sessions (id, event_id, day_number, starts_at, ends_at, address, lat, lng) values
  ('d0000000-0000-0000-0000-000000000007', 'e0000000-0000-0000-0000-000000000007', 1,
   date_trunc('day', now()) + interval '7 days 19 hours',
   date_trunc('day', now()) + interval '7 days 21 hours',
   'Дом культур, Сретенка, 25', 55.770, 37.631),
  ('d0000000-0000-0000-0000-000000000008', 'e0000000-0000-0000-0000-000000000008', 1,
   date_trunc('day', now()) + interval '8 days 18 hours',
   date_trunc('day', now()) + interval '8 days 20 hours',
   'Центр Вознесенского, Б. Ордынка, 46с3', 55.737, 37.624),
  ('d0000000-0000-0000-0000-000000000009', 'e0000000-0000-0000-0000-000000000009', 1,
   date_trunc('day', now()) + interval '9 days 20 hours',
   date_trunc('day', now()) + interval '9 days 22 hours',
   'Музеон, Крымская наб.', 55.735, 37.605),
  ('d0000000-0000-0000-0000-000000000010', 'e0000000-0000-0000-0000-000000000010', 1,
   date_trunc('day', now()) + interval '10 days 12 hours',
   date_trunc('day', now()) + interval '10 days 19 hours',
   'Дворец спорта «Динамо», ул. Лавочкина, 32', 55.865, 37.490),
  ('d0000000-0000-0000-0000-000000000011', 'e0000000-0000-0000-0000-000000000011', 1,
   date_trunc('day', now()) + interval '11 days 19 hours',
   date_trunc('day', now()) + interval '11 days 21 hours',
   'Студия «Смена», Таганская, 40с6', 55.738, 37.666),
  ('d0000000-0000-0000-0000-000000000012', 'e0000000-0000-0000-0000-000000000011', 2,
   date_trunc('day', now()) + interval '12 days 19 hours',
   date_trunc('day', now()) + interval '12 days 22 hours',
   'Хлебозавод, Новодмитровская, 1с17', 55.804, 37.586),
  ('d0000000-0000-0000-0000-000000000013', 'e0000000-0000-0000-0000-000000000012', 1,
   date_trunc('day', now()) + interval '13 days 19 hours',
   date_trunc('day', now()) + interval '13 days 21 hours',
   'Электротеатр Станиславский, Тверская, 23', 55.768, 37.601)
on conflict (id) do nothing;
