import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/theme';

export default function AuthLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: Fonts.mono, fontWeight: 'bold' },
        contentStyle: { backgroundColor: theme.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="email" options={{ title: 'EMAIL' }} />
      <Stack.Screen name="phone" options={{ title: 'ТЕЛЕФОН' }} />
    </Stack>
  );
}
