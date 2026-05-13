export type ToiletType = 'open' | 'cafe' | 'station';

export interface Toilet {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  type: ToiletType;
  has_paper: boolean;
  has_password: boolean;
  is_accessible: boolean;
  has_diaper: boolean;
  is_24h: boolean;
  hours: string | null;
  phone: string | null;
  rating_avg: number;
  rating_count: number;
  cleanliness_avg: number;
  // 조회 시 계산되는 필드
  distance_m?: number;
}

export interface Review {
  id: string;
  toilet_id: string;
  user_id: string;
  rating: number;
  cleanliness: number;
  has_paper: boolean;
  has_password: boolean;
  body: string | null;
  photo_urls: string[];
  created_at: string;
  // 조인
  user?: { nickname: string; avatar_url: string | null };
}

export interface Visit {
  id: string;
  user_id: string;
  toilet_id: string;
  visited_at: string;
  reviewed: boolean;
  // 조인
  toilet?: Toilet;
}

export interface UserProfile {
  id: string;
  nickname: string;
  avatar_url: string | null;
  provider: string;
}
