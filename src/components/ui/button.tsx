import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { Fonts } from '@/theme';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';

const containerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-ink dark:bg-paper-dark',
  accent: 'bg-accent',
  outline: 'bg-transparent border border-ink dark:border-paper-dark',
  ghost: 'bg-transparent',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-paper dark:text-night',
  accent: 'text-paper',
  outline: 'text-ink dark:text-paper-dark',
  ghost: 'text-accent',
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

/** Кнопка-«штамп»: почти острые углы, моно-шрифт, верхний регистр. */
export function Button({ label, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  const spinnerColor = variant === 'outline' || variant === 'ghost' ? '#E8352A' : '#FAF7F2';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`h-12 flex-row items-center justify-center rounded-[4px] px-5 active:opacity-80 ${
        containerClasses[variant]
      } ${disabled ? 'opacity-40' : ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 1.5 }}
          className={`text-sm font-bold uppercase ${labelClasses[variant]}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
