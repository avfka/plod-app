import { useQuery } from '@tanstack/react-query';

import type { EventFilters } from '@/store/filters';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type EventWithRelations = Tables<'events'> & {
  event_sessions: Tables<'event_sessions'>[];
  direction: Tables<'dance_directions'> | null;
  choreographer: Tables<'choreographers'> | null;
};

const EVENT_SELECT =
  '*, event_sessions(*), direction:dance_directions(*), choreographer:choreographers(*)';

async function fetchActiveEvents(): Promise<EventWithRelations[]> {
  const { data, error } = await supabase
    .from('events')
    .select(EVENT_SELECT)
    .eq('status', 'active')
    .order('created_at', { ascending: false });
  if (error) throw error;
  const now = Date.now();
  return ((data ?? []) as EventWithRelations[]).filter((event) =>
    event.event_sessions.some(
      (session) => new Date(session.ends_at ?? session.starts_at).getTime() > now,
    ),
  );
}

/** Активные события целиком (датасет небольшой) — фильтры применяются на клиенте. */
export function useActiveEvents() {
  return useQuery({ queryKey: ['events', 'active'], queryFn: fetchActiveEvents });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ['events', id],
    enabled: !!id,
    queryFn: async (): Promise<EventWithRelations> => {
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as EventWithRelations;
    },
  });
}

function sameLocalDay(iso: string, ymd: string) {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}` === ymd;
}

export function applyEventFilters(
  events: EventWithRelations[],
  f: EventFilters,
  favoriteChoreographerId?: string | null,
): EventWithRelations[] {
  const filtered = events.filter((e) => {
    if (f.types.length > 0 && !f.types.includes(e.event_type)) return false;
    if (f.freeOnly && !e.is_free) return false;
    if (f.directionId && e.direction_id !== f.directionId) return false;
    if (f.choreographerId && e.choreographer_id !== f.choreographerId) return false;
    if (f.date && !e.event_sessions.some((s) => sameLocalDay(s.starts_at, f.date!))) return false;
    return true;
  });
  // события любимого хореографа — первыми (спек §7.1)
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
      ...event.event_sessions.map((session) => session.address),
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('ru-RU');
    return searchable.includes(needle);
  });
}

/** Ближайшая (или первая) сессия события — для строки даты в карточке. */
export function firstSession(e: EventWithRelations) {
  const sessions = [...e.event_sessions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  return (
    sessions.find(
      (session) => new Date(session.ends_at ?? session.starts_at).getTime() > Date.now(),
    ) ?? sessions[0]
  );
}
