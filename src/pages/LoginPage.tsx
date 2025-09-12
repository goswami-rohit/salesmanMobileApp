// src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Vibration,
  Dimensions,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  HelperText,
  Avatar,
  useTheme
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { AppStackParamList, BASE_URL } from '../components/ReusableConstants';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type LoginScreenProps = NativeStackScreenProps<AppStackParamList, 'Login'>;

// Enhanced Particle Effect Component
const LoginParticleEffect: React.FC = () => {
  const particles = useRef([...Array(12)].map(() => ({
    x: new Animated.Value(Math.random() * screenWidth),
    y: new Animated.Value(Math.random() * screenHeight),
    opacity: new Animated.Value(Math.random() * 0.5 + 0.1),
    scale: new Animated.Value(Math.random() * 0.5 + 0.5),
  }))).current;

  useEffect(() => {
    const animations = particles.map((particle, index) => 
      Animated.loop(
        Animated.parallel([
          Animated.timing(particle.x, {
            toValue: Math.random() * screenWidth,
            duration: 15000 + index * 1000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(particle.y, {
            toValue: Math.random() * screenHeight,
            duration: 12000 + index * 800,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(particle.opacity, {
            toValue: Math.random() * 0.3 + 0.1,
            duration: 8000 + index * 500,
            easing: Easing.inOut(Easing.sine),
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

// Enhanced Animated Input Component
const AnimatedTextInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  disabled?: boolean;
  icon: string;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}> = ({ label, value, onChangeText, secureTextEntry, disabled, icon, keyboardType, autoCapitalize }) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.5,
          duration: 3000,
          easing: Easing.inOut(Easing.sine),
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);

  const handleFocus = () => {
    Animated.timing(focusAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = () => {
    Animated.timing(focusAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.inputContainer,
        {
          borderColor: focusAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['rgba(6, 182, 212, 0.3)', 'rgba(6, 182, 212, 0.8)'],
          }),
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0.5, 1],
            outputRange: [0.1, 0.3],
          }),
        },
      ]}
    >
      <BlurView intensity={15} tint="dark" style={styles.inputBlur}>
        <TextInput
          label={label}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          disabled={disabled}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={handleFocus}
          onBlur={handleBlur}
          left={<TextInput.Icon icon={icon} />}
          style={styles.textInput}
          theme={{
            colors: {
              primary: '#06b6d4',
              onSurfaceVariant: '#94a3b8',
              surfaceVariant: 'rgba(51, 65, 85, 0.8)',
            },
          }}
        />
      </BlurView>
    </Animated.View>
  );
};

// Enhanced Login Button Component
const AnimatedLoginButton: React.FC<{
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
}> = ({ onPress, loading, disabled }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.02,
            duration: 2000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1500,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0.5,
            duration: 1500,
            easing: Easing.inOut(Easing.sine),
            useNativeDriver: false,
          }),
        ])
      ).start();
    }
  }, [disabled]);

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      Vibration.vibrate(50);
    }
    onPress();
  };

  return (
    <Animated.View
      style={[
        styles.loginButtonContainer,
        {
          transform: [{ scale: pulseAnim }],
          shadowOpacity: glowAnim.interpolate({
            inputRange: [0.5, 1],
            outputRange: [0.3, 0.6],
          }),
        },
      ]}
    >
      <BlurView intensity={20} tint="dark" style={styles.loginButtonBlur}>
        <LinearGradient
          colors={[
            'rgba(6, 182, 212, 0.8)',
            'rgba(8, 145, 178, 0.9)',
            'rgba(14, 116, 144, 1)',
          ]}
          style={styles.loginButtonGradient}
        >
          <Button
            mode="contained"
            onPress={handlePress}
            loading={loading}
            disabled={disabled}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
            buttonColor="transparent"
          >
            {loading ? 'INITIALIZING NEURAL LINK...' : 'ESTABLISH CONNECTION'}
          </Button>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
};

