// src/pages/LoginScreen.tsx
import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { 
  TextInput, 
  Button, 
  Card, 
  Text, 
  HelperText, 
  Avatar 
} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// It's good practice to type your navigation stack
type RootStackParamList = {
  Login: undefined;
  CrmDashboard: undefined;
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: LoginScreenProps) {
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
      const response = await fetch('YOUR_API_ENDPOINT/api/auth/login', {
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
        navigation.navigate('CrmDashboard'); 
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
    // 1. Replaced View with LinearGradient for the background
    <LinearGradient 
      colors={['#EFF6FF', '#E0E7FF']} // from-blue-50 to-indigo-100
      className="flex-1 items-center justify-center p-4"
    >
      <StatusBar barStyle="dark-content" />
      <Card className="w-full max-w-md rounded-xl shadow-xl bg-white">
        
        {/* 2. Added a themed header view inside the card */}
        <View className="items-center bg-blue-600 p-6 rounded-t-xl">
          <View className="w-16 h-16 bg-white/20 rounded-full items-center justify-center mb-4">
            <Avatar.Icon size={48} icon="office-building" color="#1D4ED8" style={{backgroundColor: 'transparent'}}/>
          </View>
          <Text variant="headlineSmall" className="font-bold text-white">
            Sales CRM
          </Text>
          <Text variant="bodyMedium" className="text-blue-200 mt-1">
            Enter your credentials to access the system
          </Text>
        </View>
        
        {/* Card content is now separate from the header */}
        <Card.Content className="p-6">
          <TextInput
            label="Login ID / Email"
            value={formData.loginId}
            onChangeText={(text) => handleInputChange('loginId', text)}
            disabled={isLoading}
            left={<TextInput.Icon icon="account" />}
            autoCapitalize="none"
            keyboardType="email-address"
            className="mb-4 bg-gray-50"
          />

          <TextInput
            label="Password"
            value={formData.password}
            onChangeText={(text) => handleInputChange('password', text)}
            secureTextEntry
            disabled={isLoading}
            left={<TextInput.Icon icon="lock" />}
            className="mb-4 bg-gray-50"
          />

          {error ? (
            <HelperText type="error" visible={!!error} className="mb-2">
              {error}
            </HelperText>
          ) : null}

          {/* 3. Styled button to match the theme color */}
          <Button 
            mode="contained" 
            onPress={handleLogin}
            loading={isLoading}
            disabled={isLoading}
            contentStyle={{ paddingVertical: 6 }}
            className="mt-2 bg-blue-600"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>

          <View className="mt-6 items-center">
            <Text variant="bodyMedium" className="text-gray-700">Use your company-provided credentials</Text>
            <Text variant="bodySmall" className="mt-1 text-gray-500">
              Login ID or Email • Password from your administrator
            </Text>
          </View>
        </Card.Content>
      </Card>
    </LinearGradient>
  );
}