import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { supabase } from '@/lib/supabase';

const ENTRY_KEY = 'tanz_karta_entry_done'; // welcome пройден (гость или логин)
const ONBOARDING_KEY = 'tanz_karta_onboarding_done'; // опросник сохранён

export async function getEntryDone() {
  return (await AsyncStorage.getItem(ENTRY_KEY)) === '1';
}
export async function setEntryDone() {
  await AsyncStorage.setItem(ENTRY_KEY, '1');
}
export async function getOnboardingDone() {
  return (await AsyncStorage.getItem(ONBOARDING_KEY)) === '1';
}
export async function setOnboardingDone() {
  await AsyncStorage.setItem(ONBOARDING_KEY, '1');
}

/** Черновик ответов опросника (3 шага) до записи в profiles. */
type OnboardingDraft = {
  preferredDate: string | null; // YYYY-MM-DD, null = любая
  interestedInMc: boolean;
  interestedInChamp: boolean;
  directionIds: string[];
  favoriteChoreographerId: string | null;
  /** Имя для подписки, если хореограф не найден в справочнике. */
  subscribeChoreographerName: string | null;
  set: (patch: Partial<Omit<OnboardingDraft, 'set'>>) => void;
};

export const useOnboardingDraft = create<OnboardingDraft>((set) => ({
  preferredDate: null,
  interestedInMc: true,
  interestedInChamp: false,
  directionIds: [],
  favoriteChoreographerId: null,
  subscribeChoreographerName: null,
  set: (patch) => set(patch),
}));

export function hydrateOnboardingDraft(input: {
  directionIds: string[];
  favoriteChoreographerId: string | null;
  interestedInChamp: boolean;
  interestedInMc: boolean;
  preferredDate: string | null;
}) {
  useOnboardingDraft.getState().set({
    ...input,
    subscribeChoreographerName: null,
  });
}

/** Сохранение ответов: profiles + (опц.) подписка на будущего хореографа. */
export async function saveOnboarding(draft: {
  preferredDate: string | null;
  interestedInMc: boolean;
  interestedInChamp: boolean;
  directionIds: string[];
  favoriteChoreographerId: string | null;
  subscribeChoreographerName: string | null;
}) {
  const { data: auth } = await supabase.auth.getUser();
  const userId = auth.user?.id;
  if (!userId) throw new Error('NOT_AUTHENTICATED');

  const { error } = await supabase
    .from('profiles')
    .update({
      preferred_date: draft.preferredDate,
      interested_in_mc: draft.interestedInMc,
      interested_in_champ: draft.interestedInChamp,
      favorite_choreographer_id: draft.favoriteChoreographerId,
    })
    .eq('id', userId);
  if (error) throw error;

  const { error: deleteDirectionsError } = await supabase
    .from('profile_directions')
    .delete()
    .eq('profile_id', userId);
  if (deleteDirectionsError) throw deleteDirectionsError;

  if (draft.directionIds.length > 0) {
    const { error: directionsError } = await supabase.from('profile_directions').insert(
      draft.directionIds.map((directionId) => ({
        direction_id: directionId,
        profile_id: userId,
      })),
    );
    if (directionsError) throw directionsError;
  }

  if (draft.subscribeChoreographerName) {
    // не найден в справочнике — подписка «сообщить, когда появится»
    const { error: subError } = await supabase.from('choreographer_subscriptions').upsert(
      { user_id: userId, choreographer_name: draft.subscribeChoreographerName },
      { onConflict: 'user_id,choreographer_name' },
    );
    if (subError) throw subError;
  }

  await setOnboardingDone();
}
