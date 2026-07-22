import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef } from 'react';
import { ActivityIndicator, FlatList, Pressable, Text, type ViewToken, View } from 'react-native';

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

const VIEWABILITY_CONFIG = { itemVisiblePercentThreshold: 55, minimumViewTime: 700 };

export default function FeedScreen() {
  const router = useRouter();
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
    <View className="flex-1 bg-[#172813]">
      <FlatList
        data={ranked}
        keyExtractor={(item) => item.event.id}
        renderItem={({ item, index }) => (
          <MasterclassFeedItem
            event={item.event}
            index={index}
            recommendationReasons={item.reasons}
            onMapOpen={() =>
              recordSignal({ eventId: item.event.id, signalType: 'map_open' })
            }
            onOpen={() => recordSignal({ eventId: item.event.id, signalType: 'open' })}
          />
        )}
        ListHeaderComponent={
          <View className="gap-8 pb-10 pt-5">
            <View className="flex-row items-center justify-between">
              <Text
                style={{ fontFamily: Fonts.mono, letterSpacing: 3 }}
                className="text-lg font-black text-[#F3F0E7]"
              >
                PLOD
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Настроить персональную ленту"
                onPress={() => {
                  hydrateOnboardingDraft({
                    directionIds: learnedMemory?.directionIds ?? [],
                    favoriteChoreographerId: profile?.favorite_choreographer_id ?? null,
                    interestedInChamp: profile?.interested_in_champ ?? false,
                    interestedInMc: profile?.interested_in_mc ?? true,
                    preferredDate: profile?.preferred_date ?? null,
                  });
                  router.push('/(onboarding)/step1');
                }}
                className="min-h-11 flex-row items-center gap-2 border-b border-[#6D7B63] px-1 active:opacity-60"
              >
                <Ionicons name="sparkles" size={13} color="#E8352A" />
                <Text
                  style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
                  className="text-[10px] font-bold uppercase text-[#F3F0E7]"
                >
                  Для вас
                </Text>
                <Ionicons name="options-outline" size={14} color="#F3F0E7" />
              </Pressable>
            </View>
            <View className="max-w-[310px] gap-3">
              <Text
                style={{ fontFamily: Fonts.serif }}
                className="text-[38px] font-bold leading-[39px] text-[#F3F0E7]"
              >
                Двигайтесь туда, где будет живо
              </Text>
              <Text
                style={{ fontFamily: Fonts.mono, letterSpacing: 0.8 }}
                className="max-w-[265px] text-[9px] uppercase leading-[14px] text-[#AAB5A1]"
              >
                События отобраны по вашему городу, стилям и вниманию
              </Text>
            </View>
          </View>
        }
        ListFooterComponent={
          <View className="items-end pb-10">
            <Text
              style={{ fontFamily: Fonts.mono, letterSpacing: 1.5 }}
              className="text-[9px] uppercase text-[#AAB5A1]"
            >
              Продолжайте двигаться / PLOD
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 18, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={VIEWABILITY_CONFIG}
      />
    </View>
  );
}
