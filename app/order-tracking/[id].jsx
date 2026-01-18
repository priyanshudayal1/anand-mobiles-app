import React, { useEffect, useState, useRef } from "react";
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, Image, Alert, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../store/useTheme";
import { useOrderStore } from "../../store/useOrder";

export default function OrderTracking() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { getOrderById, currentOrder, isLoading, error } = useOrderStore();

    // Animation value for progress bar
    const progressAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (id) {
            getOrderById(id);
        }
    }, [id]);

    useEffect(() => {
        if (currentOrder) {
            // Calculate progress 
            const totalSteps = currentOrder.timeline?.length || 5;
            const currentStepIndex = currentOrder.timeline?.findIndex(
                (step) => step.status === currentOrder.status
            );

            // If status found, calculate percentage (at least 10% if started)
            const targetWidth = currentStepIndex >= 0
                ? ((currentStepIndex + 1) / totalSteps) * 100
                : 5;

            Animated.timing(progressAnimation, {
                toValue: targetWidth,
                duration: 1500,
                useNativeDriver: false
            }).start();
        }
    }, [currentOrder]);

    const getStatusColor = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes("delivered")) return colors.success;
        if (s.includes("cancelled")) return colors.error;
        if (s.includes("pending") || s.includes("payment")) return colors.warning;
        if (s.includes("shipped") || s.includes("out")) return colors.info || "#3b82f6";
        if (s.includes("processing") || s.includes("assigned")) return colors.primary;
        return colors.textSecondary;
    };

    const getStatusIcon = (status) => {
        const s = (status || "").toLowerCase();
        if (s.includes("delivered")) return "check-circle";
        if (s.includes("cancelled")) return "x-circle";
        if (s.includes("shipped") || s.includes("out")) return "truck";
        if (s.includes("processing") || s.includes("packed")) return "package";
        return "clock";
    };

    if (isLoading) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading order details...</Text>
            </SafeAreaView>
        );
    }

    if (error || !currentOrder) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ padding: 16 }}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 20 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <View style={{ alignItems: 'center', marginTop: 100 }}>
                        <Feather name="alert-circle" size={48} color={colors.error} />
                        <Text style={{ fontSize: 20, fontWeight: 'bold', color: colors.text, marginTop: 16 }}>
                            Order Not Found
                        </Text>
                        <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8 }}>
                            {error || "We couldn't find the details for this order."}
                        </Text>
                        <TouchableOpacity
                            style={{
                                marginTop: 24,
                                backgroundColor: colors.primary,
                                paddingHorizontal: 20,
                                paddingVertical: 12,
                                borderRadius: 8
                            }}
                            onPress={() => router.back()}
                        >
                            <Text style={{ color: '#FFF', fontWeight: '600' }}>Go Back</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    const currentStatusColor = getStatusColor(currentOrder.status);

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />

            {/* Header */}
            <View style={{
                padding: 16,
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: colors.surface
            }}>
                <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <View>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text }}>
                        Order #{currentOrder.order_id?.slice(0, 8).toUpperCase() || id}
                    </Text>
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                        Ordered on {currentOrder.created_at_formatted || currentOrder.created_at}
                    </Text>
                </View>
                <View style={{ flex: 1 }} />
                <TouchableOpacity
                    onPress={() => Alert.alert("Download Invoice", "This feature will be available soon.")}
                    style={{ padding: 8 }}
                >
                    <Feather name="download" size={20} color={colors.primary} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Progress Bar */}
                <View style={{ height: 4, backgroundColor: colors.border, width: '100%' }}>
                    <Animated.View
                        style={{
                            height: '100%',
                            backgroundColor: currentStatusColor,
                            width: progressAnimation.interpolate({
                                inputRange: [0, 100],
                                outputRange: ['0%', '100%']
                            })
                        }}
                    />
                </View>

                {/* Status Card */}
                <View style={{
                    margin: 16,
                    padding: 20,
                    backgroundColor: colors.surface,
                    borderRadius: 16,
                    borderWidth: 1,
                    borderColor: colors.border,
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 2
                }}>
                    <View style={{
                        width: 64, height: 64,
                        borderRadius: 32,
                        backgroundColor: currentStatusColor + '20',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: 16
                    }}>
                        <Feather name={getStatusIcon(currentOrder.status)} size={32} color={currentStatusColor} />
                    </View>
                    <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: 4 }}>
                        {currentOrder.status}
                    </Text>
                    {currentOrder.estimated_delivery && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
                            <Feather name="calendar" size={14} color={colors.textSecondary} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.textSecondary }}>
                                Expected Delivery: <Text style={{ color: colors.text, fontWeight: '600' }}>
                                    {new Date(currentOrder.estimated_delivery).toLocaleDateString()}
                                </Text>
                            </Text>
                        </View>
                    )}
                </View>

                {/* Timeline */}
                <View style={{ margin: 16, marginTop: 0 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 16 }}>
                        Tracking Timeline
                    </Text>

                    <View style={{ backgroundColor: colors.surface, borderRadius: 16, padding: 16, borderWidth: 1, borderColor: colors.border }}>
                        {(currentOrder.timeline || []).map((step, index) => {
                            const isLast = index === (currentOrder.timeline.length - 1);
                            return (
                                <View key={index} style={{ flexDirection: 'row', minHeight: 60 }}>
                                    {/* Timeline Line */}
                                    <View style={{ width: 40, alignItems: 'center' }}>
                                        <View style={{
                                            width: 12, height: 12,
                                            borderRadius: 6,
                                            backgroundColor: step.date ? colors.primary : colors.border,
                                            zIndex: 1
                                        }} />
                                        {!isLast && (
                                            <View style={{
                                                width: 2,
                                                flex: 1,
                                                backgroundColor: step.date ? colors.primary : colors.border,
                                                marginVertical: 4
                                            }} />
                                        )}
                                    </View>

                                    {/* Content */}
                                    <View style={{ flex: 1, paddingBottom: 24 }}>
                                        <Text style={{ fontSize: 16, fontWeight: '600', color: step.date ? colors.text : colors.textSecondary }}>
                                            {step.status}
                                        </Text>
                                        <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
                                            {step.description || step.status}
                                        </Text>
                                        {step.date && (
                                            <Text style={{ fontSize: 12, color: colors.primary, marginTop: 4 }}>
                                                {new Date(step.date).toLocaleString()}
                                            </Text>
                                        )}
                                    </View>
                                </View>
                            );
                        })}
                        {(!currentOrder.timeline || currentOrder.timeline.length === 0) && (
                            <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>No timeline info available</Text>
                        )}
                    </View>
                </View>

                {/* Shipping & Payment Info */}
                <View style={{ margin: 16, marginTop: 0 }}>
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                        {/* Shipping Address */}
                        <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={{ padding: 8, borderRadius: 8, backgroundColor: colors.success + '20', marginRight: 8 }}>
                                    <Feather name="map-pin" size={16} color={colors.success} />
                                </View>
                                <Text style={{ fontWeight: '600', color: colors.text }}>Delivery Address</Text>
                            </View>
                            <Text style={{ color: colors.textSecondary, fontSize: 13, lineHeight: 20 }}>
                                {currentOrder.address ? (
                                    <>
                                        {currentOrder.address.street_address}{"\n"}
                                        {currentOrder.address.city}, {currentOrder.address.state}{"\n"}
                                        {currentOrder.address.postal_code}
                                    </>
                                ) : 'Address info not available'}
                            </Text>
                        </View>

                        {/* Order Summary */}
                        <View style={{ flex: 1, backgroundColor: colors.surface, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: colors.border }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                                <View style={{ padding: 8, borderRadius: 8, backgroundColor: colors.warning + '20', marginRight: 8 }}>
                                    <Feather name="credit-card" size={16} color={colors.warning} />
                                </View>
                                <Text style={{ fontWeight: '600', color: colors.text }}>Summary</Text>
                            </View>
                            <View style={{ gap: 8 }}>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Total</Text>
                                    <Text style={{ color: colors.text, fontWeight: 'bold' }}>₹{currentOrder.total_amount}</Text>
                                </View>
                                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                                    <Text style={{ color: colors.textSecondary, fontSize: 13 }}>Items</Text>
                                    <Text style={{ color: colors.text }}>{currentOrder.item_count || currentOrder.orderItems?.length || 0}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Tracking Link */}
                {currentOrder.tracking_url && (
                    <View style={{ margin: 16 }}>
                        <TouchableOpacity
                            style={{
                                flexDirection: 'row',
                                backgroundColor: colors.surface,
                                padding: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                borderWidth: 1,
                                borderColor: colors.border
                            }}
                            onPress={() => {
                                // Open External Link
                                // WebBrowser.openBrowserAsync(currentOrder.tracking_url);
                                Alert.alert("Tracking Link", currentOrder.tracking_url);
                            }}
                        >
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Feather name="external-link" size={20} color={colors.primary} style={{ marginRight: 12 }} />
                                <View>
                                    <Text style={{ fontWeight: '600', color: colors.text }}>Track on Carrier Website</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{currentOrder.carrier || "Courier"}</Text>
                                </View>
                            </View>
                            <Feather name="chevron-right" size={20} color={colors.textSecondary} />
                        </TouchableOpacity>
                    </View>
                )}

            </ScrollView>
        </SafeAreaView>
    );
}
