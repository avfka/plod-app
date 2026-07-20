import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

export function ScreenMasthead({ title, meta }: { title: string; meta?: string }) {
  return (
    <View className="flex-row items-end justify-between border-b-2 border-accent bg-accent px-[18px] pb-4 pt-6">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 2.5 }}
        className="text-[26px] font-bold uppercase text-paper-dark"
      >
        {title}
      </Text>
      {meta ? (
        <Text style={{ fontFamily: Fonts.sans }} className="pb-1 text-xs font-medium text-paper">
          {meta}
        </Text>
      ) : null}
    </View>
  );
}
