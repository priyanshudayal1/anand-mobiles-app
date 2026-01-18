import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export default function Orders() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get(API_ENDPOINTS.orders);
            setOrders(response.data.orders || []);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderOrder = ({ item }) => (
        <View
            style={{
                backgroundColor: colors.surface,
                marginBottom: 16,
                padding: 16,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
            }}
        >
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
                    Order #{item.id.slice(0, 8).toUpperCase()}
                </Text>
                <Text style={{ fontSize: 14, color: colors.primary, fontWeight: "500" }}>
                    {item.status}
                </Text>
            </View>
            <Text style={{ color: colors.textSecondary, fontSize: 13, marginBottom: 4 }}>
                {new Date(item.created_at).toLocaleDateString()}
            </Text>
            <Text style={{ color: colors.text, fontWeight: "600", marginTop: 8 }}>
                Total: ₹{item.total_amount}
            </Text>
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
                    My Orders
                </Text>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={orders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 50 }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                                No orders found
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
