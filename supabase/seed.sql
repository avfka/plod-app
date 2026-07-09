-- Танц-Карта: справочник направлений с цветами маркеров (спек §4.2)

insert into dance_directions (name, slug, color_hex, sort_order) values
  ('Хип-хоп',  'hiphop',  '#45B7D1', 1),
  ('Контемп',  'contemp', '#96CEB4', 2),
  ('Бачата',   'bachata', '#FF6B6B', 3),
  ('Кизомба',  'kizomba', '#6C63FF', 4),
  ('Сальса',   'salsa',   '#FFA94D', 5),
  ('Другое',   'other',   '#ADB5BD', 6)
on conflict (slug) do nothing;
