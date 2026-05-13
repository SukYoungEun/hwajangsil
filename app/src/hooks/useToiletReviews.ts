import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Review } from '../types';

export function useToiletReviews(toiletId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from('reviews')
      .select('*, user:profiles(nickname, avatar_url)')
      .eq('toilet_id', toiletId)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled) {
          setReviews((data as Review[]) ?? []);
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  }, [toiletId]);

  return { reviews, loading };
}
