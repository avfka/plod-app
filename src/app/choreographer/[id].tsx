import { Image } from 'expo-image';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ChoreographerAvatar } from '@/features/choreographers/choreographer-avatar';
import { FollowButton } from '@/features/choreographers/follow-button';
import {
  useChoreographer,
  useChoreographerEvents,
} from '@/features/choreographers/use-choreographers';
import { EventCard } from '@/features/events/event-card';
import type { EventWithRelations } from '@/features/events/event-utils';
import { useNow } from '@/hooks/use-now';
import { Fonts, palette } from '@/theme';

function eventTime(event: EventWithRelations) {
  return Math.min(...event.event_sessions.map((session) => new Date(session.starts_at).getTime()));
}

function isUpcoming(event: EventWithRelations, now: number) {
  return event.event_sessions.some(
    (session) => new Date(session.ends_at ?? session.starts_at).getTime() > now,
  );
}

function profileDescription(name: string, events: EventWithRelations[]) {
  const directions = [...new Set(events.map((event) => event.direction?.name).filter(Boolean))];
  if (directions.length === 0) {
    return `${name} — хореограф и преподаватель танца. Следите за профилем, чтобы не пропустить новые классы.`;
  }
  return `${name} работает с направлениями ${directions.join(', ')}. В профиле собраны ближайшие мастер-классы, интенсивы и архив прошедших событий.`;
}

export default function ChoreographerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: choreographer, isPending: choreographerPending, error } = useChoreographer(id);
  const { data: events = [], isPending: eventsPending } = useChoreographerEvents(id);
  const now = useNow();

  if (choreographerPending || eventsPending) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }

  if (error || !choreographer) {
    return (
      <View className="flex-1 items-center justify-center bg-night px-8">
        <Text style={{ fontFamily: Fonts.sans }} className="text-center text-paper-dark">
          Профиль хореографа не найден
        </Text>
      </View>
    );
  }

  const upcoming = events
    .filter((event) => isUpcoming(event, now))
    .sort((a, b) => eventTime(a) - eventTime(b));
  const past = events
    .filter((event) => !isUpcoming(event, now))
    .sort((a, b) => eventTime(b) - eventTime(a));
  const cover = upcoming[0]?.photo_url ?? past[0]?.photo_url;

  return (
    <>
      <Stack.Screen options={{ title: choreographer.name }} />
      <ScrollView className="flex-1 bg-night" contentContainerClassName="pb-10">
        <View className="relative h-64 overflow-hidden bg-night-element">
          {cover ? (
            <Image source={{ uri: cover }} contentFit="cover" style={StyleSheet.absoluteFill} />
          ) : null}
          <View style={styles.coverShade} />
          <View className="absolute bottom-5 left-5 right-5 flex-row items-end gap-4">
            <ChoreographerAvatar name={choreographer.name} size={76} />
            <View className="min-w-0 flex-1 gap-1 pb-1">
              <Text
                style={{ fontFamily: Fonts.serif }}
                className="text-[30px] font-bold leading-8 text-paper-dark"
              >
                {choreographer.name}
              </Text>
              <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold text-[#D8D2C6]">
                {choreographer.is_verified ? 'Профиль подтверждён · ' : ''}
                {upcoming.length} актуальных классов
              </Text>
            </View>
          </View>
        </View>

        <View className="gap-5 px-5 pt-5">
          <View className="gap-4 border-b border-[#39342E] pb-6">
            <Text style={{ fontFamily: Fonts.sans }} className="text-[15px] leading-6 text-[#D8D2C6]">
              {profileDescription(choreographer.name, events)}
            </Text>
            <FollowButton name={choreographer.name} />
          </View>

          <View className="gap-3">
            <View className="flex-row items-end justify-between">
              <Text style={{ fontFamily: Fonts.serif }} className="text-2xl font-bold text-paper-dark">
                Актуальные
              </Text>
              <Text style={{ fontFamily: Fonts.sans }} className="text-xs text-[#A39D93]">
                {upcoming.length}
              </Text>
            </View>
            {upcoming.length > 0 ? (
              upcoming.map((event) => <EventCard key={event.id} event={event} inverted />)
            ) : (
              <View className="rounded-lg bg-night-element p-5">
                <Text style={{ fontFamily: Fonts.sans }} className="text-sm leading-5 text-[#A39D93]">
                  Новых дат пока нет. Подпишитесь — следующий класс появится в вашей ленте.
                </Text>
              </View>
            )}
          </View>

          <View className="gap-3 border-t border-[#39342E] pt-5">
            <View className="flex-row items-end justify-between">
              <Text style={{ fontFamily: Fonts.serif }} className="text-2xl font-bold text-paper-dark">
                Прошедшие
              </Text>
              <Text style={{ fontFamily: Fonts.sans }} className="text-xs text-[#A39D93]">
                {past.length}
              </Text>
            </View>
            {past.length > 0 ? (
              <View className="gap-3 opacity-60">
                {past.map((event) => <EventCard key={event.id} event={event} inverted />)}
              </View>
            ) : (
              <Text style={{ fontFamily: Fonts.sans }} className="text-sm text-[#6E6860]">
                Архив появится после первых завершённых классов.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  coverShade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.48)',
  },
});
