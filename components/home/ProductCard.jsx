import React from "react";
import {View, Text, TouchableOpacity, Dimensions} from "react-native";
import {Image} from "expo-image";
import {Star} from "lucide-react-native";
import {useRouter} from "expo-router";
import {useTheme} from "../../store/useTheme";

const {width} = Dimensions.get("window");

export default function ProductCard({
  product,
  size = "medium", // 'small', 'medium', 'large'
  showRating = true,
  onPress,
}) {
  const {colors} = useTheme();
  const router = useRouter();

  // Calculate dimensions based on size
  const cardWidth =
    size === "small"
      ? (width - 48) / 2.5
      : size === "large"
        ? width - 32
        : (width - 48) / 2;

  const imageHeight = size === "small" ? 100 : size === "large" ? 200 : 120;

  // Price calculations
  const discountPrice =
    product.discount_price || product.discounted_price || product.price;
  const originalPrice = product.price;
  const hasDiscount =
    originalPrice && discountPrice && originalPrice > discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  // Stock status
  const inStock =
    product.in_stock !== false &&
    (product.stock === undefined || product.stock > 0);

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      router.push({
        pathname: "/(tabs)/menu",
        params: { productId: product.id },
      });
    }
  };

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
      }}
      activeOpacity={0.8}
    >
      {/* Product Image */}
      <View
        style={{
          height: imageHeight,
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
          padding: 8,
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
        {discountPercent > 0 && (
          <View
            style={{
              position: "absolute",
              top: 8,
              right: 8,
              backgroundColor: colors.error,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
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
              top: 8,
              left: 8,
              backgroundColor: colors.textSecondary,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 10, fontWeight: "bold" }}
            >
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={{ padding: size === "small" ? 8 : 10 }}>
        {/* Brand */}
        {product.brand && size !== "small" && (
          <Text
            style={{
              fontSize: 10,
              color: colors.primary,
              fontWeight: "600",
              textTransform: "uppercase",
              marginBottom: 2,
            }}
          >
            {product.brand}
          </Text>
        )}

        {/* Product Name */}
        <Text
          style={{
            fontSize: size === "small" ? 12 : 13,
            fontWeight: "500",
            color: colors.text,
            marginBottom: 6,
            lineHeight: size === "small" ? 16 : 18,
          }}
          numberOfLines={2}
        >
          {product.name ||
            `${product.brand || ""} ${product.model || ""}`.trim()}
        </Text>

        {/* Rating */}
        {showRating && product.rating > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            <Star size={12} color={colors.warning} fill={colors.warning} />
            <Text
              style={{
                fontSize: 11,
                color: colors.textSecondary,
                marginLeft: 4,
              }}
            >
              {product.rating.toFixed(1)}
              {product.reviews_count && <Text> ({product.reviews_count})</Text>}
            </Text>
          </View>
        )}

        {/* Price */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 4,
          }}
        >
          <Text
            style={{
              fontSize: size === "small" ? 13 : 15,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            ₹{(discountPrice || 0).toLocaleString()}
          </Text>
          {hasDiscount && (
            <Text
              style={{
                fontSize: size === "small" ? 10 : 11,
                color: colors.textSecondary,
                textDecorationLine: "line-through",
              }}
            >
              ₹{originalPrice.toLocaleString()}
            </Text>
          )}
        </View>

        {/* Variant Info */}
        {product.variant && size !== "small" && (
          <View
            style={{
              marginTop: 6,
              flexDirection: "row",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            {product.variant.storage?.length > 0 && (
              <Text style={{ fontSize: 10, color: colors.textSecondary }}>
                {product.variant.storage.join(" | ")}
              </Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}
