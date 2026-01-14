import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import {FlashList} from "@shopify/flash-list";
import {useTheme} from "../../store/useTheme";
import ProductCard from "./ProductCard";

export default function ProductGrid({
  products = [],
  title = "",
  subtitle = "",
  showSeeAll = false,
  onSeeAllPress,
  onProductPress,
  isLoading = false,
  isLoadingMore = false,
  onLoadMore,
  hasMore = false,
  emptyMessage = "No products found",
  numColumns = 2,
  ListHeaderComponent,
  showHeader = true,
}) {
  const {colors} = useTheme();

  // Render header
  const renderHeader = () => {
    if (!showHeader || (!title && !ListHeaderComponent)) return null;

    return (
      <View>
        {ListHeaderComponent}
        {title && (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 16,
              paddingTop: 16,
              paddingBottom: 8,
              backgroundColor: colors.cardBg,
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
              {subtitle && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.textSecondary,
                    marginTop: 8,
                  }}
                >
                  {subtitle}
                </Text>
              )}
            </View>
            {showSeeAll && onSeeAllPress && (
              <TouchableOpacity onPress={onSeeAllPress}>
                <Text style={{ fontWeight: "500", color: colors.primary }}>
                  See All →
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Render footer (loading indicator)
  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 20 }} />;

    return (
      <View
        style={{
          paddingVertical: 20,
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="small" color={colors.primary} />
        <Text
          style={{ fontSize: 12, color: colors.textSecondary, marginTop: 8 }}
        >
          Loading more products...
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingVertical: 60,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            fontSize: 16,
            color: colors.textSecondary,
            textAlign: "center",
          }}
        >
          {emptyMessage}
        </Text>
      </View>
    );
  };

  // Render product item
  const renderItem = ({item, index}) => {
    const isLeftColumn = index % 2 === 0;

    return (
      <View
        style={{
          flex: 1,
          paddingLeft: isLeftColumn ? 16 : 6,
          paddingRight: isLeftColumn ? 6 : 16,
        }}
      >
        <ProductCard product={item} size="medium" onPress={onProductPress} />
      </View>
    );
  };

  // Handle end reached (infinite scroll)
  const handleEndReached = () => {
    if (!isLoadingMore && hasMore && onLoadMore) {
      onLoadMore();
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
          paddingVertical: 60,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={{ fontSize: 14, color: colors.textSecondary, marginTop: 12 }}
        >
          Loading products...
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlashList
        data={products}
        renderItem={renderItem}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        numColumns={numColumns}
        estimatedItemSize={200}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 100,
          backgroundColor: colors.background,
        }}
      />
    </View>
  );
}
