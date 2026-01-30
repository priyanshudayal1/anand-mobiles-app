import React from "react";
import { View, Text, TouchableOpacity, Dimensions, FlatList, ScrollView } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { Star, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";

const { width } = Dimensions.get("window");

// Reusable Product Card for horizontal scrolls
const ProductCard = ({ product, colors, onPress }) => {
    const CARD_WIDTH = width * 0.4;
    const discountPrice = Number(product?.discount_price || product?.discounted_price || product?.price) || 0;
    const originalPrice = Number(product?.price) || 0;
    const hasDiscount = originalPrice > 0 && discountPrice > 0 && originalPrice > discountPrice;
    const discountPercent = hasDiscount
        ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
        : 0;

    // Get product name safely
    const productName = product?.name ||
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
                    height: 100,
                    backgroundColor: colors.white,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 8,
                }}
            >
                <Image
                    source={{ uri: product?.image || product?.images?.[0] || "https://via.placeholder.com/150" }}
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
                        <Text style={{ color: colors.white, fontSize: 9, fontWeight: "bold" }}>
                            {discountPercent}% OFF
                        </Text>
                    </View>
                )}
            </View>
            <View style={{ padding: 8 }}>
                <Text
                    style={{ fontSize: 12, fontWeight: "500", color: colors.text, marginBottom: 4, lineHeight: 16 }}
                    numberOfLines={2}
                >
                    {productName}
                </Text>
                {rating > 0 && (
                    <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                        <Star size={10} color={colors.warning} fill={colors.warning} />
                        <Text style={{ fontSize: 10, color: colors.textSecondary, marginLeft: 2 }}>
                            {rating.toFixed(1)}
                        </Text>
                    </View>
                )}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
                    <Text style={{ fontSize: 13, fontWeight: "bold", color: colors.text }}>
                        ₹{discountPrice.toLocaleString()}
                    </Text>
                    {hasDiscount && (
                        <Text style={{ fontSize: 10, color: colors.textSecondary, textDecorationLine: "line-through" }}>
                            ₹{originalPrice.toLocaleString()}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default function DynamicSection({ section }) {
    const { colors } = useTheme();
    const router = useRouter();

    if (!section || section.enabled === false) {
        return null;
    }

    const { title, description, section_type, config } = section;
    const slots = config?.content_slots || {};
    const products = config?.products || [];
    const banners = config?.banners || [];

    const handleLinkPress = (url) => {
        if (!url) return;
        if (url.startsWith("http")) {
            console.log("Opening external link:", url);
        } else {
            router.push("/(tabs)/menu");
        }
    };

    const handleProductPress = (product) => {
        router.push(`/product/${product?.id || product?.product_id || "0"}`);
    };

    const handleSeeAll = () => {
        router.push("/(tabs)/menu");
    };

    // Section Header
    const renderSectionHeader = (showSeeAll = false) => {
        if (!title && !section.show_title) return null;
        return (
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 16, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>{title || ""}</Text>
                    <View style={{ height: 3, width: 64, marginTop: 4, backgroundColor: colors.primary, borderRadius: 2 }} />
                    {description ? (
                        <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>{description}</Text>
                    ) : null}
                </View>
                {showSeeAll ? (
                    <TouchableOpacity onPress={handleSeeAll} style={{ flexDirection: "row", alignItems: "center" }}>
                        <Text style={{ fontWeight: "500", color: colors.primary }}>See All</Text>
                        <ChevronRight size={16} color={colors.primary} />
                    </TouchableOpacity>
                ) : null}
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
                    <Text style={{ color: colors.textSecondary, textAlign: "center" }}>No products available</Text>
                </View>
            );
        }
        return (
            <FlatList
                data={products}
                renderItem={({ item }) => (
                    <ProductCard product={item} colors={colors} onPress={handleProductPress} />
                )}
                keyExtractor={(item, index) => (item?.id?.toString() || index.toString())}
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
        const itemWidth = (width - 48) / cols;
        return (
            <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 8 }}>
                {banners.map((banner, idx) => (
                    <TouchableOpacity
                        key={idx.toString()}
                        onPress={() => handleLinkPress(banner?.link_url || banner?.link)}
                        style={{ width: itemWidth - 8, aspectRatio: 16 / 9, borderRadius: 8, overflow: "hidden" }}
                        activeOpacity={0.9}
                    >
                        <Image
                            source={{ uri: banner?.image_url || banner?.image || "https://via.placeholder.com/300x200" }}
                            style={{ width: "100%", height: "100%" }}
                            contentFit="cover"
                            transition={200}
                        />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    // Render based on section type
    const renderContent = () => {
        switch (section_type) {
            // Grid Layouts
            case "banner_grid_main_quad":
                return (
                    <View style={{ paddingHorizontal: 16, gap: 12 }}>
                        {slots.main ? renderBannerImage(slots.main, { width: "100%", height: width * 0.5 }) : null}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                            <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub1, { width: "100%", height: "100%" })}
                                </View>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub2, { width: "100%", height: "100%" })}
                                </View>
                            </View>
                            <View style={{ flexDirection: "row", gap: 8, width: "100%" }}>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub3, { width: "100%", height: "100%" })}
                                </View>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub4, { width: "100%", height: "100%" })}
                                </View>
                            </View>
                        </View>
                    </View>
                );

            case "banner_grid_triple":
                return (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
                        {["left", "center", "right"].map((slotId) =>
                            slots[slotId]?.image_url ? (
                                <View key={slotId} style={{ width: width * 0.7, aspectRatio: 16 / 9 }}>
                                    {renderBannerImage(slots[slotId], { width: "100%", height: "100%" })}
                                </View>
                            ) : null
                        )}
                    </ScrollView>
                );

            case "banner_grid_split":
                return (
                    <View style={{ paddingHorizontal: 16, flexDirection: "row", gap: 12 }}>
                        <View style={{ flex: 3, aspectRatio: 4 / 3 }}>
                            {renderBannerImage(slots.main, { width: "100%", height: "100%" })}
                        </View>
                        <View style={{ flex: 2, aspectRatio: 3 / 4 }}>
                            {renderBannerImage(slots.side, { width: "100%", height: "100%" })}
                        </View>
                    </View>
                );

            // Product Sections
            case "best_selling":
            case "new_releases":
            case "flash_deal":
            case "featured_deal":
            case "phones_and_gadgets":
            case "electronic_gadgets":
                return renderProductList();

            // Banner Sections
            case "banners":
            case "section_banners":
            case "special_offers_carousel":
                return renderBannerGrid();

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
            case "whats_trending":
            case "banner_carousel":
                // These have dedicated components, return null here
                return null;

            case "tabbed_banner_grid":
                // Complex tabbed view - simplified for mobile
                return renderBannerGrid();

            case "custom":
                return (
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: colors.textSecondary }}>Custom content section</Text>
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
        <View style={{ marginTop: 8, paddingVertical: 16, backgroundColor: colors.cardBg }}>
            {renderSectionHeader(products.length > 0)}
            {content}
        </View>
    );
}
