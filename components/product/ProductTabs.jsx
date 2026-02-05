import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useTheme } from "../../store/useTheme";
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Star,
  ThumbsUp,
  AlertTriangle,
  Info,
  FileText,
  List,
  MessageSquare,
} from "lucide-react-native";

const ProductTabs = ({ product }) => {
  const { colors } = useTheme();
  const [activeTab, setActiveTab] = useState("description");
  const [expandedSpecs, setExpandedSpecs] = useState(false);

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "specifications", label: "Specifications", icon: List },
    { id: "reviews", label: "Reviews", icon: MessageSquare },
  ];

  // Add dynamic attribute tabs
  const attributeKeys = Object.keys(product.attributes || {});

  const hasSpecifications =
    product.specifications && Object.keys(product.specifications).length > 0;
  const hasFeatures = product.features && product.features.length > 0;
  const hasReviews = product.reviewsData && product.reviewsData.length > 0;

  const renderDescription = () => (
    <View>
      {/* Description Text */}
      <Text
        style={{
          fontSize: 15,
          color: colors.text,
          lineHeight: 24,
          marginBottom: 20,
        }}
      >
        {product.description || "No description available."}
      </Text>

      {/* Key Features */}
      {hasFeatures && (
        <View style={{ marginBottom: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Key Features
          </Text>
          {product.features.map((feature, index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 12,
                  backgroundColor: colors.primary,
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: 12,
                  marginTop: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "bold",
                    color: colors.white,
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 22,
                }}
              >
                {feature}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Customers usually keep this item */}
      <View
        style={{
          backgroundColor: colors.white,
          borderWidth: 1,
          borderColor: colors.success,
          borderRadius: 8,
          padding: 12,
          flexDirection: "row",
        }}
      >
        <CheckCircle
          size={20}
          color={colors.success}
          style={{ marginTop: 2 }}
        />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{ fontWeight: "bold", fontSize: 14, color: colors.text }}
          >
            Customers usually keep this item
          </Text>
          <Text
            style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}
          >
            This product has fewer returns than average compared to similar
            products.
          </Text>
        </View>
      </View>
    </View>
  );

  const renderSpecifications = () => (
    <View>
      {hasSpecifications ? (
        <>
          {Object.entries(product.specifications)
            .slice(0, expandedSpecs ? undefined : 6)
            .map(([key, value], index) => (
              <View
                key={index}
                style={{
                  flexDirection: "row",
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                }}
              >
                <Text
                  style={{
                    flex: 1,
                    color: colors.textSecondary,
                    fontSize: 14,
                  }}
                >
                  {key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/^./, (str) => str.toUpperCase())}
                </Text>
                <Text
                  style={{
                    flex: 1,
                    color: colors.text,
                    fontSize: 14,
                    fontWeight: "500",
                  }}
                >
                  {String(value)}
                </Text>
              </View>
            ))}

          {Object.keys(product.specifications).length > 6 && (
            <TouchableOpacity
              onPress={() => setExpandedSpecs(!expandedSpecs)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 12,
                marginTop: 8,
              }}
            >
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 14,
                  fontWeight: "500",
                  marginRight: 4,
                }}
              >
                {expandedSpecs
                  ? "Show Less"
                  : `Show All ${Object.keys(product.specifications).length} Specs`}
              </Text>
              {expandedSpecs ? (
                <ChevronUp size={16} color={colors.primary} />
              ) : (
                <ChevronDown size={16} color={colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </>
      ) : (
        <View
          style={{
            alignItems: "center",
            paddingVertical: 40,
            backgroundColor: colors.backgroundSecondary,
            borderRadius: 8,
          }}
        >
          <Info size={32} color={colors.textSecondary} />
          <Text
            style={{ color: colors.textSecondary, fontSize: 14, marginTop: 8 }}
          >
            Specifications not available
          </Text>
        </View>
      )}

      {/* Attributes Section */}
      {attributeKeys.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <Text
            style={{
              fontSize: 16,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 12,
            }}
          >
            Additional Details
          </Text>
          {Object.entries(product.attributes).map(([key, value], index) => (
            <View
              key={index}
              style={{
                flexDirection: "row",
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
              }}
            >
              <Text
                style={{ flex: 1, color: colors.textSecondary, fontSize: 14 }}
              >
                {key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </Text>
              <Text
                style={{
                  flex: 1,
                  color: colors.text,
                  fontSize: 14,
                  fontWeight: "500",
                }}
              >
                {String(value)}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderReviews = () => {
    const rating = product.rating || product.average_rating || 0;
    const totalReviews =
      product.total_reviews ||
      product.reviews_count ||
      (product.reviewsData ? product.reviewsData.length : 0);

    return (
      <View>
        {/* Rating Summary */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 20,
            paddingBottom: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <View style={{ alignItems: "center", marginRight: 20 }}>
            <Text
              style={{ fontSize: 40, fontWeight: "bold", color: colors.text }}
            >
              {rating.toFixed(1)}
            </Text>
            <View style={{ flexDirection: "row", marginTop: 4 }}>
              {[1, 2, 3, 4, 5].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  color={
                    i < Math.floor(rating) ? colors.warning : colors.border
                  }
                  fill={i < Math.floor(rating) ? colors.warning : "transparent"}
                />
              ))}
            </View>
            <Text
              style={{
                fontSize: 12,
                color: colors.textSecondary,
                marginTop: 4,
              }}
            >
              {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
            </Text>
          </View>
        </View>

        {/* Reviews List */}
        {hasReviews ? (
          product.reviewsData.slice(0, 5).map((review, index) => (
            <View
              key={review.id || index}
              style={{
                paddingVertical: 16,
                borderBottomWidth:
                  index < product.reviewsData.length - 1 ? 1 : 0,
                borderBottomColor: colors.border,
              }}
            >
              {/* Review Header */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: colors.success,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    borderRadius: 4,
                    marginRight: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "bold",
                      color: colors.white,
                      marginRight: 2,
                    }}
                  >
                    {review.rating}
                  </Text>
                  <Star size={10} color={colors.white} fill={colors.white} />
                </View>
                {review.verified && (
                  <View
                    style={{
                      backgroundColor: colors.success + "20",
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      borderRadius: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 10,
                        color: colors.success,
                        fontWeight: "500",
                      }}
                    >
                      Verified Purchase
                    </Text>
                  </View>
                )}
              </View>

              {/* Review Title */}
              {review.title && (
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 4,
                  }}
                >
                  {review.title}
                </Text>
              )}

              {/* Review Comment */}
              <Text
                style={{
                  fontSize: 14,
                  color: colors.text,
                  lineHeight: 20,
                  marginBottom: 8,
                }}
              >
                {review.comment}
              </Text>

              {/* Review Footer */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                  By {review.user || "Anonymous"} •{" "}
                  {review.date
                    ? new Date(review.date).toLocaleDateString()
                    : "Recently"}
                </Text>
                {review.helpful_count > 0 && (
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <ThumbsUp size={12} color={colors.textSecondary} />
                    <Text
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginLeft: 4,
                      }}
                    >
                      {review.helpful_count} found helpful
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ))
        ) : (
          <View
            style={{
              alignItems: "center",
              paddingVertical: 40,
              backgroundColor: colors.backgroundSecondary,
              borderRadius: 8,
            }}
          >
            <MessageSquare size={32} color={colors.textSecondary} />
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 14,
                marginTop: 8,
              }}
            >
              No reviews yet
            </Text>
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Be the first to review this product
            </Text>
          </View>
        )}

        {hasReviews && totalReviews > 5 && (
          <TouchableOpacity
            style={{
              paddingVertical: 14,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <Text
              style={{ color: colors.primary, fontSize: 14, fontWeight: "500" }}
            >
              View All {totalReviews} Reviews
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return renderDescription();
      case "specifications":
        return renderSpecifications();
      case "reviews":
        return renderReviews();
      default:
        return renderDescription();
    }
  };

  return (
    <View style={{ backgroundColor: colors.white }}>
      {/* Tab Headers */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{
          backgroundColor: colors.backgroundSecondary,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
        contentContainerStyle={{ paddingHorizontal: 8 }}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;

          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 14,
                borderBottomWidth: 2,
                borderBottomColor: isActive ? colors.primary : "transparent",
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <TabIcon
                size={16}
                color={isActive ? colors.primary : colors.textSecondary}
              />
              <Text
                style={{
                  marginLeft: 6,
                  fontSize: 14,
                  fontWeight: isActive ? "600" : "400",
                  color: isActive ? colors.primary : colors.textSecondary,
                }}
              >
                {tab.label}
                {tab.id === "reviews" &&
                  product.total_reviews > 0 &&
                  ` (${product.total_reviews})`}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Tab Content */}
      <View style={{ padding: 16, minHeight: 200 }}>{renderTabContent()}</View>
    </View>
  );
};

export default ProductTabs;
