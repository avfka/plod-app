import { Pressable, Text, View } from 'react-native';

import { useNow } from '@/hooks/use-now';
import type { Tables } from '@/types/database';
import { Fonts, palette } from '@/theme';

type Session = Tables<'event_sessions'>;

function sessionDay(iso: string) {
  const date = new Date(iso);
  const today = new Date();
  if (date.toDateString() === today.toDateString()) return 'Сегодня';
  return date
    .toLocaleDateString('ru-RU', { weekday: 'short', day: '2-digit', month: 'short' })
    .replace('.', '');
}

function sessionTime(start: string, end: string | null) {
  const format = (iso: string) =>
    new Date(iso).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  return end ? `${format(start)} — ${format(end)}` : format(start);
}

export function bookingDate(iso: string) {
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
}

export function RedThreadTimeline({
  sessions,
  selectedId,
  seatsLeft,
  onSelect,
}: {
  sessions: Session[];
  selectedId: string;
  seatsLeft: number | null;
  onSelect: (id: string) => void;
}) {
  const now = useNow();
  const nextId = sessions.find(
    (session) => new Date(session.ends_at ?? session.starts_at).getTime() > now,
  )?.id;

  return (
    <View className="flex-1">
      {sessions.map((session, index) => {
        const selected = session.id === selectedId;
        const upcoming = new Date(session.ends_at ?? session.starts_at).getTime() > now;
        return (
          <View key={session.id} className="flex-row">
            <View className="w-10 items-center">
              {index > 0 ? <View className="h-4 w-[2px] bg-thread" /> : <View className="h-4" />}
              <View
                style={{ borderColor: selected ? palette.red : palette.ink }}
                className="z-10 h-6 w-6 items-center justify-center rounded-full border bg-paper dark:bg-night-element"
              >
                {selected ? <View className="h-3 w-3 rounded-full bg-accent" /> : null}
              </View>
              {index < sessions.length - 1 ? <View className="min-h-14 w-[2px] flex-1 bg-thread" /> : null}
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityState={{ selected, disabled: !upcoming }}
              accessibilityLabel={`${sessionDay(session.starts_at)}, ${sessionTime(session.starts_at, session.ends_at)}, ${session.address}`}
              disabled={!upcoming}
              onPress={() => onSelect(session.id)}
              className={`relative mb-3 min-h-[76px] flex-1 justify-center rounded-[2px] border px-4 py-3 active:opacity-70 ${
                selected ? 'border-accent' : 'border-[#A39D93] dark:border-[#6E6860]'
              } ${upcoming ? '' : 'opacity-40'}`}
            >
              {session.id === nextId ? (
                <View className="absolute -top-3 left-[-8px] rotate-[-6deg] rounded-[2px] border border-accent bg-paper px-2 py-0.5 dark:bg-night-element">
                  <Text
                    style={{ fontFamily: Fonts.mono, letterSpacing: 1 }}
                    className="text-[10px] font-bold uppercase text-accent"
                  >
                    Следующее
                  </Text>
                </View>
              ) : null}
              <View className="flex-row items-center justify-between gap-3">
                <View className="gap-0.5">
                  <Text
                    style={{ fontFamily: Fonts.mono, letterSpacing: 0.8 }}
                    className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
                  >
                    {sessionDay(session.starts_at)}
                  </Text>
                  <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-ink dark:text-paper-dark">
                    {sessionTime(session.starts_at, session.ends_at)}
                  </Text>
                  <Text style={{ fontFamily: Fonts.mono }} className="text-[11px] text-[#6B6560] dark:text-[#A39D93]">
                    {seatsLeft == null ? 'Без лимита мест' : `Осталось ${seatsLeft} мест`}
                  </Text>
                </View>
                <Text style={{ fontFamily: Fonts.mono }} className="text-3xl font-light text-ink dark:text-paper-dark">
                  ›
                </Text>
              </View>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
