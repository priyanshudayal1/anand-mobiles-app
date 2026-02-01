import React from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";
import { BACKEND_URL } from "../../constants/constants";

export default function BrandsSection({ showHeader = true }) {
  const { colors } = useTheme();
  const { brands, fetchBrands } = useHome();
  const router = useRouter();

  // Fetch brands if not available - runs only once on mount
  React.useEffect(() => {
    if (!brands || brands.length === 0) {
      fetchBrands();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to prevent infinite loop

  // Filter and sort brands similar to web logic
  const displayBrands = React.useMemo(() => {
    // If no brands loaded yet, use fallback
    if (!brands || brands.length === 0) {
      return [
        {
          brand_id: "1",
          name: "Apple",
          logo_url:
            "https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg",
          slug: "apple",
        },
        {
          brand_id: "2",
          name: "Samsung",
          logo_url:
            "https://upload.wikimedia.org/wikipedia/commons/2/24/Samsung_Logo.svg",
          slug: "samsung",
        },
        { brand_id: "3", name: "OnePlus", logo_url: "", slug: "oneplus" },
        { brand_id: "4", name: "Xiaomi", logo_url: "", slug: "xiaomi" },
        { brand_id: "5", name: "Realme", logo_url: "", slug: "realme" },
        { brand_id: "6", name: "Vivo", logo_url: "", slug: "vivo" },
      ];
    }

    // Sort and filter real data - backend already filters by active
    const featuredBrands = brands.filter((brand) => brand.featured === true);
    const nonFeaturedBrands = brands.filter((brand) => brand.featured !== true);

    return [...featuredBrands, ...nonFeaturedBrands];
  }, [brands]);

  const handleBrandPress = (brand) => {
    router.push({
      pathname: "/products",
      params: { brand: brand.slug || brand.name },
    });
  };

  const handleSeeAll = () => {
    router.push("/products");
  };

  const renderBrandItem = (brand, index) => {
    let logoUrl = brand.logo_url;

    // Process URL if it's relative
    if (
      logoUrl &&
      !logoUrl.startsWith("http") &&
      !logoUrl.startsWith("data:")
    ) {
      const baseUrl = BACKEND_URL.replace(/\/api\/?$/, ""); // Remove /api suffix
      const separator = logoUrl.startsWith("/") ? "" : "/";
      logoUrl = `${baseUrl}${separator}${logoUrl}`;
    }

    const hasLogo =
      logoUrl && (logoUrl.startsWith("http") || logoUrl.startsWith("data:"));

    return (
      <TouchableOpacity
        key={`${brand.brand_id || brand.slug}-${index}`}
        onPress={() => handleBrandPress(brand)}
        style={{
          alignItems: "center",
          marginRight: 16,
          width: 90,
        }}
        activeOpacity={0.7}
      >
        {/* Brand Logo Container */}
        <View
          style={{
            width: 80,
            height: 80,
            marginBottom: 8,
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 40,
            backgroundColor: colors.cardBg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
          }}
        >
          {hasLogo ? (
            <Image
              source={{ uri: logoUrl }}
              style={{ width: "100%", height: "100%" }}
              contentFit="contain"
              transition={200}
            />
          ) : (
            <Text
              style={{
                fontSize: 24,
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
            fontSize: 12,
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
                Shop by Brands
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
              Explore top brands with exclusive deals
            </Text>
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
      )}

      {/* Brands Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {displayBrands.map((brand, index) => renderBrandItem(brand, index))}
      </ScrollView>
    </View>
  );
}
