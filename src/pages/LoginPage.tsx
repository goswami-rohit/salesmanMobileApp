// src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  HelperText,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppStore, AppStackParamList, fetchUserById, BASE_URL } from '../components/ReusableConstants';
import LiquidGlassCard from '../components/LiquidGlassCard';

type LoginScreenProps = NativeStackScreenProps<AppStackParamList, 'Login'>;

// Main Component
export default function LoginPage({ route }: LoginScreenProps) {
  const { setIsAuthenticated, setUser } = useAppStore();
  const theme = useTheme();

  const [formData, setFormData] = useState({
    loginId: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
        // You'll need to fetch the full user profile after a successful login
        const fullUser = await fetchUserById(data.user.id); // Assuming you have a fetch function
        setUser(fullUser);

        await AsyncStorage.setItem('userId', data.user.id.toString());
        setIsAuthenticated(true); // <-- Update global state
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
    <View className="flex-1" style={{ backgroundColor: theme.colors.background }}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center p-5"
      >
        {/* Header - LIQUID GLASS */}
        <LiquidGlassCard className="mx-0 mb-8 shadow-2xl" intensity={20}>
          <View className="items-center">
            <View 
              className="w-16 h-16 rounded-full items-center justify-center mb-4"
              style={{ backgroundColor: theme.colors.primary }}
            >
              <MaterialCommunityIcons 
                name="account-lock" 
                size={40} 
                color={theme.colors.onPrimary} 
              />
            </View>
            <Text 
              className="text-2xl font-bold mb-1"
              style={{ 
                color: theme.colors.primary,
                letterSpacing: 1 
              }}
            >
              Salesman Mobile App
            </Text>
          </View>
        </LiquidGlassCard>

        {/* Login Card - LIQUID GLASS */}
        <LiquidGlassCard className="mx-0 shadow-2xl" intensity={18}>
          <View className="gap-5">
            <TextInput
              label="Employee ID"
              value={formData.loginId}
              onChangeText={(text) => handleInputChange('loginId', text)}
              disabled={isLoading}
              left={<TextInput.Icon icon="account" />}
              className="bg-transparent"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            
            <TextInput
              label="Password"
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
              secureTextEntry
              disabled={isLoading}
              left={<TextInput.Icon icon="lock" />}
              className="bg-transparent"
            />

            {error ? (
              <HelperText type="error" visible={!!error}>
                {error}
              </HelperText>
            ) : null}

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              className="mt-2 py-1 rounded-xl"
              style={{ backgroundColor: theme.colors.primary }}
              labelStyle={{ color: theme.colors.onPrimary }}
            >
              {isLoading ? 'INITIALIZING...' : 'LOG IN'}
            </Button>

            <View className="items-center mt-2">
              <Text 
                className="text-xs" 
                style={{ color: theme.colors.onSurfaceVariant }}
              >
                Use your official credentials
              </Text>
            </View>
          </View>
        </LiquidGlassCard>
      </KeyboardAvoidingView>
    </View>
  );
}