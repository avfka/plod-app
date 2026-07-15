import * as Linking from 'expo-linking';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';
import { parseAuthLink } from './auth-link-utils';

export async function createSessionFromAuthUrl(url: string) {
  const payload = parseAuthLink(url);
  if (payload.type === 'code') {
    const { error } = await supabase.auth.exchangeCodeForSession(payload.code);
    if (error) throw error;
    return true;
  }

  if (payload.type === 'empty') return false;
  const { error } = await supabase.auth.setSession({
    access_token: payload.accessToken,
    refresh_token: payload.refreshToken,
  });
  if (error) throw error;
  return true;
}

export function useNativeAuthLink() {
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const handleUrl = ({ url }: { url: string }) => {
      void createSessionFromAuthUrl(url).catch(() => undefined);
    };
    void Linking.getInitialURL().then((url) => {
      if (url) handleUrl({ url });
    });
    const subscription = Linking.addEventListener('url', handleUrl);
    return () => subscription.remove();
  }, []);
}
