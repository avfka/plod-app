import { Text, View } from 'react-native';

import { SignalHeader } from '@/components/ui/signal-header';
import { Fonts } from '@/theme';

/** Временная заглушка экрана в стиле «досье» — заменяется контентом в Фазах 1–4. */
export function PlaceholderScreen({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-1 bg-paper dark:bg-night">
      <SignalHeader eyebrow="PLOD / Restricted" title={title} meta="No signal" />
      <View className="flex-1 items-center justify-center px-8">
        <View className="mb-5 h-20 w-20 items-center justify-center border border-accent">
          <View className="h-3 w-3 rounded-full bg-accent" />
        </View>
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
    </View>
  );
}
