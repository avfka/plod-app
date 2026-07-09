# Танц-Карта

Кроссплатформенное мобильное приложение-карта для танцоров (МК и чемпионаты).

## Стек
- Expo (React Native) + TypeScript + Expo Router + NativeWind
- Supabase: Postgres + Auth (phone/email) + Storage + Realtime + Edge Functions
- react-native-maps (Google), react-query, zustand, MMKV, Expo Notifications

## Правила
- Идентификаторы БД/кода — английский snake_case.
- Все запросы к данным — через react-query хуки в src/features/*.
- Доступ к БД защищён RLS; операции с гонками (запись на МК) — только через RPC.
- Цвета направлений берём из таблицы dance_directions, не хардкодим.
- UI: арт-направление «детективное досье» — чб (бумага #FAF7F2 / чернила
  #141210) + сигнальный красный #E8352A, моноширинный шрифт для меток и
  заголовков, почти острые углы, тонкие рамки. Тёмная тема = «CCTV night».
  Токены в src/theme; карта — чб-стиль (src/theme/map-style.ts), на ней
  цветные маркеры направлений и красная нитка мультисессий.

## Модель данных
См. supabase/migrations. Ключевое: события = events + event_sessions
(сессии = точки на карте; ≥2 сессии = «красная нитка»).

## Не забыть
- book_event/cancel_booking — атомарные RPC (места, правило 24ч).
- Отзыв только при booking.status='attended'.
- Гость — read-only (только status='active').

## Команды
- `npm run typecheck` — проверка типов
- `npm run gen:types` — перегенерация src/types/database.ts из локальной Supabase-схемы
