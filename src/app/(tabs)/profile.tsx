import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DossierRow, Tag } from '@/components/ui/tag';
import { useSession } from '@/features/auth/use-session';
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

export default function ProfileScreen() {
  const router = useRouter();
  const { session, isGuest } = useSession();
  const { data: profile } = useProfile();
  const updateProfile = useUpdateProfile();

  if (isGuest) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-paper px-8 dark:bg-night">
        <Tag label="Guest Mode" />
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="text-center text-xs leading-5 text-[#6B6560] dark:text-[#A39D93]"
        >
          Вы просматриваете карту как гость.{'\n'}Войдите, чтобы записываться на МК{'\n'}и настроить
          свою ленту.
        </Text>
        <Button label="Войти" onPress={() => router.push('/(auth)/welcome')} />
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-paper dark:bg-night"
      contentContainerClassName="gap-4 p-4"
    >
      <Card>
        <Tag label="Профайл" />
        <View className="mt-3">
          <DossierRow label="Имя" value={profile?.full_name ?? 'Не указано'} />
          <DossierRow label="Email" value={profile?.email ?? session?.user.email ?? 'Не указан'} />
          <DossierRow label="Телефон" value={profile?.phone ?? 'Не указан'} />
          <DossierRow label="Город" value={profile?.city ?? 'Не указан'} />
          <DossierRow label="Статус" value={profile ? ROLE_LABELS[profile.role] : 'Не указан'} />
        </View>
      </Card>

      <Card>
        <Tag label="Дизайн карточки" color="#141210" />
        <Text
          style={{ fontFamily: Fonts.mono }}
          className="mt-2 text-xs text-[#6B6560] dark:text-[#A39D93]"
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
              <Text className="text-base text-ink dark:text-paper-dark">{glyph}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Button
        label="Настроить ленту заново"
        variant="outline"
        onPress={() => router.push('/(onboarding)/step1')}
      />
      <Button
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
