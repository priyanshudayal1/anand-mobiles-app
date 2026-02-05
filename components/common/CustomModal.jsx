import React from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { useTheme } from "../../store/useTheme";
import {
  X,
  AlertCircle,
  CheckCircle,
  Info,
  AlertTriangle,
} from "lucide-react-native";

/**
 * Reusable Modal Component with Theme Support
 *
 * @param {boolean} visible - Controls modal visibility
 * @param {function} onClose - Callback when modal is closed
 * @param {string} title - Modal title
 * @param {string} message - Modal message/description
 * @param {string} type - Modal type: 'info' | 'success' | 'warning' | 'error' | 'confirm'
 * @param {array} buttons - Array of button configs [{text, onPress, variant}]
 * @param {node} children - Custom content (overrides message if provided)
 * @param {boolean} showCloseButton - Show X button in header (default: true)
 * @param {string} size - Modal size: 'sm' | 'md' | 'lg' (default: 'md')
 */
const CustomModal = ({
  visible = false,
  onClose,
  title,
  message,
  type = "info",
  buttons = [],
  children,
  showCloseButton = true,
  size = "md",
}) => {
  const { colors } = useTheme();

  // Get icon and color based on type
  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          color: colors.success,
          bgColor: `${colors.success}15`,
        };
      case "error":
        return {
          icon: AlertCircle,
          color: colors.error,
          bgColor: `${colors.error}15`,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: colors.warning,
          bgColor: `${colors.warning}15`,
        };
      case "confirm":
        return {
          icon: Info,
          color: colors.primary,
          bgColor: `${colors.primary}15`,
        };
      default:
        return {
          icon: Info,
          color: colors.primary,
          bgColor: `${colors.primary}15`,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;

  // Get modal width based on size
  const getModalWidth = () => {
    switch (size) {
      case "sm":
        return "80%";
      case "lg":
        return "95%";
      default:
        return "90%";
    }
  };

  // Default buttons if none provided
  const defaultButtons =
    type === "confirm"
      ? [
          { text: "Cancel", variant: "outline", onPress: onClose },
          { text: "Confirm", variant: "primary", onPress: onClose },
        ]
      : [{ text: "OK", variant: "primary", onPress: onClose }];

  const modalButtons = buttons.length > 0 ? buttons : defaultButtons;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            width: getModalWidth(),
            maxHeight: "80%",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              padding: 20,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: typeConfig.bgColor,
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Icon size={20} color={typeConfig.color} />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: colors.text,
                  flex: 1,
                }}
                numberOfLines={2}
              >
                {title}
              </Text>
            </View>
            {showCloseButton && (
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: colors.backgroundSecondary,
                  justifyContent: "center",
                  alignItems: "center",
                  marginLeft: 12,
                }}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Content */}
          <ScrollView
            style={{ maxHeight: 400 }}
            contentContainerStyle={{ padding: 20 }}
            showsVerticalScrollIndicator={false}
          >
            {children ? (
              children
            ) : (
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 22,
                }}
              >
                {message}
              </Text>
            )}
          </ScrollView>

          {/* Buttons */}
          <View
            style={{
              flexDirection: modalButtons.length > 2 ? "column" : "row",
              padding: 20,
              paddingTop: 16,
              gap: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
            }}
          >
            {modalButtons.map((button, index) => {
              const variant = button.variant || "primary";
              const isOutline = variant === "outline";
              const isGhost = variant === "ghost";

              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    button.onPress?.();
                    if (button.closeOnPress !== false) {
                      onClose();
                    }
                  }}
                  style={{
                    flex: modalButtons.length <= 2 ? 1 : undefined,
                    paddingVertical: 14,
                    paddingHorizontal: 20,
                    borderRadius: 10,
                    backgroundColor:
                      isOutline || isGhost
                        ? "transparent"
                        : variant === "secondary"
                          ? colors.secondary
                          : variant === "danger"
                            ? colors.error
                            : colors.primary,
                    borderWidth: isOutline ? 1.5 : 0,
                    borderColor: isOutline ? colors.border : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  activeOpacity={0.7}
                >
                  <Text
                    style={{
                      color: isOutline || isGhost ? colors.text : colors.white,
                      fontSize: 15,
                      fontWeight: "600",
                    }}
                  >
                    {button.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default CustomModal;
