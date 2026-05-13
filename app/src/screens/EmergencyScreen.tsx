import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { useLocation } from '../hooks/useLocation';
import { useNearbyToilets } from '../hooks/useNearbyToilets';
import { RootStackParamList } from '../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export default function EmergencyScreen() {
  const navigation = useNavigation<Nav>();
  const { coords } = useLocation();
  const { toilets, loading } = useNearbyToilets(coords, 1000);

  const closest = toilets[0] ?? null;
  const alts = toilets.slice(1, 3);

  const navigate = (toilet: typeof closest) => {
    if (!toilet || !coords) return;
    // 네이버 지도 앱으로 길안내
    const url = `nmap://route/walk?dlat=${toilet.lat}&dlng=${toilet.lng}&dname=${encodeURIComponent(toilet.name)}`;
    const fallback = `https://map.naver.com/v5/directions/-/${toilet.lng},${toilet.lat},${encodeURIComponent(toilet.name)}/-/walk`;
    Linking.openURL(url).catch(() => Linking.openURL(fallback));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 상단 레이블 + 취소 */}
      <View style={styles.top}>
        <View style={styles.label}>
          <View style={styles.dot} />
          <Text style={styles.labelText}>빠른 안내</Text>
        </View>
        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>취소</Text>
        </TouchableOpacity>
      </View>

      {loading || !closest ? (
        <View style={styles.center}>
          <ActivityIndicator color="#FF4D3D" size="large" />
          <Text style={styles.loadingText}>가장 가까운 화장실 찾는 중...</Text>
        </View>
      ) : (
        <>
          <Text style={styles.subtitle}>가장 가까운 화장실</Text>
          <Text style={styles.name}>{closest.name}</Text>

          {/* 거리 패널 */}
          <View style={styles.panel}>
            <View style={styles.bigDistRow}>
              <Text style={styles.bigDist}>{closest.distance_m}</Text>
              <Text style={styles.bigDistUnit}>m</Text>
            </View>
            <View style={styles.metaRow}>
              <Text style={styles.metaText}>도보 약 {Math.ceil((closest.distance_m ?? 0) / 80)}분</Text>
              <Text style={styles.metaDot}>·</Text>
              <Text style={styles.metaText}>{closest.address}</Text>
              {closest.has_password && (
                <View style={styles.metaTag}>
                  <Text style={styles.metaTagText}>비번 필요</Text>
                </View>
              )}
            </View>
          </View>

          {/* 화살표 */}
          <View style={styles.arrowWrap}>
            <Text style={styles.arrow}>↑</Text>
          </View>

          {/* 대안 */}
          {alts.length > 0 && (
            <>
              <Text style={styles.altLabel}>근처 다른 곳</Text>
              {alts.map(alt => (
                <TouchableOpacity
                  key={alt.id}
                  style={styles.altRow}
                  onPress={() => navigate(alt)}
                  activeOpacity={0.8}
                >
                  <View style={styles.altGlyph}>
                    <Text style={styles.altGlyphText}>
                      {alt.type === 'open' ? '화' : alt.type === 'cafe' ? '카' : '역'}
                    </Text>
                  </View>
                  <View style={styles.altInfo}>
                    <Text style={styles.altName}>{alt.name}</Text>
                    <Text style={styles.altSub}>
                      {alt.type === 'open' ? '개방형' : alt.type === 'cafe' ? '카페' : '지하철역'} · 도보 약 {Math.ceil((alt.distance_m ?? 0) / 80)}분
                    </Text>
                  </View>
                  <Text style={styles.altDist}>{alt.distance_m}m</Text>
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* 길안내 버튼 */}
          <TouchableOpacity style={styles.goBtn} onPress={() => navigate(closest)} activeOpacity={0.9}>
            <Text style={styles.goBtnText}>길안내 시작</Text>
            <Text style={styles.goBtnArr}>→</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#14161A',
    paddingHorizontal: 24,
  },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { color: 'rgba(255,255,255,0.6)', fontSize: 14 },

  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 24 },
  label: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,59,42,0.22)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1, borderColor: 'rgba(255,59,42,0.45)' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF4D3D' },
  labelText: { fontSize: 11, fontWeight: '800', letterSpacing: 1.5, color: '#FFB5A8', textTransform: 'uppercase' },
  cancelBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 },
  cancelText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  subtitle: { fontSize: 13, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginBottom: 6 },
  name: { fontSize: 26, fontWeight: '800', color: '#fff', letterSpacing: -0.6, lineHeight: 32 },

  panel: { marginTop: 24, padding: 20, borderRadius: 22, backgroundColor: 'rgba(255,59,42,0.1)', borderWidth: 1, borderColor: 'rgba(255,59,42,0.35)' },
  bigDistRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 4 },
  bigDist: { fontSize: 96, fontWeight: '900', color: '#FF4D3D', letterSpacing: -3, lineHeight: 96 },
  bigDistUnit: { fontSize: 28, fontWeight: '700', color: '#FFB5A8', marginBottom: 8 },
  metaRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  metaText: { fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  metaDot: { color: 'rgba(255,255,255,0.4)', fontSize: 13 },
  metaTag: { backgroundColor: 'rgba(255,59,42,0.2)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  metaTagText: { fontSize: 11, fontWeight: '700', color: '#FFB5A8' },

  arrowWrap: { alignSelf: 'center', width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,59,42,0.22)', borderWidth: 1, borderColor: 'rgba(255,59,42,0.5)', justifyContent: 'center', alignItems: 'center', marginVertical: 20 },
  arrow: { fontSize: 28, color: '#FF6B5A' },

  altLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  altRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', borderRadius: 14, padding: 12, marginBottom: 8 },
  altGlyph: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.22)', justifyContent: 'center', alignItems: 'center' },
  altGlyphText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  altInfo: { flex: 1 },
  altName: { fontSize: 14, fontWeight: '700', color: '#fff' },
  altSub: { fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 },
  altDist: { fontSize: 17, fontWeight: '800', color: '#fff' },

  goBtn: { marginTop: 'auto', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FF4D3D', height: 56, borderRadius: 16, paddingHorizontal: 22, shadowColor: '#FF3B2A', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 24, elevation: 8, marginBottom: 8 },
  goBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  goBtnArr: { fontSize: 22, color: '#fff' },
});
