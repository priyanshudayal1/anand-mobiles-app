import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { Filter, X } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import ProductCard from "../../components/home/ProductCard";
import SearchBar from "../../components/common/SearchBar";
import ProductFilterModal from "../../components/common/ProductFilterModal";

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();
  const {
    products,
    isLoading,
    isLoadingMore,
    applyFilters,
    resetFilters,
    loadMoreProducts,
    pagination,
    filters,
  } = useProducts();

  const [searchTitle, setSearchTitle] = useState("Products");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Calculate active filter count
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.brands && filters.brands.length > 0) count++;
    if (filters.category) count++;
    if (filters.minPrice > 0) count++;
    if (filters.maxPrice < 10000000) count++;
    if (filters.sortBy && filters.sortBy !== "newest") count++;
    if (filters.inStockOnly) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

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
  }, [params, applyFilters, resetFilters]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.hasNext) {
      loadMoreProducts();
    }
  }, [isLoadingMore, pagination.hasNext, loadMoreProducts]);

  const renderItem = useCallback(({ item }) => (
    <View style={{ flex: 1, padding: 4 }}>
      <ProductCard product={item} />
    </View>
  ), []);

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header with Search Bar, Back Button, and Filter */}
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

        {/* Filter Button */}
        <TouchableOpacity
          onPress={() => setShowFilterModal(true)}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor:
              activeFilterCount > 0
                ? colors.primary
                : colors.backgroundSecondary,
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Filter
            size={20}
            color={activeFilterCount > 0 ? colors.white : colors.text}
          />
          {activeFilterCount > 0 ? (
            <View
              style={{
                position: "absolute",
                top: -4,
                right: -4,
                width: 18,
                height: 18,
                borderRadius: 9,
                backgroundColor: colors.error,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: colors.white,
                  fontWeight: "bold",
                }}
              >
                {activeFilterCount}
              </Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {/* Active Filters Bar */}
      {activeFilterCount > 0 ? (
        <View
          style={{
            backgroundColor: colors.primary + "10",
            paddingHorizontal: 16,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text
            style={{ fontSize: 13, color: colors.primary, fontWeight: "500" }}
          >
            {activeFilterCount} filter{activeFilterCount > 1 ? "s" : ""} applied
          </Text>
          <TouchableOpacity
            onPress={() => {
              resetFilters();
              applyFilters({});
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
              paddingHorizontal: 10,
              paddingVertical: 4,
              backgroundColor: colors.error + "20",
              borderRadius: 12,
            }}
          >
            <X size={14} color={colors.error} />
            <Text
              style={{ fontSize: 12, color: colors.error, fontWeight: "500" }}
            >
              Clear All
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Results Count */}
      {!isLoading && pagination.totalCount > 0 ? (
        <View
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            Showing {products.length} of {pagination.totalCount} products
          </Text>
        </View>
      ) : null}

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
              {activeFilterCount > 0 ? (
                <TouchableOpacity
                  onPress={() => {
                    resetFilters();
                    applyFilters({});
                  }}
                  style={{
                    marginTop: 16,
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: colors.primary,
                    borderRadius: 8,
                  }}
                >
                  <Text style={{ color: colors.white, fontWeight: "600" }}>
                    Clear Filters
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />
      )}

      {/* Filter Modal */}
      <ProductFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={async (newFilters) => {
          await applyFilters(newFilters);
        }}
      />
    </SafeAreaView>
  );
}
