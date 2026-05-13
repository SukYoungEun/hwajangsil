import { CompositeNavigationProp, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { UserProfile } from '../types';

type Nav = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList>,
  NativeStackNavigationProp<RootStackParamList>
>;

function MenuRow({ label, meta, onPress }: { label: string; meta?: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={onPress ? 0.6 : 1} disabled={!onPress}>
      <Text style={styles.menuLabel}>{label}</Text>
      <View style={styles.menuRight}>
        {meta && <Text style={styles.menuMeta}>{meta}</Text>}
        <Text style={styles.menuArrow}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function MyScreen() {
  const navigation = useNavigation<Nav>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [visitCount, setVisitCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [unwrittenCount, setUnwrittenCount] = useState(0);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: prof }, { data: visits }] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      supabase.from('visits').select('reviewed').eq('user_id', user.id),
    ]);

    if (prof) setProfile(prof as UserProfile);
    if (visits) {
      setVisitCount(visits.length);
      setReviewCount(visits.filter(v => v.reviewed).length);
      setUnwrittenCount(visits.filter(v => !v.reviewed).length);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>마이</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* 프로필 */}
        {profile ? (
          <View style={styles.profileRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.nickname?.[0] ?? '나'}</Text>
            </View>
            <View>
              <Text style={styles.nickname}>{profile.nickname}</Text>
              <Text style={styles.profileSub}>방문 {visitCount}곳 · 후기 {reviewCount}개</Text>
            </View>
          </View>
        ) : (
          /* 비로그인 상태 */
          <View style={styles.loginBanner}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>?</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.loginTitle}>로그인하면 더 많은 기능을 쓸 수 있어요</Text>
              <Text style={styles.loginSub}>후기 작성, 방문 기록, 북마크</Text>
            </View>
          </View>
        )}

        {/* 미작성 후기 알림 */}
        {unwrittenCount > 0 && (
          <View style={styles.padH}>
            <TouchableOpacity style={styles.promptCard} onPress={() => navigation.navigate('Visits')}>
              <View style={styles.promptBadge}>
                <Text style={styles.promptBadgeText}>{unwrittenCount}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.promptTitle}>후기를 안 쓰신 곳이 {unwrittenCount}곳 있어요</Text>
                <Text style={styles.promptSub}>다녀온 곳에서만 작성 가능합니다</Text>
              </View>
              <Text style={styles.promptArrow}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 통계 카드 */}
        <View style={styles.statGrid}>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Visits')}>
            <Text style={styles.statNum}>{visitCount}</Text>
            <Text style={styles.statLabel}>방문기록</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statCard} onPress={() => navigation.navigate('Visits')}>
            <Text style={styles.statNum}>{reviewCount}</Text>
            <Text style={styles.statLabel}>내 후기</Text>
          </TouchableOpacity>
          <View style={styles.statCard}>
            <Text style={styles.statNum}>0</Text>
            <Text style={styles.statLabel}>북마크</Text>
          </View>
        </View>

        {/* 활동 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>활동</Text>
          <View style={styles.menuBox}>
            <MenuRow
              label="내 방문기록 · 후기"
              meta={`${visitCount}곳`}
              onPress={() => navigation.navigate('Visits')}
            />
            <View style={styles.menuDivider} />
            <MenuRow label="북마크" meta="0곳" />
            <View style={styles.menuDivider} />
            <MenuRow label="내가 등록한 화장실" meta="0곳" />
          </View>
        </View>

        {/* 설정 메뉴 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>설정</Text>
          <View style={styles.menuBox}>
            {['알림 설정', '긴급모드 단축버튼', '필터 기본값'].map((label, i, arr) => (
              <View key={label}>
                <MenuRow label={label} onPress={() => Alert.alert('준비 중', '곧 추가될 기능이에요.')} />
                {i < arr.length - 1 && <View style={styles.menuDivider} />}
              </View>
            ))}
          </View>
        </View>

        {/* 기타 */}
        <View style={styles.section}>
          <View style={styles.menuBox}>
            <MenuRow label="개인정보 처리방침" onPress={() => {}} />
            <View style={styles.menuDivider} />
            <MenuRow label="앱 버전" meta="1.0.0" />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16, height: 52,
    justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  scroll: { paddingBottom: 20 },

  profileRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, paddingBottom: 20,
  },
  loginBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 16, paddingBottom: 20,
  },
  avatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '800', color: '#fff' },
  nickname: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  profileSub: { fontSize: 12, color: colors.text3, marginTop: 3 },
  loginTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  loginSub: { fontSize: 12, color: colors.text3, marginTop: 2 },

  padH: { paddingHorizontal: 16, marginBottom: 8 },
  promptCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, borderRadius: 14,
    backgroundColor: colors.primarySoft,
    borderWidth: 1, borderColor: colors.primary + '28',
  },
  promptBadge: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
  },
  promptBadgeText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  promptTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  promptSub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  promptArrow: { fontSize: 20, color: colors.primary },

  statGrid: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, marginBottom: 8 },
  statCard: {
    flex: 1, padding: 16, borderRadius: 14,
    backgroundColor: colors.bgSoft, alignItems: 'center', gap: 4,
  },
  statNum: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  statLabel: { fontSize: 12, color: colors.text3 },

  section: { paddingHorizontal: 16, marginTop: 20 },
  sectionLabel: {
    fontSize: 12, fontWeight: '700', letterSpacing: 0.6,
    textTransform: 'uppercase', color: colors.text3, marginBottom: 8,
  },
  menuBox: { borderRadius: 14, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  menuRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14, backgroundColor: colors.bg,
  },
  menuLabel: { fontSize: 14, fontWeight: '500', color: colors.text },
  menuRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  menuMeta: { fontSize: 13, color: colors.text3 },
  menuArrow: { fontSize: 20, color: colors.text3 },
  menuDivider: { height: 1, backgroundColor: colors.line, marginLeft: 16 },
});
