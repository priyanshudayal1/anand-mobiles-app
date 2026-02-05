import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../store/useTheme";
import { useOrderStore } from "../store/useOrder";

// Helper function to convert UTC to IST
const toIST = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return new Date(date.getTime() + 5.5 * 60 * 60 * 1000).toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    },
  );
};

export default function Orders() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { orders, isLoading, getAllOrders } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");

  const filters = ["All", "Processing", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    getAllOrders();
  }, [getAllOrders]);

  useEffect(() => {
    filterOrders(orders, selectedFilter);
  }, [selectedFilter, orders]);

  const filterOrders = (allOrders, filter) => {
    if (filter === "All") {
      setFilteredOrders(allOrders);
    } else {
      const lowerFilter = filter.toLowerCase();
      setFilteredOrders(
        allOrders.filter((order) =>
          (order.status || "").toLowerCase().includes(lowerFilter),
        ),
      );
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getAllOrders();
    } finally {
      setRefreshing(false);
    }
  }, [getAllOrders]);

  const getStatusColor = useCallback((status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered") || s.includes("success")) return colors.success;
    if (s.includes("cancelled") || s.includes("failed")) return colors.error;
    if (s.includes("pending") || s.includes("hold")) return colors.warning;
    if (s.includes("shipped") || s.includes("out"))
      return colors.info || "#3b82f6"; // Fallback blue
    return colors.primary;
  }, [colors]);

  const getStatusIcon = useCallback((status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("delivered")) return "check-circle";
    if (s.includes("cancelled")) return "x-circle";
    if (s.includes("shipped")) return "truck";
    if (s.includes("processing")) return "package";
    return "clock";
  }, []);

  const renderOrder = useCallback(({ item }) => {
    const statusColor = getStatusColor(item.status);

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          marginBottom: 16,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: colors.border,
          overflow: "hidden",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDarkMode() ? 0.3 : 0.05,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        {/* Header */}
        <View
          style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}
            >
              Order #
              {item.order_id ? item.order_id.slice(0, 8).toUpperCase() : "N/A"}
            </Text>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 2,
              }}
            >
              {toIST(item.created_at)}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: statusColor + "20", // 20% opacity
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: statusColor + "40",
            }}
          >
            <Feather
              name={getStatusIcon(item.status)}
              size={12}
              color={statusColor}
              style={{ marginRight: 4 }}
            />
            <Text
              style={{
                color: statusColor,
                fontSize: 12,
                fontWeight: "600",
                textTransform: "capitalize",
              }}
            >
              {item.status?.replace(/_/g, " ")}
            </Text>
          </View>
        </View>

        {/* Content */}
        <View style={{ padding: 16, flexDirection: "row" }}>
          {item.preview_image ? (
            <Image
              source={{ uri: item.preview_image }}
              style={{
                width: 70,
                height: 70,
                borderRadius: 10,
                backgroundColor: colors.backgroundSecondary,
              }}
            />
          ) : (
            <View
              style={{
                width: 70,
                height: 70,
                borderRadius: 10,
                backgroundColor: colors.backgroundSecondary,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Feather name="package" size={24} color={colors.textSecondary} />
            </View>
          )}

          <View style={{ marginLeft: 16, flex: 1, justifyContent: "center" }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 6,
              }}
            >
              <Feather
                name="shopping-bag"
                size={14}
                color={colors.textSecondary}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: colors.text, fontSize: 14 }}>
                {item.item_count} Item{item.item_count !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{ color: colors.text, fontSize: 18, fontWeight: "700" }}
              >
                ₹{item.total_amount}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View
          style={{
            padding: 12,
            backgroundColor: colors.backgroundSecondary,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {item.estimated_delivery && (
              <>
                <Feather
                  name="truck"
                  size={14}
                  color={colors.primary}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  Expected:{" "}
                  {new Date(
                    new Date(item.estimated_delivery).getTime() +
                      5.5 * 60 * 60 * 1000,
                  ).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
            }}
            onPress={() => {
              if (item.order_id) {
                router.push(`/order-tracking/${item.order_id}`);
              }
            }}
          >
            <Feather
              name="eye"
              size={14}
              color="#FFF"
              style={{ marginRight: 6 }}
            />
            <Text style={{ color: "#FFF", fontSize: 12, fontWeight: "600" }}>
              Track Order
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [colors, isDarkMode, router, getStatusColor, getStatusIcon]);

  const renderFilterItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(item)}
      style={{
        marginRight: 10,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor:
          selectedFilter === item ? colors.primary : colors.surface,
        borderWidth: 1,
        borderColor:
          selectedFilter === item ? colors.primary : colors.border,
      }}
    >
      <Text
        style={{
          color: selectedFilter === item ? "#FFF" : colors.text,
          fontWeight: selectedFilter === item ? "600" : "400",
          fontSize: 13,
        }}
      >
        {item}
      </Text>
    </TouchableOpacity>
  ), [selectedFilter, colors]);

  const keyExtractorFilter = useCallback((item) => item, []);
  const keyExtractorOrder = useCallback(
    (item, index) => item.order_id || item.id || `order-${index}`,
    [],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDarkMode() ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
          My Orders
        </Text>
      </View>

      {/* Filters */}
      <View style={{ paddingVertical: 12, backgroundColor: colors.background }}>
        <FlashList
          data={filters}
          horizontal
          showsHorizontalScrollIndicator={false}
          estimatedItemSize={80}
          keyExtractor={keyExtractorFilter}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={renderFilterItem}
        />
      </View>

      {/* List */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlashList
          data={filteredOrders}
          renderItem={renderOrder}
          keyExtractor={keyExtractorOrder}
          estimatedItemSize={200}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={11}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 80, padding: 20 }}>
              <View
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 40,
                  backgroundColor: colors.surface,
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <Feather
                  name="package"
                  size={40}
                  color={colors.textSecondary}
                />
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontSize: 18,
                  fontWeight: "bold",
                  marginBottom: 8,
                }}
              >
                No Orders Found
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontSize: 14,
                  textAlign: "center",
                }}
              >
                {selectedFilter !== "All"
                  ? `You have no ${selectedFilter.toLowerCase()} orders.`
                  : "Looks like you haven't placed an order yet."}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
