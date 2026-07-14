import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

import type { Database } from '@/types/database';

const supabaseUrl =
  process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://roryjhgwvmdiopzsudgm.supabase.co';
const supabaseAnonKey =
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ??
  'sb_publishable_0wUJFdulfyemBH0lRuHbNA_wpojvU82';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    // На web supabase-js использует localStorage сам; AsyncStorage нужен только нативно.
    ...(Platform.OS !== 'web' ? { storage: AsyncStorage } : {}),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
