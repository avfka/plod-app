/**
 * Дизайн-токены. Арт-направление — «детективное досье»:
 * чб (бумага/чернила) + сигнальный красный, моноширинная типографика,
 * тонкие рамки, красные метки-теги. Референсы: CCTV-кадры, pass card,
 * доска с красными нитками.
 *
 * Цвета танцевальных направлений НЕ хардкодим — они приходят
 * из таблицы dance_directions (color_hex).
 */

import { Platform } from 'react-native';

export const palette = {
  red: '#E8352A', // основной акцент (кнопки, активные состояния, теги)
  thread: '#FF1F0F', // «красная нитка» на карте (полилиния мультисессий)
  ink: '#141210', // чернила
  paper: '#FAF7F2', // бумага
  gold: '#FFD700', // маркер события любимого хореографа
} as const;

/** Палитра карточки организатора (profiles.card_color) — тона досье. */
export const cardColorPalette = [
  '#E8352A', // красный
  '#141210', // чернильный
  '#5B5F66', // графитовый
  '#8C7B5F', // крафт
  '#3E4A3D', // хаки
] as const;

export const Colors = {
  light: {
    text: '#141210',
    textSecondary: '#6B6560',
    background: '#FAF7F2',
    backgroundElement: '#F1EDE5',
    backgroundSelected: '#E7E1D6',
    border: '#141210',
    borderMuted: '#D8D2C6',
    tint: palette.red,
    tabIconDefault: '#8A847C',
    tabIconSelected: palette.red,
  },
  dark: {
    text: '#F5F1E8',
    textSecondary: '#A39D93',
    background: '#12100E',
    backgroundElement: '#1C1916',
    backgroundSelected: '#282420',
    border: '#F5F1E8',
    borderMuted: '#39342E',
    tint: palette.red,
    tabIconDefault: '#6E6860',
    tabIconSelected: palette.red,
  },
} as const;

export type ThemeName = keyof typeof Colors;
export type ThemeColors = (typeof Colors)[ThemeName];

/** Моно — для меток, кодов и заголовков-«штампов»; на обеих платформах с кириллицей. */
export const Fonts = {
  mono: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' })!,
  sans: Platform.select({ ios: 'system-ui', android: 'normal', default: 'sans-serif' })!,
  serif: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia' })!,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

/** Углы почти острые — «документ», не «пузырь». */
export const Radius = {
  sm: 2,
  md: 4,
  lg: 8,
} as const;
