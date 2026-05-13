import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import TabNavigator from './src/navigation/TabNavigator';
import { RootStackParamList } from './src/navigation/types';
import AltScreen from './src/screens/AltScreen';
import DetailScreen from './src/screens/DetailScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import ReviewScreen from './src/screens/ReviewScreen';
import VisitsScreen from './src/screens/VisitsScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Tabs" component={TabNavigator} />
          <Stack.Screen name="Detail" component={DetailScreen} />
          <Stack.Screen name="Review" component={ReviewScreen} />
          <Stack.Screen name="Alt" component={AltScreen} />
          <Stack.Screen name="Visits" component={VisitsScreen} />
          <Stack.Screen
            name="Emergency"
            component={EmergencyScreen}
            options={{ presentation: 'fullScreenModal' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
