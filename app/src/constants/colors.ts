// 디자인 시스템 컬러 토큰 (DOOA 기반)
export const colors = {
  primary: '#08A7BF',
  primarySoft: '#E2F1F5',
  primaryDark: '#00889C',

  urgent: '#FF3B2A',
  urgentSoft: '#FFEDEA',

  cafe: '#B96530',
  station: '#1A6AAF',

  // Neutral
  bg: '#FFFFFF',
  bgSoft: '#F8F8F8',
  text: '#1C1C1C',
  text2: '#7A7B7D',
  text3: '#969799',
  line: '#E4E5E5',
  line2: '#DBDCDC',

  // Semantic
  green: '#00AF52',
  greenSoft: '#E0F4E2',
  red: '#EE3010',
  redSoft: '#FFE4DC',
  orange: '#B96530',
  orangeSoft: '#FFEDDC',
  yellow: '#E4BE00',
} as const;

export const darkColors = {
  ...colors,
  bg: '#0E1112',
  bgSoft: '#16191B',
  text: '#FFFFFF',
  text2: '#B7B9BB',
  text3: '#8A8C8E',
  line: '#1F2426',
  line2: '#2A2F32',
  primary: '#3CBED7',
  primarySoft: '#082831',
} as const;
