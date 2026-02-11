import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../store/useTheme";
import { AlertTriangle, CheckCircle, Info } from "lucide-react-native";
import EMIOffers from "../home/EMIOffers";
import EMIService from "../../services/emiService";

const ProductInfo = ({ product, selectedVariant, productId }) => {
  const { colors } = useTheme();

  // Get current price based on selected variant or default
  const currentPrice =
    selectedVariant?.discounted_price ||
    selectedVariant?.price ||
    product.discountPrice ||
    product.discount_price ||
    product.price ||
    0;

  const originalPrice = selectedVariant?.price || product.price || 0;
  const currentStock = Math.max(
    0,
    selectedVariant?.stock ?? product.stock ?? 0,
  );

  // Calculate EMI starting value
  const [minEMI, setMinEMI] = useState(null);

  useEffect(() => {
    const fetchMinEMI = async () => {
      if (currentPrice >= 3000) {
        try {
          const emiData = await EMIService.getEMIOffers(
            currentPrice,
            productId,
          );
          if (emiData?.offers?.length) {
            let lowestEMI = Infinity;
            emiData.offers.forEach((bank) => {
              bank.emi_options.forEach((opt) => {
                if (opt.emi_amount < lowestEMI) lowestEMI = opt.emi_amount;
              });
            });
            if (lowestEMI !== Infinity) {
              setMinEMI(lowestEMI);
            }
          }
        } catch (error) {
          console.error("Error fetching EMI data:", error);
          setMinEMI(null);
        }
      } else {
        setMinEMI(null);
      }
    };

    fetchMinEMI();
  }, [currentPrice, productId]);

  // Calculate discount
  const hasDiscount =
    currentPrice && originalPrice && currentPrice < originalPrice;
  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : 0;

  // Stock status logic
  const getStockStatus = () => {
    if (currentStock === 0) {
      return { text: "Out of Stock", color: colors.error, icon: AlertTriangle };
    } else if (currentStock <= 5) {
      return {
        text: `Only ${currentStock} left in stock`,
        color: colors.error, // Amazon uses red for low stock
        icon: null,
      };
    }
    return { text: "In stock", color: colors.success, icon: null };
  };

  const stockStatus = getStockStatus();

  return (
    <View
      style={{
        paddingHorizontal: 16,
        paddingBottom: 12,
        backgroundColor: colors.surface,
      }}
    >
      {/* Separator */}
      <View
        style={{
          height: 1,
          backgroundColor: colors.border,
          width: "100%",
          marginBottom: 12,
        }}
      />

      {/* Price Block */}
      <View>
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-start", // Top align for big price
            marginBottom: 4,
          }}
        >
          {hasDiscount && (
            <Text
              style={{
                fontSize: 26,
                color: colors.error,
                fontWeight: "300",
                marginRight: 8,
                marginTop: -2, // Optical alignment
              }}
            >
              -{discountPercentage}%
            </Text>
          )}

          <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 20, // Adjust for top-alignment
                fontWeight: "600",
                color: colors.text,
                marginTop: 4,
              }}
            >
              ₹
            </Text>
            <Text
              style={{
                fontSize: 28,
                lineHeight: 34,
                fontWeight: "600",
                color: colors.text,
              }}
            >
              {currentPrice?.toLocaleString()}
            </Text>
          </View>
        </View>

        {hasDiscount && (
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
              M.R.P.:{" "}
            </Text>
            <Text
              style={{
                textDecorationLine: "line-through",
                color: colors.textSecondary,
                fontSize: 12,
              }}
            >
              ₹{originalPrice?.toLocaleString()}
            </Text>
          </View>
        )}
      </View>

      <Text
        style={{
          fontSize: 14,
          color: colors.text,
          marginBottom: 8,
          marginTop: 8,
        }}
      >
        Inclusive of all taxes
      </Text>

      {/* EMI Section - Only shown if EMI is available */}
      {minEMI && (
        <View
          style={{
            marginBottom: 8,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <Text style={{ fontSize: 14, color: colors.text }}>
            <Text style={{ fontWeight: "bold" }}>EMI</Text> from ₹
            {Math.round(minEMI).toLocaleString()}. No Cost EMI available.{" "}
          </Text>
          <EMIOffers price={currentPrice} productId={productId}>
            <Text
              style={{
                fontSize: 14,
                color: colors.primary,
                textDecorationLine: "none",
              }}
            >
              EMI options
            </Text>
          </EMIOffers>
        </View>
      )}

      {/* Stock Status */}
      <View style={{ marginTop: 4 }}>
        <Text
          style={{
            color: stockStatus.color,
            fontSize: 16,
            fontWeight: "600",
          }}
        >
          {stockStatus.text}
        </Text>
      </View>
    </View>
  );
};

export default ProductInfo;
