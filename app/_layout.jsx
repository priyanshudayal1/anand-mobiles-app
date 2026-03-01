import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { LogBox, View, Platform, Image, Animated } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";
import "../index.css";
import { useAuthStore } from "../store/useAuth";
import { useTheme } from "../store/useTheme";
import { useSiteConfig } from "../store/useSiteConfig";
import {
  useNotificationStore,
  parseNotificationData,
} from "../store/useNotification";
import ThemeProvider from "../components/ThemeProvider";
import ToastContainer from "../components/common/ToastContainer";

import Constants from "expo-constants";

// Dynamically import expo-notifications to handle Expo Go
let Notifications = null;
const isExpoGo = Constants.appOwnership === "expo";
if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    console.log("[App Layout] ✅ expo-notifications loaded");
  } catch (error) {
    console.error("[App Layout] ❌ Failed to load expo-notifications:", error.message || error);
  }
} else {
  console.log("[App Layout] ⚠️ Running in Expo Go, skipping expo-notifications load");
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

  // Animation values
  const scaleValue = useRef(new Animated.Value(0.5)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  // Run Splash animation
  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacityValue, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 4,
        tension: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, [opacityValue, scaleValue]);

  // Initialize auth on mount
  useEffect(() => {
    setIsMounted(true);
    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Setup push notifications when authenticated
  useEffect(() => {
    console.log("[App Layout] 🔄 Auth state changed:", {
      isAuthenticated,
      authInitialized,
    });

    if (!isAuthenticated || !authInitialized) {
      console.log(
        "[App Layout] ⏹️ Stopping real-time listener (not authenticated)",
      );
      // Stop real-time listener when logged out
      stopRealtimeListener();
      return;
    }

    console.log("[App Layout] 🚀 Starting notification setup...");

    // Register for push notifications (will gracefully handle Expo Go)
    registerForPushNotifications();

    // Start WebSocket real-time listener for notifications
    const initializeRealtimeListener = async () => {
      const userId = await AsyncStorage.getItem("userId");
      console.log("[App Layout] User ID from storage:", userId);
      if (userId) {
        console.log("[App Layout] 🔌 Starting WebSocket listener...");
        startRealtimeListener(userId);
      } else {
        console.warn("[App Layout] ⚠️ No userId, falling back to API polling");
        // Fallback to API polling if no userId
        fetchUnreadCount();
      }
    };
    initializeRealtimeListener();

    // Skip notification listeners if not available (Expo Go)
    if (!Notifications) {
      console.warn(
        "[App Layout] ⚠️ Notifications module unavailable, skipping listeners",
      );
      return;
    }

    // Try to setup notification listeners (may not work in Expo Go)
    try {
      console.log("[App Layout] 🎧 Setting up notification listeners...");

      // Listen for incoming notifications (foreground)
      notificationListener.current =
        Notifications.addNotificationReceivedListener((notification) => {
          console.log("[App Layout] 📬 NOTIFICATION RECEIVED:", {
            title: notification.request?.content?.title,
            body: notification.request?.content?.body,
            data: notification.request?.content?.data,
          });

          // Vibrate and play haptic feedback
          if (Platform.OS !== "web") {
            try {
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success,
              );
              console.log("[App Layout] 📣 Haptic feedback triggered");
            } catch (err) {
              console.error("[App Layout] ❌ Haptic feedback error:", err);
            }
          }

          // Parse notification data
          const data = parseNotificationData(notification);
          console.log("[App Layout] 📖 Parsed notification data:", data);

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
          console.log("[App Layout] ✅ Notification added to local state");
        });

      // Listen for notification interactions (user taps on notification)
      responseListener.current =
        Notifications.addNotificationResponseReceivedListener((response) => {
          console.log("[App Layout] 👆 NOTIFICATION TAPPED:", {
            notification: response.notification.request.content,
            actionIdentifier: response.actionIdentifier,
          });

          const data = parseNotificationData(response.notification);
          console.log(
            "[App Layout] 📍 Navigating based on notification data:",
            data,
          );

          // Navigate based on notification type
          if (data.orderId && data.type?.startsWith("order_")) {
            console.log(`[App Layout] ➡️ Navigating to order: ${data.orderId}`);
            router.push(`/order-tracking/${data.orderId}`);
          } else {
            console.log("[App Layout] ➡️ Navigating to notifications screen");
            router.push("/notifications");
          }
        });

      console.log(
        "[App Layout] ✅ Notification listeners registered successfully",
      );
    } catch (error) {
      console.error(
        "[App Layout] ❌ Error setting up notification listeners:",
        error,
      );
    }

    // Cleanup listeners
    return () => {
      console.log("[App Layout] 🧹 Cleaning up notification listeners...");
      try {
        if (notificationListener.current?.remove) {
          notificationListener.current.remove();
          console.log("[App Layout] ✅ Notification listener removed");
        }
        if (responseListener.current?.remove) {
          responseListener.current.remove();
          console.log("[App Layout] ✅ Response listener removed");
        }
      } catch (error) {
        console.error("[App Layout] ❌ Error cleaning up listeners:", error);
      }

      // Stop real-time listener when component unmounts or auth changes
      stopRealtimeListener();
      console.log("[App Layout] ✅ Cleanup complete");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authInitialized]);

  // Handle navigation based on auth state
  useEffect(() => {
    if (!isMounted || !themeInitialized || !authInitialized) return;

    const inAuthGroup = segments[0] === "(auth)";

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to welcome if not authenticated and not in auth group
      router.replace("/(auth)/welcome");
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to tabs if authenticated and in auth group
      router.replace("/(tabs)");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, segments, isMounted, themeInitialized, authInitialized]);

  // Hide Android navigation bar, make it translucent
  useEffect(() => {
    if (Platform.OS === "android") {
      NavigationBar.setVisibilityAsync("hidden");
    }
  }, []);

  // Show splash screen with logo and smooth animations while initializing
  if (!isMounted || !themeInitialized || !authInitialized) {
    // Attempt to use Config theme fallback
    const splashColor = colors?.primary || "#1E3B70";

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: splashColor,
        }}
      >
        <StatusBar style="light" backgroundColor={splashColor} />
        <Animated.View
          style={{
            alignItems: "center",
            opacity: opacityValue,
            transform: [{ scale: scaleValue }],
          }}
        >
          <Animated.Image
            source={require("../assets/images/logo.jpeg")}
            style={{
              width: 140,
              height: 140,
              resizeMode: "contain",
              marginBottom: 10,
            }}
          />
          <Animated.Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: "#ffffff",
              letterSpacing: 1.5,
              opacity: opacityValue,
              marginTop: 10,
            }}
          >
            ANAND MOBILES
          </Animated.Text>
        </Animated.View>
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
          <ToastContainer />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
