// src/components/SideNavBar.tsx
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Platform,
  Vibration,
  Alert,
} from 'react-native';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';

// Enhanced Animated User Profile Component
const AnimatedUserProfile: React.FC<{ user: any }> = ({ user }) => {
  const profileGlow = useRef(new Animated.Value(0.5)).current;
  const profilePulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Continuous glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(profileGlow, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sin), // ✅ FIXED
          useNativeDriver: true,
        }),
        Animated.timing(profileGlow, {
          toValue: 0.5,
          duration: 3000,
          easing: Easing.inOut(Easing.sin), // ✅ FIXED
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Subtle pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(profilePulse, {
          toValue: 1.05,
          duration: 4000,
          easing: Easing.inOut(Easing.sin), // ✅ FIXED
          useNativeDriver: true,
        }),
        Animated.timing(profilePulse, {
          toValue: 1,
          duration: 4000,
          easing: Easing.inOut(Easing.sin), // ✅ FIXED
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.profileSection,
        { 
          transform: [{ scale: profilePulse }],
          opacity: profileGlow
        }
      ]}
    >
      <BlurView intensity={15} tint="dark" style={styles.profileBlur}>
        <LinearGradient
          colors={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.1)']}
          style={styles.profileGradient}
        >
          <Animated.View style={[styles.avatarContainer, { opacity: profileGlow }]}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.avatarGradient}
            >
              <Text style={styles.avatarText}>
                {user?.firstName?.[0] || 'A'}{user?.lastName?.[0] || 'G'}
              </Text>
            </LinearGradient>
          </Animated.View>
          
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.firstName || 'Agent'} {user?.lastName || 'Field Ops'}
            </Text>
            <Text style={styles.userRole}>
              {user?.role || 'Field Operations Specialist'}
            </Text>
            <Text style={styles.userCompany}>
              {user?.companyName || 'Field Operations HQ'}
            </Text>
          </View>

          {/* Status Indicator */}
          <Animated.View 
            style={[
              styles.statusIndicator,
              { 
                opacity: profileGlow,
                transform: [{ scale: profileGlow }]
              }
            ]}
          >
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>NEURAL LINK ACTIVE</Text>
          </Animated.View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// Enhanced Animated Menu Item Component
