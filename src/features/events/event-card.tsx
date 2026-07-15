import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Tag } from '@/components/ui/tag';
import { firstSession, type EventWithRelations } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Карточка события в ленте — «pass card»: фото-портрет слева,
 * моно-поля справа, красные метки. Золотая рамка — любимый хореограф.
 */
export function EventCard({
  event,
  isFavoriteChoreographer = false,
  inverted = false,
}: {
  event: EventWithRelations;
  isFavoriteChoreographer?: boolean;
  inverted?: boolean;
}) {
  const session = firstSession(event);
  const multiDay = event.event_sessions.length >= 2;

  return (
    <Link href={{ pathname: '/event/[id]', params: { id: event.id } }} asChild>
      <Pressable
        accessibilityRole="link"
        accessibilityLabel={`${event.title}. ${session ? `${formatDate(session.starts_at)}, ${formatTime(session.starts_at)}` : 'Дата не указана'}. ${event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} рублей` : 'Цена не указана'}`}
        style={isFavoriteChoreographer ? { borderColor: palette.gold, borderWidth: 2 } : undefined}
        className={`min-h-32 flex-row overflow-hidden rounded-[2px] border active:scale-[0.99] ${inverted ? 'border-paper-dark bg-night-element' : 'border-ink bg-paper dark:border-paper-dark dark:bg-night-element'}`}
      >
        <View className={`${inverted ? 'w-24 border-paper-dark' : 'w-28 border-ink dark:border-paper-dark'} border-r`}>
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

        <View className="min-w-0 flex-1 gap-1.5 p-3">
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
            className={`text-[15px] font-bold uppercase leading-5 ${inverted ? 'text-paper-dark' : 'text-ink dark:text-paper-dark'}`}
          >
            {event.title}
          </Text>

          {event.choreographer ? (
            <Text
              style={{ fontFamily: Fonts.sans }}
              className={`text-[13px] ${inverted ? 'text-[#B8B1A7]' : 'text-[#5E5954] dark:text-[#B8B1A7]'}`}
            >
              {isFavoriteChoreographer ? '★ ' : ''}
              {event.choreographer.name}
            </Text>
          ) : null}

          <View className={`mt-auto flex-row items-center justify-between border-t border-dashed pt-2 ${inverted ? 'border-[#39342E]' : 'border-[#D8D2C6] dark:border-[#39342E]'}`}>
            <Text
              style={{ fontFamily: Fonts.mono }}
              className={`text-xs ${inverted ? 'text-[#A39D93]' : 'text-[#6B6560] dark:text-[#A39D93]'}`}
            >
              {session ? `${formatDate(session.starts_at)}, ${formatTime(session.starts_at)}` : 'Дата не указана'}
            </Text>
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-xs font-bold uppercase text-accent"
            >
              {event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} ₽` : 'Цена позже'}
            </Text>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}
