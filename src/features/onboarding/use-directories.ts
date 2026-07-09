import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tables } from '@/types/database';

export function useDanceDirections() {
  return useQuery({
    queryKey: ['dance_directions'],
    staleTime: Infinity,
    queryFn: async (): Promise<Tables<'dance_directions'>[]> => {
      const { data, error } = await supabase
        .from('dance_directions')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (error) throw error;
      return data ?? [];
    },
  });
}

/** Поиск хореографа по имени (Шаг 3 опросника и фильтр). */
export function useChoreographerSearch(query: string) {
  const q = query.trim();
  return useQuery({
    queryKey: ['choreographers', 'search', q.toLowerCase()],
    enabled: q.length >= 2,
    queryFn: async (): Promise<Tables<'choreographers'>[]> => {
      const { data, error } = await supabase
        .from('choreographers')
        .select('*')
        .ilike('name', `%${q}%`)
        .limit(10);
      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useChoreographers() {
  return useQuery({
    queryKey: ['choreographers', 'all'],
    queryFn: async (): Promise<Tables<'choreographers'>[]> => {
      const { data, error } = await supabase.from('choreographers').select('*').order('name');
      if (error) throw error;
      return data ?? [];
    },
  });
}
