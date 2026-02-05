import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ChevronDown,
  ChevronUp,
  Search,
  ArrowLeft,
  ShoppingCart,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import { useCartStore } from "../store/useCart";
import EMIService from "../services/emiService";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function EMIOptionsScreen() {
  const { colors } = useTheme();
  const router = useRouter();
  const { price } = useLocalSearchParams();
  const itemPrice = parseFloat(price) || 0;
  const { cartItems } = useCartStore();

  const [emiData, setEmiData] = useState(null);
  const [expandedBank, setExpandedBank] = useState(null);
  const [selectedTab, setSelectedTab] = useState(null); // Will be set after data loads
  const [showNoCostOnly, setShowNoCostOnly] = useState(false);
  const [loading, setLoading] = useState(true);

  const cartItemCount = cartItems?.length || 0;

  // Generate processing fees (₹99-₹299)
  const getProcessingFee = useCallback((bankId) => {
    const fees = {
      hdfc: 199,
      icici: 299,
      sbi: 199,
      axis: 299,
      kotak: 199,
      bajaj: 199,
    };
    return fees[bankId] || 199;
  }, []);

  // Filter banks based on tab selection and no-cost toggle
  const filteredBanks = useMemo(() => {
    if (!emiData?.offers) return [];

    return emiData.offers.filter((bank) => {
      // First filter by card type based on selected tab
      if (selectedTab && bank.card_types) {
        const cardTypeMatch = bank.card_types.includes(selectedTab);
        if (!cardTypeMatch) return false;
      }

      // Then filter by no-cost EMI if toggle is on
      if (showNoCostOnly) {
        return bank.emi_options.some((opt) => opt.is_no_cost);
      }
      return true;
    });
  }, [emiData?.offers, selectedTab, showNoCostOnly]);

  // Separate No Cost and Standard plans
  const separatePlans = useCallback((emiOptions) => {
    const noCost = emiOptions.filter((opt) => opt.is_no_cost);
    const standard = emiOptions.filter((opt) => !opt.is_no_cost);
    return { noCost, standard };
  }, []);

  // Use tabs from backend metadata
  const availableTabs = useMemo(() => {
    return emiData?.available_tabs || [];
  }, [emiData?.available_tabs]);

  // Get card type display label for bank header
  const getCardTypeLabel = useCallback(
    (cardTypes) => {
      if (!cardTypes || cardTypes.length === 0) return "";
      if (selectedTab === "credit") return "Credit Card";
      if (selectedTab === "debit") return "Debit Card";
      if (selectedTab === "emi_card") return "EMI Card";
      // Fallback: use first card type
      if (cardTypes.includes("credit")) return "Credit Card";
      if (cardTypes.includes("debit")) return "Debit Card";
      if (cardTypes.includes("emi_card")) return "EMI Card";
      return "";
    },
    [selectedTab],
  );

  // Toggle expand handler
  const handleToggleBank = useCallback((bankId) => {
    setExpandedBank((prev) => (prev === bankId ? null : bankId));
  }, []);

  useEffect(() => {
    const fetchEMIData = async () => {
      if (itemPrice >= 3000) {
        setLoading(true);
        try {
          const data = await EMIService.getEMIOffers(itemPrice);
          setEmiData(data);

          // Auto-select first available tab from backend metadata
          if (data?.available_tabs?.length > 0) {
            setSelectedTab(data.available_tabs[0].id);
          }
        } catch (error) {
          console.error("Error fetching EMI data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchEMIData();
  }, [itemPrice]);

  // Show loading state
  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <StatusBar style="dark" backgroundColor={colors.background} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.text, fontSize: 16 }}>
            Loading EMI options...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show not available message
  if (!itemPrice || itemPrice < 3000 || !emiData?.offers?.length) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <StatusBar style="dark" backgroundColor={colors.background} />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ color: colors.text }}>
            {emiData?.message ||
              (itemPrice < 3000
                ? "EMI available on orders above ₹3,000"
                : "EMI not available for this price")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style="dark" backgroundColor={colors.background} />
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        {/* Header with Search Bar */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 10,
            backgroundColor: colors.primary + "15",
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{ padding: 6 }}
          >
            <ArrowLeft size={24} color={colors.text} />
          </TouchableOpacity>

          {/* Search Bar */}
          <TouchableOpacity
            onPress={() => router.push("/products")}
            style={{
              flex: 1,
              flexDirection: "row",
              backgroundColor: colors.white,
              marginHorizontal: 12,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 8,
              alignItems: "center",
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Search size={18} color={colors.textSecondary} />
            <Text
              style={{
                color: colors.textSecondary,
                marginLeft: 8,
                fontSize: 14,
              }}
            >
              Search products...
            </Text>
          </TouchableOpacity>

          {/* Cart Icon with Badge */}
          <TouchableOpacity
            onPress={() => router.push("/cart")}
            style={{ padding: 6, marginRight: 4, position: "relative" }}
          >
            <ShoppingCart size={24} color={colors.text} />
            {cartItemCount > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: colors.error,
                  width: 18,
                  height: 18,
                  borderRadius: 9,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 10,
                    fontWeight: "bold",
                  }}
                >
                  {cartItemCount > 9 ? "9+" : cartItemCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        {availableTabs && availableTabs.length > 0 && (
          <View
            style={{
              flexDirection: "row",
              gap: 8,
              paddingHorizontal: 16,
              paddingVertical: 12,
              backgroundColor: colors.surface,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {availableTabs.map((tab) => (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setSelectedTab(tab.id)}
                style={{
                  flex: 1,
                  backgroundColor:
                    selectedTab === tab.id ? colors.primary : "transparent",
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor:
                    selectedTab === tab.id ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: selectedTab === tab.id ? "600" : "400",
                    color: selectedTab === tab.id ? colors.white : colors.text,
                    textAlign: "center",
                    lineHeight: 16,
                  }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Toggle for No Cost EMI */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: colors.white,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
          }}
        >
          <Text style={{ fontSize: 14, color: colors.text }}>
            View only &apos;No Cost EMI&apos; options
          </Text>
          <TouchableOpacity
            onPress={() => setShowNoCostOnly(!showNoCostOnly)}
            style={{
              width: 50,
              height: 28,
              borderRadius: 14,
              backgroundColor: showNoCostOnly ? colors.success : colors.border,
              justifyContent: "center",
              paddingHorizontal: 2,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: colors.white,
                alignSelf: showNoCostOnly ? "flex-end" : "flex-start",
              }}
            />
          </TouchableOpacity>
        </View>

        {/* Bank List */}
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          removeClippedSubviews={true}
          maxToRenderPerBatch={5}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        >
          {/* Item Price Summary */}
          <View
            style={{
              marginBottom: 16,
              padding: 12,
              backgroundColor: colors.white,
              borderRadius: 8,
            }}
          >
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              Item Price
            </Text>
            <Text
              style={{ fontSize: 24, fontWeight: "bold", color: colors.text }}
            >
              ₹{itemPrice.toLocaleString()}
            </Text>
          </View>

          {filteredBanks.length === 0 ? (
            <View
              style={{
                padding: 32,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {showNoCostOnly
                  ? "No banks offer No Cost EMI for this amount"
                  : "No EMI options available"}
              </Text>
            </View>
          ) : (
            filteredBanks.map((bank) => {
              const isExpanded = expandedBank === bank.bank_id;
              const { noCost, standard } = separatePlans(bank.emi_options);
              const processingFee =
                bank.processing_fee || getProcessingFee(bank.bank_id);

              return (
                <View
                  key={bank.bank_id}
                  style={{
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: isExpanded ? colors.primary : colors.border,
                    borderRadius: 8,
                    overflow: "hidden",
                    backgroundColor: colors.white,
                  }}
                >
                  <TouchableOpacity
                    onPress={() => handleToggleBank(bank.bank_id)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: 16,
                      backgroundColor: isExpanded
                        ? colors.backgroundSecondary
                        : "transparent",
                    }}
                  >
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        backgroundColor: colors.backgroundSecondary,
                        borderRadius: 4,
                        marginRight: 12,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          color: colors.text,
                        }}
                      >
                        {bank.bank_name.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 14,
                          fontWeight: "600",
                          color: colors.text,
                          marginBottom: 4,
                        }}
                      >
                        {bank.bank_name} {getCardTypeLabel(bank.card_types)}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.error }}>
                        Processing Fee of ₹{processingFee} by Bank
                      </Text>
                    </View>

                    {isExpanded ? (
                      <ChevronUp size={20} color={colors.text} />
                    ) : (
                      <ChevronDown size={20} color={colors.text} />
                    )}
                  </TouchableOpacity>

                  {/* EMI Plans Table */}
                  {isExpanded && (
                    <View style={{ backgroundColor: colors.white }}>
                      {/* No Cost EMI Plans */}
                      {noCost.length > 0 && (
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              padding: 12,
                              backgroundColor: colors.backgroundSecondary,
                              color: colors.text,
                            }}
                          >
                            No Cost EMI Plans
                          </Text>

                          {/* Table Header */}
                          <View
                            style={{
                              flexDirection: "row",
                              padding: 10,
                              backgroundColor: colors.backgroundSecondary,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                            }}
                          >
                            <Text
                              style={[
                                styles.headerText,
                                { flex: 1.2, color: colors.textSecondary },
                              ]}
                            >
                              EMI Plan
                            </Text>
                            <Text
                              style={[
                                styles.headerText,
                                { flex: 1, color: colors.textSecondary },
                              ]}
                            >
                              Interest(pa)
                            </Text>
                            <Text
                              style={[
                                styles.headerText,
                                { flex: 0.8, color: colors.textSecondary },
                              ]}
                            >
                              Discount
                            </Text>
                            <Text
                              style={[
                                styles.headerText,
                                {
                                  flex: 1,
                                  textAlign: "right",
                                  color: colors.textSecondary,
                                },
                              ]}
                            >
                              Total cost
                            </Text>
                          </View>

                          {/* Table Rows */}
                          {noCost.map((option, idx) => {
                            const totalCost =
                              option.emi_amount * option.tenure_months;
                            // For No Cost EMI: discount = interest that bank absorbs
                            const discount = option.total_interest || 0;

                            return (
                              <View
                                key={idx}
                                style={{
                                  flexDirection: "row",
                                  padding: 10,
                                  borderBottomWidth:
                                    idx === noCost.length - 1 ? 0 : 1,
                                  borderBottomColor: colors.border,
                                }}
                              >
                                <Text
                                  style={[
                                    styles.cellText,
                                    { flex: 1.2, color: colors.text },
                                  ]}
                                >
                                  ₹{option.emi_amount.toLocaleString()} x{" "}
                                  {option.tenure_months}m
                                </Text>
                                <Text
                                  style={[
                                    styles.cellText,
                                    { flex: 1, color: colors.text },
                                  ]}
                                >
                                  ₹
                                  {Math.round(
                                    option.total_interest || 0,
                                  ).toLocaleString()}{" "}
                                  ({option.interest_rate || 0}%)
                                </Text>
                                <Text
                                  style={[
                                    styles.cellText,
                                    { flex: 0.8, color: colors.error },
                                  ]}
                                >
                                  ₹{Math.round(discount).toLocaleString()}
                                </Text>
                                <Text
                                  style={[
                                    styles.cellText,
                                    {
                                      flex: 1,
                                      textAlign: "right",
                                      color: colors.text,
                                    },
                                  ]}
                                >
                                  ₹{totalCost.toLocaleString()}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}

                      {/* Standard Plans */}
                      {!showNoCostOnly && standard.length > 0 && (
                        <View>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "bold",
                              padding: 12,
                              backgroundColor: colors.backgroundSecondary,
                              borderTopWidth: noCost.length > 0 ? 1 : 0,
                              borderTopColor: colors.border,
                              color: colors.text,
                            }}
                          >
                            Standard Plans
                          </Text>

                          {/* Table Header */}
                          <View
                            style={{
                              flexDirection: "row",
                              padding: 10,
                              backgroundColor: colors.backgroundSecondary,
                              borderBottomWidth: 1,
                              borderBottomColor: colors.border,
                            }}
                          >
                            <Text
                              style={[
                                styles.headerText,
                                { flex: 1.2, color: colors.textSecondary },
                              ]}
                            >
                              EMI Plan
                            </Text>
                            <Text
                              style={[
                                styles.headerText,
                                { flex: 1, color: colors.textSecondary },
                              ]}
                            >
                              Interest(pa)
                            </Text>
                            <Text
                              style={[
                                styles.headerText,
                                {
                                  flex: 1,
                                  textAlign: "right",
                                  color: colors.textSecondary,
                                },
                              ]}
                            >
                              Total cost
                            </Text>
                          </View>

                          {/* Table Rows */}
                          {standard.map((option, idx) => {
                            const totalCost =
                              option.emi_amount * option.tenure_months;

                            return (
                              <View
                                key={idx}
                                style={{
                                  flexDirection: "row",
                                  padding: 10,
                                  borderBottomWidth:
                                    idx === standard.length - 1 ? 0 : 1,
                                  borderBottomColor: colors.border,
                                }}
                              >
                                <Text
                                  style={[
                                    styles.cellText,
                                    { flex: 1.2, color: colors.text },
                                  ]}
                                >
                                  ₹{option.emi_amount.toLocaleString()} x{" "}
                                  {option.tenure_months}m
                                </Text>
                                <Text
                                  style={[
                                    styles.cellText,
                                    { flex: 1, color: colors.text },
                                  ]}
                                >
                                  ₹
                                  {Math.round(
                                    option.total_interest || 0,
                                  ).toLocaleString()}{" "}
                                  ({option.interest_rate}%)
                                </Text>
                                <Text
                                  style={[
                                    styles.cellText,
                                    {
                                      flex: 1,
                                      textAlign: "right",
                                      color: colors.text,
                                    },
                                  ]}
                                >
                                  ₹{totalCost.toLocaleString()}
                                </Text>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  cellText: {
    fontSize: 12,
  },
});
