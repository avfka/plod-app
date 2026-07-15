-- Триггерные функции не должны вызываться клиентами через PostgREST RPC.
-- Триггеры при этом продолжают работать: EXECUTE проверяется при создании
-- триггера, а не при срабатывании.
-- Хелперы is_admin/is_organizer/can_see_event/can_chat остаются доступными
-- anon/authenticated намеренно — их вызывают RLS-политики под ролью клиента.

revoke execute on function handle_new_user() from public, anon, authenticated;
revoke execute on function events_set_initial_status() from public, anon, authenticated;
