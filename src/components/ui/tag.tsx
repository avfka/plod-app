import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

/** Красная метка как на CCTV-кадре: FEMALE / SCAN 02/76. */
export function Tag({ label, color = '#E8352A' }: { label: string; color?: string }) {
  return (
    <View style={{ backgroundColor: color }} className="self-start rounded-[2px] px-1.5 py-0.5">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className="text-[10px] font-bold uppercase text-paper"
      >
        {label}
      </Text>
    </View>
  );
}

/** Строка «поле досье»: KEY .... value, как Brand:/Season: на pass card. */
export function DossierRow({
  label,
  value,
  inverted = false,
}: {
  label: string;
  value: string;
  inverted?: boolean;
}) {
  return (
    <View className="flex-row items-baseline justify-between gap-3 py-1">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
        className={`text-xs font-bold uppercase ${
          inverted ? 'text-paper-dark' : 'text-ink dark:text-paper-dark'
        }`}
      >
        {label}
      </Text>
      <View
        className={`mx-1 flex-1 border-b border-dashed ${
          inverted ? 'border-[#39342E]' : 'border-[#D8D2C6] dark:border-[#39342E]'
        }`}
      />
      <Text
        style={{ fontFamily: Fonts.mono }}
        className={`shrink text-right text-xs ${
          inverted ? 'text-paper-dark' : 'text-ink dark:text-paper-dark'
        }`}
      >
        {value}
      </Text>
    </View>
  );
}
