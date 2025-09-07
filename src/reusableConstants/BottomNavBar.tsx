import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import HomePage from '../pages/HomePage';
import JourneyPage from '../pages/JourneyTrackerPage';
import AIChatPage from '../pages/AIChatInterface';
import ProfilePage from '../pages/ProfilePage';

const Tab = createBottomTabNavigator();

export default function BottomNavBar() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#1e293b',
          borderTopColor: '#334155',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 65 : 90,
          paddingTop: Platform.OS === 'android' ? 5 : 10,
          paddingBottom: Platform.OS === 'android' ? 5 : 30,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="home-variant" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyPage}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="map-marker-path" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="AI Chat"
        component={AIChatPage}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="robot-happy" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="account-circle" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}
