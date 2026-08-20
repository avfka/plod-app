-- Танц-Карта: справочник направлений с цветами маркеров (спек §4.2)

insert into dance_directions (name, slug, color_hex, is_active, sort_order) values
  ('Hip-Hop',    'hiphop',     '#36B7D7', true, 1),
  ('High Heels', 'high-heels', '#F05A7E', true, 2),
  ('Contemp',    'contemp',    '#84C7AD', true, 3),
  ('Krump',      'krump',      '#F04A32', true, 4),
  ('Frame Up',   'frame-up',   '#9B6DFF', true, 5),
  ('Vogue',      'vogue',      '#F1C453', true, 6),
  ('Pole Dance', 'pole-dance', '#3F7BEA', true, 7),
  ('Other',      'other',      '#A8ADA6', true, 8),
  ('Бачата',     'bachata',    '#FF6B6B', false, 91),
  ('Кизомба',    'kizomba',    '#6C63FF', false, 92),
  ('Сальса',     'salsa',      '#FFA94D', false, 93)
on conflict (slug) do update
set name = excluded.name,
    color_hex = excluded.color_hex,
    is_active = excluded.is_active,
    sort_order = excluded.sort_order;
