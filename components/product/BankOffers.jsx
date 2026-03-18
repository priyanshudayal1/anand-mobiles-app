import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Tag, X, ChevronRight } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import BankOfferService from "../../services/bankOfferService";

/**
 * BankOffers - Shows bank discount/cashback offers on the product page.
 * Displays a Flipkart-style 2x2 grid with a modal for full details.
 */
export default function BankOffers({ price, productId }) {
  const { colors } = useTheme();
  const [offerData, setOfferData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      if (!price || price <= 0) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await BankOfferService.getBankOffers(price, productId);
        if (response.status === "success" && response.offers?.length > 0) {
          setOfferData(response);
        } else {
          setOfferData(null);
        }
      } catch {
        setOfferData(null);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [price, productId]);

  if (loading || !offerData || offerData.offers.length === 0) return null;

  const offers = offerData.offers;
  const displayOffers = offers.slice(0, 4);

  const cardTypeLabel = (types) => {
    if (!types?.length) return "Credit Card";
    const map = { credit: "Credit Card", debit: "Debit Card", emi_card: "EMI Card" };
    return types.map((t) => map[t] || t).join(" / ");
  };

  const BankLogo = ({ offer, size = 24 }) => (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: 4,
        backgroundColor: colors.primary,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ color: "white", fontSize: 8, fontWeight: "bold" }}>
        {offer.bank_code?.slice(0, 2) || "BK"}
      </Text>
    </View>
  );

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 10,
        overflow: "hidden",
        marginTop: 10,
        backgroundColor: colors.cardBg,
      }}
    >
      {/* Section header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
          <Tag size={14} color={colors.textSecondary} />
          <Text style={{ fontSize: 13, fontWeight: "600", color: colors.textSecondary }}>
            Bank offers
          </Text>
        </View>
        {offers.length > 4 && (
          <TouchableOpacity onPress={() => setShowModal(true)}>
            <Text style={{ fontSize: 11, color: colors.primary, fontWeight: "600" }}>
              View all
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 2x2 Grid — split into explicit rows so heights align */}
      {[displayOffers.slice(0, 2), displayOffers.slice(2, 4)].map((row, rowIdx) =>
        row.length > 0 ? (
          <View
            key={rowIdx}
            style={{
              flexDirection: "row",
              borderBottomWidth: rowIdx === 0 && displayOffers.length > 2 ? 1 : 0,
              borderBottomColor: colors.border,
            }}
          >
            {row.map((offer, colIdx) => (
              <TouchableOpacity
                key={offer.offer_id}
                onPress={() => setShowModal(true)}
                style={{
                  flex: 1,
                  padding: 10,
                  borderRightWidth: colIdx === 0 ? 1 : 0,
                  borderRightColor: colors.border,
                }}
              >
                {/* Badge area — always same height in row 0 to keep cards aligned */}
                {rowIdx === 0 && (
                  <View style={{ height: 20, marginBottom: 4, justifyContent: "center" }}>
                    {offer.is_best_value && (
                      <View
                        style={{
                          backgroundColor: "#fef3c7",
                          borderRadius: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          alignSelf: "flex-start",
                        }}
                      >
                        <Text style={{ fontSize: 9, fontWeight: "700", color: "#92400e" }}>
                          Best value for you
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                {/* Logo + offer title */}
                <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <BankLogo offer={offer} size={22} />
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "700",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    {offer.offer_title}
                  </Text>
                </View>

                {/* Bank name */}
                <Text style={{ fontSize: 11, color: colors.textSecondary, marginBottom: 4 }}>
                  {offer.bank_name}
                </Text>

                {/* Card type row */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                    paddingTop: 4,
                  }}
                >
                  <Text style={{ fontSize: 10, color: colors.textSecondary }} numberOfLines={1}>
                    {cardTypeLabel(offer.card_types)}
                    {offer.offer_description ? ` · ${offer.offer_description}` : ""}
                  </Text>
                  <ChevronRight size={10} color={colors.textSecondary} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null,
      )}

      {/* ====== MODAL ====== */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.55)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              maxHeight: "80%",
            }}
          >
            {/* Modal header */}
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
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Tag size={18} color={colors.primary} />
                <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                  Bank Offers
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowModal(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
              {offers.map((offer) => (
                <View
                  key={offer.offer_id}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 10,
                    backgroundColor: colors.cardBg,
                  }}
                >
                  {offer.is_best_value && (
                    <View
                      style={{
                        backgroundColor: "#fef3c7",
                        borderRadius: 4,
                        paddingHorizontal: 6,
                        paddingVertical: 2,
                        alignSelf: "flex-start",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontSize: 9, fontWeight: "700", color: "#92400e" }}>
                        Best value for you
                      </Text>
                    </View>
                  )}

                  <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <BankLogo offer={offer} size={32} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 15, fontWeight: "700", color: colors.text }}>
                        {offer.offer_title}
                      </Text>
                      <Text style={{ fontSize: 12, color: colors.textSecondary, marginTop: 1 }}>
                        {offer.bank_name}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      borderTopWidth: 1,
                      borderTopColor: colors.border,
                      paddingTop: 8,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: colors.textSecondary }}>
                      {cardTypeLabel(offer.card_types)}
                      {offer.offer_description ? ` · ${offer.offer_description}` : ""}
                    </Text>
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Min ₹{offer.min_amount?.toLocaleString("en-IN")}
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
