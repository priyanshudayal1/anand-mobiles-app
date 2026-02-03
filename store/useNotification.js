import { create } from "zustand";
import api from "../services/api";
import * as Device from "expo-device";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { db } from "../services/firebaseConfig";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  where,
  writeBatch,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";

// Dynamically import expo-notifications to handle Expo Go limitations
let Notifications = null;
let isNotificationsAvailable = false;

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === "expo";

if (!isExpoGo) {
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
    console.log("Push notifications not available:", error.message);
  }
} else {
  console.log("Running in Expo Go - Push notifications disabled");
}

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
  expoPushToken: null,
  notificationPermission: null,
  realtimeUnsubscribe: null, // Store the unsubscribe function

  // Start real-time listener for notifications
  startRealtimeListener: async (userId) => {
    try {
      // Stop existing listener if any
      const existingUnsubscribe = get().realtimeUnsubscribe;
      if (existingUnsubscribe) {
        existingUnsubscribe();
      }

      if (!userId) {
        console.log("No user ID provided for real-time listener");
        return;
      }

      console.log(
        "🔥 Starting real-time notification listener for user:",
        userId,
      );

      // Reference to user's notifications subcollection
      const notificationsRef = collection(db, "users", userId, "notifications");

      // Query for recent notifications (last 50)
      const q = query(
        notificationsRef,
        orderBy("created_at", "desc"),
        limit(50),
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const notificationsList = [];
          let unreadCount = 0;

          snapshot.forEach((doc) => {
            const data = doc.data();
            const notification = {
              id: doc.id,
              ...data,
              created_at:
                data.created_at?.toDate?.()?.toISOString() ||
                new Date().toISOString(),
            };
            notificationsList.push(notification);

            if (!data.read) {
              unreadCount++;
            }
          });

          console.log(
            `📬 Real-time update: ${notificationsList.length} notifications, ${unreadCount} unread`,
          );

          set({
            notifications: notificationsList,
            unreadCount: unreadCount,
            isLoading: false,
            error: null,
          });
        },
        (error) => {
          console.error("❌ Real-time listener error:", error);
          set({
            error: error.message,
            isLoading: false,
          });
        },
      );

      set({ realtimeUnsubscribe: unsubscribe });
      console.log("✅ Real-time listener started successfully");

      return unsubscribe;
    } catch (error) {
      console.error("Error starting real-time listener:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  // Stop real-time listener
  stopRealtimeListener: () => {
    const unsubscribe = get().realtimeUnsubscribe;
    if (unsubscribe) {
      console.log("🛑 Stopping real-time notification listener");
      unsubscribe();
      set({ realtimeUnsubscribe: null });
    }
  },

  // Register for push notifications (SDK 54 compatible)
  registerForPushNotifications: async () => {
    try {
      // Check if running in Expo Go
      if (isExpoGo) {
        console.log(
          "Push notifications require a development build - skipping in Expo Go",
        );
        return null;
      }

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

  // Mark single notification as read (Firestore + API)
  markAsRead: async (notificationId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n,
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));

      // Update in Firestore
      if (userId) {
        const notificationRef = doc(
          db,
          "users",
          userId,
          "notifications",
          notificationId,
        );
        await updateDoc(notificationRef, {
          read: true,
          read_at: serverTimestamp(),
        });
      }

      // Also update via API for consistency
      try {
        await api.post(`/users/notifications/${notificationId}/read/`);
      } catch (apiError) {
        console.log("API update failed (non-critical):", apiError.message);
      }

      return true;
    } catch (error) {
      console.error("Error marking notification as read:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Mark all notifications as read (Firestore + API)
  markAllAsRead: async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      // Optimistic update
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));

      // Update in Firestore
      if (userId) {
        const notificationsRef = collection(
          db,
          "users",
          userId,
          "notifications",
        );
        const q = query(notificationsRef, where("read", "==", false));
        const snapshot = await getDocs(q);

        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.update(doc.ref, {
            read: true,
            read_at: serverTimestamp(),
          });
        });
        await batch.commit();
      }

      // Also update via API for consistency
      try {
        await api.post("/users/notifications/read-all/");
      } catch (apiError) {
        console.log("API update failed (non-critical):", apiError.message);
      }

      return true;
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Delete a notification (Firestore + API)
  deleteNotification: async (notificationId) => {
    try {
      const userId = await AsyncStorage.getItem("userId");

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

      // Delete from Firestore
      if (userId) {
        const notificationRef = doc(
          db,
          "users",
          userId,
          "notifications",
          notificationId,
        );
        await deleteDoc(notificationRef);
      }

      // Also delete via API for consistency
      try {
        await api.delete(`/users/notifications/${notificationId}/delete/`);
      } catch (apiError) {
        console.log("API delete failed (non-critical):", apiError.message);
      }

      return true;
    } catch (error) {
      console.error("Error deleting notification:", error);
      // Revert optimistic update on error
      await get().fetchNotifications();
      return false;
    }
  },

  // Delete all notifications (Firestore + API)
  deleteAllNotifications: async () => {
    try {
      const userId = await AsyncStorage.getItem("userId");

      // Optimistic update
      set({
        notifications: [],
        unreadCount: 0,
      });

      // Delete from Firestore
      if (userId) {
        const notificationsRef = collection(
          db,
          "users",
          userId,
          "notifications",
        );
        const snapshot = await getDocs(notificationsRef);

        const batch = writeBatch(db);
        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }

      // Also delete via API for consistency
      try {
        await api.delete("/users/notifications/delete-all/");
      } catch (apiError) {
        console.log("API delete failed (non-critical):", apiError.message);
      }

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
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },

  // Clear all local state and stop listeners
  reset: () => {
    // Stop real-time listener
    const unsubscribe = get().realtimeUnsubscribe;
    if (unsubscribe) {
      unsubscribe();
    }

    set({
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      error: null,
      realtimeUnsubscribe: null,
    });
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
