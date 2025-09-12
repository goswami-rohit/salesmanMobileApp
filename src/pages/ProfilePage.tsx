// src/pages/ProfilePage.tsx
import React, { useCallback, useState, useEffect, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Vibration,
  Dimensions,
} from 'react-native';
import { Avatar, Button, Card, Chip, Portal, Modal, Text } from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import type { MainTabsParamList, AppStackParamList } from '../components/ReusableConstants';
import { useAppStore, fetchUserById } from '../components/ReusableConstants';
import LeaveApplicationForm from '../pages/forms/LeaveApplicationForm';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type ProfileScreenProps = BottomTabScreenProps<MainTabsParamList, 'Profile'>;

// Enhanced Animated Avatar Component
const AnimatedAvatar: React.FC<{ initials: string }> = ({ initials }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
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

    // Glow animation
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

    // Subtle rotation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 20000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.avatarContainer,
        {
          transform: [
            { scale: pulseAnim },
            {
              rotate: rotateAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '360deg'],
              }),
            },
          ],
          opacity: glowAnim,
        },
      ]}
    >
      <LinearGradient
        colors={['#06b6d4', '#0891b2', '#0e7490']}
        style={styles.avatarGradient}
      >
        <Text style={styles.avatarText}>{initials}</Text>
      </LinearGradient>
      
      {/* Glow ring */}
      <Animated.View
        style={[
          styles.avatarRing,
          {
            opacity: glowAnim.interpolate({
              inputRange: [0.5, 1],
              outputRange: [0.3, 0.8],
            }),
            transform: [{
              scale: glowAnim.interpolate({
                inputRange: [0.5, 1],
                outputRange: [1, 1.1],
              }),
            }],
          },
        ]}
      />
    </Animated.View>
  );
};

// Enhanced Animated StatTile Component
const AnimatedStatTile: React.FC<{
  iconName: string;
  value: number;
  label: string;
  color: string;
  index: number;
}> = ({ iconName, value, label, color, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const countAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Staggered entrance
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: index * 150,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Count up animation
    Animated.timing(countAnim, {
      toValue: value,
      duration: 1000,
      delay: index * 150 + 300,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

    // Glow animation
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
  }, [index, value]);

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
        styles.statTileContainer,
        {
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
        <BlurView intensity={15} tint="dark" style={styles.statTileBlur}>
          <LinearGradient
            colors={[
              `rgba(${color}, 0.2)`,
              `rgba(${color}, 0.1)`,
              'rgba(15, 23, 42, 0.3)',
            ]}
            style={styles.statTileGradient}
          >
            <Animated.View
              style={[
                styles.statIconContainer,
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
                style={styles.statIconGradient}
              >
                <MaterialCommunityIcons name={iconName} size={20} color="white" />
              </LinearGradient>
            </Animated.View>

            <View style={styles.statTextContainer}>
              <Animated.Text style={[styles.statValue, { color: `rgb(${color})` }]}>
                {Math.round(countAnim._value)}
              </Animated.Text>
              <Text style={styles.statLabel}>{label}</Text>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Progress Bar Component
const AnimatedProgressBar: React.FC<{
  progress: number;
  color: string;
  delay?: number;
}> = ({ progress, color, delay = 0 }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 1500,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();

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
  }, [progress, delay]);

  return (
    <View style={styles.progressContainer}>
      <BlurView intensity={10} tint="dark" style={styles.progressBlur}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              width: progressAnim.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
              }),
              opacity: glowAnim,
            },
          ]}
        >
          <LinearGradient
            colors={[color, `${color}CC`, `${color}99`]}
            style={styles.progressGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </BlurView>
    </View>
  );
};

