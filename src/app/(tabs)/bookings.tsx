import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, RefreshControl, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import {
  type BookingWithEvent,
  useBookingActions,
  useBookings,
} from '@/features/bookings/use-bookings';
import { EventCard } from '@/features/events/event-card';
import { Fonts, palette } from '@/theme';

function bookingTime(booking: BookingWithEvent) {
  return Math.max(
    ...booking.event.event_sessions.map((session) =>
      new Date(session.ends_at ?? session.starts_at).getTime(),
    ),
    0,
  );
}

function BookingItem({ booking }: { booking: BookingWithEvent }) {
  const { cancel, bookingError } = useBookingActions(booking.event_id);
  const canCancel = booking.status === 'active' && bookingTime(booking) >= Date.now();

  const onCancel = () => {
    Alert.alert('Отменить запись?', 'Место снова станет доступно другим участникам.', [
      { text: 'Оставить', style: 'cancel' },
      {
        text: 'Отменить',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancel.mutateAsync();
          } catch (error) {
            Alert.alert('Не получилось отменить', bookingError(error));
          }
        },
      },
    ]);
  };

  return (
    <View className="gap-2">
      <EventCard event={booking.event} />
      {canCancel ? (
        <Button
          label="Отменить запись"
          variant="ghost"
          loading={cancel.isPending}
          onPress={onCancel}
        />
      ) : null}
    </View>
  );
}

export default function BookingsScreen() {
  const router = useRouter();
  const { isGuest, loading: sessionLoading } = useSession();
  const { data, isPending, error, refetch, isRefetching } = useBookings(!isGuest);

  if (sessionLoading || (!isGuest && isPending)) {
    return (
      <View className="flex-1 items-center justify-center bg-paper dark:bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }

  if (isGuest) {
    return (
      <View className="flex-1 justify-center gap-4 bg-paper px-6 dark:bg-night">
        <Card className="gap-3">
          <Tag label="Личное дело" />
          <Text
            style={{ fontFamily: Fonts.mono }}
            className="text-lg font-bold uppercase text-ink dark:text-paper-dark"
          >
            Ваши записи появятся здесь
          </Text>
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs leading-5 text-[#6B6560]">
            Войдите, чтобы сохранять события и управлять своими местами.
          </Text>
          <Button label="Войти" onPress={() => router.push('/(auth)/welcome')} />
        </Card>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center gap-3 bg-paper px-6 dark:bg-night">
        <Text style={{ fontFamily: Fonts.mono }} className="text-center text-sm text-accent">
          Не удалось загрузить записи
        </Text>
        <Button label="Повторить" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  const visible = (data ?? []).filter((booking) => booking.status !== 'cancelled');
  const upcoming = visible
    .filter((booking) => booking.status === 'active' && bookingTime(booking) >= Date.now())
    .sort((a, b) => bookingTime(a) - bookingTime(b));
  const history = visible
    .filter((booking) => booking.status === 'attended' || bookingTime(booking) < Date.now())
    .sort((a, b) => bookingTime(b) - bookingTime(a));

  return (
    <ScrollView
      className="flex-1 bg-paper dark:bg-night"
      contentContainerClassName="gap-6 p-4 pb-28"
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
    >
      <View className="gap-1">
        <Text style={{ fontFamily: Fonts.mono }} className="text-[11px] uppercase text-accent">
          Архив наблюдения
        </Text>
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="text-2xl font-bold uppercase text-ink dark:text-paper-dark"
        >
          Мои записи
        </Text>
      </View>

      {upcoming.length === 0 && history.length === 0 ? (
        <Card className="gap-3">
          <Tag label="Новых дел нет" />
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs leading-5 text-[#6B6560]">
            Найдите событие на карте и нажмите «Записаться» в его досье.
          </Text>
          <Button label="Открыть карту" onPress={() => router.push('/(tabs)/map')} />
        </Card>
      ) : null}

      {upcoming.length > 0 ? (
        <View className="gap-3">
          <Tag label={`Активные · ${upcoming.length}`} />
          {upcoming.map((booking) => <BookingItem key={booking.id} booking={booking} />)}
        </View>
      ) : null}

      {history.length > 0 ? (
        <View className="gap-3 opacity-70">
          <Tag label={`Архив · ${history.length}`} color="#5B5F66" />
          {history.map((booking) => <BookingItem key={booking.id} booking={booking} />)}
        </View>
      ) : null}
    </ScrollView>
  );
}
