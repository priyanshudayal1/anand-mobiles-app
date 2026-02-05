import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // 2 cards with padding

// Product Card Component
const ProductCard = React.memo(({ product, colors, onPress }) => {
  const discountPrice =
    product.discount_price || product.discounted_price || product.price;
  const originalPrice = product.price;
  const hasDiscount =
    originalPrice && discountPrice && originalPrice > discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

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
      {/* Product Image */}
      <View
        style={{
          height: 160,
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
      </View>

      {/* Product Info */}
      <View style={{ padding: 10 }}>
        {/* Product Name */}
        <Text
          style={{
            fontSize: 13,
            fontWeight: "500",
            color: colors.text,
            marginBottom: 6,
            lineHeight: 18,
          }}
          numberOfLines={2}
        >
          {product.name ||
            `${product.brand || ""} ${product.model || ""}`.trim()}
        </Text>

        {/* Rating */}
        {product.rating > 0 && (
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
            </Text>
          </View>
        )}

        {/* Price */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Text
            style={{ fontSize: 15, fontWeight: "bold", color: colors.text }}
          >
            ₹{(discountPrice || 0).toLocaleString()}
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
    </TouchableOpacity>
  );
});

ProductCard.displayName = "ProductCard";

export default function FeaturedSection({ showHeader = true }) {
  const { colors } = useTheme();
  const { featuredProducts } = useHome();
  const router = useRouter();

  // Fallback products if no data
  const displayProducts =
    featuredProducts.length > 0
      ? featuredProducts
      : [
          {
            id: "1",
            name: "iPhone 15 Pro Max",
            brand: "Apple",
            price: 159900,
            discount_price: 149900,
            rating: 4.8,
            image:
              "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
          },
          {
            id: "2",
            name: "Samsung Galaxy S24 Ultra",
            brand: "Samsung",
            price: 134999,
            discount_price: 124999,
            rating: 4.7,
            image:
              "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400",
          },
        ];

  const handleProductPress = React.useCallback(
    (product) => {
      // Navigate to product details
      router.push(`/product/${product.id || product.product_id}`);
    },
    [router],
  );

  const renderItem = React.useCallback(
    ({ item }) => (
      <ProductCard
        product={item}
        colors={colors}
        onPress={handleProductPress}
      />
    ),
    [colors, handleProductPress],
  );

  const getItemLayout = React.useCallback(
    (data, index) => ({
      length: CARD_WIDTH + 12,
      offset: (CARD_WIDTH + 12) * index,
      index,
    }),
    [],
  );

  const handleSeeAll = () => {
    router.push({
      pathname: "/products",
      params: { featured: "true" },
    });
  };

  return (
    <View
      style={{
        marginTop: 8,
        backgroundColor: colors.cardBg,
        paddingVertical: 16,
      }}
    >
      {/* Header */}
      {showHeader && (
        <>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-start",
              paddingHorizontal: 16,
              marginBottom: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <View style={{ alignSelf: "flex-start" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Featured Products
                </Text>
                <View
                  style={{
                    height: 3,
                    width: 40,
                    marginTop: 4,
                    backgroundColor: colors.primary,
                    borderRadius: 2,
                    alignSelf: "flex-start",
                  }}
                />
              </View>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                Discover our best-selling items handpicked for you
              </Text>
            </View>
            <TouchableOpacity onPress={handleSeeAll}>
              <Text style={{ fontWeight: "500", color: colors.primary }}>
                See All →
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Products Horizontal Scroll */}
      <FlatList
        data={displayProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        getItemLayout={getItemLayout}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={3}
        removeClippedSubviews={true}
      />
    </View>
  );
}
