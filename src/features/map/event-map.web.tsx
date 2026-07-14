import { Text, View } from 'react-native';

import type { EventWithRelations } from '@/features/events/use-events';
import { Fonts } from '@/theme';

/** Web-превью без нативной карты — честный плейсхолдер (спек §9, вариант 1). */
export function EventMap(_props: {
  events: EventWithRelations[];
  favoriteChoreographerId?: string | null;
}) {
  return (
    <View className="flex-1 items-center justify-center bg-paper px-8 dark:bg-night">
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
        className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
      >
        Карта доступна в приложении
      </Text>
      <View className="mb-3 mt-3 h-[2px] w-16 bg-accent" />
      <Text
        style={{ fontFamily: Fonts.mono }}
        className="text-center text-xs text-[#6B6560] dark:text-[#A39D93]"
      >
        Google Maps работает на iOS/Android. В web-превью пользуйтесь вкладкой «Список».
      </Text>
    </View>
  );
}