// Enhanced Action Button Component
const AnimatedActionButton: React.FC<{
  icon: string;
  title: string;
  onPress: () => void;
  color: string;
}> = ({ icon, title, onPress, color }) => {
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

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.actionButtonContainer,
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
            <LinearGradient
              colors={[`rgb(${color})`, `rgba(${color}, 0.8)`]}
              style={styles.actionIconGradient}
            >
              <MaterialCommunityIcons name={icon} size={20} color="white" />
            </LinearGradient>
            <Text style={[styles.actionButtonText, { color: `rgb(${color})` }]}>
              {title}
            </Text>
          </Animated.View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Component
export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const { user, reports, dealers, pjps, dailyTasks, dashboardStats, userTargets, setUser } = useAppStore();
  const [openLeave, setOpenLeave] = useState(false);

  const containerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      if (!user?.id) {
        try {
          const storedUserId = await AsyncStorage.getItem('userId');
          if (storedUserId) {
            const fetched = await fetchUserById(Number(storedUserId));
            if (fetched) setUser(fetched);
          }
        } catch (err) {
          console.error('Failed to fetch user', err);
        }
      }
    };
    loadUser();

    // Entrance animation
    Animated.timing(containerAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [user, setUser]);

  const handleLogout = useCallback(async () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } else {
      Vibration.vibrate(100);
    }

    await AsyncStorage.clear();
    setUser(null);
    const parentNav = navigation.getParent<NativeStackNavigationProp<AppStackParamList>>();
    parentNav?.navigate({ name: 'Login', params: { onLoginSuccess: () => {} } });
  }, [navigation, setUser]);

  const initials = `${user?.firstName?.[0] || ''}${user?.lastName?.[0] || ''}`.toUpperCase();

  const statsData = [
    { iconName: 'file-document-outline', value: (reports || []).length, label: 'Reports', color: '6, 182, 212' },
    { iconName: 'storefront-outline', value: (dealers || []).length, label: 'Dealers', color: '16, 185, 129' },
    { iconName: 'map-marker-distance', value: (pjps || []).length, label: 'PJPs', color: '251, 191, 36' },
    { iconName: 'check-circle-outline', value: (dailyTasks || []).filter((t: any) => t.status === 'Completed').length, label: 'Tasks Done', color: '168, 85, 247' },
  ];

  return (
    <Animated.View style={[styles.container, { opacity: containerAnim }]}>
      <RNStatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0f172a', '#1e293b', '#334155']}
        style={styles.backgroundGradient}
      />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Enhanced Profile Header */}
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.headerGradient}
            >
              <View style={styles.header}>
                <AnimatedAvatar initials={initials} />
                
                <Text style={styles.name}>
                  {user?.firstName} {user?.lastName}
                </Text>
                
                <Text style={styles.email}>{user?.email}</Text>
                
                <BlurView intensity={10} tint="dark" style={styles.roleChipBlur}>
                  <LinearGradient
                    colors={['rgba(6, 182, 212, 0.3)', 'rgba(6, 182, 212, 0.2)']}
                    style={styles.roleChipGradient}
                  >
                    <MaterialCommunityIcons name="account-tie" size={16} color="#06b6d4" />
                    <Text style={styles.roleText}>{user?.role ?? 'Agent'}</Text>
                  </LinearGradient>
                </BlurView>

                {/* Status Indicator */}
                <View style={styles.statusContainer}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>NEURAL LINK ACTIVE</Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>

          {/* Enhanced Stats Grid */}
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <AnimatedStatTile
                key={stat.label}
                iconName={stat.iconName}
                value={stat.value}
                label={stat.label}
                color={stat.color}
                index={index}
              />
            ))}
          </View>

          {/* Enhanced Performance Card */}
          <BlurView intensity={20} tint="dark" style={styles.performanceCardBlur}>
            <LinearGradient
              colors={[
                'rgba(15, 23, 42, 0.9)',
                'rgba(30, 41, 59, 0.8)',
                'rgba(51, 65, 85, 0.7)',
              ]}
              style={styles.performanceCardGradient}
            >
              <View style={styles.performanceHeader}>
                <LinearGradient
                  colors={['#eab308', '#f59e0b']}
                  style={styles.performanceIconGradient}
                >
                  <MaterialCommunityIcons name="trophy-award" size={20} color="white" />
                </LinearGradient>
                <Text style={styles.performanceTitle}>NEURAL PERFORMANCE</Text>
              </View>

              {dashboardStats?.attendance && (
                <View style={styles.attendanceRow}>
                  <View style={styles.attendanceLeft}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#06b6d4" />
                    <Text style={styles.attendanceLabel}>Neural Link Status</Text>
                  </View>
                  <BlurView intensity={10} tint="dark" style={styles.attendanceChipBlur}>
                    <LinearGradient
                      colors={dashboardStats.attendance.isPresent 
                        ? ['rgba(16, 185, 129, 0.3)', 'rgba(16, 185, 129, 0.2)']
                        : ['rgba(239, 68, 68, 0.3)', 'rgba(239, 68, 68, 0.2)']
                      }
                      style={styles.attendanceChipGradient}
                    >
                      <Text style={[
                        styles.attendanceChipText,
                        { color: dashboardStats.attendance.isPresent ? '#10b981' : '#ef4444' }
                      ]}>
                        {dashboardStats.attendance.isPresent ? 'ACTIVE' : 'OFFLINE'}
                      </Text>
                    </LinearGradient>
                  </BlurView>
                </View>
              )}

              {(userTargets || []).map((target: any, index: number) => {
                const progress = Math.min(100, Math.round(((target.current ?? 0) / (target.target || 1)) * 100));
                const progressColor = progress >= 80 ? '#10b981' : progress >= 60 ? '#f59e0b' : '#ef4444';
                
                return (
                  <View key={index} style={styles.targetContainer}>
                    <View style={styles.targetRow}>
                      <View style={styles.targetLeft}>
                        <MaterialCommunityIcons 
                          name={target.icon || 'target'} 
                          size={16} 
                          color={target.color || '#06b6d4'} 
                        />
                        <Text style={styles.targetLabel}>{target.label}</Text>
                      </View>
                      <Text style={styles.targetValue}>
                        {target.current} / {target.target}
                      </Text>
                    </View>
                    <AnimatedProgressBar
                      progress={progress}
                      color={progressColor}
                      delay={index * 200}
                    />
                  </View>
                );
              })}
            </LinearGradient>
          </BlurView>

          {/* Enhanced Action Buttons */}
          <View style={styles.actionsContainer}>
            <AnimatedActionButton
              icon="clipboard-list-outline"
              title="Apply for Leave"
              onPress={() => setOpenLeave(true)}
              color="6, 182, 212"
            />

            <AnimatedActionButton
              icon="package-variant-closed"
              title="Brand Mapping"
              onPress={() => console.log('Brand mapping')}
              color="16, 185, 129"
            />
          </View>

          {/* Enhanced Empty States */}
          <View style={styles.emptyStatesContainer}>
            <BlurView intensity={15} tint="dark" style={styles.emptyStateBlur}>
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.8)', 'rgba(30, 41, 59, 0.6)']}
                style={styles.emptyStateGradient}
              >
                <Text style={styles.emptyStateTitle}>Leave Applications</Text>
                <View style={styles.emptyStateContent}>
                  <MaterialCommunityIcons name="clipboard-list-outline" size={36} color="#64748b" />
                  <Text style={styles.emptyStateText}>No leave applications in neural database</Text>
                </View>
              </LinearGradient>
            </BlurView>

            <BlurView intensity={15} tint="dark" style={styles.emptyStateBlur}>
              <LinearGradient
                colors={['rgba(15, 23, 42, 0.8)', 'rgba(30, 41, 59, 0.6)']}
                style={styles.emptyStateGradient}
              >
                <Text style={styles.emptyStateTitle}>Dealer-Brand Mapping</Text>
                <View style={styles.emptyStateContent}>
                  <MaterialCommunityIcons name="package-variant-closed" size={36} color="#64748b" />
                  <Text style={styles.emptyStateText}>No neural mappings configured</Text>
                </View>
              </LinearGradient>
            </BlurView>
          </View>

          {/* Enhanced Logout Button */}
          <View style={styles.logoutContainer}>
            <TouchableOpacity onPress={handleLogout} activeOpacity={0.8}>
              <BlurView intensity={15} tint="dark" style={styles.logoutBlur}>
                <LinearGradient
                  colors={['rgba(239, 68, 68, 0.3)', 'rgba(220, 38, 38, 0.2)']}
                  style={styles.logoutGradient}
                >
                  <MaterialCommunityIcons name="power" size={20} color="#ef4444" />
                  <Text style={styles.logoutText}>NEURAL DISCONNECT</Text>
                </LinearGradient>
              </BlurView>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Enhanced Modal */}
      <Portal>
        <Modal 
          visible={openLeave} 
          onDismiss={() => setOpenLeave(false)} 
          contentContainerStyle={styles.modal}
        >
          <BlurView intensity={25} tint="dark" style={styles.modalBlur}>
            <LeaveApplicationForm 
              userId={user?.id} 
              onSubmitted={() => setOpenLeave(false)} 
              onCancel={() => setOpenLeave(false)} 
            />
          </BlurView>
        </Modal>
      </Portal>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  headerBlur: {
    borderRadius: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
  },
  header: {
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  avatarGradient: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  avatarRing: {
    position: 'absolute',
    width: 106,
    height: 106,
    borderRadius: 53,
    borderWidth: 2,
    borderColor: '#06b6d4',
    top: -5,
    left: -5,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  email: {
    fontSize: 14,
    color: '#94a3b8',
    marginBottom: 12,
  },
  roleChipBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  roleChipGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10b981',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statTileContainer: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  statTileBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    overflow: 'hidden',
  },
  statTileGradient: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIconContainer: {
    marginRight: 12,
  },
  statIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  statLabel: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  performanceCardBlur: {
    borderRadius: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  performanceCardGradient: {
    padding: 20,
  },
  performanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  performanceIconGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    elevation: 4,
    shadowColor: '#eab308',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  performanceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#06b6d4',
    letterSpacing: 1,
  },
  attendanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  attendanceChipBlur: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
  },
  attendanceChipGradient: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  attendanceChipText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  targetContainer: {
    marginBottom: 16,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  targetLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 14,
    color: 'white',
    marginLeft: 8,
  },
  targetValue: {
    fontSize: 12,
    color: '#94a3b8',
  },
  progressContainer: {
    height: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  progressBlur: {
    flex: 1,
    borderRadius: 8,
    backgroundColor: 'rgba(51, 65, 85, 0.5)',
  },
  progressFill: {
    height: '100%',
    borderRadius: 8,
  },
  progressGradient: {
    flex: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 12,
  },
  actionButtonContainer: {
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  actionIconGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  emptyStatesContainer: {
    gap: 12,
    marginBottom: 20,
  },
  emptyStateBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
    overflow: 'hidden',
  },
  emptyStateGradient: {
    padding: 16,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    marginBottom: 12,
  },
  emptyStateContent: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyStateText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 8,
  },
  logoutContainer: {
    marginTop: 12,
  },
  logoutBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
  },
  modal: {
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalBlur: {
    borderRadius: 20,
    padding: 8,
  },
});