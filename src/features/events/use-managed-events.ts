import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Database, Json, Tables } from '@/types/database';

type EventDraft = {
  title: string;
  event_type: Database['public']['Enums']['event_type'];
  direction_id: string | null;
  choreographer_id: string | null;
  description: string;
  is_free: boolean;
  price: number | null;
  seats_total: number | null;
  contact_phone: string;
  age_restriction: string;
  photo_url: string | null;
};

export type SessionDraft = {
  city_id?: string;
  day_number: number;
  starts_at: string;
  ends_at: string | null;
  address: string;
  lat: number;
  lng: number;
};

export type ManagedEvent = Tables<'events'> & {
  event_sessions: (Tables<'event_sessions'> & { city: Tables<'cities'> | null })[];
  direction: Tables<'dance_directions'> | null;
};

const MANAGED_SELECT = '*, event_sessions(*, city:cities(*)), direction:dance_directions(*)';

export function useMyEvents(userId?: string) {
  return useQuery({
    queryKey: ['events', 'mine', userId],
    enabled: !!userId,
    queryFn: async (): Promise<ManagedEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(MANAGED_SELECT)
        .eq('created_by', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as ManagedEvent[];
    },
  });
}

export function usePendingEvents(enabled: boolean) {
  return useQuery({
    queryKey: ['events', 'moderation'],
    enabled,
    queryFn: async (): Promise<ManagedEvent[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(MANAGED_SELECT)
        .in('status', ['pending', 'rejected'])
        .order('created_at');
      if (error) throw error;
      return (data ?? []) as ManagedEvent[];
    },
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ event, sessions }: { event: EventDraft; sessions: SessionDraft[] }) => {
      const { data, error } = await supabase.rpc('create_event', {
        p_event: event as unknown as Json,
        p_sessions: sessions as unknown as Json,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export function useModerateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ eventId, decision, reason }: {
      eventId: string;
      decision: 'active' | 'rejected';
      reason?: string;
    }) => {
      const { data, error } = await supabase.rpc('moderate_event', {
        p_event_id: eventId,
        p_decision: decision,
        p_reason: reason,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['events'] });
    },
  });
}

export async function uploadEventPhoto(userId: string, uri: string, mimeType?: string | null) {
  const response = await fetch(uri);
  const body = await response.arrayBuffer();
  const type = mimeType ?? 'image/jpeg';
  const extension = type === 'image/png' ? 'png' : type === 'image/webp' ? 'webp' : 'jpg';
  const path = `${userId}/${crypto.randomUUID()}.${extension}`;
  const { error } = await supabase.storage.from('event-photos').upload(path, body, {
    contentType: type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from('event-photos').getPublicUrl(path).data.publicUrl;
}
