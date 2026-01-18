import React, { useEffect, useState } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import { useAddressStore } from "../store/useAddress";

export default function Addresses() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const {
        addresses,
        isLoading,
        error,
        fetchAddresses,
        addAddress,
        updateAddress,
        deleteAddress,
        setDefaultAddress,
        clearError,
    } = useAddressStore();

    const [refreshing, setRefreshing] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        type: "",
        street_address: "",
        city: "",
        state: "",
        postal_code: "",
        phone_number: "",
        is_default: false,
    });

    useEffect(() => {
        fetchAddresses();
        return () => clearError();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAddresses();
        setRefreshing(false);
    };

    const resetForm = () => {
        setFormData({
            type: "",
            street_address: "",
            city: "",
            state: "",
            postal_code: "",
            phone_number: "",
            is_default: false,
        });
        setEditingAddress(null);
        setShowForm(false);
    };

    const handleOpenAddForm = () => {
        resetForm();
        setShowForm(true);
    };

    const handleOpenEditForm = (address) => {
        setFormData({
            type: address.type || "",
            street_address: address.street_address || "",
            city: address.city || "",
            state: address.state || "",
            postal_code: address.postal_code || "",
            phone_number: address.phone_number || "",
            is_default: address.is_default || false,
        });
        setEditingAddress(address);
        setShowForm(true);
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.type.trim()) {
            Alert.alert("Error", "Please enter address name (e.g., Home, Office)");
            return;
        }
        if (!formData.street_address.trim()) {
            Alert.alert("Error", "Please enter street address");
            return;
        }
        if (!formData.city.trim()) {
            Alert.alert("Error", "Please enter city");
            return;
        }
        if (!formData.state.trim()) {
            Alert.alert("Error", "Please enter state");
            return;
        }
        if (!formData.postal_code.trim()) {
            Alert.alert("Error", "Please enter PIN code");
            return;
        }
        if (!formData.phone_number.trim()) {
            Alert.alert("Error", "Please enter phone number");
            return;
        }

        setIsSubmitting(true);

        try {
            let result;
            if (editingAddress) {
                result = await updateAddress(editingAddress.id, formData);
            } else {
                result = await addAddress(formData);
            }

            if (result.success) {
                Alert.alert(
                    "Success",
                    editingAddress ? "Address updated successfully" : "Address added successfully"
                );
                resetForm();
            } else {
                Alert.alert("Error", result.error || "Failed to save address");
            }
        } catch (error) {
            Alert.alert("Error", "Something went wrong. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (addressId) => {
        Alert.alert(
            "Delete Address",
            "Are you sure you want to delete this address? This action cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        const result = await deleteAddress(addressId);
                        if (result.success) {
                            Alert.alert("Success", "Address deleted successfully");
                        } else {
                            Alert.alert("Error", result.error || "Failed to delete address");
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefault = async (addressId) => {
        const result = await setDefaultAddress(addressId);
        if (result.success) {
            Alert.alert("Success", "Default address updated");
        } else {
            Alert.alert("Error", result.error || "Failed to set default address");
        }
    };

    const renderAddressCard = (address) => (
        <View
            key={address.id}
            style={{
                backgroundColor: colors.surface,
                marginBottom: 12,
                padding: 16,
                borderRadius: 12,
                borderWidth: address.is_default ? 2 : 1,
                borderColor: address.is_default ? colors.primary : colors.border,
            }}
        >
            {/* Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <View
                        style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: colors.primary + "15",
                            justifyContent: "center",
                            alignItems: "center",
                            marginRight: 10,
                        }}
                    >
                        <Feather
                            name={address.type?.toLowerCase() === "office" ? "briefcase" : "home"}
                            size={18}
                            color={colors.primary}
                        />
                    </View>
                    <Text style={{ fontSize: 16, fontWeight: "bold", color: colors.text }}>
                        {address.type || "Home"}
                    </Text>
                </View>
                {address.is_default && (
                    <View
                        style={{
                            backgroundColor: colors.primary + "20",
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 12,
                        }}
                    >
                        <Text style={{ color: colors.primary, fontSize: 12, fontWeight: "600" }}>
                            Default
                        </Text>
                    </View>
                )}
            </View>

            {/* Address Details */}
            <View style={{ flexDirection: "row", marginBottom: 8 }}>
                <Feather name="map-pin" size={16} color={colors.textSecondary} style={{ marginTop: 2, marginRight: 8 }} />
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                        {address.street_address}
                    </Text>
                    <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                        {address.city}, {address.state} - {address.postal_code}
                    </Text>
                </View>
            </View>

            {/* Phone */}
            <View style={{ flexDirection: "row", marginBottom: 16 }}>
                <Feather name="phone" size={16} color={colors.textSecondary} style={{ marginTop: 2, marginRight: 8 }} />
                <Text style={{ color: colors.text, fontSize: 14 }}>
                    {address.phone_number}
                </Text>
            </View>

            {/* Actions */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 12 }}>
                {!address.is_default ? (
                    <TouchableOpacity
                        onPress={() => handleSetDefault(address.id)}
                        disabled={isLoading}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            borderWidth: 1,
                            borderColor: colors.primary,
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 6,
                        }}
                    >
                        <Ionicons name="checkmark-circle-outline" size={16} color={colors.primary} />
                        <Text style={{ color: colors.primary, marginLeft: 6, fontSize: 13, fontWeight: "500" }}>
                            Set as Default
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View />
                )}

                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity
                        onPress={() => handleOpenEditForm(address)}
                        disabled={isLoading}
                        style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: colors.backgroundSecondary,
                        }}
                    >
                        <Feather name="edit-2" size={18} color={colors.textSecondary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleDelete(address.id)}
                        disabled={isLoading}
                        style={{
                            padding: 8,
                            borderRadius: 8,
                            backgroundColor: colors.error + "15",
                        }}
                    >
                        <Feather name="trash-2" size={18} color={colors.error} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const renderEmptyState = () => (
        <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <View
                style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: colors.textSecondary + "15",
                    justifyContent: "center",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <Feather name="map-pin" size={36} color={colors.textSecondary} />
            </View>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginBottom: 8 }}>
                No addresses found
            </Text>
            <Text style={{ color: colors.textSecondary, textAlign: "center", marginBottom: 24, paddingHorizontal: 20 }}>
                Add your first address to get started with deliveries
            </Text>
            <TouchableOpacity
                onPress={handleOpenAddForm}
                style={{
                    backgroundColor: colors.primary,
                    paddingHorizontal: 24,
                    paddingVertical: 12,
                    borderRadius: 8,
                }}
            >
                <Text style={{ color: "#FFF", fontWeight: "600" }}>Add Address</Text>
            </TouchableOpacity>
        </View>
    );

    const renderForm = () => (
        <Modal
            visible={showForm}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={resetForm}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1, backgroundColor: colors.background }}
            >
                <SafeAreaView style={{ flex: 1 }} edges={["top"]}>
                    {/* Form Header */}
                    <View
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: 16,
                            borderBottomWidth: 1,
                            borderBottomColor: colors.border,
                            backgroundColor: colors.surface,
                        }}
                    >
                        <TouchableOpacity onPress={resetForm}>
                            <Ionicons name="close" size={24} color={colors.text} />
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
                            {editingAddress ? "Edit Address" : "Add New Address"}
                        </Text>
                        <View style={{ width: 24 }} />
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 16 }}>
                        {/* Address Name */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                Address Name *
                            </Text>
                            <TextInput
                                value={formData.type}
                                onChangeText={(text) => setFormData({ ...formData, type: text })}
                                placeholder="Home, Office, etc."
                                placeholderTextColor={colors.textSecondary}
                                style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: colors.text,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            />
                        </View>

                        {/* Phone Number */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                Phone Number *
                            </Text>
                            <TextInput
                                value={formData.phone_number}
                                onChangeText={(text) => setFormData({ ...formData, phone_number: text })}
                                placeholder="Contact number for delivery"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="phone-pad"
                                style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: colors.text,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            />
                        </View>

                        {/* Street Address */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                Street Address *
                            </Text>
                            <TextInput
                                value={formData.street_address}
                                onChangeText={(text) => setFormData({ ...formData, street_address: text })}
                                placeholder="Flat, House no., Building, Company, Apartment"
                                placeholderTextColor={colors.textSecondary}
                                multiline
                                numberOfLines={2}
                                style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: colors.text,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                    minHeight: 60,
                                    textAlignVertical: "top",
                                }}
                            />
                        </View>

                        {/* City and State Row */}
                        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                    City *
                                </Text>
                                <TextInput
                                    value={formData.city}
                                    onChangeText={(text) => setFormData({ ...formData, city: text })}
                                    placeholder="City"
                                    placeholderTextColor={colors.textSecondary}
                                    style={{
                                        backgroundColor: colors.backgroundSecondary,
                                        borderRadius: 8,
                                        padding: 12,
                                        color: colors.text,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                    State *
                                </Text>
                                <TextInput
                                    value={formData.state}
                                    onChangeText={(text) => setFormData({ ...formData, state: text })}
                                    placeholder="State"
                                    placeholderTextColor={colors.textSecondary}
                                    style={{
                                        backgroundColor: colors.backgroundSecondary,
                                        borderRadius: 8,
                                        padding: 12,
                                        color: colors.text,
                                        borderWidth: 1,
                                        borderColor: colors.border,
                                    }}
                                />
                            </View>
                        </View>

                        {/* PIN Code */}
                        <View style={{ marginBottom: 16 }}>
                            <Text style={{ color: colors.textSecondary, marginBottom: 8, fontWeight: "500" }}>
                                PIN Code *
                            </Text>
                            <TextInput
                                value={formData.postal_code}
                                onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
                                placeholder="6-digit PIN code"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="numeric"
                                maxLength={6}
                                style={{
                                    backgroundColor: colors.backgroundSecondary,
                                    borderRadius: 8,
                                    padding: 12,
                                    color: colors.text,
                                    borderWidth: 1,
                                    borderColor: colors.border,
                                }}
                            />
                        </View>

                        {/* Set as Default Checkbox */}
                        <TouchableOpacity
                            onPress={() => setFormData({ ...formData, is_default: !formData.is_default })}
                            style={{ flexDirection: "row", alignItems: "center", marginBottom: 24 }}
                        >
                            <View
                                style={{
                                    width: 22,
                                    height: 22,
                                    borderRadius: 4,
                                    borderWidth: 2,
                                    borderColor: formData.is_default ? colors.primary : colors.border,
                                    backgroundColor: formData.is_default ? colors.primary : "transparent",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    marginRight: 10,
                                }}
                            >
                                {formData.is_default && (
                                    <Ionicons name="checkmark" size={16} color="#FFF" />
                                )}
                            </View>
                            <Text style={{ color: colors.text, fontSize: 14 }}>
                                Set as default address
                            </Text>
                        </TouchableOpacity>

                        {/* Action Buttons */}
                        <View style={{ flexDirection: "row", gap: 12 }}>
                            <TouchableOpacity
                                onPress={resetForm}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 8,
                                    backgroundColor: colors.backgroundSecondary,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{ color: colors.text, fontWeight: "600" }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleSubmit}
                                disabled={isSubmitting}
                                style={{
                                    flex: 1,
                                    padding: 14,
                                    borderRadius: 8,
                                    backgroundColor: colors.primary,
                                    alignItems: "center",
                                    flexDirection: "row",
                                    justifyContent: "center",
                                }}
                            >
                                {isSubmitting && (
                                    <ActivityIndicator size="small" color="#FFF" style={{ marginRight: 8 }} />
                                )}
                                <Text style={{ color: "#FFF", fontWeight: "600" }}>
                                    {editingAddress ? "Update Address" : "Save Address"}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />

            {/* Header */}
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
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color={colors.text} />
                    </TouchableOpacity>
                    <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
                        My Addresses
                    </Text>
                </View>
                {addresses.length > 0 && (
                    <TouchableOpacity
                        onPress={handleOpenAddForm}
                        disabled={isLoading}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            backgroundColor: colors.primary,
                            paddingHorizontal: 14,
                            paddingVertical: 8,
                            borderRadius: 20,
                        }}
                    >
                        <Ionicons name="add" size={18} color="#FFF" />
                        <Text style={{ color: "#FFF", marginLeft: 4, fontWeight: "600", fontSize: 13 }}>
                            Add
                        </Text>
                    </TouchableOpacity>
                )}
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
            {isLoading && !refreshing && addresses.length === 0 ? (
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ marginTop: 16, color: colors.textSecondary }}>
                        Loading addresses...
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
                    {addresses.length === 0 ? (
                        renderEmptyState()
                    ) : (
                        addresses.map((address) => renderAddressCard(address))
                    )}
                </ScrollView>
            )}

            {/* Add/Edit Form Modal */}
            {renderForm()}
        </SafeAreaView>
    );
}
