import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  FlatList,
  ScrollView,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import CountdownTimer from "../common/CountdownTimer";
import VideoCarousel from "./VideoCarousel";

const { width } = Dimensions.get("window");

// Reusable Product Card for horizontal scrolls
const ProductCard = ({ product, colors, onPress }) => {
  const CARD_WIDTH = width * 0.48;
  const discountPrice =
    Number(
      product?.discount_price || product?.discounted_price || product?.price,
    ) || 0;
  const originalPrice = Number(product?.price) || 0;
  const hasDiscount =
    originalPrice > 0 && discountPrice > 0 && originalPrice > discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  // Get product name safely
  const productName =
    product?.name ||
    [product?.brand, product?.model].filter(Boolean).join(" ") ||
    "Product";

  // Get rating safely
  const rating = typeof product?.rating === "number" ? product.rating : 0;

  return (
    <TouchableOpacity
      onPress={() => onPress(product)}
      style={{
        width: CARD_WIDTH,
        marginRight: 12,
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: colors.border,
      }}
      activeOpacity={0.8}
    >
      <View
        style={{
          height: 160,
          backgroundColor: colors.white,
          justifyContent: "center",
          alignItems: "center",
          padding: 8,
        }}
      >
        <Image
          source={{
            uri:
              product?.image ||
              product?.images?.[0] ||
              "https://via.placeholder.com/150",
          }}
          style={{ width: "100%", height: "100%" }}
          contentFit="contain"
          transition={200}
        />
        {discountPercent > 0 && (
          <View
            style={{
              position: "absolute",
              top: 6,
              right: 6,
              backgroundColor: colors.error,
              paddingHorizontal: 4,
              paddingVertical: 2,
              borderRadius: 4,
            }}
          >
            <Text
              style={{ color: colors.white, fontSize: 9, fontWeight: "bold" }}
            >
              {discountPercent}% OFF
            </Text>
          </View>
        )}
      </View>
      <View style={{ padding: 8 }}>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "500",
            color: colors.text,
            marginBottom: 4,
            lineHeight: 16,
          }}
          numberOfLines={2}
        >
          {productName}
        </Text>
        {rating > 0 && (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 4,
            }}
          >
            <Star size={10} color={colors.warning} fill={colors.warning} />
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                marginLeft: 2,
              }}
            >
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
          <Text
            style={{ fontSize: 13, fontWeight: "bold", color: colors.text }}
          >
            ₹{discountPrice.toLocaleString()}
          </Text>
          {hasDiscount && (
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                textDecorationLine: "line-through",
              }}
            >
              ₹{originalPrice.toLocaleString()}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

// Reusable Banner Item that auto-adjusts height based on image aspect ratio
const BannerItem = ({ banner, onPress, style }) => {
  const [aspectRatio, setAspectRatio] = React.useState(16 / 9); // Default until loaded

  return (
    <TouchableOpacity
      onPress={() => onPress(banner)}
      style={[
        {
          width: "100%",
          aspectRatio,
          borderRadius: 0,
          overflow: "hidden",
          backgroundColor: "transparent",
        },
        style,
      ]}
      activeOpacity={0.9}
    >
      <Image
        source={{
          uri:
            banner?.image_url ||
            banner?.image ||
            "https://via.placeholder.com/300x200",
        }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain" // Ensure whole image is seen
        transition={200}
        onLoad={(e) => {
          const { width: imgW, height: imgH } = e.source;
          if (imgW && imgH) {
            setAspectRatio(imgW / imgH);
          }
        }}
      />
    </TouchableOpacity>
  );
};

// Tabbed Banner Grid Component
const TabbedSection = ({ section }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);

  const sectionTitle = section.title || "Mobiles & Accessories";
  const tabs = section.config?.tabs || [
    { name: "Best Seller", id: "best_seller" },
    { name: "5G Mobiles", id: "5g_mobiles" },
    { name: "Top Brands", id: "top_brands" },
    { name: "Accessories", id: "accessories" },
  ];

  const currentTabContent = section.config?.tab_contents?.[activeTab] || {};
  const banners = currentTabContent.banners || {};

  const handleLinkPress = (url) => {
    if (!url) return;
    if (url.startsWith("http")) {
      console.log("Opening external link:", url);
    } else {
      router.push("/products");
    }
  };

  const renderBanner = (banner) => (
    <BannerItem
      banner={banner}
      onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
      style={{ borderRadius: 8 }}
    />
  );

  const getGridLayout = (tabIndex) => {
    switch (tabIndex) {
      case 0:
        return "left-main-quad";
      case 1:
        return "left-main-quad";
      case 2:
        return "center-main-sides";
      case 3:
        return "quad-right-main";
      default:
        return "left-main-quad";
    }
  };

  const layout = getGridLayout(activeTab);
  const GAP = 12;
  const padding = 16;
  const itemWidth = (width - padding * 2 - GAP) / 2;

  const renderGrid = () => {
    switch (layout) {
      case "left-main-quad":
        return (
          <View style={{ gap: GAP }}>
            {renderBanner(banners.main)}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub1)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub2)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub3)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub4)}
              </View>
            </View>
          </View>
        );
      case "center-main-sides":
        return (
          <View style={{ gap: GAP }}>
            {renderBanner(banners.main)}
            <View style={{ flexDirection: "row", gap: GAP }}>
              <View style={{ flex: 1 }}>{renderBanner(banners.side1)}</View>
              <View style={{ flex: 1 }}>{renderBanner(banners.side2)}</View>
            </View>
            <View style={{ flexDirection: "row", gap: GAP }}>
              <View style={{ flex: 1 }}>{renderBanner(banners.side3)}</View>
              <View style={{ flex: 1 }}>{renderBanner(banners.side4)}</View>
            </View>
          </View>
        );
      case "quad-right-main":
        return (
          <View style={{ gap: GAP }}>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: GAP }}>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub1)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub2)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub3)}
              </View>
              <View style={{ width: itemWidth }}>
                {renderBanner(banners.sub4)}
              </View>
            </View>
            {renderBanner(banners.main)}
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ paddingHorizontal: 0 }}>
      {/* Tab Header inside section */}
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.primary, // Using theme color
            }}
          >
            {sectionTitle}
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 16 }}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(index)}
              style={{
                paddingBottom: 8,
                borderBottomWidth: activeTab === index ? 2 : 0,
                borderColor: colors.primary,
              }}
            >
              <Text
                style={{
                  fontWeight: "bold",
                  color: activeTab === index ? colors.primary : colors.text,
                  fontSize: 16,
                }}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <View style={{ paddingHorizontal: 16 }}>{renderGrid()}</View>
    </View>
  );
};

