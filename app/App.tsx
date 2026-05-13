import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import TabNavigator from './src/navigation/TabNavigator';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="dark" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        {/* 추후 추가: Detail, Emergency, Review, Alt */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
