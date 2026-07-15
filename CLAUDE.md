# PLOD («запретный плод»)

Кроссплатформенное мобильное приложение-карта для танцоров (МК и чемпионаты).
Концепт названия: запретный плод сладок; красная нитка ведёт к нему на карте.

Актуальный статус, границы beta и порядок реализации: `docs/IMPLEMENTATION_PLAN.md`.

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

## Текущий приоритет

Сначала закрыть R0/R1 из `docs/IMPLEMENTATION_PLAN.md`: auth, schema/security drift,
CI и надёжный discovery → session booking flow. Не начинать площадки, чат и push,
пока release gate закрытой web beta не пройден.
