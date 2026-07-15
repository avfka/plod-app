import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { EventWithRelations } from './event-utils';

export { applyEventFilters, firstSession, searchEvents } from './event-utils';
export type { EventWithRelations } from './event-utils';

const EVENT_SELECT =
  '*, event_sessions(*, city:cities(*)), direction:dance_directions(*), choreographer:choreographers(*)';

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
