import React, { useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../store/useTheme";

const ProductVariantSelector = ({
  validOptions = [],
  selectedVariant,
  onSelect,
  productImages = [],
}) => {
  const { colors } = useTheme();

  if (!validOptions || validOptions.length === 0) return null;

  // Extract relevant attributes that define the variants (Color, RAM, Storage, etc.)
  const variantKeys = useMemo(() => {
    const keys = new Set();
    const ignoredKeys = [
      "price",
      "discounted_price",
      "stock",
      "id",
      "product_id",
      "image",
      "created_at",
      "updated_at",
      "sku",
      "name",
      "slug",
    ];

    validOptions.forEach((option) => {
      Object.keys(option).forEach((key) => {
        if (
          !ignoredKeys.includes(key) &&
          option[key] !== undefined &&
          option[key] !== null &&
          option[key] !== "" &&
          typeof option[key] === "string"
        ) {
          keys.add(key);
        }
      });
    });

    // Sort keys to ensure consistent order (e.g. Color first if possible)
    return Array.from(keys).sort((a, b) => {
      if (a.toLowerCase().includes("color")) return -1;
      if (b.toLowerCase().includes("color")) return 1;
      return a.localeCompare(b);
    });
  }, [validOptions]);

  const formatValue = (key, value) => {
    if (!value) return "";
    const strVal = value.toString();
    if (key === "storage") {
      return strVal.toUpperCase();
    }
    if (key === "ram") {
      return strVal.includes("GB") ? strVal : `${strVal} GB`;
    }
    if (key.toLowerCase().includes("color")) {
      return strVal.charAt(0).toUpperCase() + strVal.slice(1);
    }
    return strVal.charAt(0).toUpperCase() + strVal.slice(1);
  };

  const getVariantLabel = (option) => {
    return variantKeys.map((key) => formatValue(key, option[key])).join(" • ");
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 10,
        }}
      >
        Available Options:
      </Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {validOptions.map((option, index) => {
          const isSelected =
            selectedVariant &&
            (selectedVariant.id === option.id ||
              JSON.stringify(selectedVariant) === JSON.stringify(option));
          
          const inStock = option.stock > 0;
          const price = option.discounted_price || option.price || 0;
          const originalPrice = option.price || 0;
          const hasDiscount = price < originalPrice;
          const image = option.image || (productImages && productImages[0]);
          const label = getVariantLabel(option);

          return (
            <TouchableOpacity
              key={option.id || index}
              onPress={() => inStock && onSelect(option)}
              disabled={!inStock}
              activeOpacity={0.7}
              style={{
                width: 120, // Decreased width from 150
                padding: 8, // Decreased padding from 10
                marginRight: 10, // Decreased margin form 12
                borderRadius: 10, // Decreased radius from 12
                borderWidth: isSelected ? 2 : 1,
                borderColor: isSelected ? "#007185" : colors.border,
                backgroundColor: isSelected ? "#f0f8fa" : colors.white,
                opacity: inStock ? 1 : 0.6,
                // Shadow for cards
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 2,
              }}
            >
              {/* Image Area */}
              <View
                style={{
                  width: "100%",
                  aspectRatio: 1,
                  marginBottom: 6, // Decreased margin from 8
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                  borderRadius: 6, // Decreased radius from 8
                  overflow: 'hidden'
                }}
              >
                {image ? (
                  <Image
                    source={{ uri: typeof image === "string" ? image : "" }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="contain"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: "#f5f5f5",
                    }}
                  />
                )}
              </View>

              {/* Variant Details (Combined) */}
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 12, // Decreased font size from 13
                  fontWeight: "700",
                  color: colors.text,
                  marginBottom: 4, // Decreased margin from 6
                  height: 32, // Decreased height from 36
                  textAlign: 'left'
                }}
              >
                {label}
              </Text>

              {/* Price */}
              <View style={{ marginBottom: 2 }}>
                <View
                  style={{ flexDirection: "row", alignItems: "baseline" }}
                >
                  <Text
                    style={{
                      fontSize: 14, // Decreased font size from 15
                      fontWeight: "700",
                      color: colors.text,
                      marginRight: 4,
                    }}
                  >
                    ₹{price.toLocaleString()}
                  </Text>
                </View>
                {hasDiscount && (
                  <Text
                    style={{
                      fontSize: 10, // Decreased from 11
                      color: colors.textSecondary,
                      textDecorationLine: "line-through",
                    }}
                  >
                    ₹{originalPrice.toLocaleString()}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

export default ProductVariantSelector;
