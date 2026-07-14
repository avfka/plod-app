import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

export function ScreenMasthead({ title, meta }: { title: string; meta?: string }) {
  return (
    <View className="flex-row items-end justify-between border-b border-ink bg-accent px-4 pb-4 pt-5 dark:border-paper-dark">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 2.5 }}
        className="text-2xl font-bold uppercase text-paper"
      >
        {title}
      </Text>
      {meta ? (
        <Text style={{ fontFamily: Fonts.mono }} className="pb-0.5 text-[10px] text-paper">
          {meta}
        </Text>
      ) : null}
    </View>
  );
}
