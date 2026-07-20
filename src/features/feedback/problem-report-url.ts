const ISSUE_URL = 'https://github.com/avfka/plod-app/issues/new';

export type ProblemContext = {
  eventId?: string;
  route?: string;
};

export function problemReportUrl({ eventId, route }: ProblemContext = {}) {
  const context = [
    route ? `Маршрут: ${route}` : null,
    eventId ? `Событие: ${eventId}` : null,
  ].filter(Boolean);
  const body = [
    'Опишите, что произошло и что вы ожидали увидеть.',
    '',
    ...context,
    '',
    'Не публикуйте пароль, номер телефона или другие чувствительные данные.',
  ].join('\n');
  const params = new URLSearchParams({
    title: 'PLOD beta: проблема',
    body,
    labels: 'beta-feedback',
  });

  return `${ISSUE_URL}?${params.toString()}`;
}
