import { describe, expect, it } from 'vitest';

import { parseAuthLink } from './auth-link-utils';

describe('native auth links', () => {
  it('parses a PKCE code', () => {
    expect(parseAuthLink('plod:///?code=one-time-code')).toEqual({
      type: 'code',
      code: 'one-time-code',
    });
  });

  it('parses implicit tokens from a URL fragment', () => {
    expect(parseAuthLink('plod:///#access_token=access&refresh_token=refresh')).toEqual({
      type: 'tokens',
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('surfaces provider errors', () => {
    expect(() => parseAuthLink('plod:///?error_description=Link%20expired')).toThrow('Link expired');
  });
});
