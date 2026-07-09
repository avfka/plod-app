import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Tag } from '@/components/ui/tag';
import { useChoreographerSearch } from '@/features/onboarding/use-directories';
import { saveOnboarding, useOnboardingDraft } from '@/features/onboarding/use-onboarding';
import { Fonts } from '@/theme';

export default function Step3Choreographer() {
  const router = useRouter();
  const draft = useOnboardingDraft();
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: results } = useChoreographerSearch(query);

  const finish = async (patch: {
    favoriteChoreographerId: string | null;
    subscribeChoreographerName: string | null;
  }) => {
    setSaving(true);
    setError(null);
    try {
      await saveOnboarding({
        preferredDate: draft.preferredDate,
        interestedInMc: draft.interestedInMc,
        interestedInChamp: draft.interestedInChamp,
        ...patch,
      });
      router.replace('/(tabs)/map');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Не удалось сохранить');
      setSaving(false);
    }
  };

  const noResults = query.trim().length >= 2 && (results ?? []).length === 0;

  return (
    <View className="flex-1 gap-4 bg-paper px-6 py-6 dark:bg-night">
      <Tag label="Шаг 3 / 3" />
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-lg font-bold uppercase text-ink dark:text-paper-dark"
      >
        Любимый хореограф?
      </Text>

      <TextInput
        className="h-12 rounded-[4px] border border-ink bg-paper px-3 text-ink dark:border-paper-dark dark:bg-night-element dark:text-paper-dark"
        style={{ fontFamily: Fonts.mono }}
        placeholder="Имя хореографа…"
        placeholderTextColor="#8A847C"
        value={query}
        onChangeText={setQuery}
      />

      <View className="gap-2">
        {(results ?? []).map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            onPress={() =>
              finish({ favoriteChoreographerId: c.id, subscribeChoreographerName: null })
            }
            className="flex-row items-center justify-between rounded-[4px] border border-ink px-3 py-3 active:opacity-80 dark:border-paper-dark"
          >
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-sm text-ink dark:text-paper-dark"
            >
              {c.name} {c.is_verified ? '✓' : ''}
            </Text>
            <Text style={{ fontFamily: Fonts.mono }} className="text-sm text-accent">
              выбрать
            </Text>
          </Pressable>
        ))}
        {noResults ? (
          <View className="gap-2 rounded-[4px] border border-dashed border-[#8A847C] p-3">
            <Text
              style={{ fontFamily: Fonts.mono }}
              className="text-xs text-[#6B6560] dark:text-[#A39D93]"
            >
              Не нашли. Сообщим, когда «{query.trim()}» появится в приложении.
            </Text>
            <Button
              label="Подписаться"
              variant="accent"
              loading={saving}
              onPress={() =>
                finish({ favoriteChoreographerId: null, subscribeChoreographerName: query.trim() })
              }
            />
          </View>
        ) : null}
      </View>

      {error ? (
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-accent">
          {error}
        </Text>
      ) : null}

      <View className="mt-auto">
        <Button
          label="Пропустить"
          variant="ghost"
          loading={saving}
          onPress={() =>
            finish({ favoriteChoreographerId: null, subscribeChoreographerName: null })
          }
        />
      </View>
    </View>
  );
}
