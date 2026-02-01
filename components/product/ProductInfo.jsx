import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../store/useTheme";
import {
  Star,
  Share2,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react-native";

const ProductInfo = ({ product, selectedVariant, onShare }) => {
  const { colors } = useTheme();

  // Get current price based on selected variant or default
  const currentPrice =
    selectedVariant?.discounted_price ||
    selectedVariant?.price ||
    product.discountPrice ||
    product.discount_price ||
    product.price ||
    0;

  const originalPrice = selectedVariant?.price || product.price || 0;

  // Calculate stock based on variant or product
  const currentStock = selectedVariant?.stock ?? product.stock ?? 0;

  // Calculate discount
  const hasDiscount =
    currentPrice && originalPrice && currentPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  const name =
    product.name || product.title || product.product_name || "Product";
  const brand = product.brand?.name || product.brand || "";
  const rating = product.rating || product.average_rating || 0;
  const reviewsCount =
    product.total_reviews ||
    product.reviews_count ||
    (Array.isArray(product.reviews) ? product.reviews.length : 0);

  // Calculate EMI (approximate for display)
  const calculateEMI = (price, months = 12) => {
    if (!price || price < 3000) return null;
    return Math.round(price / months);
  };

  const emiAmount = calculateEMI(currentPrice);

  // Stock status
  const getStockStatus = () => {
    if (currentStock === 0) {
      return { text: "Out of Stock", color: colors.error, icon: AlertTriangle };
    } else if (currentStock <= 5) {
      return {
        text: `Only ${currentStock} left in stock - order soon`,
        color: colors.warning,
        icon: AlertTriangle,
      };
    } else if (currentStock <= 10) {
      return {
        text: `${currentStock} items available`,
        color: colors.textSecondary,
        icon: Info,
      };
    }
    return { text: "In Stock", color: colors.success, icon: CheckCircle };
  };

  const stockStatus = getStockStatus();
  const StockIcon = stockStatus.icon;

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: 16,
        backgroundColor: colors.white,
      }}
    >
      {/* Brand Badge */}
      {brand ? (
        <View style={{ marginBottom: 8 }}>
          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: colors.primary + "15",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}
            >
              {brand}
            </Text>
          </View>
        </View>
      ) : null}

      {/* Product Title */}
      <Text
        style={{
          fontSize: 18,
          fontWeight: "600",
          color: colors.text,
          lineHeight: 26,
          marginBottom: 8,
        }}
      >
        {name}
      </Text>

      {/* Ratings */}
      {rating > 0 && (
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
          activeOpacity={0.7}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: colors.success,
              paddingHorizontal: 8,
              paddingVertical: 3,
              borderRadius: 4,
              marginRight: 8,
            }}
          >
            <Text
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: colors.white,
                marginRight: 3,
              }}
            >
              {rating.toFixed(1)}
            </Text>
            <Star size={12} color={colors.white} fill={colors.white} />
          </View>
          <Text style={{ color: colors.primary, fontSize: 14 }}>
            {reviewsCount.toLocaleString()}{" "}
            {reviewsCount === 1 ? "rating" : "ratings"}
          </Text>
        </TouchableOpacity>
      )}

      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          width: "100%",
          marginBottom: 12,
        }}
      />

      {/* Price Section */}
      <View style={{ marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          {hasDiscount && (
            <View
              style={{
                backgroundColor: colors.error,
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 4,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "bold",
                  color: colors.white,
                }}
              >
                {discountPercentage}% OFF
              </Text>
            </View>
          )}
          <Text style={{ fontSize: 28, fontWeight: "700", color: colors.text }}>
            ₹{currentPrice?.toLocaleString()}
          </Text>
        </View>

        {hasDiscount && (
          <View
            style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}
          >
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
              M.R.P.:{" "}
            </Text>
            <Text
              style={{
                textDecorationLine: "line-through",
                color: colors.textSecondary,
                fontSize: 14,
              }}
            >
              ₹{originalPrice?.toLocaleString()}
            </Text>
            <Text
              style={{
                color: colors.success,
                fontSize: 14,
                marginLeft: 8,
                fontWeight: "500",
              }}
            >
              You save ₹{(originalPrice - currentPrice).toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      {/* Stock Status */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}
      >
        <StockIcon size={16} color={stockStatus.color} />
        <Text
          style={{
            color: stockStatus.color,
            fontSize: 14,
            marginLeft: 6,
            fontWeight: "500",
          }}
        >
          {stockStatus.text}
        </Text>
      </View>

      {/* Selected Variant Info */}
      {selectedVariant && (
        <View
          style={{
            backgroundColor: colors.primary + "10",
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 8,
            marginBottom: 12,
            flexDirection: "row",
            flexWrap: "wrap",
          }}
        >
          <Text style={{ color: colors.text, fontSize: 13 }}>Selected: </Text>
          {selectedVariant.colors && (
            <Text
              style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}
            >
              {selectedVariant.colors}
            </Text>
          )}
          {selectedVariant.storage && (
            <Text
              style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}
            >
              {selectedVariant.colors ? " | " : ""}
              {selectedVariant.storage}
            </Text>
          )}
          {selectedVariant.ram && (
            <Text
              style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}
            >
              {" | "}
              {selectedVariant.ram} RAM
            </Text>
          )}
        </View>
      )}

      {/* EMI Info */}
      {emiAmount && currentPrice >= 3000 && (
        <View
          style={{
            backgroundColor: colors.backgroundSecondary,
            paddingHorizontal: 12,
            paddingVertical: 10,
            borderRadius: 8,
            marginBottom: 8,
          }}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View>
              <Text style={{ fontSize: 14, color: colors.text }}>
                EMI from{" "}
                <Text style={{ fontWeight: "bold", color: colors.primary }}>
                  ₹{emiAmount.toLocaleString()}/month
                </Text>
              </Text>
              <Text
                style={{ fontSize: 12, color: colors.success, marginTop: 2 }}
              >
                No Cost EMI available
              </Text>
            </View>
            <TouchableOpacity>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 13,
                  fontWeight: "500",
                }}
              >
                View Plans
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <Text style={{ fontSize: 12, color: colors.textSecondary }}>
        Inclusive of all taxes
      </Text>
    </View>
  );
};

export default ProductInfo;
