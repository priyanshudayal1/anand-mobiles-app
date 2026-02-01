import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Star, Heart, ShoppingCart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";
import { useCartStore } from "../../store/useCart";
import { useWishlistStore } from "../../store/useWishlist";

const { width } = Dimensions.get("window");

export default function ProductCard({
  product,
  size = "medium", // 'small', 'medium', 'large'
  showRating = true,
  onPress,
}) {
  const { colors } = useTheme();
  const router = useRouter();

  // Store Integration
  const { addItem: addToCart } = useCartStore();
  const wishlistStore = useWishlistStore();

  // Safe access to wishlist store methods
  const wishlistItems = wishlistStore.items || [];
  const addToWishlist = wishlistStore.addItem;
  const removeFromWishlist = wishlistStore.removeItem;

  // Determine if item is in wishlist
  const isWishlisted = wishlistStore.isInWishlist
    ? wishlistStore.isInWishlist(product.id || product._id)
    : wishlistItems.some(
        (item) => item.id === product.id || item.product_id === product.id,
      );

  const [isWishlistLoading, setIsWishlistLoading] = useState(false);

  // Calculate dimensions based on size
  const cardWidth =
    size === "small"
      ? (width - 48) / 2.5
      : size === "large"
        ? width - 32
        : (width - 48) / 2;

  const imageHeight = size === "small" ? 100 : size === "large" ? 200 : 140;

  // Price & Variant Logic (Matching Web)
  const firstVariant = product.valid_options?.[0];

  const displayPrice = Number(
    firstVariant?.discounted_price ||
      firstVariant?.price ||
      product.discount_price ||
      product.discounted_price ||
      product.offer_price ||
      product.price ||
      0,
  );

  const originalPrice = Number(
    firstVariant?.price || product.price || product.original_price || 0,
  );

  const hasDiscount =
    originalPrice > 0 && displayPrice > 0 && originalPrice > displayPrice;

  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;

  // Stock status
  const inStock =
    product.in_stock !== false &&
    (product.stock === undefined || product.stock > 0);

  // Handlers
  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      router.push(
        `/product/${product.id || product.product_id || product._id}`,
      );
    }
  };

  const handleAddToCart = (e) => {
    // Stop propagation if possible (though View doesn't support it directly in RN like Web)
    // In RN, we just handle the touchable separately

    const defaultVariant = product.valid_options?.[0] || null;
    const productWithVariant = {
      ...product,
      id: product.id || product._id,
      price: displayPrice,
      variant_id: defaultVariant?.id || null,
      variant: defaultVariant
        ? {
            id: defaultVariant.id,
            color: defaultVariant.colors,
            storage: defaultVariant.storage,
            ram: defaultVariant.ram,
            price: defaultVariant.discounted_price || defaultVariant.price,
          }
        : null,
    };

    addToCart(productWithVariant, 1);
    // Optional: Show toast or feedback
  };

  const handleWishlistToggle = async () => {
    if (isWishlistLoading) return;
    setIsWishlistLoading(true);

    try {
      if (isWishlisted) {
        // We typically need the wishlist item ID to remove strings attached to the user's wishlist
        // If the store handles logic by product ID, passing product.id is fine.
        // Assuming removeItem takes product ID or we find the item ID
        const wishlistItem = wishlistItems.find(
          (item) => item.id === product.id || item.product_id === product.id,
        );
        const removeId = wishlistItem?.item_id || product.id;
        await removeFromWishlist(removeId);
      } else {
        const defaultVariant = product.valid_options?.[0] || null;
        const productWithVariant = {
          ...product,
          id: product.id || product._id,
          price: displayPrice,
          variant_id: defaultVariant?.id || null,
          variant: defaultVariant
            ? {
                id: defaultVariant.id,
                color: defaultVariant.colors,
                storage: defaultVariant.storage,
                ram: defaultVariant.ram,
                price: defaultVariant.discounted_price || defaultVariant.price,
              }
            : null,
        };
        await addToWishlist(productWithVariant);
      }
    } catch (error) {
      console.error("Wishlist action failed", error);
    } finally {
      setIsWishlistLoading(false);
    }
  };

  // Safe checks for strings
  const brandName = product.brand || "";
  const categoryName = product.category || "";
  const displayName =
    product.name || `${brandName} ${product.model || ""}`.trim();
  const ratingValue = typeof product.rating === "number" ? product.rating : 0;
  const reviewsCount = product.reviews_count || 0;

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={{
        width: cardWidth,
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      }}
      activeOpacity={0.9}
    >
      {/* Product Image Section */}
      <View
        style={{
          height: imageHeight,
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
          padding: 8,
          position: "relative",
        }}
      >
        <Image
          source={{
            uri:
              product.image ||
              product.images?.[0] ||
              "https://via.placeholder.com/150",
          }}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={200}
        />

        {/* Discount Badge */}
        {discountPercent > 0 && inStock && (
          <View
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              backgroundColor: colors.error,
              paddingHorizontal: 6,
              paddingVertical: 3,
              borderRadius: 4,
              zIndex: 10,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 10, fontWeight: "bold" }}
            >
              {discountPercent}% OFF
            </Text>
          </View>
        )}

        {/* Out of Stock Badge */}
        {!inStock && (
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(255,255,255,0.7)",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 20,
            }}
          >
            <View
              style={{
                backgroundColor: "#374151",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                Out of Stock
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Product Info Section */}
      <View style={{ padding: size === "small" ? 8 : 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 8,
          }}
        >
          {/* Text Information */}
          <View style={{ flex: 1 }}>
            {/* Brand & Category */}
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginBottom: 4,
              }}
              numberOfLines={1}
            >
              {[brandName, categoryName].filter(Boolean).join(" • ")}
            </Text>

            {/* Title */}
            <Text
              style={{
                fontSize: size === "small" ? 12 : 13,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 6,
                lineHeight: 18,
              }}
              numberOfLines={2}
            >
              {displayName}
            </Text>

            {/* Rating */}
            {showRating && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 6,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.success + "20",
                    paddingHorizontal: 4,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginRight: 6,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 10,
                      fontWeight: "700",
                      color: colors.success,
                      marginRight: 2,
                    }}
                  >
                    {ratingValue.toFixed(1)}
                  </Text>
                  <Star size={8} color={colors.success} fill={colors.success} />
                </View>
                {reviewsCount > 0 && (
                  <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                    ({reviewsCount})
                  </Text>
                )}
              </View>
            )}

            {/* Price */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <Text
                style={{
                  fontSize: size === "small" ? 14 : 16,
                  fontWeight: "bold",
                  color: colors.text,
                }}
              >
                ₹{displayPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    textDecorationLine: "line-through",
                  }}
                >
                  ₹{originalPrice.toLocaleString()}
                </Text>
              )}
            </View>
          </View>

          {/* Wishlist Button */}
          <TouchableOpacity
            onPress={handleWishlistToggle}
            disabled={isWishlistLoading}
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: isWishlisted
                ? colors.primary + "20"
                : colors.backgroundSecondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {isWishlistLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Heart
                size={16}
                color={isWishlisted ? colors.primary : colors.textSecondary}
                fill={isWishlisted ? colors.primary : "transparent"}
              />
            )}
          </TouchableOpacity>
        </View>

        {/* Add to Cart Button */}
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={!inStock}
          style={{
            marginTop: 12,
            backgroundColor: inStock ? colors.primary : colors.border,
            borderRadius: 8,
            paddingVertical: 8,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            gap: 6,
            opacity: inStock ? 1 : 0.7,
          }}
        >
          <ShoppingCart size={14} color={colors.white} />
          <Text
            style={{ color: colors.white, fontSize: 12, fontWeight: "600" }}
          >
            {inStock ? "Add to Cart" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}
