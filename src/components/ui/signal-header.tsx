import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

export function SignalHeader({
  eyebrow,
  title,
  meta,
}: {
  eyebrow: string;
  title: string;
  meta?: string;
}) {
  return (
    <View className="border-b border-ink bg-accent px-4 pb-3 pt-3 dark:border-paper-dark">
      <View className="mb-2 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <View className="h-2 w-2 rounded-full bg-paper" />
          <Text
            style={{ fontFamily: Fonts.mono, letterSpacing: 1.5 }}
            className="text-[9px] font-bold uppercase text-paper"
          >
            {eyebrow}
          </Text>
        </View>
        {meta ? (
          <Text style={{ fontFamily: Fonts.mono }} className="text-[9px] uppercase text-paper/80">
            {meta}
          </Text>
        ) : null}
      </View>
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 3 }}
        className="text-2xl font-bold uppercase text-paper"
      >
        {title}
      </Text>
      <View className="mt-3 flex-row items-center">
        <View className="h-px flex-1 bg-paper/70" />
        <View className="h-2 w-2 rounded-full border border-paper" />
        <View className="h-px w-8 bg-paper/70" />
      </View>
    </View>
  );
}
