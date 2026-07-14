import { ActivityIndicator, Text, View } from 'react-native';

import { applyEventFilters, useActiveEvents } from '@/features/events/use-events';
import { EventMap } from '@/features/map/event-map';
import { FilterBar } from '@/features/map/filter-bar';
import { SignalHeader } from '@/components/ui/signal-header';
import { useProfile } from '@/features/profile/use-profile';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

export default function MapScreen() {
  const { data: events, isPending, error } = useActiveEvents();
  const { data: profile } = useProfile();
  const filters = useFilters();

  const filtered = applyEventFilters(
    events ?? [],
    filters,
    profile?.favorite_choreographer_id,
  );

  return (
    <View className="flex-1 bg-paper dark:bg-night">
      <SignalHeader eyebrow="PLOD / Live feed" title="Карта событий" meta={`${filtered.length} объектов`} />
      <FilterBar />
      {isPending ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={palette.red} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Text style={{ fontFamily: Fonts.mono }} className="text-center text-xs text-accent">
            Не удалось загрузить события: {error.message}
          </Text>
        </View>
      ) : (
        <EventMap
          events={filtered}
          favoriteChoreographerId={profile?.favorite_choreographer_id}
        />
      )}
    </View>
  );
}
