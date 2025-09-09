// src/pages/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StatusBar, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Text,
  HelperText,
  Avatar,
  useTheme
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// --- FIX: Import the centralized navigation types ---
import { AppStackParamList } from '../components/ReusableConstants'; 

type LoginScreenProps = NativeStackScreenProps<AppStackParamList, 'Login'>;

export default function LoginPage({ route }: LoginScreenProps) {
  const { onLoginSuccess } = route.params;
  const theme = useTheme(); // Access the theme for colors

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
      const response = await fetch('http://10.0.2.2:8000/api/auth/login', {
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
  
  // Styles are now defined with StyleSheet for reliability with Paper components
  const styles = StyleSheet.create({
      container: {
          flex: 1,
          justifyContent: 'center',
          padding: 16,
          backgroundColor: '#0f172a', // slate-900
      },
      card: {
          backgroundColor: '#1e293b', // slate-800
      },
      header: {
          alignItems: 'center',
          backgroundColor: '#334155', // slate-700
          padding: 24,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
      },
      avatarContainer: {
          width: 64,
          height: 64,
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: 32,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
      },
      title: {
          color: theme.colors.onPrimary,
          fontWeight: 'bold',
      },
      subtitle: {
          color: '#cbd5e1', // slate-300
          marginTop: 4,
      },
      content: {
          padding: 24,
      },
      input: {
          marginBottom: 16,
          backgroundColor: '#334155', // slate-700
      },
      button: {
          marginTop: 8,
          paddingVertical: 6,
      },
      footer: {
          marginTop: 24,
          alignItems: 'center',
      },
      footerText: {
          color: '#94a3b8', // slate-400
      },
      footerSubText: {
          color: '#64748b', // slate-500
          marginTop: 4,
      }
  });

  return (
    <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Avatar.Icon size={48} icon="office-building" color="#e2e8f0" style={{ backgroundColor: 'transparent' }} />
          </View>
          <Text variant="headlineSmall" style={styles.title}>
            Sales CRM
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            Enter your credentials to access the system
          </Text>
        </View>
        <Card.Content style={styles.content}>
          <TextInput
            label="Login ID / Email"
            value={formData.loginId}
            onChangeText={(text) => handleInputChange('loginId', text)}
            disabled={isLoading}
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
            keyboardType="email-address"
            style={styles.input}
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            disabled={isLoading}
            left={<TextInput.Icon icon="lock" />}
            style={styles.input}
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
            style={styles.button}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Use your company-provided credentials</Text>
            <Text style={styles.footerSubText}>
              Login ID or Email • Password from your administrator
            </Text>
          </View>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
}
