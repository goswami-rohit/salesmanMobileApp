import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppDrawer from "./components/SideDrawer";
import LoginPage from "./pages/LoginPage";
import theme from "./theme/paperTheme";

import { AppStackParamList } from './components/ReusableConstants';

// Create the navigator with the defined types
const Stack = createNativeStackNavigator<AppStackParamList>();

// Enhanced Loading Screen Component
const LoadingScreen = () => (
  <View style={styles.loadingContainer}>
    <LinearGradient
      colors={[
        '#0f172a',
        '#1e293b',
        '#334155',
      ]}
      style={styles.loadingGradient}
    >
      <View style={styles.loadingContent}>
        <ActivityIndicator 
          size="large" 
          color="#06b6d4"
          style={styles.spinner}
        />
        {/* You could add your app logo here */}
      </View>
    </LinearGradient>
  </View>
);

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Enhanced auth-checking logic with better error handling
  useEffect(() => {
    let mounted = true;
    
    async function checkAuth() {
      try {
        const stored = await AsyncStorage.getItem("isAuthenticated");
        if (stored === "true") {
          if (mounted) setIsAuthenticated(true);
        } else if (mounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) {
          // Small delay to prevent flash
          setTimeout(() => setIsCheckingAuth(false), 500);
        }
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isCheckingAuth) {
    return <LoadingScreen />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                <Stack.Screen name="AppDrawer" component={AppDrawer} />
              ) : (
                <Stack.Screen
                  name="Login"
                  component={LoginPage}
                  initialParams={{ onLoginSuccess: handleLoginSuccess }}
                />
              )}
            </Stack.Navigator>
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
  },
  loadingGradient: {
    flex: 1,
  },
  loadingContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    transform: [{ scale: 1.5 }],
  },
});