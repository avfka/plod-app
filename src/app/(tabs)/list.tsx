import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Text,
  type ViewToken,
  useWindowDimensions,
  View,
} from 'react-native';

import { Button } from '@/components/ui/button';
import { MasterclassFeedItem } from '@/features/events/masterclass-feed';
import { applyEventFilters, useActiveEvents } from '@/features/events/use-events';
import { hydrateOnboardingDraft } from '@/features/onboarding/use-onboarding';
import { useProfile } from '@/features/profile/use-profile';
import {
  rankEventsForUser,
  type RecommendedEvent,
} from '@/features/recommendations/recommendation-engine';
import {
  useRecommendationMemory,
  useRecordRecommendationSignal,
} from '@/features/recommendations/use-recommendations';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 65, minimumViewTime: 700 };

export default function FeedScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [feedHeight, setFeedHeight] = useState(Math.max(560, windowHeight - 72));
  const { data: events, isPending, error, refetch, isRefetching } = useActiveEvents();
  const { data: profile } = useProfile();
  const { data: learnedMemory } = useRecommendationMemory();
  const { mutate: recordSignal } = useRecordRecommendationSignal();
  const filters = useFilters();
  const ranked = useMemo(() => {
    const filtered = applyEventFilters(events ?? [], {
      ...filters,
      types: ['masterclass'],
    });
    return rankEventsForUser(filtered, {
      behavior: learnedMemory?.behavior ?? [],
      directionIds: learnedMemory?.directionIds ?? [],
      favoriteChoreographerId: profile?.favorite_choreographer_id ?? null,
      followedChoreographerNames: learnedMemory?.followedChoreographerNames ?? [],
      interestedInMasterclasses: profile?.interested_in_mc ?? true,
      preferredCityId: profile?.city_id ?? filters.cityId,
    });
  }, [events, filters, learnedMemory, profile]);
  const recordedViews = useRef(new Set<string>());
  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<RecommendedEvent>[] }) => {
      for (const item of viewableItems) {
        const eventId = item.item?.event.id;
        if (!item.isViewable || !eventId || recordedViews.current.has(eventId)) continue;
        recordedViews.current.add(eventId);
        recordSignal({ eventId, signalType: 'view' });
      }
    },
    [recordSignal],
  );

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color={palette.red} />
        <Text style={{ fontFamily: Fonts.sans }} className="mt-3 text-sm text-[#A39D93]">
          Собираем мастер-классы рядом
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-night px-8">
        <Text style={{ fontFamily: Fonts.mono }} className="text-center text-sm text-paper-dark">
          Не удалось загрузить ленту
        </Text>
        <Button inverted label="Повторить" variant="outline" onPress={() => refetch()} />
      </View>
    );
  }

  if (ranked.length === 0) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-night px-8">
        <Text style={{ fontFamily: Fonts.serif }} className="text-center text-3xl font-bold text-paper-dark">
          Лента ждёт новых движений
        </Text>
        <Text style={{ fontFamily: Fonts.sans }} className="text-center text-sm leading-5 text-[#A39D93]">
          На выбранную дату и направления пока нет мастер-классов. Посмотрите все события на карте.
        </Text>
        <Button inverted label="Открыть карту" onPress={() => router.push('/(tabs)/map')} />
      </View>
    );
  }

  return (
    <View
      className="flex-1 bg-night"
      onLayout={(event) => setFeedHeight(event.nativeEvent.layout.height)}
    >
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.event.id}
        renderItem={({ item }) => (
          <MasterclassFeedItem
            event={item.event}
            height={feedHeight}
            recommendationReasons={item.reasons}
            onMapOpen={() =>
              recordSignal({ eventId: item.event.id, signalType: 'map_open' })
            }
            onOpen={() => recordSignal({ eventId: item.event.id, signalType: 'open' })}
            onTune={() => {
              hydrateOnboardingDraft({
                directionIds: learnedMemory?.directionIds ?? [],
                favoriteChoreographerId: profile?.favorite_choreographer_id ?? null,
                interestedInChamp: profile?.interested_in_champ ?? false,
                interestedInMc: profile?.interested_in_mc ?? true,
                preferredDate: profile?.preferred_date ?? null,
              });
              router.push('/(onboarding)/step1');
            }}
          />
        )}
        pagingEnabled
        snapToInterval={feedHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        getItemLayout={(_, index) => ({ length: feedHeight, offset: feedHeight * index, index })}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />
    </View>
  );
}
