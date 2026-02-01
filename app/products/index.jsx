import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import ProductCard from "../../components/home/ProductCard";
import SearchBar from "../../components/common/SearchBar";

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, isDarkMode } = useTheme();
  const {
    products,
    isLoading,
    isLoadingMore,
    applyFilters,
    resetFilters,
    loadMoreProducts,
    pagination,
  } = useProducts();

  const [searchTitle, setSearchTitle] = useState("Products");

  useEffect(() => {
    // Immediate execution function to handle async operations
    const loadData = async () => {
      console.log("Products Screen - Received params:", params);
      resetFilters();
      const filters = {};

      // Helper to get string value from param (handles array or string)
      const getParamValue = (param) => {
        if (Array.isArray(param)) return param[0];
        return param;
      };

      const searchParam = getParamValue(params.search);
      const categoryParam = getParamValue(params.category);
      const brandParam = getParamValue(params.brand);
      const categoryNameParam = getParamValue(params.categoryName);

      if (searchParam) {
        filters.search = searchParam;
        setSearchTitle(`Results for "${searchParam}"`);
        console.log("Applying search filter:", searchParam);
      }

      if (categoryParam) {
        filters.category = categoryParam;
        // If we also have a brand, the categoryName param likely contains the specific model/subcat name
        if (!searchParam) {
          setSearchTitle(categoryNameParam || "Category");
        }
        console.log(
          "Applying category filter:",
          categoryParam,
          "Name:",
          categoryNameParam,
        );
      }

      if (brandParam) {
        filters.brands = [brandParam];
        if (!searchParam && !categoryParam) {
          setSearchTitle(brandParam);
        }
        console.log("Applying brand filter:", brandParam);
      }

      console.log("Filters to apply:", filters);

      // Apply filters only if we have some criteria
      // If empty, it fetches default products which is what we want if no params passed
      await applyFilters(filters);
    };

    loadData();

    // Cleanup function
    return () => {
      // Optional: clear filters on unmount if desired, or keep them cached
    };
  }, [params.search, params.category, params.brand, params.categoryName]);

  const handleBack = () => {
    router.back();
  };

  const handleLoadMore = () => {
    if (!isLoadingMore && pagination.hasNext) {
      loadMoreProducts();
    }
  };

  const renderItem = ({ item }) => (
    <View style={{ flex: 1, padding: 4 }}>
      <ProductCard product={item} />
    </View>
  );

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with Search Bar and Back Button */}
      <View
        style={{
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>

        {/* Search Bar */}
        <View style={{ flex: 1 }}>
          <SearchBar placeholder={searchTitle} />
        </View>

        {/* Item Count Badge */}
        {pagination.totalCount > 0 && (
          <View
            style={{
              backgroundColor: colors.primary + "20",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
            }}
          >
            <Text
              style={{ fontSize: 11, color: colors.primary, fontWeight: "600" }}
            >
              {pagination.totalCount}
            </Text>
          </View>
        )}
      </View>

      {/* Content */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlashList
          data={products}
          renderItem={renderItem}
          estimatedItemSize={280}
          numColumns={2}
          contentContainerStyle={{ padding: 8 }}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={
            <View style={{ alignItems: "center", marginTop: 100 }}>
              <Ionicons
                name="search-outline"
                size={64}
                color={colors.textSecondary}
              />
              <Text
                style={{
                  marginTop: 16,
                  color: colors.textSecondary,
                  fontSize: 16,
                }}
              >
                No products found.
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
