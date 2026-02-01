import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import {
  Smartphone,
  Tablet,
  Laptop,
  Tv,
  Headphones,
  Watch,
  Camera,
  Gamepad2,
  Package,
  HardDrive,
  Cable,
  Battery,
  Speaker,
  Monitor,
  Keyboard,
  Mouse,
  Cpu,
  Wifi,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";

// Icon mapping for categories - matches backend icon names
const categoryIcons = {
  // Backend icon names (lowercase)
  smartphone: Smartphone,
  laptops: Laptop,
  tablets: Tablet,
  audio: Headphones,
  accessories: Package,
  storage: HardDrive,
  cables: Cable,
  batteries: Battery,
  speakers: Speaker,
  monitors: Monitor,
  keyboards: Keyboard,
  mouse: Mouse,
  processors: Cpu,
  networking: Wifi,
  tv: Tv,
  watch: Watch,
  camera: Camera,
  gaming: Gamepad2,
  // Category name fallbacks
  smartphones: Smartphone,
  phones: Smartphone,
  mobile: Smartphone,
  "mobile accessories": Package,
  "laptop accessories": HardDrive,
  tablet: Tablet,
  laptop: Laptop,
  computers: Laptop,
  televisions: Tv,
  television: Tv,
  headphones: Headphones,
  earphones: Headphones,
  watches: Watch,
  smartwatch: Watch,
  cameras: Camera,
  games: Gamepad2,
};

// Get icon component for category - checks backend icon field first
const getCategoryIcon = (category) => {
  // First check if backend provided an icon name
  if (category.icon) {
    const iconName = category.icon.toLowerCase().replace(/icon$/i, "").trim();
    if (categoryIcons[iconName]) {
      return categoryIcons[iconName];
    }
  }

  // Fallback to category name matching
  const name = (category.name || "").toLowerCase();
  for (const [key, Icon] of Object.entries(categoryIcons)) {
    if (name.includes(key)) {
      return Icon;
    }
  }
  return Smartphone; // Default icon
};

export default function CategoryGrid({ showHeader = true }) {
  const { colors } = useTheme();
  const { categories } = useHome();
  const router = useRouter();

  // Fallback categories if no data
  const displayCategories =
    categories.length > 0
      ? categories
      : [
          {
            id: "1",
            name: "Smartphones",
            slug: "smartphones",
            icon: "smartphone",
          },
          { id: "2", name: "Tablets", slug: "tablets", icon: "tablets" },
          { id: "3", name: "Laptops", slug: "laptops", icon: "laptops" },
          { id: "4", name: "Audio", slug: "audio", icon: "audio" },
        ];

  const handleCategoryPress = (category) => {
    router.push({
      pathname: "/products",
      params: { category: category.slug || category.name },
    });
  };

  const handleSeeAll = () => {
    router.push("/products");
  };

  const renderCategoryItem = (category) => {
    const IconComponent = getCategoryIcon(category);
    const hasImage = category.image && category.image.startsWith("http");

    return (
      <TouchableOpacity
        key={category.id}
        onPress={() => handleCategoryPress(category)}
        style={{
          alignItems: "center",
          marginRight: 16,
          width: 80,
        }}
        activeOpacity={0.7}
      >
        {/* Category Icon/Image Container */}
        <View
          style={{
            width: 72,
            height: 72,
            marginBottom: 8,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 12,
            backgroundColor:
              colors.surfaceSecondary || colors.backgroundSecondary,
            overflow: "hidden",
          }}
        >
          {hasImage ? (
            <Image
              source={{ uri: category.image }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <IconComponent size={28} color={colors.primary} />
          )}
        </View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: colors.text,
            textAlign: "center",
            textTransform: "capitalize",
          }}
          numberOfLines={1}
        >
          {category.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ padding: 16, backgroundColor: colors.cardBg }}>
      {/* Header */}
      {showHeader && (
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
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
                Shop by Categories
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
              Discover our wide range of products across different categories
            </Text>
          </View>
          <TouchableOpacity
            onPress={handleSeeAll}
            style={{ flexDirection: "row", alignItems: "center" }}
          >
            <Text style={{ fontWeight: "500", color: colors.primary }}>
              See All
            </Text>
            <ChevronRight size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Categories Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {displayCategories.map(renderCategoryItem)}
      </ScrollView>
    </View>
  );
}
