import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { RootStackParamList } from './src/navigation/types';
import EmergencyScreen from './src/screens/EmergencyScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen
            name="Emergency"
            component={EmergencyScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
          {/* 추후 추가: Detail, Review, Alt, Visits */}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
