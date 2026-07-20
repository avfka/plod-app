import { Stack } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import { Fonts } from '@/theme';

const sections = [
  {
    title: 'Что мы храним',
    text: 'Данные аккаунта, которые вы вводите сами: email, имя, город, телефон и предпочтения. Если вы записываетесь на событие, сохраняются выбранная сессия и статус записи.',
  },
  {
    title: 'Зачем это нужно',
    text: 'Чтобы показать подходящие события, сохранить вашу запись, работать с выбранным городом и отвечать на обращения по работе beta-версии.',
  },
  {
    title: 'Кому доступно',
    text: 'Ваши данные доступны только вам и сервисам, которые обеспечивают вход и хранение данных. Организатор не получает ваш email или телефон из PLOD без отдельного действия с вашей стороны.',
  },
  {
    title: 'Ваш выбор',
    text: 'Вы можете использовать карту как гость. Чтобы исправить или удалить данные, напишите владельцу проекта через закрытый канал приглашения; не публикуйте личные данные в публичных GitHub Issues.',
  },
  {
    title: 'Beta-режим',
    text: 'PLOD находится в закрытом тестировании. Мы используем технические данные об ошибках только для улучшения стабильности основного сценария поиска и записи.',
  },
];

export default function PrivacyScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Конфиденциальность' }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4 pb-10">
        <View className="gap-2">
          <Tag label="PLOD · закрытая beta" />
          <Text style={{ fontFamily: Fonts.mono }} className="text-2xl font-bold uppercase text-ink dark:text-paper-dark">
            Политика конфиденциальности
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
