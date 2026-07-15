# PLOD — запретный плод (plod-app)

Кроссплатформенное мобильное приложение-карта для танцоров: мастер-классы и чемпионаты на карте города, запись на события, площадки для аренды. Запретный плод сладок — следуй за красной ниткой.

Тестовая web-версия: https://plod-dancers-app.vercel.app

Технический спек — см. `CLAUDE.md`, актуальный план —
[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md), схема — `supabase/migrations/`.

## Стек

- **Клиент:** Expo (React Native) + TypeScript, Expo Router, NativeWind, react-query, zustand
- **Бэкенд:** Supabase (Postgres + RLS, Auth, Storage, Realtime, Edge Functions)

## Запуск

```bash
npm install
cp .env.example .env   # заполнить ключи Supabase
npm start              # Expo Dev Server
```

## База данных

Миграции лежат в `supabase/migrations/`, сид справочника направлений — в `supabase/seed.sql`. С установленным [Supabase CLI](https://supabase.com/docs/guides/local-development):

```bash
supabase init          # один раз, создаст supabase/config.toml
supabase start         # локальный стек
supabase db reset      # применит миграции + seed.sql
npm run gen:types      # перегенерирует src/types/database.ts
```

## Структура

```
src/
├─ app/            # Expo Router: (tabs)/ — Карта · Список · Площадки · Мои записи · Профиль
├─ components/     # ui/ — Button, Card, FilterChip
├─ features/       # доменная логика по фичам (react-query хуки)
├─ hooks/          # use-theme, use-color-scheme
├─ lib/            # supabase-клиент
├─ store/          # zustand
├─ theme/          # дизайн-токены (тёмная/светлая, #6C63FF)
└─ types/          # типы схемы БД
supabase/
├─ migrations/     # enums → таблицы → RLS
├─ functions/      # Edge Functions (Фазы 3–4)
└─ seed.sql        # направления танца с цветами маркеров
```

## Статус

Готовы discovery, auth/email + гостевой режим, опросник, нативная карта,
красная нитка мультисессий, досье события, выбор сессии, booking RPC,
«Мои записи», поиск и фильтры. Web beta опубликована на Vercel.

Ближайший этап: release foundation и закрытая web beta. Создание событий,
нативная beta, push/chat/reviews и площадки идут отдельными релизами по
[`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md).

Для карты на устройстве нужны ключи Google Maps (iOS/Android) в app.json.
