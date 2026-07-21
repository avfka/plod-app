import { describe, expect, it } from 'vitest';

import type { EventWithRelations } from '@/features/events/event-utils';

import { rankEventsForUser, type RecommendationMemory } from './recommendation-engine';

function event(
  id: string,
  directionId: string,
  choreographerId: string,
  choreographerName: string,
  cityId = 'moscow',
): EventWithRelations {
  return {
    age_restriction: null,
    card_color: null,
    choreographer_id: choreographerId,
    contact_phone: null,
    created_at: '2026-07-20T00:00:00.000Z',
    created_by: null,
    description: null,
    direction_id: directionId,
    event_type: 'masterclass',
    id,
    is_free: false,
    marker_icon: null,
    moderation_reason: null,
    photo_url: null,
    price: 1800,
    seats_taken: 0,
    seats_total: 20,
    status: 'active',
    title: id,
    choreographer: {
      created_at: '2026-07-20T00:00:00.000Z',
      id: choreographerId,
      is_verified: true,
      name: choreographerName,
      slug: choreographerId,
    },
    direction: {
      color_hex: '#E8352A',
      id: directionId,
      is_active: true,
      name: directionId === 'hip-hop' ? 'Хип-хоп' : 'Бачата',
      slug: directionId,
      sort_order: 1,
    },
    event_sessions: [
      {
        address: 'Студия',
        city: null,
        city_id: cityId,
        day_number: 1,
        ends_at: '2026-08-02T18:00:00.000Z',
        event_id: id,
        id: `session-${id}`,
        lat: 55.7,
        lng: 37.6,
        starts_at: '2026-08-02T16:00:00.000Z',
      },
    ],
  };
}

const emptyMemory: RecommendationMemory = {
  behavior: [],
  directionIds: [],
  favoriteChoreographerId: null,
  followedChoreographerNames: [],
  interestedInMasterclasses: true,
  preferredCityId: null,
};

describe('personalized feed ranking', () => {
  it('puts explicit onboarding interests ahead of exploration', () => {
    const bachata = event('bachata', 'bachata', 'choreo-b', 'Бета');
    const hipHop = event('hip-hop', 'hip-hop', 'choreo-h', 'Альфа');
    const ranked = rankEventsForUser(
      [bachata, hipHop],
      { ...emptyMemory, directionIds: ['hip-hop'] },
      new Date('2026-07-21T00:00:00.000Z').getTime(),
    );

    expect(ranked[0].event.id).toBe('hip-hop');
    expect(ranked[0].reasons).toContain('Ваше направление · Хип-хоп');
  });

  it('learns from strong behavior across similar events', () => {
    const hipHop = event('new-hip-hop', 'hip-hop', 'choreo-h', 'Альфа');
    const bachata = event('new-bachata', 'bachata', 'choreo-b', 'Бета');
    const ranked = rankEventsForUser(
      [bachata, hipHop],
      {
        ...emptyMemory,
        behavior: [
          {
            choreographerId: 'past-choreo',
            directionId: 'hip-hop',
            eventId: 'past-event',
            signalType: 'booking',
          },
        ],
      },
      new Date('2026-07-21T00:00:00.000Z').getTime(),
    );

    expect(ranked[0].event.id).toBe('new-hip-hop');
    expect(ranked[0].reasons).toContain('Похоже на классы, которые вы открывали');
  });

  it('explains followed choreographer recommendations', () => {
    const followed = event('followed', 'bachata', 'choreo-b', 'Диана Соул');
    const other = event('other', 'hip-hop', 'choreo-h', 'Альфа');
    const ranked = rankEventsForUser(
      [other, followed],
      { ...emptyMemory, followedChoreographerNames: ['диана соул'] },
      new Date('2026-07-21T00:00:00.000Z').getTime(),
    );

    expect(ranked[0].event.id).toBe('followed');
    expect(ranked[0].reasons[0]).toBe('Вы подписаны на Диана Соул');
  });
});
