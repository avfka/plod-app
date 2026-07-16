import { ActivityIndicator, Text, View } from 'react-native';

import { ScreenMasthead } from '@/components/ui/screen-masthead';
import { CityContextBar, MOSCOW_CITY_ID } from '@/features/cities/city-context-bar';
import { applyEventFilters, useActiveEvents } from '@/features/events/use-events';
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

  const filtered = applyEventFilters(
    events ?? [],
    filters,
    profile?.favorite_choreographer_id,
  );

  return (
    <View className="flex-1 bg-paper dark:bg-night">
      <ScreenMasthead title="Карта" meta={`${filtered.length} событий`} />
      <CityContextBar />
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
          city={city}
        />
      )}
    </View>
  );
}
