import { useEffect, useMemo, useRef, useState } from 'react';
import { Text, View } from 'react-native';
import { Image } from 'expo-image';

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

type RelatedMapEvent = {
  event: EventWithRelations;
  session: Tables<'event_sessions'>;
  reason: 'Один хореограф' | 'Одна тема' | 'Та же площадка' | 'То же направление';
  score: number;
};

function normalizedPlace(value: string) {
  return value.toLocaleLowerCase('ru-RU').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function findRelatedEvents(
  sourceEvent: EventWithRelations,
  sourceSession: Tables<'event_sessions'>,
  events: EventWithRelations[],
  cityId?: string,
): RelatedMapEvent[] {
  const sourceTime = new Date(sourceSession.starts_at).getTime();
  const sourcePlace = normalizedPlace(sourceSession.address);

  return events
    .filter((event) => event.id !== sourceEvent.id)
    .flatMap((event) => {
      const session = sortedSessions(event, cityId)[0];
      if (!session) return [];

      const sameChoreographer =
        !!sourceEvent.choreographer_id &&
        sourceEvent.choreographer_id === event.choreographer_id;
      const sameDirection =
        !!sourceEvent.direction_id && sourceEvent.direction_id === event.direction_id;
      const sameTheme = sameDirection && sourceEvent.event_type === event.event_type;
      const sameVenue =
        sourcePlace.length > 0 && sourcePlace === normalizedPlace(session.address);
      const daysApart = Math.abs(new Date(session.starts_at).getTime() - sourceTime) / 86_400_000;
      const nearbyInTime = daysApart <= 21;

      if (!sameChoreographer && !sameTheme && !sameVenue && !(sameDirection && nearbyInTime)) {
        return [];
      }

      const score =
        Number(sameChoreographer) * 12 +
        Number(sameTheme) * 8 +
        Number(sameVenue) * 6 +
        Number(sameDirection) * 2 +
        Math.max(0, 3 - daysApart / 7);
      const reason = sameChoreographer
        ? 'Один хореограф'
        : sameTheme
          ? 'Одна тема'
          : sameVenue
            ? 'Та же площадка'
            : 'То же направление';

      return [{ event, session, reason, score } satisfies RelatedMapEvent];
    })
    .sort((a, b) => b.score - a.score || new Date(a.session.starts_at).getTime() - new Date(b.session.starts_at).getTime())
    .slice(0, 4);
}

function placeLine(
  line: HTMLElement,
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  trimStart = 0,
  trimEnd = 0,
) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const rawLength = Math.hypot(dx, dy);
  if (rawLength === 0) return;
  const unitX = dx / rawLength;
  const unitY = dy / rawLength;
  const startX = fromX + unitX * trimStart;
  const startY = fromY + unitY * trimStart;
  const length = Math.max(0, rawLength - trimStart - trimEnd);

  line.style.left = `${startX}px`;
  line.style.top = `${startY}px`;
  line.style.width = `${length}px`;
  line.style.transform = `rotate(${Math.atan2(dy, dx)}rad)`;
  line.style.opacity = length > 0 ? '1' : '0';
}

