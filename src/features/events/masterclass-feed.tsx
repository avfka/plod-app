import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ChoreographerAvatar } from '@/features/choreographers/choreographer-avatar';
import { FollowButton } from '@/features/choreographers/follow-button';
import { firstSession, type EventWithRelations } from '@/features/events/use-events';
import { useFilters } from '@/store/filters';
import { Fonts } from '@/theme';

const editorialLayouts = [
  { align: 'flex-start', aspectRatio: 1.22, width: '92%' },
  { align: 'flex-end', aspectRatio: 0.98, width: '78%' },
  { align: 'flex-start', aspectRatio: 1.34, width: '70%' },
  { align: 'center', aspectRatio: 1.08, width: '84%' },
] as const;

function formatDate(iso: string) {
  return new Date(iso)
    .toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })
    .replace('.', '');
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function EditorialAction({
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
      className="min-h-11 flex-row items-center gap-2 border-b border-[#6D7B63] py-2 active:opacity-60"
    >
      <Text style={styles.actionLabel}>{label}</Text>
      <Ionicons name={icon} size={15} color="#F3F0E7" />
    </Pressable>
  );
}

export function MasterclassFeedItem({
  event,
  index,
  recommendationReasons,
  onMapOpen,
  onOpen,
}: {
  event: EventWithRelations;
  index: number;
  recommendationReasons: string[];
  onMapOpen: () => void;
  onOpen: () => void;
}) {
  const router = useRouter();
  const session = firstSession(event);
  const choreographer = event.choreographer;
  const seatsLeft = event.seats_total == null ? null : event.seats_total - event.seats_taken;
  const layout = editorialLayouts[index % editorialLayouts.length];
  const issue = String(index + 1).padStart(2, '0');

  const showOnMap = () => {
    onMapOpen();
    useFilters.getState().set({ choreographerId: event.choreographer_id });
    router.push('/(tabs)/map');
  };

  const openEvent = () => {
    onOpen();
    router.push({ pathname: '/event/[id]', params: { id: event.id } });
  };

  const openChoreographer = () => {
    if (!choreographer) return;
    router.push({ pathname: '/choreographer/[id]', params: { id: choreographer.id } });
  };

  return (
    <View style={styles.card}>
      <View style={styles.metaLine}>
        <Text style={styles.issue}>PLOD / {issue}</Text>
        <Text numberOfLines={1} style={styles.reason}>
          {recommendationReasons[0] ?? 'Подобрано для вас'}
        </Text>
      </View>

      <View
        style={[
          styles.media,
          { alignSelf: layout.align, aspectRatio: layout.aspectRatio, width: layout.width },
        ]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Открыть мастер-класс ${event.title}`}
          onPress={openEvent}
          style={({ pressed }) => [StyleSheet.absoluteFill, pressed && styles.pressed]}
        >
          {event.photo_url ? (
            <Image source={{ uri: event.photo_url }} contentFit="cover" style={StyleSheet.absoluteFill} />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: event.direction?.color_hex ?? '#25351E' },
              ]}
            />
          )}
          <View style={styles.mediaShade} />

          <View style={styles.mediaTopLine}>
            {event.direction ? (
              <View style={[styles.directionMark, { backgroundColor: event.direction.color_hex }]}>
                <Text style={styles.directionLabel}>{event.direction.name}</Text>
              </View>
            ) : null}
            {seatsLeft != null && seatsLeft <= 6 ? (
              <Text style={styles.seatsLabel}>
                {seatsLeft > 0 ? `${seatsLeft} мест` : 'Лист ожидания'}
              </Text>
            ) : null}
          </View>
        </Pressable>

        {choreographer ? (
          <View style={styles.creatorRail}>
            <Pressable
              accessibilityRole="link"
              accessibilityLabel={`Хореограф ${choreographer.name}`}
              onPress={openChoreographer}
            >
              <ChoreographerAvatar name={choreographer.name} size={46} />
            </Pressable>
            <FollowButton name={choreographer.name} compact />
          </View>
        ) : null}
      </View>

      <View
        style={[
          styles.details,
          layout.align === 'flex-end' ? styles.detailsLeft : styles.detailsRight,
        ]}
      >
        <View style={styles.titleBlock}>
          <Text style={styles.title}>{event.title}</Text>
          {choreographer ? (
            <Pressable accessibilityRole="link" onPress={openChoreographer}>
              <Text style={styles.choreographer}>
                {choreographer.name} {choreographer.is_verified ? '✓' : ''}
              </Text>
            </Pressable>
          ) : null}
        </View>

        {session ? (
          <View style={styles.facts}>
            <Text style={styles.factStrong}>
              {formatDate(session.starts_at)} / {formatTime(session.starts_at)}
            </Text>
            <Text numberOfLines={2} style={styles.factMuted}>
              {session.city?.name ? `${session.city.name} · ` : ''}
              {session.address}
            </Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          <EditorialAction icon="map-outline" label="Карта" onPress={showOnMap} />
          <EditorialAction icon="arrow-forward" label="Подробнее" onPress={openEvent} />
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            event.is_free ? 'Открыть бесплатный класс' : `Открыть за ${Number(event.price)} рублей`
          }
          onPress={openEvent}
          style={({ pressed }) => [styles.cta, pressed && styles.pressed]}
        >
          <Text style={styles.ctaText}>
            {event.is_free ? 'Бесплатно' : `${Number(event.price)} ₽`}
          </Text>
          <Ionicons name="arrow-up-outline" size={18} color="#172813" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actionLabel: {
    color: '#F3F0E7',
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  actions: {
    flexDirection: 'row',
    gap: 20,
  },
  card: {
    gap: 14,
    marginBottom: 58,
  },
  choreographer: {
    color: '#C7D0BE',
    fontFamily: Fonts.sans,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 7,
  },
  creatorRail: {
    alignItems: 'center',
    bottom: 12,
    gap: 6,
    position: 'absolute',
    right: 12,
  },
  cta: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#F3F0E7',
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    minHeight: 46,
    paddingHorizontal: 16,
  },
  ctaText: {
    color: '#172813',
    fontFamily: Fonts.mono,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  details: {
    gap: 13,
    width: '82%',
  },
  detailsLeft: {
    alignSelf: 'flex-start',
  },
  detailsRight: {
    alignSelf: 'flex-end',
  },
  directionLabel: {
    color: '#FFFFFF',
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  directionMark: {
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  facts: {
    gap: 4,
  },
  factMuted: {
    color: '#AAB5A1',
    fontFamily: Fonts.sans,
    fontSize: 12,
    lineHeight: 17,
  },
  factStrong: {
    color: '#F3F0E7',
    fontFamily: Fonts.mono,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  issue: {
    color: '#F3F0E7',
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.8,
  },
  media: {
    backgroundColor: '#25351E',
    overflow: 'hidden',
    position: 'relative',
  },
  mediaShade: {
    bottom: 0,
    backgroundColor: 'rgba(7, 15, 5, 0.18)',
    left: 0,
    pointerEvents: 'none',
    position: 'absolute',
    right: 0,
    top: 0,
  },
  mediaTopLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    left: 12,
    position: 'absolute',
    right: 12,
    top: 12,
  },
  metaLine: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: 18,
    justifyContent: 'space-between',
  },
  pressed: {
    opacity: 0.76,
  },
  reason: {
    color: '#AAB5A1',
    flexShrink: 1,
    fontFamily: Fonts.mono,
    fontSize: 8,
    letterSpacing: 0.7,
    lineHeight: 12,
    maxWidth: 148,
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  seatsLabel: {
    backgroundColor: 'rgba(23, 40, 19, 0.86)',
    color: '#F3F0E7',
    fontFamily: Fonts.mono,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.7,
    overflow: 'hidden',
    paddingHorizontal: 9,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  title: {
    color: '#F3F0E7',
    fontFamily: Fonts.serif,
    fontSize: 29,
    fontWeight: '700',
    letterSpacing: -0.4,
    lineHeight: 31,
  },
  titleBlock: {
    maxWidth: 320,
  },
});
