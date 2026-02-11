import React, { useEffect, useCallback } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from "react-native";
import { Image } from "expo-image";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { useTheme } from "../../store/useTheme";
import { useCartStore } from "../../store/useCart";
import CheckoutModal from "../../components/checkout/CheckoutModal";

export default function Cart() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors, isDarkMode } = useTheme();
  const {
    cartItems,
    cartTotal,
    isLoading,
    fetchCart,
    incrementQuantity,
    decrementQuantity,
    removeFromCart,
    getCartCount,
  } = useCartStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const [isCheckoutVisible, setIsCheckoutVisible] = React.useState(false);
  const [updatingItemId, setUpdatingItemId] = React.useState(null);
  const [removingItemId, setRemovingItemId] = React.useState(null);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchCart();
    } finally {
      setRefreshing(false);
    }
  }, [fetchCart]);

  const handleRemove = useCallback(
    (itemId) => {
      Alert.alert(
        "Remove Item",
        "Are you sure you want to remove this item from your cart?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                setRemovingItemId(itemId);
                await removeFromCart(itemId);
              } catch (_error) {
                Alert.alert("Error", "Failed to remove item");
              } finally {
                setRemovingItemId(null);
              }
            },
          },
        ],
      );
    },
    [removeFromCart],
  );

  const handleIncrement = useCallback(
    async (itemId) => {
      try {
        setUpdatingItemId(itemId);
        await incrementQuantity(itemId);
      } catch (_error) {
        Alert.alert("Error", "Failed to update quantity");
      } finally {
        setUpdatingItemId(null);
      }
    },
    [incrementQuantity],
  );

  const handleDecrement = useCallback(
    async (itemId) => {
      try {
        setUpdatingItemId(itemId);
        await decrementQuantity(itemId);
      } catch (_error) {
        Alert.alert("Error", "Failed to update quantity");
      } finally {
        setUpdatingItemId(null);
      }
    },
    [decrementQuantity],
  );

  const handleCheckout = useCallback(() => {
    setIsCheckoutVisible(true);
  }, []);

  const handleProductPress = useCallback(
    (item) => {
      const productId = item.product_id || item.product?.id;
      if (productId) {
        router.push({
          pathname: "/(tabs)/menu",
          params: { productId },
        });
      }
    },
    [router],
  );

  const renderCartItem = useCallback(
    ({ item }) => {
      const product = item.product || item;
      const price =
        item.discounted_price || product.discount_price || product.price || 0;
      const originalPrice = product.price || price;
      const hasDiscount = originalPrice > price;
      const isUpdating = updatingItemId === item.id;
      const isRemoving = removingItemId === item.id;

      return (
        <View
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: 16,
            marginBottom: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          <TouchableOpacity
            onPress={() => handleProductPress(item)}
            activeOpacity={0.9}
            style={{ flexDirection: "row", padding: 12 }}
          >
            {/* Product Image */}
            <View
              style={{
                width: 80,
                height: 80,
                backgroundColor: colors.cardBg,
                borderRadius: 8,
                justifyContent: "center",
                alignItems: "center",
                padding: 4,
              }}
            >
              <Image
                source={{
                  uri:
                    product.image ||
                    product.images?.[0] ||
                    "https://via.placeholder.com/100",
                }}
                style={{ width: "100%", height: "100%" }}
                contentFit="contain"
                transition={200}
              />
            </View>

            {/* Product Details */}
            <View
              style={{
                flex: 1,
                marginLeft: 12,
                justifyContent: "space-between",
              }}
            >
              {/* Brand */}
              {product.brand && (
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.primary,
                    fontWeight: "600",
                    textTransform: "uppercase",
                  }}
                >
                  {product.brand}
                </Text>
              )}

              {/* Product Name */}
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "500",
                  color: colors.text,
                  marginTop: 2,
                }}
                numberOfLines={2}
              >
                {product.name ||
                  `${product.brand || ""} ${product.model || ""}`.trim()}
              </Text>

              {/* Variant Info */}
              {item.variant_name && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {item.variant_name}
                </Text>
              )}

              {/* Price */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  ₹{(price * (item.quantity || 1)).toLocaleString()}
                </Text>
                {hasDiscount && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      textDecorationLine: "line-through",
                      marginLeft: 8,
                    }}
                  >
                    ₹{(originalPrice * (item.quantity || 1)).toLocaleString()}
                  </Text>
                )}
              </View>
            </View>

            {/* Remove Button */}
            <TouchableOpacity
              onPress={() => handleRemove(item.id)}
              style={{ padding: 4 }}
              disabled={isRemoving || isUpdating}
            >
              {isRemoving ? (
                <ActivityIndicator size="small" color={colors.error} />
              ) : (
                <Feather name="trash-2" size={18} color={colors.error} />
              )}
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Quantity Controls */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
              ₹{price.toLocaleString()} each
            </Text>

            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <TouchableOpacity
                onPress={() => handleDecrement(item.id)}
                disabled={isUpdating || isRemoving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isUpdating || isRemoving ? 0.5 : 1,
                }}
              >
                <Feather name="minus" size={16} color={colors.text} />
              </TouchableOpacity>

              <View
                style={{
                  marginHorizontal: 16,
                  minWidth: 32,
                  alignItems: "center",
                }}
              >
                {isUpdating ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: colors.text,
                      textAlign: "center",
                    }}
                  >
                    {item.quantity || 1}
                  </Text>
                )}
              </View>

              <TouchableOpacity
                onPress={() => handleIncrement(item.id)}
                disabled={isUpdating || isRemoving}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.primary,
                  justifyContent: "center",
                  alignItems: "center",
                  opacity: isUpdating || isRemoving ? 0.5 : 1,
                }}
              >
                <Feather name="plus" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    },
    [
      colors,
      updatingItemId,
      removingItemId,
      handleProductPress,
      handleRemove,
      handleDecrement,
      handleIncrement,
    ],
  );

  const totalItems = getCartCount();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar
        style={isDarkMode() ? "light" : "dark"}
        backgroundColor={colors.surface}
      />

      {/* Status bar fill */}
      <View style={{ height: insets.top, backgroundColor: colors.surface }} />

      {/* Header */}
      <View
        style={{
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
          My Cart
        </Text>
        {totalItems > 0 && (
          <View
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 8,
              paddingVertical: 2,
              borderRadius: 12,
              marginLeft: 8,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 12, fontWeight: "bold" }}
            >
              {totalItems}
            </Text>
          </View>
        )}
      </View>

      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={{ marginTop: 16, color: colors.textSecondary }}>
            Loading cart...
          </Text>
        </View>
      ) : cartItems.length === 0 ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
          }}
        >
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: colors.surface,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Feather
              name="shopping-cart"
              size={50}
              color={colors.textSecondary}
            />
          </View>
          <Text
            style={{
              color: colors.text,
              fontSize: 20,
              fontWeight: "bold",
              marginBottom: 8,
            }}
          >
            Your Cart is Empty
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              fontSize: 14,
              textAlign: "center",
              marginBottom: 24,
            }}
          >
            Looks like you haven&apos;t added anything to your cart yet.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)")}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "600" }}>
              Start Shopping
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlashList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item, index) =>
              item.id?.toString() ||
              item.product_id?.toString() ||
              `cart-item-${index}`
            }
            estimatedItemSize={180}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 200 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.primary}
              />
            }
          />

          {/* Bottom Checkout Section */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: Math.max(insets.bottom, 16),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Order Summary */}
            <View style={{ marginBottom: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Subtotal ({totalItems} items)
                </Text>
                <Text style={{ color: colors.text, fontSize: 14 }}>
                  ₹{cartTotal.toLocaleString()}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                  Delivery
                </Text>
                <Text
                  style={{
                    color: colors.success,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  FREE
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  paddingTop: 8,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 16,
                    fontWeight: "bold",
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 18,
                    fontWeight: "bold",
                  }}
                >
                  ₹{cartTotal.toLocaleString()}
                </Text>
              </View>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              onPress={handleCheckout}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                Proceed to Checkout
              </Text>
              <Feather name="arrow-right" size={20} color={colors.white} />
            </TouchableOpacity>
          </View>
        </>
      )}

      <CheckoutModal
        visible={isCheckoutVisible}
        onClose={() => setIsCheckoutVisible(false)}
        totalAmount={cartTotal}
      />
    </View>
  );
}
