import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

import { Fonts, palette } from '@/theme';

export function DiscoveryModeToggle({ mode, inverted = false }: { mode: 'list' | 'map'; inverted?: boolean }) {
  const router = useRouter();
  const options = [
    { value: 'list' as const, label: 'Список', icon: 'list-outline' as const, route: '/list' as const },
    { value: 'map' as const, label: 'Карта', icon: 'map-outline' as const, route: '/map' as const },
  ];

  return (
    <View className={`flex-row border-b px-[18px] py-3 ${inverted ? 'border-paper-dark bg-night' : 'border-ink bg-paper dark:border-paper-dark dark:bg-night'}`}>
      {options.map((option) => {
        const active = mode === option.value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => { if (!active) router.replace(option.route); }}
            className={`min-h-12 flex-1 flex-row items-center justify-center gap-2 border ${active ? 'border-accent bg-[#FCE8E5]' : inverted ? 'border-paper-dark bg-night' : 'border-ink bg-paper dark:border-paper-dark dark:bg-night'}`}
          >
            <Ionicons name={option.icon} size={21} color={active ? palette.red : inverted ? '#F5F1E8' : '#141210'} />
            <Text style={{ fontFamily: Fonts.mono, letterSpacing: 1 }} className={`text-xs font-bold uppercase ${active ? 'text-accent' : inverted ? 'text-paper-dark' : 'text-ink dark:text-paper-dark'}`}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
