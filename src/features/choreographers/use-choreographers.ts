import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';
import type { EventWithRelations } from '@/features/events/event-utils';

const EVENT_SELECT =
  '*, event_sessions(*, city:cities(*)), direction:dance_directions(*), choreographer:choreographers(*)';

export function useChoreographers() {
  return useQuery({
    queryKey: ['choreographers'],
    queryFn: async (): Promise<Tables<'choreographers'>[]> => {
      const { data, error } = await supabase.from('choreographers').select('*').order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useChoreographer(id: string | undefined) {
  return useQuery({
    queryKey: ['choreographers', id],
    enabled: !!id,
    queryFn: async (): Promise<Tables<'choreographers'>> => {
      const { data, error } = await supabase
        .from('choreographers')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data;
    },
  });
}

export function useChoreographerEvents(id: string | undefined) {
  return useQuery({
    queryKey: ['events', 'choreographer', id],
    enabled: !!id,
    queryFn: async (): Promise<EventWithRelations[]> => {
      const { data, error } = await supabase
        .from('events')
        .select(EVENT_SELECT)
        .eq('status', 'active')
        .eq('choreographer_id', id!);
      if (error) throw error;
      return (data ?? []) as EventWithRelations[];
    },
  });
}

export function useChoreographerSubscriptions(userId?: string) {
  return useQuery({
    queryKey: ['choreographer-subscriptions', userId],
    enabled: !!userId,
    queryFn: async (): Promise<Tables<'choreographer_subscriptions'>[]> => {
      const { data, error } = await supabase
        .from('choreographer_subscriptions')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useToggleChoreographerSubscription(userId?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ name, subscribed }: { name: string; subscribed: boolean }) => {
      if (!userId) throw new Error('AUTH_REQUIRED');

      if (subscribed) {
        const { error } = await supabase
          .from('choreographer_subscriptions')
          .delete()
          .eq('user_id', userId)
          .eq('choreographer_name', name);
        if (error) throw error;
        return;
      }

      const { error } = await supabase.from('choreographer_subscriptions').upsert(
        { user_id: userId, choreographer_name: name },
        { onConflict: 'user_id,choreographer_name' },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['choreographer-subscriptions', userId] });
    },
  });
}
