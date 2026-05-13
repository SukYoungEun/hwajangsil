import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Toilet, ToiletType } from '../types';
import { Coords } from './useLocation';

export interface ToiletFilter {
  type?: ToiletType | 'all';
  h24?: boolean;
  accessible?: boolean;
  diaper?: boolean;
}

interface State {
  toilets: Toilet[];
  loading: boolean;
  error: string | null;
}

export function useNearbyToilets(coords: Coords | null, radiusM = 500, filter: ToiletFilter = {}) {
  const [state, setState] = useState<State>({ toilets: [], loading: false, error: null });

  const fetch = useCallback(async () => {
    if (!coords) return;
    setState(prev => ({ ...prev, loading: true, error: null }));

    const { data, error } = await supabase.rpc('nearby_toilets', {
      user_lat: coords.lat,
      user_lng: coords.lng,
      radius_m: radiusM,
    });

    if (error) {
      setState({ toilets: [], loading: false, error: error.message });
      return;
    }

    let result: Toilet[] = data ?? [];

    // 클라이언트 필터
    if (filter.type && filter.type !== 'all') result = result.filter(t => t.type === filter.type);
    if (filter.h24)        result = result.filter(t => t.is_24h);
    if (filter.accessible) result = result.filter(t => t.is_accessible);
    if (filter.diaper)     result = result.filter(t => t.has_diaper);

    setState({ toilets: result, loading: false, error: null });
  }, [coords?.lat, coords?.lng, radiusM, filter.type, filter.h24, filter.accessible, filter.diaper]);

  useEffect(() => { fetch(); }, [fetch]);

  return { ...state, refetch: fetch };
}
