import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSession } from '@/features/auth/use-session';
import { supabase } from '@/lib/supabase';

import type {
  RecommendationBehavior,
  RecommendationSignalType,
} from './recommendation-engine';

type RelatedEvent = {
  choreographer_id: string | null;
  direction_id: string | null;
};

type SignalRow = {
  event_id: string;
  event: RelatedEvent | null;
  signal_type: RecommendationSignalType;
};

type BookingRow = {
  event_id: string;
  event: RelatedEvent | null;
  status: 'active' | 'attended' | 'cancelled';
};

export type LearnedRecommendationMemory = {
  behavior: RecommendationBehavior[];
  directionIds: string[];
  followedChoreographerNames: string[];
};

export function useRecommendationMemory() {
  const { session } = useSession();
  const userId = session?.user.id;

  return useQuery({
    queryKey: ['recommendation-memory', userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async (): Promise<LearnedRecommendationMemory> => {
      const recentSince = new Date(Date.now() - 90 * 86_400_000).toISOString();
      const [directionsResult, subscriptionsResult, signalsResult, bookingsResult] =
        await Promise.all([
          supabase
            .from('profile_directions')
            .select('direction_id')
            .eq('profile_id', userId!),
          supabase
            .from('choreographer_subscriptions')
            .select('choreographer_name')
            .eq('user_id', userId!),
          supabase
            .from('event_interest_signals')
            .select('event_id, signal_type, event:events(direction_id, choreographer_id)')
            .eq('user_id', userId!)
            .gte('created_at', recentSince),
          supabase
            .from('bookings')
            .select('event_id, status, event:events(direction_id, choreographer_id)')
            .eq('user_id', userId!)
            .in('status', ['active', 'attended']),
        ]);

      const error =
        directionsResult.error ??
        subscriptionsResult.error ??
        signalsResult.error ??
        bookingsResult.error;
      if (error) throw error;

      const signals = (signalsResult.data ?? []) as unknown as SignalRow[];
      const bookings = (bookingsResult.data ?? []) as unknown as BookingRow[];
      const behavior: RecommendationBehavior[] = [
        ...signals.map((signal) => ({
          choreographerId: signal.event?.choreographer_id ?? null,
          directionId: signal.event?.direction_id ?? null,
          eventId: signal.event_id,
          signalType: signal.signal_type,
        })),
        ...bookings.map((booking) => ({
          choreographerId: booking.event?.choreographer_id ?? null,
          directionId: booking.event?.direction_id ?? null,
          eventId: booking.event_id,
          signalType: 'booking' as const,
        })),
      ];

      return {
        behavior,
        directionIds: (directionsResult.data ?? []).map((item) => item.direction_id),
        followedChoreographerNames: (subscriptionsResult.data ?? []).map(
          (item) => item.choreographer_name,
        ),
      };
    },
  });
}

export function useRecordRecommendationSignal() {
  const { session } = useSession();

  return useMutation({
    mutationFn: async ({
      eventId,
      signalType,
    }: {
      eventId: string;
      signalType: RecommendationSignalType;
    }) => {
      const userId = session?.user.id;
      if (!userId) return;

      const occurredOn = new Date().toISOString().slice(0, 10);
      const { error } = await supabase.from('event_interest_signals').upsert(
        {
          event_id: eventId,
          occurred_on: occurredOn,
          signal_type: signalType,
          user_id: userId,
        },
        {
          ignoreDuplicates: true,
          onConflict: 'user_id,event_id,signal_type,occurred_on',
        },
      );
      if (error) throw error;
    },
  });
}

export function useClearRecommendationHistory() {
  const { session } = useSession();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const userId = session?.user.id;
      if (!userId) return;
      const { error } = await supabase
        .from('event_interest_signals')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['recommendation-memory'] });
    },
  });
}
