import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DossierRow, Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import { useBookingActions, useEventBooking } from '@/features/bookings/use-bookings';
import { reportProblem } from '@/features/feedback/report-problem';
import { bookingDate, RedThreadTimeline } from '@/features/events/red-thread-timeline';
import { useEvent } from '@/features/events/use-events';
import { useProfile } from '@/features/profile/use-profile';
import { useRecordRecommendationSignal } from '@/features/recommendations/use-recommendations';
import { useNow } from '@/hooks/use-now';
import { Fonts, palette } from '@/theme';

export default function EventScreen() {
  const { id, sessionId } = useLocalSearchParams<{ id: string; sessionId?: string }>();
  const router = useRouter();
  const { isGuest } = useSession();
  const { data: profile } = useProfile();
  const { data: event, isPending, error } = useEvent(id);
  const { data: booking } = useEventBooking(id, !isGuest);
  const { book, cancel, bookingError } = useBookingActions(id ?? '');
  const { mutate: recordSignal } = useRecordRecommendationSignal();
  const [selectedSessionId, setSelectedSessionId] = useState<string | undefined>(sessionId);
  const now = useNow();

  useEffect(() => {
    if (id && !isGuest) recordSignal({ eventId: id, signalType: 'open' });
  }, [id, isGuest, recordSignal]);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }
  if (error || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-night px-8">
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-accent">
          Событие не найдено
        </Text>
      </View>
    );
  }

  const sessions = [...event.event_sessions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
  const isFavorite =
    !!profile?.favorite_choreographer_id &&
    event.choreographer_id === profile.favorite_choreographer_id;
  const seatsLeft =
    event.seats_total != null ? event.seats_total - event.seats_taken : null;
  const hasUpcomingSession = sessions.some(
    (session) => new Date(session.ends_at ?? session.starts_at).getTime() > now,
  );
  const selectedSession =
    sessions.find((session) => session.id === selectedSessionId) ??
    sessions.find((session) => session.id === booking?.session_id) ??
    sessions.find(
      (session) => new Date(session.ends_at ?? session.starts_at).getTime() > now,
    ) ??
    sessions[0];

  const isBooked = booking?.status === 'active' || booking?.status === 'attended';
  const isAttended = booking?.status === 'attended';
  const canCancel =
    booking?.status === 'active' &&
    !!selectedSession &&
    new Date(selectedSession.starts_at).getTime() > now + 24 * 60 * 60 * 1000;

  const onBook = async () => {
    if (isGuest) {
      router.push('/(auth)/welcome');
      return;
    }
    if (!selectedSession) return;
    try {
      await book.mutateAsync(selectedSession.id);
      Alert.alert('Вы записаны', 'Событие добавлено в раздел «Мои записи».');
    } catch (mutationError) {
      Alert.alert('Не получилось записаться', bookingError(mutationError));
    }
  };

  const onCancel = () => {
    Alert.alert('Отменить запись?', 'Место снова станет доступно другим участникам.', [
      { text: 'Оставить запись', style: 'cancel' },
      {
        text: 'Отменить запись',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancel.mutateAsync();
          } catch (mutationError) {
            Alert.alert('Не получилось отменить', bookingError(mutationError));
          }
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pass Card',
          headerStyle: { backgroundColor: '#12100E' },
          headerTintColor: '#F5F1E8',
          headerTitleStyle: { fontFamily: Fonts.mono },
          headerShadowVisible: true,
        }}
      />
      <ScrollView className="flex-1 bg-night" contentContainerClassName="items-center p-4">
        <Card inverted className="w-full max-w-6xl overflow-hidden p-0">
          {event.photo_url ? (
            <View className="p-3 pb-0">
              <Image source={{ uri: event.photo_url }} style={{ height: 148 }} contentFit="cover" />
            </View>
          ) : (
            <View
              style={{ backgroundColor: event.direction?.color_hex ?? '#8A847C', height: 148 }}
              className="m-3 mb-0"
            />
          )}
          <View className="gap-2 px-5 py-3">
            <View className="flex-row flex-wrap gap-1.5">
              {event.direction ? (
                <Tag label={event.direction.name} color={event.direction.color_hex} />
              ) : null}
              <Tag label={event.event_type === 'championship' ? 'Чемпионат' : 'Мастер-класс'} />
              {isFavorite ? <Tag label="★ Ваш хореограф" color="#B8860B" /> : null}
            </View>
            <Text
              style={{ fontFamily: Fonts.serif, letterSpacing: 1 }}
              className="text-2xl font-bold uppercase text-paper-dark"
            >
              {event.title}
            </Text>
            {event.description ? (
              <Text
                style={{ fontFamily: Fonts.mono }}
                className="text-xs leading-5 text-[#A39D93]"
              >
                {event.description}
              </Text>
            ) : null}
          </View>
          <View className="gap-5 border-t border-paper-dark p-5 md:flex-row md:items-stretch">
            <View className="md:w-[42%]">
              {selectedSession ? (
                <RedThreadTimeline
                  sessions={sessions}
                  selectedId={selectedSession.id}
                  seatsLeft={seatsLeft}
                  onSelect={setSelectedSessionId}
                  inverted
                />
              ) : null}
            </View>

            <Card inverted className="flex-1 justify-between gap-4">
              <View>
                <Tag label="Данные" color="#141210" />
                <View className="mt-3">
                  {event.choreographer ? (
                    <Pressable
                      accessibilityRole="link"
                      accessibilityLabel={`Открыть профиль ${event.choreographer.name}`}
                      onPress={() =>
                        router.push({
                          pathname: '/choreographer/[id]',
                          params: { id: event.choreographer!.id },
                        })
                      }
                    >
                      <DossierRow inverted label="Хореограф" value={`${event.choreographer.name} →`} />
                    </Pressable>
                  ) : null}
                  <DossierRow
                    inverted
                    label="Цена"
                    value={
                      event.is_free
                        ? 'Бесплатно'
                        : event.price != null
                          ? `${Number(event.price)} ₽`
                          : 'Не указана'
                    }
                  />
                  {seatsLeft != null ? (
                    <DossierRow inverted label="Мест" value={`Осталось ${seatsLeft}`} />
                  ) : null}
                  {event.age_restriction ? (
                    <DossierRow inverted label="Возраст" value={event.age_restriction} />
                  ) : null}
                  {event.contact_phone ? (
                    <DossierRow inverted label="Контакт" value={event.contact_phone} />
                  ) : null}
                </View>
              </View>

              {isBooked ? (
                <View className="gap-3">
                  <Tag label={isAttended ? 'Дело закрыто · посещено' : 'Место подтверждено'} />
                  {canCancel ? (
                    <Button
                      label="Отменить запись"
                      variant="outline"
                      inverted
                      loading={cancel.isPending}
                      onPress={onCancel}
                    />
                  ) : !isAttended ? (
                    <Text
                      style={{ fontFamily: Fonts.mono }}
                      className="text-xs leading-5 text-[#A39D93]"
                    >
                      Отмена закрывается за 24 часа до начала.
                    </Text>
                  ) : null}
                </View>
              ) : (
                <Button
                  inverted
                  label={
                    !hasUpcomingSession
                      ? 'Событие завершено'
                      : seatsLeft === 0
                        ? 'Мест нет'
                        : selectedSession
                          ? `Забронировать на ${bookingDate(selectedSession.starts_at)}`
                          : 'Забронировать'
                  }
                  variant="accent"
                  loading={book.isPending}
                  disabled={!hasUpcomingSession || seatsLeft === 0 || !selectedSession}
                  onPress={onBook}
                />
              )}
              <Button
                inverted
                label="Сообщить о проблеме"
                variant="ghost"
                onPress={() => reportProblem({ route: `/event/${id}`, eventId: id })}
              />
            </Card>
          </View>
        </Card>
      </ScrollView>
    </>
  );
}
