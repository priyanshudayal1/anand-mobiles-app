import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { X, Check } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";

const QuantityPickerModal = ({
  visible,
  onClose,
  quantity,
  setQuantity,
  stock,
}) => {
  const { colors } = useTheme();

  // Generate quantity options (1 to stock, max 10 for display)
  const maxDisplay = Math.min(stock, 10);
  const quantities = Array.from({ length: maxDisplay }, (_, i) => i + 1);

  const handleSelect = (qty) => {
    setQuantity(qty);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
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
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: "60%",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
            >
              Select Quantity
            </Text>
            <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quantity Options */}
          <ScrollView
            contentContainerStyle={{ padding: 16 }}
            showsVerticalScrollIndicator={false}
          >
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {quantities.map((qty) => {
                const isSelected = qty === quantity;
                return (
                  <TouchableOpacity
                    key={qty}
                    onPress={() => handleSelect(qty)}
                    style={{
                      width: "30%",
                      aspectRatio: 1.5,
                      borderRadius: 12,
                      borderWidth: 2,
                      borderColor: isSelected ? colors.primary : colors.border,
                      backgroundColor: isSelected
                        ? colors.primary + "15"
                        : colors.backgroundSecondary,
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                      marginRight: "3%",
                      marginBottom: 12,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "bold",
                        color: isSelected ? colors.primary : colors.text,
                      }}
                    >
                      {qty}
                    </Text>
                    {isSelected && (
                      <View
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          width: 20,
                          height: 20,
                          borderRadius: 10,
                          backgroundColor: colors.primary,
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Check size={14} color={colors.white} />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Stock Info */}
            <View
              style={{
                marginTop: 16,
                padding: 12,
                backgroundColor: colors.backgroundSecondary,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                }}
              >
                {stock > maxDisplay
                  ? `Only ${maxDisplay} items per order • ${stock} available`
                  : `${stock} items available`}
              </Text>
            </View>
          </ScrollView>

          {/* Footer Actions */}
          <View
            style={{
              padding: 16,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            <TouchableOpacity
              onPress={onClose}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 14,
                borderRadius: 25,
                alignItems: "center",
              }}
            >
              <Text
                style={{ color: colors.white, fontSize: 16, fontWeight: "600" }}
              >
                Done
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default QuantityPickerModal;
