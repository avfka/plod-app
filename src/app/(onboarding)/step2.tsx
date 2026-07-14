import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { useOnboardingDraft } from '@/features/onboarding/use-onboarding';
import { Fonts } from '@/theme';

function TypeCard({
  icon,
  title,
  hint,
  selected,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  hint: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`gap-2 rounded-[2px] border p-4 active:scale-[0.99] ${
        selected
          ? 'border-accent bg-accent/10'
          : 'border-ink bg-paper dark:border-paper-dark dark:bg-night-element'
      }`}
    >
      <Ionicons name={icon} size={24} color={selected ? '#E8352A' : '#6B6560'} />
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
      >
        {title} {selected ? '✓' : ''}
      </Text>
      <Text
        style={{ fontFamily: Fonts.mono }}
        className="text-xs text-[#6B6560] dark:text-[#A39D93]"
      >
        {hint}
      </Text>
    </Pressable>
  );
}

export default function Step2Types() {
  const router = useRouter();
  const draft = useOnboardingDraft();
  const canProceed = draft.interestedInMc || draft.interestedInChamp;

  return (
    <View className="flex-1 gap-4 bg-paper px-6 py-6 dark:bg-night">
      <Tag label="Формат" />
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-lg font-bold uppercase text-ink dark:text-paper-dark"
      >
        Что вам интересно?
      </Text>

      <TypeCard
        icon="body-outline"
        title="Мастер-классы"
        hint="Учиться у хореографов"
        selected={draft.interestedInMc}
        onPress={() => draft.set({ interestedInMc: !draft.interestedInMc })}
      />
      <TypeCard
        icon="trophy-outline"
        title="Чемпионаты"
        hint="Соревноваться и смотреть"
        selected={draft.interestedInChamp}
        onPress={() => draft.set({ interestedInChamp: !draft.interestedInChamp })}
      />

      <View className="mt-auto">
        <Button
          label="Дальше"
          disabled={!canProceed}
          onPress={() => router.push('/(onboarding)/step3')}
        />
      </View>
    </View>
  );
}
