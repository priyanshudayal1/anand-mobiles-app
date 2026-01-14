import {Stack, useRouter, useSegments} from "expo-router";
import {useEffect, useState} from "react";
import {LogBox, View, ActivityIndicator} from "react-native";
import "../index.css";
import {useAuthStore} from "../store/useAuth";
import {useTheme} from "../store/useTheme";
import ThemeProvider from "../components/ThemeProvider";

// Suppress SafeAreaView deprecation warning from expo-router
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

function RootLayoutNav() {
  const {isAuthenticated, isInitialized: authInitialized, initialize: initAuth} = useAuthStore();
  const {colors, isInitialized: themeInitialized} = useTheme();
  const segments = useSegments();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    setIsMounted(true);
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isMounted || !themeInitialized || !authInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated and not in auth group
      router.replace("/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, segments, isMounted, themeInitialized, authInitialized]);

  // Show loading while theme or auth is initializing
  if (!isMounted || !themeInitialized || !authInitialized) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{headerShown: false}}>
      <Stack.Screen name="(auth)" options={{headerShown: false}} />
      <Stack.Screen name="(tabs)" options={{headerShown: false}} />
      <Stack.Screen name="index" options={{headerShown: false}} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
