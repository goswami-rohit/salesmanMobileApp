// src/pages/LoginPage.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StatusBar,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  HelperText,
  useTheme,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { useAppStore, AppStackParamList, fetchUserById, BASE_URL } from '../components/ReusableConstants';

type LoginScreenProps = NativeStackScreenProps<AppStackParamList, 'Login'>;

// Main Component
export default function LoginPage({ route }: LoginScreenProps) {
  const { setIsAuthenticated, setUser } = useAppStore(); // <-- Get setters from Zustand
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
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.background} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: theme.colors.surfaceVariant }]}>
          <View style={[styles.logoContainer, { backgroundColor: theme.colors.primary }]}>
            <MaterialCommunityIcons name="account-lock" size={40} color={theme.colors.onPrimary} />
          </View>
          <Text style={[styles.title, { color: theme.colors.primary }]}>Salesman Mobile App</Text>

        </View>

        {/* Login Card */}
        <Card style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={4}>
          <Card.Content style={styles.cardContent}>
            <TextInput
              label="Employee ID"
              value={formData.loginId}
              onChangeText={(text) => handleInputChange('loginId', text)}
              disabled={isLoading}
              left={<TextInput.Icon icon="account" />}
              style={styles.textInput}
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
              style={styles.textInput}
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
              style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
              labelStyle={{ color: theme.colors.onPrimary }}
            >
              {isLoading ? 'INITIALIZING...' : 'LOG IN'}
            </Button>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.colors.onSurfaceVariant }]}>
                Use your official credentials
              </Text>
            </View>
          </Card.Content>
        </Card>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  card: {
    borderRadius: 16,
  },
  cardContent: {
    gap: 20,
    padding: 24,
  },
  textInput: {
    backgroundColor: 'transparent',
  },
  loginButton: {
    borderRadius: 12,
    marginTop: 10,
    paddingVertical: 4,
  },
  footer: {
    alignItems: 'center',
    marginTop: 10,
  },
  footerText: {
    fontSize: 12,
  },
});