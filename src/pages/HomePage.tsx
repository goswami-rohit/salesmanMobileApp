// src/pages/HomePage.tsx - Single Rotating Flip Clock Design
import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  StatusBar,
  Platform,
  Vibration,
  Text
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAppStore, BASE_URL } from '../components/ReusableConstants';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

const { width, height } = Dimensions.get('window');

// Demo PJP Data
const DEMO_PJPS = [
  {
    id: 1,
    dealerName: "Tech Solutions Hub",
    dealerAddress: "123 Business District, Tech City",
    status: "active",
    latitude: 28.7041,
    longitude: 77.1025,
    targetSales: 250000,
    progressPercentage: 65,
    priority: "high"
  },
  {
    id: 2,
    dealerName: "Innovation Center",
    dealerAddress: "456 Innovation Park, Metro City", 
    status: "planned",
    latitude: 28.6139,
    longitude: 77.2090,
    targetSales: 180000,
    progressPercentage: 30,
    priority: "medium"
  },
  {
    id: 3,
    dealerName: "Future Electronics",
    dealerAddress: "789 Digital Avenue, Cyber City",
    status: "active",
    latitude: 28.5355,
    longitude: 77.3910,
    targetSales: 320000,
    progressPercentage: 78,
    priority: "high"
  }
];

interface DailyTasksBellComponentProps {
  pendingCount: number;
  onBellPress: () => void;
}

