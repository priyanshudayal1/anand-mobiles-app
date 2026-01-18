import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Linking,
    Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import { useFooterStore } from "../store/useFooter";

export default function MoreMenu() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const {
        footerData,
        fetchFooterData,
        getContactInfo,
        getSocialLinks,
        getQuickLinks,
        getNewsletterConfig,
        isInitialized,
    } = useFooterStore();

    const [expandedSection, setExpandedSection] = useState(null);

    useEffect(() => {
        if (!isInitialized) {
            fetchFooterData();
        }
    }, []);

    const toggleSection = (sectionId) => {
        setExpandedSection(expandedSection === sectionId ? null : sectionId);
    };

    const contactInfo = getContactInfo();
    const socialLinks = getSocialLinks();
    const quickLinks = getQuickLinks();
    const newsletterConfig = getNewsletterConfig();

    // Navigation handler
    const handleNavigation = (route) => {
        if (route.startsWith("http")) {
            Linking.openURL(route);
        } else {
            router.push(route);
        }
    };

    // Contact action handlers
    const handleWhatsApp = () => {
        const whatsappNumber = contactInfo.whatsapp || "919876543210";
        Linking.openURL(`https://wa.me/${whatsappNumber}`);
    };

    const handlePhone = () => {
        const phone = contactInfo.phone || "+919876543210";
        Linking.openURL(`tel:${phone}`);
    };

    const handleEmail = () => {
        const email = contactInfo.email || "contact@anandmobiles.com";
        Linking.openURL(`mailto:${email}`);
    };

    // Social media icon mapping
    const getSocialIcon = (platform) => {
        const iconMap = {
            facebook: "logo-facebook",
            instagram: "logo-instagram",
            twitter: "logo-twitter",
            youtube: "logo-youtube",
            linkedin: "logo-linkedin",
            whatsapp: "logo-whatsapp",
        };
        return iconMap[platform?.toLowerCase()] || "globe-outline";
    };

    // Social media gradient colors
    const getSocialColor = (platform) => {
        const colorMap = {
            facebook: "#4267B2",
            instagram: "#E4405F",
            twitter: "#1DA1F2",
            youtube: "#FF0000",
            linkedin: "#0077B5",
            whatsapp: "#25D366",
        };
        return colorMap[platform?.toLowerCase()] || colors.primary;
    };

    // Sections configuration
    const sections = [
        {
            id: "store",
            title: "Store",
            icon: "storefront-outline",
            links: [
                { text: "Home", route: "/(tabs)" },
                { text: "Products", route: "/(tabs)/menu" },
                { text: "My Orders", route: "/orders" },
                { text: "My Wishlist", route: "/wishlist" },
            ],
        },
        {
            id: "help",
            title: "Help",
            icon: "help-circle-outline",
            links: [
                { text: "Track Your Order", route: "/order-tracking" },
                { text: "Customer Support", route: "/support" },
            ],
        },
        {
            id: "policies",
            title: "Policies",
            icon: "document-text-outline",
            links: [
                { text: "Terms & Conditions", route: "/terms" },
                { text: "Privacy Policy", route: "/privacy" },
                { text: "Refund Policy", route: "/refund-policy" },
                { text: "Shipping Policy", route: "/shipping-policy" },
            ],
        },
        {
            id: "connectus",
            title: "Connect With Us",
            icon: "people-outline",
            type: "social",
        },
        {
            id: "contact",
            title: "Contact",
            icon: "call-outline",
            type: "contact",
        },
    ];

    // Contact items
    const contactItems = [
        {
            id: "whatsapp",
            label: "WhatsApp Business",
            icon: "logo-whatsapp",
            action: handleWhatsApp,
            color: "#25D366",
        },
        {
            id: "phone",
            label: contactInfo.phone || "Call Us",
            icon: "call-outline",
            action: handlePhone,
            color: "#4A90D9",
        },
        {
            id: "email",
            label: contactInfo.email || "Email Us",
            icon: "mail-outline",
            action: handleEmail,
            color: colors.primary,
        },
    ];

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />

            {/* Header */}
            <View
                style={{
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.surface,
                }}
            >
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                    More
                </Text>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
                {sections.map((section) => (
                    <View
                        key={section.id}
                        style={{
                            marginBottom: 12,
                            borderRadius: 12,
                            overflow: "hidden",
                            backgroundColor: colors.surface,
                            borderWidth: 1,
                            borderColor: colors.border,
                        }}
                    >
                        {/* Section Header */}
                        <TouchableOpacity
                            onPress={() => toggleSection(section.id)}
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 16,
                                backgroundColor:
                                    expandedSection === section.id
                                        ? colors.backgroundSecondary
                                        : colors.surface,
                            }}
                        >
                            <View style={{ flexDirection: "row", alignItems: "center" }}>
                                <Ionicons
                                    name={section.icon}
                                    size={22}
                                    color={colors.primary}
                                    style={{ marginRight: 12 }}
                                />
                                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }}>
                                    {section.title}
                                </Text>
                            </View>
                            <Ionicons
                                name={expandedSection === section.id ? "chevron-up" : "chevron-down"}
                                size={20}
                                color={colors.textSecondary}
                            />
                        </TouchableOpacity>

                        {/* Section Content */}
                        {expandedSection === section.id && (
                            <View
                                style={{
                                    paddingHorizontal: 16,
                                    paddingBottom: 16,
                                    backgroundColor: colors.backgroundSecondary,
                                }}
                            >
                                {/* Regular Links Section */}
                                {section.type !== "social" && section.type !== "contact" && (
                                    <View style={{ gap: 8 }}>
                                        {section.links.map((link, index) => (
                                            <TouchableOpacity
                                                key={index}
                                                onPress={() => handleNavigation(link.route)}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    paddingVertical: 12,
                                                    paddingHorizontal: 12,
                                                    backgroundColor: colors.surface,
                                                    borderRadius: 8,
                                                }}
                                            >
                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={16}
                                                    color={colors.primary}
                                                    style={{ marginRight: 8 }}
                                                />
                                                <Text style={{ color: colors.text, fontSize: 14 }}>
                                                    {link.text}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </View>
                                )}

                                {/* Social Links Section */}
                                {section.type === "social" && (
                                    <View>
                                        {/* Newsletter */}
                                        {newsletterConfig.enabled && (
                                            <View style={{ marginBottom: 16 }}>
                                                <Text
                                                    style={{
                                                        fontSize: 14,
                                                        fontWeight: "600",
                                                        color: colors.text,
                                                        marginBottom: 4,
                                                    }}
                                                >
                                                    {newsletterConfig.title || "Newsletter"}
                                                </Text>
                                                <Text
                                                    style={{
                                                        fontSize: 12,
                                                        color: colors.textSecondary,
                                                        marginBottom: 8,
                                                    }}
                                                >
                                                    {newsletterConfig.description ||
                                                        "Subscribe to get updates on new products and offers"}
                                                </Text>
                                            </View>
                                        )}

                                        {/* Social Media Links */}
                                        <Text
                                            style={{
                                                fontSize: 14,
                                                fontWeight: "600",
                                                color: colors.text,
                                                marginBottom: 12,
                                            }}
                                        >
                                            Follow Us
                                        </Text>
                                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                                            {socialLinks.map((social, index) => (
                                                <TouchableOpacity
                                                    key={index}
                                                    onPress={() => Linking.openURL(social.url)}
                                                    style={{
                                                        width: 44,
                                                        height: 44,
                                                        borderRadius: 22,
                                                        backgroundColor: getSocialColor(social.platform),
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                    }}
                                                >
                                                    <Ionicons
                                                        name={getSocialIcon(social.platform)}
                                                        size={22}
                                                        color="#FFF"
                                                    />
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}

                                {/* Contact Section */}
                                {section.type === "contact" && (
                                    <View style={{ gap: 10 }}>
                                        {contactItems.map((item) => (
                                            <TouchableOpacity
                                                key={item.id}
                                                onPress={item.action}
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "center",
                                                    padding: 14,
                                                    backgroundColor: colors.surface,
                                                    borderRadius: 10,
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: item.color + "20",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        marginRight: 12,
                                                    }}
                                                >
                                                    <Ionicons name={item.icon} size={22} color={item.color} />
                                                </View>
                                                <Text
                                                    style={{
                                                        flex: 1,
                                                        fontSize: 14,
                                                        fontWeight: "500",
                                                        color: colors.text,
                                                    }}
                                                >
                                                    {item.label}
                                                </Text>
                                                <Ionicons
                                                    name="chevron-forward"
                                                    size={18}
                                                    color={colors.textSecondary}
                                                />
                                            </TouchableOpacity>
                                        ))}

                                        {/* Address */}
                                        {contactInfo.address && (
                                            <View
                                                style={{
                                                    flexDirection: "row",
                                                    alignItems: "flex-start",
                                                    padding: 14,
                                                    backgroundColor: colors.surface,
                                                    borderRadius: 10,
                                                    borderWidth: 1,
                                                    borderColor: colors.border,
                                                }}
                                            >
                                                <View
                                                    style={{
                                                        width: 40,
                                                        height: 40,
                                                        borderRadius: 20,
                                                        backgroundColor: colors.primary + "20",
                                                        justifyContent: "center",
                                                        alignItems: "center",
                                                        marginRight: 12,
                                                    }}
                                                >
                                                    <Ionicons name="location-outline" size={22} color={colors.primary} />
                                                </View>
                                                <View style={{ flex: 1 }}>
                                                    <Text
                                                        style={{
                                                            fontSize: 14,
                                                            fontWeight: "500",
                                                            color: colors.text,
                                                            marginBottom: 2,
                                                        }}
                                                    >
                                                        Our Address
                                                    </Text>
                                                    <Text
                                                        style={{
                                                            fontSize: 12,
                                                            color: colors.textSecondary,
                                                        }}
                                                    >
                                                        {contactInfo.address}
                                                    </Text>
                                                </View>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </View>
                        )}
                    </View>
                ))}

                {/* App Info */}
                <View style={{ marginTop: 24, alignItems: "center" }}>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        Anand Mobiles App v1.0.0
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary, marginTop: 4 }}>
                        © 2026 All Rights Reserved
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
