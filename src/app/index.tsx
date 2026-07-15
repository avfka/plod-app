import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';

import { useSession } from '@/features/auth/use-session';
import { getEntryDone, getOnboardingDone } from '@/features/onboarding/use-onboarding';
import { palette } from '@/theme';

/**
 * Входная точка: Welcome (первый запуск) → опросник (после логина) → карта.
 * Гость попадает сразу на карту после «Продолжить без входа».
 */
export default function Index() {
  const { session, loading } = useSession();
  const [flags, setFlags] = useState<{ entry: boolean; onboarding: boolean } | null>(null);

  useEffect(() => {
    Promise.all([getEntryDone(), getOnboardingDone()]).then(([entry, onboarding]) =>
      setFlags({ entry, onboarding }),
    );
  }, []);

  if (loading || !flags) {
    return (
      <View className="flex-1 items-center justify-center bg-paper dark:bg-night">
        <ActivityIndicator color={palette.red} />
      </View>
    );
  }

  if (session && !flags.onboarding) return <Redirect href="/(onboarding)/step1" />;
  if (!session && !flags.entry) return <Redirect href="/(auth)/welcome" />;
  return <Redirect href={Platform.OS === 'web' ? '/(tabs)/list' : '/(tabs)/map'} />;
}
