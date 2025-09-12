// src/components/PJPFloatingCard.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Platform,
  Alert,
  Vibration,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

import { 
  useAppStore, 
  BASE_URL, 
  LoadingList,
} from '../components/ReusableConstants';

const { width } = Dimensions.get('window');

interface PJPFloatingCardProps {
  onCardPress?: (pjp: any) => void;
  onMapPress?: (pjp: any) => void;
}

const PJPFloatingCard: React.FC<PJPFloatingCardProps> = ({
  onCardPress,
  onMapPress,
}) => {
  const { 
    user, 
    pjps, 
    isLoading, 
    isOnline,
    lastSync,
    setLoading,
    setData,
    updateLastSync 
  } = useAppStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Enhanced Animations
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  const pulseAnim = new Animated.Value(1);
  const glowAnim = new Animated.Value(0.3);
  const cardScaleAnim = new Animated.Value(0.95);

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    // Enhanced entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.3,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleCardPress = (pjp: any) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(50);
    }

    // Enhanced tap animation
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    onCardPress?.(pjp);
  };

  const handleMapPress = (pjp: any) => {
    if (Platform.OS === 'ios') {
      Vibration.vibrate();
    } else {
      Vibration.vibrate(30);
    }
    onMapPress?.(pjp);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return ['#10b981', '#059669'];
      case 'completed': return ['#3b82f6', '#1d4ed8'];
      case 'pending': 
      case 'planned': return ['#f59e0b', '#d97706'];
      case 'cancelled': return ['#ef4444', '#dc2626'];
      default: return ['#6b7280', '#4b5563'];
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return '#10b981';
      case 'completed': return '#3b82f6';
      case 'pending':
      case 'planned': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Enhanced Loading State
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Animated.View style={[styles.loadingSpinner, { transform: [{ scale: glowAnim }] }]}>
          <LinearGradient
            colors={['#06b6d4', '#0891b2']}
            style={styles.loadingGradient}
          >
            <MaterialCommunityIcons name="radar" size={40} color="white" />
          </LinearGradient>
        </Animated.View>
        <Text style={styles.loadingText}>SYNCING MISSION DATA...</Text>
        <View style={styles.loadingBars}>
          {[0, 1, 2].map((i) => (
            <Animated.View 
              key={i}
              style={[
                styles.loadingBar,
                { 
                  transform: [{ 
                    scaleY: glowAnim.interpolate({
                      inputRange: [0.3, 1],
                      outputRange: [0.5, 1.5],
                    }) 
                  }] 
                }
              ]} 
            />
          ))}
        </View>
      </View>
    );
  }

  // Enhanced Empty State
  if (!pjps || pjps.length === 0) {
    return (
      <Animated.View
        style={[
          styles.emptyContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: cardScaleAnim }
            ],
          },
        ]}
      >
        <BlurView intensity={20} tint="dark" style={styles.emptyBlur}>
          <LinearGradient
            colors={['rgba(30, 41, 59, 0.8)', 'rgba(51, 65, 85, 0.6)']}
            style={styles.emptyGradient}
          >
            <Animated.View style={{ transform: [{ scale: glowAnim }] }}>
              <MaterialCommunityIcons name="radar-off" size={64} color="#6b7280" />
            </Animated.View>
            <Text style={styles.emptyText}>NO ACTIVE MISSIONS</Text>
            <Text style={styles.emptySubtext}>
              Agent {user?.firstName || 'Unknown'}, deploy new PJPs to begin operations
            </Text>
          </LinearGradient>
        </BlurView>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: cardScaleAnim },
          ],
        },
      ]}
    >
      <ScrollView 
        horizontal 
        pagingEnabled 
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / (width - 40));
          setCurrentIndex(index);
        }}
        contentContainerStyle={styles.scrollContainer}
      >
        {pjps.map((pjp, index) => (
          <PJPCard 
            key={pjp.id} 
            pjp={pjp} 
            index={index}
            currentIndex={currentIndex}
            onCardPress={handleCardPress}
            onMapPress={handleMapPress}
            getStatusColor={getStatusColor}
            getStatusBadgeColor={getStatusBadgeColor}
            user={user}
            pulseAnim={pulseAnim}
            glowAnim={glowAnim}
          />
        ))}
      </ScrollView>

      {/* Enhanced Pagination Indicators */}
      {pjps.length > 1 && (
        <View style={styles.indicator}>
          {pjps.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setCurrentIndex(index)}
              activeOpacity={0.7}
            >
              <Animated.View
                style={[
                  styles.indicatorDot,
                  {
                    opacity: index === currentIndex ? glowAnim : 0.3,
                    backgroundColor: index === currentIndex ? '#06b6d4' : '#6b7280',
                    transform: [{
                      scale: index === currentIndex ? glowAnim.interpolate({
                        inputRange: [0.3, 1],
                        outputRange: [1, 1.2],
                      }) : 1
                    }]
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}
    </Animated.View>
  );
};

// Individual PJP Card Component
interface PJPCardProps {
  pjp: any;
  index: number;
  currentIndex: number;
  onCardPress: (pjp: any) => void;
  onMapPress: (pjp: any) => void;
  getStatusColor: (status: string) => string[];
  getStatusBadgeColor: (status: string) => string;
  user: any;
  pulseAnim: Animated.Value;
  glowAnim: Animated.Value;
}

const PJPCard: React.FC<PJPCardProps> = ({ 
  pjp, 
  onCardPress, 
  onMapPress, 
  getStatusColor, 
  getStatusBadgeColor, 
  user, 
  pulseAnim, 
  glowAnim 
}) => {
  const dealerName = pjp?.dealerName || pjp?.name || 'Unknown Dealer';
  const dealerAddress = pjp?.dealerAddress || pjp?.location || pjp?.address || 'Location TBD';
  const status = pjp?.status || 'planned';
  const targetSales = pjp?.targetSales || pjp?.target || 0;
  const progressPercentage = pjp?.progressPercentage || pjp?.progress || 0;
  const priority = pjp?.priority || 'medium';

  return (
    <Animated.View style={[styles.cardWrapper, { transform: [{ scale: pulseAnim }] }]}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onCardPress(pjp)}
        style={styles.cardContainer}
      >
        <BlurView intensity={20} tint="dark" style={styles.blurContainer}>
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.9)', 'rgba(30, 41, 59, 0.8)']}
            style={styles.gradientOverlay}
          >
            {/* Status Bar */}
            <LinearGradient
              colors={getStatusColor(status)}
              style={styles.statusBar}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            />

            {/* Header Section */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={styles.missionLabel}>
                  MISSION #{pjp?.id} • FIELD OPS
                </Text>
                <Text style={styles.dealerName}>{dealerName}</Text>
              </View>
              <View style={styles.headerRight}>
                <View style={[styles.statusBadge, { borderColor: getStatusBadgeColor(status) + '50' }]}>
                  <Text style={[styles.statusText, { color: getStatusBadgeColor(status) }]}>
                    {status.toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>

            {/* Agent Info */}
            <View style={styles.agentSection}>
              <MaterialCommunityIcons name="account" size={14} color="#06b6d4" />
              <Text style={styles.agentText}>
                Agent: {user?.firstName} {user?.lastName} • {user?.role || 'Field Agent'}
              </Text>
            </View>

            {/* Address Section */}
            <View style={styles.addressSection}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#06b6d4" />
              <Text style={styles.addressText}>{dealerAddress}</Text>
            </View>

            {/* Map Placeholder */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => onMapPress(pjp)}
              style={styles.mapContainer}
            >
              <LinearGradient
                colors={['rgba(6, 182, 212, 0.1)', 'rgba(6, 182, 212, 0.05)']}
                style={styles.mapGradient}
              >
                <MaterialCommunityIcons name="map" size={40} color="#06b6d4" />
                <Text style={styles.mapText}>TAP TO NAVIGATE</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>MISSION PROGRESS</Text>
                <Text style={styles.progressPercentage}>{progressPercentage}%</Text>
              </View>
              <View style={styles.progressBarContainer}>
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={[styles.progressBar, { width: `${progressPercentage}%` }]}
                />
              </View>
              <View style={styles.targetSection}>
                <Text style={styles.targetLabel}>TARGET</Text>
                <Text style={styles.targetValue}>₹{targetSales.toLocaleString()}</Text>
              </View>
            </View>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <MaterialCommunityIcons name="phone" size={18} color="#10b981" />
                <Text style={styles.actionText}>CONTACT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
                <MaterialCommunityIcons name="clipboard-check" size={18} color="#06b6d4" />
                <Text style={styles.actionText}>REPORT</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.actionButton} 
                activeOpacity={0.7}
                onPress={() => onMapPress(pjp)}
              >
                <MaterialCommunityIcons name="navigation" size={18} color="#f59e0b" />
                <Text style={styles.actionText}>NAVIGATE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContainer: {
    paddingHorizontal: 0,
  },
  cardWrapper: {
    width: width - 40,
    marginHorizontal: 0,
    marginRight: 16,
  },
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  blurContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  gradientOverlay: {
    padding: 0,
  },
  statusBar: {
    height: 4,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingBottom: 8,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    marginLeft: 12,
  },
  missionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  dealerName: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    marginBottom: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  agentSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  agentText: {
    fontSize: 11,
    color: '#cbd5e1',
    marginLeft: 6,
    flex: 1,
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  addressText: {
    fontSize: 14,
    color: '#cbd5e1',
    marginLeft: 8,
    flex: 1,
  },
  mapContainer: {
    height: 120,
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
  },
  mapGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06b6d4',
    marginTop: 8,
    letterSpacing: 1,
  },
  progressSection: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#06b6d4',
    letterSpacing: 1.2,
  },
  progressPercentage: {
    fontSize: 16,
    fontWeight: '700',
    color: '#06b6d4',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: 'rgba(107, 114, 128, 0.3)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  targetSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '600',
  },
  targetValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(75, 85, 99, 0.3)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(107, 114, 128, 0.1)',
  },
  actionText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#d1d5db',
    marginLeft: 4,
    letterSpacing: 0.8,
  },
  indicator: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingSpinner: {
    marginBottom: 16,
  },
  loadingGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#06b6d4',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  loadingBars: {
    flexDirection: 'row',
    gap: 4,
  },
  loadingBar: {
    width: 4,
    height: 20,
    backgroundColor: '#06b6d4',
    borderRadius: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(107, 114, 128, 0.2)',
    borderStyle: 'dashed',
  },
  emptyBlur: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  emptyGradient: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#6b7280',
    marginTop: 16,
    letterSpacing: 1,
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default PJPFloatingCard;