import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { LogBox } from "react-native";
import "../index.css";
import { useAuthStore } from "../store/useAuth";

// Suppress SafeAreaView deprecation warning from expo-router
LogBox.ignoreLogs(["SafeAreaView has been deprecated"]);

export default function RootLayout() {
  const { isAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated and not in auth group
      router.replace("/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, segments, isMounted]);

  if (!isMounted) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
