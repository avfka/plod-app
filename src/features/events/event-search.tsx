import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Fonts } from '@/theme';

export function EventSearch({
  value,
  filtersVisible,
  activeFilterCount,
  onChangeText,
  onToggleFilters,
}: {
  value: string;
  filtersVisible: boolean;
  activeFilterCount: number;
  onChangeText: (value: string) => void;
  onToggleFilters: () => void;
}) {
  return (
    <View className="flex-row gap-2.5 border-b border-[#39342E] bg-night px-[18px] py-3">
      <View className="h-12 min-w-0 flex-1 flex-row items-center rounded-[2px] border border-paper-dark px-3">
        <Ionicons name="search-outline" size={22} color="#F5F1E8" />
        <View className="mx-3 h-7 w-[2px] bg-accent" />
        <TextInput
          accessibilityLabel="Поиск событий"
          value={value}
          onChangeText={onChangeText}
          placeholder="Стиль, хореограф, площадка"
          placeholderTextColor="#A39D93"
          returnKeyType="search"
          clearButtonMode="while-editing"
          style={{ fontFamily: Fonts.mono }}
          className="min-w-0 flex-1 py-0 text-sm text-paper-dark outline-none"
        />
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Фильтры${activeFilterCount > 0 ? `, выбрано ${activeFilterCount}` : ''}`}
        accessibilityState={{ expanded: filtersVisible }}
        onPress={onToggleFilters}
        className="relative h-12 w-[94px] flex-row items-center justify-center gap-1.5 rounded-[2px] border border-paper-dark bg-night active:opacity-70"
      >
        <Ionicons name="options-outline" size={21} color="#F5F1E8" />
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="text-[11px] font-bold uppercase text-paper-dark"
        >
          Фильтры
        </Text>
      </Pressable>
    </View>
  );
}
