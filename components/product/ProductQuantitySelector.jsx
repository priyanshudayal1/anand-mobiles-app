import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../../store/useTheme";
import { ChevronDown } from "lucide-react-native";

const ProductQuantitySelector = ({ quantity, setQuantity, stock }) => {
  const { colors } = useTheme();

  // Ideally this opens a picker/modal. For now, we'll just toggle through 1-5 or increment.
  // The image shows a dropdown "Quantity: 1 v"
  
  const handlePress = () => {
    // Simple rotation for now: 1 -> 2 -> 3 -> 4 -> 5 -> 1
    const nextQty = quantity >= 5 ? 1 : quantity + 1;
    if (nextQty <= stock) {
        setQuantity(nextQty);
    } else {
        setQuantity(1);
    }
  };

  return (
    <View style={{ paddingHorizontal: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
       {/* Dropdown style button */}
       <Text style={{ fontSize: 14, color: colors.textSecondary, marginRight: 8 }}>Quantity:</Text>
       <TouchableOpacity
         onPress={handlePress}
         style={{
            flexDirection: 'row',
            alignItems: 'center',
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
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text, marginRight: 4 }}>
            {quantity}
          </Text>
          <ChevronDown size={14} color={colors.text} />
       </TouchableOpacity>
    </View>
  );
};

export default ProductQuantitySelector;
