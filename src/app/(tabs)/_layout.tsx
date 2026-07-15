import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import { Platform, type ColorValue } from 'react-native';

import { useProfile } from '@/features/profile/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  const theme = useTheme();
  const { data: profile } = useProfile();
  const applyProfileDefaults = useFilters((s) => s.applyProfileDefaults);
  const defaultsApplied = useRef(false);

  // дефолт-фильтры карты = ответы опросника (спек §6), один раз за сессию
  useEffect(() => {
    if (profile && !defaultsApplied.current) {
      defaultsApplied.current = true;
      applyProfileDefaults(profile);
    }
  }, [profile, applyProfileDefaults]);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: palette.red,
          borderTopWidth: 2,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '600' },
        headerShown: false,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontFamily: Fonts.mono,
          fontWeight: 'bold',
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: 'Карта',
          tabBarIcon: tabIcon('scan-outline'),
          href: Platform.OS === 'web' ? null : '/map',
        }}
      />
      <Tabs.Screen
        name="list"
        options={{
          title: 'События',
          tabBarIcon: tabIcon('albums-outline'),
          tabBarStyle: {
            backgroundColor: '#12100E',
            borderTopColor: palette.red,
            borderTopWidth: 2,
            height: 72,
            paddingBottom: 8,
            paddingTop: 8,
          },
        }}
      />
      <Tabs.Screen
        name="venues"
        options={{
          title: 'Площадки',
          tabBarIcon: tabIcon('business-outline'),
          href: null,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Мои записи', tabBarIcon: tabIcon('calendar-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Профиль', tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}
