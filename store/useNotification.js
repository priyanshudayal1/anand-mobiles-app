import { create } from "zustand";
import api from "../services/api";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Dynamically import expo-notifications to handle Expo Go limitations
let Notifications = null;
let isNotificationsAvailable = false;

try {
  Notifications = require("expo-notifications");
  isNotificationsAvailable = true;

  // Configure how notifications are handled when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (error) {
  console.log("expo-notifications not available:", error.message);
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  expoPushToken: null,
  notificationPermission: null,

  // Register for push notifications (SDK 54 compatible)
  registerForPushNotifications: async () => {
    try {
      // Check if notifications module is available
      if (!isNotificationsAvailable || !Notifications) {
        console.log("Push notifications not available in this environment");
        return null;
      }

      // Must use physical device for push notifications
      if (!Device.isDevice) {
        console.log("Must use physical device for Push Notifications");
        return null;
      }

      // Request permissions
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      set({ notificationPermission: finalStatus });

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return null;
      }

      // Get EAS project ID (required for Expo push tokens)
      const projectId =
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.log(
          "No EAS project ID found - push notifications require a development build",
        );
        console.log("Run: npx expo prebuild && npx expo run:android");
        return null;
      }

      // Get Expo push token
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId: projectId,
        })
      ).data;

      set({ expoPushToken: token });

      // Setup Android notification channel (SDK 54 required)
      if (Platform.OS === "android") {
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
      }

      // Register token with backend
      await get().registerTokenWithBackend(token);

      console.log("✅ Push notifications registered successfully");
      return token;
    } catch (error) {
      console.log("Push notifications setup:", error.message);
      // Don't set error state for expected Expo Go limitations
      if (
        !error.message?.includes("Expo Go") &&
        !error.message?.includes("projectId")
      ) {
        set({ error: error.message });
      }
      return null;
    }
  },

  // Register token with backend
  registerTokenWithBackend: async (token) => {
    try {
      const userToken = await AsyncStorage.getItem("userToken");
      if (!userToken) {
        console.log("No user token, skipping FCM token registration");
        return;
      }

      await api.post("/users/notifications/register-token/", {
        fcm_token: token,
      });
      console.log("FCM token registered with backend");
    } catch (error) {
      console.error("Error registering FCM token with backend:", error);
    }
  },

  // Fetch notifications from backend
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

  // Mark single notification as read
  markAsRead: async (notificationId) => {
    try {
      await api.post(`/users/notifications/${notificationId}/read/`);

      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    try {
      await api.post("/users/notifications/read-all/");

      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      return false;
    }
  },

  // Delete a notification
  deleteNotification: async (notificationId) => {
    try {
      await api.delete(`/users/notifications/${notificationId}/delete/`);

      set((state) => {
        const notification = state.notifications.find(
          (n) => n.id === notificationId,
        );
        const wasUnread = notification && !notification.read;

        return {
          notifications: state.notifications.filter(
            (n) => n.id !== notificationId,
          ),
          unreadCount: wasUnread
            ? Math.max(0, state.unreadCount - 1)
            : state.unreadCount,
        };
      });

      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      return false;
    }
  },

  // Delete all notifications
  deleteAllNotifications: async () => {
    try {
      await api.delete("/users/notifications/delete-all/");

      set({
        notifications: [],
        unreadCount: 0,
      });

      return true;
    } catch (error) {
      console.error("Error deleting all notifications:", error);
      return false;
    }
  },

  // Add a notification locally (from push notification)
  addNotificationLocally: (notification) => {
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Clear all local state
  reset: () =>
    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
    }),
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
