import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Tag } from '@/components/ui/tag';
import { firstSession, type EventWithRelations } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

/**
 * Карточка события в ленте — «pass card»: фото-портрет слева,
 * моно-поля справа, красные метки. Золотая рамка — любимый хореограф.
 */
export function EventCard({
  event,
  isFavoriteChoreographer = false,
}: {
  event: EventWithRelations;
  isFavoriteChoreographer?: boolean;
}) {
  const session = firstSession(event);
  const multiDay = event.event_sessions.length >= 2;

  return (
    <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
      <Pressable
        style={isFavoriteChoreographer ? { borderColor: palette.gold, borderWidth: 2 } : undefined}
        className="flex-row overflow-hidden rounded-[2px] border border-ink bg-paper active:scale-[0.99] dark:border-paper-dark dark:bg-night-element"
      >
        <View className="h-28 w-24 border-r border-ink dark:border-paper-dark">
          {event.photo_url ? (
            <Image source={{ uri: event.photo_url }} style={{ flex: 1 }} contentFit="cover" />
          ) : (
            <View
              style={{ backgroundColor: event.direction?.color_hex ?? '#8A847C' }}
              className="flex-1 items-center justify-center"
            >
              <Text style={{ fontFamily: Fonts.mono }} className="text-2xl text-paper">
                ✦
              </Text>
            </View>
          )}
        </View>

        <View className="flex-1 gap-1 p-3">
          <View className="flex-row flex-wrap gap-1">
            {event.direction ? (
              <Tag label={event.direction.name} color={event.direction.color_hex} />
            ) : null}
            {event.event_type === 'championship' ? <Tag label="Чемпионат" /> : null}
            {multiDay ? <Tag label={`${event.event_sessions.length} дня`} color="#141210" /> : null}
          </View>

          <Text
            numberOfLines={2}
            style={{ fontFamily: Fonts.mono, letterSpacing: 0.5 }}
            className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
          >
            {event.title}
          </Text>

          {event.choreographer ? (
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-xs text-[#6B6560] dark:text-[#A39D93]"
            >
              {isFavoriteChoreographer ? '★ ' : ''}
              {event.choreographer.name}
            </Text>
          ) : null}

          <View className="mt-auto flex-row items-center justify-between border-t border-dashed border-[#D8D2C6] pt-1.5 dark:border-[#39342E]">
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-xs text-[#6B6560] dark:text-[#A39D93]"
            >
              {session ? formatDate(session.starts_at) : 'Нет даты'}
            </Text>
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-xs font-bold uppercase text-accent"
            >
              {event.is_free ? 'Free' : event.price != null ? `${Number(event.price)} ₽` : ''}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
