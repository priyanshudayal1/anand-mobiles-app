import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Animated,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";
import { useTheme } from "../../store/useTheme";
import { useOrderStore } from "../../store/useOrder";
import { useToast } from "../../store/useToast";
import api from "../../services/api";

export default function OrderTracking() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { getOrderById, currentOrder, isLoading, error } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const { error: showError } = useToast();

  // Animation value for progress bar
  const progressAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (id) {
      getOrderById(id);
    }
  }, [id]);

  useEffect(() => {
    if (currentOrder) {
      const progress = getProgressPercentage();
      Animated.timing(progressAnimation, {
        toValue: progress,
        duration: 1500,
        useNativeDriver: false,
      }).start();
    }
  }, [currentOrder]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getOrderById(id);
    setRefreshing(false);
  };

  // Status order for timeline
  const statusOrder = [
    "Pending Payment",
    "Payment Successful",
    "Assigned",
    "Processing",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  // Get display-friendly status
  const getDisplayStatus = (status) => {
    const statusMap = {
      pending_payment: "Pending Payment",
      payment_successful: "Payment Successful",
      assigned: "Assigned",
      processing: "Processing",
      packed: "Packed",
      shipped: "Shipped",
      out_for_delivery: "Out for Delivery",
      delivered: "Delivered",
      cancelled: "Cancelled",
      failed_attempt: "Failed Delivery Attempt",
      returning_to_warehouse: "Returning to Warehouse",
    };
    return statusMap[status] || status;
  };

  // Calculate progress percentage
  const getProgressPercentage = () => {
    if (!currentOrder) return 0;
    const status = getDisplayStatus(
      currentOrder.delivery_status || currentOrder.status,
    );
    const currentIndex = statusOrder.indexOf(status);
    if (currentIndex === -1) return 10;
    return Math.min(((currentIndex + 1) / statusOrder.length) * 100, 100);
  };

  // Get status color
  const getStatusColor = (status) => {
    const s = getDisplayStatus(status || "").toLowerCase();
    if (s.includes("delivered")) return colors.success;
    if (s.includes("cancelled") || s.includes("failed")) return colors.error;
    if (s.includes("pending") || s.includes("out for")) return colors.warning;
    if (s.includes("shipped") || s.includes("assigned")) return colors.info;
    if (
      s.includes("processing") ||
      s.includes("packed") ||
      s.includes("payment successful")
    )
      return colors.primary;
    return colors.textSecondary;
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const s = getDisplayStatus(status || "").toLowerCase();
    if (s.includes("delivered")) return "check-circle";
    if (s.includes("cancelled")) return "x-circle";
    if (s.includes("shipped") || s.includes("out for")) return "truck";
    if (s.includes("packed")) return "package";
    if (s.includes("processing")) return "activity";
    if (s.includes("assigned")) return "user";
    if (s.includes("payment")) return "credit-card";
    return "clock";
  };

  // Generate timeline from order data
  const generateTimeline = () => {
    if (!currentOrder) return [];

    const currentStatus = getDisplayStatus(
      currentOrder.delivery_status || currentOrder.status,
    );
    const currentStatusIndex = statusOrder.indexOf(currentStatus);
    const existingHistory = currentOrder.tracking_info?.status_history || [];

    // Create timeline from status order
    return statusOrder.map((status, index) => {
      const historyItem = existingHistory.find(
        (h) => getDisplayStatus(h.status) === status,
      );

      const isCompleted = index <= currentStatusIndex;
      const isActive = status === currentStatus;

      return {
        status,
        date: historyItem?.timestamp || null,
        description:
          historyItem?.description || getStatusDescription(status, isCompleted),
        isCompleted,
        isActive,
      };
    });
  };

  // Get status description
  const getStatusDescription = (status, isCompleted) => {
    const descriptions = {
      "Pending Payment": isCompleted
        ? "Payment confirmation received"
        : "Awaiting payment confirmation",
      "Payment Successful": isCompleted
        ? "Payment received successfully"
        : "Payment being processed",
      Assigned: isCompleted
        ? "Order assigned to delivery partner"
        : "Will be assigned to partner",
      Processing: isCompleted
        ? "Order is being processed"
        : "Order processing pending",
      Packed: isCompleted
        ? "Items packed and ready"
        : "Items will be packed soon",
      Shipped: isCompleted
        ? "Order dispatched from warehouse"
        : "Order will be shipped soon",
      "Out for Delivery": isCompleted
        ? "Package is out for delivery"
        : "Will be out for delivery",
      Delivered: isCompleted
        ? "Order successfully delivered"
        : "Delivery pending",
    };
    return descriptions[status] || status;
  };

  // Format address
  const formatAddress = (address) => {
    if (!address) return null;
    return `${address.street_address}, ${address.city}, ${address.state} - ${address.postal_code}`;
  };

  // Handle invoice download
  const handleDownloadInvoice = async () => {
    if (downloadingInvoice) return;

    try {
      setDownloadingInvoice(true);
      const invoiceId =
        currentOrder?.invoice_id || currentOrder?.razorpay_order_id || id;

      // For React Native, we'll open the invoice URL in browser
      const invoiceUrl = `${api.defaults.baseURL}/users/orders/${invoiceId}/invoice/`;

      await WebBrowser.openBrowserAsync(invoiceUrl);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      showError("Failed to download invoice. Please try again.");
    } finally {
      setDownloadingInvoice(false);
    }
  };

  // Handle tracking link
  const handleTrackingLink = async () => {
    if (currentOrder?.tracking_url) {
      try {
        await WebBrowser.openBrowserAsync(currentOrder.tracking_url);
      } catch (error) {
        Linking.openURL(currentOrder.tracking_url);
      }
    }
  };

  if (isLoading && !refreshing) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 16, color: colors.textSecondary }}>
          Loading order details...
        </Text>
      </SafeAreaView>
    );
  }

  if (error || !currentOrder) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ marginBottom: 20 }}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={{ alignItems: "center", marginTop: 100 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: colors.error + "20",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Feather name="package" size={40} color={colors.error} />
            </View>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginTop: 16,
              }}
            >
              Order Not Found
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 8,
                paddingHorizontal: 20,
              }}
            >
              {error || "We couldn't find the details for this order."}
            </Text>
            <TouchableOpacity
              style={{
                marginTop: 24,
                backgroundColor: colors.primary,
                paddingHorizontal: 24,
                paddingVertical: 12,
                borderRadius: 8,
              }}
              onPress={() => router.push("/orders")}
            >
              <Text style={{ color: colors.white, fontWeight: "600" }}>
                View All Orders
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const displayStatus = getDisplayStatus(
    currentOrder.delivery_status || currentOrder.status,
  );
  const currentStatusColor = getStatusColor(displayStatus);
  const timeline = generateTimeline();
  const orderItems = currentOrder.order_items || currentOrder.orderItems || [];
  const isPaid =
    displayStatus !== "Pending Payment" && displayStatus !== "Cancelled";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={isDarkMode() ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
          >
            Order #
            {(currentOrder.invoice_id || currentOrder.razorpay_order_id || id)
              ?.slice(0, 12)
              .toUpperCase()}
          </Text>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            {currentOrder.created_at_formatted || "Order placed"}
          </Text>
        </View>
        {isPaid && (
          <TouchableOpacity
            onPress={handleDownloadInvoice}
            disabled={downloadingInvoice}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.primary + "15",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            {downloadingInvoice ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <>
                <Feather name="download" size={16} color={colors.primary} />
                <Text
                  style={{
                    marginLeft: 6,
                    color: colors.primary,
                    fontWeight: "600",
                    fontSize: 13,
                  }}
                >
                  Invoice
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Progress Bar */}
        <View
          style={{ height: 4, backgroundColor: colors.border, width: "100%" }}
        >
          <Animated.View
            style={{
              height: "100%",
              backgroundColor: currentStatusColor,
              width: progressAnimation.interpolate({
                inputRange: [0, 100],
                outputRange: ["0%", "100%"],
              }),
            }}
          />
        </View>

        {/* Status Card */}
        <View
          style={{
            margin: 16,
            padding: 20,
            backgroundColor: colors.surface,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: currentStatusColor + "20",
                justifyContent: "center",
                alignItems: "center",
                marginRight: 16,
              }}
            >
              <Feather
                name={getStatusIcon(displayStatus)}
                size={28}
                color={currentStatusColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 4,
                }}
              >
                {displayStatus}
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                {currentOrder.total_amount && (
                  <View
                    style={{
                      backgroundColor: colors.primary + "15",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.primary,
                        fontWeight: "600",
                        fontSize: 13,
                      }}
                    >
                      ₹{currentOrder.total_amount}
                    </Text>
                  </View>
                )}
                {orderItems.length > 0 && (
                  <View
                    style={{
                      backgroundColor: colors.textSecondary + "20",
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontWeight: "500",
                        fontSize: 13,
                      }}
                    >
                      {orderItems.length} item{orderItems.length > 1 ? "s" : ""}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Estimated Delivery */}
          {currentOrder.estimated_delivery && (
            <View
              style={{
                marginTop: 16,
                paddingTop: 16,
                borderTopWidth: 1,
                borderTopColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Feather name="calendar" size={16} color={colors.textSecondary} />
              <Text style={{ marginLeft: 8, color: colors.textSecondary }}>
                Expected Delivery:{" "}
                <Text style={{ color: colors.text, fontWeight: "600" }}>
                  {new Date(
                    new Date(currentOrder.estimated_delivery).getTime() +
                      5.5 * 60 * 60 * 1000,
                  ).toLocaleString("en-IN", {
                    weekday: "short",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </Text>
              </Text>
            </View>
          )}
        </View>

        {/* Info Cards Row */}
        <ScrollView
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        >
          {/* Delivery Address Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: colors.success + "20",
                  marginRight: 8,
                }}
              >
                <Feather name="map-pin" size={16} color={colors.success} />
              </View>
              <Text style={{ fontWeight: "600", color: colors.text }}>
                Delivery
              </Text>
            </View>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 13,
                lineHeight: 18,
              }}
              numberOfLines={4}
            >
              {currentOrder.address
                ? formatAddress(currentOrder.address)
                : "Address not available"}
            </Text>
            {currentOrder.address?.phone_number && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 8,
                }}
              >
                <Feather name="phone" size={12} color={colors.textSecondary} />
                <Text
                  style={{
                    marginLeft: 6,
                    color: colors.textSecondary,
                    fontSize: 12,
                  }}
                >
                  {currentOrder.address.phone_number}
                </Text>
              </View>
            )}
          </View>

          {/* Delivery Partner Card */}
          <View
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <View
                style={{
                  padding: 8,
                  borderRadius: 8,
                  backgroundColor: colors.primary + "20",
                  marginRight: 8,
                }}
              >
                <Feather name="truck" size={16} color={colors.primary} />
              </View>
              <Text style={{ fontWeight: "600", color: colors.text }}>
                Partner
              </Text>
            </View>
            <Text
              style={{ color: colors.text, fontWeight: "500", marginBottom: 4 }}
            >
              {currentOrder.assigned_partner_name || "Not Assigned"}
            </Text>
            {currentOrder.tracking_info?.tracking_number && (
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 12,
                  fontFamily: "monospace",
                }}
              >
                #{currentOrder.tracking_info.tracking_number}
              </Text>
            )}
          </View>

          {/* Payment Card */}
          {currentOrder.payment_details && (
            <View
              style={{
                width: 160,
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.warning + "20",
                    marginRight: 8,
                  }}
                >
                  <Feather
                    name="credit-card"
                    size={16}
                    color={colors.warning}
                  />
                </View>
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  Payment
                </Text>
              </View>
              <Text
                style={{
                  color: colors.text,
                  fontWeight: "500",
                  marginBottom: 4,
                  textTransform: "capitalize",
                }}
              >
                {currentOrder.payment_details.method || "N/A"}
              </Text>
              <Text
                style={{
                  color:
                    currentOrder.payment_details.status === "captured"
                      ? colors.success
                      : colors.warning,
                  fontSize: 12,
                  fontWeight: "500",
                  textTransform: "capitalize",
                }}
              >
                {currentOrder.payment_details.status || "Pending"}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Order Items */}
        {orderItems.length > 0 && (
          <View style={{ margin: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Feather name="package" size={18} color={colors.text} />
              <Text
                style={{
                  marginLeft: 8,
                  fontSize: 16,
                  fontWeight: "bold",
                  color: colors.text,
                }}
              >
                Order Items ({orderItems.length})
              </Text>
            </View>

            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border,
                overflow: "hidden",
              }}
            >
              {orderItems.map((item, index) => (
                <View
                  key={index}
                  style={{
                    flexDirection: "row",
                    padding: 12,
                    borderBottomWidth: index < orderItems.length - 1 ? 1 : 0,
                    borderBottomColor: colors.border,
                  }}
                >
                  {/* Product Image */}
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 8,
                      backgroundColor: colors.white,
                      overflow: "hidden",
                      marginRight: 12,
                    }}
                  >
                    {item.image_url || item.image ? (
                      <Image
                        source={{ uri: item.image_url || item.image }}
                        style={{ width: "100%", height: "100%" }}
                        contentFit="contain"
                      />
                    ) : (
                      <View
                        style={{
                          flex: 1,
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: colors.primary + "15",
                        }}
                      >
                        <Feather
                          name="package"
                          size={24}
                          color={colors.primary}
                        />
                      </View>
                    )}
                  </View>

                  {/* Product Details */}
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: colors.text,
                        marginBottom: 4,
                      }}
                      numberOfLines={2}
                    >
                      {item.name || `Item ${index + 1}`}
                    </Text>
                    {item.brand && (
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Brand: {item.brand}
                      </Text>
                    )}
                    {item.model && (
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Model: {item.model}
                      </Text>
                    )}
                    {item.color && (
                      <Text
                        style={{ fontSize: 12, color: colors.textSecondary }}
                      >
                        Color: {item.color}
                      </Text>
                    )}
                  </View>

                  {/* Price & Quantity */}
                  <View style={{ alignItems: "flex-end" }}>
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "bold",
                        color: colors.text,
                      }}
                    >
                      ₹
                      {item.price_at_purchase ||
                        item.total_item_price ||
                        item.price}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      Qty: {item.quantity || 1}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Timeline */}
        <View style={{ margin: 16, marginTop: 0 }}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <Feather name="activity" size={18} color={colors.text} />
            <Text
              style={{
                marginLeft: 8,
                fontSize: 16,
                fontWeight: "bold",
                color: colors.text,
              }}
            >
              Tracking Timeline
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            {timeline.map((step, index) => {
              const isLast = index === timeline.length - 1;
              const stepColor =
                step.isCompleted || step.isActive
                  ? getStatusColor(step.status)
                  : colors.border;

              return (
                <View
                  key={index}
                  style={{ flexDirection: "row", minHeight: 70 }}
                >
                  {/* Timeline Line */}
                  <View style={{ width: 40, alignItems: "center" }}>
                    <View
                      style={{
                        width: step.isActive ? 16 : 12,
                        height: step.isActive ? 16 : 12,
                        borderRadius: 8,
                        backgroundColor:
                          step.isCompleted || step.isActive
                            ? stepColor
                            : colors.background,
                        borderWidth: step.isCompleted || step.isActive ? 0 : 2,
                        borderColor: colors.border,
                        zIndex: 1,
                      }}
                    />
                    {!isLast && (
                      <View
                        style={{
                          width: 2,
                          flex: 1,
                          backgroundColor: step.isCompleted
                            ? stepColor
                            : colors.border,
                          marginVertical: 4,
                        }}
                      />
                    )}
                  </View>

                  {/* Content */}
                  <View style={{ flex: 1, paddingBottom: 16 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flexWrap: "wrap",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 15,
                          fontWeight: "600",
                          color: step.isActive
                            ? stepColor
                            : step.isCompleted
                              ? colors.text
                              : colors.textSecondary,
                        }}
                      >
                        {step.status}
                      </Text>
                      {step.isActive && (
                        <View
                          style={{
                            marginLeft: 8,
                            backgroundColor: stepColor + "20",
                            paddingHorizontal: 8,
                            paddingVertical: 2,
                            borderRadius: 10,
                          }}
                        >
                          <Text
                            style={{
                              color: stepColor,
                              fontSize: 10,
                              fontWeight: "600",
                            }}
                          >
                            Current
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginTop: 4,
                      }}
                    >
                      {step.description}
                    </Text>
                    {step.date && (
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.primary,
                          marginTop: 4,
                        }}
                      >
                        {new Date(
                          new Date(step.date).getTime() + 5.5 * 60 * 60 * 1000,
                        ).toLocaleString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Tracking Link */}
        {currentOrder.tracking_url && (
          <View style={{ marginHorizontal: 16 }}>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "space-between",
                borderWidth: 1,
                borderColor: colors.primary + "30",
              }}
              onPress={handleTrackingLink}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={{
                    padding: 8,
                    borderRadius: 8,
                    backgroundColor: colors.primary + "20",
                    marginRight: 12,
                  }}
                >
                  <Feather
                    name="external-link"
                    size={18}
                    color={colors.primary}
                  />
                </View>
                <View>
                  <Text style={{ fontWeight: "600", color: colors.text }}>
                    Track on Carrier Website
                  </Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
                    {currentOrder.carrier ||
                      currentOrder.tracking_info?.carrier ||
                      "Courier Partner"}
                  </Text>
                </View>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
