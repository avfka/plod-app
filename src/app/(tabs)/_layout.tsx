import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect, useRef } from 'react';
import type { ColorValue } from 'react-native';

import { useProfile } from '@/features/profile/use-profile';
import { getPreferredCityId } from '@/features/cities/city-preference';
import { useFilters } from '@/store/filters';
import { Fonts } from '@/theme';

type IoniconName = keyof typeof Ionicons.glyphMap;

function tabIcon(name: IoniconName) {
  function TabBarIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} color={color} size={size} />;
  }
  return TabBarIcon;
}

export default function TabsLayout() {
  const { data: profile } = useProfile();
  const applyProfileDefaults = useFilters((s) => s.applyProfileDefaults);
  const defaultsApplied = useRef(false);

  useEffect(() => {
    if (!profile) {
      void getPreferredCityId().then((cityId) => {
        if (cityId) useFilters.getState().set({ cityId });
      });
    }
  }, [profile]);

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
        tabBarActiveTintColor: '#F5F1E8',
        tabBarInactiveTintColor: '#77716A',
        tabBarStyle: {
          backgroundColor: '#12100E',
          borderTopColor: '#282420',
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontFamily: Fonts.sans, fontSize: 10, fontWeight: '600' },
        headerShown: false,
        headerStyle: { backgroundColor: '#12100E' },
        headerTintColor: '#F5F1E8',
        headerTitleStyle: {
          fontFamily: Fonts.mono,
          fontWeight: 'bold',
          letterSpacing: 2,
          textTransform: 'uppercase',
        },
        sceneStyle: { backgroundColor: '#12100E' },
      }}
    >
      <Tabs.Screen
        name="list"
        options={{
          title: 'Лента',
          tabBarIcon: tabIcon('play-circle-outline'),
        }}
      />
      <Tabs.Screen
        name="subscriptions"
        options={{
          title: 'Подписки',
          tabBarIcon: tabIcon('people-outline'),
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'Карта',
          tabBarIcon: tabIcon('map-outline'),
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
        options={{ title: 'Мои записи', tabBarIcon: tabIcon('calendar-outline'), href: null }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Профиль', tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}
