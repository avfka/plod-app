import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  return ({ color, size }: { color: ColorValue; size: number }) => (
    <Ionicons name={name} color={color} size={size} />
  );
}

export default function TabsLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          backgroundColor: theme.background,
          borderTopColor: theme.borderMuted,
        },
        tabBarLabelStyle: { fontFamily: Fonts.mono, fontSize: 10 },
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
      <Tabs.Screen name="map" options={{ title: 'Карта', tabBarIcon: tabIcon('map-outline') }} />
      <Tabs.Screen name="list" options={{ title: 'Список', tabBarIcon: tabIcon('list-outline') }} />
      <Tabs.Screen
        name="venues"
        options={{ title: 'Площадки', tabBarIcon: tabIcon('business-outline') }}
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
