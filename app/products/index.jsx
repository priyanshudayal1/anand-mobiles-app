import React, { useEffect, useState, useCallback, useMemo } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { Ionicons } from "@expo/vector-icons";
import { Filter, X, ArrowLeft } from "lucide-react-native";
import { StatusBar } from "expo-status-bar";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import ProductCard from "../../components/home/ProductCard";
import SearchBar from "../../components/common/SearchBar";
import ProductFilterModal from "../../components/common/ProductFilterModal";
import { ProductListShimmer } from "../../components/common/ShimmerPlaceholder";

export default function ProductsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors, mode } = useTheme();
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

  const getParamValue = useCallback((param) => {
    if (Array.isArray(param)) return param[0];
    return param;
  }, []);

  const searchParam = useMemo(
    () => getParamValue(params.search),
    [params.search, getParamValue],
  );
  const categoryParam = useMemo(
    () => getParamValue(params.category),
    [params.category, getParamValue],
  );
  const brandParam = useMemo(
    () => getParamValue(params.brand),
    [params.brand, getParamValue],
  );
  const categoryNameParam = useMemo(
    () => getParamValue(params.categoryName),
    [params.categoryName, getParamValue],
  );

  useEffect(() => {
    const loadData = async () => {
      resetFilters();
      const nextFilters = {};

      if (searchParam) {
        nextFilters.search = searchParam;
        setSearchTitle(`Results for "${searchParam}"`);
      } else if (!categoryParam && !brandParam) {
        setSearchTitle("Products");
      }

      if (categoryParam) {
        nextFilters.category = categoryParam;
        if (!searchParam) {
          setSearchTitle(categoryNameParam || "Category");
        }
      }

      if (brandParam) {
        nextFilters.brands = [brandParam];
        if (!searchParam && !categoryParam) {
          setSearchTitle(brandParam);
        }
      }

      await applyFilters(nextFilters);
    };

    loadData();
  }, [
    searchParam,
    categoryParam,
    brandParam,
    categoryNameParam,
    applyFilters,
    resetFilters,
  ]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && pagination.hasNext) {
      loadMoreProducts();
    }
  }, [isLoadingMore, pagination.hasNext, loadMoreProducts]);

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ flex: 1, padding: 4 }}>
        <ProductCard product={item} />
      </View>
    ),
    [],
  );

  const keyExtractor = useCallback(
    (item) => (item?.id || item?.product_id || item?._id)?.toString(),
    [],
  );

  const renderFooter = useCallback(() => {
    if (!isLoadingMore) return null;
    return (
      <View style={{ paddingVertical: 20, alignItems: "center" }}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }, [isLoadingMore, colors]);

  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" backgroundColor={colors.primary} />

      {/* Status bar fill */}
      <View style={{ height: insets.top, backgroundColor: colors.primary }} />

      {/* Header with Search Bar, Back Button, and Filter */}
      <View
        style={{
          backgroundColor: colors.primary,
          paddingHorizontal: 16,
          paddingVertical: 12,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
        }}
      >
        {/* Back Button */}
        <TouchableOpacity onPress={handleBack}>
          <ArrowLeft size={24} color={colors.white} />
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
              activeFilterCount > 0 ? colors.white : "rgba(255,255,255,0.2)",
            justifyContent: "center",
            alignItems: "center",
            position: "relative",
          }}
        >
          <Filter
            size={20}
            color={activeFilterCount > 0 ? colors.primary : colors.white}
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
        <ProductListShimmer />
      ) : (
        <FlashList
          data={products}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
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

      <ProductFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={async (newFilters) => {
          await applyFilters(newFilters);
        }}
      />
    </View>
  );
}