// Main Component
export default function LoginPage({ route }: LoginScreenProps) {
  const { onLoginSuccess } = route.params;
  const theme = useTheme();

  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Animation refs
  const containerAnim = useRef(new Animated.Value(0)).current;
  const headerAnim = useRef(new Animated.Value(-100)).current;
  const cardAnim = useRef(new Animated.Value(50)).current;
  const scanLineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.stagger(200, [
      Animated.timing(containerAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(headerAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(cardAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Scanning line animation
    Animated.loop(
      Animated.timing(scanLineAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleInputChange = (name: 'loginId' | 'password', value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleLogin = async () => {
    if (!formData.loginId || !formData.password) {
      setError('Please enter both Login ID and password');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      const response = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginId: formData.loginId,
          password: formData.password
        })
      });
      if (response.ok) {
        const data = await response.json();
        await AsyncStorage.setItem('user', JSON.stringify(data.user));
        await AsyncStorage.setItem('isAuthenticated', 'true');
        await AsyncStorage.setItem('userId', data.user.id.toString());
        onLoginSuccess();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid credentials');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: containerAnim }]}>
      <StatusBar barStyle="light-content" backgroundColor="#0f172a" />
      
      {/* Background Effects */}
      <LinearGradient
        colors={[
          '#0f172a',
          '#1e293b',
          '#334155',
        ]}
        style={styles.backgroundGradient}
      />
      
      {/* Particle Effects */}
      <LoginParticleEffect />

      {/* Scanning Line Effect */}
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
                outputRange: [-50, screenHeight + 50],
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

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Enhanced Header */}
        <Animated.View
          style={[
            styles.header,
            { transform: [{ translateY: headerAnim }] }
          ]}
        >
          <BlurView intensity={20} tint="dark" style={styles.headerBlur}>
            <LinearGradient
              colors={['rgba(6, 182, 212, 0.2)', 'rgba(6, 182, 212, 0.1)']}
              style={styles.headerGradient}
            >
              <Animated.View style={styles.logoContainer}>
                <LinearGradient
                  colors={['#06b6d4', '#0891b2']}
                  style={styles.logoGradient}
                >
                  <MaterialCommunityIcons name="brain" size={40} color="white" />
                </LinearGradient>
              </Animated.View>
              
              <Text style={styles.title}>NEURAL CRM SYSTEM</Text>
              <Text style={styles.subtitle}>
                Establishing secure connection to command center
              </Text>
              
              {/* Status indicators */}
              <View style={styles.statusContainer}>
                <View style={styles.statusDot} />
                <Text style={styles.statusText}>SYSTEM ONLINE</Text>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>

        {/* Enhanced Login Card */}
        <Animated.View
          style={[
            styles.cardContainer,
            { transform: [{ translateY: cardAnim }] }
          ]}
        >
          <BlurView intensity={25} tint="dark" style={styles.cardBlur}>
            <LinearGradient
              colors={[
                'rgba(15, 23, 42, 0.95)',
                'rgba(30, 41, 59, 0.9)',
                'rgba(51, 65, 85, 0.85)',
              ]}
              style={styles.cardGradient}
            >
              <View style={styles.cardContent}>
                <AnimatedTextInput
                  label="Agent ID / Neural Link"
                  value={formData.loginId}
                  onChangeText={(text) => handleInputChange('loginId', text)}
                  disabled={isLoading}
                  icon="account-circle"
                  autoCapitalize="none"
                  keyboardType="email-address"
                />

                <AnimatedTextInput
                  label="Security Passphrase"
                  value={formData.password}
                  onChangeText={(text) => handleInputChange('password', text)}
                  secureTextEntry
                  disabled={isLoading}
                  icon="shield-lock"
                />

                {error ? (
                  <Animated.View style={styles.errorContainer}>
                    <BlurView intensity={10} tint="dark" style={styles.errorBlur}>
                      <LinearGradient
                        colors={['rgba(239, 68, 68, 0.2)', 'rgba(220, 38, 38, 0.1)']}
                        style={styles.errorGradient}
                      >
                        <MaterialCommunityIcons name="alert-circle" size={16} color="#ef4444" />
                        <Text style={styles.errorText}>{error}</Text>
                      </LinearGradient>
                    </BlurView>
                  </Animated.View>
                ) : null}

                <AnimatedLoginButton
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading}
                />

                <View style={styles.footer}>
                  <Text style={styles.footerText}>
                    Use your neural interface credentials
                  </Text>
                  <Text style={styles.footerSubText}>
                    Agent ID or Neural Link • Security Passphrase from command center
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </KeyboardAvoidingView>
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
  particleContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  particle: {
    position: 'absolute',
    width: 2,
    height: 2,
    borderRadius: 1,
    backgroundColor: '#06b6d4',
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 3,
    elevation: 3,
  },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 3,
    zIndex: 2,
    pointerEvents: 'none',
  },
  scanLineGradient: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    zIndex: 3,
  },
  header: {
    marginBottom: 30,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerBlur: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 16,
  },
  logoGradient: {
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#06b6d4',
    marginBottom: 8,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
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
  cardContainer: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  cardBlur: {
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.3)',
    overflow: 'hidden',
  },
  cardGradient: {
    padding: 24,
  },
  cardContent: {
    gap: 20,
  },
  inputContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  inputBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  loginButtonContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#06b6d4',
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
  },
  loginButtonBlur: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  loginButtonGradient: {
    borderRadius: 16,
  },
  loginButton: {
    backgroundColor: 'transparent',
    borderRadius: 16,
    paddingVertical: 8,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
    color: 'white',
  },
  errorContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  errorBlur: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    overflow: 'hidden',
  },
  errorGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  footerSubText: {
    fontSize: 10,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 14,
  },
});