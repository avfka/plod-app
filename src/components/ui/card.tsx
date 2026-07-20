import { View, type ViewProps } from 'react-native';

/**
 * Карточка-«документ»: бумага, тонкая чернильная рамка, слегка
 * скруглённые углы — как pass card из референсов.
 */
export function Card({
  className = '',
  children,
  inverted = false,
  ...rest
}: ViewProps & { className?: string; inverted?: boolean }) {
  return (
    <View
      className={`rounded-[2px] border p-4 ${
        inverted
          ? 'border-paper-dark bg-night-element'
          : 'border-ink bg-paper dark:border-paper-dark dark:bg-night-element'
      } ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
