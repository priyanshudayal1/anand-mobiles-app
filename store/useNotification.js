import { create } from "zustand";
import api from "../services/api";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import webSocketService from "../services/websocket";

// Dynamically import expo-notifications to handle Expo Go limitations
let Notifications = null;
let isNotificationsAvailable = false;

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

console.log("[Notification] App ownership:", Constants.appOwnership);
console.log("[Notification] Is Expo Go:", isExpoGo);
console.log("[Notification] Platform:", Platform.OS);

if (!isExpoGo) {
  try {
    Notifications = require("expo-notifications");
    isNotificationsAvailable = true;
    console.log("[Notification] ✅ expo-notifications loaded successfully");

    // Configure how notifications are handled when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        console.log("[Notification] 📬 Notification received:", {
          title: notification.request.content.title,
          body: notification.request.content.body,
          data: notification.request.content.data,
        });
        return {
          shouldPlaySound: true,
          shouldSetBadge: true,
          shouldShowBanner: true,
          shouldShowList: true,
        };
      },
    });
    console.log("[Notification] ✅ Notification handler configured");
  } catch (error) {
    console.error(
      "[Notification] ❌ Failed to load expo-notifications:",
      error,
    );
  }
} else {
  console.warn("[Notification] ⚠️ Push notifications are disabled in Expo Go");
}

