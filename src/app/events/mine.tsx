import { Stack, useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import { useMyEvents } from '@/features/events/use-managed-events';
import { Fonts } from '@/theme';
import type { Database } from '@/types/database';

const STATUS: Record<Database['public']['Enums']['event_status'], { label: string; color: string }> = {
  pending: { label: 'На модерации', color: '#8C7B5F' },
  rejected: { label: 'Нужны правки', color: '#E8352A' },
  active: { label: 'Опубликовано', color: '#3E4A3D' },
  finished: { label: 'Завершено', color: '#5B5F66' },
  cancelled: { label: 'Отменено', color: '#141210' },
};

export default function MyEventsScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { data: events = [], isLoading, error } = useMyEvents(session?.user.id);

  return (
    <>
      <Stack.Screen options={{ title: 'Мои события', headerShown: true }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4 pb-12">
        <View>
          <Tag label="Архив организатора" />
          <Text style={{ fontFamily: Fonts.serif }} className="mt-3 text-3xl font-bold text-ink dark:text-paper-dark">Мои дела</Text>
          <Text className="mt-1 text-sm text-[#6B6560] dark:text-[#A39D93]">Черновики публикаций и решения модерации в одном месте.</Text>
        </View>
        <Button label="Создать событие" onPress={() => router.push('/event/create')} />
        {isLoading ? <ActivityIndicator /> : null}
        {error ? <Card><Text className="text-accent">Не удалось загрузить события.</Text></Card> : null}
        {!isLoading && !error && events.length === 0 ? <Card><Text className="text-center text-[#6B6560]">Здесь появятся созданные вами события.</Text></Card> : null}
        {events.map((event) => {
          const status = STATUS[event.status];
          const first = [...event.event_sessions].sort((a, b) => a.starts_at.localeCompare(b.starts_at))[0];
          return (
            <Card key={event.id} className="gap-3">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1"><Text style={{ fontFamily: Fonts.serif }} className="text-xl font-bold text-ink dark:text-paper-dark">{event.title}</Text><Text className="mt-1 text-xs uppercase text-[#6B6560]">{event.direction?.name ?? 'Без направления'} · {event.event_sessions.length} {event.event_sessions.length === 1 ? 'точка' : 'точки'}</Text></View>
                <Tag label={status.label} color={status.color} />
              </View>
              {first ? <Text className="text-sm text-ink dark:text-paper-dark">{new Date(first.starts_at).toLocaleString('ru-RU', { dateStyle: 'medium', timeStyle: 'short' })}{'\n'}{first.address}</Text> : null}
              {event.moderation_reason ? <View className="border-l-2 border-accent bg-[#FCE8E5] p-3"><Text className="text-xs font-bold uppercase text-accent">Комментарий модератора</Text><Text className="mt-1 text-sm text-ink">{event.moderation_reason}</Text></View> : null}
            </Card>
          );
        })}
      </ScrollView>
    </>
  );
}
