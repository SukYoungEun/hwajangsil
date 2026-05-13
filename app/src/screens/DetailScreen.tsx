import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useRef, useState } from 'react';
import {
  Dimensions, Linking, NativeScrollEvent, NativeSyntheticEvent,
  ScrollView, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useToiletReviews } from '../hooks/useToiletReviews';
import { RootStackParamList } from '../navigation/types';
import { Toilet } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Detail'>;

const { width: SW } = Dimensions.get('window');

const TYPE_LABEL: Record<string, string> = {
  open: '개방형 화장실',
  cafe: '카페',
  station: '지하철역',
};
const TYPE_COLOR: Record<string, string> = {
  open: colors.primary,
  cafe: colors.cafe,
  station: colors.station,
};
const GLYPH: Record<string, string> = { open: '화', cafe: '카', station: '역' };

function StarRow({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Text key={i} style={{ fontSize: size, color: i <= Math.round(rating) ? '#E4BE00' : colors.line2 }}>★</Text>
      ))}
    </View>
  );
}

function FeatureChip({ glyph, label, on }: { glyph: string; label: string; on: boolean }) {
  return (
    <View style={[styles.feature, !on && styles.featureOff]}>
      <Text style={styles.featureGlyph}>{glyph}</Text>
      <Text style={[styles.featureLabel, !on && styles.featureLabelOff]}>{label}{on ? '' : ' 없음'}</Text>
    </View>
  );
}

function navigate(toilet: Toilet) {
  const url = `kakaomap://route?ep=${toilet.lat},${toilet.lng}&by=FOOT`;
  const fallback = `https://map.kakao.com/link/to/${encodeURIComponent(toilet.name)},${toilet.lat},${toilet.lng}`;
  Linking.openURL(url).catch(() => Linking.openURL(fallback));
}

function openMap(toilet: Toilet) {
  const url = `https://map.kakao.com/link/map/${encodeURIComponent(toilet.name)},${toilet.lat},${toilet.lng}`;
  Linking.openURL(url);
}

