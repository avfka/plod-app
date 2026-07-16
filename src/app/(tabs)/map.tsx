import { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

import { ScreenMasthead } from '@/components/ui/screen-masthead';
import { CityContextBar, MOSCOW_CITY_ID } from '@/features/cities/city-context-bar';
import { EventSearch } from '@/features/events/event-search';
import { applyEventFilters, searchEvents, useActiveEvents } from '@/features/events/use-events';
import { EventMap } from '@/features/map/event-map';
import { FilterBar } from '@/features/map/filter-bar';
import { useCities } from '@/features/onboarding/use-directories';
import { useProfile } from '@/features/profile/use-profile';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

export default function MapScreen() {
  const { data: events, isPending, error } = useActiveEvents();
  const { data: profile } = useProfile();
  const filters = useFilters();
  const { data: cities = [] } = useCities();
  const city = cities.find((item) => item.id === (filters.cityId ?? MOSCOW_CITY_ID));
  const [query, setQuery] = useState('');
  const [filtersVisible, setFiltersVisible] = useState(true);

  const filteredByChips = applyEventFilters(
    events ?? [],
    filters,
    profile?.favorite_choreographer_id,
  );
  const filtered = searchEvents(filteredByChips, query);
  const activeFilterCount =
    Number(filters.date !== null) +
    Number(filters.directionId !== null) +
    Number(filters.freeOnly) +
    Number(filters.types.length > 0);

  return (
    <View className="flex-1 bg-paper dark:bg-night">
      <ScreenMasthead title="Карта" meta={`${filtered.length} событий`} />
      <CityContextBar />
      <EventSearch
        value={query}
        filtersVisible={filtersVisible}
        activeFilterCount={activeFilterCount}
        onChangeText={setQuery}
        onToggleFilters={() => setFiltersVisible((visible) => !visible)}
      />
      {filtersVisible ? (
        <FilterBar showHeader={false} />
      ) : (
        <View className="h-3 border-b border-ink dark:border-paper-dark" />
      )}
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
          city={city}
        />
      )}
    </View>
  );
}
