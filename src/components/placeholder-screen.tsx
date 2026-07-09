import { Text, View } from 'react-native';

/** Временная заглушка экрана — заменяется реальным контентом в Фазах 1–4. */
export function PlaceholderScreen({ title, hint }: { title: string; hint?: string }) {
  return (
    <View className="flex-1 items-center justify-center gap-2 bg-white px-8 dark:bg-[#121212]">
      <Text className="text-xl font-semibold text-[#17171C] dark:text-white">{title}</Text>
      {hint ? (
        <Text className="text-center text-sm text-[#60646C] dark:text-[#B0B4BA]">{hint}</Text>
      ) : null}
    </View>
  );
}
