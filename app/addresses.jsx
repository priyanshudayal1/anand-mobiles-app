import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import api from "../services/api";

export default function Addresses() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const [loading, setLoading] = useState(true);
    const [addresses, setAddresses] = useState([]);

    useEffect(() => {
        // Mock fetch or verify actual endpoint
        // api.get("/users/addresses/")...
        // Assuming endpoint exists but since I didn't see it, I'll simulate empty list or fetch if endpoint is valid
        // From backend urls, endpoint is /addresses/ (under shop_users.urls incl)
        // So /api/users/addresses/
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        try {
            const response = await api.get("/users/addresses/");
            setAddresses(response.data.addresses || []);
        } catch (error) {
            console.error("Failed to fetch addresses:", error);
        } finally {
            setLoading(false);
        }
    };

    const renderAddress = ({ item }) => (
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
                    {item.name || "Home"}
                </Text>
                {item.is_default && (
                    <Text style={{ color: colors.primary, fontSize: 12, fontWeight: 'bold' }}>Default</Text>
                )}
            </View>
            <Text style={{ color: colors.text, fontSize: 14 }}>{item.street_address}</Text>
            <Text style={{ color: colors.text, fontSize: 14 }}>
                {item.city}, {item.state} {item.pincode}
            </Text>
            <Text style={{ color: colors.text, fontSize: 14 }}>{item.phone_number}</Text>
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
                    justifyContent: "space-between",
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border,
                    backgroundColor: colors.surface,
                }}
            >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Ionicons
                        name="arrow-back"
                        size={24}
                        color={colors.text}
                        onPress={() => router.back()}
                        style={{ marginRight: 16 }}
                    />
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                        Saved Addresses
                    </Text>
                </View>
                <TouchableOpacity onPress={() => {/* Navigate to add address */ }}>
                    <Ionicons name="add" size={24} color={colors.primary} />
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={addresses}
                    renderItem={renderAddress}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ padding: 16 }}
                    ListEmptyComponent={
                        <View style={{ alignItems: "center", marginTop: 50 }}>
                            <Text style={{ color: colors.textSecondary, fontSize: 16 }}>
                                No saved addresses
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
}
