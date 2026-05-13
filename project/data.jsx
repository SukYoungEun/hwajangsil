// data.jsx — Mock data for 화장실찾기
// Three demo scenarios: 강남역 / 홍대입구 / 종로3가

const SCENARIOS = {
  gangnam: {
    label: '강남역 11번 출구',
    me: { x: 50, y: 55 },
    spots: [
      { id: 'g1', type: 'open', name: '강남역 공중화장실', sub: '11번 출구 지하 1층', dist: 28, time: 25, rating: 4.6, cleanliness: 4.8, paper: true, password: false, accessible: true, diaper: true, h24: false, x: 48, y: 42, isClosed: false, glyph: '화', tags: ['장애인용', '기저귀'], hours: '06:00 – 23:30' },
      { id: 'g2', type: 'cafe', name: '스타벅스 강남R점', sub: '음료 구매 후 비번 수령', dist: 64, time: 55, rating: 4.2, cleanliness: 4.5, paper: true, password: true, accessible: true, diaper: false, h24: false, x: 38, y: 30, isClosed: false, glyph: '카', tags: ['카페', '비번필요'], hours: '07:00 – 22:00' },
      { id: 'g3', type: 'station', name: '강남역 (2호선) 화장실', sub: '교통카드 태그 후 이용', dist: 95, time: 80, rating: 3.8, cleanliness: 3.4, paper: false, password: false, accessible: true, diaper: true, h24: false, x: 58, y: 50, isClosed: false, glyph: '역', tags: ['지하철', '24시간X'], hours: '05:30 – 24:30' },
      { id: 'g4', type: 'open', name: '뉴욕제과 옆 공중화장실', sub: '강남대로변', dist: 142, time: 120, rating: 3.2, cleanliness: 2.9, paper: false, password: false, accessible: false, diaper: false, h24: true, x: 25, y: 58, isClosed: false, glyph: '화', tags: ['24시간'], hours: '24시간' },
      { id: 'g5', type: 'cafe', name: '투썸플레이스 강남대로점', sub: '주문 영수증 번호', dist: 168, time: 140, rating: 4.0, cleanliness: 4.1, paper: true, password: true, accessible: false, diaper: false, h24: false, x: 70, y: 38, isClosed: true, glyph: '카', tags: ['카페'], hours: '08:00 – 22:00' },
      { id: 'g6', type: 'open', name: '교보타워 공개화장실', sub: '강남파이낸스센터 옆', dist: 210, time: 175, rating: 4.4, cleanliness: 4.6, paper: true, password: false, accessible: true, diaper: true, h24: false, x: 72, y: 70, isClosed: false, glyph: '화', tags: ['장애인용'], hours: '07:00 – 22:00' },
    ],
  },
  hongdae: {
    label: '홍대입구역 9번 출구',
    me: { x: 52, y: 50 },
    spots: [
      { id: 'h1', type: 'cafe', name: '커피빈 홍대점', sub: '음료 구매 권장', dist: 42, time: 35, rating: 4.1, cleanliness: 4.2, paper: true, password: false, accessible: false, diaper: false, h24: false, x: 60, y: 40, isClosed: false, glyph: '카', tags: ['카페'], hours: '08:00 – 23:00' },
      { id: 'h2', type: 'open', name: '홍대 걷고싶은거리 공중화장실', sub: '거리 중앙 광장 옆', dist: 110, time: 92, rating: 2.8, cleanliness: 2.4, paper: false, password: false, accessible: false, diaper: false, h24: true, x: 32, y: 28, isClosed: false, glyph: '화', tags: ['24시간', '청결낮음'], hours: '24시간' },
      { id: 'h3', type: 'station', name: '홍대입구역 (2호선) 화장실', sub: '개찰구 안', dist: 78, time: 66, rating: 4.0, cleanliness: 3.9, paper: true, password: false, accessible: true, diaper: true, h24: false, x: 48, y: 62, isClosed: false, glyph: '역', tags: ['지하철'], hours: '05:30 – 24:30' },
      { id: 'h4', type: 'open', name: '홍대공원 공중화장실', sub: '공원 입구', dist: 245, time: 200, rating: 3.6, cleanliness: 3.5, paper: true, password: false, accessible: true, diaper: false, h24: false, x: 24, y: 75, isClosed: false, glyph: '화', tags: ['공원'], hours: '06:00 – 22:00' },
      { id: 'h5', type: 'cafe', name: '맥도날드 홍대R점', sub: '구매 영수증 번호', dist: 156, time: 130, rating: 3.4, cleanliness: 3.6, paper: true, password: true, accessible: false, diaper: true, h24: true, x: 74, y: 56, isClosed: false, glyph: '카', tags: ['카페', '24시간', '비번필요'], hours: '24시간' },
    ],
  },
  jongno: {
    label: '종로3가역 1번 출구',
    me: { x: 50, y: 52 },
    spots: [
      { id: 'j1', type: 'open', name: '탑골공원 공중화장실', sub: '공원 동쪽 출입구', dist: 58, time: 48, rating: 4.0, cleanliness: 4.0, paper: true, password: false, accessible: true, diaper: false, h24: false, x: 42, y: 38, isClosed: false, glyph: '화', tags: ['공원'], hours: '06:00 – 22:00' },
      { id: 'j2', type: 'station', name: '종로3가역 (1호선) 화장실', sub: '개찰구 안', dist: 72, time: 60, rating: 3.7, cleanliness: 3.4, paper: false, password: false, accessible: true, diaper: false, h24: false, x: 58, y: 60, isClosed: false, glyph: '역', tags: ['지하철'], hours: '05:30 – 24:30' },
      { id: 'j3', type: 'open', name: '종묘 광장 공중화장실', sub: '광장 동쪽', dist: 188, time: 158, rating: 4.5, cleanliness: 4.7, paper: true, password: false, accessible: true, diaper: true, h24: false, x: 70, y: 30, isClosed: false, glyph: '화', tags: ['장애인용', '기저귀'], hours: '07:00 – 21:00' },
      { id: 'j4', type: 'cafe', name: '엔제리너스 종로점', sub: '음료 구매', dist: 124, time: 105, rating: 3.9, cleanliness: 4.0, paper: true, password: false, accessible: false, diaper: false, h24: false, x: 30, y: 68, isClosed: false, glyph: '카', tags: ['카페'], hours: '07:00 – 22:00' },
    ],
  },
};

