import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

export default function SearchScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>🔍 검색</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg },
  text: { fontSize: 24, fontWeight: '800' },
});
