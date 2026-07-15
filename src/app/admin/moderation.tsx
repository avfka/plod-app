import { Stack } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Tag } from '@/components/ui/tag';
import { useModerateEvent, usePendingEvents } from '@/features/events/use-managed-events';
import { useProfile } from '@/features/profile/use-profile';
import { Fonts } from '@/theme';

export default function ModerationScreen() {
  const { data: profile } = useProfile();
  const isAdmin = profile?.role === 'admin';
  const { data: events = [], isLoading } = usePendingEvents(isAdmin);
  const moderate = useModerateEvent();
  const [reasons, setReasons] = useState<Record<string, string>>({});

  const decide = async (eventId: string, decision: 'active' | 'rejected') => {
    try {
      await moderate.mutateAsync({ eventId, decision, reason: reasons[eventId] });
    } catch (error) {
      Alert.alert('Не удалось сохранить решение', error instanceof Error ? error.message : 'Попробуйте снова');
    }
  };

  if (profile && !isAdmin) {
    return <View className="flex-1 items-center justify-center bg-paper p-8 dark:bg-night"><Text className="text-center text-ink dark:text-paper-dark">Раздел доступен только администратору.</Text></View>;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Модерация', headerShown: true }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4 pb-12">
        <View><Tag label="Очередь" /><Text style={{ fontFamily: Fonts.serif }} className="mt-3 text-3xl font-bold text-ink dark:text-paper-dark">Проверка досье</Text></View>
        {isLoading ? <ActivityIndicator /> : null}
        {!isLoading && events.length === 0 ? <Card><Text className="text-center text-[#6B6560]">Очередь пуста.</Text></Card> : null}
        {events.map((event) => (
          <Card key={event.id} className="gap-3">
            <Tag label={event.status === 'rejected' ? 'Повторная проверка' : 'Новое дело'} color={event.status === 'rejected' ? '#8C7B5F' : '#E8352A'} />
            <Text style={{ fontFamily: Fonts.serif }} className="text-xl font-bold text-ink dark:text-paper-dark">{event.title}</Text>
            <Text className="text-sm leading-5 text-[#6B6560] dark:text-[#A39D93]">{event.description || 'Описание не добавлено'}{`\n`}{event.event_sessions.length} {event.event_sessions.length === 1 ? 'сессия' : 'сессии'}</Text>
            <FormField label="Причина отклонения" value={reasons[event.id] ?? ''} onChangeText={(reason) => setReasons((current) => ({ ...current, [event.id]: reason }))} multiline placeholder="Что организатору нужно исправить" />
            <View className="flex-row gap-2"><View className="flex-1"><Button label="Отклонить" variant="outline" disabled={!reasons[event.id]?.trim()} loading={moderate.isPending} onPress={() => void decide(event.id, 'rejected')} /></View><View className="flex-1"><Button label="Опубликовать" loading={moderate.isPending} onPress={() => void decide(event.id, 'active')} /></View></View>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}
