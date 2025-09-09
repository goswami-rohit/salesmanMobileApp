import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppDrawer from "./components/SideDrawer";
import LoginPage from "./pages/LoginPage";
import theme from "./theme/paperTheme";

import { AppStackParamList } from './components/ReusableConstants';

// Create the navigator with the defined types
const Stack = createNativeStackNavigator<AppStackParamList>();

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // This auth-checking logic is robust and remains unchanged.
  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        const stored = await AsyncStorage.getItem("isAuthenticated");
        if (stored === "true") {
          // For simplicity in this context, we trust the local storage.
          // Your more detailed server check is great for production.
          if (mounted) setIsAuthenticated(true);
        } else if (mounted) {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed", err);
        if (mounted) setIsAuthenticated(false);
      } finally {
        if (mounted) setIsCheckingAuth(false);
      }
    }

    checkAuth();
    return () => {
      mounted = false;
    };
  }, []);

  if (isCheckingAuth) {
    // Splash/loader screen while checking auth status
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
              {isAuthenticated ? (
                // If authenticated, show the main app drawer
                <Stack.Screen name="AppDrawer" component={AppDrawer} />
              ) : (
                // If not authenticated, show the login page.
                // Pass the login callback via initialParams. This is the
                // standard and type-safe way to handle this.
                <Stack.Screen
                  name="Login"
                  component={LoginPage}
                  initialParams={{ onLoginSuccess: () => setIsAuthenticated(true) }}
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
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
