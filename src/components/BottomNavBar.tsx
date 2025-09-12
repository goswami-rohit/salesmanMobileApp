// src/components/BottomNavBar.tsx
import React, { useEffect, useRef } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Platform, View, Animated, Easing, TouchableOpacity, Vibration, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

import HomePage from '../pages/HomePage';
import JourneyTrackerPage from '../pages/JourneyTrackerPage';
import AIChatInterfacePage from '../pages/AIChatInterfacePage';
import ProfilePage from '../pages/ProfilePage';
import type { MainTabsParamList } from '../components/ReusableConstants';

const Tab = createBottomTabNavigator<MainTabsParamList>();
const { width: screenWidth } = Dimensions.get('window');

// Enhanced Animated Tab Icon Component
interface AnimatedTabIconProps {
  focused: boolean;
  iconName: string;
  color: string;
  size: number;
  routeName: string;
}

const AnimatedTabIcon: React.FC<AnimatedTabIconProps> = ({ 
  focused, 
  iconName, 
  color, 
  size, 
  routeName 
}) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (focused) {
      // Enhanced focus animation with multiple effects
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.2,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Special rotation for certain icons
        routeName === 'AIChat' ? 
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 800,
            easing: Easing.elastic(1.2),
            useNativeDriver: true,
          }) : 
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
      ]).start();

      // Continuous pulse for focused state
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Return to normal state
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [focused]);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(50);
    }

    // Tap animation
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: focused ? 1.2 : 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const getSpecialColor = () => {
    if (!focused) return color;
    
    switch (routeName) {
      case 'Home': return '#10b981';
      case 'Journey': return '#06b6d4';
      case 'AIChat': return '#8b5cf6';
      case 'Profile': return '#f59e0b';
      default: return color;
    }
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Animated.View
        style={{
          padding: 12,
          borderRadius: 16,
          alignItems: 'center',
          justifyContent: 'center',
          transform: [
            { scale: scaleAnim },
            { scale: focused ? pulseAnim : 1 },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
        }}
      >
        {/* Glow Background */}
        <Animated.View
          style={{
            ...Platform.select({
              ios: {
                shadowColor: getSpecialColor(),
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.8],
                }),
                shadowRadius: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 15],
                }),
              },
              android: {
                elevation: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 12],
                }),
              },
            }),
          }}
        >
          {/* Background Gradient for Focused State */}
          {focused && (
            <Animated.View
              style={{
                position: 'absolute',
                top: -4,
                left: -4,
                right: -4,
                bottom: -4,
                borderRadius: 20,
                opacity: glowAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 0.3],
                }),
              }}
            >
              <LinearGradient
                colors={[
                  `${getSpecialColor()}40`,
                  `${getSpecialColor()}20`,
                  'transparent'
                ]}
                style={{
                  flex: 1,
                  borderRadius: 20,
                }}
              />
            </Animated.View>
          )}

          {/* Icon */}
          <MaterialCommunityIcons 
            name={iconName} 
            size={size} 
            color={getSpecialColor()} 
          />

          {/* Focus Indicator */}
          {focused && (
            <Animated.View
              style={{
                position: 'absolute',
                bottom: -8,
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: getSpecialColor(),
                opacity: glowAnim,
                transform: [{ scale: pulseAnim }],
              }}
            />
          )}
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
};

// Enhanced Tab Background Component
const AnimatedTabBackground: React.FC = () => {
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Continuous ambient glow
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 4000,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanning line effect
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 6000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      {/* Main Background */}
      <BlurView intensity={25} tint="dark" style={{ flex: 1 }}>
        <Animated.View style={{ flex: 1, opacity: glowAnim }}>
          <LinearGradient
            colors={[
              'rgba(15, 23, 42, 0.98)',
              'rgba(30, 41, 59, 0.95)',
              'rgba(51, 65, 85, 0.9)'
            ]}
            style={{ flex: 1 }}
          />
        </Animated.View>

        {/* Scanning Line Effect - FIXED! */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: -100,
            width: 2,
            height: '100%',
            backgroundColor: '#06b6d4',
            opacity: scanLineAnim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.8, 0],
            }),
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 10,
            transform: [{
              translateX: scanLineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, screenWidth + 200],
              }),
            }],
          }}
        />

        {/* Top Border Glow */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            backgroundColor: '#06b6d4',
            opacity: glowAnim.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0.3, 0.8],
            }),
            shadowColor: '#06b6d4',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 1,
            shadowRadius: 8,
          }}
        />
      </BlurView>
    </View>
  );
};

export default function BottomNavBar() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#06b6d4',
        tabBarInactiveTintColor: '#64748b',
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'android' ? 75 : 95,
          paddingBottom: Platform.OS === 'android' ? 10 : 30,
          paddingTop: 5,
        },
        tabBarBackground: () => <AnimatedTabBackground />,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginTop: 2,
          letterSpacing: 0.5,
        },
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home-variant' : 'home-variant-outline';
          } else if (route.name === 'Journey') {
            iconName = focused ? 'map-marker-path' : 'map-marker-outline';
          } else if (route.name === 'AIChat') {
            iconName = focused ? 'robot' : 'robot-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'account-circle' : 'account-circle-outline';
          }

          return (
            <AnimatedTabIcon
              focused={focused}
              iconName={iconName}
              color={color}
              size={size}
              routeName={route.name}
            />
          );
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomePage}
        options={{
          tabBarLabel: 'CONTROL',
        }}
      />
      <Tab.Screen
        name="Journey"
        component={JourneyTrackerPage}
        options={{
          tabBarLabel: 'MISSION',
        }}
      />
      <Tab.Screen
        name="AIChat"
        component={AIChatInterfacePage}
        options={{
          tabBarLabel: 'AI LINK',
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfilePage}
        options={{
          tabBarLabel: 'AGENT',
        }}
      />
    </Tab.Navigator>
  );
}