const AnimatedMenuItem: React.FC<{
  icon: string;
  label: string;
  onPress: () => void;
  index: number;
}> = ({ icon, label, onPress, index }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Staggered entrance animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 600,
      delay: index * 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [index]);

  const handlePress = () => {
    // Haptic feedback
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(50);
    }

    // Press animation
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.menuItemContainer,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={styles.menuItem}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Animated.View 
          style={[
            styles.menuItemContent,
            {
              backgroundColor: glowAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['rgba(6, 182, 212, 0.1)', 'rgba(6, 182, 212, 0.3)'],
              }),
            }
          ]}
        >
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#06b6d4', '#0891b2']}
              style={styles.iconGradient}
            >
              <Icon name={icon} size={22} color="white" />
            </LinearGradient>
          </View>
          
          <Text style={styles.menuLabel}>{label}</Text>
          
          <Animated.View 
            style={[
              styles.arrowContainer,
              { opacity: glowAnim }
            ]}
          >
            <Icon name="chevron-right" size={20} color="#06b6d4" />
          </Animated.View>
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Enhanced Particle Effect Component
const ParticleEffect: React.FC = () => {
  const particles = useRef([...Array(6)].map(() => ({
    x: new Animated.Value(Math.random() * 300),
    y: new Animated.Value(Math.random() * 600),
    opacity: new Animated.Value(Math.random() * 0.5 + 0.1),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
  }))).current;

  useEffect(() => {
    const animations = particles.map((particle, index) => 
      Animated.loop(
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.random() * 300,
            duration: 8000 + index * 1000,
            easing: Easing.inOut(Easing.sin), // ✅ FIXED
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * 600,
            duration: 10000 + index * 800,
            easing: Easing.inOut(Easing.sin), // ✅ FIXED
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.5 + 0.1,
            duration: 6000 + index * 500,
            easing: Easing.inOut(Easing.sin), // ✅ FIXED
            useNativeDriver: true,
          }),
        ])
      )
    );

    animations.forEach(anim => anim.start());
    
    return () => animations.forEach(anim => anim.stop());
  }, []);

  return (
    <View style={styles.particleContainer} pointerEvents="none">
      {particles.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
                { scale: particle.scale },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

// Main SideNavBar Component
export default function SideNavBar(props: any) {
  const backgroundAnim = useRef(new Animated.Value(0)).current;
  const glowLineAnim = useRef(new Animated.Value(0)).current;

  // Mock user data (replace with actual user data)
  const user = {
    firstName: 'Agent',
    lastName: 'Field',
    role: 'Neural Operations Specialist',
    companyName: 'Mission Control HQ',
  };

  const menuItems = [
    { icon: 'view-dashboard', label: 'Mission Control', screen: 'Home' },
    { icon: 'map-marker-path', label: 'Journey Tracker', screen: 'Journey' },
    { icon: 'robot', label: 'AI Neural Link', screen: 'AIChat' },
    { icon: 'account-circle', label: 'Agent Profile', screen: 'Profile' },
    { icon: 'plus-circle', label: 'Deploy PJP', screen: 'AddPJPForm' },
    { icon: 'office-building', label: 'Add Dealer Hub', screen: 'AddDealerForm' },
    { icon: 'map-marker-plus', label: 'Register Site', screen: 'AddSiteForm' },
    { icon: 'clipboard-list', label: 'Daily Protocols', screen: 'DailyTasksForm' },
    { icon: 'clock-check', label: 'Attendance Log', screen: 'AttendanceForm' },
    { icon: 'chart-line', label: 'Intel Report', screen: 'CompetitionReportForm' },
    { icon: 'file-document', label: 'DVR Analysis', screen: 'DVRForm' },
    { icon: 'calendar-remove', label: 'Leave Request', screen: 'LeaveApplicationForm' },
    { icon: 'cart-plus', label: 'Sales Order', screen: 'SalesOrderForm' },
    { icon: 'file-chart', label: 'TVR Report', screen: 'TVRForm' },
  ];

  useEffect(() => {
    // Background entrance animation
    Animated.timing(backgroundAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Glow line animation
    Animated.loop(
      Animated.timing(glowLineAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.sin), // ✅ FIXED
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleNavigation = (screen: string) => {
    props.navigation.navigate(screen);
  };

  const handleLogout = () => {
    Alert.alert(
      'Neural Disconnect',
      'Terminate consciousness interface and return to standby mode?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Disconnect', 
          style: 'destructive',
          onPress: () => {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
              Vibration.vibrate(100);
            }
            Alert.alert('System', 'Neural link terminated successfully.');
          }
        },
      ]
    );
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        { opacity: backgroundAnim }
      ]}
    >
      {/* Particle Effects */}
      <ParticleEffect />

      {/* Animated Glow Line */}
      <Animated.View
        style={[
          styles.glowLine,
          {
            opacity: glowLineAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0.3, 1],
            }),
            transform: [{
              translateY: glowLineAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 200],
              }),
            }],
          },
        ]}
      />

      <DrawerContentScrollView 
        {...props} 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Enhanced User Profile */}
        <AnimatedUserProfile user={user} />

        {/* Enhanced Menu Items */}
        <View style={styles.menuContainer}>
          {menuItems.map((item, index) => (
            <AnimatedMenuItem
              key={item.screen}
              icon={item.icon}
              label={item.label}
              onPress={() => handleNavigation(item.screen)}
              index={index}
            />
          ))}
        </View>

        {/* Enhanced Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <BlurView intensity={15} tint="dark" style={styles.logoutBlur}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)']}
                style={styles.logoutGradient}
              >
                <Icon name="power" size={20} color="#ef4444" />
                <Text style={styles.logoutText}>NEURAL DISCONNECT</Text>
              </LinearGradient>
            </BlurView>
          </TouchableOpacity>
        </View>
      </DrawerContentScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  particle: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 4,
    elevation: 4,
  },
  glowLine: {
    position: 'absolute',
    left: 0,
    width: 2,
    height: 100,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 1,
  },
  scrollView: {
    flex: 1,
    zIndex: 2,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  profileSection: {
    margin: 20,
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  profileBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  profileGradient: {
    padding: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatarGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 2,
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 15,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  userRole: {
    fontSize: 13,
    color: '#06b6d4',
    marginBottom: 2,
    letterSpacing: 0.5,
  },
  userCompany: {
    fontSize: 11,
    color: '#94a3b8',
    letterSpacing: 0.3,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
  menuContainer: {
    paddingHorizontal: 10,
  },
  menuItemContainer: {
    marginBottom: 8,
  },
  menuItem: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    flex: 1,
    letterSpacing: 0.3,
  },
  arrowContainer: {
    marginLeft: 8,
  },
  logoutContainer: {
    margin: 20,
    marginTop: 30,
  },
  logoutButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  logoutBlur: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },
  logoutText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ef4444',
    letterSpacing: 1,
  },
});