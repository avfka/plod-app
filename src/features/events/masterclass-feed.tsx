import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChoreographerAvatar } from '@/features/choreographers/choreographer-avatar';
import { FollowButton } from '@/features/choreographers/follow-button';
import { firstSession, type EventWithRelations } from '@/features/events/use-events';
import { useFilters } from '@/store/filters';
import { Fonts } from '@/theme';

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
    .replace('.', '');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function RailAction({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className="items-center gap-1"
      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
    >
      <View className="h-11 w-11 items-center justify-center rounded-full border border-paper-dark bg-black/50">
        <Ionicons name={icon} size={22} color="#F5F1E8" />
      </View>
      <Text style={{ fontFamily: Fonts.sans }} className="text-[10px] font-semibold text-paper-dark">
        {label}
      </Text>
    </Pressable>
  );
}

export function MasterclassFeedItem({
  event,
  height,
  recommendationReasons,
  onMapOpen,
  onOpen,
  onTune,
}: {
  event: EventWithRelations;
  height: number;
  recommendationReasons: string[];
  onMapOpen: () => void;
  onOpen: () => void;
  onTune: () => void;
}) {
  const router = useRouter();
  const session = firstSession(event);
  const choreographer = event.choreographer;
  const seatsLeft = event.seats_total == null ? null : event.seats_total - event.seats_taken;

  const showOnMap = () => {
    onMapOpen();
    useFilters.getState().set({ choreographerId: event.choreographer_id });
    router.push('/(tabs)/map');
  };

  const openEvent = () => {
    onOpen();
    router.push({ pathname: '/event/[id]', params: { id: event.id } });
  };

  return (
    <View style={{ height }} className="relative overflow-hidden bg-night">
      {event.photo_url ? (
        <Image source={{ uri: event.photo_url }} contentFit="cover" style={StyleSheet.absoluteFill} />
      ) : (
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: event.direction?.color_hex ?? '#282420' }]}
        />
      )}

      <View style={styles.mediaShade} />

      <View className="absolute left-4 right-4 top-4 flex-row items-center justify-between">
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
          className="text-lg font-black text-paper-dark"
        >
          PLOD
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Настроить персональную ленту"
          onPress={onTune}
          className="flex-row items-center gap-2 rounded-full bg-black/55 px-3 py-2 active:opacity-75"
        >
          <Ionicons name="sparkles" size={14} color="#E8352A" />
          <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold text-paper-dark">
            Для вас
          </Text>
          <Ionicons name="options-outline" size={14} color="#F5F1E8" />
        </Pressable>
      </View>

      <View className="absolute bottom-5 left-4 right-[78px] gap-3">
        <View className="self-start flex-row items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5">
          <Ionicons name="sparkles" size={13} color="#E8352A" />
          <Text
            numberOfLines={1}
            style={{ fontFamily: Fonts.sans }}
            className="max-w-[240px] text-xs font-semibold text-paper-dark"
          >
            {recommendationReasons[0]}
          </Text>
        </View>
        <View className="flex-row flex-wrap items-center gap-2">
          {event.direction ? (
            <View
              style={{ backgroundColor: event.direction.color_hex }}
              className="rounded-full px-3 py-1"
            >
              <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-bold text-white">
                {event.direction.name}
              </Text>
            </View>
          ) : null}
          {seatsLeft != null && seatsLeft <= 6 ? (
            <View className="rounded-full bg-paper-dark px-3 py-1">
              <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-bold text-ink">
                {seatsLeft > 0 ? `${seatsLeft} мест` : 'Лист ожидания'}
              </Text>
            </View>
          ) : null}
        </View>

        <Text
          style={{ fontFamily: Fonts.serif, letterSpacing: 0.3 }}
          className="text-[28px] font-bold leading-8 text-paper-dark"
        >
          {event.title}
        </Text>

        {choreographer ? (
          <Pressable
            accessibilityRole="link"
            onPress={() =>
              router.push({ pathname: '/choreographer/[id]', params: { id: choreographer.id } })
            }
            className="self-start"
          >
            <Text style={{ fontFamily: Fonts.sans }} className="text-sm font-semibold text-paper-dark">
              {choreographer.name} {choreographer.is_verified ? '✓' : ''}
            </Text>
          </Pressable>
        ) : null}

        {session ? (
          <View className="gap-1">
            <View className="flex-row items-center gap-2">
              <Ionicons name="calendar-outline" color="#F5F1E8" size={15} />
              <Text style={{ fontFamily: Fonts.sans }} className="text-sm text-paper-dark">
                {formatDate(session.starts_at)} · {formatTime(session.starts_at)}
              </Text>
            </View>
            <View className="flex-row items-center gap-2">
              <Ionicons name="location-outline" color="#F5F1E8" size={15} />
              <Text
                numberOfLines={1}
                style={{ fontFamily: Fonts.sans }}
                className="flex-1 text-sm text-[#D8D2C6]"
              >
                {session.city?.name ? `${session.city.name} · ` : ''}
                {session.address}
              </Text>
            </View>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={openEvent}
          className="mt-1 flex-row items-center justify-between rounded-full bg-paper-dark px-5 py-3.5 active:opacity-80"
        >
          <Text style={{ fontFamily: Fonts.sans }} className="text-sm font-bold text-ink">
            {event.is_free ? 'Открыть бесплатный класс' : `Открыть · ${Number(event.price)} ₽`}
          </Text>
          <Ionicons name="arrow-forward" color="#141210" size={18} />
        </Pressable>
      </View>

      <View className="absolute bottom-7 right-4 items-center gap-4">
        {choreographer ? (
          <View className="items-center">
            <Pressable
              accessibilityRole="link"
              onPress={() =>
                router.push({ pathname: '/choreographer/[id]', params: { id: choreographer.id } })
              }
            >
              <ChoreographerAvatar name={choreographer.name} size={48} />
            </Pressable>
            <View className="-mt-3">
              <FollowButton name={choreographer.name} compact />
            </View>
          </View>
        ) : null}
        <RailAction icon="map-outline" label="На карте" onPress={showOnMap} />
        <RailAction
          icon="information-circle-outline"
          label="Подробнее"
          onPress={openEvent}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mediaShade: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    pointerEvents: 'none',
    right: 0,
    top: 0,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
});
