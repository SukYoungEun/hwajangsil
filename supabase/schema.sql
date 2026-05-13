-- ============================================================
-- 화장실찾기 Supabase 스키마
-- Supabase 대시보드 > SQL Editor 에서 실행하세요
-- ============================================================

-- PostGIS 확장 활성화 (위치 기반 쿼리용)
create extension if not exists postgis;

-- ── 유저 프로필 ──────────────────────────────────────────────
create table public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  nickname    text not null,
  avatar_url  text,
  provider    text,  -- 'kakao' | 'google' | 'email'
  created_at  timestamptz default now()
);

-- 새 유저 가입 시 자동으로 프로필 생성
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, nickname, avatar_url, provider)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', '익명'),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ── 화장실 ────────────────────────────────────────────────────
create table public.toilets (
  id              uuid default gen_random_uuid() primary key,
  name            text not null,
  address         text not null,
  lat             double precision not null,
  lng             double precision not null,
  location        geography(Point, 4326),  -- PostGIS 포인트
  type            text not null check (type in ('open', 'cafe', 'station')),
  has_paper       boolean default true,
  has_password    boolean default false,
  is_accessible   boolean default false,
  has_diaper      boolean default false,
  is_24h          boolean default false,
  hours           text,
  phone           text,
  rating_avg      numeric(3,2) default 0,
  rating_count    integer default 0,
  cleanliness_avg numeric(3,2) default 0,
  is_verified     boolean default false,
  source          text,  -- 'public_api' | 'user_submitted'
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- lat/lng → location 자동 동기화
create or replace function sync_toilet_location()
returns trigger language plpgsql as $$
begin
  new.location = ST_SetSRID(ST_MakePoint(new.lng, new.lat), 4326)::geography;
  return new;
end;
$$;

create trigger toilet_location_sync
  before insert or update of lat, lng on public.toilets
  for each row execute procedure sync_toilet_location();

-- 위치 기반 인덱스
create index toilets_location_idx on public.toilets using gist(location);
create index toilets_type_idx on public.toilets(type);

-- ── 후기 ─────────────────────────────────────────────────────
create table public.reviews (
  id            uuid default gen_random_uuid() primary key,
  toilet_id     uuid references public.toilets on delete cascade not null,
  user_id       uuid references public.profiles on delete cascade not null,
  rating        smallint not null check (rating between 1 and 5),
  cleanliness   smallint check (cleanliness between 1 and 5),
  has_paper     boolean,
  has_password  boolean,
  body          text,
  photo_urls    text[] default '{}',
  created_at    timestamptz default now(),
  unique(toilet_id, user_id)  -- 한 화장실에 유저당 후기 1개
);

-- 후기 작성/삭제 시 rating_avg, rating_count 자동 업데이트
create or replace function update_toilet_rating()
returns trigger language plpgsql as $$
begin
  update public.toilets
  set
    rating_avg      = (select coalesce(avg(rating), 0) from public.reviews where toilet_id = coalesce(new.toilet_id, old.toilet_id)),
    cleanliness_avg = (select coalesce(avg(cleanliness), 0) from public.reviews where toilet_id = coalesce(new.toilet_id, old.toilet_id) and cleanliness is not null),
    rating_count    = (select count(*) from public.reviews where toilet_id = coalesce(new.toilet_id, old.toilet_id)),
    updated_at      = now()
  where id = coalesce(new.toilet_id, old.toilet_id);
  return coalesce(new, old);
end;
$$;

create trigger review_rating_sync
  after insert or update or delete on public.reviews
  for each row execute procedure update_toilet_rating();

-- ── 방문 기록 ─────────────────────────────────────────────────
create table public.visits (
  id          uuid default gen_random_uuid() primary key,
  user_id     uuid references public.profiles on delete cascade not null,
  toilet_id   uuid references public.toilets on delete cascade not null,
  visited_at  timestamptz default now(),
  reviewed    boolean default false
);

create index visits_user_idx on public.visits(user_id, visited_at desc);

-- 후기 작성 시 방문기록 reviewed 자동 업데이트
create or replace function mark_visit_reviewed()
returns trigger language plpgsql as $$
begin
  update public.visits
  set reviewed = true
  where user_id = new.user_id and toilet_id = new.toilet_id;
  return new;
end;
$$;

create trigger review_marks_visit
  after insert on public.reviews
  for each row execute procedure mark_visit_reviewed();

-- ── 북마크 ────────────────────────────────────────────────────
create table public.bookmarks (
  user_id    uuid references public.profiles on delete cascade,
  toilet_id  uuid references public.toilets on delete cascade,
  created_at timestamptz default now(),
  primary key (user_id, toilet_id)
);

-- ============================================================
-- RLS (Row Level Security) 정책
-- ============================================================

alter table public.profiles  enable row level security;
alter table public.toilets   enable row level security;
alter table public.reviews   enable row level security;
alter table public.visits    enable row level security;
alter table public.bookmarks enable row level security;

-- profiles: 본인만 수정, 전체 조회 가능
create policy "profiles_select" on public.profiles for select using (true);
create policy "profiles_update" on public.profiles for update using (auth.uid() = id);

-- toilets: 전체 조회 가능, 로그인한 사용자만 등록
create policy "toilets_select" on public.toilets for select using (true);
create policy "toilets_insert" on public.toilets for insert with check (auth.role() = 'authenticated');

-- reviews: 전체 조회, 본인만 작성/수정/삭제
create policy "reviews_select" on public.reviews for select using (true);
create policy "reviews_insert" on public.reviews for insert with check (auth.uid() = user_id);
create policy "reviews_update" on public.reviews for update using (auth.uid() = user_id);
create policy "reviews_delete" on public.reviews for delete using (auth.uid() = user_id);

-- visits: 본인 기록만
create policy "visits_select" on public.visits for select using (auth.uid() = user_id);
create policy "visits_insert" on public.visits for insert with check (auth.uid() = user_id);
create policy "visits_update" on public.visits for update using (auth.uid() = user_id);

-- bookmarks: 본인 것만
create policy "bookmarks_select" on public.bookmarks for select using (auth.uid() = user_id);
create policy "bookmarks_insert" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "bookmarks_delete" on public.bookmarks for delete using (auth.uid() = user_id);

-- ============================================================
-- 주변 화장실 검색 함수 (PostGIS)
-- 사용: select * from nearby_toilets(37.498, 127.028, 500)
-- ============================================================

create or replace function nearby_toilets(
  user_lat  double precision,
  user_lng  double precision,
  radius_m  integer default 500
)
returns table (
  id              uuid,
  name            text,
  address         text,
  lat             double precision,
  lng             double precision,
  type            text,
  has_paper       boolean,
  has_password    boolean,
  is_accessible   boolean,
  has_diaper      boolean,
  is_24h          boolean,
  hours           text,
  rating_avg      numeric,
  rating_count    integer,
  cleanliness_avg numeric,
  distance_m      integer
)
language sql stable as $$
  select
    t.id, t.name, t.address, t.lat, t.lng, t.type,
    t.has_paper, t.has_password, t.is_accessible, t.has_diaper, t.is_24h,
    t.hours, t.rating_avg, t.rating_count, t.cleanliness_avg,
    ST_Distance(t.location, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography)::integer as distance_m
  from public.toilets t
  where ST_DWithin(
    t.location,
    ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
    radius_m
  )
  order by distance_m;
$$;
