import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Fonts } from '@/theme';

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function ymd(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/** Компактный месячный календарь в стиле «досье» (Шаг 1 опросника). */
export function MonthCalendar({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (date: string) => void;
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7; // Пн = 0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayStr = ymd(now.getFullYear(), now.getMonth(), now.getDate());

  const cells: (number | null)[] = [
    ...Array.from({ length: firstWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1); } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1); } else setMonth(month + 1);
  };

  return (
    <View className="rounded-lg border border-ink bg-paper p-3 dark:border-paper-dark dark:bg-night-element">
      <View className="mb-2 flex-row items-center justify-between">
        <Pressable onPress={prevMonth} hitSlop={8} accessibilityRole="button">
          <Text style={{ fontFamily: Fonts.mono }} className="text-lg text-accent">‹</Text>
        </Pressable>
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
          className="text-sm font-bold uppercase text-ink dark:text-paper-dark"
        >
          {MONTHS[month]} {year}
        </Text>
        <Pressable onPress={nextMonth} hitSlop={8} accessibilityRole="button">
          <Text style={{ fontFamily: Fonts.mono }} className="text-lg text-accent">›</Text>
        </Pressable>
      </View>

      <View className="flex-row">
        {WEEKDAYS.map((w) => (
          <Text
            key={w}
            style={{ fontFamily: Fonts.mono }}
            className="flex-1 text-center text-[10px] uppercase text-[#6B6560] dark:text-[#A39D93]"
          >
            {w}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap">
        {cells.map((day, i) => {
          if (day === null) return <View key={`e${i}`} style={{ width: `${100 / 7}%` }} className="h-10" />;
          const dateStr = ymd(year, month, day);
          const isSelected = selected === dateStr;
          const isToday = dateStr === todayStr;
          return (
            <Pressable
              key={dateStr}
              onPress={() => onSelect(dateStr)}
              style={{ width: `${100 / 7}%` }}
              className="h-10 items-center justify-center"
              accessibilityRole="button"
            >
              <View
                className={`h-8 w-8 items-center justify-center rounded-[4px] ${
                  isSelected ? 'bg-accent' : isToday ? 'border border-accent' : ''
                }`}
              >
                <Text
                  style={{ fontFamily: Fonts.mono }}
                  className={`text-xs ${
                    isSelected ? 'font-bold text-paper' : 'text-ink dark:text-paper-dark'
                  }`}
                >
                  {day}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
