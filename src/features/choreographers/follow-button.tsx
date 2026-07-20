import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, Text } from 'react-native';

import { useSession } from '@/features/auth/use-session';
import {
  useChoreographerSubscriptions,
  useToggleChoreographerSubscription,
} from '@/features/choreographers/use-choreographers';
import { Fonts } from '@/theme';

export function FollowButton({ name, compact = false }: { name: string; compact?: boolean }) {
  const router = useRouter();
  const { isGuest, loading, session } = useSession();
  const userId = session?.user.id;
  const { data = [] } = useChoreographerSubscriptions(userId);
  const toggle = useToggleChoreographerSubscription(userId);
  const subscribed = data.some((item) => item.choreographer_name === name);

  const onPress = () => {
    if (loading) return;
    if (isGuest) {
      router.push('/(auth)/welcome');
      return;
    }
    toggle.mutate({ name, subscribed });
  };

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={subscribed ? `Отписаться от ${name}` : `Подписаться на ${name}`}
      disabled={loading || toggle.isPending}
      onPress={onPress}
      style={({ pressed }) => ({ opacity: pressed ? 0.72 : 1 })}
      className={`flex-row items-center justify-center border ${
        compact
          ? 'h-11 w-11 rounded-full border-paper-dark bg-black/50'
          : subscribed
            ? 'gap-2 rounded-full border-[#55504A] bg-night-element px-4 py-2.5'
            : 'gap-2 rounded-full border-accent bg-accent px-4 py-2.5'
      }`}
    >
      {toggle.isPending ? (
        <ActivityIndicator size="small" color="#F5F1E8" />
      ) : (
        <Ionicons
          name={subscribed ? 'checkmark' : compact ? 'add' : 'notifications-outline'}
          color="#F5F1E8"
          size={compact ? 24 : 17}
        />
      )}
      {!compact ? (
        <Text style={{ fontFamily: Fonts.sans }} className="text-sm font-semibold text-paper-dark">
          {subscribed ? 'Вы подписаны' : 'Подписаться'}
        </Text>
      ) : null}
    </Pressable>
  );
}
