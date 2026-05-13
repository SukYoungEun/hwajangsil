import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ToiletCard } from '../components/ToiletCard';
import { colors } from '../constants/colors';
import { useLocation } from '../hooks/useLocation';
import { useNearbyToilets } from '../hooks/useNearbyToilets';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Toilet } from '../types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const FILTERS = [
  { key: 'all',     label: '전체' },
  { key: 'open',    label: '개방형' },
  { key: 'cafe',    label: '카페' },
  { key: 'station', label: '지하철' },
  { key: 'h24',     label: '24시간' },
  { key: 'access',  label: '장애인용' },
];

export default function HomeScreen() {
  const navigation = useNavigation<Nav>();
  const { coords, loading: locLoading, error: locError } = useLocation();
  const [activeFilter, setActiveFilter] = React.useState('all');

  const filter = {
    type: ['open','cafe','station'].includes(activeFilter) ? activeFilter as any : undefined,
    h24: activeFilter === 'h24',
    accessible: activeFilter === 'access',
  };

  const { toilets, loading, error, refetch } = useNearbyToilets(coords, 500, filter);
  const closest = toilets[0] ?? null;

  const openDetail = (toilet: Toilet) => navigation.navigate('Detail', { toilet });
  const openEmergency = () => navigation.navigate('Emergency');

  if (locLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>위치 확인 중...</Text>
      </View>
    );
  }

  if (locError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{locError}</Text>
        <Text style={styles.errorSub}>설정 → 앱 → 위치 권한을 허용해주세요</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 검색바 */}
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => navigation.navigate('Search')}
        activeOpacity={0.8}
      >
        <Text style={styles.searchIcon}>🔍</Text>
        <Text style={styles.searchPlaceholder}>화장실, 카페, 지하철역 검색</Text>
      </TouchableOpacity>

      {/* 필터 칩 */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterContent}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, activeFilter === f.key && styles.chipActive]}
            onPress={() => setActiveFilter(f.key)}
          >
            <Text style={[styles.chipText, activeFilter === f.key && styles.chipTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* 긴급 FAB */}
      {closest && (
        <TouchableOpacity style={styles.fab} onPress={openEmergency} activeOpacity={0.9}>
          <Text style={styles.fabIcon}>🚨</Text>
          <Text style={styles.fabText}>지금 당장!</Text>
          <View style={styles.fabDivider} />
          <Text style={styles.fabDist}>{closest.distance_m}m</Text>
        </TouchableOpacity>
      )}

      {/* 하단 시트 - 카드 리스트 */}
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHead}>
          <Text style={styles.sheetTitle}>내 주변 · 가까운 순</Text>
          <Text style={styles.sheetMeta}>{toilets.length}곳</Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>데이터를 불러올 수 없어요</Text>
            <TouchableOpacity onPress={refetch} style={styles.retryBtn}>
              <Text style={styles.retryText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : toilets.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>🧻</Text>
            <Text style={styles.errorText}>주변 500m에 화장실이 없어요</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Alt')} style={styles.retryBtn}>
              <Text style={styles.retryText}>대안 찾기</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={toilets}
            keyExtractor={t => t.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardList}
            snapToInterval={270}
            decelerationRate="fast"
            renderItem={({ item, index }) => (
              <ToiletCard
                toilet={item}
                urgent={index === 0}
                onPress={() => openDetail(item)}
              />
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// React import 추가
import React from 'react';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bgSoft },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 24 },

  // 검색바
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, height: 44, paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 14, borderWidth: 1, borderColor: colors.line,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12, shadowRadius: 14, elevation: 4,
  },
  searchIcon: { fontSize: 16 },
  searchPlaceholder: { flex: 1, fontSize: 14, color: colors.text3 },

  // 필터
  filterScroll: { flexGrow: 0 },
  filterContent: { paddingHorizontal: 12, gap: 6, paddingBottom: 12 },
  chip: {
    height: 32, paddingHorizontal: 12, borderRadius: 999,
    borderWidth: 1, borderColor: colors.line2,
    backgroundColor: colors.bg, justifyContent: 'center',
  },
  chipActive: { backgroundColor: colors.text, borderColor: colors.text },
  chipText: { fontSize: 13, fontWeight: '500', color: colors.text2 },
  chipTextActive: { color: colors.bg },

  // FAB
  fab: {
    position: 'absolute', right: 14, bottom: 280,
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 44, paddingHorizontal: 14,
    backgroundColor: colors.urgent, borderRadius: 999,
    shadowColor: colors.urgent, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45, shadowRadius: 18, elevation: 8,
    zIndex: 15,
  },
  fabIcon: { fontSize: 16 },
  fabText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  fabDivider: { width: 1, height: 16, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  fabDist: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },

  // 시트
  sheet: {
    position: 'absolute', left: 0, right: 0, bottom: 0,
    backgroundColor: colors.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.08, shadowRadius: 24, elevation: 10,
    paddingBottom: 78, maxHeight: '60%',
  },
  handle: {
    width: 36, height: 4, borderRadius: 99,
    backgroundColor: colors.line2, alignSelf: 'center', marginTop: 8,
  },
  sheetHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  sheetMeta: { fontSize: 12, color: colors.text3 },
  cardList: { paddingHorizontal: 16, paddingBottom: 16 },

  // 상태
  loadingText: { fontSize: 14, color: colors.text3, marginTop: 8 },
  errorText: { fontSize: 15, fontWeight: '700', color: colors.text, textAlign: 'center' },
  errorSub: { fontSize: 13, color: colors.text3, textAlign: 'center' },
  emptyText: { fontSize: 40 },
  retryBtn: {
    marginTop: 8, paddingHorizontal: 20, paddingVertical: 10,
    backgroundColor: colors.primary, borderRadius: 12,
  },
  retryText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
