import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Share,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { ArrowLeft, Search, ShoppingCart, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import { useCartStore } from "../../store/useCart";
import { useWishlistStore } from "../../store/useWishlist";
import { useAuthStore } from "../../store/useAuth";
import { useToast } from "../../store/useToast";
import CustomModal from "../../components/common/CustomModal";
import { ProductDetailShimmer } from "../../components/common/ShimmerPlaceholder";

// Product Components
import ProductImageGallery from "../../components/product/ProductImageGallery";
import ProductInfo from "../../components/product/ProductInfo";
import ProductVariantSelector from "../../components/product/ProductVariantSelector";
import ProductQuantitySelector from "../../components/product/ProductQuantitySelector";
import ProductActions from "../../components/product/ProductActions";
import ProductAccordions from "../../components/product/ProductAccordions";
import RelatedProducts from "../../components/home/RelatedProducts";
import FrequentlyBoughtTogether from "../../components/product/FrequentlyBoughtTogether";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const isDark = isDarkMode();
  const insets = useSafeAreaInsets();

  const {
    currentProduct,
    isLoadingProduct,
    fetchProductDetails,
    clearCurrentProduct,
    getProductsByCategory,
  } = useProducts();
  const { addToCart, cartItems } = useCartStore();
  const {
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
    items: wishlistItems,
  } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isBuyingNow, setIsBuyingNow] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [bundleProducts, setBundleProducts] = useState([]);
  const [addingBundle, setAddingBundle] = useState(false);
  const { success, error } = useToast();

  const loadProduct = useCallback(async () => {
    if (id) {
      await fetchProductDetails(id);
    }
  }, [id, fetchProductDetails]);

  const fetchRelatedProducts = useCallback(async () => {
    if (!currentProduct?.category) return;
    const products = await getProductsByCategory(currentProduct.category);
    // Filter out current product from related
    const filtered = products.filter(
      (p) =>
        (p.id || p.product_id) !==
        (currentProduct.id || currentProduct.product_id),
    );
    setRelatedProducts(filtered.slice(0, 10));
    // Set bundle products — only in-stock items with normalized prices
    const inStockRelated = filtered.filter((p) => {
      const s = p.stock ?? p.quantity ?? p.inventory ?? 0;
      return s > 0;
    });
    const normalizedBundles = inStockRelated.slice(0, 3).map((p) => ({
      ...p,
      id: p.id || p.product_id,
      name: p.name || p.title || p.product_name || "Product",
      price: p.price || 0,
      originalPrice: p.price || p.original_price || 0,
      discountPrice: p.discount_price || p.discounted_price || p.price || 0,
      currentPrice: p.discount_price || p.discounted_price || p.price || 0,
      image: p.images?.[0] || p.image || p.image_url || null,
    }));
    setBundleProducts(normalizedBundles);
  }, [currentProduct?.category, currentProduct?.id, getProductsByCategory]);

  // Fetch product on mount or id change
  useEffect(() => {
    loadProduct();
    // Fetch wishlist for checking status
    if (isAuthenticated) {
      fetchWishlist();
    }
    return () => {
      clearCurrentProduct();
      setRelatedProducts([]);
      setSelectedVariant(null);
      setQuantity(1);
    };
  }, [id, loadProduct, clearCurrentProduct, isAuthenticated]);

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
  }, [currentProduct, fetchRelatedProducts]);

  // Reset quantity when variant changes
  useEffect(() => {
    setQuantity(1);
  }, [selectedVariant]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadProduct();
    if (isAuthenticated) {
      await fetchWishlist();
    }
    setRefreshing(false);
  }, [loadProduct, isAuthenticated, fetchWishlist]);

  const handleShare = async () => {
    try {
      const productName = currentProduct?.name || "this product";
      await Share.share({
        message: `Check out ${productName} on Anand Mobiles! https://anandmobiles.com/product/${id}`,
        title: productName,
      });
    } catch (error) {
      console.error("Share error:", error.message);
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
      const variantId = selectedVariant ? selectedVariant.id : null;
      await addToCart(
        currentProduct.id || currentProduct.product_id,
        quantity,
        variantId,
      );
      setShowCartModal(true);
    } catch (err) {
      error(err.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!currentProduct) return;

    setIsBuyingNow(true);
    try {
      const variantId = selectedVariant ? selectedVariant.id : null;
      await addToCart(
        currentProduct.id || currentProduct.product_id,
        quantity,
        variantId,
      );
      router.push("/cart");
    } catch (err) {
      error(err.message || "Failed to proceed");
    } finally {
      setIsBuyingNow(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!currentProduct) return;

    setAddingToWishlist(true);
    try {
      const productId = currentProduct.id || currentProduct.product_id;
      const variantId = selectedVariant ? selectedVariant.id : null;

      // Check if product is already in wishlist
      const inWishlist = isInWishlist(productId);

      if (inWishlist) {
        // Remove from wishlist
        const wishlistItem = wishlistItems.find(
          (item) => item.id === productId,
        );
        if (wishlistItem?.item_id) {
          const result = await removeFromWishlist(wishlistItem.item_id);
          if (result.success) {
            success(`${normalizedProduct.name} removed from wishlist`);
          } else {
            throw new Error(result.error || "Failed to remove from wishlist");
          }
        }
      } else {
        // Add to wishlist
        const result = await addToWishlist(productId, variantId);
        if (result.success && !result.alreadyExists) {
          success(`${normalizedProduct.name} added to wishlist`);
        } else if (result.alreadyExists) {
          useToast.getState().info("This item is already in your wishlist");
        } else {
          throw new Error(result.error || "Failed to add to wishlist");
        }
      }
    } catch (err) {
      error(err.message || "Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleWishlistFromGallery = () => {
    handleAddToWishlist();
  };

  const handleAddBundle = async () => {
    if (!isAuthenticated) {
      router.push("/(auth)/login");
      return;
    }

    if (!currentProduct || bundleProducts.length === 0) return;

    setAddingBundle(true);
    try {
      // Add current product
      const variantId = selectedVariant ? selectedVariant.id : null;
      await addToCart(
        currentProduct.id || currentProduct.product_id,
        quantity,
        variantId,
      );

      // Add all bundle products
      for (const product of bundleProducts) {
        await addToCart(product.id || product.product_id, 1, null);
      }

      success(`All ${bundleProducts.length + 1} items added to cart!`);
      setShowCartModal(true);
    } catch (err) {
      error(err.message || "Failed to add bundle to cart");
    } finally {
      setAddingBundle(false);
    }
  };

  // Cart item count for header badge
  const cartItemCount = cartItems?.length || 0;

  if (isLoadingProduct && !currentProduct) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <View style={{ height: insets.top, backgroundColor: colors.primary }} />
        <ProductDetailShimmer />
      </View>
    );
  }

  if (!currentProduct) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.primary }}>
        <StatusBar style="light" backgroundColor={colors.primary} />
        <View style={{ height: insets.top, backgroundColor: colors.primary }} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 20,
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 18, marginBottom: 8 }}>
            Product not found
          </Text>
          <Text
            style={{
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            The product you&apos;re looking for doesn&apos;t exist or has been
            removed.
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              paddingHorizontal: 24,
              paddingVertical: 12,
              backgroundColor: colors.primary,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: colors.white, fontWeight: "600" }}>
              Go Back
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Data Normalization (matching web logic)
  const product = currentProduct || {};

  // Calculate current price and original price based on variant
  const currentPrice =
    selectedVariant?.discounted_price ||
    selectedVariant?.price ||
    product.discount_price ||
    product.discounted_price ||
    product.price ||
    0;

  const originalPrice =
    selectedVariant?.price || product.price || product.original_price || 0;

  // Calculate discount percentage
  const hasDiscount =
    currentPrice && originalPrice && currentPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Reviews data transformation
  const reviewsData = Array.isArray(product.reviews)
    ? product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      user: review.email ? review.email.split("@")[0] : "Anonymous",
      userEmail: review.email,
      date: review.created_at,
      verified: true,
      helpful_count: review.helpful_count || 0,
      title: review.title || "",
    }))
    : [];

  const normalizedProduct = {
    ...product,
    id: product.id || product.product_id,
    name:
      product.name ||
      product.title ||
      product.product_name ||
      "Unknown Product",
    price: originalPrice,
    discountPrice: currentPrice,
    currentPrice: currentPrice,
    originalPrice: originalPrice,
    rating: product.rating || product.average_rating || 0,
    reviews:
      product.total_reviews ||
      (Array.isArray(product.reviews)
        ? product.reviews.length
        : product.review_count || 0),
    total_reviews:
      product.total_reviews ||
      (Array.isArray(product.reviews)
        ? product.reviews.length
        : product.review_count || 0),
    reviewsData: reviewsData,
    stock: Math.max(
      0,
      selectedVariant?.stock ??
      product.stock ??
      product.quantity ??
      product.inventory ??
      0,
    ),
    images: product.images || product.image_urls || product.photos || [],
    videos: product.videos || [],
    features: product.features || product.key_features || [],
    specifications: product.specifications || product.specs || {},
    attributes: product.attributes || {},
    description:
      product.description ||
      product.product_description ||
      "No description available",
    category: product.category || product.product_category || "General",
    brand: product.brand || product.manufacturer || "",
    validOptions: product.valid_options || [],
  };

  // Image handling
  const rawImages =
    normalizedProduct.images.length > 0 ? [...normalizedProduct.images] : [];
  if (rawImages.length === 0) {
    if (product.image) rawImages.push(product.image);
    else if (product.image_url) rawImages.push(product.image_url);
  }
  // Filter valid strings and ensure uniqueness
  const validImages = [
    ...new Set(
      rawImages.filter((img) => typeof img === "string" && img.length > 0),
    ),
  ];

  const validVideos = (normalizedProduct.videos || []).filter(
    (vid) => typeof vid === "string" && vid.length > 0,
  );

  const inStock = normalizedProduct.stock > 0;
  const productId = normalizedProduct.id;
  const isProductInWishlist = isInWishlist(productId);

  return (
    <View style={{ flex: 1, backgroundColor: colors.primary }}>
      <StatusBar style="light" backgroundColor={colors.primary} />
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 12,
          paddingVertical: 10,
          backgroundColor: colors.primary,
        }}
      >
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 6 }}>
          <ArrowLeft size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Search Bar */}
        <TouchableOpacity
          onPress={() => router.push("/products")}
          style={{
            flex: 1,
            flexDirection: "row",
            backgroundColor: colors.white,
            marginHorizontal: 12,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 8,
            alignItems: "center",
          }}
        >
          <Search size={18} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, marginLeft: 8, fontSize: 14 }}
          >
            Search products...
          </Text>
        </TouchableOpacity>

        {/* Cart Icon with Badge */}
        <TouchableOpacity
          onPress={() => router.push("/cart")}
          style={{ padding: 6, marginRight: 4, position: "relative" }}
        >
          <ShoppingCart size={24} color={colors.white} />
          {cartItemCount > 0 && (
            <View
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                backgroundColor: colors.error,
                width: 18,
                height: 18,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: colors.white,
                  fontSize: 10,
                  fontWeight: "bold",
                }}
              >
                {cartItemCount > 9 ? "9+" : cartItemCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
        >
          <View
            style={{
              paddingHorizontal: 16,
              paddingTop: 12,
              paddingBottom: 8,
              backgroundColor: colors.surface,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "500",
                  color: colors.text,
                  lineHeight: 24,
                  flex: 1,
                  marginRight: 8,
                }}
              >
                {normalizedProduct.name}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                }}
              >
                <Text
                  style={{
                    fontSize: 13,
                    marginRight: 4,
                    fontWeight: "400",
                    color: colors.text,
                  }}
                >
                  {normalizedProduct.rating?.toFixed(1) || "0.0"}
                </Text>
                <View style={{ flexDirection: "row" }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      size={14}
                      color={colors.warning}
                      fill={
                        i <= Math.round(normalizedProduct.rating || 0)
                          ? colors.warning
                          : "transparent"
                      }
                      strokeWidth={1}
                      style={{ marginRight: 1 }}
                    />
                  ))}
                </View>
                <Text
                  style={{ fontSize: 13, marginLeft: 4, color: colors.primary }}
                >
                  ({normalizedProduct.reviews || 0})
                </Text>
              </View>
            </View>
          </View>

          {/* Product Image Gallery */}
          <ProductImageGallery
            images={validImages}
            videos={validVideos}
            activeIndex={activeImageIndex}
            onScroll={(e) => {
              const slide = Math.round(
                e.nativeEvent.contentOffset.x /
                e.nativeEvent.layoutMeasurement.width,
              );
              if (slide !== activeImageIndex) setActiveImageIndex(slide);
            }}
            discountPercentage={discountPercentage}
            onWishlistPress={handleWishlistFromGallery}
            isInWishlist={isProductInWishlist}
            onSharePress={handleShare}
          />

          {/* Variant Selector */}
          {normalizedProduct.validOptions.length > 0 && (
            <ProductVariantSelector
              validOptions={normalizedProduct.validOptions}
              selectedVariant={selectedVariant}
              onSelect={setSelectedVariant}
              productImages={normalizedProduct.images}
            />
          )}

          {/* Product Info (Price & EMI) */}
          <ProductInfo
            product={normalizedProduct}
            selectedVariant={selectedVariant}
            onShare={handleShare}
            productId={normalizedProduct.id}
          />

          {/* Frequently Bought Together */}
          <FrequentlyBoughtTogether
            currentProduct={normalizedProduct}
            bundleProducts={bundleProducts}
            onAddBundle={handleAddBundle}
          />

          {/* Quantity Selector */}
          {normalizedProduct.stock > 0 && (
            <ProductQuantitySelector
              quantity={quantity}
              setQuantity={setQuantity}
              stock={normalizedProduct.stock}
            />
          )}

          {/* Action Buttons */}
          <ProductActions
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            onAddToWishlist={handleAddToWishlist}
            isAddingToCart={addingToCart}
            isBuyingNow={isBuyingNow}
            isAddingToWishlist={addingToWishlist}
            inStock={inStock}
            isInWishlist={isProductInWishlist}
            price={currentPrice}
            quantity={quantity}
            productName={normalizedProduct.name}
          />

          {/* Separator */}
          <View
            style={{ height: 8, backgroundColor: colors.backgroundSecondary }}
          />

          {/* Product Accordions (Description, Specifications, Reviews) */}
          <ProductAccordions product={normalizedProduct} />

          {/* Separator */}
          <View
            style={{
              height: 8,
              backgroundColor: colors.backgroundSecondary,
              marginTop: 16,
            }}
          />

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <View style={{ paddingTop: 16 }}>
              <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Customers also viewed
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Similar products you might like
                </Text>
              </View>
              <RelatedProducts
                products={relatedProducts}
                currentProductId={normalizedProduct.id}
              />
            </View>
          )}
        </ScrollView>
      </View>

      {/* Added to Cart Modal */}
      <CustomModal
        visible={showCartModal}
        onClose={() => setShowCartModal(false)}
        type="success"
        title="Added to Cart"
        message={`${normalizedProduct.name} has been added to your cart.`}
        buttons={[
          {
            text: "Continue Shopping",
            variant: "outline",
            onPress: () => setShowCartModal(false),
          },
          {
            text: "View Cart",
            variant: "primary",
            onPress: () => {
              setShowCartModal(false);
              router.push("/cart");
            },
          },
        ]}
      />
    </View>
  );
}
