import AsyncStorage from '@react-native-async-storage/async-storage';

const CITY_KEY = 'plod.preferred_city_id';

export async function getPreferredCityId() {
  return AsyncStorage.getItem(CITY_KEY);
}

export async function setPreferredCityId(cityId: string) {
  await AsyncStorage.setItem(CITY_KEY, cityId);
}
