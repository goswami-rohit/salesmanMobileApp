// src/pages/LoginPage.tsx
import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from 'react-native-paper';
import { API_HOST } from '../backendConnections/apiPort';

type User = { id: number; email?: string; firstName?: string | null; lastName?: string | null; role?: string | null; phoneNumber?: string | null; company?: { id: number; companyName: string } | null; };

export default function LoginPage(): React.ReactElement | null {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigation = useNavigation();
  const theme = useTheme();

  // Create styles using theme inside component (memoized)
  const styles = useMemo(() => StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', padding: 16, backgroundColor: theme.colors.background },
    card: { backgroundColor: theme.colors.surface, padding: 20, borderRadius: 12, elevation: 4 },
    title: { fontSize: 22, fontWeight: '700', marginBottom: 12, textAlign: 'center', color: theme.colors.onSurface },
    label: { fontSize: 13, marginTop: 8, marginBottom: 6, color: theme.colors.onSurface },
    input: { borderWidth: 1, borderColor: theme.colors.onSurface, padding: 12, borderRadius: 8, color: theme.colors.onSurface },
    button: { marginTop: 16, padding: 14, backgroundColor: theme.colors.primary, borderRadius: 8, alignItems: 'center' },
    buttonDisabled: { opacity: 0.7 },
    buttonText: { color: theme.colors.onPrimary ?? '#fff', fontWeight: '600' },
    error: { color: theme.colors.error ?? '#ef4444', marginTop: 8 },
    hint: { marginTop: 12, fontSize: 12, color: theme.colors.onSurface, textAlign: 'center' },
  }), [theme]);

  const saveUser = async (user: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(user));
      await AsyncStorage.setItem('isAuthenticated', 'true');
      await AsyncStorage.setItem('userId', String(user.id));
    } catch (e) { console.warn('Failed to save user', e); }
  };

  const handleLogin = async () => {
    if (!loginId.trim() || !password) { setError('Please enter both Login ID and password'); return; }
    setIsLoading(true); setError('');
    try {
      const resp = await fetch(`/api/auth/login`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId: loginId.trim(), password }),
      });
      if (!resp.ok) { const body = await resp.json().catch(() => ({})); setError(body.error || 'Invalid credentials'); setIsLoading(false); return; }
      const json = await resp.json();
      const user: User = json.user;
      if (!user || !user.id) { setError('Login response missing user data'); setIsLoading(false); return; }
      await saveUser(user);

      // Reset navigation into Drawer -> MainTabs -> Home (matches your structure)
      navigation.reset({
        index: 0,
        routes: [
          {
            name: 'Root' as never,
            params: { screen: 'MainTabs', params: { screen: 'Home' } } as any,
          } as any,
        ],
      });
    } catch (err) {
      console.error('Login error', err);
      setError('Network error. Please try again.');
    } finally { setIsLoading(false); }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Sign in</Text>

        <Text style={styles.label}>Employee ID</Text>
        <TextInput style={styles.input} placeholder="e.g. EMP-...." autoCapitalize="none" value={loginId} onChangeText={setLoginId} editable={!isLoading} placeholderTextColor={theme.colors.onSurface} />

        <Text style={styles.label}>Password</Text>
        <TextInput style={styles.input} placeholder="Your password" secureTextEntry value={password} onChangeText={setPassword} editable={!isLoading} placeholderTextColor={theme.colors.onSurface} />

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TouchableOpacity style={[styles.button, isLoading ? styles.buttonDisabled : null]} onPress={handleLogin} disabled={isLoading}>
          {isLoading ? <ActivityIndicator color={theme.colors.onPrimary ?? '#fff'} /> : <Text style={styles.buttonText}>Sign In</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>Use company credentials provided by admin</Text>
      </View>
    </KeyboardAvoidingView>
  );
}