/** Leaflet + OpenStreetMap для web; нативные сборки используют event-map.tsx. */
export function EventMap({
  events,
  favoriteChoreographerId,
  city,
  autoSelectFirst = false,
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
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const relatedLayerRef = useRef<import('leaflet').LayerGroup | null>(null);
  const eventLayersRef = useRef(new Map<string, import('leaflet').Layer[]>());
  const selectionActionsRef = useRef(new Map<string, () => void>());
  const visibleEventIdsRef = useRef(
    new Set(visibleEventIds ?? events.map((event) => event.id)),
  );
  const selectedEventIdRef = useRef<string | null>(null);
  const selectedMarkerRef = useRef<HTMLElement | null>(null);
  const [selected, setSelected] = useState<{
    event: EventWithRelations;
    session: Tables<'event_sessions'>;
    related: RelatedMapEvent[];
  } | null>(null);

  const center = useMemo<[number, number]>(
    () => (city ? [city.center_lat, city.center_lng] : MOSCOW_CENTER),
    [city],
  );
  const visibleEventIdsKey = (visibleEventIds ?? events.map((event) => event.id)).join('|');

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    setSelected(null);
    selectedMarkerRef.current = null;
    selectedEventIdRef.current = null;
    selectionActionsRef.current.clear();

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
      mapRef.current = map;
      const relatedLayer = L.layerGroup().addTo(map);
      relatedLayerRef.current = relatedLayer;
      const markerElementsByEvent = new Map<string, HTMLElement[]>();
      const eventLayersByEvent = new Map<string, import('leaflet').Layer[]>();
      eventLayersRef.current = eventLayersByEvent;
      const timers = new Set<number>();
      let geometryFrame = 0;
      let trackingFrame = 0;
      let mapMoving = false;
      let mapZooming = false;

      const scheduleTimer = (callback: () => void) => {
        const timer = window.setTimeout(() => {
          timers.delete(timer);
          callback();
        }, 0);
        timers.add(timer);
      };

      const updateSelectionGeometry = () => {
        const marker = selectedMarkerRef.current;
        const overlay = container.parentElement?.querySelector<HTMLElement>('.plod-map-selection-desktop');
        const dossier = overlay?.querySelector<HTMLElement>('.plod-map-dossier');
        const poster = overlay?.querySelector<HTMLElement>('.plod-map-poster-card');
        const leftLine = overlay?.querySelector<HTMLElement>('.plod-map-callout-line-left');
        const rightLine = overlay?.querySelector<HTMLElement>('.plod-map-callout-line-right');
        if (!marker || !overlay || !dossier || !poster || !leftLine || !rightLine) return;

        const mapRect = container.getBoundingClientRect();
        const markerRect = marker.getBoundingClientRect();
        const dossierRect = dossier.getBoundingClientRect();
        const posterRect = poster.getBoundingClientRect();
        const markerX = markerRect.left + markerRect.width / 2 - mapRect.left;
        const markerY = markerRect.top + markerRect.height / 2 - mapRect.top;

        placeLine(
          leftLine,
          dossierRect.right - mapRect.left,
          dossierRect.top + dossierRect.height / 2 - mapRect.top,
          markerX,
          markerY,
        );
        placeLine(
          rightLine,
          markerX,
          markerY,
          posterRect.left - mapRect.left,
          posterRect.top + posterRect.height / 2 - mapRect.top,
        );
      };

      const scheduleSelectionGeometry = () => {
        window.cancelAnimationFrame(geometryFrame);
        geometryFrame = window.requestAnimationFrame(updateSelectionGeometry);
      };

      const trackSelectionGeometry = () => {
        updateSelectionGeometry();
        if (mapMoving || mapZooming) {
          trackingFrame = window.requestAnimationFrame(trackSelectionGeometry);
        }
      };

      const startGeometryTracking = () => {
        if (trackingFrame) return;
        trackingFrame = window.requestAnimationFrame(trackSelectionGeometry);
      };

      const stopGeometryTracking = () => {
        if (mapMoving || mapZooming) return;
        window.cancelAnimationFrame(trackingFrame);
        trackingFrame = 0;
        scheduleSelectionGeometry();
      };

      const onMoveStart = () => {
        mapMoving = true;
        startGeometryTracking();
      };
      const onMoveEnd = () => {
        mapMoving = false;
        stopGeometryTracking();
      };
      const onZoomStart = () => {
        mapZooming = true;
        startGeometryTracking();
      };
      const onZoomEnd = () => {
        mapZooming = false;
        stopGeometryTracking();
      };

      map.on('movestart', onMoveStart);
      map.on('moveend', onMoveEnd);
      map.on('zoomstart', onZoomStart);
      map.on('zoomend', onZoomEnd);
      map.on('move zoom zoomanim resize viewreset', scheduleSelectionGeometry);
      const resizeObserver = new ResizeObserver(() => {
        map.invalidateSize({ pan: false });
        scheduleSelectionGeometry();
      });
      resizeObserver.observe(container);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      let firstSelection: (() => void) | null = null;

      events.forEach((event) => {
        const sessions = sortedSessions(event, city?.id);
        if (sessions.length === 0) return;
        const eventLayers: import('leaflet').Layer[] = [];

        const favorite =
          !!favoriteChoreographerId && event.choreographer_id === favoriteChoreographerId;
        const markerColor = favorite
          ? palette.gold
          : (event.direction?.color_hex ?? '#8A847C');
        const multiDay = sessions.length >= 2;

        if (multiDay) {
          const sessionPath = L.polyline(
            sessions.map((session) => [session.lat, session.lng] as [number, number]),
            { color: palette.thread, weight: 4, opacity: 0.92, className: 'plod-session-path' },
          );
          eventLayers.push(sessionPath);
          if (visibleEventIdsRef.current.has(event.id)) sessionPath.addTo(map);
        }

        sessions.forEach((session) => {
          const label = markerLabel(multiDay, favorite, session.day_number);
          const markerElement = document.createElement('span');
          markerElement.className = 'plod-map-marker';
          markerElement.style.backgroundColor = markerColor;
          markerElement.textContent = label;
          markerElement.setAttribute('aria-hidden', 'true');
          markerElementsByEvent.set(event.id, [
            ...(markerElementsByEvent.get(event.id) ?? []),
            markerElement,
          ]);
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
          });
          eventLayers.push(marker);
          if (visibleEventIdsRef.current.has(event.id)) marker.addTo(map);

          const activateSelection = () => {
            selectedMarkerRef.current?.classList.remove('plod-map-marker-selected');
            markerElementsByEvent.forEach((elements) =>
              elements.forEach((element) => element.classList.remove('plod-map-marker-related')),
            );
            markerElement.classList.add('plod-map-marker-selected');
            selectedMarkerRef.current = markerElement;
            selectedEventIdRef.current = event.id;
            container.classList.add('plod-map-has-selection');
            const related = findRelatedEvents(
              event,
              session,
              events.filter((candidate) => visibleEventIdsRef.current.has(candidate.id)),
              city?.id,
            );
            relatedLayer.clearLayers();
            related.forEach((item) => {
              markerElementsByEvent
                .get(item.event.id)
                ?.forEach((element) => element.classList.add('plod-map-marker-related'));
              L.polyline(
                [
                  [session.lat, session.lng],
                  [item.session.lat, item.session.lng],
                ],
                {
                  color: palette.thread,
                  weight: 2,
                  opacity: 0.72,
                  dashArray: '7 9',
                  className: 'plod-related-event-path',
                },
              ).addTo(relatedLayer);
            });
            map.panTo([session.lat, session.lng], { animate: true });
            setSelected({ event, session, related });
            scheduleTimer(scheduleSelectionGeometry);
          };

          if (visibleEventIdsRef.current.has(event.id)) firstSelection ??= activateSelection;
          if (!selectionActionsRef.current.has(event.id)) {
            selectionActionsRef.current.set(event.id, activateSelection);
          }
          marker.on('click', (leafletEvent) => {
            if (leafletEvent.originalEvent) L.DomEvent.stopPropagation(leafletEvent.originalEvent);
            activateSelection();
          });
        });
        eventLayersByEvent.set(event.id, eventLayers);
      });

      if (autoSelectFirst) scheduleTimer(() => firstSelection?.());

      scheduleTimer(() => map.invalidateSize());
      cleanup = () => {
        resizeObserver.disconnect();
        timers.forEach((timer) => window.clearTimeout(timer));
        window.cancelAnimationFrame(geometryFrame);
        window.cancelAnimationFrame(trackingFrame);
        mapRef.current = null;
        relatedLayerRef.current = null;
        eventLayersRef.current.clear();
        selectionActionsRef.current.clear();
        map.remove();
      };
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [autoSelectFirst, center, city?.id, events, favoriteChoreographerId]);

  useEffect(() => {
    const visibleIds = new Set(visibleEventIdsKey ? visibleEventIdsKey.split('|') : []);
    visibleEventIdsRef.current = visibleIds;
    const map = mapRef.current;
    if (!map) return;

    eventLayersRef.current.forEach((layers, eventId) => {
      const shouldShow = visibleIds.has(eventId);
      layers.forEach((layer) => {
        if (shouldShow && !map.hasLayer(layer)) layer.addTo(map);
        if (!shouldShow && map.hasLayer(layer)) map.removeLayer(layer);
      });
    });

    const selectedId = selectedEventIdRef.current;
    if (selectedId && !visibleIds.has(selectedId)) {
      selectedMarkerRef.current?.classList.remove('plod-map-marker-selected');
      selectedMarkerRef.current = null;
      selectedEventIdRef.current = null;
      relatedLayerRef.current?.clearLayers();
      containerRef.current?.classList.remove('plod-map-has-selection');
      setSelected(null);
    }

    if (autoSelectFirst && (!selectedId || !visibleIds.has(selectedId))) {
      const nextEvent = events.find((event) => visibleIds.has(event.id));
      if (nextEvent) selectionActionsRef.current.get(nextEvent.id)?.();
    }
  }, [autoSelectFirst, events, visibleEventIdsKey]);

  const closeSelection = () => {
    selectedMarkerRef.current?.classList.remove('plod-map-marker-selected');
    selectedMarkerRef.current = null;
    selectedEventIdRef.current = null;
    containerRef.current
      ?.parentElement?.querySelectorAll('.plod-map-marker-related')
      .forEach((element) => element.classList.remove('plod-map-marker-related'));
    relatedLayerRef.current?.clearLayers();
    containerRef.current?.classList.remove('plod-map-has-selection');
    setSelected(null);
  };

  const selectRelatedEvent = (eventId: string) => {
    selectionActionsRef.current.get(eventId)?.();
  };
  const relatedPreview =
    selected?.related.map((item) => ({
      eventId: item.event.id,
      title: item.event.title,
      reason: item.reason,
    })) ?? [];

  return (
    <View className={`relative flex-1 overflow-hidden border-y border-[#39342E] ${compact ? 'bg-night' : ''}`}>
      <div ref={containerRef} className="plod-leaflet-map" aria-label={`Карта событий: ${city?.name ?? 'Москва'}`} />
      {events.length === 0 ? (
        <View pointerEvents="none" className="absolute left-4 right-4 top-4 border border-ink bg-paper/95 px-4 py-3 dark:border-paper-dark dark:bg-night-element/95">
          <Text style={{ fontFamily: Fonts.mono }} className="text-center text-xs uppercase text-ink dark:text-paper-dark">
            В этом городе пока нет событий по выбранным фильтрам
          </Text>
        </View>
      ) : null}
      {selected ? (
        <>
          <View pointerEvents="box-none" className="plod-map-selection-desktop">
            <MapEventPreview
              event={selected.event}
              session={selected.session}
              onClose={closeSelection}
              inline
              trinity
              related={relatedPreview}
              onSelectRelated={selectRelatedEvent}
            />
            <View className="plod-map-callout-line plod-map-callout-line-left" />
            <View className="plod-map-callout-line plod-map-callout-line-right" />
            <View className="plod-map-poster-card">
              {selected.event.photo_url ? (
                <Image
                  source={{ uri: selected.event.photo_url }}
                  style={{ width: '100%', height: '100%' }}
                  contentFit="cover"
                  accessible={false}
                />
              ) : (
                <View
                  style={{ backgroundColor: selected.event.direction?.color_hex ?? '#2A2723' }}
                  className="h-full items-center justify-center px-4"
                >
                  <Text style={{ fontFamily: Fonts.mono }} className="text-center text-xl font-bold uppercase text-paper">
                    {selected.event.title}
                  </Text>
                </View>
              )}
              <View style={{ backgroundColor: 'rgba(18, 16, 14, 0.58)' }} className="absolute inset-0 justify-between p-3">
                <View>
                  <Text
                    style={{ fontFamily: Fonts.mono, color: selected.event.direction?.color_hex ?? palette.red }}
                    className="text-base font-bold uppercase leading-5 md:text-2xl md:leading-7"
                  >
                    {selected.event.direction?.name ?? 'Событие'}
                  </Text>
                  <Text style={{ fontFamily: Fonts.mono }} className="mt-1 text-[11px] font-bold uppercase leading-4 text-paper-dark">
                    {selected.event.title}
                  </Text>
                </View>
                <View className="border-t border-paper-dark/70 pt-2">
                  <Text style={{ fontFamily: Fonts.mono }} className="text-[9px] uppercase leading-3 text-paper-dark">
                    {new Date(selected.session.starts_at).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  <Text numberOfLines={2} style={{ fontFamily: Fonts.mono }} className="mt-1 text-[9px] uppercase leading-3 text-paper-dark">
                    {selected.session.address}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View className="plod-map-selection-mobile">
            <MapEventPreview
              event={selected.event}
              session={selected.session}
              onClose={closeSelection}
              related={relatedPreview}
              onSelectRelated={selectRelatedEvent}
            />
          </View>
        </>
      ) : null}
    </View>
  );
}
