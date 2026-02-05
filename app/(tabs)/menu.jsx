import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SectionList,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import axios from "axios";
import { useRouter } from "expo-router";
import { BACKEND_URL } from "../../constants/constants";
import { Ionicons } from "@expo/vector-icons";
import SearchBar from "../../components/common/SearchBar";
import { useTheme } from "../../store/useTheme";

const { width } = Dimensions.get("window");

// Sidebar width percentage
const SIDEBAR_WIDTH = width * 0.22;
const CONTENT_WIDTH = width - SIDEBAR_WIDTH;
const ITEM_WIDTH = (CONTENT_WIDTH - 24) / 3; // 24 = padding (12*2)

// Memoized Grid Item Component for Performance
const GridItem = React.memo(({ item, onPress, colors }) => (
  <TouchableOpacity
    style={{
      width: ITEM_WIDTH,
      paddingHorizontal: 4,
      marginBottom: 16,
    }}
    onPress={() => onPress(item)}
  >
    <View className="items-center">
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.backgroundSecondary,
          overflow: "hidden",
          justifyContent: "center",
          alignItems: "center",
          marginBottom: 6,
        }}
      >
        {item.image || item.image_url ? (
          <Image
            source={{ uri: item.image || item.image_url }}
            style={{ width: 48, height: 48 }}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: colors.border,
              borderRadius: 24,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                fontWeight: "600",
              }}
            >
              {item.name?.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 11,
          color: colors.text,
          textAlign: "center",
          fontWeight: "500",
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function Menu() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/admin/public/mega-menu/`,
      );
      if (response.data && response.data.tabs) {
        setCategories(response.data.tabs);
        if (response.data.tabs.length > 0) {
          setSelectedCategory(response.data.tabs[0]);
        }
      }
    } catch (error) {
      console.error("Error fetching menu data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleSubCategoryPress = useCallback(
    (item) => {
      const path = item.path;
      const name = item.name;

      if (!path) return;

      // Helper to parse query params
      const parseQueryParams = (queryString) => {
        const params = {};
        if (queryString) {
          queryString.split("&").forEach((param) => {
            const [key, value] = param.split("=");
            if (key && value) {
              params[key] = decodeURIComponent(value);
            }
          });
        }
        return params;
      };

      if (path.startsWith("/category/")) {
        // Extract slug and query params e.g. /category/smartphones?brand=Apple
        const pathWithoutPrefix = path.replace("/category/", "");
        const [categorySlug, queryString] = pathWithoutPrefix.split("?");
        const queryParams = parseQueryParams(queryString);

        const navParams = {
          category: categorySlug,
          categoryName: name,
        };

        // Add brand if present in query params
        if (queryParams.brand) {
          navParams.brand = queryParams.brand;
        }

        router.push({
          pathname: "/products",
          params: navParams,
        });
      } else if (path.startsWith("/brand/")) {
        const pathWithoutPrefix = path.replace("/brand/", "");
        const [brandSlug, queryString] = pathWithoutPrefix.split("?");
        const queryParams = parseQueryParams(queryString);

        const navParams = { brand: brandSlug };

        // Add category if present in query params
        if (queryParams.category) {
          navParams.category = queryParams.category;
        }

        router.push({
          pathname: "/products",
          params: navParams,
        });
      } else if (path.includes("search=")) {
        // Handle search links if any
        const search = path.split("search=")[1];
        router.push({
          pathname: "/products",
          params: { search: search },
        });
      } else {
        // Fallback for direct links or other pages
        // Remove leading slash to avoid issues with expo-router if needed,
        // but usually push handles it.
        router.push(path);
      }
    },
    [router],
  ); // Re-created when router changes (unlikely)

  const handleQuickAction = (action) => {
    switch (action) {
      case "orders":
        router.push("/orders");
        break;
      case "account":
        router.push("/profile");
        break;
      case "wishlist":
        router.push("/wishlist");
        break;
      default:
        break;
    }
  };

  // Prepare sections for SectionList
  const sections = useMemo(() => {
    if (!selectedCategory?.subcategories) return [];

    return selectedCategory.subcategories.map((subcat) => {
      // Chunk items into groups of 3
      const items = subcat.items || [];
      const chunkedData = [];
      for (let i = 0; i < items.length; i += 3) {
        chunkedData.push({
          id: `${subcat.id}-row-${i}`,
          items: items.slice(i, i + 3),
        });
      }
      return {
        title: subcat.title,
        data: chunkedData,
      };
    });
  }, [selectedCategory]);

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 8,
          backgroundColor: colors.surface,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "bold",
            color: colors.text,
            textTransform: "uppercase",
            letterSpacing: 1,
          }}
        >
          {title}
        </Text>
      </View>
    ),
    [colors],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <View style={{ flexDirection: "row", paddingHorizontal: 12 }}>
        {item.items.map((gridItem, index) => (
          <GridItem
            key={gridItem.id || index}
            item={gridItem}
            onPress={handleSubCategoryPress}
            colors={colors}
          />
        ))}
      </View>
    ),
    [handleSubCategoryPress, colors],
  );

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <StatusBar style={isDarkMode() ? "light" : "dark"} />
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDarkMode() ? "light" : "dark"} />
      {/* Search Bar */}
      <View
        style={{
          padding: 12,
          backgroundColor: colors.surface,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          zIndex: 50,
        }}
      >
        <SearchBar />
      </View>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* Left Sidebar - Main Categories */}
        <View
          style={{
            width: SIDEBAR_WIDTH,
            backgroundColor: colors.backgroundSecondary,
            borderRightWidth: 1,
            borderRightColor: colors.borderLight,
          }}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderLeftWidth: 3,
                  borderLeftColor:
                    selectedCategory?.id === category.id
                      ? colors.primary
                      : "transparent",
                  backgroundColor:
                    selectedCategory?.id === category.id
                      ? colors.surface
                      : "transparent",
                }}
              >
                {/* Category Image */}
                <View style={{ alignItems: "center", marginBottom: 4 }}>
                  {category.image || category.image_url ? (
                    <Image
                      source={{ uri: category.image || category.image_url }}
                      style={{ width: 44, height: 44, borderRadius: 8 }}
                      contentFit="contain"
                      transition={200}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: colors.backgroundSecondary,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Ionicons
                        name="grid-outline"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </View>
                  )}
                </View>
                {/* Category Name */}
                <Text
                  style={{
                    fontSize: 10,
                    textAlign: "center",
                    fontWeight:
                      selectedCategory?.id === category.id ? "700" : "500",
                    color:
                      selectedCategory?.id === category.id
                        ? colors.primary
                        : colors.text,
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - SectionList */}
        <View style={{ flex: 1, backgroundColor: colors.background }}>
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            initialNumToRender={6}
            maxToRenderPerBatch={6}
            windowSize={5}
            removeClippedSubviews={true}
          />

          {/* Quick Action Buttons - Fixed at bottom */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: colors.surface,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { id: "orders", label: "Orders" },
                { id: "account", label: "Account" },
                { id: "wishlist", label: "Wishlist" },
              ].map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.surface,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.text,
                      fontWeight: "500",
                    }}
                  >
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
