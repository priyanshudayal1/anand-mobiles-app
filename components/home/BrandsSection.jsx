import React from "react";
import {View, Text, TouchableOpacity, ScrollView} from "react-native";
import {Image} from "expo-image";
import {useRouter} from "expo-router";
import {useTheme} from "../../store/useTheme";
import {useHome} from "../../store/useHome";

export default function BrandsSection() {
  const {colors} = useTheme();
  const {brands} = useHome();
  const router = useRouter();

  // Fallback brands if no data
  const displayBrands =
    brands.length > 0
      ? brands
      : [
          {
            id: "1",
            name: "Apple",
            logo: "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
          },
          {
            id: "2",
            name: "Samsung",
            logo: "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
          },
          { id: "3", name: "OnePlus", logo: "" },
          { id: "4", name: "Xiaomi", logo: "" },
          { id: "5", name: "Realme", logo: "" },
          { id: "6", name: "Vivo", logo: "" },
        ];

  const handleBrandPress = (brand) => {
    router.push({
      pathname: "/(tabs)/menu",
      params: { brand: brand.slug || brand.name },
    });
  };

  const handleSeeAll = () => {
    router.push("/(tabs)/menu");
  };

  const renderBrandItem = (brand) => {
    const hasLogo = brand.logo && brand.logo.startsWith("http");

    return (
      <TouchableOpacity
        key={brand.id}
        onPress={() => handleBrandPress(brand)}
        style={{
          alignItems: "center",
          marginRight: 16,
          width: 80,
        }}
        activeOpacity={0.7}
      >
        {/* Brand Logo Container */}
        <View
          style={{
            width: 64,
            height: 64,
            marginBottom: 8,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 32,
            backgroundColor: colors.surfaceSecondary,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {hasLogo ? (
            <Image
              source={{ uri: brand.logo }}
              style={{ width: 40, height: 40 }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.primary,
              }}
            >
              {brand.name.charAt(0).toUpperCase()}
            </Text>
          )}
        </View>
        <Text
          style={{
            fontSize: 11,
            fontWeight: "500",
            color: colors.text,
            textAlign: "center",
          }}
          numberOfLines={1}
        >
          {brand.name}
        </Text>
      </TouchableOpacity>
    );
  };

  if (displayBrands.length === 0) {
    return null;
  }

  return (
    <View style={{ padding: 16, backgroundColor: colors.cardBg, marginTop: 8 }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.text,
            }}
          >
            Shop by Brands
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
        <TouchableOpacity onPress={handleSeeAll}>
          <Text
            style={{
              fontWeight: "500",
              color: colors.primary,
            }}
          >
            See All →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Description */}
      <Text
        style={{
          fontSize: 12,
          color: colors.textSecondary,
          marginBottom: 16,
        }}
      >
        Explore top brands with exclusive deals
      </Text>

      {/* Brands Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {displayBrands.map(renderBrandItem)}
      </ScrollView>
    </View>
  );
}
