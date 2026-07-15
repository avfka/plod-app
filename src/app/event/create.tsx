import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, Switch, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormField } from '@/components/ui/form-field';
import { Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import {
  type SessionDraft,
  uploadEventPhoto,
  useCreateEvent,
} from '@/features/events/use-managed-events';
import { useChoreographers, useDanceDirections } from '@/features/onboarding/use-directories';
import { Fonts, palette } from '@/theme';
import type { Database } from '@/types/database';

type EventType = Database['public']['Enums']['event_type'];
type DraftSessionInput = {
  date: string;
  start: string;
  end: string;
  address: string;
  lat: string;
  lng: string;
};

const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
const DEFAULT_DATE = tomorrow.toISOString().slice(0, 10);
const NEW_SESSION: DraftSessionInput = {
  date: DEFAULT_DATE,
  start: '19:00',
  end: '21:00',
  address: '',
  lat: '55.7558',
  lng: '37.6173',
};

function toIso(date: string, time: string) {
  const value = new Date(`${date}T${time}:00`);
  if (Number.isNaN(value.getTime())) throw new Error('INVALID_DATE');
  return value.toISOString();
}

export default function CreateEventScreen() {
  const router = useRouter();
  const { session } = useSession();
  const { data: directions = [] } = useDanceDirections();
  const { data: choreographers = [] } = useChoreographers();
  const createEvent = useCreateEvent();
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState<EventType>('masterclass');
  const [directionId, setDirectionId] = useState<string | null>(null);
  const [choreographerId, setChoreographerId] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isFree, setIsFree] = useState(false);
  const [price, setPrice] = useState('');
  const [seats, setSeats] = useState('');
  const [phone, setPhone] = useState('');
  const [age, setAge] = useState('');
  const [sessions, setSessions] = useState<DraftSessionInput[]>([{ ...NEW_SESSION }]);
  const [photo, setPhoto] = useState<{ uri: string; mimeType?: string | null } | null>(null);

  const updateSession = (index: number, patch: Partial<DraftSessionInput>) => {
    setSessions((current) => current.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.82,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      setPhoto({ uri: asset.uri, mimeType: asset.mimeType });
    }
  };

  const validateStep = () => {
    if (step === 1 && (!title.trim() || !directionId)) {
      Alert.alert('Заполните основу', 'Нужны название и направление события.');
      return false;
    }
    if (step === 2 && sessions.some((item) => !item.date || !item.start || !item.address.trim())) {
      Alert.alert('Проверьте маршрут', 'У каждой точки должны быть дата, время и адрес.');
      return false;
    }
    return true;
  };

  const submit = async () => {
    if (!session?.user.id) return;
    try {
      let photoUrl: string | null = null;
      if (photo) photoUrl = await uploadEventPhoto(session.user.id, photo.uri, photo.mimeType);
      const sessionPayload: SessionDraft[] = sessions.map((item, index) => ({
        day_number: index + 1,
        starts_at: toIso(item.date, item.start),
        ends_at: item.end ? toIso(item.date, item.end) : null,
        address: item.address.trim(),
        lat: Number(item.lat),
        lng: Number(item.lng),
      }));
      await createEvent.mutateAsync({
        event: {
          title: title.trim(),
          event_type: eventType,
          direction_id: directionId,
          choreographer_id: choreographerId,
          description: description.trim(),
          is_free: isFree,
          price: isFree ? null : Number(price),
          seats_total: seats ? Number(seats) : null,
          contact_phone: phone.trim(),
          age_restriction: age.trim(),
          photo_url: photoUrl,
        },
        sessions: sessionPayload,
      });
      Alert.alert('Досье создано', 'Событие отправлено на модерацию.', [
        { text: 'К моим событиям', onPress: () => router.replace('/events/mine') },
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Не удалось создать событие';
      Alert.alert('Не получилось', message);
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Новое досье', headerShown: true }} />
      <ScrollView className="flex-1 bg-paper dark:bg-night" contentContainerClassName="gap-4 p-4 pb-12">
        <View className="flex-row items-center justify-between">
          <Tag label={`Шаг ${step} / 3`} />
          <Text style={{ fontFamily: Fonts.mono }} className="text-xs text-[#6B6560] dark:text-[#A39D93]">
            {step === 1 ? 'ОСНОВА' : step === 2 ? 'КРАСНАЯ НИТЬ' : 'ПРОВЕРКА'}
          </Text>
        </View>

        {step === 1 ? (
          <Card className="gap-4">
            <Text style={{ fontFamily: Fonts.serif }} className="text-3xl font-bold text-ink dark:text-paper-dark">
              Завести дело
            </Text>
            <View className="flex-row gap-2">
              {([['masterclass', 'Мастер-класс'], ['championship', 'Чемпионат']] as const).map(([value, label]) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  onPress={() => setEventType(value)}
                  className={`flex-1 border p-3 ${eventType === value ? 'border-accent bg-[#FCE8E5]' : 'border-[#BDB5AA] dark:border-[#4A443D]'}`}
                >
                  <Text className="text-center font-semibold text-ink dark:text-paper-dark">{label}</Text>
                </Pressable>
              ))}
            </View>
            <FormField label="Название *" value={title} onChangeText={setTitle} placeholder="Например, Грув-лаборатория" />
            <Text style={{ fontFamily: Fonts.mono }} className="text-[11px] font-bold uppercase text-ink dark:text-paper-dark">Направление *</Text>
            <View className="flex-row flex-wrap gap-2">
              {directions.map((item) => (
                <Pressable key={item.id} onPress={() => setDirectionId(item.id)} className={`border px-3 py-2 ${directionId === item.id ? 'border-accent bg-[#FCE8E5]' : 'border-[#BDB5AA] dark:border-[#4A443D]'}`}>
                  <Text className="text-sm text-ink dark:text-paper-dark">{item.name}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={{ fontFamily: Fonts.mono }} className="text-[11px] font-bold uppercase text-ink dark:text-paper-dark">Хореограф</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerClassName="gap-2">
              <Pressable onPress={() => setChoreographerId(null)} className={`border px-3 py-2 ${!choreographerId ? 'border-accent' : 'border-[#BDB5AA]'}`}><Text className="text-ink dark:text-paper-dark">Не указан</Text></Pressable>
              {choreographers.map((item) => (
                <Pressable key={item.id} onPress={() => setChoreographerId(item.id)} className={`border px-3 py-2 ${choreographerId === item.id ? 'border-accent' : 'border-[#BDB5AA]'}`}><Text className="text-ink dark:text-paper-dark">{item.name}</Text></Pressable>
              ))}
            </ScrollView>
            <FormField label="Описание" value={description} onChangeText={setDescription} multiline placeholder="Что произойдёт и для какого уровня" />
            <Pressable onPress={pickPhoto} className="min-h-28 items-center justify-center border border-dashed border-accent bg-[#FCE8E5] p-3">
              {photo ? <Image source={{ uri: photo.uri }} className="h-44 w-full" resizeMode="cover" /> : <><Ionicons name="camera-outline" size={28} color={palette.red} /><Text className="mt-2 font-semibold text-accent">Добавить обложку</Text><Text className="mt-1 text-xs text-[#6B6560]">JPG, PNG или WebP · до 5 МБ</Text></>}
            </Pressable>
          </Card>
        ) : null}

        {step === 2 ? (
          <View className="gap-4">
            <View>
              <Text style={{ fontFamily: Fonts.serif }} className="text-3xl font-bold text-ink dark:text-paper-dark">Проложить нить</Text>
              <Text className="mt-1 text-sm text-[#6B6560] dark:text-[#A39D93]">Одна точка — обычное событие. Две и больше соединятся на карте красной нитью.</Text>
            </View>
            {sessions.map((item, index) => (
              <Card key={`session-${index}`} className="gap-3">
                <View className="flex-row items-center justify-between"><Tag label={`Улика ${index + 1}`} /><View className="h-2 w-2 rounded-full bg-accent" /></View>
                <View className="flex-row gap-2"><View className="flex-1"><FormField label="Дата *" value={item.date} onChangeText={(date) => updateSession(index, { date })} placeholder="2026-07-20" /></View><View className="w-24"><FormField label="Начало *" value={item.start} onChangeText={(start) => updateSession(index, { start })} placeholder="19:00" /></View><View className="w-24"><FormField label="Конец" value={item.end} onChangeText={(end) => updateSession(index, { end })} placeholder="21:00" /></View></View>
                <FormField label="Адрес *" value={item.address} onChangeText={(address) => updateSession(index, { address })} placeholder="Студия и улица" />
                <View className="flex-row gap-2"><View className="flex-1"><FormField label="Широта" value={item.lat} onChangeText={(lat) => updateSession(index, { lat })} keyboardType="decimal-pad" /></View><View className="flex-1"><FormField label="Долгота" value={item.lng} onChangeText={(lng) => updateSession(index, { lng })} keyboardType="decimal-pad" /></View></View>
                {sessions.length > 1 ? <Button label="Удалить точку" variant="ghost" onPress={() => setSessions((current) => current.filter((_, i) => i !== index))} /> : null}
              </Card>
            ))}
            {sessions.length < 5 ? <Button label="Добавить точку нити" variant="outline" onPress={() => setSessions((current) => [...current, { ...NEW_SESSION }])} /> : null}
          </View>
        ) : null}

        {step === 3 ? (
          <View className="gap-4">
            <Text style={{ fontFamily: Fonts.serif }} className="text-3xl font-bold text-ink dark:text-paper-dark">Финальные сведения</Text>
            <Card className="gap-4">
              <View className="flex-row items-center justify-between"><Text className="font-semibold text-ink dark:text-paper-dark">Бесплатное событие</Text><Switch value={isFree} onValueChange={setIsFree} trackColor={{ true: palette.red }} /></View>
              {!isFree ? <FormField label="Цена, ₽ *" value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="2500" /> : null}
              <FormField label="Количество мест" value={seats} onChangeText={setSeats} keyboardType="numeric" hint="Оставьте пустым, если лимита нет" />
              <FormField label="Телефон для связи" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
              <FormField label="Возраст" value={age} onChangeText={setAge} placeholder="16+" />
            </Card>
            <Card>
              <Tag label="Предпросмотр дела" />
              <Text style={{ fontFamily: Fonts.serif }} className="mt-3 text-2xl font-bold text-ink dark:text-paper-dark">{title || 'Без названия'}</Text>
              <Text className="mt-2 text-sm text-[#6B6560] dark:text-[#A39D93]">{sessions.length > 1 ? `${sessions.length} точки будут соединены красной нитью` : 'Одна точка на карте'} · {isFree ? 'Бесплатно' : `${price || '—'} ₽`}</Text>
              <View className="mt-4 border-l-2 border-accent pl-3"><Text className="text-sm text-ink dark:text-paper-dark">Пользовательское событие отправится на модерацию. Организаторское опубликуется сразу.</Text></View>
            </Card>
          </View>
        ) : null}

        <View className="flex-row gap-3">
          {step > 1 ? <View className="flex-1"><Button label="Назад" variant="outline" onPress={() => setStep((value) => value - 1)} /></View> : null}
          <View className="flex-1"><Button label={step === 3 ? 'Отправить дело' : 'Продолжить'} loading={createEvent.isPending} onPress={() => { if (step < 3) { if (validateStep()) setStep((value) => value + 1); } else { void submit(); } }} /></View>
        </View>
      </ScrollView>
    </>
  );
}
