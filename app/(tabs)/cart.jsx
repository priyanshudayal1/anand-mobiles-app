import React, { useEffect, useCallback } from "react";
import {
    View,
    Text,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from "react-native";
import { Image } from "expo-image";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { FlashList } from "@shopify/flash-list";
import { MotiView } from "moti";
import { useTheme } from "../../store/useTheme";
import { useCartStore } from "../../store/useCart";
import { useAuthStore } from "../../store/useAuth";

export default function Cart() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDarkMode } = useTheme();
    const { isAuthenticated } = useAuthStore();
    const {
        cartItems,
        cartTotal,
        itemCount,
        isLoading,
        fetchCart,
        incrementQuantity,
        decrementQuantity,
        removeFromCart,
        getCartCount,
    } = useCartStore();
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        }
    }, [isAuthenticated]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        try {
            await fetchCart();
        } finally {
            setRefreshing(false);
        }
    }, [fetchCart]);

    const handleRemove = (itemId) => {
        Alert.alert(
            "Remove Item",
            "Are you sure you want to remove this item from your cart?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Remove",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await removeFromCart(itemId);
                        } catch (error) {
                            Alert.alert("Error", "Failed to remove item");
                        }
                    },
                },
            ]
        );
    };

    const handleIncrement = async (itemId) => {
        try {
            await incrementQuantity(itemId);
        } catch (error) {
            Alert.alert("Error", "Failed to update quantity");
        }
    };

    const handleDecrement = async (itemId) => {
        try {
            await decrementQuantity(itemId);
        } catch (error) {
            Alert.alert("Error", "Failed to update quantity");
        }
    };

    const handleCheckout = () => {
        // TODO: Navigate to checkout screen
        Alert.alert("Checkout", "Checkout feature coming soon!");
    };

    const handleProductPress = (item) => {
        const productId = item.product_id || item.product?.id;
        if (productId) {
            router.push({
                pathname: "/(tabs)/menu",
                params: { productId },
            });
        }
    };

    const handleContinueShopping = () => {
        router.push("/(tabs)");
    };

    const renderCartItem = ({ item }) => {
        const product = item.product || item;
        const price = item.price || item.discounted_price || product.discount_price || product.price || 0;
        const originalPrice = product.price || price;
        const hasDiscount = originalPrice > price;
        const productName = item.name || product.name || `${product.brand || ""} ${product.model || ""}`.trim();
        const productImage = item.image || item.image_url || product.image || product.images?.[0] || "https://via.placeholder.com/100";

        return (
            <MotiView
                from={{ opacity: 0, translateY: 15 }}
                animate={{ opacity: 1, translateY: 0 }}
                transition={{ type: "timing", duration: 300 }}
            >
                <View
                    style={{
                        backgroundColor: colors.surface,
                        marginHorizontal: 16,
                        marginBottom: 12,
                        borderRadius: 12,
                        borderWidth: 1,
                        borderColor: colors.border,
                        borderLeftWidth: 4,
                        borderLeftColor: colors.primary,
                        overflow: "hidden",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: isDarkMode() ? 0.3 : 0.1,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    <TouchableOpacity
                        onPress={() => handleProductPress(item)}
                        activeOpacity={0.9}
                        style={{ flexDirection: "row", padding: 16 }}
                    >
                        {/* Product Image */}
                        <View
                            style={{
                                width: 80,
                                height: 80,
                                backgroundColor: colors.backgroundSecondary,
                                borderRadius: 10,
                                justifyContent: "center",
                                alignItems: "center",
                                padding: 4,
                                shadowColor: "#000",
                                shadowOffset: { width: 0, height: 1 },
                                shadowOpacity: 0.1,
                                shadowRadius: 2,
                                elevation: 2,
                            }}
                        >
                            <Image
                                source={{ uri: productImage }}
                                style={{ width: "100%", height: "100%" }}
                                contentFit="contain"
                                transition={200}
                            />
                        </View>

                        {/* Product Details */}
                        <View style={{ flex: 1, marginLeft: 14, justifyContent: "space-between" }}>
                            {/* Product Name */}
                            <Text
                                style={{
                                    fontSize: 15,
                                    fontWeight: "600",
                                    color: colors.text,
                                    marginBottom: 4,
                                }}
                                numberOfLines={2}
                            >
                                {productName}
                            </Text>

                            {/* Brand & Category */}
                            {(item.brand || item.category) && (
                                <Text style={{ fontSize: 12, color: colors.textSecondary, marginBottom: 4 }}>
                                    {item.brand && `${item.brand}`}
                                    {item.brand && item.category && " • "}
                                    {item.category && item.category}
                                </Text>
                            )}

                            {/* Price per item */}
                            <Text style={{ fontSize: 13, color: colors.textSecondary }}>
                                ₹{price.toLocaleString()} each
                            </Text>

                            {/* Total Price */}
                            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                                <Text style={{ fontSize: 17, fontWeight: "bold", color: colors.primary }}>
                                    ₹{(price * (item.quantity || 1)).toLocaleString()}
                                </Text>
                                {hasDiscount && (
                                    <Text
                                        style={{
                                            fontSize: 12,
                                            color: colors.textSecondary,
                                            textDecorationLine: "line-through",
                                            marginLeft: 8,
                                        }}
                                    >
                                        ₹{(originalPrice * (item.quantity || 1)).toLocaleString()}
                                    </Text>
                                )}
                            </View>
                        </View>

                        {/* Remove Button */}
                        <TouchableOpacity
                            onPress={() => handleRemove(item.item_id)}
                            style={{
                                padding: 8,
                                backgroundColor: colors.backgroundSecondary,
                                borderRadius: 20,
                                alignSelf: "flex-start",
                            }}
                        >
                            <Feather name="trash-2" size={16} color={colors.error} />
                        </TouchableOpacity>
                    </TouchableOpacity>

                    {/* Quantity Controls */}
                    <View
                        style={{
                            flexDirection: "row",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            paddingHorizontal: 16,
                            paddingVertical: 12,
                            borderTopWidth: 1,
                            borderTopColor: colors.border,
                            backgroundColor: colors.backgroundSecondary,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: "row",
                                alignItems: "center",
                                backgroundColor: colors.surface,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: colors.border,
                                padding: 4,
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => handleDecrement(item.item_id)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    backgroundColor: colors.primaryLight,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Feather name="minus" size={16} color={colors.primary} />
                            </TouchableOpacity>

                            <Text
                                style={{
                                    fontSize: 16,
                                    fontWeight: "600",
                                    color: colors.text,
                                    marginHorizontal: 16,
                                    minWidth: 24,
                                    textAlign: "center",
                                }}
                            >
                                {item.quantity || 1}
                            </Text>

                            <TouchableOpacity
                                onPress={() => handleIncrement(item.item_id)}
                                style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 6,
                                    backgroundColor: colors.primaryLight,
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <Feather name="plus" size={16} color={colors.primary} />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </MotiView>
        );
    };

    const totalItems = getCartCount();

    // Calculate totals
    const subtotal = cartTotal;
    const shipping = 0; // Free shipping
    const total = subtotal + shipping;

    // Empty Cart Component
    const EmptyCart = () => (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24,
            }}
        >
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 40,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode() ? 0.3 : 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                    width: "100%",
                }}
            >
                {/* Animated Icon */}
                <MotiView
                    from={{ scale: 0.8, opacity: 0.5 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "timing",
                        duration: 1000,
                        loop: true,
                    }}
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: colors.primaryLight,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 24,
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <Feather name="shopping-bag" size={48} color={colors.primary} />
                </MotiView>

                <Text
                    style={{
                        color: colors.text,
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 10,
                        textAlign: "center",
                    }}
                >
                    Your cart is empty
                </Text>

                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: 15,
                        textAlign: "center",
                        marginBottom: 28,
                        lineHeight: 22,
                        paddingHorizontal: 16,
                    }}
                >
                    Looks like you haven't added any products to your cart yet. Start shopping to fill it with amazing products!
                </Text>

                <TouchableOpacity
                    onPress={handleContinueShopping}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 28,
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 16 }}>
                        Browse Products
                    </Text>
                    <Feather name="arrow-right" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </MotiView>
    );

    // Not Logged In Component
    const NotLoggedIn = () => (
        <MotiView
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "timing", duration: 400 }}
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
                padding: 24,
            }}
        >
            <View
                style={{
                    backgroundColor: colors.surface,
                    borderRadius: 20,
                    padding: 40,
                    alignItems: "center",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDarkMode() ? 0.3 : 0.15,
                    shadowRadius: 12,
                    elevation: 8,
                    width: "100%",
                }}
            >
                <View
                    style={{
                        width: 100,
                        height: 100,
                        borderRadius: 50,
                        backgroundColor: colors.primaryLight,
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 24,
                    }}
                >
                    <Feather name="user" size={48} color={colors.primary} />
                </View>

                <Text
                    style={{
                        color: colors.text,
                        fontSize: 22,
                        fontWeight: "bold",
                        marginBottom: 10,
                        textAlign: "center",
                    }}
                >
                    Login Required
                </Text>

                <Text
                    style={{
                        color: colors.textSecondary,
                        fontSize: 15,
                        textAlign: "center",
                        marginBottom: 28,
                        lineHeight: 22,
                        paddingHorizontal: 16,
                    }}
                >
                    Please log in to view your cart and start shopping!
                </Text>

                <TouchableOpacity
                    onPress={() => router.push("/(auth)/login")}
                    style={{
                        backgroundColor: colors.primary,
                        paddingHorizontal: 28,
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        shadowColor: colors.primary,
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 5,
                    }}
                >
                    <Text style={{ color: "#FFF", fontWeight: "600", fontSize: 16 }}>
                        Log In
                    </Text>
                    <Feather name="log-in" size={18} color="#FFF" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
            </View>
        </MotiView>
    );

    // Cart Header
    const CartHeader = () => (
        <View
            style={{
                backgroundColor: colors.surface,
                marginHorizontal: 16,
                marginTop: 16,
                marginBottom: 8,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
                overflow: "hidden",
            }}
        >
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
                        Cart Items
                    </Text>
                    <View
                        style={{
                            backgroundColor: colors.primaryLight,
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                            marginLeft: 10,
                        }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: "600" }}>
                            {totalItems}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    // Continue Shopping Link
    const ContinueShoppingLink = () => (
        <TouchableOpacity
            onPress={handleContinueShopping}
            style={{
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 16,
                marginTop: 8,
                marginBottom: 16,
                paddingVertical: 12,
                paddingHorizontal: 16,
                backgroundColor: colors.primaryLight,
                borderRadius: 10,
                alignSelf: "flex-start",
            }}
        >
            <Feather name="arrow-left" size={16} color={colors.primary} />
            <Text style={{ color: colors.primary, fontWeight: "600", marginLeft: 8, fontSize: 14 }}>
                Continue Shopping
            </Text>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top"]}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />

            {/* Header */}
            <View
                style={{
                    padding: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.surface,
                }}
            >
                <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                    Shopping Cart
                </Text>
            </View>

            {!isAuthenticated ? (
                <NotLoggedIn />
            ) : isLoading && !refreshing ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                        Loading cart...
                    </Text>
                </View>
            ) : cartItems.length === 0 ? (
                <EmptyCart />
            ) : (
                <>
                    <FlashList
                        data={cartItems}
                        renderItem={renderCartItem}
                        keyExtractor={(item, index) => item.id?.toString() || item.product_id?.toString() || `cart-item-${index}`}
                        estimatedItemSize={180}
                        contentContainerStyle={{ paddingTop: 16, paddingBottom: 200 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={onRefresh}
                                tintColor={colors.primary}
                            />
                        }
                    >
                        <CartHeader />

                        {/* Cart Items */}
                        {cartItems.map((item, index) => (
                            <View key={item.item_id || item.id || index}>
                                {renderCartItem({ item })}
                            </View>
                        ))}

                        <ContinueShoppingLink />
                    </ScrollView>

                    {/* Bottom Order Summary & Checkout Section */}
                    <View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            backgroundColor: colors.surface,
                            borderTopWidth: 4,
                            borderTopColor: colors.primary,
                            paddingHorizontal: 16,
                            paddingTop: 16,
                            paddingBottom: Math.max(insets.bottom, 16),
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: -4 },
                            shadowOpacity: isDarkMode() ? 0.3 : 0.1,
                            shadowRadius: 8,
                            elevation: 10,
                        }}
                    >
                        {/* Order Summary Header */}
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
                            <Feather name="shopping-bag" size={20} color={colors.primary} />
                            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginLeft: 8 }}>
                                Order Summary
                            </Text>
                        </View>

                        {/* Order Summary Details */}
                        <View style={{ marginBottom: 16 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    marginBottom: 8,
                                }}
                            >
                                <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
                                    Subtotal
                                </Text>
                                <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>
                                    ₹{subtotal.toLocaleString()}
                                </Text>
                            </View>

                            <View
                                style={{
                                    height: 1,
                                    backgroundColor: colors.border,
                                    marginVertical: 8,
                                }}
                            />

                            <View
                                style={{
                                    flexDirection: "row",
                                    justifyContent: "space-between",
                                    paddingTop: 4,
                                }}
                            >
                                <Text style={{ color: colors.text, fontSize: 17, fontWeight: "bold" }}>
                                    Total
                                </Text>
                                <Text style={{ color: colors.primary, fontSize: 19, fontWeight: "bold" }}>
                                    ₹{total.toLocaleString()}
                                </Text>
                            </View>
                        </View>

                        {/* Checkout Button */}
                        <TouchableOpacity
                            onPress={handleCheckout}
                            style={{
                                backgroundColor: colors.primary,
                                paddingVertical: 16,
                                borderRadius: 12,
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "center",
                                shadowColor: colors.primary,
                                shadowOffset: { width: 0, height: 4 },
                                shadowOpacity: 0.3,
                                shadowRadius: 8,
                                elevation: 5,
                            }}
                        >
                            <Feather name="credit-card" size={18} color="#FFF" style={{ marginRight: 8 }} />
                            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "bold" }}>
                                Proceed to Checkout
                            </Text>
                        </TouchableOpacity>
                    </View>
                </>
            )}
        </SafeAreaView>
    );
}