// Helper function to show local push notification
const showLocalNotification = async (notification) => {
  try {
    if (!isNotificationsAvailable || !Notifications) {
      console.log(
        "[Notification] ⚠️ Notifications unavailable, skipping local push",
      );
      return;
    }

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") {
      console.log(
        "[Notification] ⚠️ Permissions not granted, skipping local push",
      );
      return;
    }

    console.log(
      "[Notification] 📢 Showing local push notification:",
      notification.title,
    );

    // Schedule a local notification immediately
    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title || "New Notification",
        body: notification.message || notification.body || "",
        data: {
          type: notification.type || "general",
          order_id: notification.order_id || null,
          status: notification.status || null,
          notification_id: notification.id || null,
          product_image: notification.data?.product_image || null,
          product_name: notification.data?.product_name || null,
        },
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // null means show immediately
    });

    console.log("[Notification] ✅ Local push notification displayed");
  } catch (error) {
    console.error("[Notification] ❌ Error showing local notification:", error);
  }
};

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  expoPushToken: null,
  notificationPermission: null,
  wsUnsubscribers: [], // Store WebSocket event unsubscribers
  isWebSocketConnected: false,

  // Start real-time listener using WebSocket
  startRealtimeListener: async (userId) => {
    try {
      // Stop existing listeners if any
      get().stopRealtimeListener();

      if (!userId) {
        return null;
      }

      // Set up WebSocket event listeners
      const unsubscribers = [];

      // Handle new notifications
      unsubscribers.push(
        webSocketService.on("new_notification", (notification) => {
          console.log(
            "[Notification] 📨 New notification from WebSocket:",
            notification,
          );

          set((state) => {
            // Check if notification already exists to prevent duplicates
            const exists = state.notifications.some(
              (n) => n.id === notification.id,
            );
            if (exists) {
              console.log("[Notification] ⚠️ Duplicate notification, skipping");
              return state;
            }

            // Show local push notification
            showLocalNotification(notification);

            return {
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            };
          });
        }),
      );

      // Handle broadcast notifications from admin
      unsubscribers.push(
        webSocketService.on("broadcast_notification", (notification) => {
          console.log(
            "[Notification] 📢 Broadcast notification from admin:",
            notification,
          );

          set((state) => {
            // Check if notification already exists to prevent duplicates
            const exists = state.notifications.some(
              (n) => n.id === notification.id,
            );
            if (exists) {
              console.log("[Notification] ⚠️ Duplicate broadcast, skipping");
              return state;
            }

            // Show local push notification
            showLocalNotification(notification);

            return {
              notifications: [notification, ...state.notifications],
              unreadCount: state.unreadCount + 1,
            };
          });
        }),
      );

      // Handle notifications list update
      unsubscribers.push(
        webSocketService.on("notifications_list", (notifications) => {
          const unreadCount = notifications.filter((n) => !n.read).length;
          set({
            notifications,
            unreadCount,
            isLoading: false,
          });
        }),
      );

      // Handle unread count update
      unsubscribers.push(
        webSocketService.on("unread_count", (count) => {
          set({ unreadCount: count });
        }),
      );

      // Handle connection status
      unsubscribers.push(
        webSocketService.on("connected", () => {
          set({ isWebSocketConnected: true, error: null });
          // Request initial notifications
          webSocketService.requestNotifications(50);
        }),
      );

      unsubscribers.push(
        webSocketService.on("disconnected", () => {
          set({ isWebSocketConnected: false });
        }),
      );

      unsubscribers.push(
        webSocketService.on("error", (error) => {
          // Silently handle WebSocket errors - we'll fallback to API
          set({ isWebSocketConnected: false });
        }),
      );

      unsubscribers.push(
        webSocketService.on("backend_unavailable", () => {
          set({ isWebSocketConnected: false });
          // Fetch via API as fallback
          get().fetchNotifications();
        }),
      );

      unsubscribers.push(
        webSocketService.on("max_reconnect_reached", () => {
          set({ isWebSocketConnected: false });
          // Fetch via API as fallback
          get().fetchNotifications();
        }),
      );

      // Store unsubscribers
      set({ wsUnsubscribers: unsubscribers });

      // Connect to WebSocket
      set({ isLoading: true });
      const connected = await webSocketService.connect();

      if (!connected) {
        // Fall back to API-based notifications
        await get().fetchNotifications();
      }
      return () => get().stopRealtimeListener();
    } catch (error) {
      console.error("Error starting real-time listener:", error);
      set({ error: error.message, isLoading: false });
      // Fall back to API polling
      await get().fetchNotifications();
      return null;
    }
  },

  // Stop real-time listener
  stopRealtimeListener: () => {
    const { wsUnsubscribers } = get();

    // Unsubscribe from all WebSocket events
    if (wsUnsubscribers && wsUnsubscribers.length > 0) {
      wsUnsubscribers.forEach((unsub) => {
        if (typeof unsub === "function") {
          unsub();
        }
      });
    }

    // Disconnect WebSocket
    webSocketService.disconnect();

    set({ wsUnsubscribers: [], isWebSocketConnected: false });
  },

  // Register for push notifications (SDK 54 compatible)
  registerForPushNotifications: async () => {
    console.log("[Notification] 🔔 Starting push notification registration...");
    try {
      // Check if running in Expo Go
      if (isExpoGo) {
        console.warn(
          "[Notification] ⚠️ Cannot register push notifications in Expo Go",
        );
        return null;
      }

      // Check if notifications module is available
      if (!isNotificationsAvailable || !Notifications) {
        console.error("[Notification] ❌ Notifications module not available");
        return null;
      }

      // Must use physical device for push notifications
      if (!Device.isDevice) {
        console.warn(
          "[Notification] ⚠️ Push notifications require a physical device",
        );
        return null;
      }
      console.log("[Notification] ✅ Running on physical device");

      // Request permissions
      console.log("[Notification] 📱 Checking notification permissions...");
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      console.log("[Notification] Current permission status:", existingStatus);
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        console.log("[Notification] 🔐 Requesting notification permissions...");
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
        console.log("[Notification] New permission status:", finalStatus);
      }

      set({ notificationPermission: finalStatus });

      if (finalStatus !== "granted") {
        console.error(
          "[Notification] ❌ Notification permissions denied:",
          finalStatus,
        );
        return null;
      }
      console.log("[Notification] ✅ Notification permissions granted");

      // Get EAS project ID (required for Expo push tokens)
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      console.log("[Notification] EAS Project ID:", projectId);
      if (!projectId) {
        console.error("[Notification] ❌ No EAS project ID found in app.json");
        return null;
      }

      // Get Expo push token
      console.log("[Notification] 🎫 Getting Expo push token...");
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      console.log("[Notification] ✅ Got Expo push token:", token);
      set({ expoPushToken: token });

      // Setup Android notification channel (SDK 54 required)
      if (Platform.OS === "android") {
        console.log(
          "[Notification] 🤖 Setting up Android notification channel...",
        );
        await Notifications.setNotificationChannelAsync("default", {
          name: "Order Updates",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
          sound: "default",
          enableVibrate: true,
          enableLights: true,
          showBadge: true,
        });
        console.log(
          "[Notification] ✅ Android notification channel configured",
        );
      }

      // Register token with backend
      console.log("[Notification] 📤 Registering token with backend...");
      await get().registerTokenWithBackend(token);
      console.log("[Notification] ✅ Push notification registration complete!");
      return token;
    } catch (error) {
      // Silently handle common expected errors
      const errorMessage = error.message || "";

      // Firebase errors are expected when not using FCM (Expo handles push without FCM)
      if (
        errorMessage.includes("FirebaseApp is not initialized") ||
        errorMessage.includes("FirebaseApp.initializeApp")
      ) {
        // Silently ignore - Expo push notifications work without FCM
        return null;
      }

      // Expo Go limitations are expected
      if (
        errorMessage.includes("Expo Go") ||
        errorMessage.includes("projectId")
      ) {
        console.warn(
          "[Notification] ⚠️ Project ID issue or Expo Go limitation",
        );
        return null;
      }

      // Log unexpected errors only
      console.error(
        "[Notification] ❌ Error registering push notifications:",
        errorMessage,
      );
      set({ error: errorMessage });
      return null;
    }
  },

  // Register token with backend
  registerTokenWithBackend: async (token) => {
    try {
      console.log("[Notification] 🔑 Getting user token from storage...");
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        console.warn(
          "[Notification] ⚠️ No user token found, skipping backend registration",
        );
        return;
      }

      console.log("[Notification] 📤 Sending push token to backend...");
      const response = await api.post("/users/notifications/register-token/", {
        fcm_token: token,
      });
      console.log(
        "[Notification] ✅ Token registered with backend:",
        response.data,
      );
    } catch (error) {
      console.error(
        "[Notification] ❌ Error registering token with backend:",
        error.response?.data || error.message,
      );
    }
  },

  // Fetch notifications from backend (fallback method, real-time is preferred)
  fetchNotifications: async (limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/users/notifications/?limit=${limit}`);
      const data = response.data;

      set({
        notifications: data.notifications || [],
        unreadCount: data.unread_count || 0,
        isLoading: false,
      });

      return data.notifications;
    } catch (error) {
      // Silence 401 errors
      if (error.response && error.response.status === 401) {
        set({
          notifications: [],
          unreadCount: 0,
          isLoading: false,
          error: null,
        });
        return [];
      }
      console.error("Error fetching notifications:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch notifications",
        isLoading: false,
      });
      return [];
    }
  },

  // Get unread count only
  fetchUnreadCount: async () => {
    try {
      const response = await api.get("/users/notifications/count/");
      const count = response.data.unread_count || 0;
      set({ unreadCount: count });
      return count;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        return 0;
      }
      console.error("Error fetching unread count:", error);
      return 0;
    }
  },

  // Mark single notification as read (via WebSocket or API)
  markAsRead: async (notificationId) => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      // Try WebSocket first
      if (webSocketService.getIsConnected()) {
        webSocketService.markAsRead(notificationId);
      } else {
        // Fallback to API
        await api.post(`/users/notifications/${notificationId}/read/`);
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Mark all notifications as read (via WebSocket or API)
  markAllAsRead: async () => {
    try {
      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));

      // Try WebSocket first
      if (webSocketService.getIsConnected()) {
        webSocketService.markAllAsRead();
      } else {
        // Fallback to API
        await api.post("/users/notifications/read-all/");
      }

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Delete a notification (via API)
  deleteNotification: async (notificationId) => {
    try {
      // Store notification before deletion for rollback
      const notification = get().notifications.find(
        (n) => n.id === notificationId,
      );
      const wasUnread = notification && !notification.read;

      // Optimistic update
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.id !== notificationId,
        ),
        unreadCount: wasUnread
          ? Math.max(0, state.unreadCount - 1)
          : state.unreadCount,
      }));

      // Delete via API
      await api.delete(`/users/notifications/${notificationId}/delete/`);

      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Delete all notifications (via API)
  deleteAllNotifications: async () => {
    try {
      // Optimistic update
      set({
        notifications: [],
        unreadCount: 0,
      });

      // Delete via API
      await api.delete("/users/notifications/delete-all/");

      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Add a notification locally (from push notification)
  addNotificationLocally: (notification) => {
    console.log(
      "[Notification] \u2795 Adding notification locally:",
      notification,
    );
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Test push notification (for debugging)
  sendTestNotification: async () => {
    console.log("[Notification] \ud83e\uddea Sending test notification...");
    try {
      if (!isNotificationsAvailable || !Notifications) {
        console.error("[Notification] \u274c Notifications not available");
        return { success: false, error: "Notifications not available" };
      }

      const { status } = await Notifications.getPermissionsAsync();
      console.log("[Notification] Permission status:", status);

      if (status !== "granted") {
        console.error("[Notification] \u274c Permissions not granted");
        return { success: false, error: "Permissions not granted" };
      }

      // Schedule a local notification immediately
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "\ud83d\udce6 Test Notification",
          body: "This is a test notification to verify push notifications are working!",
          data: {
            type: "test",
            timestamp: Date.now(),
          },
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: null, // null means show immediately
      });

      console.log("[Notification] \u2705 Test notification scheduled");
      return { success: true };
    } catch (error) {
      console.error(
        "[Notification] \u274c Error sending test notification:",
        error,
      );
      return { success: false, error: error.message };
    }
  },

  // Get notification permission status (for debugging)
  getPermissionStatus: async () => {
    console.log("[Notification] \ud83d\udd10 Checking permission status...");
    try {
      if (!isNotificationsAvailable || !Notifications) {
        return "unavailable";
      }
      const { status } = await Notifications.getPermissionsAsync();
      console.log("[Notification] Current permission status:", status);
      return status;
    } catch (error) {
      console.error("[Notification] \u274c Error checking permissions:", error);
      return "error";
    }
  },

  // Clear all local state and stop listeners
  reset: () => {
    console.log("[Notification] \ud83d\udd04 Resetting notification store...");
    // Stop WebSocket listener
    get().stopRealtimeListener();

    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      wsUnsubscribers: [],
      isWebSocketConnected: false,
    });
    console.log("[Notification] \u2705 Store reset complete");
  },
}));

// Helper function to parse notification data from push notification
export const parseNotificationData = (notification) => {
  const data = notification.request?.content?.data || {};
  return {
    type: data.type || "general",
    orderId: data.order_id || null,
    status: data.status || null,
    notificationId: data.notification_id || null,
  };
};

// Helper function to get notification icon based on type
export const getNotificationIcon = (type) => {
  const iconMap = {
    order_pending: "time-outline",
    order_payment: "card-outline",
    order_confirmed: "checkmark-circle-outline",
    order_processing: "construct-outline",
    order_packed: "cube-outline",
    order_shipped: "airplane-outline",
    order_out_for_delivery: "bicycle-outline",
    order_delivered: "checkmark-done-circle-outline",
    order_cancelled: "close-circle-outline",
    order_failed_attempt: "alert-circle-outline",
    order_returning: "return-down-back-outline",
    order_update: "notifications-outline",
    broadcast: "megaphone-outline",
  };

  return iconMap[type] || "notifications-outline";
};

// Helper function to get time ago string
export const getTimeAgo = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString();
};
