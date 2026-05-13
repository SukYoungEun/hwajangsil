# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## 프로젝트 개요

**화장실찾기** — 개방형 화장실, 카페, 지하철역 화장실을 GPS 기반으로 찾아주는 모바일 앱.
React Native (Expo) + Supabase + 네이버지도 API 조합.

---

## 개발 명령어

모든 명령은 `app/` 디렉토리 안에서 실행.

```bash
cd app
npm start          # Expo 개발 서버 시작 (Expo Go로 QR 스캔)
npm run android    # Android 에뮬레이터 실행
npm run ios        # iOS 시뮬레이터 실행 (macOS 전용)
```

**패키지 설치 시 반드시 `--legacy-peer-deps` 플래그 필요:**
```bash
npm install <패키지> --legacy-peer-deps
```

**화장실 데이터 적재 (최초 1회):**
```bash
cd scripts
npm install
node import-toilets.mjs
```

---

## 환경변수

`app/.env` (`.env.example` 참고):
```
EXPO_PUBLIC_SUPABASE_URL=https://zedlolpaqsrsblosumrv.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
EXPO_PUBLIC_TOILET_API_KEY=...   # 공공데이터포털 공중화장실 API
EXPO_PUBLIC_KAKAO_MAP_KEY=...    # 카카오 지도 JavaScript API 키
```

---

## 아키텍처

### 레이어 구조

```
App.tsx (NavigationContainer + Stack)
└── TabNavigator (홈/검색/마이 탭)
    └── Screen
        ├── hooks/         데이터 페칭 (Supabase, GPS)
        ├── components/    재사용 UI
        └── constants/     색상 토큰
```

### 네비게이션 구조

- **Stack** (`RootStackParamList`): Tabs → Detail, Emergency, Review, Alt, Visits
- **Tab**: Home, Search, My
- Emergency는 `fullScreenModal` 로 표시

### 데이터 흐름

1. `useLocation` → GPS 좌표 (expo-location, 20m 간격 업데이트)
2. `useNearbyToilets(coords, radiusM, filter)` → Supabase RPC `nearby_toilets()` 호출 → 거리순 정렬된 `Toilet[]` 반환
3. 컴포넌트에서 직접 `supabase` 클라이언트 임포트해도 되나, 공통 로직은 hooks으로 분리

### Supabase 핵심 구조

- **`nearby_toilets(user_lat, user_lng, radius_m)`** — PostGIS 기반 RPC 함수. 반경 내 화장실을 거리순으로 반환. 클라이언트에서 타입/시설 필터는 JS로 처리.
- **`toilets.location`** — `geography(Point, 4326)` 컬럼. `lat`/`lng` INSERT/UPDATE 시 트리거로 자동 동기화됨.
- **RLS 적용**: profiles/reviews/visits/bookmarks는 `auth.uid()` 기반 Row Level Security 활성화. toilets는 전체 조회 가능.
- 후기 작성 → `reviews` INSERT 트리거 → `toilets.rating_avg` 자동 업데이트
- 후기 작성 → `visits.reviewed = true` 자동 업데이트

---

## 디자인 시스템

`src/constants/colors.ts`에 전체 색상 토큰 정의. 하드코딩 금지.

주요 색상:
- `colors.primary` — 브랜드 teal `#08A7BF`
- `colors.urgent` — 긴급 빨강 `#FF3B2A`
- `colors.cafe` — 카페 브라운 `#B96530`
- `colors.station` — 지하철 블루 `#1A6AAF`

화장실 타입별 glyph: `화` (open), `카` (cafe), `역` (station)

디자인 원본 프로토타입은 `project/화장실찾기.html` (React + Babel 단일 파일, 브라우저에서 바로 열 수 있음). 화면 레이아웃/컬러/UX 레퍼런스로 사용.

---

## 구현 현황 (Phase 1 완료)

| 항목 | 상태 |
|------|------|
| Expo 프로젝트 세팅 | ✅ |
| Supabase DB 스키마 (PostGIS, RLS) | ✅ |
| useLocation (GPS) | ✅ |
| useNearbyToilets (Supabase RPC) | ✅ |
| ToiletCard / ToiletListRow 컴포넌트 | ✅ |
| HomeScreen (검색바 + 필터 + FAB + 하단 시트) | ✅ |
| EmergencyScreen (다크 UI, 네이버지도 딥링크) | ✅ |
| DetailScreen | ⬜ |
| 카카오 소셜 로그인 | ⬜ |
| ReviewScreen | ⬜ |
| SearchScreen (실제 기능) | ⬜ |
| AltScreen (대안 카페/지하철) | ⬜ |
| VisitsScreen (방문 기록) | ⬜ |
| 화장실 데이터 적재 (공공API → Supabase) | ⬜ 로컬 실행 필요 |

---

## 외부 서비스

| 서비스 | 용도 | 비고 |
|--------|------|------|
| Supabase | DB, Auth, Storage | `zedlolpaqsrsblosumrv` 프로젝트 |
| 카카오 개발자센터 | 지도 API (JS키), 소셜 로그인 | JavaScript 키 발급 완료 |
| 공공데이터포털 | 공중화장실 데이터 | `SearchPublicToiletPOIService` |

카카오 길안내는 `kakaomap://route?ep={lat},{lng}&by=FOOT` 딥링크 우선, 실패 시 `map.kakao.com/link/to/{name},{lat},{lng}` 웹으로 폴백.
지도 표시는 `KakaoMap` WebView 컴포넌트 (react-native-webview + Kakao Maps JS SDK) 사용.

---

## 참고 자료

- `project/화장실찾기.html` — 전체 화면 디자인 프로토타입 (오프라인 실행 가능)
- `supabase/schema.sql` — DB 전체 스키마 (재실행 불가, 이미 적용됨)
- `scripts/import-toilets.mjs` — 공공 화장실 데이터 일괄 적재 스크립트
