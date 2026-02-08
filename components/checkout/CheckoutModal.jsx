import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../../store/useTheme";
import { useAddressStore } from "../../store/useAddress";
import { useOrderStore } from "../../store/useOrder";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../store/useToast";
import CustomModal from "../common/CustomModal";

export default function CheckoutModal({ visible, onClose, totalAmount }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    addresses,
    fetchAddresses,
    isLoading: isAddressLoading,
  } = useAddressStore();
  const {
    placeOrderFromCart,
    isProcessingPayment,
    paymentSuccessful,
    error: orderError,
    clearError,
  } = useOrderStore();

  const [selectedAddressId, setSelectedAddressId] = React.useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { error: showError } = useToast();

  useEffect(() => {
    if (visible) {
      fetchAddresses();
    }
  }, [visible]);

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find((a) => a.is_default);
      setSelectedAddressId(
        defaultAddress ? defaultAddress.id : addresses[0].id,
      );
    }
  }, [addresses]);

  useEffect(() => {
    if (paymentSuccessful) {
      setShowSuccessModal(true);
    }
  }, [paymentSuccessful]);

  useEffect(() => {
    if (orderError) {
      showError(orderError);
      clearError();
    }
  }, [orderError]);

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddressId) {
        showError("Please select a delivery address.");
        return;
      }
      await placeOrderFromCart(selectedAddressId);
    } catch (e) {
      // Error is handled by useEffect for orderError
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            height: "85%",
            paddingTop: 20,
          }}
        >
          {/* Header */}
          <View
            style={{
              paddingHorizontal: 20,
              paddingBottom: 15,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}
            >
              Checkout
            </Text>
            <TouchableOpacity onPress={onClose} disabled={isProcessingPayment}>
              <Feather name="x" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 20 }}>
            {/* Address Section */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Delivery Address
            </Text>

            {isAddressLoading ? (
              <ActivityIndicator color={colors.primary} />
            ) : addresses.length === 0 ? (
              <TouchableOpacity
                onPress={() => {
                  onClose();
                  router.push("/profile/addresses");
                }}
                style={{
                  padding: 15,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderStyle: "dashed",
                }}
              >
                <Text style={{ color: colors.primary }}>+ Add New Address</Text>
              </TouchableOpacity>
            ) : (
              <View>
                {addresses.map((addr) => (
                  <TouchableOpacity
                    key={addr.id}
                    onPress={() => setSelectedAddressId(addr.id)}
                    style={{
                      padding: 15,
                      borderRadius: 12,
                      backgroundColor:
                        selectedAddressId === addr.id
                          ? colors.surface
                          : colors.backgroundSecondary,
                      borderWidth: 2,
                      borderColor:
                        selectedAddressId === addr.id
                          ? colors.primary
                          : "transparent",
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 5,
                      }}
                    >
                      <Text style={{ fontWeight: "bold", color: colors.text }}>
                        {addr.type}
                      </Text>
                      {selectedAddressId === addr.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={20}
                          color={colors.primary}
                        />
                      )}
                    </View>
                    <Text style={{ color: colors.text }}>
                      {addr.street_address}
                    </Text>
                    <Text style={{ color: colors.textSecondary }}>
                      {addr.city}, {addr.state} - {addr.postal_code}
                    </Text>
                    <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                      Phone: {addr.phone_number}
                    </Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  onPress={() => {
                    onClose();
                    router.push("/profile/addresses");
                  }}
                  style={{ marginTop: 10, alignSelf: "flex-start" }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>
                    + Manage Addresses
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Order Summary */}
            <View
              style={{
                marginTop: 24,
                padding: 16,
                backgroundColor: colors.surface,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Payment Summary
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Subtotal</Text>
                <Text style={{ color: colors.text }}>
                  ₹{totalAmount.toLocaleString()}
                </Text>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 8,
                }}
              >
                <Text style={{ color: colors.textSecondary }}>Delivery</Text>
                <Text style={{ color: colors.success }}>FREE</Text>
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
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  Total
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "bold",
                    color: colors.primary,
                  }}
                >
                  ₹{totalAmount.toLocaleString()}
                </Text>
              </View>
            </View>

            <View style={{ height: 30 }} />
          </ScrollView>

          {/* Footer Button */}
          <View
            style={{
              padding: 20,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.surface,
              paddingBottom: Math.max(insets.bottom, 20),
            }}
          >
            <TouchableOpacity
              onPress={handlePlaceOrder}
              disabled={isProcessingPayment}
              style={{
                backgroundColor: isProcessingPayment
                  ? colors.textSecondary
                  : colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 10,
              }}
            >
              {isProcessingPayment ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text
                    style={{
                      color: colors.white,
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    Pay Now
                  </Text>
                  <Feather name="lock" size={18} color={colors.white} />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Order Success Modal */}
      <CustomModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
          router.push("/(tabs)/orders?refresh=true");
        }}
        type="success"
        title="Order Placed!"
        message="Your order has been placed successfully. You can track your order from the Orders page."
        buttons={[
          {
            text: "View Orders",
            variant: "primary",
            onPress: () => {
              setShowSuccessModal(false);
              onClose();
              router.push("/(tabs)/orders?refresh=true");
            },
          },
        ]}
      />
    </Modal>
  );
}
