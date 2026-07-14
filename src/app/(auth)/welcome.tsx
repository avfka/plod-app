import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { setEntryDone } from '@/features/onboarding/use-onboarding';
import { Fonts } from '@/theme';

export default function WelcomeScreen() {
  const router = useRouter();

  const continueAsGuest = async () => {
    await setEntryDone();
    router.replace('/(tabs)/map');
  };

  return (
    <SafeAreaView className="flex-1 bg-paper dark:bg-night">
      <View className="absolute left-7 top-0 h-full w-px bg-thread/50" />
      <View className="absolute left-[24px] top-28 h-2 w-2 rounded-full bg-thread" />
      <View className="absolute left-[24px] top-1/2 h-2 w-2 rounded-full border border-thread bg-paper dark:bg-night" />
      <View className="flex-1 justify-between px-10 py-10">
        <View className="gap-2">
          <Text
            style={{ fontFamily: Fonts.mono, letterSpacing: 10 }}
            className="mt-8 text-6xl font-bold uppercase text-accent"
          >
            PLOD
          </Text>
          <Text
            style={{ fontFamily: Fonts.mono, letterSpacing: 3 }}
            className="text-xs font-bold uppercase text-accent"
          >
            Запретный плод
          </Text>
          <View className="mt-2 h-[2px] w-24 bg-accent" />
          <Text
            style={{ fontFamily: Fonts.mono }}
            className="mt-4 text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]"
          >
            Мастер-классы и чемпионаты{'\n'}на карте города.{'\n'}
            Запретный плод сладок.{'\n'}Следуй за красной ниткой.
          </Text>
        </View>

        <View className="gap-3">
          <Button label="Войти по телефону" onPress={() => router.push('/(auth)/phone')} />
          <Button
            label="Войти по email"
            variant="outline"
            onPress={() => router.push('/(auth)/email')}
          />
          <Button label="Продолжить без входа" variant="ghost" onPress={continueAsGuest} />
        </View>
      </View>
    </SafeAreaView>
  );
}
