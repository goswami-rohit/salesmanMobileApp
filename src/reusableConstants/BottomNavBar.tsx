import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomePage from '../pages/HomePage';
import JourneyPage from '../pages/JourneyTrackerPage';
import AIChatPage from '../pages/AIChatInterface';
import ProfilePage from '../pages/ProfilePage';

const Tab = createBottomTabNavigator();

export default function BottomNavBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#1d4ed8', // blue-700
        tabBarInactiveTintColor: '#9CA3AF', // gray-400-ish
        tabBarStyle: {
          backgroundColor: '#0f172a', // dark background for the bar
          borderTopWidth: 0,
          height: Platform.OS === 'android' ? 90 : 64,
          paddingBottom: Platform.OS === 'android' ? 20 : 8,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName = 'help-circle-outline';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Journey') iconName = 'map-marker-path';
          else if (route.name === 'AIChat') iconName = 'robot';
          else if (route.name === 'Profile') iconName = 'account-circle';

          // MaterialCommunityIcons sizes look good around 22-26
          return <MaterialCommunityIcons name={iconName as any} size={size ?? 24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomePage} />
      <Tab.Screen name="Journey" component={JourneyPage} />
      <Tab.Screen name="AIChat" component={AIChatPage} options={{ title: 'AI Chat' }} />
      <Tab.Screen name="Profile" component={ProfilePage} />
    </Tab.Navigator>
  );
}
