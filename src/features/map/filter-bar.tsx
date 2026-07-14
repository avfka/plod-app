import { ScrollView, Switch, Text, View } from 'react-native';

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

  const toggleType = (t: 'masterclass' | 'championship') => {
    const has = filters.types.includes(t);
    const next = has ? filters.types.filter((x) => x !== t) : [...filters.types, t];
    if (next.length > 0) filters.set({ types: next }); // хотя бы один тип
  };

  return (
    <View className="gap-2 border-b border-ink bg-paper px-3 py-3 dark:border-paper-dark dark:bg-night">
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-1.5">
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
      <View className="flex-row items-center justify-between border-t border-dashed border-[#D8D2C6] pt-2 dark:border-[#39342E]">
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
          className="text-[10px] font-bold uppercase text-[#6B6560] dark:text-[#A39D93]"
        >
          Только бесплатные
        </Text>
        <Switch
          value={filters.freeOnly}
          onValueChange={(v) => filters.set({ freeOnly: v })}
          trackColor={{ true: palette.red }}
        />
      </View>
    </View>
  );
}
