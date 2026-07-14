import { View, type ViewProps } from 'react-native';

/**
 * Карточка-«документ»: бумага, тонкая чернильная рамка, слегка
 * скруглённые углы — как pass card из референсов.
 */
export function Card({ className = '', children, ...rest }: ViewProps & { className?: string }) {
  return (
    <View
      className={`rounded-[4px] border border-ink bg-paper p-4 dark:border-paper-dark dark:bg-night-element ${className}`}
      {...rest}
    >
      {children}
    </View>
  );
}
