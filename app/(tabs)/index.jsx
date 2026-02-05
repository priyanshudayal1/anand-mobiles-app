import React, { useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageCircle, ChevronRight } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";

import HomeHeader from "../../components/home/HomeHeader";
import BannerCarousel from "../../components/home/BannerCarousel";
import CategoryGrid from "../../components/home/CategoryGrid";
import FeaturedSection from "../../components/home/FeaturedSection";
import BrandsSection from "../../components/home/BrandsSection";
import ProductCard from "../../components/home/ProductCard";
import DynamicSection from "../../components/home/DynamicSection";
import VideoCarousel from "../../components/home/VideoCarousel";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";
import { useProducts } from "../../store/useProducts";

// Section Header Component - underline from right to left like web version
const SectionHeader = ({ title, subtitle, onSeeAll, colors }) => (
  <View
    style={{
      paddingHorizontal: 16,
      paddingTop: 0,
      paddingBottom: 0,
      backgroundColor: colors.cardBg,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
      }}
    >
      <View style={{ flex: 1 }}>
        <View style={{ alignSelf: "flex-start" }}>
          <Text
            style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 6 }}
          >
            {title}
          </Text>
          <View
            style={{
              height: 3,
              width: 40,
              marginTop: 0,
              marginBottom: subtitle ? 0 : 6,
              backgroundColor: colors.primary,
              borderRadius: 2,
              alignSelf: "flex-start",
            }}
          />
        </View>
        {subtitle && (
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4, marginBottom: 6 }}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          style={{ flexDirection: "row", alignItems: "center" }}
        >
          <Text style={{ fontWeight: "500", color: colors.primary }}>
            See All
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
  </View>
);

// Section Title Component - reusable for dedicated components with custom titles
const SectionTitle = ({ section, colors, onSeeAll }) => {
  if (!section.title && !section.show_title) return null;
  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingTop: 12,
        paddingBottom: 8,
        backgroundColor: colors.cardBg,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ alignSelf: "flex-start" }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 6 }}
            >
              {section.title || getSectionDefaultTitle(section.section_type)}
            </Text>
            <View
              style={{
                height: 3,
                width: 40,
                marginTop: 0,
                marginBottom: section.description ? 0 : 6,
                backgroundColor: colors.primary,
                borderRadius: 2,
                alignSelf: "flex-start",
              }}
            />
          </View>
          {section.description && (
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
                marginBottom: 6,
              }}
            >
              {section.description}
            </Text>
          )}
        </View>
        {onSeeAll && (
          <TouchableOpacity
            onPress={onSeeAll}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ fontWeight: "500", color: colors.primary }}>
              See All
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

// Helper to get default title for section types
const getSectionDefaultTitle = (sectionType) => {
  const titles = {
    hero_banner: "Featured",
    banner_carousel: "Featured",
    category_list: "Shop by Categories",
    categories: "Shop by Categories",
    featured_products: "Featured Products",
    brands: "Top Brands",
    whats_trending: "What's Trending",
    best_selling: "Best Selling",
    new_releases: "New Releases",
    flash_deal: "Flash Deals",
    special_offers_carousel: "Special Offers",
  };
  return titles[sectionType] || "";
};

