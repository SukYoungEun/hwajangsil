import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useLocation } from '../hooks/useLocation';
import { useNearbyToilets } from '../hooks/useNearbyToilets';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Toilet } from '../types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

function ToiletRow({ toilet, onPress }: { toilet: Toilet; onPress: () => void }) {
  const typeColor = toilet.type === 'cafe' ? colors.cafe : colors.station;
  const glyph = toilet.type === 'cafe' ? '카' : '역';
  const typeLabel = toilet.type === 'cafe' ? '카페' : '지하철역';

  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={[styles.glyph, { backgroundColor: typeColor }]}>
        <Text style={styles.glyphText}>{glyph}</Text>
      </View>
      <View style={styles.rowBody}>
        <Text style={styles.rowName} numberOfLines={1}>{toilet.name}</Text>
        <Text style={styles.rowSub} numberOfLines={1}>{typeLabel} · {toilet.address}</Text>
      </View>
      {toilet.distance_m != null && (
        <Text style={styles.rowDist}>{toilet.distance_m}m</Text>
      )}
    </TouchableOpacity>
  );
}

export default function AltScreen() {
  const navigation = useNavigation<Nav>();
  const { coords } = useLocation();
  const { toilets, loading } = useNearbyToilets(coords, 1000);

  const cafes = toilets.filter(t => t.type === 'cafe');
  const stations = toilets.filter(t => t.type === 'station');

  const goDetail = (toilet: Toilet) => navigation.navigate('Detail', { toilet });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>대안 찾기</Text>
        <View style={styles.backBtn} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={[]}
          renderItem={null}
          ListHeaderComponent={
            <>
              {/* 빈 상태 안내 */}
              <View style={styles.emptyBox}>
                <Text style={styles.emptyGlyph}>🧻</Text>
                <Text style={styles.emptyTitle}>근처 개방형 화장실이 없어요</Text>
                <Text style={styles.emptySub}>
                  대신 가까운 카페와 지하철역을 추천드려요.{'\n'}카페는 음료 구매가 필요할 수 있습니다.
                </Text>
              </View>

              {/* 카페 섹션 */}
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  근처 카페 <Text style={{ color: colors.cafe }}>{cafes.length}</Text>
                </Text>
                <View style={styles.warnTag}>
                  <Text style={styles.warnTagText}>구매 필요할 수 있음</Text>
                </View>
              </View>
              {cafes.length === 0 ? (
                <Text style={styles.sectionEmpty}>주변 1km 이내 카페 정보가 없어요</Text>
              ) : (
                cafes.map(t => <ToiletRow key={t.id} toilet={t} onPress={() => goDetail(t)} />)
              )}

              {/* 지하철역 섹션 */}
              <View style={[styles.sectionHeader, styles.sectionHeaderBorder]}>
                <Text style={styles.sectionTitle}>
                  근처 지하철역 <Text style={{ color: colors.station }}>{stations.length}</Text>
                </Text>
                <View style={styles.stationTag}>
                  <Text style={styles.stationTagText}>개찰구 통과</Text>
                </View>
              </View>
              {stations.length === 0 ? (
                <Text style={styles.sectionEmpty}>주변 1km 이내 지하철역 정보가 없어요</Text>
              ) : (
                stations.map(t => <ToiletRow key={t.id} toilet={t} onPress={() => goDetail(t)} />)
              )}

              <View style={{ height: 60 }} />
            </>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  backBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 20, color: colors.text },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  emptyBox: {
    padding: 32, alignItems: 'center', gap: 8,
  },
  emptyGlyph: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '800', color: colors.text, textAlign: 'center' },
  emptySub: { fontSize: 13, color: colors.text3, textAlign: 'center', lineHeight: 20 },

  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  sectionHeaderBorder: { borderTopWidth: 8, borderTopColor: colors.bgSoft, marginTop: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  sectionEmpty: { fontSize: 13, color: colors.text3, paddingHorizontal: 16, paddingBottom: 12 },

  warnTag: { backgroundColor: colors.orangeSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  warnTagText: { fontSize: 11, fontWeight: '700', color: colors.orange },
  stationTag: { backgroundColor: colors.primarySoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  stationTagText: { fontSize: 11, fontWeight: '700', color: colors.station },

  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  glyph: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  glyphText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  rowBody: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  rowDist: { fontSize: 14, fontWeight: '700', color: colors.text2 },
});
