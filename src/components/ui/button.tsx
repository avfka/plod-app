import { ActivityIndicator, Pressable, Text, type PressableProps } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

const containerClasses: Record<ButtonVariant, string> = {
  primary: 'bg-primary',
  secondary: 'bg-[#F2F2F7] dark:bg-[#1E1E24]',
  ghost: 'bg-transparent',
  danger: 'bg-[#FF6B6B]',
};

const labelClasses: Record<ButtonVariant, string> = {
  primary: 'text-white',
  secondary: 'text-[#17171C] dark:text-white',
  ghost: 'text-primary',
  danger: 'text-white',
};

export type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
};

export function Button({ label, variant = 'primary', loading, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled || loading}
      className={`h-12 flex-row items-center justify-center rounded-xl px-5 active:opacity-80 ${
        containerClasses[variant]
      } ${disabled ? 'opacity-40' : ''}`}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? '#6C63FF' : '#FFFFFF'} />
      ) : (
        <Text className={`text-base font-semibold ${labelClasses[variant]}`}>{label}</Text>
      )}
    </Pressable>
  );
}
