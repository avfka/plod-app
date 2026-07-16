import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, Text, View } from 'react-native';

import { useCities } from '@/features/onboarding/use-directories';
import { useFilters } from '@/store/filters';
import { Fonts, palette } from '@/theme';

export const MOSCOW_CITY_ID = 'a0000000-0000-0000-0000-000000000001';

export function CityContextBar({ inverted = false }: { inverted?: boolean }) {
  const { data: cities = [] } = useCities();
  const cityId = useFilters((state) => state.cityId) ?? MOSCOW_CITY_ID;
  const setFilters = useFilters((state) => state.set);
  const open = useFilters((state) => state.cityPickerOpen);
  const setOpen = useFilters((state) => state.setCityPickerOpen);
  const selected = cities.find((city) => city.id === cityId);

  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Город: ${selected?.name ?? 'Москва'}. Изменить`}
        onPress={() => setOpen(true)}
        className={`min-h-11 flex-row items-center justify-between border-b px-[18px] active:opacity-70 ${inverted ? 'border-[#39342E] bg-night' : 'border-ink bg-paper dark:border-paper-dark dark:bg-night'}`}
      >
        <View className="flex-row items-center gap-2">
          <Ionicons name="location-sharp" size={14} color={palette.red} />
          <Text style={{ fontFamily: Fonts.mono, letterSpacing: 1.2 }} className={`text-xs font-bold uppercase ${inverted ? 'text-paper-dark' : 'text-ink dark:text-paper-dark'}`}>
            {selected?.name ?? 'Москва'}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Text style={{ fontFamily: Fonts.sans }} className="text-xs font-semibold text-accent">Сменить город</Text>
          <Ionicons name="chevron-down" size={14} color={palette.red} />
        </View>
      </Pressable>

      <Modal transparent animationType="slide" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable className="flex-1 justify-end bg-black/60" onPress={() => setOpen(false)}>
          <Pressable accessibilityViewIsModal className="border-t-2 border-accent bg-paper px-[18px] pb-10 pt-5 dark:bg-night" onPress={(event) => event.stopPropagation()}>
            <View className="mb-5 flex-row items-start justify-between">
              <View className="flex-1 pr-4">
                <Text style={{ fontFamily: Fonts.mono, letterSpacing: 2 }} className="text-lg font-bold uppercase text-ink dark:text-paper-dark">Город событий</Text>
                <Text style={{ fontFamily: Fonts.sans }} className="mt-1 text-sm text-[#6B6560] dark:text-[#A39D93]">Карта и афиша обновятся вместе.</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Закрыть" onPress={() => setOpen(false)} className="h-10 w-10 items-end">
                <Ionicons name="close" size={24} color={palette.red} />
              </Pressable>
            </View>
            <View className="border-t border-ink dark:border-paper-dark">
              {cities.map((city) => {
                const active = city.id === cityId;
                return (
                  <Pressable
                    key={city.id}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: active }}
                    onPress={() => { setFilters({ cityId: city.id }); setOpen(false); }}
                    className="min-h-14 flex-row items-center justify-between border-b border-ink px-1 active:bg-[#FCE8E5] dark:border-paper-dark"
                  >
                    <Text style={{ fontFamily: Fonts.mono }} className={`text-base font-bold uppercase ${active ? 'text-accent' : 'text-ink dark:text-paper-dark'}`}>{city.name}</Text>
                    <View className={`h-4 w-4 items-center justify-center rounded-full border ${active ? 'border-accent' : 'border-[#8A847C]'}`}>
                      {active ? <View className="h-2 w-2 rounded-full bg-accent" /> : null}
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
