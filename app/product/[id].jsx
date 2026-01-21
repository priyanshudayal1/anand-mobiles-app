import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Share,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  ShoppingCart,
  Share2,
  Heart,
  Star,
  Minus,
  Plus,
  Check,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import { useCartStore } from "../../store/useCart";
import { useAuthStore } from "../../store/useAuth";
import ProductTabs from "../../components/home/ProductTabs";
import EMIOffers from "../../components/home/EMIOffers";
import TrustBadges from "../../components/home/TrustBadges";
import RelatedProducts from "../../components/home/RelatedProducts";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const {
    currentProduct,
    isLoadingProduct,
    fetchProductDetails,
    clearCurrentProduct,
    getProductsByCategory,
  } = useProducts();
  const { addToCart, isLoading: isCartLoading } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);

  // Fetch product on mount or id change
  useEffect(() => {
    if (id) {
      loadProduct();
    }
    return () => {
      clearCurrentProduct();
      setRelatedProducts([]);
    };
  }, [id]);

  // Set initial variant when product loads and fetch related products
  useEffect(() => {
    if (currentProduct) {
      if (currentProduct.valid_options?.length > 0) {
        setSelectedVariant(currentProduct.valid_options[0]);
      }

      // Fetch related products if category exists
      if (currentProduct.category) {
        fetchRelatedProducts();
      }
    }
  }, [currentProduct]);

  const loadProduct = async () => {
    await fetchProductDetails(id);
  };

  const fetchRelatedProducts = async () => {
    if (!currentProduct?.category) return;
    const products = await getProductsByCategory(currentProduct.category);
    setRelatedProducts(products);
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProduct();
    setRefreshing(false);
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out this product: ${currentProduct?.name}`,
        url: `http://127.0.0.1:8000/product/${id}`, // Replace with actual URL structure
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!currentProduct) return;

    setAddingToCart(true);
    try {
      // Use variant ID if selected, otherwise null
      const variantId = selectedVariant ? selectedVariant.id : null;
      await addToCart(
        currentProduct.id || currentProduct.product_id,
        quantity,
        variantId,
      );
      Alert.alert("Success", "Added to cart!");
    } catch (error) {
      Alert.alert("Error", "Failed to add to cart: " + error.message);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (currentProduct?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };

  if (isLoadingProduct && !currentProduct) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 20 }}>
          Product not found
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            padding: 12,
            backgroundColor: colors.primary,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: colors.white }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Derived state
  const images =
    currentProduct.images &&
    Array.isArray(currentProduct.images) &&
    currentProduct.images.length > 0
      ? [...currentProduct.images]
      : [];

  if (images.length === 0) {
    if (currentProduct.image) images.push(currentProduct.image);
    else if (currentProduct.image_url) images.push(currentProduct.image_url);
  }

  // Ensure we have unique images if mixed sources
  const validImages = [...new Set(images.filter((img) => img))];

  const price = selectedVariant
    ? selectedVariant.discounted_price || selectedVariant.price
    : currentProduct.discount_price ||
      currentProduct.discounted_price ||
      currentProduct.price;

  const originalPrice = selectedVariant
    ? selectedVariant.price
    : currentProduct.price;

  const hasDiscount = originalPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const name =
    currentProduct.name || currentProduct.title || currentProduct.product_name;
  const description = currentProduct.description || "No description available.";
  const inStock =
    currentProduct.in_stock !== false &&
    (currentProduct.stock === undefined || currentProduct.stock > 0);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>

        <View style={{ flexDirection: "row", gap: 16 }}>
          <TouchableOpacity onPress={handleShare} style={{ padding: 4 }}>
            <Share2 size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={{ padding: 4 }}
          >
            <ShoppingCart size={24} color={colors.text} />
            {/* Badge logic can go here */}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Image Carousel */}
        <View
          style={{
            height: 300,
            backgroundColor: colors.white,
            marginBottom: 16,
          }}
        >
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x /
                  e.nativeEvent.layoutMeasurement.width,
              );
              if (slide !== activeImageIndex) {
                setActiveImageIndex(slide);
              }
            }}
            scrollEventThrottle={16}
          >
            {validImages.length > 0 ? (
              validImages.map((img, index) => (
                <View
                  key={index}
                  style={{
                    width,
                    height: 300,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{
                      uri:
                        typeof img === "string" ? img : img?.image || img?.url,
                    }}
                    style={{ width: width - 40, height: 280 }}
                    contentFit="contain"
                    transition={500}
                  />
                </View>
              ))
            ) : (
              <View
                style={{
                  width,
                  height: 300,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: colors.textSecondary }}>
                  No Image Available
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Pagination Dots */}
          {validImages.length > 0 && (
            <View
              style={{
                position: "absolute",
                bottom: 16,
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {validImages.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor:
                      i === activeImageIndex ? colors.primary : colors.border,
                  }}
                />
              ))}
            </View>
          )}
        </View>

        {/* Product Info */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.cardBg,
            marginBottom: 12,
          }}
        >
          {/* Brand/Category Tag */}
          {currentProduct.brand && (
            <Text
              style={{
                color: colors.primary,
                fontSize: 12,
                fontWeight: "600",
                marginBottom: 4,
              }}
            >
              {currentProduct.brand.name || currentProduct.brand}
            </Text>
          )}

          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            {name}
          </Text>

          {/* Rating */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                marginRight: 8,
                backgroundColor: colors.success + "20",
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 4,
              }}
            >
              <Text
                style={{
                  color: colors.success,
                  fontWeight: "bold",
                  marginRight: 4,
                }}
              >
                {currentProduct.rating || 4.5}
              </Text>
              <Star
                size={14}
                color={colors.success}
                fill={colors.success}
                style={{ marginTop: 2 }}
              />
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13 }}>
              ({currentProduct.reviews_count || 120} reviews)
            </Text>
          </View>

          {/* Price */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "flex-end",
              marginBottom: 12,
            }}
          >
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}
            >
              ₹{price?.toLocaleString()}
            </Text>
            {hasDiscount && (
              <>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.textSecondary,
                    textDecorationLine: "line-through",
                    marginLeft: 8,
                    marginBottom: 4,
                  }}
                >
                  ₹{originalPrice?.toLocaleString()}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.success,
                    fontWeight: "700",
                    marginLeft: 8,
                    marginBottom: 4,
                  }}
                >
                  {discountPercentage}% OFF
                </Text>
              </>
            )}
          </View>

          {/* Stock Status */}
          <Text
            style={{
              color: inStock ? colors.success : colors.error,
              fontWeight: "600",
              fontSize: 14,
            }}
          >
            {inStock ? "In Stock" : "Out of Stock"}
          </Text>

          {/* Price Breakdown */}
          <View
            style={{
              marginTop: 16,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                Price:
              </Text>
              <Text
                style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}
              >
                ₹{price?.toLocaleString()}
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
                Delivery:
              </Text>
              <Text
                style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}
              >
                ₹99
              </Text>
            </View>
            <View
              style={{
                height: 1,
                backgroundColor: colors.border,
                marginVertical: 8,
              }}
            />
            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
              <Text
                style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}
              >
                Total:
              </Text>
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 16,
                  fontWeight: "bold",
                }}
              >
                ₹{(price + 99)?.toLocaleString()}
              </Text>
            </View>
          </View>
        </View>

        {/* Info badges */}
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
          <TrustBadges />
        </View>

        {/* EMI Offers */}
        <View style={{ paddingHorizontal: 16 }}>
          <EMIOffers price={price} />
        </View>

        {/* Variants (If any) */}
        {currentProduct.valid_options &&
          currentProduct.valid_options.length > 0 && (
            <View
              style={{
                padding: 16,
                backgroundColor: colors.cardBg,
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Select Option
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {currentProduct.valid_options.map((option, index) => {
                  const isSelected =
                    selectedVariant && selectedVariant.id === option.id;
                  return (
                    <TouchableOpacity
                      key={index}
                      onPress={() => {
                        setSelectedVariant(option);
                        setQuantity(1);
                      }}
                      style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: isSelected
                          ? colors.primary
                          : colors.border,
                        backgroundColor: isSelected
                          ? colors.primary + "10"
                          : "transparent",
                      }}
                    >
                      <Text
                        style={{
                          color: isSelected ? colors.primary : colors.text,
                          fontWeight: isSelected ? "700" : "400",
                        }}
                      >
                        {option.name ||
                          `${option.color || ""} ${option.storage || ""}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

        {/* Quantity */}
        <View
          style={{
            padding: 16,
            backgroundColor: colors.cardBg,
            marginBottom: 12,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
            Quantity
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={() => handleQuantityChange(-1)}
              style={{ padding: 8 }}
              disabled={quantity <= 1}
            >
              <Minus
                size={20}
                color={quantity <= 1 ? colors.textSecondary : colors.text}
              />
            </TouchableOpacity>

            <Text
              style={{
                paddingHorizontal: 12,
                fontSize: 16,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {quantity}
            </Text>

            <TouchableOpacity
              onPress={() => handleQuantityChange(1)}
              style={{ padding: 8 }}
            >
              <Plus size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs: Description, Specs, Reviews */}
        <ProductTabs product={currentProduct} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <RelatedProducts
            products={relatedProducts}
            currentProductId={currentProduct.id || currentProduct.product_id}
          />
        )}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: colors.cardBg,
          paddingVertical: 12, // Reduced padding to avoid excessively large bar on some devices
          paddingHorizontal: 16,
          paddingBottom: Platform.OS === "ios" ? 24 : 12, // Extra padding for iOS home indicator
          borderTopWidth: 1,
          borderTopColor: colors.border,
          flexDirection: "row",
          gap: 12,
          elevation: 20,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
      >
        <TouchableOpacity
          onPress={handleAddToCart}
          disabled={!inStock || addingToCart}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.primary,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <Text
              style={{ color: colors.primary, fontSize: 16, fontWeight: "700" }}
            >
              Add to Cart
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleBuyNow}
          disabled={!inStock}
          style={{
            flex: 1,
            paddingVertical: 14,
            borderRadius: 12,
            backgroundColor: inStock ? colors.primary : colors.textSecondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 16, fontWeight: "700" }}
          >
            {inStock ? "Buy Now" : "Out of Stock"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
