import { Colors, type ThemeColors, type ThemeName } from '@/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeName(): ThemeName {
  const scheme = useColorScheme();
  return scheme === 'dark' ? 'dark' : 'light';
}

export function useTheme(): ThemeColors {
  return Colors[useThemeName()];
}
