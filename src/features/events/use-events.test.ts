import { describe, expect, it } from 'vitest';

import type { EventFilters } from '@/store/filters';

import {
  applyEventFilters,
  firstSession,
  searchEvents,
  type EventWithRelations,
} from './event-utils';

function event(
  patch: Partial<EventWithRelations> & Pick<EventWithRelations, 'id' | 'title'>,
): EventWithRelations {
  return {
    age_restriction: null,
    card_color: null,
    choreographer_id: null,
    contact_phone: null,
    created_at: '2026-07-15T00:00:00.000Z',
    created_by: null,
    description: null,
    direction_id: null,
    event_type: 'masterclass',
    is_free: false,
    marker_icon: null,
    moderation_reason: null,
    photo_url: null,
    price: 1000,
    seats_taken: 0,
    seats_total: 20,
    status: 'active',
    choreographer: null,
    direction: null,
    event_sessions: [],
    ...patch,
  };
}

const filters: EventFilters = {
  cityId: null,
  date: null,
  types: [],
  directionId: null,
  choreographerId: null,
  freeOnly: false,
};

describe('event discovery', () => {
  const hiphop = event({
    id: 'event-1',
    title: 'Грув лаборатория',
    choreographer_id: 'choreo-1',
    direction_id: 'direction-1',
    choreographer: { id: 'choreo-1', name: 'Алексей Летучий', slug: 'alexey-letuchiy', is_verified: true, created_at: '2026-07-15T00:00:00.000Z' },
    direction: { id: 'direction-1', name: 'Хип-хоп', slug: 'hiphop', color_hex: '#45B7D1', is_active: true, sort_order: 1 },
    event_sessions: [
      { id: 'session-1', event_id: 'event-1', city_id: 'city-1', city: null, day_number: 1, starts_at: '2026-07-20T16:00:00.000Z', ends_at: '2026-07-20T18:00:00.000Z', address: 'Флакон', lat: 55.8, lng: 37.5 },
      { id: 'session-2', event_id: 'event-1', city_id: 'city-1', city: null, day_number: 2, starts_at: '2026-07-21T16:00:00.000Z', ends_at: '2026-07-21T18:00:00.000Z', address: 'Артплей', lat: 55.7, lng: 37.6 },
    ],
  });
  const freeChampionship = event({
    id: 'event-2',
    title: 'Чемпионат по сальсе',
    event_type: 'championship',
    is_free: true,
    price: null,
  });

  it('combines type and free filters', () => {
    expect(
      applyEventFilters(
        [hiphop, freeChampionship],
        { ...filters, types: ['championship'], freeOnly: true },
      ).map(({ id }) => id),
    ).toEqual(['event-2']);
  });

  it('limits discovery to the selected city', () => {
    expect(applyEventFilters([hiphop], { ...filters, cityId: 'city-1' })).toHaveLength(1);
    expect(applyEventFilters([hiphop], { ...filters, cityId: 'city-2' })).toHaveLength(0);
  });

  it('prioritizes the favorite choreographer', () => {
    expect(
      applyEventFilters([freeChampionship, hiphop], filters, 'choreo-1').map(({ id }) => id),
    ).toEqual(['event-1', 'event-2']);
  });

  it('searches direction, choreographer and venue address', () => {
    expect(searchEvents([hiphop], 'алексей')).toHaveLength(1);
    expect(searchEvents([hiphop], 'хип-хоп')).toHaveLength(1);
    expect(searchEvents([hiphop], 'артплей')).toHaveLength(1);
    expect(searchEvents([hiphop], 'бачата')).toHaveLength(0);
  });

  it('uses the session stored in a booking', () => {
    expect(firstSession(hiphop, 'session-2')?.address).toBe('Артплей');
  });
});
