import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { EventWithRelations } from '@/features/events/use-events';
import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export type BookingWithEvent = Tables<'bookings'> & { event: EventWithRelations };

const bookingSelect =
  '*, event:events(*, event_sessions(*), direction:dance_directions(*), choreographer:choreographers(*))';

export function useBookings(enabled = true) {
  return useQuery({
    queryKey: ['bookings'],
    enabled,
    queryFn: async (): Promise<BookingWithEvent[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select(bookingSelect)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as BookingWithEvent[];
    },
  });
}

export function useEventBooking(eventId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: ['booking', eventId],
    enabled: enabled && !!eventId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_id', eventId!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });
}

function bookingError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes('EVENT_FULL')) return 'Все места уже заняты.';
  if (message.includes('EVENT_UNAVAILABLE')) return 'Событие больше недоступно.';
  if (message.includes('BOOKING_ALREADY_ATTENDED')) return 'Посещённую запись отменить нельзя.';
  return 'Не удалось изменить запись. Попробуйте ещё раз.';
}

export function useBookingActions(eventId: string) {
  const client = useQueryClient();
  const refresh = async () => {
    await Promise.all([
      client.invalidateQueries({ queryKey: ['booking', eventId] }),
      client.invalidateQueries({ queryKey: ['bookings'] }),
      client.invalidateQueries({ queryKey: ['events'] }),
    ]);
  };

  const book = useMutation({
    mutationFn: async (sessionId: string) => {
      const { error } = await supabase.rpc('book_event', {
        p_event_id: eventId,
        p_session_id: sessionId,
      });
      if (error) throw error;
    },
    onSuccess: refresh,
  });
  const cancel = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc('cancel_booking', { p_event_id: eventId });
      if (error) throw error;
    },
    onSuccess: refresh,
  });

  return { book, cancel, bookingError };
}
