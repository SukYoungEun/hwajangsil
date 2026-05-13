import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator, FlatList, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { Toilet } from '../types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

const TYPE_COLOR: Record<string, string> = {
  open: colors.primary, cafe: colors.cafe, station: colors.station,
};
const GLYPH: Record<string, string> = { open: '화', cafe: '카', station: '역' };

export default function SearchScreen() {
  const navigation = useNavigation<Nav>();
  const inputRef = useRef<TextInput>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Toilet[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 1) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setLoading(true);
      const { data } = await supabase
        .from('toilets')
        .select('*')
        .or(`name.ilike.%${query}%,address.ilike.%${query}%`)
        .limit(30);
      setResults((data as Toilet[]) ?? []);
      setLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            placeholder="화장실, 카페, 지하철역 검색"
            placeholderTextColor={colors.text3}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Text style={styles.clearText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : query.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>화장실을 검색해보세요</Text>
          <Text style={styles.emptySub}>이름이나 주소로 찾을 수 있어요</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🧻</Text>
          <Text style={styles.emptyTitle}>검색 결과가 없어요</Text>
          <Text style={styles.emptySub}>다른 검색어를 입력해보세요</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={t => t.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.row}
              onPress={() => navigation.navigate('Detail', { toilet: item })}
              activeOpacity={0.7}
            >
              <View style={[styles.glyph, { backgroundColor: TYPE_COLOR[item.type] ?? colors.primary }]}>
                <Text style={styles.glyphText}>{GLYPH[item.type]}</Text>
              </View>
              <View style={styles.rowBody}>
                <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>{item.address}</Text>
              </View>
              {item.rating_avg > 0 && (
                <View style={styles.ratingChip}>
                  <Text style={styles.ratingText}>★ {item.rating_avg.toFixed(1)}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: { padding: 12, borderBottomWidth: 1, borderBottomColor: colors.line },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    height: 44, paddingHorizontal: 14,
    backgroundColor: colors.bgSoft, borderRadius: 14,
    borderWidth: 1, borderColor: colors.line,
  },
  searchIcon: { fontSize: 16 },
  input: { flex: 1, fontSize: 15, color: colors.text },
  clearBtn: { padding: 4 },
  clearText: { fontSize: 13, color: colors.text3 },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 6, paddingBottom: 80 },
  emptyIcon: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  emptySub: { fontSize: 13, color: colors.text3 },

  list: { paddingBottom: 40 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  glyph: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  glyphText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  rowBody: { flex: 1 },
  rowName: { fontSize: 15, fontWeight: '700', color: colors.text },
  rowSub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  ratingChip: {
    backgroundColor: colors.bgSoft, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8,
  },
  ratingText: { fontSize: 12, fontWeight: '700', color: colors.text2 },
  divider: { height: 1, backgroundColor: colors.line, marginLeft: 62 },
});
