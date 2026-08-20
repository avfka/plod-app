-- Keep the closed-beta discovery and booking flow usable after the original
-- July fixture schedule has passed. Only system-seeded active events are
-- moved; organizer-created events and their dates are left untouched.
update public.event_sessions as session
set starts_at = session.starts_at + interval '49 days',
    ends_at = session.ends_at + interval '49 days'
from public.events as event
where event.id = session.event_id
  and event.created_by is null
  and event.status = 'active'
  and session.starts_at >= timestamptz '2026-07-01 00:00:00+00'
  and session.starts_at < timestamptz '2026-08-01 00:00:00+00';
