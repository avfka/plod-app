import { useState } from 'react';
import { Text, View, useColorScheme } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';

import type { EventWithRelations } from '@/features/events/use-events';
import { grayscaleMapStyle } from '@/theme/map-style';
import { Fonts, palette } from '@/theme';
import type { Tables } from '@/types/database';
import { MapEventPreview } from './map-event-preview';

// Москва по умолчанию, пока нет геолокации
const INITIAL_REGION = {
  latitude: 55.751244,
  longitude: 37.618423,
  latitudeDelta: 0.25,
  longitudeDelta: 0.25,
};

function sortedSessions(e: EventWithRelations) {
  return [...e.event_sessions].sort(
    (a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime(),
  );
}

/**
 * ЧБ-карта с уликами: маркер = сессия (цвет направления), золотой —
 * любимый хореограф, «красная нитка» — полилиния мультисессий (спек §7.5–7.6).
 */
export function EventMap({
  events,
  favoriteChoreographerId,
  city,
  autoSelectFirst: _autoSelectFirst = false,
  compact = false,
  visibleEventIds,
}: {
  events: EventWithRelations[];
  favoriteChoreographerId?: string | null;
  city?: Tables<'cities'>;
  autoSelectFirst?: boolean;
  compact?: boolean;
  visibleEventIds?: string[];
}) {
  const scheme = useColorScheme();
  const [selected, setSelected] = useState<{ event: EventWithRelations; session: Tables<'event_sessions'> } | null>(null);
  const visibleEvents = visibleEventIds
    ? events.filter((event) => visibleEventIds.includes(event.id))
    : events;

  return (
    <View className={`flex-1 border-y border-[#39342E] ${compact ? 'bg-night' : ''}`}>
      <MapView
        key={city?.id ?? 'moscow'}
        provider={PROVIDER_GOOGLE}
        style={{ flex: 1 }}
        initialRegion={city ? {
          latitude: city.center_lat,
          longitude: city.center_lng,
          latitudeDelta: 0.25,
          longitudeDelta: 0.25,
        } : INITIAL_REGION}
        customMapStyle={[...grayscaleMapStyle]}
        userInterfaceStyle={scheme === 'dark' ? 'dark' : 'light'}
      >
      {visibleEvents.map((event) => {
        const sessions = sortedSessions(event);
        const isFavorite =
          !!favoriteChoreographerId && event.choreographer_id === favoriteChoreographerId;
        const color = isFavorite ? palette.gold : (event.direction?.color_hex ?? '#8A847C');
        const multiDay = sessions.length >= 2;

        return (
          <View key={event.id}>
            {multiDay ? (
              <Polyline
                coordinates={sessions.map((s) => ({ latitude: s.lat, longitude: s.lng }))}
                strokeColor={palette.thread}
                strokeWidth={3}
              />
            ) : null}
            {sessions.map((s) => (
              <Marker
                key={s.id}
                title={event.title}
                description={s.address}
                coordinate={{ latitude: s.lat, longitude: s.lng }}
                onPress={(markerEvent) => {
                  markerEvent.stopPropagation();
                  setSelected({ event, session: s });
                }}
                anchor={{ x: 0.5, y: 0.5 }}
              >
                <View
                  style={{ backgroundColor: color, borderColor: '#141210' }}
                  className="h-8 w-8 items-center justify-center rounded-full border-2"
                >
                  <Text
                    style={{ fontFamily: Fonts.mono }}
                    className="text-[11px] font-bold text-ink"
                  >
                    {multiDay ? s.day_number : isFavorite ? '★' : '●'}
                  </Text>
                </View>
              </Marker>
            ))}
          </View>
        );
      })}
      </MapView>
      {selected ? <MapEventPreview event={selected.event} session={selected.session} onClose={() => setSelected(null)} /> : null}
    </View>
  );
}