// Sample reviews — anchored to the closest spot of each scenario
const REVIEWS = [
  { name: '김지은', initial: '김', when: '2일 전', rating: 5, paperVote: 'yes', passwordVote: 'no', cleanVote: 5, text: '지하철역에서 가깝고 새로 리모델링한 듯 매우 깨끗합니다. 손소독제, 화장지 모두 비치되어 있어요. 평일 오전이라 그런지 줄도 없었습니다.', tags: ['청결함', '휴지있음'] },
  { name: '박민호', initial: '박', when: '5일 전', rating: 4, paperVote: 'yes', passwordVote: 'no', cleanVote: 4, text: '시설은 깔끔한데 칸 수가 적어서 점심시간에는 대기가 좀 있습니다. 그래도 강남에서는 양호한 편.', tags: ['약간혼잡'] },
  { name: '이수민', initial: '이', when: '1주 전', rating: 5, paperVote: 'yes', passwordVote: 'no', cleanVote: 5, text: '여성용 칸 5개 모두 깨끗했고 휴지도 넉넉합니다. 기저귀 교환대도 있어서 좋아요.', tags: ['청결함', '기저귀교환대'] },
  { name: '최영준', initial: '최', when: '2주 전', rating: 3, paperVote: 'no', passwordVote: 'no', cleanVote: 3, text: '시간대에 따라 차이가 큽니다. 저녁에는 휴지 떨어진 칸이 있었어요.', tags: ['휴지부족'] },
];

// Visit history — places the user has actually been to. Reviews can only be
// written from one of these entries (the tab surfaces them; users can't review
// arbitrary places they haven't visited).
const VISITS = [
  { id: 'v1', scenario: 'gangnam', spotId: 'g1', when: '오늘 14:32', reviewed: false },
  { id: 'v2', scenario: 'gangnam', spotId: 'g3', when: '어제 09:15', reviewed: true,  reviewRating: 4 },
  { id: 'v3', scenario: 'hongdae', spotId: 'h1', when: '3일 전',     reviewed: false },
  { id: 'v4', scenario: 'gangnam', spotId: 'g2', when: '1주 전',     reviewed: true,  reviewRating: 5 },
  { id: 'v5', scenario: 'jongno',  spotId: 'j1', when: '2주 전',     reviewed: false },
];

window.JCH_DATA = { SCENARIOS, REVIEWS, VISITS };
