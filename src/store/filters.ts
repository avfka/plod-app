import { create } from 'zustand';

import type { Database } from '@/types/database';

type EventType = Database['public']['Enums']['event_type'];
const DEFAULT_CITY_ID = 'a0000000-0000-0000-0000-000000000001';

export type EventFilters = {
  cityId: string | null;
  /** ISO-дата (YYYY-MM-DD); null = любая дата */
  date: string | null;
  types: EventType[];
  directionIds: string[];
  choreographerId: string | null;
  freeOnly: boolean;
};

type FiltersState = EventFilters & {
  cityPickerOpen: boolean;
  setCityPickerOpen: (open: boolean) => void;
  set: (patch: Partial<EventFilters>) => void;
  /** Дефолт из ответов опросника (вызывается после логина/онбординга). */
  applyProfileDefaults: (p: {
    preferred_date: string | null;
    interested_in_mc: boolean;
    interested_in_champ: boolean;
    favorite_choreographer_id: string | null;
    city_id: string | null;
  }) => void;
};

export const useFilters = create<FiltersState>((set) => ({
  cityId: DEFAULT_CITY_ID,
  cityPickerOpen: false,
  date: null,
  types: ['masterclass'],
  directionIds: [],
  choreographerId: null,
  freeOnly: false,
  setCityPickerOpen: (cityPickerOpen) => set({ cityPickerOpen }),
  set: (patch) => set(patch),
  applyProfileDefaults: (p) =>
    set({
      date: p.preferred_date,
      cityId: p.city_id ?? DEFAULT_CITY_ID,
      types: [
        ...(p.interested_in_mc ? (['masterclass'] as const) : []),
        ...(p.interested_in_champ ? (['championship'] as const) : []),
      ],
    }),
}));
