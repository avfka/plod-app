import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

import { Fonts } from '@/theme';

type ButtonVariant = 'primary' | 'accent' | 'outline' | 'ghost';

const containerClasses: Record<ButtonVariant, string> = {
  primary: 'border border-accent bg-accent',
  accent: 'bg-accent',
  outline: 'bg-transparent border border-ink dark:border-paper-dark',
  ghost: 'bg-transparent',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-paper',
  accent: 'text-paper',
  outline: 'text-ink dark:text-paper-dark',
  ghost: 'text-accent',
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  inverted?: boolean;
};

/** Кнопка-«штамп»: почти острые углы, моно-шрифт, верхний регистр. */
export function Button({
  label,
  variant = 'primary',
  loading,
  disabled,
  inverted = false,
  ...rest
}: ButtonProps) {
  const spinnerColor = variant === 'outline' || variant === 'ghost' ? '#E8352A' : '#FAF7F2';
  const containerClass =
    inverted && variant === 'outline' ? 'bg-transparent border border-paper-dark' : containerClasses[variant];
  const labelClass =
    inverted && variant === 'outline' ? 'text-paper-dark' : labelClasses[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`h-12 flex-row items-center justify-center rounded-[2px] px-5 active:scale-[0.98] ${
        containerClass
      } ${disabled ? 'opacity-40' : ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={spinnerColor} />
      ) : (
        <Text
          style={{ fontFamily: Fonts.mono, letterSpacing: 1.5 }}
          className={`text-sm font-bold uppercase ${labelClass}`}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}
