/**
 * Дизайн-токены приложения. Основной цвет — #6C63FF.
 * Цвета танцевальных направлений НЕ хардкодим — они приходят
 * из таблицы dance_directions (color_hex).
 */

export const palette = {
  primary: '#6C63FF',
  gold: '#FFD700', // маркер события любимого хореографа
  danger: '#FF6B6B',
  success: '#96CEB4',
} as const;

/** Палитра из 5 цветов для дизайна карточки организатора (profiles.card_color). */
export const cardColorPalette = [
  '#45B7D1',
  '#96CEB4',
  '#FF6B6B',
  '#6C63FF',
  '#FFA94D',
] as const;

export const Colors = {
  light: {
    text: '#17171C',
    textSecondary: '#60646C',
    background: '#FFFFFF',
    backgroundElement: '#F2F2F7',
    backgroundSelected: '#E0E1E6',
    border: '#E0E1E6',
    tint: palette.primary,
    tabIconDefault: '#9CA0A8',
    tabIconSelected: palette.primary,
  },
  dark: {
    text: '#FFFFFF',
    textSecondary: '#B0B4BA',
    background: '#121212',
    backgroundElement: '#1E1E24',
    backgroundSelected: '#2E3135',
    border: '#2E3135',
    tint: palette.primary,
    tabIconDefault: '#6E727A',
    tabIconSelected: palette.primary,
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeName];

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
