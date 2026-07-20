import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DossierRow, Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
import { reportProblem } from '@/features/feedback/report-problem';
import { useProfile, useUpdateProfile } from '@/features/profile/use-profile';
import { supabase } from '@/lib/supabase';
import { cardColorPalette, Fonts } from '@/theme';
import type { Database } from '@/types/database';

type MarkerIcon = Database['public']['Enums']['marker_icon'];
const MARKER_ICONS: { value: MarkerIcon; glyph: string }[] = [
  { value: 'circle', glyph: '●' },
  { value: 'star', glyph: '★' },
  { value: 'square', glyph: '■' },
  { value: 'diamond', glyph: '◆' },
  { value: 'heart', glyph: '♥' },
];

const ROLE_LABELS: Record<Database['public']['Enums']['user_role'], string> = {
  user: 'Танцор',
  organizer: 'Организатор',
  admin: 'Админ',
};

function GuestStamp() {
  return (
    <View
      accessibilityLabel="Гость"
      className="self-start border-2 border-accent px-3 py-1"
      style={{ transform: [{ rotate: '-2deg' }] }}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -3,
          left: 2,
          right: -3,
          top: 2,
          borderColor: '#E8352A',
          borderWidth: 1,
          opacity: 0.45,
        }}
      />
      <Text
        style={{ fontFamily: Fonts.mono, letterSpacing: 2 }}
        className="text-base font-bold uppercase leading-5 text-accent"
      >
        Гость
      </Text>
    </View>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, isGuest } = useSession();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (isGuest) {
    return (
      <View className="flex-1 bg-night px-10">
        <View
          className="flex-1 items-center justify-center gap-4"
          style={{ transform: [{ translateY: -27 }] }}
        >
          <GuestStamp />
          <Text
            style={{ fontFamily: Fonts.mono }}
            className="text-center text-xs leading-4 text-[#A39D93]"
          >
            Вы просматриваете карту как гость.{'\n'}Войдите, чтобы записываться на МК{'\n'}и настроить
            свою ленту.
          </Text>
          <Button inverted label="Войти" onPress={() => router.push('/(auth)/welcome')} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-night"
      contentContainerClassName="gap-4 p-4"
    >
      <Card inverted>
        <Tag label="Профайл" />
        <View className="mt-3">
          <DossierRow inverted label="Имя" value={profile?.full_name ?? 'Не указано'} />
          <DossierRow inverted label="Email" value={profile?.email ?? session?.user.email ?? 'Не указан'} />
          <DossierRow inverted label="Телефон" value={profile?.phone ?? 'Не указан'} />
          <DossierRow inverted label="Город" value={profile?.city ?? 'Не указан'} />
          <DossierRow inverted label="Статус" value={profile ? ROLE_LABELS[profile.role] : 'Не указан'} />
        </View>
      </Card>

      <Card inverted>
        <Tag label="Дизайн карточки" color="#141210" />
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="mt-2 text-xs text-[#A39D93]"
        >
          Цвет и значок ваших событий на карте
        </Text>
        <View className="mt-3 flex-row gap-2">
          {cardColorPalette.map((color) => (
            <Pressable
              key={color}
              accessibilityRole="button"
              onPress={() => updateProfile.mutate({ card_color: color })}
              style={{ backgroundColor: color }}
              className={`h-9 w-9 rounded-[4px] ${
                profile?.card_color === color ? 'border-2 border-accent' : 'border border-[#8A847C]'
              }`}
            />
          ))}
        </View>
        <View className="mt-3 flex-row gap-2">
          {MARKER_ICONS.map(({ value, glyph }) => (
            <Pressable
              key={value}
              accessibilityRole="button"
              onPress={() => updateProfile.mutate({ marker_icon: value })}
              className={`h-9 w-9 items-center justify-center rounded-[4px] border ${
                profile?.marker_icon === value
                  ? 'border-2 border-accent'
                  : 'border-[#8A847C]'
              }`}
            >
              <Text className="text-base text-paper-dark">{glyph}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card inverted>
        <Tag label="Организатор" color="#141210" />
        <Text className="mt-2 text-sm text-[#A39D93]">
          Создавайте события, связывайте несколько сессий красной нитью и следите за модерацией.
        </Text>
        <View className="mt-4 gap-2">
          <Button inverted label="Создать событие" onPress={() => router.push('/event/create')} />
          <Button inverted label="Мои события" variant="outline" onPress={() => router.push('/events/mine')} />
          {profile?.role === 'admin' ? (
            <Button inverted label="Очередь модерации" variant="ghost" onPress={() => router.push('/admin/moderation')} />
          ) : null}
        </View>
      </Card>

      <Card inverted className="gap-3">
        <Tag label="Ваши события" color="#141210" />
        <Text style={{ fontFamily: Fonts.sans }} className="text-sm leading-5 text-[#A39D93]">
          Ближайшие записи и история посещённых мастер-классов.
        </Text>
        <Button inverted label="Мои записи" onPress={() => router.push('/(tabs)/bookings')} />
      </Card>

      <Button
        inverted
        label="Настроить ленту заново"
        variant="outline"
        onPress={() => router.push('/(onboarding)/step1')}
      />
      <Card inverted className="gap-2">
        <Tag label="Beta · помощь" />
        <Text style={{ fontFamily: Fonts.mono }} className="text-xs leading-5 text-[#A39D93]">
          Для теста доступны правила сервиса и короткий канал обратной связи.
        </Text>
        <Button inverted label="Сообщить о проблеме" variant="outline" onPress={() => reportProblem({ route: '/profile' })} />
        <Button inverted label="Конфиденциальность" variant="ghost" onPress={() => router.push('/privacy')} />
        <Button inverted label="Условия использования" variant="ghost" onPress={() => router.push('/terms')} />
      </Card>
      <Button
        inverted
        label="Выйти"
        variant="ghost"
        onPress={async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/welcome');
        }}
      />
    </ScrollView>
  );
}
