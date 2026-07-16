import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { EventWithRelations } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';
import type { Tables } from '@/types/database';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function MapEventPreview({ event, session, onClose }: { event: EventWithRelations; session: Tables<'event_sessions'>; onClose: () => void }) {
  const router = useRouter();
  return (
    <View
      style={{ zIndex: 20, elevation: 20 }}
      className="absolute bottom-4 left-[18px] right-[18px] border border-ink border-t-4 border-t-accent bg-paper p-4 dark:border-paper-dark dark:bg-night-element"
    >
      <Pressable accessibilityRole="button" accessibilityLabel="Закрыть досье" onPress={onClose} className="absolute right-2 top-2 z-10 h-10 w-10 items-end">
        <Ionicons name="close" size={22} color={palette.red} />
      </Pressable>
      <Text numberOfLines={2} style={{ fontFamily: Fonts.mono, letterSpacing: 0.5 }} className="pr-9 text-base font-bold uppercase leading-5 text-ink dark:text-paper-dark">{event.title}</Text>
      {event.choreographer ? <Text className="mt-1 text-sm text-[#6B6560] dark:text-[#A39D93]">{event.choreographer.name}</Text> : null}
      <View className="mt-3 border-t border-dashed border-[#BDB5AA] pt-3">
        <View className="min-h-9 flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2"><Ionicons name="calendar-outline" size={18} color={palette.red} /><Text style={{ fontFamily: Fonts.mono }} className="text-xs text-ink dark:text-paper-dark">{formatDate(session.starts_at)}</Text></View>
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs font-bold uppercase text-accent">{event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} ₽` : 'Цена позже'}</Text>
        </View>
        <View className="min-h-9 flex-row items-center gap-2 border-t border-dashed border-[#D8D2C6] dark:border-[#39342E]"><Ionicons name="location-outline" size={18} color={palette.red} /><Text numberOfLines={1} className="min-w-0 flex-1 text-sm text-ink dark:text-paper-dark">{session.address}</Text></View>
      </View>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id, sessionId: session.id } })}
        className="mt-3 min-h-12 items-center justify-center bg-accent active:scale-[0.99]"
      >
        <Text style={{ fontFamily: Fonts.mono, letterSpacing: 1 }} className="text-xs font-bold uppercase text-paper">Открыть досье</Text>
      </Pressable>
    </View>
  );
}
