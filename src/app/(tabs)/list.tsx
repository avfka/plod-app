import { ActivityIndicator, FlatList, Text, View } from 'react-native';

import { applyEventFilters, useActiveEvents } from '@/features/events/use-events';
import { EventCard } from '@/features/events/event-card';
import { FilterBar } from '@/features/map/filter-bar';
import { useProfile } from '@/features/profile/use-profile';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

export default function ListScreen() {
  const { data: events, isPending, error, refetch, isRefetching } = useActiveEvents();
  const { data: profile } = useProfile();
  const filters = useFilters();

  const filtered = applyEventFilters(events ?? [], filters, profile?.favorite_choreographer_id);

  return (
    <View className="flex-1 bg-paper dark:bg-night">
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
        <FlatList
          data={filtered}
          keyExtractor={(e) => e.id}
          contentContainerClassName="gap-3 p-4"
          refreshing={isRefetching}
          onRefresh={refetch}
          renderItem={({ item }) => (
            <EventCard
              event={item}
              isFavoriteChoreographer={
                !!profile?.favorite_choreographer_id &&
                item.choreographer_id === profile.favorite_choreographer_id
              }
            />
          )}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text
                style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
                className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
              >
                Ничего не найдено
              </Text>
              <View className="mt-3 h-[2px] w-16 bg-accent" />
              <Text
                style={{ fontFamily: Fonts.mono }}
                className="mt-3 text-xs text-[#6B6560] dark:text-[#A39D93]"
              >
                Попробуйте ослабить фильтры
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
