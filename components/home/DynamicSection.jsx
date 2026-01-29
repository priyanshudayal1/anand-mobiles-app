import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";

const { width } = Dimensions.get("window");

export default function DynamicSection({ section }) {
    const { colors } = useTheme();
    const router = useRouter();

    if (!section || !section.enabled) {
        return null;
    }

    const { title, subtitle, section_type, config } = section;
    const slots = config?.content_slots || {};

    const handleLinkPress = (url) => {
        if (!url) return;

        // Check if it's an internal link (e.g., /categories/audio) or external
        // Simple naive routing for now
        if (url.startsWith("http")) {
            // Linking.openURL(url); // Or in-app browser
            console.log("Opening external link:", url);
        } else {
            // Try to map to app routes
            // e.g. /categories/audio -> /(tabs)/menu with params
            // For now just navigate to menu
            router.push("/(tabs)/menu");
        }
    };

    const renderSectionHeader = () => {
        if (!title) return null;
        return (
            <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
                    {title}
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
                {subtitle && (
                    <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 4 }}>
                        {subtitle}
                    </Text>
                )}
            </View>
        );
    };

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

    // Render logic based on type
    const renderContent = () => {
        switch (section_type) {
            case "banner_grid_main_quad":
                // Mobile layout: Main Banner (full width) on top
                // Then 2 rows of 2 cols for sub1-sub4
                return (
                    <View style={{ paddingHorizontal: 16, gap: 12 }}>
                        {/* Main Banner */}
                        {slots.main && renderBannerImage(slots.main, { width: "100%", height: width * 0.5 })}

                        {/* Grid for subs */}
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                            {/* Row 1 */}
                            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub1, { width: "100%", height: "100%" })}
                                </View>
                                <View style={{ flex: 1, aspectRatio: 4 / 3 }}>
                                    {renderBannerImage(slots.sub2, { width: "100%", height: "100%" })}
                                </View>
                            </View>
                            {/* Row 2 */}
                            <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
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

            case "custom":
                // Custom content usually is just a list of items?
                // Checking Home.jsx CustomSectionContent logic... it renders a grid of items
                // Let's assume it has an array of items in `content`? 
                // Based on Home.jsx: CustomSectionContent -> gets content from API endpoint /admin/homepage/sections/{id}/content/public/
                // Ah, `useHome` MIGHT fetch this if it fetches "sections" as a whole object including content? 
                // If not, DynamicSection needs to fetch it.
                // `useHome.js` fetchHomeData gets /products/mobile/home/. Let's assume it returns fully populated sections.
                // If config.content exists? Or maybe the `content` is fetched separately.
                // For now, let's skip "custom" or implement valid fallback.
                return (
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: colors.textSecondary }}>Custom section content not yet fully supported on mobile.</Text>
                    </View>
                );

            default:
                return (
                    <View style={{ padding: 16 }}>
                        <Text style={{ color: colors.textSecondary }}>Unsupported section type: {section_type}</Text>
                    </View>
                );
        }
    };

    return (
        <View style={{ marginTop: 8, paddingVertical: 16, backgroundColor: colors.cardBg }}>
            {renderSectionHeader()}
            {renderContent()}
        </View>
    );
}
