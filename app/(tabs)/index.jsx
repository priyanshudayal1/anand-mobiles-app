import React, {useEffect, useCallback} from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  RefreshControl,
} from "react-native";
import {SafeAreaView, useSafeAreaInsets} from "react-native-safe-area-context";
import {MessageCircle, ChevronRight} from "lucide-react-native";
import {StatusBar} from "expo-status-bar";
import {useRouter} from "expo-router";

import HomeHeader from "../../components/home/HomeHeader";
import BannerCarousel from "../../components/home/BannerCarousel";
import CategoryGrid from "../../components/home/CategoryGrid";
import FeaturedSection from "../../components/home/FeaturedSection";
import BrandsSection from "../../components/home/BrandsSection";
import ProductCard from "../../components/home/ProductCard";
import {useTheme} from "../../store/useTheme";
import {useHome} from "../../store/useHome";
import {useProducts} from "../../store/useProducts";

// Section Header Component
const SectionHeader = ({title, subtitle, onSeeAll, colors}) => (
  <View
    style={{
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 8,
      backgroundColor: colors.cardBg,
    }}
  >
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
      }}
    >
      <View>
        <Text style={{fontSize: 18, fontWeight: "bold", color: colors.text}}>
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
      </View>
      {onSeeAll && (
        <TouchableOpacity
          onPress={onSeeAll}
          style={{flexDirection: "row", alignItems: "center"}}
        >
          <Text style={{fontWeight: "500", color: colors.primary}}>
            See All
          </Text>
          <ChevronRight size={16} color={colors.primary} />
        </TouchableOpacity>
      )}
    </View>
    {subtitle && (
      <Text style={{fontSize: 12, color: colors.textSecondary}}>
        {subtitle}
      </Text>
    )}
  </View>
);

export default function Home() {
  const {colors, mode} = useTheme();
  const insets = useSafeAreaInsets();
  const {initializeHome, refreshHomeData, isRefreshing} = useHome();
  const {products, fetchProducts} = useProducts();
  const router = useRouter();

  // Initialize home data on mount
  useEffect(() => {
    const init = async () => {
      await initializeHome();
      // Also fetch some products for "All Products" section
      await fetchProducts(true);
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pull to refresh
  const onRefresh = useCallback(async () => {
    await refreshHomeData();
  }, [refreshHomeData]);

  // Handle product press
  const handleProductPress = (product) => {
    router.push({
      pathname: "/(tabs)/menu",
      params: {productId: product.id},
    });
  };

  // Handle see all products
  const handleSeeAllProducts = () => {
    router.push("/(tabs)/menu");
  };

  // Handle chat press
  const handleChatPress = () => {
    // TODO: Implement chat functionality
    console.log("Chat pressed");
  };

  // Get products for "All Products" section
  const allProducts = products.slice(0, 6);

  // Calculate bottom padding for tab bar
  const bottomPadding = 56 + Math.max(insets.bottom, 8) + 16;

  return (
    <SafeAreaView
      style={{flex: 1, backgroundColor: colors.backgroundSecondary}}
      edges={["top"]}
    >
      <StatusBar
        style={mode === "dark" ? "light" : "light"}
        backgroundColor={colors.primary}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{flex: 1}}
        contentContainerStyle={{paddingBottom: bottomPadding}}
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
        {/* Header with Search */}
        <HomeHeader />

        {/* Banner Carousel */}
        <BannerCarousel />

        {/* Categories Section */}
        <CategoryGrid />

        {/* Featured Products Section */}
        <FeaturedSection />

        {/* Brands Section */}
        <BrandsSection />

        {/* All Products Section */}
        {allProducts.length > 0 && (
          <View style={{backgroundColor: colors.cardBg, marginTop: 8}}>
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
                paddingHorizontal: 16,
                paddingBottom: 16,
              }}
            >
              {allProducts.map((product, index) => (
                <View
                  key={product.id || index}
                  style={{
                    width: "50%",
                    paddingRight: index % 2 === 0 ? 6 : 0,
                    paddingLeft: index % 2 === 1 ? 6 : 0,
                  }}
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
                marginBottom: 16,
                paddingVertical: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text style={{color: colors.primary, fontWeight: "600"}}>
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
          shadowOffset: {width: 0, height: 4},
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
    </SafeAreaView>
  );
}
