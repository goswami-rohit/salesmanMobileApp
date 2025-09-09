import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider as PaperProvider } from "react-native-paper";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import AppDrawer from "./components/SideDrawer";
import LoginPage from "./pages/LoginPage";
import theme from "./theme/paperTheme";

export default function App() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function checkAuth() {
      try {
        // Quick local check
        const stored = await AsyncStorage.getItem("isAuthenticated");
        const userId = await AsyncStorage.getItem("userId");

        if (stored === "true" && userId) {
          // Optional: verify server-side to avoid stale tokens / deleted user
          try {
            const resp = await fetch(`/api/user/${userId}`);
            if (resp.ok) {
              // server returned a valid user
              const json = await resp.json().catch(() => null);
              if (json?.user && mounted) {
                setIsAuthenticated(true);
              } else if (mounted) {
                // server didn't return user — treat as logged out
                setIsAuthenticated(false);
                await AsyncStorage.multiRemove(["user", "isAuthenticated", "userId"]);
              }
            } else {
              // backend says no -> clear local auth
              setIsAuthenticated(false);
              await AsyncStorage.multiRemove(["user", "isAuthenticated", "userId"]);
            }
          } catch (err) {
            // network error: best-effort local auth (you can flip policy)
            console.warn("Auth verify failed, falling back to local auth", err);
            if (mounted) setIsAuthenticated(true);
          }
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
    // splash / loader while checking auth
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <PaperProvider theme={theme}>
            <View style={styles.center}>
              <ActivityIndicator size="large" />
            </View>
          </PaperProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <PaperProvider theme={theme}>
          <NavigationContainer>
            {isAuthenticated ? (
              // Protected app — your drawer should include HomePage route
              <AppDrawer />
            ) : (
              // Public stack: show the login page (replace with stack if you have register/forgot)
              <LoginPage />
            )}
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
