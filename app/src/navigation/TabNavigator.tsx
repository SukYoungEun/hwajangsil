import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { colors } from '../constants/colors';
import HomeScreen from '../screens/HomeScreen';
import MyScreen from '../screens/MyScreen';
import SearchScreen from '../screens/SearchScreen';

const Tab = createBottomTabNavigator();

const icon = (label: string, focused: boolean) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{label}</Text>
);

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.line,
          height: 78,
          paddingBottom: 24,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.text3,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: '홈',
          tabBarIcon: ({ focused }) => icon('🏠', focused),
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '검색',
          tabBarIcon: ({ focused }) => icon('🔍', focused),
        }}
      />
      <Tab.Screen
        name="My"
        component={MyScreen}
        options={{
          tabBarLabel: '마이',
          tabBarIcon: ({ focused }) => icon('👤', focused),
        }}
      />
    </Tab.Navigator>
  );
}
