import { View, type ViewProps } from 'react-native';

/** Базовая карточка: фон-элемент, скругление, внутренний отступ. */
export function Card({ className = '', children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-2xl bg-[#F2F2F7] p-4 dark:bg-[#1E1E24] ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
