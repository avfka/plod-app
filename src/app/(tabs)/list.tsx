import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { ScreenMasthead } from '@/components/ui/screen-masthead';
import { CityContextBar } from '@/features/cities/city-context-bar';
import { EventSearch } from '@/features/events/event-search';
import { applyEventFilters, searchEvents, useActiveEvents } from '@/features/events/use-events';
import { EventCard } from '@/features/events/event-card';
import { FilterBar } from '@/features/map/filter-bar';
import { useProfile } from '@/features/profile/use-profile';
import { useFilters } from '@/store/filters';
import { Fonts } from '@/theme';

export default function ListScreen() {
  const { data: events, isPending, error, refetch, isRefetching } = useActiveEvents();
  const { data: profile } = useProfile();
  const filters = useFilters();
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
  const resetFilters = () =>
    filters.set({
      date: null,
      types: [],
      directionId: null,
      choreographerId: null,
      freeOnly: false,
    });

  return (
    <View className="flex-1 bg-night">
      <ScreenMasthead title="События" meta={`${filtered.length} найдено`} />
      <CityContextBar inverted />
      <EventSearch
        value={query}
        filtersVisible={filtersVisible}
        activeFilterCount={activeFilterCount}
        onChangeText={setQuery}
        onToggleFilters={() => setFiltersVisible((visible) => !visible)}
      />
      {filtersVisible ? (
        <FilterBar showHeader={false} inverted />
      ) : (
        <View className="h-3 border-b border-paper-dark" />
      )}
      {isPending ? (
        <View accessibilityLabel="Загрузка событий" className="gap-3 p-3">
          {[0, 1, 2, 3].map((item) => (
            <View
              key={item}
              className="h-32 flex-row overflow-hidden rounded-[2px] border border-[#D8D2C6] dark:border-[#39342E]"
            >
              <View className="w-28 bg-[#E7E1D6] dark:bg-[#282420]" />
              <View className="flex-1 justify-center gap-3 p-3">
                <View className="h-3 w-16 bg-[#D8D2C6] dark:bg-[#39342E]" />
                <View className="h-4 w-full bg-[#D8D2C6] dark:bg-[#39342E]" />
                <View className="h-3 w-2/3 bg-[#E7E1D6] dark:bg-[#282420]" />
              </View>
            </View>
          ))}
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center gap-5 px-8">
          <Text style={{ fontFamily: Fonts.mono }} className="text-center text-base font-bold text-ink dark:text-paper-dark">
            Не удалось загрузить афишу
          </Text>
          <Text style={{ fontFamily: Fonts.sans }} className="text-center text-sm text-[#6B6560] dark:text-[#A39D93]">
            Проверьте соединение и попробуйте ещё раз.
          </Text>
          <Button label="Повторить" variant="outline" onPress={() => refetch()} />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerClassName="gap-3 px-[18px] py-3 pb-6"
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              inverted
              isFavoriteChoreographer={
                !!profile?.favorite_choreographer_id &&
                item.choreographer_id === profile.favorite_choreographer_id
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center gap-4 px-5 py-14">
              <Text
                style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
                className="text-base font-bold uppercase text-ink dark:text-paper-dark"
              >
                Ничего не найдено
              </Text>
              <Text
                style={{ fontFamily: Fonts.sans }}
                className="text-center text-sm leading-5 text-[#6B6560] dark:text-[#A39D93]"
              >
                {query
                  ? 'Попробуйте другое название, стиль, хореографа или площадку.'
                  : 'Измените дату или направление, чтобы увидеть больше событий.'}
              </Text>
              <Button
                label={query ? 'Очистить поиск' : 'Сбросить фильтры'}
                variant="outline"
                onPress={query ? () => setQuery('') : resetFilters}
              />
            </View>
          }
        />
      )}
    </View>
  );
}
