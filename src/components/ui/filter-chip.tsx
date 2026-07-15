import { Pressable, Text, View } from 'react-native';

import { Fonts } from '@/theme';

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Цвет направления из dance_directions.color_hex — квадрат-индикатор слева. */
  dotColor?: string;
};

/** Чип-«метка» как красные теги на CCTV-кадре: прямоугольник, моно, верхний регистр. */
export function FilterChip({ label, selected = false, onPress, dotColor }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      accessibilityLabel={`${label}${selected ? ', выбрано' : ''}`}
      className={`min-h-10 flex-row items-center gap-1.5 rounded-[2px] border px-3 active:scale-[0.98] ${
        selected
          ? 'border-accent bg-accent'
          : 'border-ink bg-transparent dark:border-paper-dark'
      }`}
    >
      {dotColor ? (
        <View style={{ backgroundColor: dotColor }} className="h-2 w-2 rounded-[1px]" />
      ) : null}
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className={`text-[12px] font-bold uppercase ${
          selected ? 'text-paper' : 'text-ink dark:text-paper-dark'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
