import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '../constants/colors';
import { Toilet } from '../types';

const TYPE_LABEL = { open: '개방형', cafe: '카페', station: '지하철역' };
const TYPE_COLOR = { open: colors.primary, cafe: colors.cafe, station: colors.station };
const TYPE_GLYPH = { open: '화', cafe: '카', station: '역' };

interface Props {
  toilet: Toilet;
  urgent?: boolean;
  onPress: () => void;
}

export function ToiletCard({ toilet, urgent, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.card, urgent && styles.cardUrgent]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.row}>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{toilet.name}</Text>
          <Text style={styles.sub} numberOfLines={1}>{toilet.address}</Text>
        </View>
        <View style={styles.distWrap}>
          <Text style={styles.dist}>{toilet.distance_m}</Text>
          <Text style={styles.distUnit}>m</Text>
        </View>
      </View>

      <View style={styles.tags}>
        <Tag label={TYPE_LABEL[toilet.type]} color={TYPE_COLOR[toilet.type]} />
        {toilet.rating_count > 0 && (
          <Tag label={`★ ${toilet.rating_avg.toFixed(1)}`} />
        )}
        <Tag
          label={toilet.has_paper ? '휴지있음' : '휴지없음'}
          color={toilet.has_paper ? colors.green : colors.orange}
        />
        {toilet.has_password && <Tag label="비번필요" color={colors.orange} />}
        {toilet.is_24h && <Tag label="24시간" />}
      </View>
    </TouchableOpacity>
  );
}

function Tag({ label, color }: { label: string; color?: string }) {
  return (
    <View style={[styles.tag, color ? { backgroundColor: color + '18' } : undefined]}>
      <Text style={[styles.tagText, color ? { color } : undefined]}>{label}</Text>
    </View>
  );
}

export function ToiletListRow({ toilet, onPress }: { toilet: Toilet; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.listRow} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.glyph, { backgroundColor: TYPE_COLOR[toilet.type] }]}>
        <Text style={styles.glyphText}>{TYPE_GLYPH[toilet.type]}</Text>
      </View>
      <View style={styles.listBody}>
        <Text style={styles.name} numberOfLines={1}>{toilet.name}</Text>
        <Text style={styles.sub} numberOfLines={1}>{toilet.address}</Text>
        <View style={styles.tags}>
          {toilet.rating_count > 0 && <Tag label={`★ ${toilet.rating_avg.toFixed(1)}`} />}
          {!toilet.has_paper && <Tag label="휴지없음" color={colors.orange} />}
          {toilet.has_password && <Tag label="비번필요" color={colors.orange} />}
          {toilet.is_24h && <Tag label="24h" />}
        </View>
      </View>
      <View style={styles.listDist}>
        <Text style={styles.dist}>{toilet.distance_m}</Text>
        <Text style={styles.distUnit}>m</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 260,
    borderRadius: 16,
    padding: 14,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    marginRight: 10,
  },
  cardUrgent: {
    borderColor: colors.urgent,
    backgroundColor: colors.urgentSoft,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '700', letterSpacing: -0.3, color: colors.text },
  sub: { fontSize: 12, color: colors.text3, marginTop: 2 },
  distWrap: { flexDirection: 'row', alignItems: 'baseline', gap: 1 },
  dist: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  distUnit: { fontSize: 12, fontWeight: '600', color: colors.text3 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  tag: {
    height: 22, paddingHorizontal: 8, borderRadius: 6,
    backgroundColor: colors.bgSoft, justifyContent: 'center',
  },
  tagText: { fontSize: 11, fontWeight: '600', color: colors.text2 },

  // List row
  listRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 16, borderBottomWidth: 1, borderBottomColor: colors.line,
  },
  glyph: {
    width: 44, height: 44, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  glyphText: { fontSize: 13, fontWeight: '800', color: '#fff' },
  listBody: { flex: 1, minWidth: 0 },
  listDist: { alignItems: 'flex-end' },
});
