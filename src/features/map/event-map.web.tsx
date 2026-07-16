import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';

import type { EventWithRelations } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';
import type { Tables } from '@/types/database';
import { MapEventPreview } from './map-event-preview';

const MOSCOW_CENTER: [number, number] = [55.751244, 37.618423];

function sortedSessions(event: EventWithRelations, cityId?: string) {
  return event.event_sessions
    .filter((session) => !cityId || session.city_id === cityId)
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
}

function markerLabel(multiDay: boolean, favorite: boolean, dayNumber: number) {
  if (multiDay) return String(dayNumber);
  return favorite ? '★' : '●';
}

/** Leaflet + OpenStreetMap для web; нативные сборки используют event-map.tsx. */
export function EventMap({
  events,
  favoriteChoreographerId,
  city,
}: {
  events: EventWithRelations[];
  favoriteChoreographerId?: string | null;
  city?: Tables<'cities'>;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<{
    event: EventWithRelations;
    session: Tables<'event_sessions'>;
  } | null>(null);

  const center = useMemo<[number, number]>(
    () => (city ? [city.center_lat, city.center_lng] : MOSCOW_CENTER),
    [city],
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let disposed = false;
    let cleanup = () => {};

    void import('leaflet').then((module) => {
      if (disposed || !containerRef.current) return;
      const L = module.default;
      const map = L.map(containerRef.current, {
        attributionControl: true,
        zoomControl: true,
        keyboard: true,
      }).setView(center, 11);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      events.forEach((event) => {
        const sessions = sortedSessions(event, city?.id);
        if (sessions.length === 0) return;

        const favorite =
          !!favoriteChoreographerId && event.choreographer_id === favoriteChoreographerId;
        const markerColor = favorite
          ? palette.gold
          : (event.direction?.color_hex ?? '#8A847C');
        const multiDay = sessions.length >= 2;

        if (multiDay) {
          L.polyline(
            sessions.map((session) => [session.lat, session.lng] as [number, number]),
            { color: palette.thread, weight: 4, opacity: 0.92 },
          ).addTo(map);
        }

        sessions.forEach((session) => {
          const label = markerLabel(multiDay, favorite, session.day_number);
          const markerElement = document.createElement('span');
          markerElement.className = 'plod-map-marker';
          markerElement.style.backgroundColor = markerColor;
          markerElement.textContent = label;
          markerElement.setAttribute('aria-hidden', 'true');
          const icon = L.divIcon({
            className: 'plod-map-marker-shell',
            html: markerElement,
            iconSize: [38, 38],
            iconAnchor: [19, 19],
          });
          const marker = L.marker([session.lat, session.lng], {
            icon,
            title: event.title,
            keyboard: true,
            alt: `${event.title}, ${session.address}`,
          }).addTo(map);

          marker.on('click', (leafletEvent) => {
            if (leafletEvent.originalEvent) L.DomEvent.stopPropagation(leafletEvent.originalEvent);
            setSelected({ event, session });
          });
        });
      });

      window.setTimeout(() => map.invalidateSize(), 0);
      cleanup = () => map.remove();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [center, city?.id, events, favoriteChoreographerId]);

  return (
    <View className="relative flex-1 border-x-2 border-b-2 border-accent">
      <div ref={containerRef} className="plod-leaflet-map" aria-label={`Карта событий: ${city?.name ?? 'Москва'}`} />
      {events.length === 0 ? (
        <View pointerEvents="none" className="absolute left-4 right-4 top-4 border border-ink bg-paper/95 px-4 py-3 dark:border-paper-dark dark:bg-night-element/95">
          <Text style={{ fontFamily: Fonts.mono }} className="text-center text-xs uppercase text-ink dark:text-paper-dark">
            В этом городе пока нет событий по выбранным фильтрам
          </Text>
        </View>
      ) : null}
      {selected ? (
        <MapEventPreview
          event={selected.event}
          session={selected.session}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </View>
  );
}
