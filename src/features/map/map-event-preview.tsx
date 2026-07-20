import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import type { EventWithRelations } from '@/features/events/use-events';
import { Fonts, palette } from '@/theme';
import type { Tables } from '@/types/database';

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function MapEventPreview({
  event,
  session,
  onClose,
  inline = false,
  trinity = false,
  related = [],
  onSelectRelated,
}: {
  event: EventWithRelations;
  session: Tables<'event_sessions'>;
  onClose: () => void;
  inline?: boolean;
  trinity?: boolean;
  related?: { eventId: string; title: string; reason: string }[];
  onSelectRelated?: (eventId: string) => void;
}) {
  const router = useRouter();
  const nextRelated = related[0];

  if (trinity) {
    return (
      <View
        className="plod-map-dossier border border-paper-dark bg-night-element p-3 active:opacity-90"
      >
        {event.direction ? (
          <View style={{ backgroundColor: event.direction.color_hex }} className="self-start px-1.5 py-0.5">
            <Text style={{ fontFamily: Fonts.mono }} className="text-[10px] font-bold uppercase text-paper">
              {event.direction.name}
            </Text>
          </View>
        ) : null}
        <Pressable
          accessibilityRole="link"
          accessibilityLabel={`Открыть досье: ${event.title}`}
          onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id, sessionId: session.id } })}
        >
          <Text
            numberOfLines={4}
            style={{ fontFamily: Fonts.mono, letterSpacing: 0.6 }}
            className="mt-2 text-[13px] font-bold uppercase leading-4 text-paper-dark md:text-base md:leading-5"
          >
            {event.title}
          </Text>
        </Pressable>
        {event.choreographer ? (
          <Text numberOfLines={1} className="mt-2 text-xs text-[#A39D93]">
            {event.choreographer.name}
          </Text>
        ) : null}
        <View className="mt-auto gap-2 border-t border-dashed border-[#4A443D] pt-3">
          <View className="flex-row items-center gap-2">
            <Ionicons name="calendar-outline" size={14} color="#A39D93" />
            <Text style={{ fontFamily: Fonts.mono }} className="text-[10px] text-[#C6C0B7]">
              {formatDate(session.starts_at)}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <Ionicons name="location-outline" size={14} color="#A39D93" />
            <Text numberOfLines={2} className="min-w-0 flex-1 text-[11px] leading-4 text-[#C6C0B7]">
              {session.address}
            </Text>
          </View>
          <View className="flex-row flex-wrap items-center justify-between gap-1 border-t border-dashed border-[#39342E] pt-2">
            <Text style={{ fontFamily: Fonts.mono }} className="text-sm font-bold uppercase text-accent">
              {event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} ₽` : 'Цена позже'}
            </Text>
            {nextRelated && onSelectRelated ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`${nextRelated.reason}. Перейти к событию: ${nextRelated.title}`}
                onPress={() => onSelectRelated(nextRelated.eventId)}
                className="min-h-7 flex-row items-center gap-1 border border-accent px-1.5 active:bg-accent/20"
              >
                <Ionicons name="git-network-outline" size={12} color={palette.red} />
                <Text style={{ fontFamily: Fonts.mono }} className="text-[9px] font-bold uppercase text-accent">
                  {nextRelated.reason} · {related.length} →
                </Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View
      style={{ zIndex: 20, elevation: 20 }}
      className={`${inline ? 'relative w-[310px]' : 'absolute bottom-4 left-[18px] right-[18px]'} border border-paper-dark border-t-4 border-t-accent bg-night p-4`}
    >
      <Pressable accessibilityRole="button" accessibilityLabel="Закрыть досье" onPress={onClose} className="absolute right-2 top-2 z-10 h-10 w-10 items-end">
        <Ionicons name="close" size={22} color={palette.red} />
      </Pressable>
      <Text numberOfLines={2} style={{ fontFamily: Fonts.mono, letterSpacing: 0.5 }} className="pr-9 text-base font-bold uppercase leading-5 text-paper-dark">{event.title}</Text>
      {event.choreographer ? <Text className="mt-1 text-sm text-[#A39D93]">{event.choreographer.name}</Text> : null}
      <View className="mt-3 border-t border-dashed border-[#4A443D] pt-3">
        <View className="min-h-9 flex-row items-center justify-between gap-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2"><Ionicons name="calendar-outline" size={18} color={palette.red} /><Text style={{ fontFamily: Fonts.mono }} className="text-xs text-paper-dark">{formatDate(session.starts_at)}</Text></View>
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs font-bold uppercase text-accent">{event.is_free ? 'Бесплатно' : event.price != null ? `${Number(event.price)} ₽` : 'Цена позже'}</Text>
        </View>
        <View className="min-h-9 flex-row items-center gap-2 border-t border-dashed border-[#39342E]"><Ionicons name="location-outline" size={18} color={palette.red} /><Text numberOfLines={2} className="min-w-0 flex-1 text-sm text-paper-dark">{session.address}</Text></View>
      </View>
      <Pressable
        accessibilityRole="link"
        onPress={() => router.push({ pathname: '/event/[id]', params: { id: event.id, sessionId: session.id } })}
        className="mt-3 min-h-12 items-center justify-center bg-accent active:scale-[0.99]"
      >
        <Text style={{ fontFamily: Fonts.mono, letterSpacing: 1 }} className="text-xs font-bold uppercase text-paper">Открыть досье</Text>
      </Pressable>
      {nextRelated && onSelectRelated ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${nextRelated.reason}. Перейти к событию: ${nextRelated.title}`}
          onPress={() => onSelectRelated(nextRelated.eventId)}
          className="mt-2 min-h-11 flex-row items-center justify-between border border-accent px-3 active:bg-accent/20"
        >
          <View className="min-w-0 flex-1">
            <Text style={{ fontFamily: Fonts.mono }} className="text-[10px] font-bold uppercase text-accent">
              {nextRelated.reason} · {related.length}
            </Text>
            <Text numberOfLines={1} className="mt-0.5 text-xs text-paper-dark">
              {nextRelated.title}
            </Text>
          </View>
          <Ionicons name="arrow-forward" size={18} color={palette.red} />
        </Pressable>
      ) : null}
    </View>
  );
}
