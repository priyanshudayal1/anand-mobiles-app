import React, { useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.4;

const ProductCard = ({ product, colors, onPress }) => {
  const discountPrice =
    product?.discount_price || product?.discounted_price || product?.price || 0;
  const originalPrice = product?.price || 0;
  const hasDiscount =
    originalPrice && discountPrice && originalPrice > discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  // Get product name safely
  const productName =
    product?.name ||
    [product?.brand, product?.model].filter(Boolean).join(" ") ||
    "Product";

  // Get rating safely
  const rating = typeof product?.rating === "number" ? product.rating : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      style={{
        width: CARD_WIDTH,
        marginRight: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          height: 100,
          backgroundColor: colors.cardBg,
          justifyContent: "center",
          alignItems: "center",
          padding: 8,
        }}
      >
        <Image
          source={{
            uri:
              product?.image ||
              product?.images?.[0] ||
              "https://via.placeholder.com/150",
          }}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={200}
        />
        {discountPercent > 0 ? (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: colors.error,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 9, fontWeight: "bold" }}
            >
              {discountPercent}% OFF
            </Text>
          </View>
        ) : null}
      </View>

      <View style={{ padding: 8 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: colors.text,
            marginBottom: 4,
            lineHeight: 16,
          }}
          numberOfLines={2}
        >
          {productName}
        </Text>

        {rating > 0 ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Star size={10} color={colors.warning} fill={colors.warning} />
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginLeft: 2,
              }}
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        ) : null}

        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text
            style={{ fontSize: 13, fontWeight: "bold", color: colors.text }}
          >
            ₹{discountPrice.toLocaleString()}
          </Text>
          {hasDiscount ? (
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                textDecorationLine: "line-through",
              }}
            >
              ₹{originalPrice.toLocaleString()}
            </Text>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Memoize ProductCard to prevent unnecessary re-renders
const MemoizedProductCard = React.memo(ProductCard, (prevProps, nextProps) => {
  return (
    prevProps.product?.id === nextProps.product?.id &&
    prevProps.product?.price === nextProps.product?.price &&
    prevProps.colors === nextProps.colors
  );
});

export default function HorizontalProductScroll({
  products = [],
  title,
  description,
  onSeeAll,
  showHeader = true,
}) {
  const { colors } = useTheme();
  const router = useRouter();

  const handleProductPress = useCallback(
    (product) => {
      router.push(`/product/${product?.id || product?.product_id || "0"}`);
    },
    [router],
  );

  const handleSeeAll = useCallback(() => {
    if (onSeeAll) {
      onSeeAll();
    } else {
      router.push("/(tabs)/menu");
    }
  }, [onSeeAll, router]);

  const renderItem = useCallback(
    ({ item }) => (
      <MemoizedProductCard
        product={item}
        colors={colors}
        onPress={handleProductPress}
      />
    ),
    [colors, handleProductPress],
  );

  const keyExtractor = useCallback(
    (item, index) => item?.id?.toString() || index.toString(),
    [],
  );

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 8,
        paddingVertical: 16,
        backgroundColor: colors.cardBg,
      }}
    >
      {showHeader && title ? (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            marginBottom: 12,
          }}
        >
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
            >
              {title}
            </Text>
            <View
              style={{
                height: 3,
                width: 64,
                marginTop: 4,
                backgroundColor: colors.primary,
                borderRadius: 2,
              }}
            />
            {description ? (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                {description}
              </Text>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={handleSeeAll}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ fontWeight: "500", color: colors.primary }}>
              See All
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      ) : null}

      <FlatList
        data={products}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        windowSize={7}
      />
    </View>
  );
}
