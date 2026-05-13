import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, StyleSheet, Text,
  TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Visit } from '../types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TYPE_COLOR: Record<string, string> = {
  open: colors.primary, cafe: colors.cafe, station: colors.station,
};
const GLYPH: Record<string, string> = { open: '화', cafe: '카', station: '역' };

const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'unwritten', label: '후기 미작성' },
  { key: 'written', label: '작성 완료' },
];

export default function VisitsScreen() {
  const navigation = useNavigation<Nav>();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unwritten' | 'written'>('all');

  useEffect(() => {
    fetchVisits();
  }, []);

  const fetchVisits = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data } = await supabase
      .from('visits')
      .select('*, toilet:toilets(*)')
      .eq('user_id', user.id)
      .order('visited_at', { ascending: false })
      .limit(50);

    setVisits((data as Visit[]) ?? []);
    setLoading(false);
  };

  const filtered = visits.filter(v =>
    filter === 'all' ? true : filter === 'unwritten' ? !v.reviewed : v.reviewed
  );
  const unwrittenCount = visits.filter(v => !v.reviewed).length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 기록</Text>
        <View style={styles.backBtn} />
      </View>

      {/* 필터 탭 */}
      <View style={styles.filterRow}>
        {FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            style={[styles.filterChip, filter === f.key && styles.filterChipActive]}
            onPress={() => setFilter(f.key as typeof filter)}
          >
            <Text style={[styles.filterText, filter === f.key && styles.filterTextActive]}>
              {f.label}{f.key === 'all' ? ` ${visits.length}` : f.key === 'unwritten' ? ` ${unwrittenCount}` : ` ${visits.length - unwrittenCount}`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🗓️</Text>
          <Text style={styles.emptyTitle}>
            {visits.length === 0 ? '아직 방문 기록이 없어요' : '해당하는 기록이 없어요'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={v => v.id}
          contentContainerStyle={styles.list}
          onRefresh={fetchVisits}
          refreshing={loading}
          renderItem={({ item: visit }) => {
            const toilet = visit.toilet;
            if (!toilet) return null;
            const typeColor = TYPE_COLOR[toilet.type] ?? colors.primary;

            return (
              <View style={styles.visitRow}>
                <TouchableOpacity
                  style={styles.visitMain}
                  onPress={() => navigation.navigate('Detail', { toilet })}
                  activeOpacity={0.7}
                >
                  <View style={[styles.glyph, { backgroundColor: typeColor }]}>
                    <Text style={styles.glyphText}>{GLYPH[toilet.type]}</Text>
                  </View>
                  <View style={styles.visitBody}>
                    <Text style={styles.visitName} numberOfLines={1}>{toilet.name}</Text>
                    <Text style={styles.visitMeta}>
                      {new Date(visit.visited_at).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })}
                    </Text>
                    <View style={styles.tagRow}>
                      {visit.reviewed ? (
                        <View style={styles.tagGreen}>
                          <Text style={styles.tagGreenText}>✓ 후기 작성됨</Text>
                        </View>
                      ) : (
                        <View style={styles.tagWarn}>
                          <Text style={styles.tagWarnText}>후기 미작성</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>

                {!visit.reviewed && (
                  <TouchableOpacity
                    style={styles.writeBtn}
                    onPress={() => navigation.navigate('Review', { toilet })}
                  >
                    <Text style={styles.writeBtnText}>후기 쓰기</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          }}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
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

  filterRow: { flexDirection: 'row', gap: 6, padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  filterChip: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.bg,
  },
  filterChipActive: { backgroundColor: colors.text, borderColor: colors.text },
  filterText: { fontSize: 13, fontWeight: '600', color: colors.text2 },
  filterTextActive: { color: '#fff' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  emptyIcon: { fontSize: 40 },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: colors.text2 },

  list: { paddingBottom: 40 },
  visitRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  visitMain: { flex: 1, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  glyph: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  glyphText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  visitBody: { flex: 1 },
  visitName: { fontSize: 15, fontWeight: '700', color: colors.text },
  visitMeta: { fontSize: 12, color: colors.text3, marginTop: 2 },
  tagRow: { flexDirection: 'row', gap: 6, marginTop: 8 },
  tagGreen: { backgroundColor: colors.greenSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagGreenText: { fontSize: 11, fontWeight: '700', color: colors.green },
  tagWarn: { backgroundColor: colors.orangeSoft, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagWarnText: { fontSize: 11, fontWeight: '700', color: colors.orange },

  writeBtn: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10,
    backgroundColor: colors.text, marginLeft: 8,
  },
  writeBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  divider: { height: 1, backgroundColor: colors.line, marginLeft: 64 },
});