const DailyTasksBellComponent: React.FC<DailyTasksBellComponentProps> = ({ pendingCount, onBellPress }) => {
  const [pulseAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    if (pendingCount > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [pendingCount]);

  return (
    <TouchableOpacity onPress={onBellPress} style={styles.bellContainer}>
      <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
        <LinearGradient
          colors={pendingCount > 0 ? ['#f59e0b', '#d97706'] : ['#374151', '#4b5563']}
          style={styles.bellGradient}
        >
          <MaterialCommunityIcons 
            name={pendingCount > 0 ? "bell-ring" : "bell-outline"} 
            size={22} 
            color="white" 
          />
        </LinearGradient>
      </Animated.View>
      {pendingCount > 0 && (
        <View style={styles.bellBadge}>
          <Text style={styles.bellBadgeText}>
            {pendingCount > 99 ? '99+' : pendingCount}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

// SINGLE ROTATING FLIP CLOCK COMPONENT
const SingleFlipClock = ({ pjps, onCardPress }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipAnim] = useState(new Animated.Value(0));
  const [cardRotation] = useState(new Animated.Value(0));
  const [isFlipping, setIsFlipping] = useState(false);

  const currentPjp = pjps[currentIndex] || pjps[0];

  useEffect(() => {
    // Auto-rotate every 4 seconds
    const interval = setInterval(() => {
      if (!isFlipping) {
        flipToNext();
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex, isFlipping]);

  const flipToNext = () => {
    setIsFlipping(true);
    
    // Flip animation
    Animated.sequence([
      Animated.timing(cardRotation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardRotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFlipping(false);
    });

    // Change card in the middle of flip
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % pjps.length);
    }, 300);
  };

  const flipToPrevious = () => {
    setIsFlipping(true);
    
    Animated.sequence([
      Animated.timing(cardRotation, {
        toValue: -1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(cardRotation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsFlipping(false);
    });

    setTimeout(() => {
      setCurrentIndex((prev) => (prev - 1 + pjps.length) % pjps.length);
    }, 300);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'planned': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const handleCardPress = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(50);
    }
    onCardPress?.(currentPjp);
  };

  return (
    <View style={styles.flipClockContainer}>
      {/* Chrome Frame */}
      <LinearGradient
        colors={['#f8fafc', '#e2e8f0', '#cbd5e1', '#94a3b8']}
        style={styles.chromeFrame}
      >
        {/* Chrome Stand */}
        <View style={styles.chromeStand} />
        
        {/* Rotating Card Container */}
        <TouchableOpacity activeOpacity={0.9} onPress={handleCardPress}>
          <Animated.View 
            style={[
              styles.flipCardContainer,
              {
                transform: [
                  {
                    rotateX: cardRotation.interpolate({
                      inputRange: [-1, 0, 1],
                      outputRange: ['-90deg', '0deg', '90deg'],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* White Flip Card */}
            <View style={styles.flipCard}>
              {/* Mission Number Display */}
              <View style={styles.numberDisplay}>
                <Text style={styles.missionNumber}>
                  {String(currentPjp.id).padStart(2, '0')}
                </Text>
                <View style={styles.flipHinge} />
              </View>

              {/* Dealer Name */}
              <Text style={styles.dealerName}>{currentPjp.dealerName}</Text>

              {/* Progress Display */}
              <View style={styles.progressDisplay}>
                <Text style={styles.progressNumber}>
                  {String(currentPjp.progressPercentage).padStart(2, '0')}
                </Text>
                <Text style={styles.percentSign}>%</Text>
              </View>

              {/* Status Indicator */}
              <View style={styles.statusContainer}>
                <View style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(currentPjp.status) }
                ]} />
                <Text style={[
                  styles.statusText, 
                  { color: getStatusColor(currentPjp.status) }
                ]}>
                  {currentPjp.status.toUpperCase()}
                </Text>
              </View>

              {/* Target Amount */}
              <View style={styles.targetContainer}>
                <Text style={styles.targetLabel}>TARGET</Text>
                <Text style={styles.targetAmount}>
                  ₹{(currentPjp.targetSales / 1000).toFixed(0)}K
                </Text>
              </View>

              {/* Address */}
              <View style={styles.addressContainer}>
                <MaterialCommunityIcons name="map-marker" size={12} color="#6b7280" />
                <Text style={styles.addressText} numberOfLines={1}>
                  {currentPjp.dealerAddress}
                </Text>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>

        {/* Chrome Side Arms */}
        <View style={styles.chromeArmLeft} />
        <View style={styles.chromeArmRight} />
      </LinearGradient>

      {/* Navigation Controls */}
      <View style={styles.controls}>
        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={flipToPrevious}
          disabled={isFlipping}
        >
          <MaterialCommunityIcons name="chevron-left" size={20} color="#06b6d4" />
        </TouchableOpacity>

        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {pjps.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.paginationDot,
                {
                  backgroundColor: index === currentIndex ? '#06b6d4' : '#64748b',
                  transform: [{ scale: index === currentIndex ? 1.2 : 1 }],
                }
              ]}
              onPress={() => {
                setCurrentIndex(index);
                flipToNext();
              }}
            />
          ))}
        </View>

        <TouchableOpacity 
          style={styles.controlButton} 
          onPress={flipToNext}
          disabled={isFlipping}
        >
          <MaterialCommunityIcons name="chevron-right" size={20} color="#06b6d4" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomePage = () => {
  const { top } = useSafeAreaInsets();
  const navigation = useNavigation();
  const {
    user,
    attendanceStatus,
    setAttendanceStatus,
    dailyTasks,
    setData,
    setLoading,
    isLoading
  } = useAppStore();

  const [connectionStatus, setConnectionStatus] = useState(true);
  const [lastSync, setLastSync] = useState(new Date());
  const [headerAnimation] = useState(new Animated.Value(0));
  const [cardAnimations] = useState(new Animated.Value(0));
  const [pjps, setPjps] = useState(DEMO_PJPS);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent', true);
      StatusBar.setTranslucent(true);
    }

    // Start animations
    Animated.stagger(300, [
      Animated.timing(headerAnimation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(cardAnimations, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Connection status simulation
    const interval = setInterval(() => {
      setConnectionStatus(Math.random() > 0.1);
      setLastSync(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handlePunchIn = useCallback(() => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }
    setAttendanceStatus("in");
  }, [setAttendanceStatus]);

  const handlePunchOut = useCallback(() => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate([0, 100, 50, 100]);
    } else {
      Vibration.vibrate([0, 100, 50, 100]);
    }
    setAttendanceStatus("out");
  }, [setAttendanceStatus]);

  const handleCreatePJP = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(30);
    }
    navigation.navigate('AddPJPForm');
  };

  const handleDailyTasksPress = () => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(30);
    }
    navigation.navigate('DailyTasksForm');
  };

  const handlePJPCardPress = (pjp) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(50);
    }
    navigation.navigate('Journey', { selectedPJP: pjp });
  };

  const pendingTasks = dailyTasks?.filter(task => 
    task.status !== 'Completed' && task.status !== 'completed'
  ) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      {/* Enhanced Header */}
      <Animated.View 
        style={[
          styles.headerContainer, 
          { 
            paddingTop: top + 10,
            opacity: headerAnimation,
            transform: [{
              translateY: headerAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [-50, 0],
              }),
            }],
          }
        ]}
      >
        <LinearGradient
          colors={['#0f172a', '#1e293b', 'transparent']}
          style={styles.headerGradient}
        >
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <View style={styles.headerContent}>
              <View style={styles.headerLeft}>
                <TouchableOpacity style={styles.logoContainer}>
                  <LinearGradient
                    colors={['#06b6d4', '#0891b2']}
                    style={styles.logoGradient}
                  >
                    <MaterialCommunityIcons name="radar" size={28} color="white" />
                  </LinearGradient>
                </TouchableOpacity>
                <View style={styles.headerText}>
                  <Text style={styles.greetingText}>{getGreeting()}</Text>
                  <Text style={styles.userName}>
                    {user?.firstName || 'Agent'} {user?.lastName || ''}
                  </Text>
                  <Text style={styles.companyName}>
                    {user?.company || "Field Operations HQ"}
                  </Text>
                </View>
              </View>

              <View style={styles.headerRight}>
                <DailyTasksBellComponent 
                  pendingCount={pendingTasks.length} 
                  onBellPress={handleDailyTasksPress} 
                />
                <TouchableOpacity style={styles.avatarContainer}>
                  <LinearGradient
                    colors={['#06b6d4', '#0891b2']}
                    style={styles.avatarGradient}
                  >
                    <Text style={styles.avatarText}>
                      {user?.firstName?.[0] || 'A'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </BlurView>
        </LinearGradient>
      </Animated.View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Connection Status */}
        <Animated.View 
          style={[
            styles.connectionContainer,
            {
              opacity: cardAnimations,
              transform: [{
                translateY: cardAnimations.interpolate({
                  inputRange: [0, 1],
                  outputRange: [30, 0],
                }),
              }],
            }
          ]}
        >
          <BlurView intensity={15} tint="dark" style={styles.connectionBlur}>
            <View style={styles.connectionContent}>
              <View style={[
                styles.connectionDot, 
                connectionStatus ? styles.dotOnline : styles.dotOffline
              ]} />
              <Text style={styles.connectionText}>
                {connectionStatus ? 'MISSION CONTROL ONLINE' : 'OFFLINE MODE'}
              </Text>
              <Text style={styles.lastSyncText}>
                • {lastSync.toLocaleTimeString()}
              </Text>
            </View>
          </BlurView>
        </Animated.View>

        {/* Enhanced Attendance Panel */}
        <Animated.View 
          style={[
            styles.attendanceContainer,
            {
              opacity: cardAnimations,
              transform: [{
                scale: cardAnimations.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.9, 1],
                }),
              }],
            }
          ]}
        >
          <BlurView intensity={25} tint="dark" style={styles.attendanceBlur}>
            <LinearGradient
              colors={['rgba(15, 23, 42, 0.9)', 'rgba(30, 41, 59, 0.8)']}
              style={styles.attendanceGradient}
            >
              <View style={styles.attendanceContent}>
                <View style={styles.dutyStatusSection}>
                  <Text style={styles.dutyStatusLabel}>DUTY STATUS</Text>
                  <View style={styles.dutyStatusRow}>
                    <View style={[
                      styles.statusIndicator,
                      attendanceStatus === 'in' ? styles.statusActive : styles.statusStandby
                    ]} />
                    <Text style={styles.dutyStatusText}>
                      {attendanceStatus === 'in' ? 'ON ACTIVE DUTY' : 'STANDBY MODE'}
                    </Text>
                  </View>
                  <Text style={styles.dutyTime}>
                    {new Date().toLocaleTimeString()}
                  </Text>
                </View>

                <TouchableOpacity
                  style={[
                    styles.attendanceButton,
                    attendanceStatus === 'in' ? styles.punchOutButton : styles.punchInButton
                  ]}
                  onPress={attendanceStatus === 'in' ? handlePunchOut : handlePunchIn}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={attendanceStatus === 'in' 
                      ? ['#ef4444', '#dc2626'] 
                      : ['#10b981', '#059669']
                    }
                    style={styles.buttonGradient}
                  >
                    <MaterialCommunityIcons 
                      name={attendanceStatus === 'in' ? "logout" : "login"} 
                      size={20} 
                      color="white" 
                    />
                    <Text style={styles.buttonText}>
                      {attendanceStatus === 'in' ? 'PUNCH OUT' : 'PUNCH IN'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* PJP Section Header */}
        <Animated.View 
          style={[
            styles.pjpSectionHeader,
            {
              opacity: cardAnimations,
              transform: [{
                translateY: cardAnimations.interpolate({
                  inputRange: [0, 1],
                  outputRange: [50, 0],
                }),
              }],
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleRow}>
              <LinearGradient
                colors={['#06b6d4', '#0891b2']}
                style={styles.sectionIconBg}
              >
                <MaterialCommunityIcons name="clock-time-four" size={24} color="white" />
              </LinearGradient>
              <View>
                <Text style={styles.sectionTitle}>Mission Clock</Text>
                <Text style={styles.pjpCount}>
                  {pjps?.length || 0} {(pjps?.length || 0) === 1 ? 'mission' : 'missions'} rotating
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* SINGLE ROTATING FLIP CLOCK */}
        <Animated.View 
          style={[
            styles.flipClockSection,
            {
              opacity: cardAnimations,
              transform: [{
                translateY: cardAnimations.interpolate({
                  inputRange: [0, 1],
                  outputRange: [80, 0],
                }),
              }],
            }
          ]}
        >
          <SingleFlipClock pjps={pjps} onCardPress={handlePJPCardPress} />
        </Animated.View>
      </ScrollView>

      {/* Enhanced Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePJP}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={['#06b6d4', '#0891b2']}
          style={styles.fabGradient}
        >
          <MaterialCommunityIcons name="plus" size={28} color="white" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerGradient: {
    paddingBottom: 20,
  },
  headerBlur: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    marginRight: 15,
  },
  logoGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  headerText: {
    flex: 1,
  },
  greetingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#06b6d4',
    letterSpacing: 0.5,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 2,
  },
  companyName: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  bellContainer: {
    position: 'relative',
  },
  bellGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bellBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  bellBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  avatarContainer: {},
  avatarGradient: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 140,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  connectionContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  connectionBlur: {
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  connectionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOnline: {
    backgroundColor: '#10b981',
  },
  dotOffline: {
    backgroundColor: '#ef4444',
  },
  connectionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: 1,
  },
  lastSyncText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  attendanceContainer: {
    marginBottom: 24,
  },
  attendanceBlur: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.2)',
  },
  attendanceGradient: {
    padding: 20,
  },
  attendanceContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dutyStatusSection: {
    flex: 1,
  },
  dutyStatusLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  dutyStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  statusActive: {
    backgroundColor: '#10b981',
  },
  statusStandby: {
    backgroundColor: '#f59e0b',
  },
  dutyStatusText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  dutyTime: {
    fontSize: 12,
    color: '#94a3b8',
    fontWeight: '500',
  },
  attendanceButton: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  punchInButton: {},
  punchOutButton: {},
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'white',
    letterSpacing: 0.5,
  },
  pjpSectionHeader: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  sectionIconBg: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 0.5,
  },
  pjpCount: {
    fontSize: 14,
    color: '#06b6d4',
    fontWeight: '600',
    marginTop: 2,
  },
  flipClockSection: {
    alignItems: 'center',
    marginVertical: 20,
  },

  // SINGLE FLIP CLOCK STYLES
  flipClockContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  chromeFrame: {
    borderRadius: 20,
    padding: 8,
    elevation: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 25,
    position: 'relative',
  },
  chromeStand: {
    position: 'absolute',
    bottom: -15,
    left: '40%',
    right: '40%',
    height: 20,
    backgroundColor: '#9ca3af',
    borderRadius: 10,
    elevation: 10,
  },
  flipCardContainer: {
    width: width - 80,
    height: 240,
  },
  flipCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    elevation: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    justifyContent: 'space-between',
  },
  numberDisplay: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  missionNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'sans-serif-condensed',
    letterSpacing: -2,
  },
  flipHinge: {
    position: 'absolute',
    bottom: -8,
    left: '20%',
    right: '20%',
    height: 2,
    backgroundColor: '#9ca3af',
    borderRadius: 1,
  },
  dealerName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  progressNumber: {
    fontSize: 36,
    fontWeight: '900',
    color: '#111827',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica-Bold' : 'sans-serif-condensed',
    letterSpacing: -1,
  },
  percentSign: {
    fontSize: 20,
    fontWeight: '700',
    color: '#6b7280',
    marginLeft: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  targetContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  targetLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 4,
  },
  targetAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  addressText: {
    fontSize: 11,
    color: '#6b7280',
    marginLeft: 4,
    flex: 1,
    textAlign: 'center',
  },
  chromeArmLeft: {
    position: 'absolute',
    left: -12,
    top: '30%',
    width: 8,
    height: '40%',
    backgroundColor: '#cbd5e1',
    borderRadius: 4,
    elevation: 12,
  },
  chromeArmRight: {
    position: 'absolute',
    right: -12,
    top: '30%',
    width: 8,
    height: '40%',
    backgroundColor: '#cbd5e1',
    borderRadius: 4,
    elevation: 12,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  controlButton: {
    padding: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 182, 212, 0.1)',
  },
  pagination: {
    flexDirection: 'row',
    gap: 8,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    borderRadius: 28,
    elevation: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default HomePage;