// Render a section based on its type
const RenderSection = ({ section, colors, router, featuredProducts }) => {
  const sectionType = section.section_type;

  // These types have dedicated components with optional custom titles from backend
  switch (sectionType) {
    case "hero_banner":
    case "banner_carousel":
      return <BannerCarousel key={section.section_id} />;

    case "category_list":
    case "categories":
      return (
        <View
          key={section.section_id}
          style={{ backgroundColor: colors.cardBg, marginTop: 0, marginBottom: 0 }}
        >
          <SectionTitle section={section} colors={colors} />
          <CategoryGrid showHeader={false} />
        </View>
      );

    case "featured_products":
      return (
        <View
          key={section.section_id}
          style={{ backgroundColor: colors.cardBg, marginTop: 0, marginBottom: 0 }}
        >
          <SectionTitle section={section} colors={colors} />
          {(section.config?.products?.length || featuredProducts?.length) >
            0 ? (
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 12,
                gap: 8,
              }}
            >
              {(section.config?.products?.length
                ? section.config.products
                : featuredProducts
              ).map((product) => (
                <View
                  key={product.id || product.product_id}
                  style={{ width: "48%" }}
                >
                  <ProductCard
                    product={product}
                    size="medium"
                    onPress={(item) =>
                      router.push(`/product/${item.id || item.product_id}`)
                    }
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={{ padding: 16 }}>
              <Text
                style={{ color: colors.textSecondary, textAlign: "center" }}
              >
                No products available
              </Text>
            </View>
          )}
        </View>
      );

    case "brands":
      return (
        <View
          key={section.section_id}
          style={{ backgroundColor: colors.cardBg, marginTop: 0, marginBottom: 0 }}
        >
          <SectionTitle section={section} colors={colors} />
          <BrandsSection showHeader={false} />
        </View>
      );

    case "whats_trending":
      return (
        <View
          key={section.section_id}
          style={{ backgroundColor: colors.cardBg, marginTop: 0 }}
        >
          <SectionTitle section={section} colors={colors} />
          <VideoCarousel
            showHeader={false}
            videos={section.config?.videos}
            autoPlay={false}
          />
        </View>
      );

    default:
      // All other section types go through DynamicSection
      return <DynamicSection key={section.section_id} section={section} />;
  }
};

export default function Home() {
  const { colors, mode } = useTheme();
  const insets = useSafeAreaInsets();
  const {
    initializeHome,
    refreshHomeData,
    isRefreshing,
    isLoading,
    sections,
    banners,
    promotionVideos,
    featuredProducts,
  } = useHome();
  const { products, fetchProducts } = useProducts();
  const router = useRouter();

  // Initialize home data on mount
  useEffect(() => {
    const init = async () => {
      await initializeHome();
      await fetchProducts(true);
    };
    init();
  }, [initializeHome, fetchProducts]);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    await refreshHomeData();
  }, [refreshHomeData]);

  // Handle product press
  const handleProductPress = (product) => {
    router.push(`/product/${product.id || product.product_id}`);
  };

  // Handle see all products
  const handleSeeAllProducts = () => {
    router.push("/products");
  };

  // Handle chat press
  const handleChatPress = () => {
    // TODO: Implement chat functionality
  };

  // Get products for "All Products" section
  const allProducts = products.slice(0, 6);

  // Calculate bottom padding for tab bar
  const bottomPadding = 56 + Math.max(insets.bottom, 8) + 16;

  // Sort sections by display_order
  const sortedSections = sections
    ? [...sections]
      .filter((s) => s && s.enabled !== false)
      .sort(
        (a, b) =>
          (a.display_order || a.order || 0) -
          (b.display_order || b.order || 0),
      )
    : [];

  // Check if we have hero/banner at top (most common case)
  const hasHeroBannerSection = sortedSections.some(
    (s) =>
      s.section_type === "hero_banner" || s.section_type === "banner_carousel",
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.backgroundSecondary,
        paddingTop: insets.top,
      }}
    >
      <StatusBar
        style={mode === "dark" ? "light" : "light"}
        backgroundColor={colors.primary}
      />

      {/* Header with Search - Sticky at top */}
      <HomeHeader />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: bottomPadding }}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
            progressBackgroundColor={colors.cardBg}
          />
        }
      >
        {/* Video Section - Like Website */}
        <VideoCarousel showHeader={false} />

        {/* Loading State */}
        {isLoading && sortedSections.length === 0 && (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>
              Loading...
            </Text>
          </View>
        )}

        {/* Render sections in backend order */}
        {sortedSections.length > 0 ? (
          <>
            {/* If no hero_banner section, show BannerCarousel as default first */}
            {!hasHeroBannerSection && banners && banners.length > 0 && (
              <BannerCarousel />
            )}

            {/* Render each section based on type */}
            {sortedSections.map((section) => (
              <RenderSection
                key={section.section_id || section.id}
                section={section}
                colors={colors}
                router={router}
                featuredProducts={featuredProducts}
              />
            ))}

            {/* Always show Brands and Videos at end if not in sections */}
            {!sortedSections.some((s) => s.section_type === "brands") && (
              <BrandsSection />
            )}
            {!sortedSections.some((s) => s.section_type === "whats_trending") &&
              promotionVideos &&
              promotionVideos.length > 0 && <VideoCarousel />}
          </>
        ) : (
          /* Fallback static layout when no sections from backend */
          <>
            <BannerCarousel />
            <CategoryGrid />
            <FeaturedSection />
            <BrandsSection />
            <VideoCarousel />
          </>
        )}

        {/* All Products Section - Always at bottom */}
        {allProducts.length > 0 && (
          <View style={{ backgroundColor: colors.cardBg, marginTop: 0 }}>
            <SectionHeader
              title="All Products"
              subtitle="Explore our complete collection"
              onSeeAll={handleSeeAllProducts}
              colors={colors}
            />

            {/* Products Grid */}
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                paddingHorizontal: 12,
                gap: 8,
              }}
            >
              {allProducts.map((product) => (
                <View
                  key={product.id || product.product_id}
                  style={{ width: "48%" }}
                >
                  <ProductCard
                    product={product}
                    size="medium"
                    onPress={handleProductPress}
                  />
                </View>
              ))}
            </View>

            {/* View All Button */}
            <TouchableOpacity
              onPress={handleSeeAllProducts}
              style={{
                marginHorizontal: 16,
                marginTop: 8,
                marginBottom: 0,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                View All Products
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* Floating Action Button (Chat) */}
      <TouchableOpacity
        onPress={handleChatPress}
        style={{
          position: "absolute",
          bottom: bottomPadding + 8,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
        activeOpacity={0.8}
      >
        <MessageCircle size={28} color={colors.white} />
        <View
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 12,
            height: 12,
            borderRadius: 6,
            backgroundColor: colors.success,
            borderWidth: 2,
            borderColor: colors.white,
          }}
        />
      </TouchableOpacity>
    </View>
  );
}
