import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, FlatList, Text, useWindowDimensions, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { MasterclassFeedItem } from '@/features/events/masterclass-feed';
import { applyEventFilters, useActiveEvents } from '@/features/events/use-events';
import { useProfile } from '@/features/profile/use-profile';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

export default function FeedScreen() {
  const router = useRouter();
  const { height: windowHeight } = useWindowDimensions();
  const [feedHeight, setFeedHeight] = useState(Math.max(560, windowHeight - 72));
  const { data: events, isPending, error, refetch, isRefetching } = useActiveEvents();
  const { data: profile } = useProfile();
  const filters = useFilters();
  const filtered = applyEventFilters(events ?? [], filters, profile?.favorite_choreographer_id)
    .filter((event) => event.event_type === 'masterclass');

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

  if (filtered.length === 0) {
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
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <MasterclassFeedItem event={item} height={feedHeight} />}
        pagingEnabled
        snapToInterval={feedHeight}
        snapToAlignment="start"
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        refreshing={isRefetching}
        onRefresh={refetch}
        getItemLayout={(_, index) => ({ length: feedHeight, offset: feedHeight * index, index })}
      />
    </View>
  );
}
