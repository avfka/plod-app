import { Pressable, Text } from 'react-native';

export type FilterChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  /** Цвет направления из dance_directions.color_hex — точка-индикатор слева. */
  dotColor?: string;
};

export function FilterChip({ label, selected = false, onPress, dotColor }: FilterChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`h-9 flex-row items-center gap-1.5 rounded-full border px-3.5 active:opacity-80 ${
        selected
          ? 'border-primary bg-primary'
          : 'border-[#E0E1E6] bg-transparent dark:border-[#2E3135]'
      }`}
    >
      {dotColor ? (
        <Text style={{ color: dotColor }} className="text-xs">
          ●
        </Text>
      ) : null}
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-white' : 'text-[#17171C] dark:text-white'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
