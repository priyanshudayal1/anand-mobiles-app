import React from "react";
import { View, Text } from "react-native";
import { useTheme } from "../../store/useTheme";
import { ShieldCheck, Truck, Award } from "lucide-react-native";

export default function TrustBadges() {
  const { colors } = useTheme();

  const badges = [
    { icon: Award, label: "Authentic Product" },
    { icon: Truck, label: "Fast Delivery" },
    { icon: ShieldCheck, label: "Secure Payment" },
  ];

  return (
    <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
      {badges.map((badge, index) => {
        const Icon = badge.icon;
        return (
          <View
            key={index}
            style={{
              flex: 1,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              padding: 10,
              backgroundColor: colors.backgroundSecondary,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: colors.border,
            }}
          >
            <Icon size={16} color={colors.primary} style={{ marginRight: 6 }} />
            <Text
              style={{
                fontSize: 10,
                color: colors.textSecondary,
                fontWeight: "600",
                flexShrink: 1,
              }}
              numberOfLines={2}
            >
              {badge.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
