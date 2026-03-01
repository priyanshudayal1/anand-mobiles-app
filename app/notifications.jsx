import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../store/useTheme";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useNotificationStore, getTimeAgo } from "../store/useNotification";
import * as Haptics from "expo-haptics";
import CustomModal from "../components/common/CustomModal";

const NotificationItem = React.memo(
  ({ item, colors, onPress, onDelete }) => {
    const isUnread = !item.read;
    const productImage = item?.data?.product_image;
    const productName = item?.data?.product_name;

    const handlePress = useCallback(() => {
      onPress(item);
    }, [onPress, item]);

    const handleLongPress = useCallback(() => {
      onDelete(item.id);
    }, [onDelete, item.id]);

    return (
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        activeOpacity={0.7}
        style={{
          paddingVertical: 16,
          paddingHorizontal: 16,
          backgroundColor: isUnread ? `${colors.primary}08` : colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        <View style={{ marginRight: 16 }}>
          {productImage ? (
            <Image
              source={{ uri: productImage }}
              style={{ width: 44, height: 44 }}
              resizeMode="contain"
            />
          ) : (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${colors.primary}15`,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name={item.icon || "notifications-outline"}
                size={22}
                color={colors.primary}
              />
            </View>
          )}
        </View>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: isUnread ? "700" : "500",
                color: colors.text,
                flex: 1,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {productName || item.title}
            </Text>
            {isUnread && (
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: colors.primary,
                  marginLeft: 8,
                  marginTop: 6,
                }}
              />
            )}
          </View>

          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              marginBottom: 4,
            }}
            numberOfLines={2}
          >
            {productName ? item.message : item.message}
          </Text>

          <Text style={{ fontSize: 11, color: colors.textSecondary }}>
            {getTimeAgo(item.created_at)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  },
  (prevProps, nextProps) =>
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.read === nextProps.item.read &&
    prevProps.item.title === nextProps.item.title &&
    prevProps.item.message === nextProps.item.message &&
    prevProps.item.created_at === nextProps.item.created_at &&
    prevProps.item.icon === nextProps.item.icon &&
    prevProps.item?.data?.product_name === nextProps.item?.data?.product_name &&
    prevProps.item?.data?.product_image ===
      nextProps.item?.data?.product_image &&
    prevProps.colors === nextProps.colors,
);
NotificationItem.displayName = "NotificationItem";

export default function NotificationsScreen() {
  const { colors, isDarkMode } = useTheme();
  const isDark = isDarkMode();
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

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const [showClearAllModal, setShowClearAllModal] = useState(false);

  // Start real-time listener on mount
  useEffect(() => {
    const initializeListener = async () => {
      // TODO: Real-time Firestore listener disabled (needs Firebase Auth)
      // Using API polling for now - see FIRESTORE_SETUP.md

      // Using API approach instead
      fetchNotifications();
    };

    initializeListener();
  }, [fetchNotifications]);

  const handleRefresh = useCallback(async () => {
    // Using API polling instead of real-time listener
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationPress = useCallback(
    async (notification) => {
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
    },
    [markAsRead, router],
  );

  const handleDeleteNotification = useCallback(async (notificationId) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setNotificationToDelete(notificationId);
    setShowDeleteModal(true);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!notificationToDelete) return;
    await deleteNotification(notificationToDelete);
    setNotificationToDelete(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [notificationToDelete, deleteNotification]);

  const handleMarkAllRead = useCallback(async () => {
    if (unreadCount === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await markAllAsRead();
  }, [unreadCount, markAllAsRead]);

  const handleClearAll = useCallback(async () => {
    if (notifications.length === 0) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setShowClearAllModal(true);
  }, [notifications.length]);

  const confirmClearAll = useCallback(async () => {
    await deleteAllNotifications();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, [deleteAllNotifications]);

  const renderNotification = useCallback(
    ({ item }) => (
      <NotificationItem
        item={item}
        colors={colors}
        onPress={handleNotificationPress}
        onDelete={handleDeleteNotification}
      />
    ),
    [colors, handleNotificationPress, handleDeleteNotification],
  );

  const getItemLayout = useCallback(
    (data, index) => ({
      length: 76,
      offset: 76 * index,
      index,
    }),
    [],
  );

  const keyExtractor = useCallback((item) => item.id, []);

  const renderEmptyState = useCallback(
    () => (
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
    ),
    [colors],
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDark ? "light" : "dark"} />

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
              <Text
                style={{ color: colors.white, fontSize: 12, fontWeight: "600" }}
              >
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
          keyExtractor={keyExtractor}
          renderItem={renderNotification}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingBottom: 20,
            flexGrow: 1,
          }}
          ListEmptyComponent={renderEmptyState}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={15}
          windowSize={21}
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

      {/* Delete Single Notification Modal */}
      <CustomModal
        visible={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setNotificationToDelete(null);
        }}
        type="warning"
        title="Delete Notification"
        message="Are you sure you want to delete this notification?"
        buttons={[
          {
            text: "Cancel",
            variant: "outline",
            onPress: () => {
              setShowDeleteModal(false);
              setNotificationToDelete(null);
            },
          },
          { text: "Delete", variant: "danger", onPress: confirmDelete },
        ]}
      />

      {/* Clear All Notifications Modal */}
      <CustomModal
        visible={showClearAllModal}
        onClose={() => setShowClearAllModal(false)}
        type="warning"
        title="Clear All Notifications"
        message="Are you sure you want to delete all notifications? This action cannot be undone."
        buttons={[
          {
            text: "Cancel",
            variant: "outline",
            onPress: () => setShowClearAllModal(false),
          },
          { text: "Clear All", variant: "danger", onPress: confirmClearAll },
        ]}
      />
    </SafeAreaView>
  );
}
