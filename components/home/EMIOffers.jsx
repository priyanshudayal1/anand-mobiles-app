import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import {
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check,
  Percent,
  CreditCard as CardIcon,
  X,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import EMIService from "../../services/emiService";

export default function EMIOffers({ price }) {
  const { colors } = useTheme();
  const [emiData, setEmiData] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [expandedBank, setExpandedBank] = useState(null);

  useEffect(() => {
    // Calculate offers using the service
    const data = EMIService.getDefaultEMIOffers(price);
    setEmiData(data);
  }, [price]);

  if (!price || price < 3000 || !emiData?.offers?.length) {
    return null;
  }

  // Find lowest EMI and No Cost EMI options
  let minEMI = Infinity;
  let bestNoCost = null;

  emiData.offers.forEach((bank) => {
    bank.emi_options.forEach((opt) => {
      if (opt.emi_amount < minEMI) minEMI = opt.emi_amount;
      if (
        opt.is_no_cost &&
        (!bestNoCost || opt.tenure_months > bestNoCost.tenure_months)
      ) {
        bestNoCost = opt;
      }
    });
  });

  if (minEMI === Infinity) return null;

  return (
    <View style={{ marginBottom: 16 }}>
      {/* EMI Teaser Card */}
      <TouchableOpacity
        onPress={() => setShowModal(true)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.cardBg,
          padding: 12,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: colors.border,
        }}
      >
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.primary + "15",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Percent size={20} color={colors.primary} />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 14, fontWeight: "700", color: colors.text }}>
            EMI starts at ₹{minEMI.toLocaleString()}/mo
          </Text>
          {bestNoCost && (
            <Text style={{ fontSize: 12, color: colors.success, marginTop: 2 }}>
              No Cost EMI available up to {bestNoCost.tenure_months} months
            </Text>
          )}
          <Text
            style={{ fontSize: 12, color: colors.textSecondary, marginTop: 2 }}
          >
            View plans from {emiData.offers.length} banks
          </Text>
        </View>

        <ChevronDown size={20} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* EMI Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
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
              backgroundColor: colors.cardBg,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              height: "80%",
              paddingTop: 20,
            }}
          >
            {/* Modal Header */}
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
                style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
              >
                EMI Options
              </Text>
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                style={{ padding: 4 }}
              >
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView
              contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
            >
              {/* Summary */}
              <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 14, color: colors.textSecondary }}>
                  Item Price
                </Text>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "bold",
                    color: colors.text,
                  }}
                >
                  ₹{price.toLocaleString()}
                </Text>
              </View>

              {/* Bank List */}
              {emiData.offers.map((bank) => {
                const isExpanded = expandedBank === bank.bank_id;

                return (
                  <View
                    key={bank.bank_id}
                    style={{
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isExpanded ? colors.primary : colors.border,
                      borderRadius: 12,
                      overflow: "hidden",
                      backgroundColor: colors.backgroundSecondary,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedBank(isExpanded ? null : bank.bank_id)
                      }
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        padding: 16,
                        backgroundColor: isExpanded
                          ? colors.primary + "10"
                          : "transparent",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: colors.text,
                          }}
                        >
                          {bank.bank_name}
                        </Text>
                        <Text
                          style={{ fontSize: 12, color: colors.textSecondary }}
                        >
                          {bank.emi_options.some((o) => o.is_no_cost)
                            ? "No Cost EMI Available"
                            : "Standard EMI Plans"}
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
                            style={{
                              flex: 1,
                              fontSize: 12,
                              fontWeight: "600",
                              color: colors.textSecondary,
                            }}
                          >
                            Months
                          </Text>
                          <Text
                            style={{
                              flex: 1.5,
                              fontSize: 12,
                              fontWeight: "600",
                              color: colors.textSecondary,
                            }}
                          >
                            EMI/mo
                          </Text>
                          <Text
                            style={{
                              flex: 1,
                              fontSize: 12,
                              fontWeight: "600",
                              color: colors.textSecondary,
                              textAlign: "right",
                            }}
                          >
                            Total Interest
                          </Text>
                        </View>

                        {bank.emi_options.map((option, idx) => (
                          <View
                            key={idx}
                            style={{
                              flexDirection: "row",
                              padding: 12,
                              borderBottomWidth:
                                idx === bank.emi_options.length - 1 ? 0 : 1,
                              borderBottomColor: colors.border,
                              alignItems: "center",
                            }}
                          >
                            <View style={{ flex: 1 }}>
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: colors.text,
                                  fontWeight: "500",
                                }}
                              >
                                {option.tenure_months}mo
                              </Text>
                              {option.is_no_cost && (
                                <Text
                                  style={{
                                    fontSize: 10,
                                    color: colors.success,
                                    fontWeight: "bold",
                                  }}
                                >
                                  No Cost
                                </Text>
                              )}
                            </View>
                            <Text
                              style={{
                                flex: 1.5,
                                fontSize: 14,
                                color: colors.text,
                                fontWeight: "600",
                              }}
                            >
                              ₹{option.emi_amount.toLocaleString()}
                            </Text>
                            <Text
                              style={{
                                flex: 1,
                                fontSize: 14,
                                color: colors.textSecondary,
                                textAlign: "right",
                              }}
                            >
                              {option.total_interest > 0
                                ? `₹${Math.round(option.total_interest).toLocaleString()}`
                                : "-"}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
