create or replace function private.guard_event_status_transition()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if new.status is distinct from old.status and not private.is_admin() then
    if old.created_by is distinct from auth.uid() or new.status <> 'cancelled' then
      raise exception 'STATUS_CHANGE_FORBIDDEN';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function private.guard_event_status_transition() from public, anon, authenticated;

create trigger events_guard_status_transition
before update of status on public.events
for each row execute function private.guard_event_status_transition();
