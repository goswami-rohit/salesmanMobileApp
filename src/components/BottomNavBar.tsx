// src/components/BottomNavBar.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import HomePage from '../pages/HomePage';
import JourneyTrackerPage from '../pages/JourneyTrackerPage';
import AIChatInterfacePage from '../pages/AIChatInterfacePage';
import ProfilePage from '../pages/ProfilePage';
import type { MainTabsParamList } from '../components/ReusableConstants';

const Tab = createBottomTabNavigator<MainTabsParamList>();

// Simplified Tab Icon Component
interface TabIconProps {
  focused: boolean;
  iconName: string;
  color: string;
  size: number;
}

const TabIcon: React.FC<TabIconProps> = ({ focused, iconName, color, size }) => {
  return (
    <View style={styles.iconContainer}>
      <Icon name={iconName} size={size} color={color} />
    </View>
  );
};

export default function BottomNavBar() {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopWidth: 1,
          borderTopColor: theme.colors.surfaceVariant,
          elevation: 0,
          height: Platform.OS === 'android' ? 75 : 95,
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Journey') {
            iconName = focused ? 'map-marker-path' : 'map-marker-path';
          } else if (route.name === 'AIChat') {
            iconName = focused ? 'robot' : 'robot-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return (
            <TabIcon
              focused={focused}
              iconName={iconName}
              color={color}
              size={size}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'Home Page',
        }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyTrackerPage}
        options={{
          tabBarLabel: 'Journey Page',
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatInterfacePage}
        options={{
          tabBarLabel: 'AI Chat',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarLabel: 'Profile',
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    // Optional: Add specific styling for the icon view if needed
  },
});