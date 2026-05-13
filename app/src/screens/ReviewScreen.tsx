import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
  Alert, Image, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { supabase } from '../lib/supabase';
import { RootStackParamList } from '../navigation/types';
import { Toilet } from '../types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'Review'>;

const TYPE_COLOR: Record<string, string> = {
  open: colors.primary, cafe: colors.cafe, station: colors.station,
};
const GLYPH: Record<string, string> = { open: '화', cafe: '카', station: '역' };

function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View style={styles.starRow}>
      {[1, 2, 3, 4, 5].map(i => (
        <TouchableOpacity key={i} onPress={() => onChange(i)} style={styles.starBtn}>
          <Text style={[styles.star, { color: i <= value ? '#E4BE00' : colors.line2 }]}>★</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function YNInput({
  question, yesLabel, noLabel, value, onChange,
}: {
  question: string; yesLabel: string; noLabel: string;
  value: boolean | null; onChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.ynRow}>
      <Text style={styles.ynQuestion}>{question}</Text>
      <View style={styles.ynBtns}>
        <TouchableOpacity
          style={[styles.ynBtn, value === true && styles.ynBtnOn]}
          onPress={() => onChange(true)}
        >
          <Text style={[styles.ynBtnText, value === true && styles.ynBtnTextOn]}>{yesLabel}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.ynBtn, value === false && styles.ynBtnOn]}
          onPress={() => onChange(false)}
        >
          <Text style={[styles.ynBtnText, value === false && styles.ynBtnTextOn]}>{noLabel}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function ReviewScreen() {
  const navigation = useNavigation<Nav>();
  const { params: { toilet } } = useRoute<Route>();

  const [rating, setRating] = useState(0);
  const [cleanliness, setCleanliness] = useState(0);
  const [hasPaper, setHasPaper] = useState<boolean | null>(null);
  const [hasPassword, setHasPassword] = useState<boolean | null>(null);
  const [body, setBody] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = rating > 0 && hasPaper !== null && hasPassword !== null;
  const typeColor = TYPE_COLOR[toilet.type] ?? colors.primary;

  const pickPhoto = async () => {
    if (photos.length >= 5) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotos(prev => [...prev, result.assets[0].uri]);
    }
  };

  const submit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('로그인 필요', '후기를 작성하려면 로그인이 필요해요.');
        setSubmitting(false);
        return;
      }
      const { error } = await supabase.from('reviews').insert({
        toilet_id: toilet.id,
        user_id: user.id,
        rating,
        cleanliness: cleanliness || rating,
        has_paper: hasPaper,
        has_password: hasPassword,
        body: body.trim() || null,
        photo_urls: [],
      });
      if (error) throw error;
      Alert.alert('등록 완료', '후기가 등록됐어요!', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '잠시 후 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerBack} onPress={() => navigation.goBack()}>
          <Text style={styles.headerBackText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>후기 작성</Text>
        <View style={styles.headerBack} />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          {/* 화장실 정보 카드 */}
          <View style={styles.toiletCard}>
            <View style={[styles.glyph, { backgroundColor: typeColor }]}>
              <Text style={styles.glyphText}>{GLYPH[toilet.type]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.toiletName}>{toilet.name}</Text>
              <Text style={styles.toiletAddr}>{toilet.address}</Text>
            </View>
          </View>

          {/* 전체 평점 */}
          <Text style={styles.qLabel}>전체 평점 <Text style={styles.qRequired}>필수</Text></Text>
          <StarInput value={rating} onChange={setRating} />

          {/* 청결도 */}
          <Text style={styles.qLabel}>청결도 <Text style={styles.qOptional}>1~5</Text></Text>
          <StarInput value={cleanliness} onChange={setCleanliness} />

          {/* Y/N 시설 */}
          <Text style={styles.qLabel}>시설 정보 <Text style={styles.qRequired}>필수</Text></Text>
          <View style={styles.toggleBox}>
            <YNInput
              question="휴지가 있었나요?"
              yesLabel="있음" noLabel="없음"
              value={hasPaper} onChange={setHasPaper}
            />
            <View style={styles.toggleDivider} />
            <YNInput
              question="비밀번호가 필요한가요?"
              yesLabel="필요" noLabel="없음"
              value={hasPassword} onChange={setHasPassword}
            />
          </View>

          {/* 한줄 후기 */}
          <Text style={styles.qLabel}>한줄 후기 <Text style={styles.qOptional}>선택</Text></Text>
          <TextInput
            style={styles.textarea}
            placeholder="다른 사람에게 도움될 정보를 남겨주세요"
            placeholderTextColor={colors.text3}
            multiline
            numberOfLines={4}
            value={body}
            onChangeText={setBody}
            maxLength={300}
          />

          {/* 사진 */}
          <Text style={styles.qLabel}>사진 <Text style={styles.qOptional}>선택 · 최대 5장</Text></Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll} contentContainerStyle={styles.photoList}>
            {photos.map((uri, i) => (
              <View key={i} style={styles.photoThumb}>
                <Image source={{ uri }} style={styles.photoImg} />
                <TouchableOpacity
                  style={styles.photoRemove}
                  onPress={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                >
                  <Text style={styles.photoRemoveText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
            {photos.length < 5 && (
              <TouchableOpacity style={styles.photoAdd} onPress={pickPhoto}>
                <Text style={styles.photoAddIcon}>+</Text>
                <Text style={styles.photoAddText}>추가</Text>
              </TouchableOpacity>
            )}
          </ScrollView>

          <View style={{ height: 100 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* 하단 제출 버튼 */}
      <View style={styles.submitBar}>
        <TouchableOpacity
          style={[styles.submitBtn, (!canSubmit || submitting) && styles.submitBtnDisabled]}
          onPress={submit}
          disabled={!canSubmit || submitting}
        >
          <Text style={styles.submitBtnText}>
            {submitting ? '등록 중...' : canSubmit ? '후기 등록' : '필수 항목을 입력해주세요'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, height: 52, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  headerBack: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  headerBackText: { fontSize: 16, color: colors.text },
  headerTitle: { fontSize: 16, fontWeight: '700', color: colors.text },

  scroll: { flex: 1 },

  toiletCard: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    margin: 16, padding: 14, borderRadius: 12, backgroundColor: colors.bgSoft,
  },
  glyph: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  glyphText: { fontSize: 14, fontWeight: '800', color: '#fff' },
  toiletName: { fontSize: 14, fontWeight: '700', color: colors.text },
  toiletAddr: { fontSize: 12, color: colors.text3, marginTop: 2 },

  qLabel: { fontSize: 14, fontWeight: '700', color: colors.text, marginHorizontal: 16, marginTop: 20, marginBottom: 10 },
  qRequired: { fontSize: 12, fontWeight: '600', color: colors.primary },
  qOptional: { fontSize: 12, fontWeight: '600', color: colors.text3 },

  starRow: { flexDirection: 'row', gap: 8, marginHorizontal: 16 },
  starBtn: { padding: 4 },
  star: { fontSize: 32 },

  toggleBox: { marginHorizontal: 16, borderRadius: 14, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  toggleDivider: { height: 1, backgroundColor: colors.line },
  ynRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 14 },
  ynQuestion: { fontSize: 14, color: colors.text, fontWeight: '500', flex: 1 },
  ynBtns: { flexDirection: 'row', gap: 6 },
  ynBtn: {
    paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8,
    borderWidth: 1, borderColor: colors.line2, backgroundColor: colors.bg,
  },
  ynBtnOn: { backgroundColor: colors.text, borderColor: colors.text },
  ynBtnText: { fontSize: 13, fontWeight: '600', color: colors.text2 },
  ynBtnTextOn: { color: '#fff' },

  textarea: {
    marginHorizontal: 16, padding: 14, borderRadius: 12,
    borderWidth: 1, borderColor: colors.line, fontSize: 14,
    color: colors.text, minHeight: 100, textAlignVertical: 'top',
    lineHeight: 22,
  },

  photoScroll: { flexGrow: 0 },
  photoList: { paddingHorizontal: 16, gap: 8, paddingBottom: 4 },
  photoThumb: { width: 80, height: 80, borderRadius: 10, overflow: 'hidden' },
  photoImg: { width: 80, height: 80 },
  photoRemove: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center',
  },
  photoRemoveText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  photoAdd: {
    width: 80, height: 80, borderRadius: 10, borderWidth: 1.5,
    borderColor: colors.line2, borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', gap: 4,
  },
  photoAddIcon: { fontSize: 22, color: colors.text3 },
  photoAddText: { fontSize: 12, color: colors.text3, fontWeight: '600' },

  submitBar: {
    padding: 16, borderTopWidth: 1, borderTopColor: colors.line,
  },
  submitBtn: {
    height: 52, borderRadius: 14, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: colors.line2 },
  submitBtnText: { fontSize: 16, fontWeight: '800', color: '#fff' },
});
