import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🚽 홈 (지도)</Text>
      <Text style={styles.sub}>네이버맵 + 주변 화장실</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  text: { fontSize: 24, fontWeight: '800' },
  sub: { fontSize: 14, color: colors.text3, marginTop: 8 },
});