export default function DetailScreen() {
  const navigation = useNavigation<Nav>();
  const { params: { toilet } } = useRoute<Route>();
  const { reviews, loading: reviewLoading } = useToiletReviews(toilet.id);
  const [slide, setSlide] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  const typeColor = TYPE_COLOR[toilet.type] ?? colors.primary;
  const walkMin = toilet.distance_m ? Math.ceil(toilet.distance_m / 80) : null;

  const onHeroScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.x / SW);
    setSlide(idx);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 플로팅 헤더 */}
      <View style={styles.floatingHeader}>
        <TouchableOpacity style={styles.headerBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>🔖</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Text style={styles.headerBtnText}>↗</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 히어로 슬라이드 */}
        <ScrollView
          horizontal pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={onHeroScroll}
          scrollEventThrottle={16}
          style={styles.hero}
        >
          {['입구', '내부', '세면대'].map((label, i) => (
            <View key={i} style={[styles.heroSlide, { backgroundColor: typeColor + (i === 0 ? 'FF' : i === 1 ? 'BB' : '88') }]}>
              <Text style={styles.heroPlaceholder}>사진 {i + 1} · {label}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.heroDots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.heroDot, slide === i && styles.heroDotActive]} />
          ))}
        </View>

        {/* 헤드 */}
        <View style={styles.head}>
          <View style={styles.eyebrow}>
            <View style={[styles.typeTag, { backgroundColor: typeColor + '22' }]}>
              <Text style={[styles.typeTagText, { color: typeColor }]}>{TYPE_LABEL[toilet.type]}</Text>
            </View>
            {toilet.address ? <Text style={styles.eyebrowSub}>{toilet.address.split(' ').slice(0, 2).join(' ')}</Text> : null}
          </View>
          <Text style={styles.name}>{toilet.name}</Text>
          <View style={styles.statusRow}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>이용가능</Text>
            {toilet.hours && <Text style={styles.statusHours}>· {toilet.hours}</Text>}
            {walkMin && (
              <Text style={styles.walkTime}>도보 약 {walkMin}분 · {toilet.distance_m}m</Text>
            )}
          </View>
        </View>

        {/* 평점 스트립 */}
        <View style={styles.ratingsRow}>
          <View style={styles.ratingCell}>
            <Text style={styles.ratingLabel}>전체</Text>
            <Text style={styles.ratingBig}>{toilet.rating_avg.toFixed(1)}</Text>
            <StarRow rating={toilet.rating_avg} />
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingCell}>
            <Text style={styles.ratingLabel}>청결</Text>
            <Text style={[styles.ratingBig, {
              color: toilet.cleanliness_avg >= 4.5 ? colors.green
                : toilet.cleanliness_avg >= 3.5 ? colors.text
                : colors.orange,
            }]}>{toilet.cleanliness_avg.toFixed(1)}</Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingCell}>
            <Text style={styles.ratingLabel}>휴지</Text>
            <Text style={[styles.ratingBig, { color: toilet.has_paper ? colors.green : colors.red }]}>
              {toilet.has_paper ? '✓' : '✗'}
            </Text>
          </View>
          <View style={styles.ratingDivider} />
          <View style={styles.ratingCell}>
            <Text style={styles.ratingLabel}>비번</Text>
            <Text style={[styles.ratingBig, { color: toilet.has_password ? colors.orange : colors.green, fontSize: 14 }]}>
              {toilet.has_password ? '필요' : '없음'}
            </Text>
          </View>
        </View>

        {/* 액션 버튼 */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btnSecondary} onPress={() => openMap(toilet)}>
            <Text style={styles.btnSecondaryText}>📍 지도</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btnPrimary, { backgroundColor: typeColor }]} onPress={() => navigate(toilet)}>
            <Text style={styles.btnPrimaryText}>길찾기 →</Text>
          </TouchableOpacity>
        </View>

        {/* 시설 그리드 */}
        <View style={styles.features}>
          <FeatureChip glyph="♿" label="장애인용" on={toilet.is_accessible} />
          <FeatureChip glyph="👶" label="기저귀" on={toilet.has_diaper} />
          <FeatureChip glyph="24" label="24시간" on={toilet.is_24h} />
          <FeatureChip glyph="🔒" label="비밀번호" on={toilet.has_password} />
        </View>

        {/* 후기 섹션 */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              후기 <Text style={styles.sectionCount}>{toilet.rating_count}</Text>
            </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Review', { toilet })}>
              <Text style={styles.sectionLink}>작성하기 →</Text>
            </TouchableOpacity>
          </View>

          {reviewLoading ? (
            <Text style={styles.reviewEmpty}>불러오는 중...</Text>
          ) : reviews.length === 0 ? (
            <View style={styles.reviewEmptyBox}>
              <Text style={styles.reviewEmptyText}>아직 후기가 없어요.</Text>
              <Text style={styles.reviewEmptySub}>첫 번째 후기를 남겨보세요!</Text>
            </View>
          ) : (
            reviews.slice(0, 3).map((r, i) => (
              <View key={r.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View style={[styles.avatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                    <Text style={styles.avatarText}>
                      {r.user?.nickname?.[0] ?? '?'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.reviewName}>{r.user?.nickname ?? '익명'}</Text>
                    <Text style={styles.reviewDate}>{new Date(r.created_at).toLocaleDateString('ko-KR')}</Text>
                  </View>
                  <View style={styles.reviewRating}>
                    <Text style={styles.reviewRatingStar}>★</Text>
                    <Text style={styles.reviewRatingNum}>{r.rating}.0</Text>
                  </View>
                </View>
                {r.body ? <Text style={styles.reviewBody}>{r.body}</Text> : null}
              </View>
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR_COLORS = ['#08A7BF', '#B96530', '#1A6AAF', '#00AF52', '#E4BE00'];

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  scroll: { flex: 1 },

  floatingHeader: {
    position: 'absolute', top: 56, left: 0, right: 0,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 12, zIndex: 10,
  },
  headerRight: { flexDirection: 'row', gap: 8 },
  headerBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.92)',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 6, elevation: 3,
  },
  headerBtnText: { fontSize: 16 },

  // 히어로
  hero: { height: 240 },
  heroSlide: {
    width: SW, height: 240,
    justifyContent: 'flex-end', padding: 16,
  },
  heroPlaceholder: { color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '600' },
  heroDots: {
    flexDirection: 'row', justifyContent: 'center', gap: 6,
    paddingVertical: 8,
  },
  heroDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.line2 },
  heroDotActive: { backgroundColor: colors.text, width: 16 },

  // 헤드
  head: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  typeTag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  typeTagText: { fontSize: 12, fontWeight: '700' },
  eyebrowSub: { fontSize: 13, color: colors.text3 },
  name: { fontSize: 24, fontWeight: '800', color: colors.text, letterSpacing: -0.5, lineHeight: 30, marginBottom: 8 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  statusDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.green },
  statusText: { fontSize: 13, fontWeight: '700', color: colors.green },
  statusHours: { fontSize: 13, color: colors.text3 },
  walkTime: { marginLeft: 'auto', fontSize: 13, fontWeight: '600', color: colors.text2 },

  // 평점
  ratingsRow: {
    flexDirection: 'row', marginHorizontal: 16, marginBottom: 16,
    backgroundColor: colors.bgSoft, borderRadius: 16,
    padding: 16, gap: 4,
  },
  ratingCell: { flex: 1, alignItems: 'center', gap: 4 },
  ratingDivider: { width: 1, backgroundColor: colors.line2, marginVertical: 4 },
  ratingLabel: { fontSize: 11, color: colors.text3, fontWeight: '600' },
  ratingBig: { fontSize: 20, fontWeight: '800', color: colors.text },

  // 액션
  actions: { flexDirection: 'row', gap: 8, marginHorizontal: 16, marginBottom: 16 },
  btnSecondary: {
    flex: 1, height: 46, borderRadius: 12, borderWidth: 1.5,
    borderColor: colors.line2, justifyContent: 'center', alignItems: 'center',
  },
  btnSecondaryText: { fontSize: 14, fontWeight: '700', color: colors.text },
  btnPrimary: { flex: 2, height: 46, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  btnPrimaryText: { fontSize: 14, fontWeight: '800', color: '#fff' },

  // 시설
  features: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginHorizontal: 16, marginBottom: 24 },
  feature: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.primarySoft,
  },
  featureOff: { backgroundColor: colors.bgSoft },
  featureGlyph: { fontSize: 14 },
  featureLabel: { fontSize: 13, fontWeight: '600', color: colors.primary },
  featureLabelOff: { color: colors.text3 },

  // 섹션
  section: { paddingHorizontal: 16, marginBottom: 24 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sectionCount: { color: colors.text3, fontWeight: '600' },
  sectionLink: { fontSize: 13, fontWeight: '600', color: colors.primary },

  // 후기
  reviewEmptyBox: { padding: 24, borderRadius: 14, backgroundColor: colors.bgSoft, alignItems: 'center', gap: 4 },
  reviewEmptyText: { fontSize: 14, fontWeight: '700', color: colors.text2 },
  reviewEmptySub: { fontSize: 13, color: colors.text3 },
  reviewEmpty: { fontSize: 13, color: colors.text3 },
  reviewCard: {
    marginBottom: 12, padding: 14, borderRadius: 14,
    backgroundColor: colors.bgSoft,
  },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  reviewName: { fontSize: 13, fontWeight: '700', color: colors.text },
  reviewDate: { fontSize: 11, color: colors.text3, marginTop: 1 },
  reviewRating: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewRatingStar: { color: '#E4BE00', fontSize: 13 },
  reviewRatingNum: { fontSize: 13, fontWeight: '700', color: colors.text },
  reviewBody: { fontSize: 14, color: colors.text2, lineHeight: 20 },
});
