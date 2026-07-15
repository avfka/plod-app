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
    <View className="flex-row gap-2.5 bg-night px-[18px] pt-3">
      <View className="h-14 min-w-0 flex-1 flex-row items-center rounded-[6px] border border-[#A39D93] px-3 dark:border-[#A39D93]">
        <Ionicons name="search-outline" size={25} color="#A39D93" />
        <View className="mx-3 h-8 w-[2px] bg-accent" />
        <TextInput
          accessibilityLabel="Поиск событий"
          value={value}
          onChangeText={onChangeText}
          placeholder="Стиль, хореограф, площадка"
          placeholderTextColor="#8A847C"
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
        className={`h-14 w-[84px] flex-row items-center justify-center gap-1.5 rounded-[2px] border active:opacity-70 ${
          filtersVisible
            ? 'border-paper-dark'
            : 'border-[#A39D93]'
        }`}
      >
        <Ionicons name="options-outline" size={23} color="#A39D93" />
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="text-[11px] font-bold text-paper-dark"
        >
          Фильтры
        </Text>
      </Pressable>
    </View>
  );
}
