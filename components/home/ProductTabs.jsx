import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../../store/useTheme";
import { Info, List, MessageSquare } from "lucide-react-native";

const ProductTabs = ({ product }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("description");

  const tabs = [
    { id: "description", label: "Description", icon: Info },
    { id: "specifications", label: "Specifications", icon: List },
    {
      id: "reviews",
      label: `Reviews (${product.reviews_count || 0})`,
      icon: MessageSquare,
    },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 22,
                marginBottom: 16,
              }}
            >
              {product.description || "No description available."}
            </Text>

            {product.features && product.features.length > 0 && (
              <View>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Key Features
                </Text>
                {product.features.map((feature, index) => (
                  <View
                    key={index}
                    style={{ flexDirection: "row", marginBottom: 8 }}
                  >
                    <View
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: 10,
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        marginRight: 10,
                        marginTop: 2,
                      }}
                    >
                      <Text
                        style={{
                          color: colors.white,
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      >
                        {index + 1}
                      </Text>
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        color: colors.textSecondary,
                        fontSize: 14,
                        lineHeight: 20,
                      }}
                    >
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      case "specifications":
        return (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Technical Specifications
            </Text>
            {product.specifications &&
            Object.keys(product.specifications).length > 0 ? (
              Object.entries(product.specifications).map(
                ([key, value], index) => (
                  <View
                    key={index}
                    style={{
                      flexDirection: "row",
                      padding: 12,
                      backgroundColor:
                        index % 2 === 0
                          ? colors.backgroundSecondary
                          : "transparent",
                      borderRadius: 8,
                      marginBottom: 4,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        color: colors.textSecondary,
                        fontWeight: "500",
                        textTransform: "capitalize",
                      }}
                    >
                      {key.replace(/_/g, " ")}
                    </Text>
                    <Text
                      style={{
                        flex: 1.5,
                        color: colors.text,
                        fontWeight: "400",
                      }}
                    >
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : value.toString()}
                    </Text>
                  </View>
                ),
              )
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                No specifications available.
              </Text>
            )}
          </View>
        );
      case "reviews":
        return (
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "700",
                color: colors.text,
                marginBottom: 16,
              }}
            >
              Customer Reviews
            </Text>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((review, index) => (
                <View
                  key={index}
                  style={{
                    marginBottom: 16,
                    paddingBottom: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 8,
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: colors.text }}>
                      {review.user_name || "User"}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : ""}
                    </Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 8 }}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Text
                        key={star}
                        style={{
                          color:
                            star <= (review.rating || 0)
                              ? colors.warning
                              : colors.border,
                          fontSize: 14,
                        }}
                      >
                        ★
                      </Text>
                    ))}
                  </View>
                  <Text style={{ color: colors.textSecondary, lineHeight: 20 }}>
                    {review.comment}
                  </Text>
                </View>
              ))
            ) : (
              <Text style={{ color: colors.textSecondary }}>
                No reviews yet.
              </Text>
            )}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={{
        backgroundColor: colors.cardBg,
        marginBottom: 12,
        minHeight: 400,
      }}
    >
      {/* Tab Headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                paddingVertical: 12,
                paddingHorizontal: 16,
                marginRight: 8,
                borderBottomWidth: 3,
                borderBottomColor: isActive ? colors.primary : "transparent",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              {Icon && (
                <Icon
                  size={16}
                  color={isActive ? colors.primary : colors.textSecondary}
                  style={{ marginRight: 6 }}
                />
              )}
              <Text
                style={{
                  color: isActive ? colors.primary : colors.textSecondary,
                  fontWeight: isActive ? "600" : "400",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      <View>{renderContent()}</View>
    </View>
  );
};

export default ProductTabs;
