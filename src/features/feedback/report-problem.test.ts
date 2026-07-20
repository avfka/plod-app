import { describe, expect, it } from 'vitest';

import { problemReportUrl } from './problem-report-url';

describe('problemReportUrl', () => {
  it('includes the available diagnostic context without personal data', () => {
    const url = new URL(problemReportUrl({ route: '/event/event-42', eventId: 'event-42' }));

    expect(url.origin + url.pathname).toBe('https://github.com/avfka/plod-app/issues/new');
    expect(url.searchParams.get('title')).toBe('PLOD beta: проблема');
    expect(url.searchParams.get('body')).toContain('Маршрут: /event/event-42');
    expect(url.searchParams.get('body')).toContain('Событие: event-42');
  });
});
