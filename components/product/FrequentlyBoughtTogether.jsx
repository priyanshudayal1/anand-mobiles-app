import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, ScrollView } from "react-native";
import { ChevronDown, ChevronUp, Package, Plus } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";

export default function FrequentlyBoughtTogether({
  currentProduct,
  bundleProducts = [],
  onAddBundle,
}) {
  const { colors } = useTheme();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  if (!bundleProducts || bundleProducts.length === 0) {
    return null;
  }

  // Calculate bundle savings
  const currentPrice =
    currentProduct?.discountPrice || currentProduct?.currentPrice || 0;
  const bundleOriginalTotal =
    currentPrice +
    bundleProducts.reduce(
      (sum, p) => sum + (p.originalPrice || p.price || 0),
      0,
    );
  const bundleDiscountTotal =
    currentPrice +
    bundleProducts.reduce(
      (sum, p) => sum + (p.discountPrice || p.currentPrice || p.price || 0),
      0,
    );
  const bundleSavings = bundleOriginalTotal - bundleDiscountTotal;
  const savingsPercentage =
    bundleOriginalTotal > 0
      ? Math.round((bundleSavings / bundleOriginalTotal) * 100)
      : 0;

  return (
    <View
      style={{
        backgroundColor: colors.white,
        marginTop: 12,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Header */}
      <TouchableOpacity
        onPress={() => setExpanded(!expanded)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 16,
          paddingVertical: 14,
          backgroundColor: colors.white,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: colors.primary + "15",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 12,
            }}
          >
            <Package size={20} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 15,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 2,
              }}
            >
              Frequently Bought Together
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.success,
                fontWeight: "500",
              }}
            >
              Save ₹{bundleSavings.toLocaleString("en-IN")} when bought together
            </Text>
          </View>
        </View>
        {expanded ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>

      {/* Expanded Content */}
      {expanded && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
          {/* Current Product + Bundle Products */}
          <View style={{ marginBottom: 16 }}>
            {/* Current Product */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
                paddingBottom: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Image
                source={{
                  uri:
                    currentProduct?.images?.[0] ||
                    currentProduct?.image ||
                    "https://via.placeholder.com/60",
                }}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: 8,
                  backgroundColor: colors.backgroundSecondary,
                }}
                resizeMode="contain"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                  numberOfLines={2}
                >
                  This item: {currentProduct?.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  ₹{currentPrice.toLocaleString("en-IN")}
                </Text>
              </View>
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.success,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ color: colors.white, fontSize: 16 }}>✓</Text>
              </View>
            </View>

            {/* Bundle Products */}
            {bundleProducts.map((product, index) => {
              const productPrice =
                product.discountPrice ||
                product.currentPrice ||
                product.price ||
                0;
              const productOriginalPrice =
                product.originalPrice || product.price || 0;
              const productSavings = productOriginalPrice - productPrice;

              return (
                <View
                  key={product.id || index}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <TouchableOpacity
                    onPress={() =>
                      router.push(
                        `/product/${product.id || product.product_id}`,
                      )
                    }
                    style={{ flexDirection: "row", flex: 1 }}
                  >
                    <View style={{ position: "relative" }}>
                      <Image
                        source={{
                          uri:
                            product.images?.[0] ||
                            product.image ||
                            product.image_url ||
                            "https://via.placeholder.com/60",
                        }}
                        style={{
                          width: 60,
                          height: 60,
                          borderRadius: 8,
                          backgroundColor: colors.backgroundSecondary,
                        }}
                        resizeMode="contain"
                      />
                      <View
                        style={{
                          position: "absolute",
                          top: -8,
                          left: -8,
                          width: 24,
                          height: 24,
                          borderRadius: 12,
                          backgroundColor: colors.primary,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Plus size={14} color={colors.white} strokeWidth={3} />
                      </View>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: colors.text,
                          marginBottom: 4,
                        }}
                        numberOfLines={2}
                      >
                        {product.name || product.title || "Product"}
                      </Text>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          ₹{productPrice.toLocaleString("en-IN")}
                        </Text>
                        {productSavings > 0 && (
                          <>
                            <Text
                              style={{
                                fontSize: 12,
                                color: colors.textSecondary,
                                textDecorationLine: "line-through",
                                marginLeft: 6,
                              }}
                            >
                              ₹{productOriginalPrice.toLocaleString("en-IN")}
                            </Text>
                            <Text
                              style={{
                                fontSize: 11,
                                color: colors.success,
                                marginLeft: 6,
                                fontWeight: "500",
                              }}
                            >
                              Save ₹{productSavings.toLocaleString("en-IN")}
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>

          {/* Bundle Summary */}
          <View
            style={{
              backgroundColor: colors.primary + "08",
              padding: 12,
              borderRadius: 8,
              marginBottom: 12,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "600",
                  color: colors.text,
                }}
              >
                Total Bundle Price:
              </Text>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: colors.primary,
                  }}
                >
                  ₹{bundleDiscountTotal.toLocaleString("en-IN")}
                </Text>
                {bundleSavings > 0 && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.textSecondary,
                      textDecorationLine: "line-through",
                    }}
                  >
                    ₹{bundleOriginalTotal.toLocaleString("en-IN")}
                  </Text>
                )}
              </View>
            </View>
            {bundleSavings > 0 && (
              <Text
                style={{
                  fontSize: 13,
                  color: colors.success,
                  fontWeight: "600",
                  textAlign: "right",
                }}
              >
                You save ₹{bundleSavings.toLocaleString("en-IN")} (
                {savingsPercentage}%)
              </Text>
            )}
          </View>

          {/* Add Bundle Button */}
          <TouchableOpacity
            onPress={onAddBundle}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.8}
          >
            <Text
              style={{
                color: colors.white,
                fontSize: 15,
                fontWeight: "600",
              }}
            >
              Add All {bundleProducts.length + 1} to Cart
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
