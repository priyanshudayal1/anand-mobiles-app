import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import { useWishlistStore } from "../store/useWishlist";
import { useCartStore } from "../store/useCart";

export default function Wishlist() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { items, isLoading, error, fetchWishlist, removeFromWishlist, clearError } = useWishlistStore();
    const { addToCart } = useCartStore();

    const [refreshing, setRefreshing] = useState(false);
    const [removingItemId, setRemovingItemId] = useState(null);
    const [addingToCartId, setAddingToCartId] = useState(null);

    useEffect(() => {
        fetchWishlist();
        return () => clearError();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchWishlist();
        setRefreshing(false);
    };

    const handleRemoveFromWishlist = async (itemId) => {
        Alert.alert(
            "Remove from Wishlist",
            "Are you sure you want to remove this item?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        setRemovingItemId(itemId);
                        const result = await removeFromWishlist(itemId);
                        setRemovingItemId(null);
                        if (!result.success) {
                            Alert.alert("Error", result.error || "Failed to remove item");
                        }
                    },
                },
            ]
        );
    };

    const handleAddToCart = async (item) => {
        if (item.stock === 0) {
            Alert.alert("Out of Stock", "This item is currently out of stock.");
            return;
        }

        const productId = item.product_id || item.id;
        setAddingToCartId(productId);
        try {
            const result = await addToCart(productId, 1);
            if (result?.success) {
                Alert.alert("Success", `${item.name} added to cart!`);
            } else {
                Alert.alert("Error", result?.error || "Failed to add to cart");
            }
        } catch (error) {
            Alert.alert("Error", "Failed to add to cart. Please try again.");
        } finally {
            setAddingToCartId(null);
        }
    };

    const handleProductPress = (productId) => {
        router.push(`/product/${productId}`);
    };

    const renderEmptyState = () => (
        <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <View
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.primary + "15",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Ionicons name="heart-outline" size={40} color={colors.primary} />
            </View>
            <Text
                style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                    marginBottom: 8,
                }}
            >
                Your wishlist is empty
            </Text>
            <Text
                style={{
                    color: colors.textSecondary,
                    textAlign: "center",
                    marginBottom: 24,
                    paddingHorizontal: 40,
                }}
            >
                Save items you like to your wishlist and they'll appear here
            </Text>
            <TouchableOpacity
                onPress={() => router.push("/(tabs)/menu")}
                style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                }}
            >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>Continue Shopping</Text>
            </TouchableOpacity>
        </View>
    );

    const renderWishlistItem = (item) => {
        const productId = item.product_id || item.id;
        const isRemoving = removingItemId === item.item_id;
        const isAddingToCart = addingToCartId === productId;
        const inStock = item.stock !== 0 && item.stock !== undefined;

        return (
            <View
                key={item.item_id || item.id}
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    marginBottom: 12,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 4,
                    elevation: 2,
                    overflow: "hidden",
                }}
            >
                <View style={{ padding: 16 }}>
                    <View style={{ flexDirection: "row" }}>
                        {/* Product Image */}
                        <TouchableOpacity
                            onPress={() => handleProductPress(productId)}
                            style={{
                                width: 100,
                                height: 100,
                                borderRadius: 8,
                                backgroundColor: colors.white || "#FFF",
                                padding: 8,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 1,
                            }}
                        >
                            {item.image ? (
                                <Image
                                    source={{ uri: item.image }}
                                    style={{ width: "100%", height: "100%" }}
                                    contentFit="contain"
                                />
                            ) : (
                                <View
                                    style={{
                                        flex: 1,
                                        justifyContent: "center",
                                        alignItems: "center",
                                        backgroundColor: colors.backgroundSecondary,
                                    }}
                                >
                                    <Feather name="image" size={32} color={colors.textSecondary} />
                                </View>
                            )}
                        </TouchableOpacity>

                        {/* Product Details */}
                        <View style={{ flex: 1, marginLeft: 16 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                                <View style={{ flex: 1 }}>
                                    {/* Category */}
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: colors.textSecondary,
                                            marginBottom: 4,
                                        }}
                                    >
                                        {item.category || "Product"}
                                    </Text>

                                    {/* Product Name */}
                                    <TouchableOpacity onPress={() => handleProductPress(productId)}>
                                        <Text
                                            style={{
                                                fontSize: 15,
                                                fontWeight: "500",
                                                color: colors.text,
                                                marginBottom: 4,
                                            }}
                                            numberOfLines={2}
                                        >
                                            {item.name}
                                        </Text>
                                    </TouchableOpacity>

                                    {/* Brand */}
                                    {item.brand && (
                                        <Text
                                            style={{
                                                fontSize: 12,
                                                color: colors.textSecondary,
                                                marginBottom: 4,
                                            }}
                                        >
                                            {item.brand}
                                        </Text>
                                    )}

                                    {/* Price */}
                                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 4 }}>
                                        <Text
                                            style={{
                                                fontSize: 18,
                                                fontWeight: "bold",
                                                color: colors.primary,
                                            }}
                                        >
                                            ₹{item.price?.toLocaleString()}
                                        </Text>
                                        {item.original_price && item.original_price > item.price && (
                                            <Text
                                                style={{
                                                    fontSize: 14,
                                                    color: colors.textSecondary,
                                                    textDecorationLine: "line-through",
                                                    marginLeft: 8,
                                                }}
                                            >
                                                ₹{item.original_price?.toLocaleString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>

                                {/* Remove Button */}
                                <TouchableOpacity
                                    onPress={() => handleRemoveFromWishlist(item.item_id)}
                                    disabled={isRemoving}
                                    style={{
                                        padding: 8,
                                        borderRadius: 20,
                                        backgroundColor: colors.backgroundSecondary,
                                    }}
                                >
                                    {isRemoving ? (
                                        <ActivityIndicator size="small" color={colors.textSecondary} />
                                    ) : (
                                        <Feather name="trash-2" size={18} color={colors.textSecondary} />
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Stock Status & Add to Cart */}
                            <View style={{ marginTop: 12 }}>
                                {/* Stock Indicator */}
                                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                                    <View
                                        style={{
                                            width: 8,
                                            height: 8,
                                            borderRadius: 4,
                                            backgroundColor: inStock ? colors.success : colors.error,
                                            marginRight: 6,
                                        }}
                                    />
                                    <Text
                                        style={{
                                            fontSize: 13,
                                            color: inStock ? colors.success : colors.error,
                                            fontWeight: "500",
                                        }}
                                    >
                                        {inStock ? "In Stock" : "Out of Stock"}
                                    </Text>
                                </View>

                                {/* Add to Cart Button */}
                                <TouchableOpacity
                                    onPress={() => handleAddToCart(item)}
                                    disabled={!inStock || isAddingToCart}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor: inStock ? colors.primary : colors.backgroundSecondary,
                                        paddingVertical: 10,
                                        borderRadius: 8,
                                        opacity: !inStock || isAddingToCart ? 0.7 : 1,
                                    }}
                                >
                                    {isAddingToCart ? (
                                        <ActivityIndicator size="small" color={inStock ? "#FFF" : colors.textSecondary} />
                                    ) : (
                                        <>
                                            <Feather
                                                name="shopping-cart"
                                                size={16}
                                                color={inStock ? "#FFF" : colors.textSecondary}
                                            />
                                            <Text
                                                style={{
                                                    marginLeft: 8,
                                                    color: inStock ? "#FFF" : colors.textSecondary,
                                                    fontWeight: "600",
                                                    fontSize: 14,
                                                }}
                                            >
                                                Add to Cart
                                            </Text>
                                        </>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        );
    };

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
                <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                        My Wishlist
                    </Text>
                    {items.length > 0 && (
                        <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                            {items.length} item{items.length > 1 ? "s" : ""} saved
                        </Text>
                    )}
                </View>
            </View>

            {/* Error Banner */}
            {error && (
                <View
                    style={{
                        backgroundColor: colors.error + "15",
                        padding: 12,
                        margin: 16,
                        marginBottom: 0,
                        borderRadius: 8,
                        flexDirection: "row",
                        alignItems: "center",
                    }}
                >
                    <Feather name="alert-circle" size={18} color={colors.error} />
                    <Text style={{ color: colors.error, marginLeft: 8, flex: 1 }}>{error}</Text>
                    <TouchableOpacity onPress={clearError}>
                        <Ionicons name="close" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            )}

            {/* Content */}
            {isLoading && !refreshing && items.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                        Loading wishlist...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ padding: 16, flexGrow: 1 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            tintColor={colors.primary}
                        />
                    }
                >
                    {items.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        items.map((item) => renderWishlistItem(item))
                    )}
                </ScrollView>
            )}
        </SafeAreaView>
    );
}
