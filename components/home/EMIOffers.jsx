import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Percent } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import EMIService from "../../services/emiService";
import { useRouter } from "expo-router";

export default function EMIOffers({ price, productId, children }) {
  const { colors } = useTheme();
  const router = useRouter();
  const [emiData, setEmiData] = useState(null);

  useEffect(() => {
    const fetchEMIData = async () => {
      try {
        // Calculate offers using the service
        const data = await EMIService.getEMIOffers(price, productId);
        setEmiData(data);
      } catch (error) {
        console.error("Error fetching EMI data:", error);
      }
    };

    fetchEMIData();
  }, [price, productId]);

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

  const handlePress = () => {
    router.push(
      `/emi-options?price=${price}${productId ? `&product_id=${productId}` : ""}`,
    );
  };

  return (
    <View style={children ? {} : { marginBottom: 16 }}>
      {/* Trigger: Either children or Default Card */}
      <TouchableOpacity
        onPress={handlePress}
        style={
          children
            ? {}
            : {
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: colors.cardBg,
                padding: 12,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: colors.border,
              }
        }
      >
        {children ? (
          children
        ) : (
          <>
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
              <Text
                style={{ fontSize: 14, fontWeight: "700", color: colors.text }}
              >
                EMI starts at ₹{minEMI.toLocaleString()}/mo
              </Text>
              {bestNoCost && (
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.success,
                    marginTop: 2,
                  }}
                >
                  No Cost EMI available up to {bestNoCost.tenure_months} months
                </Text>
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                View plans from {emiData.offers.length} banks
              </Text>
            </View>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
