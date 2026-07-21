import type { EventWithRelations } from '@/features/events/event-utils';

export type RecommendationSignalType = 'view' | 'open' | 'map_open';
export type BehavioralSignalType = RecommendationSignalType | 'booking';

export type RecommendationBehavior = {
  choreographerId: string | null;
  directionId: string | null;
  eventId: string;
  signalType: BehavioralSignalType;
};

export type RecommendationMemory = {
  directionIds: string[];
  favoriteChoreographerId: string | null;
  followedChoreographerNames: string[];
  interestedInMasterclasses: boolean;
  preferredCityId: string | null;
  behavior: RecommendationBehavior[];
};

export type RecommendedEvent = {
  event: EventWithRelations;
  reasons: string[];
  score: number;
};

const SIGNAL_WEIGHT: Record<BehavioralSignalType, number> = {
  view: 1,
  open: 4,
  map_open: 5,
  booking: 9,
};

function stableExplorationScore(id: string) {
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 997;
  return (hash % 5) + 1;
}

function nextStart(event: EventWithRelations) {
  return event.event_sessions
    .map((session) => new Date(session.starts_at).getTime())
    .filter(Number.isFinite)
    .sort((a, b) => a - b)[0] ?? Number.POSITIVE_INFINITY;
}

function addAffinity(
  map: Map<string, number>,
  id: string | null,
  signalType: BehavioralSignalType,
) {
  if (!id) return;
  map.set(id, (map.get(id) ?? 0) + SIGNAL_WEIGHT[signalType]);
}

/**
 * Deterministic v1 ranker: explicit onboarding answers lead, strong actions
 * reinforce affinities, and a small stable exploration score keeps discovery open.
 */
export function rankEventsForUser(
  events: EventWithRelations[],
  memory: RecommendationMemory,
  now = Date.now(),
): RecommendedEvent[] {
  const directionAffinity = new Map<string, number>();
  const choreographerAffinity = new Map<string, number>();

  for (const signal of memory.behavior) {
    addAffinity(directionAffinity, signal.directionId, signal.signalType);
    addAffinity(choreographerAffinity, signal.choreographerId, signal.signalType);
  }

  const explicitDirections = new Set(memory.directionIds);
  const followedNames = new Set(
    memory.followedChoreographerNames.map((name) => name.trim().toLocaleLowerCase('ru-RU')),
  );

  return events
    .map((event): RecommendedEvent => {
      let score = stableExplorationScore(event.id);
      const reasons: string[] = [];
      const choreographerName = event.choreographer?.name.trim().toLocaleLowerCase('ru-RU');
      const inPreferredCity =
        !!memory.preferredCityId &&
        event.event_sessions.some((session) => session.city_id === memory.preferredCityId);

      if (event.choreographer_id === memory.favoriteChoreographerId) {
        score += 55;
        reasons.push(`Любимый хореограф · ${event.choreographer?.name ?? 'ваш выбор'}`);
      } else if (choreographerName && followedNames.has(choreographerName)) {
        score += 40;
        reasons.push(`Вы подписаны на ${event.choreographer?.name}`);
      }

      if (event.direction_id && explicitDirections.has(event.direction_id)) {
        score += 34;
        reasons.push(`Ваше направление · ${event.direction?.name ?? 'танцы'}`);
      }

      const learnedDirection = event.direction_id
        ? Math.min(24, (directionAffinity.get(event.direction_id) ?? 0) * 2)
        : 0;
      const learnedChoreographer = event.choreographer_id
        ? Math.min(28, (choreographerAffinity.get(event.choreographer_id) ?? 0) * 2)
        : 0;
      score += learnedDirection + learnedChoreographer;

      if (
        reasons.length === 0 &&
        (learnedDirection >= 6 || learnedChoreographer >= 8)
      ) {
        reasons.push('Похоже на классы, которые вы открывали');
      }

      if (inPreferredCity) {
        score += 24;
        reasons.push('В вашем городе');
      }

      if (memory.interestedInMasterclasses && event.event_type === 'masterclass') score += 8;

      const daysUntilStart = (nextStart(event) - now) / 86_400_000;
      if (daysUntilStart >= 0 && daysUntilStart <= 14) {
        score += Math.max(2, 12 - Math.floor(daysUntilStart / 2));
        if (reasons.length === 0) reasons.push('Скоро начинается');
      }

      if (reasons.length === 0) reasons.push('Новое для вас');

      return { event, reasons: reasons.slice(0, 2), score };
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        nextStart(a.event) - nextStart(b.event) ||
        a.event.id.localeCompare(b.event.id),
    );
}
