import { useRouter } from 'expo-router';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { MonthCalendar } from '@/components/ui/month-calendar';
import { Tag } from '@/components/ui/tag';
import { useOnboardingDraft } from '@/features/onboarding/use-onboarding';
import { Fonts } from '@/theme';

export default function Step1Date() {
  const router = useRouter();
  const draft = useOnboardingDraft();

  return (
    <View className="flex-1 gap-4 bg-paper px-6 py-6 dark:bg-night">
      <Tag label="Дата" />
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-lg font-bold uppercase text-ink dark:text-paper-dark"
      >
        Когда хотите танцевать?
      </Text>

      <MonthCalendar
        selected={draft.preferredDate}
        onSelect={(date) => draft.set({ preferredDate: date })}
      />

      <View className="mt-auto gap-3">
        <Button
          label="Любая дата"
          variant={draft.preferredDate === null ? 'accent' : 'outline'}
          onPress={() => draft.set({ preferredDate: null })}
        />
        <Button label="Дальше" onPress={() => router.push('/(onboarding)/step2')} />
      </View>
    </View>
  );
}
