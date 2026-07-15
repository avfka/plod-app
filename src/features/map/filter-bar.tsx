import { Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { FilterChip } from '@/components/ui/filter-chip';
import { useDanceDirections } from '@/features/onboarding/use-directories';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

function todayYmd() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;
}

/** Компактная панель фильтров (карта и список): дата · тип · направление · бесплатные. */
export function FilterBar() {
  const filters = useFilters();
  const { data: directions } = useDanceDirections();
  const today = todayYmd();
  const activeCount =
    Number(filters.date !== null) +
    Number(filters.directionId !== null) +
    Number(filters.freeOnly) +
    Number(filters.types.length > 0);

  const reset = () =>
    filters.set({
      date: null,
      types: [],
      directionId: null,
      choreographerId: null,
      freeOnly: false,
    });

  const toggleType = (t: 'masterclass' | 'championship') => {
    const has = filters.types.includes(t);
    const next = has ? filters.types.filter((x) => x !== t) : [...filters.types, t];
    filters.set({ types: next });
  };

  return (
    <View className="gap-2.5 border-b border-ink bg-paper py-3 dark:border-paper-dark dark:bg-night">
      <View className="flex-row items-center justify-between px-3">
        <Text
          style={{ fontFamily: Fonts.sans }}
          className="text-sm font-semibold text-ink dark:text-paper-dark"
        >
          Быстрый выбор
        </Text>
        {activeCount > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Сбросить фильтры, выбрано ${activeCount}`}
            onPress={reset}
            className="min-h-8 justify-center px-1 active:opacity-60"
          >
            <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold text-accent">
              Сбросить ({activeCount})
            </Text>
          </Pressable>
        ) : null}
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-3"
      >
        <FilterChip
          label={filters.date === today ? 'Сегодня' : filters.date ? filters.date : 'Любая дата'}
          selected={filters.date !== null}
          onPress={() => filters.set({ date: filters.date === null ? today : null })}
        />
        <FilterChip
          label="МК"
          selected={filters.types.includes('masterclass')}
          onPress={() => toggleType('masterclass')}
        />
        <FilterChip
          label="Чемп"
          selected={filters.types.includes('championship')}
          onPress={() => toggleType('championship')}
        />
        {(directions ?? []).map((d) => (
          <FilterChip
            key={d.id}
            label={d.name}
            dotColor={d.color_hex}
            selected={filters.directionId === d.id}
            onPress={() =>
              filters.set({ directionId: filters.directionId === d.id ? null : d.id })
            }
          />
        ))}
      </ScrollView>
      <Pressable
        accessibilityRole="switch"
        accessibilityState={{ checked: filters.freeOnly }}
        accessibilityLabel="Показывать только бесплатные события"
        onPress={() => filters.set({ freeOnly: !filters.freeOnly })}
        className="mx-3 min-h-11 flex-row items-center justify-between border-t border-dashed border-[#D8D2C6] pt-2 active:opacity-70 dark:border-[#39342E]"
      >
        <Text
          style={{ fontFamily: Fonts.sans }}
          className="text-sm font-medium text-ink dark:text-paper-dark"
        >
          Только бесплатные
        </Text>
        <Switch
          value={filters.freeOnly}
          trackColor={{ true: palette.red }}
          accessibilityElementsHidden
          pointerEvents="none"
        />
      </Pressable>
    </View>
  );
}
