import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

/** Временная заглушка экрана в стиле «досье» — заменяется контентом в Фазах 1–4. */
export function PlaceholderScreen({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-paper px-8 dark:bg-night">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 3 }}
        className="text-xl font-bold uppercase text-ink dark:text-paper-dark"
      >
        {title}
      </Text>
      <View className="mb-4 mt-3 h-[2px] w-16 bg-accent" />
      {hint ? (
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="text-center text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]"
        >
          {hint}
        </Text>
      ) : null}
    </View>
  );
}
