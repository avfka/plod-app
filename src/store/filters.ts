import { create } from 'zustand';

import type { Database } from '@/types/database';

type EventType = Database['public']['Enums']['event_type'];

export type EventFilters = {
  /** ISO-дата (YYYY-MM-DD); null = любая дата */
  date: string | null;
  types: EventType[];
  directionId: string | null;
  choreographerId: string | null;
  freeOnly: boolean;
};

type FiltersState = EventFilters & {
  set: (patch: Partial<EventFilters>) => void;
  /** Дефолт из ответов опросника (вызывается после логина/онбординга). */
  applyProfileDefaults: (p: {
    preferred_date: string | null;
    interested_in_mc: boolean;
    interested_in_champ: boolean;
    favorite_choreographer_id: string | null;
  }) => void;
};

export const useFilters = create<FiltersState>((set) => ({
  date: null,
  types: ['masterclass'],
  directionId: null,
  choreographerId: null,
  freeOnly: false,
  set: (patch) => set(patch),
  applyProfileDefaults: (p) =>
    set({
      date: p.preferred_date,
      types: [
        ...(p.interested_in_mc ? (['masterclass'] as const) : []),
        ...(p.interested_in_champ ? (['championship'] as const) : []),
      ],
    }),
}));
