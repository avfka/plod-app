import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { FilterChip } from '@/components/ui/filter-chip';
import { Tag } from '@/components/ui/tag';
import { useDanceDirections } from '@/features/onboarding/use-directories';
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
  const { data: directions = [] } = useDanceDirections();
  const canProceed = draft.interestedInMc || draft.interestedInChamp;

  const toggleDirection = (directionId: string) => {
    const directionIds = draft.directionIds.includes(directionId)
      ? draft.directionIds.filter((id) => id !== directionId)
      : [...draft.directionIds, directionId];
    draft.set({ directionIds });
  };

  return (
    <View className="flex-1 bg-paper dark:bg-night">
      <ScrollView contentContainerClassName="gap-4 px-6 pb-6 pt-6">
        <Tag label="Интересы" />
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
          className="text-lg font-bold uppercase text-ink dark:text-paper-dark"
        >
          Что вас двигает?
        </Text>
        <Text style={{ fontFamily: Fonts.sans }} className="text-sm leading-5 text-[#6B6560] dark:text-[#A39D93]">
          Это станет первой памятью ленты. Позже она будет уточняться по вашим действиям.
        </Text>

        <View className="flex-row flex-wrap gap-2">
          {directions.map((direction) => (
            <FilterChip
              key={direction.id}
              label={direction.name}
              dotColor={direction.color_hex}
              selected={draft.directionIds.includes(direction.id)}
              onPress={() => toggleDirection(direction.id)}
            />
          ))}
        </View>

        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
          className="mt-2 text-xs font-bold uppercase text-ink dark:text-paper-dark"
        >
          Формат событий
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
      </ScrollView>

      <View className="px-6 pb-6">
        <Button
          label="Дальше"
          disabled={!canProceed}
          onPress={() => router.push('/(onboarding)/step3')}
        />
      </View>
    </View>
  );
}
