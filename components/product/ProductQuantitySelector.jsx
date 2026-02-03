import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../store/useTheme";
import { ChevronDown } from "lucide-react-native";
import QuantityPickerModal from "./QuantityPickerModal";

const ProductQuantitySelector = ({ quantity, setQuantity, stock }) => {
  const { colors } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  const handlePress = () => {
    setShowPicker(true);
  };

  return (
    <>
      <View
        style={{
          paddingHorizontal: 16,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
        }}
      >
        {/* Dropdown style button */}
        <Text
          style={{ fontSize: 14, color: colors.textSecondary, marginRight: 8 }}
        >
          Quantity:
        </Text>
        <TouchableOpacity
          onPress={handlePress}
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 12,
            paddingVertical: 6,
            backgroundColor: colors.surface,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.text,
              marginRight: 4,
            }}
          >
            {quantity}
          </Text>
          <ChevronDown size={14} color={colors.text} />
        </TouchableOpacity>
      </View>

      <QuantityPickerModal
        visible={showPicker}
        onClose={() => setShowPicker(false)}
        quantity={quantity}
        setQuantity={setQuantity}
        stock={stock}
      />
    </>
  );
};

export default ProductQuantitySelector;
