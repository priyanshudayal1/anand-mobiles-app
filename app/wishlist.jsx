import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export default function Wishlist() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [wishlistItems, setWishlistItems] = useState([]);

    useEffect(() => {
        fetchWishlist();
    }, []);

    const fetchWishlist = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.wishlist);
            setWishlistItems(response.data.items || response.data || []);
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderItem = ({ item }) => (
        <View
            style={{
                backgroundColor: colors.surface,
                marginBottom: 16,
                padding: 12,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                flexDirection: "row",
                alignItems: "center",
            }}
        >
            <Image
                source={{ uri: item.thumbnail || item.image_url || 'https://via.placeholder.com/80' }}
                style={{ width: 80, height: 80, borderRadius: 8, backgroundColor: colors.backgroundSecondary }}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontSize: 16, fontWeight: "600", color: colors.text }} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "bold", marginTop: 4 }}>
                    ₹{item.price}
                </Text>
            </View>
            <TouchableOpacity onPress={() => {/* Add to cart logic or remove */ }}>
                <Ionicons name="cart-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
        </View>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />
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
                <Ionicons
                    name="arrow-back"
                    size={24}
                    color={colors.text}
                    onPress={() => router.back()}
                    style={{ marginRight: 16 }}
                />
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                    My Wishlist
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={wishlistItems}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.id || Math.random().toString()}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 50 }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                                Your wishlist is empty
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
import { TouchableOpacity } from "react-native";
