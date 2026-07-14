import { Stack } from 'expo-router';

import { useTheme } from '@/hooks/use-theme';
import { Fonts } from '@/theme';

export default function OnboardingLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        title: 'Настройте свою ленту',
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerTitleStyle: { fontFamily: Fonts.mono, fontWeight: 'bold' },
        contentStyle: { backgroundColor: theme.background },
      }}
    />
  );
}