export default function DynamicSection({ section }) {
  const { colors } = useTheme();
  const router = useRouter();

  if (!section || section.enabled === false) {
    return null;
  }

  const { description, section_type, config } = section;
  let title = section.title;

  // Hide generic titles for banner grids
  if (
    title === "Split Banner Grid" ||
    title === "Triple Banner Grid" ||
    title === "Main + Quad Grid" ||
    section_type === "tabbed_banner_grid"
  ) {
    title = null;
  }

  const slots = config?.content_slots || {};
  const products = config?.products || [];
  const banners = config?.banners || [];

  const handleLinkPress = (url) => {
    if (!url) return;
    if (url.startsWith("http")) {
      console.log("Opening external link:", url);
    } else {
      router.push("/products");
    }
  };

  const handleProductPress = (product) => {
    router.push(`/product/${product?.id || product?.product_id || "0"}`);
  };

  const handleSeeAll = () => {
    router.push("/products");
  };

  // Section Header - underline from right to left like web version
  const renderSectionHeader = (showSeeAll = false) => {
    // Check for timer configuration
    const isDealType = [
      "flash_deal",
      "featured_deal",
      "deal_of_the_day",
      "clearance_sales",
    ].includes(section_type);

    const showTimer =
      isDealType && config?.countdown_enabled && config?.countdown_end_time;
    const timerLabel = config?.countdown_label;

    if (!title && !section.show_title && !showTimer) return null;

    return (
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 12,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1, marginRight: 8 }}>
            {(title || section.show_title) && (
              <View style={{ alignSelf: "flex-start" }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  {title || ""}
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
            )}
            {description ? (
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 4,
                }}
              >
                {description}
              </Text>
            ) : null}
          </View>
          {showSeeAll ? (
            <TouchableOpacity
              onPress={handleSeeAll}
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <Text style={{ fontWeight: "500", color: colors.primary }}>
                See All
              </Text>
              <ChevronRight size={16} color={colors.primary} />
            </TouchableOpacity>
          ) : null}
        </View>

        {showTimer && (
          <View style={{ marginTop: 8 }}>
            <CountdownTimer
              endTime={config.countdown_end_time}
              label={
                timerLabel ||
                (section_type === "flash_deal" ? "Hurry! Ends in" : "Ends in")
              }
              size="sm"
              variant="urgent"
              showIcon={true}
              showLabels={true}
            />
          </View>
        )}
      </View>
    );
  };

  // Banner Image
  const renderBannerImage = (data, style = {}) => {
    if (!data || !data.image_url) return null;
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleLinkPress(data.link_url)}
        style={[{ overflow: "hidden", borderRadius: 8 }, style]}
      >
        <Image
          source={{ uri: data.image_url }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  };

  // Product List
  const renderProductList = () => {
    if (!products || products.length === 0) {
      return (
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.textSecondary, textAlign: "center" }}>
            No products available
          </Text>
        </View>
      );
    }
    return (
      <FlatList
        data={products}
        renderItem={({ item }) => (
          <ProductCard
            product={item}
            colors={colors}
            onPress={handleProductPress}
          />
        )}
        keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />
    );
  };

  // Banner Grid
  const renderBannerGrid = () => {
    if (!banners || banners.length === 0) return null;
    const cols = banners.length >= 3 ? 3 : banners.length;
    const itemWidth = width / cols;
    return (
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          paddingHorizontal: 0,
          gap: 0,
        }}
      >
        {banners.map((banner, idx) => (
          <View key={idx.toString()} style={{ width: itemWidth }}>
            <BannerItem
              banner={banner}
              onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
            />
          </View>
        ))}
      </View>
    );
  };

  // Vertical Banner List - for New Arrivals (one image per row)
  const renderVerticalBannerList = () => {
    if (!banners || banners.length === 0) return null;
    return (
      <View style={{ paddingHorizontal: 0, gap: 0 }}>
        {banners.map((banner, idx) => (
          <BannerItem
            key={idx.toString()}
            banner={banner}
            onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
          />
        ))}
      </View>
    );
  };

  // Banner Carousel (Horizontal) with auto-height images
  const renderBannerCarousel = () => {
    if (!banners || banners.length === 0) return null;

    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 0, gap: 0 }}
        decelerationRate="fast"
        snapToAlignment="center"
        pagingEnabled
      >
        {banners.map((banner, idx) => (
          <View
            key={idx.toString()}
            style={{ width: width }} // Full width per item
          >
            <BannerItem
              banner={banner}
              onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
            />
          </View>
        ))}
      </ScrollView>
    );
  };

  // Render based on section type
  const renderContent = () => {
    switch (section_type) {
      // Grid Layouts
      case "banner_grid_main_quad":
        return (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {slots.main
              ? renderBannerImage(slots.main, {
                  width: "100%",
                  height: width * 0.5,
                })
              : null}
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                  {renderBannerImage(slots.sub1, {
                    width: "100%",
                    height: "100%",
                  })}
                </View>
                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                  {renderBannerImage(slots.sub2, {
                    width: "100%",
                    height: "100%",
                  })}
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                  {renderBannerImage(slots.sub3, {
                    width: "100%",
                    height: "100%",
                  })}
                </View>
                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                  {renderBannerImage(slots.sub4, {
                    width: "100%",
                    height: "100%",
                  })}
                </View>
              </View>
            </View>
          </View>
        );

      case "banner_grid_triple":
        return (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {slots.left && (
              <BannerItem
                banner={slots.left}
                onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
              />
            )}
            {slots.center && (
              <BannerItem
                banner={slots.center}
                onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
              />
            )}
            {slots.right && (
              <BannerItem
                banner={slots.right}
                onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
              />
            )}
          </View>
        );

      case "banner_grid_split":
        return (
          <View style={{ paddingHorizontal: 16, gap: 12 }}>
            {slots.main && (
              <BannerItem
                banner={slots.main}
                onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
              />
            )}
            {slots.side && (
              <BannerItem
                banner={slots.side}
                onPress={(b) => handleLinkPress(b?.link_url || b?.link)}
              />
            )}
          </View>
        );

      // Product Sections
      case "best_selling":
      case "flash_deal":
      case "featured_deal":
      case "phones_and_gadgets":
      case "electronic_gadgets":
      case "deal_of_the_day":
      case "clearance_sales":
        return renderProductList();

      // New Arrivals - Show banners vertically if available, otherwise products
      case "new_releases":
      case "new_arrivals":
        if (banners && banners.length > 0) {
          return renderVerticalBannerList();
        }
        return renderProductList();

      // Banner Sections
      case "special_offers_carousel":
        return renderBannerCarousel();

      case "banners":
      case "section_banners":
        return renderBannerGrid();

      case "whats_trending":
        return (
          <VideoCarousel
            showHeader={false}
            videos={config?.videos}
            autoPlay={false}
          />
        );

      case "video_carousel":
        return <VideoCarousel showHeader={false} videos={config?.videos} />;

      // Skip these for mobile (not critical)
      case "newsletter":
      case "testimonials":
      case "footer_section":
      case "static_promo_banners":
        return null;

      // For category-related, hero banners - handled separately in index.jsx
      case "hero_banner":
      case "category_list":
      case "categories":
      case "featured_products":
      case "brands":
      case "banner_carousel":
        // These have dedicated components, return null here
        return null;

      case "tabbed_banner_grid":
        return <TabbedSection section={section} />;

      case "custom":
        return (
          <View style={{ padding: 16 }}>
            <Text style={{ color: colors.textSecondary }}>
              Custom content section
            </Text>
          </View>
        );

      default:
        // For unknown types, try to render products or banners if available
        if (products.length > 0) return renderProductList();
        if (banners.length > 0) return renderBannerGrid();
        return null;
    }
  };

  const content = renderContent();

  // Don't render anything if content is null and it's a known skip type
  if (content === null) {
    return null;
  }

  return (
    <View
      style={{
        marginTop: 8,
        paddingVertical: 16,
        backgroundColor: colors.cardBg,
      }}
    >
      {renderSectionHeader(false)}
      {content}
    </View>
  );
}
