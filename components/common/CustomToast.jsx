import React, { useEffect, useRef } from "react";
import { View, Text, Animated, TouchableOpacity, Dimensions } from "react-native";
import { useTheme } from "../../store/useTheme";
import { CheckCircle, AlertCircle, Info, AlertTriangle, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

/**
 * Toast Component
 * Usage: Import and use the showToast function
 * 
 * @param {string} type - 'success' | 'error' | 'info' | 'warning'
 * @param {string} message - Toast message
 * @param {number} duration - Display duration in ms (default: 3000)
 * @param {string} position - 'top' | 'bottom' (default: 'top')
 */
const Toast = ({ visible, type = "info", message, onHide, position = "top" }) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(position === "top" ? -100 : 100)).current;

  useEffect(() => {
    if (visible) {
      // Animate in
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Animate out
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: position === "top" ? -100 : 100,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, position]);

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          color: colors.success,
          bgColor: colors.success,
        };
      case "error":
        return {
          icon: AlertCircle,
          color: colors.error,
          bgColor: colors.error,
        };
      case "warning":
        return {
          icon: AlertTriangle,
          color: colors.warning,
          bgColor: colors.warning,
        };
      default:
        return {
          icon: Info,
          color: colors.primary,
          bgColor: colors.primary,
        };
    }
  };

  const typeConfig = getTypeConfig();
  const Icon = typeConfig.icon;

  if (!visible) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: position === "top" ? insets.top + 10 : undefined,
        bottom: position === "bottom" ? insets.bottom + 10 : undefined,
        left: 16,
        right: 16,
        zIndex: 9999,
        opacity: fadeAnim,
        transform: [{ translateY }],
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          paddingRight: 12,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 8,
          elevation: 8,
          borderLeftWidth: 4,
          borderLeftColor: typeConfig.bgColor,
          maxWidth: width - 32,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: `${typeConfig.bgColor}15`,
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          <Icon size={18} color={typeConfig.color} />
        </View>
        <Text
          style={{
            flex: 1,
            fontSize: 14,
            color: colors.text,
            lineHeight: 20,
            fontWeight: "500",
          }}
          numberOfLines={3}
        >
          {message}
        </Text>
        <TouchableOpacity
          onPress={onHide}
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: colors.backgroundSecondary,
            justifyContent: "center",
            alignItems: "center",
            marginLeft: 8,
          }}
        >
          <X size={14} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default Toast;
