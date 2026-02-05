import React, { useState, useEffect, useMemo } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../store/useTheme";
import { Check, AlertCircle } from "lucide-react-native";

const ProductVariantSelector = ({
  validOptions = [],
  selectedVariant,
  onSelect,
}) => {
  const { colors } = useTheme();

  if (!validOptions || validOptions.length === 0) return null;

  // Extract unique variant attributes from options
  const variantAttributes = useMemo(() => {
    const attributes = {};
    const allKeys = new Set();

    validOptions.forEach((option) => {
      Object.keys(option).forEach((key) => {
        // Filter out system fields
        if (
          ![
            "price",
            "discounted_price",
            "stock",
            "id",
            "product_id",
            "image",
          ].includes(key) &&
          option[key] !== undefined &&
          option[key] !== null &&
          option[key] !== "" &&
          typeof option[key] === "string" &&
          option[key].trim() !== ""
        ) {
          allKeys.add(key);
        }
      });
    });

    // Get unique values for each key
    allKeys.forEach((key) => {
      const values = [
        ...new Set(
          validOptions
            .map((option) => option[key])
            .filter(
              (value) =>
                value !== undefined &&
                value !== null &&
                value !== "" &&
                typeof value === "string" &&
                value.trim() !== "" &&
                value.length < 100,
            ),
        ),
      ];

      if (values.length > 0) {
        attributes[key] = values;
      }
    });

    return attributes;
  }, [validOptions]);

  const getDisplayName = (key) => {
    const keyMap = {
      colors: "Color",
      storage: "Storage",
      ram: "RAM",
      size: "Size",
    };
    return (
      keyMap[key] ||
      key.charAt(0).toUpperCase() +
        key
          .slice(1)
          .replace(/([A-Z])/g, " $1")
          .trim()
    );
  };

  const formatValue = (key, value) => {
    if (key === "storage") {
      return value.toString().toUpperCase();
    }
    if (key === "ram") {
      return value.toString().includes("GB") ? value : `${value} GB`;
    }
    if (key === "colors") {
      return value.charAt(0).toUpperCase() + value.slice(1);
    }
    return value.toString();
  };

  // Find option matching specific attribute value
  const findOptionWithAttribute = (key, value) => {
    return validOptions.find((option) => option[key] === value);
  };

  // Check if an option exists and has stock
  const getOptionStatus = (key, value) => {
    const option = findOptionWithAttribute(key, value);
    if (!option) return { exists: false, inStock: false, stock: 0, price: 0 };
    return {
      exists: true,
      inStock: option.stock > 0,
      stock: option.stock || 0,
      price: option.discounted_price || option.price || 0,
    };
  };

  // Handle attribute selection
  const handleAttributeSelect = (key, value) => {
    // Find the option that matches this attribute
    let matchingOption = validOptions.find((option) => {
      // Match selected attribute
      if (option[key] !== value) return false;

      // Also try to match other currently selected attributes
      for (const otherKey of Object.keys(variantAttributes)) {
        if (otherKey !== key && selectedVariant && selectedVariant[otherKey]) {
          if (option[otherKey] !== selectedVariant[otherKey]) {
            // If exact match not found, we still use this option
          }
        }
      }
      return true;
    });

    // If no exact match, find any option with the selected value
    if (!matchingOption) {
      matchingOption = validOptions.find((option) => option[key] === value);
    }

    if (matchingOption) {
      onSelect(matchingOption);
    }
  };

  if (Object.keys(variantAttributes).length === 0) return null;

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16 }}>
      {Object.entries(variantAttributes).map(([key, values]) => (
        <View key={key} style={{ marginBottom: 16 }}>
          {/* Attribute Label */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Text
              style={{ fontSize: 14, fontWeight: "600", color: colors.text }}
            >
              {getDisplayName(key)}:
            </Text>
            {selectedVariant && selectedVariant[key] && (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.primary,
                  marginLeft: 6,
                  fontWeight: "500",
                }}
              >
                {formatValue(key, selectedVariant[key])}
              </Text>
            )}
          </View>

          {/* Attribute Options */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {values.map((value, index) => {
              const isSelected =
                selectedVariant && selectedVariant[key] === value;
              const status = getOptionStatus(key, value);

              return (
                <TouchableOpacity
                  key={`${key}-${value}-${index}`}
                  onPress={() =>
                    status.inStock && handleAttributeSelect(key, value)
                  }
                  disabled={!status.inStock}
                  activeOpacity={0.7}
                  style={{
                    minWidth: 80,
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    marginRight: 10,
                    borderRadius: 8,
                    borderWidth: isSelected ? 2 : 1,
                    borderColor: isSelected
                      ? colors.primary
                      : !status.inStock
                        ? colors.border
                        : colors.border,
                    backgroundColor: isSelected
                      ? colors.primary + "10"
                      : !status.inStock
                        ? colors.backgroundSecondary
                        : colors.white,
                    opacity: !status.inStock ? 0.6 : 1,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                >
                  {/* Selected Check Mark */}
                  {isSelected && (
                    <View
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: colors.primary,
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Check size={12} color={colors.white} />
                    </View>
                  )}

                  {/* Value Text */}
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: isSelected ? "600" : "500",
                      color: !status.inStock
                        ? colors.textSecondary
                        : isSelected
                          ? colors.primary
                          : colors.text,
                      textAlign: "center",
                    }}
                  >
                    {formatValue(key, value)}
                  </Text>

                  {/* Price if available */}
                  {status.price > 0 && key === "storage" && (
                    <Text
                      style={{
                        fontSize: 11,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      ₹{status.price.toLocaleString()}
                    </Text>
                  )}

                  {/* Stock status */}
                  {!status.inStock && (
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        marginTop: 4,
                      }}
                    >
                      <AlertCircle size={10} color={colors.error} />
                      <Text
                        style={{
                          fontSize: 10,
                          color: colors.error,
                          marginLeft: 3,
                        }}
                      >
                        Out of Stock
                      </Text>
                    </View>
                  )}

                  {status.inStock && status.stock <= 5 && (
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.warning,
                        marginTop: 4,
                      }}
                    >
                      Only {status.stock} left
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ))}
    </View>
  );
};

export default ProductVariantSelector;
