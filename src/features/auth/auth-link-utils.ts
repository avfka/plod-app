export type AuthLinkPayload =
  | { type: 'code'; code: string }
  | { type: 'tokens'; accessToken: string; refreshToken: string }
  | { type: 'empty' };

export function parseAuthLink(url: string): AuthLinkPayload {
  const normalized = url.replace('#', url.includes('?') ? '&' : '?');
  const parsed = new URL(normalized);
  const errorDescription = parsed.searchParams.get('error_description');
  if (errorDescription) throw new Error(errorDescription);

  const code = parsed.searchParams.get('code');
  if (code) return { type: 'code', code };

  const accessToken = parsed.searchParams.get('access_token');
  const refreshToken = parsed.searchParams.get('refresh_token');
  if (accessToken && refreshToken) {
    return { type: 'tokens', accessToken, refreshToken };
  }
  return { type: 'empty' };
}
