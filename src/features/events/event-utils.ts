import type { EventFilters } from '@/store/filters';
import type { Tables } from '@/types/database';

export type EventWithRelations = Tables<'events'> & {
  event_sessions: (Tables<'event_sessions'> & { city: Tables<'cities'> | null })[];
  direction: Tables<'dance_directions'> | null;
  choreographer: Tables<'choreographers'> | null;
};

function sameLocalDay(iso: string, ymd: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}` === ymd;
}

export function applyEventFilters(
  events: EventWithRelations[],
  filters: EventFilters,
  favoriteChoreographerId?: string | null,
): EventWithRelations[] {
  const filtered = events.filter((event) => {
    if (filters.cityId && !event.event_sessions.some((session) => session.city_id === filters.cityId)) return false;
    if (filters.types.length > 0 && !filters.types.includes(event.event_type)) return false;
    if (filters.freeOnly && !event.is_free) return false;
    if (
      filters.directionIds.length > 0 &&
      (!event.direction_id || !filters.directionIds.includes(event.direction_id))
    ) return false;
    if (filters.choreographerId && event.choreographer_id !== filters.choreographerId) return false;
    if (
      filters.date &&
      !event.event_sessions.some((session) => sameLocalDay(session.starts_at, filters.date!))
    ) return false;
    return true;
  });

  if (favoriteChoreographerId) {
    filtered.sort(
      (a, b) =>
        Number(b.choreographer_id === favoriteChoreographerId) -
        Number(a.choreographer_id === favoriteChoreographerId),
    );
  }
  return filtered;
}

export function searchEvents(events: EventWithRelations[], query: string) {
  const needle = query.trim().toLocaleLowerCase('ru-RU');
  if (!needle) return events;

  return events.filter((event) => {
    const searchable = [
      event.title,
      event.description,
      event.direction?.name,
      event.choreographer?.name,
      ...event.event_sessions.map((session) => session.city?.name),
      ...event.event_sessions.map((session) => session.address),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ru-RU');
    return searchable.includes(needle);
  });
}

/** Ближайшая (или первая) сессия события — для строки даты в карточке. */
export function firstSession(event: EventWithRelations, sessionId?: string | null) {
  const sessions = [...event.event_sessions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  return (
    sessions.find((session) => session.id === sessionId) ??
    sessions.find(
      (session) => new Date(session.ends_at ?? session.starts_at).getTime() > Date.now(),
    ) ?? sessions[0]
  );
}
