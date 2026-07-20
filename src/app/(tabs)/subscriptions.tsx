import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { ChoreographerAvatar } from '@/features/choreographers/choreographer-avatar';
import { FollowButton } from '@/features/choreographers/follow-button';
import {
  useChoreographers,
  useChoreographerSubscriptions,
} from '@/features/choreographers/use-choreographers';
import { useSession } from '@/features/auth/use-session';
import { EventCard } from '@/features/events/event-card';
import { useActiveEvents } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';
import type { Tables } from '@/types/database';

function ChoreographerRow({
  choreographer,
  classCount,
}: {
  choreographer: Tables<'choreographers'>;
  classCount: number;
}) {
  const router = useRouter();

  return (
    <View className="flex-row items-center gap-3 border-b border-[#39342E] py-4">
      <Pressable
        accessibilityRole="link"
        onPress={() =>
          router.push({ pathname: '/choreographer/[id]', params: { id: choreographer.id } })
        }
        className="min-w-0 flex-1 flex-row items-center gap-3"
      >
        <ChoreographerAvatar name={choreographer.name} size={52} />
        <View className="min-w-0 flex-1 gap-1">
          <Text
            numberOfLines={1}
            style={{ fontFamily: Fonts.sans }}
            className="text-base font-bold text-paper-dark"
          >
            {choreographer.name} {choreographer.is_verified ? '✓' : ''}
          </Text>
          <Text style={{ fontFamily: Fonts.sans }} className="text-xs text-[#A39D93]">
            {classCount > 0 ? `${classCount} актуальных классов` : 'Новые классы скоро'}
          </Text>
        </View>
      </Pressable>
      <FollowButton name={choreographer.name} />
    </View>
  );
}

export default function SubscriptionsScreen() {
  const router = useRouter();
  const { isGuest, loading: sessionLoading, session } = useSession();
  const {
    data: subscriptions = [],
    isPending: subscriptionsPending,
    refetch: refetchSubscriptions,
  } = useChoreographerSubscriptions(session?.user.id);
  const { data: choreographers = [], isPending: choreographersPending } = useChoreographers();
  const {
    data: events = [],
    isPending: eventsPending,
    refetch: refetchEvents,
    isRefetching,
  } = useActiveEvents();

  if (sessionLoading || (!isGuest && (subscriptionsPending || choreographersPending || eventsPending))) {
    return (
      <View className="flex-1 items-center justify-center bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-night" edges={['top']}>
        <View className="flex-1 items-center justify-center gap-4 px-8">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-night-element">
            <Ionicons name="notifications-outline" size={28} color="#F5F1E8" />
          </View>
          <Text style={{ fontFamily: Fonts.serif }} className="text-center text-3xl font-bold text-paper-dark">
            Соберите свой круг
          </Text>
          <Text style={{ fontFamily: Fonts.sans }} className="text-center text-sm leading-5 text-[#A39D93]">
            Войдите, чтобы подписываться на хореографов и первыми видеть их новые мастер-классы.
          </Text>
          <Button inverted label="Войти" onPress={() => router.push('/(auth)/welcome')} />
        </View>
      </SafeAreaView>
    );
  }

  const subscribedNames = new Set(subscriptions.map((item) => item.choreographer_name));
  const followedChoreographers = choreographers.filter((item) => subscribedNames.has(item.name));
  const followedEvents = events.filter(
    (event) => event.choreographer && subscribedNames.has(event.choreographer.name),
  );
  const suggestedChoreographers = choreographers
    .filter((item) => !subscribedNames.has(item.name))
    .slice(0, 5);

  const refresh = async () => {
    await Promise.all([refetchSubscriptions(), refetchEvents()]);
  };

  return (
    <SafeAreaView className="flex-1 bg-night" edges={['top']}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-5 pb-8"
        refreshControl={<RefreshControl tintColor={palette.red} refreshing={isRefetching} onRefresh={refresh} />}
      >
        <View className="flex-row items-end justify-between border-b border-[#39342E] pb-5 pt-3">
          <View className="gap-1">
            <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold uppercase tracking-widest text-accent">
              Ваш круг
            </Text>
            <Text style={{ fontFamily: Fonts.serif }} className="text-[34px] font-bold text-paper-dark">
              Подписки
            </Text>
          </View>
          <Text style={{ fontFamily: Fonts.sans }} className="pb-1 text-xs text-[#A39D93]">
            {followedChoreographers.length} хореографов
          </Text>
        </View>

        {followedChoreographers.length > 0 ? (
          <View>
            {followedChoreographers.map((choreographer) => (
              <ChoreographerRow
                key={choreographer.id}
                choreographer={choreographer}
                classCount={events.filter((event) => event.choreographer_id === choreographer.id).length}
              />
            ))}
          </View>
        ) : (
          <View className="items-center gap-3 border-b border-[#39342E] py-10">
            <Text style={{ fontFamily: Fonts.serif }} className="text-center text-2xl font-bold text-paper-dark">
              Здесь появятся новые классы
            </Text>
            <Text style={{ fontFamily: Fonts.sans }} className="text-center text-sm leading-5 text-[#A39D93]">
              Подпишитесь на хореографов ниже — их события соберутся в одной ленте.
            </Text>
          </View>
        )}

        {followedEvents.length > 0 ? (
          <View className="gap-3 border-b border-[#39342E] py-6">
            <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold uppercase tracking-widest text-[#A39D93]">
              Ближайшие классы · {followedEvents.length}
            </Text>
            {followedEvents.map((event) => (
              <EventCard key={event.id} event={event} inverted />
            ))}
          </View>
        ) : null}

        {suggestedChoreographers.length > 0 ? (
          <View className="pt-6">
            <Text style={{ fontFamily: Fonts.sans }} className="mb-1 text-xs font-semibold uppercase tracking-widest text-[#A39D93]">
              Открыть новых
            </Text>
            {suggestedChoreographers.map((choreographer) => (
              <ChoreographerRow
                key={choreographer.id}
                choreographer={choreographer}
                classCount={events.filter((event) => event.choreographer_id === choreographer.id).length}
              />
            ))}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}
