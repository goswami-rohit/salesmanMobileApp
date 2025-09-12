// src/components/SideDrawer.tsx
import React, { useEffect, useRef } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Platform, Animated, Easing, View, StyleSheet, Dimensions } from "react-native";
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import BottomNavBar from "./BottomNavBar";
import SideNavBar from "./SideNavBar";

// Import actual form screens
import AddPJPForm from "../pages/forms/AddPJPForm";
import AddDealerForm from "../pages/forms/AddDealerForm";
import AddSiteForm from "../pages/forms/AddSiteForm";
import DailyTasksForm from "../pages/forms/DailyTasksForm";
import AttendanceForm from "../pages/forms/AttendanceInForm";
import CompetitionReportForm from "../pages/forms/CompetitionReportForm";
import DVRForm from "../pages/forms/DVRForm";
import LeaveApplicationForm from "../pages/forms/LeaveApplicationForm";
import SalesOrderForm from "../pages/forms/SalesOrderForm";
import TVRForm from "../pages/forms/TVRForm";

import { DrawerStackParamList } from "../components/ReusableConstants";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator<DrawerStackParamList>();

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Animated Drawer Background Component
function AnimatedDrawerBackground({ children }: { children: React.ReactNode }) {
  const backgroundAnimRef = useRef(new Animated.Value(0)).current;
  const particleAnimRef = useRef(new Animated.Value(0)).current;
  const glowAnimRef = useRef(new Animated.Value(0.3)).current;
  const scanLineAnimRef = useRef(new Animated.Value(0)).current;
  const pulseAnimRef = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Background entrance animation with bounce effect
    Animated.timing(backgroundAnimRef, {
      toValue: 1,
      duration: 1000,
      easing: Easing.bezier(0.68, -0.55, 0.265, 1.55), // Fixed easing
      useNativeDriver: true,
    }).start();

    // Continuous particle floating animation
    Animated.loop(
      Animated.timing(particleAnimRef, {
        toValue: 1,
        duration: 15000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Enhanced glow animation with varying intensity
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnimRef, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin), // Fixed easing
          useNativeDriver: true,
        }),
        Animated.timing(glowAnimRef, {
          toValue: 0.3,
          duration: 3000,
          easing: Easing.inOut(Easing.sin), // Fixed easing
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanning line effect for tech feel
    Animated.loop(
      Animated.timing(scanLineAnimRef, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    // Subtle pulse for the entire container
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnimRef, {
          toValue: 1.02,
          duration: 4000,
          easing: Easing.inOut(Easing.sin), // Fixed easing
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnimRef, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin), // Fixed easing
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.drawerContainer,
        {
          transform: [{ scale: pulseAnimRef }]
        }
      ]}
    >
      {/* Animated Background with Enhanced Glassmorphism */}
      <Animated.View
        style={[
          styles.backgroundLayer,
          {
            opacity: backgroundAnimRef,
            transform: [
              {
                translateX: backgroundAnimRef.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-screenWidth * 0.5, 0],
                }),
              },
              {
                scale: backgroundAnimRef.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1],
                }),
              },
            ],
          },
        ]}
      >
        <BlurView intensity={30} tint="dark" style={styles.blurBackground}>
          <LinearGradient
            colors={[
              'rgba(15, 23, 42, 0.98)',
              'rgba(30, 41, 59, 0.96)',
              'rgba(51, 65, 85, 0.94)',
              'rgba(71, 85, 105, 0.92)',
              'rgba(100, 116, 139, 0.88)'
            ]}
            style={styles.gradientBackground}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            {/* Enhanced Animated Particles Effect */}
            <Animated.View
              style={[
                styles.particleLayer,
                {
                  opacity: glowAnimRef.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.6, 1],
                  }),
                },
              ]}
            >
              {/* Multiple Particle Layers for Depth */}
              {[...Array(12)].map((_, index) => (
                <Animated.View
                  key={index}
                  style={[
                    styles.particle,
                    {
                      left: `${(index * 18 + 10) % 85}%`,
                      top: `${(index * 35 + 15) % 80}%`,
                      width: index % 3 === 0 ? 4 : index % 2 === 0 ? 3 : 2,
                      height: index % 3 === 0 ? 4 : index % 2 === 0 ? 3 : 2,
                      borderRadius: index % 3 === 0 ? 2 : index % 2 === 0 ? 1.5 : 1,
                      opacity: glowAnimRef.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.2, 0.8],
                      }),
                      transform: [
                        {
                          translateY: particleAnimRef.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, -screenHeight * 0.3],
                          }),
                        },
                        {
                          scale: glowAnimRef.interpolate({
                            inputRange: [0.3, 1],
                            outputRange: [0.6, 1.4],
                          }),
                        },
                        {
                          rotate: particleAnimRef.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </Animated.View>

            {/* Enhanced Scanning Line Effect */}
            <Animated.View
              style={[
                styles.scanLine,
                {
                  opacity: scanLineAnimRef.interpolate({
                    inputRange: [0, 0.3, 0.7, 1],
                    outputRange: [0, 0.8, 0.8, 0],
                  }),
                  transform: [
                    {
                      translateY: scanLineAnimRef.interpolate({
                        inputRange: [0, 1],
                        outputRange: [-50, screenHeight + 50],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[
                  'transparent',
                  'rgba(6, 182, 212, 0.8)',
                  'rgba(6, 182, 212, 1)',
                  'rgba(6, 182, 212, 0.8)',
                  'transparent'
                ]}
                style={styles.scanLineGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
              />
            </Animated.View>

            {/* Enhanced Neon Edge with Multiple Layers */}
            <Animated.View
              style={[
                styles.neonEdgeContainer,
                {
                  opacity: glowAnimRef,
                },
              ]}
            >
              {/* Primary glow */}
              <Animated.View
                style={[
                  styles.neonEdge,
                  {
                    shadowOpacity: glowAnimRef.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.3, 1],
                    }),
                    shadowRadius: glowAnimRef.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [8, 20],
                    }),
                  },
                ]}
              />
              
              {/* Secondary glow layer */}
              <View style={[styles.neonEdge, styles.neonEdgeSecondary]} />
              
              {/* Tertiary glow layer */}
              <View style={[styles.neonEdge, styles.neonEdgeTertiary]} />
            </Animated.View>

            {/* Grid Pattern Overlay */}
            <Animated.View
              style={[
                styles.gridOverlay,
                {
                  opacity: glowAnimRef.interpolate({
                    inputRange: [0.3, 1],
                    outputRange: [0.05, 0.15],
                  }),
                },
              ]}
            />

            {/* Corner Accent Elements */}
            <Animated.View
              style={[
                styles.cornerAccent,
                styles.topLeftCorner,
                {
                  opacity: glowAnimRef,
                  transform: [
                    {
                      scale: glowAnimRef.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />
            
            <Animated.View
              style={[
                styles.cornerAccent,
                styles.bottomRightCorner,
                {
                  opacity: glowAnimRef,
                  transform: [
                    {
                      scale: glowAnimRef.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            />

            {/* Content Container with subtle animation */}
            <Animated.View
              style={[
                styles.contentContainer,
                {
                  transform: [
                    {
                      translateX: backgroundAnimRef.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                  opacity: backgroundAnimRef,
                },
              ]}
            >
              {children}
            </Animated.View>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
}

// Enhanced Stack Navigator with smooth transitions and gesture handling
function RootStack() {
  return (
    <Stack.Navigator 
      id="RootStack"
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
        animation: Platform.OS === 'ios' ? 'slide_from_right' : 'slide_from_right',
        animationDuration: 300,
      }}
    >
      {/* Main Bottom Navigation */}
      <Stack.Screen 
        name="MainTabs" 
        component={BottomNavBar}
        options={{
          gestureEnabled: false, // Disable gesture for main screen
        }}
      />
      
      {/* Form Screens with Enhanced Transitions */}
      <Stack.Screen 
        name="AddPJPForm" 
        component={AddPJPForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="AddDealerForm" 
        component={AddDealerForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="AddSiteForm" 
        component={AddSiteForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="DailyTasksForm" 
        component={DailyTasksForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="AttendanceForm" 
        component={AttendanceForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="CompetitionReportForm" 
        component={CompetitionReportForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="DVRForm" 
        component={DVRForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="LeaveApplicationForm" 
        component={LeaveApplicationForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="SalesOrderForm" 
        component={SalesOrderForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
      <Stack.Screen 
        name="TVRForm" 
        component={TVRForm}
        options={{
          presentation: 'modal',
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

// Enhanced Drawer with Premium Styling and Animations
export default function AppDrawer() {
  return (
    <Drawer.Navigator
      id="AppDrawer"
      drawerContent={(props) => (
        <AnimatedDrawerBackground>
          <SideNavBar {...props} />
        </AnimatedDrawerBackground>
      )}
      screenOptions={{
        headerShown: false,
        drawerType: Platform.OS === "android" ? "slide" : "slide",
        drawerStyle: {
          backgroundColor: 'transparent',
          width: Math.min(screenWidth * 0.85, 340),
          borderTopRightRadius: 20,
          borderBottomRightRadius: 20,
          overflow: 'hidden',
        },
        overlayColor: 'rgba(0, 0, 0, 0.85)',
        drawerActiveTintColor: '#06b6d4',
        drawerInactiveTintColor: '#94a3b8',
        swipeEnabled: true,
        swipeEdgeWidth: Platform.OS === 'ios' ? 80 : 60,
        drawerHideStatusBarOnOpen: Platform.OS === 'ios',
        // Enhanced gesture handling
        gestureHandlerProps: {
          enableTrackpadTwoFingerGesture: true,
        },
      }}
    >
      <Drawer.Screen 
        name="Root" 
        component={RootStack}
        options={{
          swipeEnabled: true,
          drawerLabel: () => null, // Hide label since this is the main screen
        }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  backgroundLayer: {
    flex: 1,
  },
  blurBackground: {
    flex: 1,
    borderRightWidth: 3,
    borderRightColor: 'rgba(6, 182, 212, 0.4)',
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    overflow: 'hidden',
  },
  gradientBackground: {
    flex: 1,
    position: 'relative',
  },
  particleLayer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  particle: {
    position: 'absolute',
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 6,
    elevation: 5,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    pointerEvents: 'none',
  },
  scanLineGradient: {
    flex: 1,
  },
  neonEdgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
  },
  neonEdge: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: 3,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 10,
  },
  neonEdgeSecondary: {
    width: 2,
    right: 0.5,
    backgroundColor: '#0891b2',
    shadowRadius: 10,
    elevation: 8,
  },
  neonEdgeTertiary: {
    width: 1,
    right: 1,
    backgroundColor: '#67e8f9',
    shadowRadius: 5,
    elevation: 6,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#06b6d4',
    pointerEvents: 'none',
  },
  cornerAccent: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#06b6d4',
    borderWidth: 2,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  topLeftCorner: {
    top: 20,
    left: 20,
    borderBottomWidth: 0,
    borderRightWidth: 0,
    borderTopLeftRadius: 8,
  },
  bottomRightCorner: {
    bottom: 20,
    right: 20,
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderBottomRightRadius: 8,
  },
  contentContainer: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 44 : 24, // Account for status bar
  },
});