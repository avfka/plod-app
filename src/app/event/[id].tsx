import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DossierRow, Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import { useEvent } from '@/features/events/use-events';
import { useProfile } from '@/features/profile/use-profile';
import { Fonts, palette } from '@/theme';

function formatSession(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function EventScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { isGuest } = useSession();
  const { data: profile } = useProfile();
  const { data: event, isPending, error } = useEvent(id);

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-paper dark:bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }
  if (error || !event) {
    return (
      <View className="flex-1 items-center justify-center bg-paper px-8 dark:bg-night">
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

  const onBook = () => {
    if (isGuest) {
      router.push('/(auth)/welcome');
      return;
    }
    // book_event RPC — Фаза 3
    Alert.alert('Скоро', 'Запись на события появится в следующем обновлении.');
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Pass Card' }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4">
        <Card className="overflow-hidden p-0">
          {event.photo_url ? (
            <Image source={{ uri: event.photo_url }} style={{ height: 200 }} contentFit="cover" />
          ) : (
            <View
              style={{ backgroundColor: event.direction?.color_hex ?? '#8A847C', height: 120 }}
            />
          )}
          <View className="gap-2 p-4">
            <View className="flex-row flex-wrap gap-1.5">
              {event.direction ? (
                <Tag label={event.direction.name} color={event.direction.color_hex} />
              ) : null}
              <Tag label={event.event_type === 'championship' ? 'Чемпионат' : 'Мастер-класс'} />
              {isFavorite ? <Tag label="★ Ваш хореограф" color="#B8860B" /> : null}
            </View>
            <Text
              style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
              className="text-xl font-bold uppercase text-ink dark:text-paper-dark"
            >
              {event.title}
            </Text>
            {event.description ? (
              <Text
                style={{ fontFamily: Fonts.mono }}
                className="text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]"
              >
                {event.description}
              </Text>
            ) : null}
          </View>
        </Card>

        <Card>
          <Tag label="Данные" color="#141210" />
          <View className="mt-2">
            {event.choreographer ? (
              <DossierRow label="Хореограф" value={event.choreographer.name} />
            ) : null}
            <DossierRow
              label="Цена"
              value={event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} ₽` : '—'}
            />
            {seatsLeft != null ? (
              <DossierRow label="Мест" value={`${seatsLeft} из ${event.seats_total}`} />
            ) : null}
            {event.age_restriction ? (
              <DossierRow label="Возраст" value={event.age_restriction} />
            ) : null}
            {event.contact_phone ? (
              <DossierRow label="Контакт" value={event.contact_phone} />
            ) : null}
          </View>
        </Card>

        <Card>
          <Tag label={sessions.length >= 2 ? 'Красная нитка' : 'Где и когда'} />
          <View className="mt-3">
            {sessions.map((s, i) => (
              <View key={s.id} className="flex-row gap-3">
                <View className="items-center">
                  <View className="h-6 w-6 items-center justify-center rounded-full bg-accent">
                    <Text
                      style={{ fontFamily: Fonts.mono }}
                      className="text-[11px] font-bold text-paper"
                    >
                      {s.day_number}
                    </Text>
                  </View>
                  {i < sessions.length - 1 ? (
                    <View className="w-[2px] flex-1 bg-thread" />
                  ) : null}
                </View>
                <View className="flex-1 pb-4">
                  <Text
                    style={{ fontFamily: Fonts.mono }}
                    className="text-xs font-bold text-ink dark:text-paper-dark"
                  >
                    {formatSession(s.starts_at)}
                  </Text>
                  <Text
                    style={{ fontFamily: Fonts.mono }}
                    className="text-xs text-[#6B6560] dark:text-[#A39D93]"
                  >
                    {s.address}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </Card>

        <Button
          label={
            seatsLeft === 0 ? 'Мест нет' : isGuest ? 'Войти, чтобы записаться' : 'Записаться'
          }
          variant="accent"
          disabled={seatsLeft === 0}
          onPress={onBook}
        />
      </ScrollView>
    </>
  );
}
