import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { LogBox, View, ActivityIndicator, Platform } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import "../index.css";
import { useAuthStore } from "../store/useAuth";
import { useTheme } from "../store/useTheme";
import {
  useNotificationStore,
  parseNotificationData,
} from "../store/useNotification";
import ThemeProvider from "../components/ThemeProvider";

// Dynamically import expo-notifications to handle Expo Go
let Notifications = null;
try {
  Notifications = require("expo-notifications");
} catch (error) {
  console.log("expo-notifications not available");
}

// Suppress warnings
LogBox.ignoreLogs([
  "SafeAreaView has been deprecated",
  "expo-notifications functionality is not fully supported",
  "Android Push notifications",
]);

function RootLayoutNav() {
  const {
    isAuthenticated,
    isInitialized: authInitialized,
    initialize: initAuth,
  } = useAuthStore();
  const { colors, isInitialized: themeInitialized } = useTheme();
  const {
    registerForPushNotifications,
    addNotificationLocally,
    fetchUnreadCount,
    startRealtimeListener,
    stopRealtimeListener,
  } = useNotificationStore();
  const segments = useSegments();
  const router = useRouter();

  const [isMounted, setIsMounted] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  // Initialize auth on mount
  useEffect(() => {
    setIsMounted(true);
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup push notifications when authenticated
  useEffect(() => {
    if (!isAuthenticated || !authInitialized) {
      // Stop real-time listener when logged out
      stopRealtimeListener();
      return;
    }

    // Register for push notifications (will gracefully handle Expo Go)
    registerForPushNotifications();

    // Start WebSocket real-time listener for notifications
    const initializeRealtimeListener = async () => {
      const userId = await AsyncStorage.getItem("userId");
      if (userId) {
        console.log(
          "🚀 Initializing WebSocket real-time listener on app start",
        );
        startRealtimeListener(userId);
      } else {
        // Fallback to API polling if no userId
        fetchUnreadCount();
      }
    };
    initializeRealtimeListener();

    // Skip notification listeners if not available (Expo Go)
    if (!Notifications) {
      console.log("Notification listeners not available in Expo Go");
      return;
    }

    // Try to setup notification listeners (may not work in Expo Go)
    try {
      // Listen for incoming notifications (foreground)
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("Notification received:", notification);

          // Vibrate and play haptic feedback
          if (Platform.OS !== "web") {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }

          // Parse notification data
          const data = parseNotificationData(notification);

          // Add to local state
          addNotificationLocally({
            id: data.notificationId || Date.now().toString(),
            title: notification.request?.content?.title || "New Notification",
            message: notification.request?.content?.body || "",
            type: data.type,
            order_id: data.orderId,
            status: data.status,
            read: false,
            created_at: new Date().toISOString(),
            icon:
              notification.request?.content?.data?.icon ||
              "notifications-outline",
          });
        });

      // Listen for notification interactions (user taps on notification)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("Notification response:", response);

          const data = parseNotificationData(response.notification);

          // Navigate based on notification type
          if (data.orderId && data.type?.startsWith("order_")) {
            router.push(`/order-tracking/${data.orderId}`);
          } else {
            router.push("/notifications");
          }
        });
    } catch (error) {
      console.log(
        "Notification listeners not available (Expo Go):",
        error.message,
      );
    }

    // Cleanup listeners
    return () => {
      try {
        if (notificationListener.current?.remove) {
          notificationListener.current.remove();
        }
        if (responseListener.current?.remove) {
          responseListener.current.remove();
        }
      } catch (error) {
        console.log("Error cleaning up notification listeners:", error.message);
      }

      // Stop real-time listener when component unmounts or auth changes
      stopRealtimeListener();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authInitialized]);

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
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <RootLayoutNav />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
