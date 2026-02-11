import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import { useTheme } from "../../store/useTheme";
import { useAddressStore } from "../../store/useAddress";
import { useOrderStore } from "../../store/useOrder";
import { useGamification } from "../../store/useGamification"; // Gamification Store
import { useCartStore } from "../../store/useCart"; // For cart items
import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useToast } from "../../store/useToast";
import CustomModal from "../common/CustomModal";
import CustomInput from "../../components/CustomInput";
import api from "../../services/api";
import { API_ENDPOINTS } from "../../constants/constants";

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

  const {
    coinBalance,
    fetchWallet,
    isLoading: isGamificationLoading,
  } = useGamification();

  const { cartItems } = useCartStore();

  const [selectedAddressId, setSelectedAddressId] = React.useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { show: showToast, error: showError } = useToast();

  // GST State
  const [useGSTBill, setUseGSTBill] = useState(false);
  const [gstDetails, setGstDetails] = useState({
    companyName: "",
    gstin: "",
  });

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Coin State
  const [useCoins, setUseCoins] = useState(false);
  const [coinsToUse, setCoinsToUse] = useState("");
  const [appliedCoinDiscount, setAppliedCoinDiscount] = useState(null);
  const [calculatingCoins, setCalculatingCoins] = useState(false);
  const [coinEconomy, setCoinEconomy] = useState(null);

  useEffect(() => {
    if (visible) {
      fetchAddresses();
      fetchWallet();
      fetchCoinEconomy();
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

  // Fetch Coin Economy settings
  const fetchCoinEconomy = async () => {
    try {
      // If endpoint exists, fetch it. Otherwise use defaults.
      if (API_ENDPOINTS.coinEconomy) {
        const response = await api.get(API_ENDPOINTS.coinEconomy);
        if (response.data && response.data.economy) {
          setCoinEconomy(response.data.economy);
        }
      }
    } catch (error) {
      console.log("Failed to fetch coin economy", error);
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      showError("Please enter a coupon code");
      return;
    }

    setValidatingCoupon(true);
    try {
      const response = await api.post(API_ENDPOINTS.validateCoupon, {
        code: couponCode.trim(),
        order_total: totalAmount,
        user_id: "app_user", // Backend usually infers from token
        cart_items: cartItems,
      });

      if (response.data.success) {
        setAppliedCoupon({
          code: couponCode.trim(),
          ...response.data,
        });
        showToast("Coupon applied successfully!", "success");
        // Reset coins if coupon changes total significantly?
        // Better to re-calculate coins if they were applied
        if (appliedCoinDiscount) {
          handleApplyCoins(selectedCoinsAmount());
        }
      } else {
        showError("Invalid coupon code");
      }
    } catch (error) {
      const msg = error.response?.data?.error || "Failed to apply coupon";
      showError(msg);
    } finally {
      setValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    showToast("Coupon removed");
  };

  const selectedCoinsAmount = () => {
    return parseInt(coinsToUse) || 0;
  };

  const handleApplyCoins = async (amount) => {
    if (amount <= 0) return;

    // Calculate total after coupon
    const currentTotal = totalAmount - (appliedCoupon?.discount_amount || 0);

    setCalculatingCoins(true);
    try {
      const response = await api.post(API_ENDPOINTS.calculateCoinDiscount, {
        order_total: currentTotal,
        coins_to_use: amount,
      });

      if (response.data.success) {
        setAppliedCoinDiscount(response.data);
        // showToast(`Coins applied! Saved ₹${response.data.discount_amount}`, "success");
      } else {
        showError("Could not apply coins");
        setUseCoins(false);
      }
    } catch (error) {
      console.log("Coin calculation error", error);
      showError("Failed to apply coins");
      setUseCoins(false);
      setAppliedCoinDiscount(null);
    } finally {
      setCalculatingCoins(false);
    }
  };

  // Debounce coin calculation
  useEffect(() => {
    if (useCoins && coinsToUse) {
      const timer = setTimeout(() => {
        handleApplyCoins(parseInt(coinsToUse));
      }, 500);
      return () => clearTimeout(timer);
    } else if (!useCoins) {
      setAppliedCoinDiscount(null);
    }
  }, [useCoins, coinsToUse, appliedCoupon]);

  const handleToggleCoins = (value) => {
    setUseCoins(value);
    if (value) {
      // Default to max possible or some logic?
      // For now, let user input or set max
      if (coinsToUse === "") {
        // Maybe calculate max allowed?
        // Assuming max is balance
        setCoinsToUse(String(Math.min(coinBalance, 1000))); // Cap at 1000 or balance initially
      }
    } else {
      setAppliedCoinDiscount(null);
    }
  };

  const handlePlaceOrder = async () => {
    try {
      if (!selectedAddressId) {
        showError("Please select a delivery address.");
        return;
      }

      // Validate GST
      if (useGSTBill) {
        if (!gstDetails.companyName.trim()) {
          showError("Please enter Company Name for GST Bill");
          return;
        }
        if (!gstDetails.gstin.trim()) {
          showError("Please enter GSTIN for GST Bill");
          return;
        }
        if (gstDetails.gstin.length !== 15) {
          showError("GSTIN must be 15 characters long");
          return;
        }
      }

      const gstInfo = useGSTBill
        ? {
            company_name: gstDetails.companyName,
            gstin: gstDetails.gstin,
          }
        : null;

      await placeOrderFromCart(
        selectedAddressId,
        gstInfo,
        appliedCoupon?.code,
        appliedCoinDiscount,
      );
    } catch (e) {
      // Error is handled by useEffect for orderError
    }
  };

  const selectedAddress = useMemo(
    () => addresses.find((a) => a.id === selectedAddressId),
    [addresses, selectedAddressId],
  );

  // Totals
  const couponDiscount = appliedCoupon?.discount_amount || 0;
  const coinDiscount = appliedCoinDiscount?.discount_amount || 0;
  const finalTotal = totalAmount - couponDiscount - coinDiscount;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      {/* ToastContainer removed to fix duplicate toast issue */}
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
            height: "90%", // Increased height slightly
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
                  router.push("/addresses");
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
                    router.push("/addresses");
                  }}
                  style={{ marginTop: 10, alignSelf: "flex-start" }}
                >
                  <Text style={{ color: colors.primary, fontWeight: "600" }}>
                    + Manage Addresses
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Gamification & Coupons Section */}
            <View style={{ marginTop: 24 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "600",
                  color: colors.text,
                  marginBottom: 12,
                }}
              >
                Offers & Discounts
              </Text>

              {/* Coupon Code */}
              <View style={{ marginBottom: 16 }}>
                {appliedCoupon ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "rgba(76, 175, 80, 0.1)",
                      padding: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.success,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="ticket-percent"
                      size={24}
                      color={colors.success}
                      style={{ marginRight: 10 }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{ fontWeight: "bold", color: colors.success }}
                      >
                        Coupon Applied: {appliedCoupon.code}
                      </Text>
                      <Text
                        style={{ color: colors.textSecondary, fontSize: 12 }}
                      >
                        Saved ₹{appliedCoupon.discount_amount}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={handleRemoveCoupon}>
                      <Feather name="x" size={20} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <CustomInput
                        placeholder="Enter Coupon Code"
                        value={couponCode}
                        onChangeText={(text) =>
                          setCouponCode(text.toUpperCase())
                        }
                        autoCapitalize="characters"
                        containerStyle={{ marginBottom: 0 }}
                      />
                    </View>
                    <TouchableOpacity
                      onPress={handleApplyCoupon}
                      disabled={validatingCoupon || !couponCode}
                      style={{
                        backgroundColor: colors.primary,
                        justifyContent: "center",
                        alignItems: "center",
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        height: 50,
                      }}
                    >
                      {validatingCoupon ? (
                        <ActivityIndicator color="#fff" size="small" />
                      ) : (
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>
                          Apply
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* Coins */}
              {coinBalance > 0 && (
                <View
                  style={{
                    padding: 16,
                    backgroundColor: colors.surface,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <MaterialCommunityIcons
                        name="bitcoin"
                        size={24}
                        color="#FFD700"
                        style={{ marginRight: 8 }}
                      />
                      <View>
                        <Text style={{ fontWeight: "600", color: colors.text }}>
                          Use Coins
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: colors.textSecondary }}
                        >
                          Available: {coinBalance}
                        </Text>
                      </View>
                    </View>
                    <Switch
                      value={useCoins}
                      onValueChange={handleToggleCoins}
                      trackColor={{
                        false: colors.border,
                        true: colors.primary,
                      }}
                      thumbColor={colors.white}
                    />
                  </View>

                  {useCoins && (
                    <View style={{ marginTop: 12 }}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <TextInput
                          style={{
                            borderWidth: 1,
                            borderColor: colors.border,
                            borderRadius: 8,
                            padding: 10,
                            color: colors.text,
                            flex: 1,
                            backgroundColor: colors.background,
                          }}
                          value={coinsToUse.toString()}
                          onChangeText={setCoinsToUse}
                          keyboardType="numeric"
                          placeholder="Coins to use"
                          placeholderTextColor={colors.textSecondary}
                        />
                        <TouchableOpacity
                          onPress={() => setCoinsToUse(String(coinBalance))}
                          style={{
                            backgroundColor: colors.backgroundSecondary,
                            padding: 10,
                            borderRadius: 8,
                          }}
                        >
                          <Text
                            style={{
                              color: colors.primary,
                              fontWeight: "bold",
                            }}
                          >
                            MAX
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {calculatingCoins && (
                        <Text
                          style={{
                            marginTop: 4,
                            color: colors.textSecondary,
                            fontSize: 12,
                          }}
                        >
                          Calculating discount...
                        </Text>
                      )}

                      {appliedCoinDiscount && (
                        <Text
                          style={{
                            marginTop: 8,
                            color: colors.success,
                            fontWeight: "bold",
                          }}
                        >
                          Discount: -₹{appliedCoinDiscount.discount_amount}
                        </Text>
                      )}
                    </View>
                  )}
                </View>
              )}
            </View>

            {/* GST Section */}
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
              <TouchableOpacity
                style={{ flexDirection: "row", alignItems: "center" }}
                onPress={() => setUseGSTBill(!useGSTBill)}
                activeOpacity={0.8}
              >
                <Feather
                  name={useGSTBill ? "check-square" : "square"}
                  size={22}
                  color={colors.primary}
                />
                <Text
                  style={{
                    marginLeft: 12,
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                  }}
                >
                  Use GST Bill
                </Text>
              </TouchableOpacity>

              {useGSTBill && (
                <View style={{ marginTop: 16 }}>
                  <CustomInput
                    label="Company Name"
                    placeholder="Enter Company Name"
                    value={gstDetails.companyName}
                    onChangeText={(text) =>
                      setGstDetails((prev) => ({ ...prev, companyName: text }))
                    }
                    required
                  />
                  <View style={{ height: 12 }} />
                  <CustomInput
                    label="GSTIN"
                    placeholder="Enter GST Number"
                    value={gstDetails.gstin}
                    onChangeText={(text) =>
                      setGstDetails((prev) => ({
                        ...prev,
                        gstin: text.toUpperCase(),
                      }))
                    }
                    required
                    autoCapitalize="characters"
                    maxLength={15}
                  />
                </View>
              )}
            </View>

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

              {appliedCoupon && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    Coupon Discount
                  </Text>
                  <Text style={{ color: colors.success }}>
                    -₹{couponDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

              {appliedCoinDiscount && (
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    Coin Discount
                  </Text>
                  <Text style={{ color: colors.success }}>
                    -₹{coinDiscount.toLocaleString()}
                  </Text>
                </View>
              )}

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
                  ₹{finalTotal.toLocaleString()}
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
              paddingBottom: Math.max(insets.bottom, 40),
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
                    Pay ₹{finalTotal.toLocaleString()}
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
          router.push("/orders?refresh=true");
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
              router.push("/orders?refresh=true");
            },
          },
        ]}
      />
    </Modal>
  );
}
