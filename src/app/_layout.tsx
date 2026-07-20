import '@/global.css';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { useNativeAuthLink } from '@/features/auth/native-auth-link';
import { Fonts } from '@/theme';

export default function RootLayout() {
  useNativeAuthLink();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60_000, retry: 2 },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#12100E' },
          headerTintColor: '#F5F1E8',
          headerTitleStyle: { fontFamily: Fonts.mono, fontWeight: 'bold' },
          contentStyle: { backgroundColor: '#12100E' },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false, title: 'PLOD' }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(onboarding)" options={{ headerShown: false }} />
        <Stack.Screen name="event/[id]" options={{ title: 'Pass Card' }} />
        <Stack.Screen name="choreographer/[id]" options={{ title: 'Хореограф' }} />
      </Stack>
    </QueryClientProvider>
  );
}
