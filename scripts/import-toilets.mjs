/**
 * 공공데이터포털 공중화장실 API → Supabase 적재 스크립트
 * 실행: node scripts/import-toilets.mjs
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://zedlolpaqsrsblosumrv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplZGxvbHBhcXNyc2Jsb3N1bXJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTAxNTAsImV4cCI6MjA5NDE4NjE1MH0.yeJOymQ_IVnnRlUGfFObcBBtnUzECsDI6KjJ3eFfdng';
const API_KEY = '4a5264645173796535324e746c5572';

// 서울시 공중화장실 API (공공데이터포털)
const API_URL = 'http://openapi.seoul.go.kr:8088';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function fetchToilets(start, end) {
  const url = `${API_URL}/${API_KEY}/json/SearchPublicToiletPOIService/${start}/${end}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.SearchPublicToiletPOIService;
}

function mapToilet(item) {
  const lat = parseFloat(item.Y_WGS84);
  const lng = parseFloat(item.X_WGS84);

  // 유효하지 않은 좌표 필터링
  if (!lat || !lng || lat < 33 || lat > 38 || lng < 124 || lng > 132) return null;

  return {
    name: item.FNAME || '공중화장실',
    address: item.ANAME || item.FNAME || '',
    lat,
    lng,
    type: 'open',
    has_paper: item.TOILET_TYPE?.includes('휴지') ?? true,
    has_password: false,
    is_accessible: item.DISABLED_SEX_TYPE !== '해당없음' && !!item.DISABLED_SEX_TYPE,
    has_diaper: item.BABY_TYPE !== '해당없음' && !!item.BABY_TYPE,
    is_24h: item.OPEN_TIME === '00:00' && item.CLOSE_TIME === '24:00',
    hours: item.OPEN_TIME && item.CLOSE_TIME
      ? `${item.OPEN_TIME} – ${item.CLOSE_TIME}`
      : null,
    phone: item.PHONE_NUMBER || null,
    source: 'public_api',
    is_verified: true,
  };
}

async function importAll() {
  console.log('공중화장실 데이터 가져오는 중...');

  // 총 개수 먼저 조회
  const first = await fetchToilets(1, 1);
  if (!first) {
    console.error('API 응답 오류. API 키와 서비스 등록 상태를 확인하세요.');
    return;
  }

  const total = first.list_total_count;
  console.log(`총 ${total}개 화장실 데이터 발견`);

  const BATCH = 1000;
  let imported = 0;
  let skipped = 0;

  for (let start = 1; start <= total; start += BATCH) {
    const end = Math.min(start + BATCH - 1, total);
    console.log(`${start}~${end} 처리 중...`);

    const result = await fetchToilets(start, end);
    if (!result?.row) continue;

    const rows = result.row
      .map(mapToilet)
      .filter(Boolean);

    skipped += result.row.length - rows.length;

    // Supabase upsert (중복 방지)
    const { error } = await supabase
      .from('toilets')
      .upsert(rows, { onConflict: 'name,address' });

    if (error) {
      console.error('삽입 오류:', error.message);
    } else {
      imported += rows.length;
      console.log(`  ✅ ${rows.length}개 저장 완료`);
    }

    // API 과호출 방지
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n완료! 저장: ${imported}개, 스킵(좌표오류): ${skipped}개`);
}

importAll().catch(console.error);
