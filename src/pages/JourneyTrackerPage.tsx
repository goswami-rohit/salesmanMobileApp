// src/pages/JourneyTrackerPage.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  Easing,
  TouchableOpacity,
  Platform,
  Vibration,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import AppHeader from '../components/AppHeader';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Enhanced Journey Stats Card Component
const JourneyStatsCard: React.FC<{
  icon: string;
  title: string;
  value: string;
  unit: string;
  color: string;
  index: number;
}> = ({ icon, title, value, unit, color, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: index * 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000 + index * 300,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [index]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } else {
      Vibration.vibrate(30);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Animated.View
      style={[
        styles.statsCard,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <BlurView intensity={15} tint="dark" style={styles.statsCardBlur}>
          <LinearGradient
            colors={[
              `rgba(${color}, 0.2)`,
              `rgba(${color}, 0.1)`,
              'rgba(15, 23, 42, 0.3)',
            ]}
            style={styles.statsCardGradient}
          >
            <Animated.View
              style={[
                styles.iconContainer,
                {
                  opacity: glowAnim,
                  transform: [{
                    scale: glowAnim.interpolate({
                      inputRange: [0.5, 1],
                      outputRange: [1, 1.1],
                    }),
                  }],
                },
              ]}
            >
              <LinearGradient
                colors={[`rgb(${color})`, `rgba(${color}, 0.8)`]}
                style={styles.iconGradient}
              >
                <MaterialCommunityIcons name={icon} size={24} color="white" />
              </LinearGradient>
            </Animated.View>

            <Text style={styles.statsTitle}>{title}</Text>
            <View style={styles.statsValueContainer}>
              <Text style={[styles.statsValue, { color: `rgb(${color})` }]}>
                {value}
              </Text>
              <Text style={styles.statsUnit}>{unit}</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Map Placeholder Component
const MapPlaceholder: React.FC = () => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation for the entire map
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Scanning line effect
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.mapContainer,
        { transform: [{ scale: pulseAnim }] }
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.mapBlur}>
        <LinearGradient
          colors={[
            'rgba(15, 23, 42, 0.9)',
            'rgba(30, 41, 59, 0.8)',
            'rgba(51, 65, 85, 0.7)',
          ]}
          style={styles.mapGradient}
        >
          {/* Grid pattern overlay */}
          <View style={styles.gridPattern} />
          
          {/* Scanning line */}
          <Animated.View
            style={[
              styles.scanLine,
              {
                opacity: scanLineAnim.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
                transform: [{
                  translateY: scanLineAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-50, 250],
                  }),
                }],
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
            />
          </Animated.View>

          {/* Central map icon */}
          <View style={styles.mapIconContainer}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.mapIconGradient}
            >
              <MaterialCommunityIcons name="map-marker-path" size={40} color="white" />
            </LinearGradient>
          </View>

          {/* Map placeholder text */}
          <Text style={styles.mapPlaceholderTitle}>GPS TRACKING SYSTEM</Text>
          <Text style={styles.mapPlaceholderSubtitle}>
            Neural mapping interface will display real-time location data
          </Text>

          {/* Mock location indicators */}
          <View style={[styles.locationDot, { top: '20%', left: '30%' }]} />
          <View style={[styles.locationDot, { top: '60%', right: '25%' }]} />
          <View style={[styles.locationDot, { bottom: '30%', left: '20%' }]} />
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// Enhanced Action Button Component
const ActionButton: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  color: string;
}> = ({ icon, label, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 2000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(50);
    }

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.actionButton,
        { transform: [{ scale: scaleAnim }] }
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <BlurView intensity={15} tint="dark" style={styles.actionButtonBlur}>
          <Animated.View
            style={[
              styles.actionButtonContent,
              {
                backgroundColor: glowAnim.interpolate({
                  inputRange: [0.5, 1],
                  outputRange: [`rgba(${color}, 0.1)`, `rgba(${color}, 0.2)`],
                }),
              },
            ]}
          >
            <MaterialCommunityIcons name={icon} size={20} color={`rgb(${color})`} />
            <Text style={[styles.actionButtonText, { color: `rgb(${color})` }]}>
              {label}
            </Text>
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
export default function JourneyTrackerPage() {
  const backgroundAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, []);

  const statsData = [
    { icon: 'speedometer', title: 'Speed', value: '45', unit: 'km/h', color: '6, 182, 212' },
    { icon: 'map-marker-distance', title: 'Distance', value: '12.5', unit: 'km', color: '16, 185, 129' },
    { icon: 'clock-time-four', title: 'Duration', value: '2h 15m', unit: '', color: '251, 191, 36' },
    { icon: 'navigation', title: 'Direction', value: 'NE', unit: '45°', color: '239, 68, 68' },
  ];

  const handleStartJourney = () => {
    console.log('Start journey tracking');
  };

  const handleViewHistory = () => {
    console.log('View journey history');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['right', 'bottom', 'left']}>
      <AppHeader title="Journey Tracker" />
      
      <Animated.View 
        style={[
          styles.container,
          { opacity: backgroundAnim }
        ]}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <JourneyStatsCard
              key={stat.title}
              icon={stat.icon}
              title={stat.title}
              value={stat.value}
              unit={stat.unit}
              color={stat.color}
              index={index}
            />
          ))}
        </View>

        {/* Enhanced Map Section */}
        <MapPlaceholder />

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <ActionButton
            icon="play-circle"
            label="START TRACKING"
            onPress={handleStartJourney}
            color="6, 182, 212"
          />
          <ActionButton
            icon="history"
            label="VIEW HISTORY"
            onPress={handleViewHistory}
            color="16, 185, 129"
          />
        </View>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statsCard: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statsCardBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    overflow: 'hidden',
  },
  statsCardGradient: {
    padding: 16,
    alignItems: 'center',
    minHeight: 120,
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 8,
  },
  iconGradient: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statsTitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  statsValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  statsValue: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statsUnit: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 200,
  },
  mapBlur: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  mapGradient: {
    flex: 1,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridPattern: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.1)',
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
  mapIconContainer: {
    marginBottom: 16,
  },
  mapIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  mapPlaceholderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 8,
    letterSpacing: 1,
  },
  mapPlaceholderSubtitle: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  locationDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  actionButtonBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});