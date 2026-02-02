import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../store/useTheme";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationStore, getTimeAgo } from "../store/useNotification";
import * as Haptics from "expo-haptics";

export default function NotificationsScreen() {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRefresh = useCallback(() => {
    fetchNotifications();
  }, []);

  const handleNotificationPress = async (notification) => {
    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Mark as read if unread
    if (!notification.read) {
      await markAsRead(notification.id);
    }

    // Navigate to order tracking if it's an order notification
    if (notification.order_id) {
      router.push(`/order-tracking/${notification.order_id}`);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Delete Notification",
      "Are you sure you want to delete this notification?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteNotification(notificationId);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  };

  const handleClearAll = async () => {
    if (notifications.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            await deleteAllNotifications();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          },
        },
      ],
    );
  };

  const getStatusColor = (type) => {
    const colorMap = {
      order_pending: "#F59E0B",
      order_payment: "#3B82F6",
      order_confirmed: "#10B981",
      order_processing: "#8B5CF6",
      order_packed: "#6366F1",
      order_shipped: "#0EA5E9",
      order_out_for_delivery: "#F97316",
      order_delivered: "#22C55E",
      order_cancelled: "#EF4444",
      order_failed_attempt: "#F59E0B",
      order_returning: "#6B7280",
    };
    return colorMap[type] || colors.primary;
  };

  const renderNotification = ({ item }) => {
    const statusColor = getStatusColor(item.type);
    const isUnread = !item.read;

    return (
      <TouchableOpacity
        onPress={() => handleNotificationPress(item)}
        onLongPress={() => handleDeleteNotification(item.id)}
        activeOpacity={0.7}
        style={{
          marginHorizontal: 16,
          marginVertical: 6,
          backgroundColor: isUnread ? `${statusColor}15` : colors.surface,
          borderRadius: 16,
          padding: 16,
          borderLeftWidth: 4,
          borderLeftColor: statusColor,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode ? 0.3 : 0.1,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${statusColor}20`,
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
            }}
          >
            <Ionicons
              name={item.icon || "notifications-outline"}
              size={22}
              color={statusColor}
            />
          </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: isUnread ? "700" : "600",
                  color: colors.text,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {item.title}
              </Text>
              {isUnread && (
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: statusColor,
                    marginTop: 6,
                  }}
                />
              )}
            </View>

            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginTop: 4,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {item.message}
            </Text>

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Ionicons
                name="time-outline"
                size={12}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: colors.textSecondary,
                  marginLeft: 4,
                }}
              >
                {getTimeAgo(item.created_at)}
              </Text>

              {item.order_id && (
                <>
                  <View
                    style={{
                      width: 3,
                      height: 3,
                      borderRadius: 1.5,
                      backgroundColor: colors.textSecondary,
                      marginHorizontal: 8,
                    }}
                  />
                  <Ionicons
                    name="receipt-outline"
                    size={12}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={{
                      fontSize: 11,
                      color: statusColor,
                      marginLeft: 4,
                      fontWeight: "500",
                    }}
                  >
                    Order #{item.order_id.slice(0, 8)}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
      }}
    >
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: `${colors.primary}15`,
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <Ionicons
          name="notifications-outline"
          size={60}
          color={colors.primary}
        />
      </View>
      <Text
        style={{
          fontSize: 20,
          fontWeight: "700",
          color: colors.text,
          marginBottom: 8,
        }}
      >
        No Notifications Yet
      </Text>
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        You will receive notifications here when your order status changes.
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 4 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.text,
              marginLeft: 16,
            }}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 12,
                paddingHorizontal: 8,
                paddingVertical: 2,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: "row", gap: 12 }}>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={handleMarkAllRead}
              style={{ padding: 4 }}
            >
              <Ionicons
                name="checkmark-done-outline"
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          )}
          {notifications.length > 0 && (
            <TouchableOpacity onPress={handleClearAll} style={{ padding: 4 }}>
              <Ionicons
                name="trash-outline"
                size={22}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Notifications List */}
      {isLoading && notifications.length === 0 ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            Loading notifications...
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={{
            paddingVertical: 12,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}
