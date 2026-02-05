import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Image } from "expo-image";
import { Star, Heart } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";
import { useWishlistStore } from "../../store/useWishlist";

const { width } = Dimensions.get("window");

function ProductCard({
  product,
  size = "medium", // 'small', 'medium', 'large'
  showRating = true,
  onPress,
}) {
  const { colors } = useTheme();
  const router = useRouter();
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
  const cardHeight = size === "small" ? 210 : size === "large" ? 320 : 250;

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
        height: cardHeight,
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

        {/* Rating Pill */}
        {showRating && (
          <View
            style={{
              position: "absolute",
              bottom: 8,
              left: 8,
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.cardBg,
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: colors.border,
              gap: 4,
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: colors.text,
              }}
            >
              {ratingValue.toFixed(1)}
            </Text>
            <Star size={10} color={colors.success} fill={colors.success} />
            {reviewsCount > 0 && (
              <>
                <View
                  style={{
                    width: 1,
                    height: 12,
                    backgroundColor: colors.textSecondary,
                    marginHorizontal: 2,
                  }}
                />
                <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                  {reviewsCount}
                </Text>
              </>
            )}
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
            {/* Title */}
            <View style={{ height: size === "small" ? 32 : 36, marginTop: 4 }}>
              <Text
                style={{
                  fontSize: size === "small" ? 12 : 13,
                  fontWeight: "600",
                  color: colors.text,
                  lineHeight: size === "small" ? 16 : 18,
                }}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {displayName}
              </Text>
            </View>

            {/* Brand & Category */}
            <View style={{ height: 16, justifyContent: "center" }}>
              <Text
                style={{
                  fontSize: 10,
                  color: colors.textSecondary,
                  lineHeight: 14,
                }}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {[brandName, categoryName].filter(Boolean).join(" • ") || " "}
              </Text>
            </View>

            {/* Price */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                height: 22,
                marginTop: 4,
              }}
            >
              <Text
                style={{
                  fontSize: size === "small" ? 14 : 16,
                  fontWeight: "bold",
                  color: colors.text,
                }}
                numberOfLines={1}
              >
                ₹{displayPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    textDecorationLine: "line-through",
                    marginLeft: 6,
                  }}
                  numberOfLines={1}
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
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(ProductCard, (prevProps, nextProps) => {
  // Only re-render if product data or key props changed
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.product?.stock === nextProps.product?.stock &&
    prevProps.product?.price === nextProps.product?.price &&
    prevProps.size === nextProps.size &&
    prevProps.showRating === nextProps.showRating
  );
});
