import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { Fonts } from '@/theme';

const sections = [
  {
    title: 'Назначение сервиса',
    text: 'PLOD помогает находить танцевальные события и оставлять заявку на место. Информация о событиях, расписании и свободных местах публикуется для тестирования и может меняться.',
  },
  {
    title: 'Запись на событие',
    text: 'Запись относится к выбранной сессии. Её можно отменить не позднее чем за 24 часа до начала; после этого освобождение места недоступно.',
  },
  {
    title: 'Ответственность',
    text: 'Организатор отвечает за проведение события, актуальность программы и условия участия. Перед посещением уточняйте детали у контакта, указанного в карточке события.',
  },
  {
    title: 'Правила beta',
    text: 'Не используйте сервис для публикации недостоверных данных, чужих персональных данных или материалов, нарушающих права третьих лиц. Сообщайте об ошибках через кнопку в приложении.',
  },
];

export default function TermsScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Условия beta' }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-2">
          <Tag label="PLOD · закрытая beta" />
          <Text style={{ fontFamily: Fonts.mono }} className="text-2xl font-bold uppercase text-ink dark:text-paper-dark">
            Условия использования
          </Text>
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]">
            Актуально на 16 июля 2026 года.
          </Text>
        </View>
        {sections.map((section) => (
          <Card key={section.title} className="gap-2">
            <Text style={{ fontFamily: Fonts.mono }} className="text-sm font-bold uppercase text-ink dark:text-paper-dark">
              {section.title}
            </Text>
            <Text style={{ fontFamily: Fonts.mono }} className="text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]">
              {section.text}
            </Text>
          </Card>
        ))}
      </ScrollView>
    </>
  );
}
