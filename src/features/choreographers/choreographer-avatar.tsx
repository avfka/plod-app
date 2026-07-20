import { Text, View } from 'react-native';

import { Fonts } from '@/theme';

const AVATAR_COLORS = ['#E8352A', '#6558D3', '#30766A', '#9B5D28', '#6D3D6A'];

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('ru-RU');
}

export function ChoreographerAvatar({ name, size = 48 }: { name: string; size?: number }) {
  const colorIndex = [...name].reduce((total, character) => total + character.charCodeAt(0), 0);

  return (
    <View
      accessibilityLabel={`Хореограф ${name}`}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderColor: '#F5F1E8',
        borderWidth: 1,
        backgroundColor: AVATAR_COLORS[colorIndex % AVATAR_COLORS.length],
      }}
      className="items-center justify-center"
    >
      <Text
        style={{ fontFamily: Fonts.mono, fontSize: Math.max(11, size * 0.28) }}
        className="font-bold text-paper-dark"
      >
        {initials(name)}
      </Text>
    </View>
  );
}
