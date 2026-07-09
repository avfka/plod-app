import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

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
        tabBarStyle: { backgroundColor: theme.background, borderTopColor: theme.border },
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        sceneStyle: { backgroundColor: theme.background },
      }}
    >
      <Tabs.Screen name="map" options={{ title: 'Карта', tabBarIcon: tabIcon('map') }} />
      <Tabs.Screen name="list" options={{ title: 'Список', tabBarIcon: tabIcon('list') }} />
      <Tabs.Screen name="venues" options={{ title: 'Площадки', tabBarIcon: tabIcon('business') }} />
      <Tabs.Screen
        name="bookings"
        options={{ title: 'Мои записи', tabBarIcon: tabIcon('calendar') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Профиль', tabBarIcon: tabIcon('person-circle') }}
      />
    </Tabs>
  );
}
