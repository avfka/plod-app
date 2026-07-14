import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
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
      <View className="flex-1 justify-between px-6 py-10">
        <View className="gap-2">
          <Tag label="Case File · 01" />
          <Text
            style={{ fontFamily: Fonts.mono, letterSpacing: 10 }}
            className="mt-4 text-5xl font-bold uppercase text-ink dark:text-paper-dark"
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
            Запретный плод сладок —{'\n'}следуй за красной ниткой.
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
