import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions, ScrollView } from "react-native";
import { useTheme } from "../../store/useTheme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const ShimmerBlock = ({ width, height, borderRadius = 8, style }) => {
  const { isDarkMode } = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );
    shimmer.start();
    return () => shimmer.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const bgColor = isDarkMode() ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)";
  const highlightColor = isDarkMode()
    ? "rgba(255,255,255,0.15)"
    : "rgba(0,0,0,0.04)";

  return (
    <View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: bgColor,
          overflow: "hidden",
        },
        style,
      ]}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: highlightColor,
          opacity,
          borderRadius,
        }}
      />
    </View>
  );
};

// ─── HOME PAGE ───────────────────────────────────────────────

export function HomeShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Banner Shimmer */}
      <ShimmerBlock width={SCREEN_WIDTH} height={200} borderRadius={0} />

      {/* Category Section */}
      <View style={{ padding: 16 }}>
        <ShimmerBlock width={160} height={20} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={{ alignItems: "center", gap: 8 }}>
              <ShimmerBlock width={64} height={64} borderRadius={12} />
              <ShimmerBlock width={56} height={12} />
            </View>
          ))}
        </View>
      </View>

      {/* Products Section */}
      <View style={{ padding: 16 }}>
        <ShimmerBlock width={180} height={20} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[1, 2].map((i) => (
            <View key={i} style={{ flex: 1 }}>
              <ShimmerBlock
                width="100%"
                height={160}
                borderRadius={12}
                style={{ marginBottom: 8 }}
              />
              <ShimmerBlock
                width="80%"
                height={14}
                style={{ marginBottom: 6 }}
              />
              <ShimmerBlock width="50%" height={14} />
            </View>
          ))}
        </View>
      </View>

      {/* More Products */}
      <View style={{ padding: 16 }}>
        <ShimmerBlock width={140} height={20} style={{ marginBottom: 16 }} />
        <View style={{ flexDirection: "row", gap: 12 }}>
          {[1, 2].map((i) => (
            <View key={i} style={{ flex: 1 }}>
              <ShimmerBlock
                width="100%"
                height={160}
                borderRadius={12}
                style={{ marginBottom: 8 }}
              />
              <ShimmerBlock
                width="70%"
                height={14}
                style={{ marginBottom: 6 }}
              />
              <ShimmerBlock width="40%" height={14} />
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── PRODUCT LIST ────────────────────────────────────────────

export function ProductListShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 8 }}>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ width: "48%", padding: 4 }}>
            <ShimmerBlock
              width="100%"
              height={160}
              borderRadius={12}
              style={{ marginBottom: 8 }}
            />
            <ShimmerBlock width="80%" height={14} style={{ marginBottom: 6 }} />
            <ShimmerBlock width="50%" height={14} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── CART ─────────────────────────────────────────────────────

export function CartShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            marginHorizontal: 16,
            marginBottom: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {/* Cart Item Row */}
          <View style={{ flexDirection: "row", padding: 12, alignItems: "center" }}>
            {/* Image */}
            <ShimmerBlock width={80} height={80} borderRadius={8} />
            {/* Details */}
            <View style={{ flex: 1, marginLeft: 12, gap: 6 }}>
              <ShimmerBlock width="40%" height={10} borderRadius={4} />
              <ShimmerBlock width="85%" height={14} borderRadius={4} />
              <ShimmerBlock width="60%" height={12} borderRadius={4} />
              <ShimmerBlock width="35%" height={16} borderRadius={4} />
            </View>
            {/* Delete icon */}
            <ShimmerBlock width={24} height={24} borderRadius={12} />
          </View>

          {/* Quantity Bar */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 12,
              paddingVertical: 10,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.backgroundSecondary,
            }}
          >
            <ShimmerBlock width={80} height={12} borderRadius={4} />
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ShimmerBlock width={32} height={32} borderRadius={16} />
              <ShimmerBlock width={24} height={16} borderRadius={4} />
              <ShimmerBlock width={32} height={32} borderRadius={16} />
            </View>
          </View>
        </View>
      ))}

      {/* Bottom checkout area */}
      <View style={{ padding: 16, marginTop: 8 }}>
        <ShimmerBlock width="100%" height={48} borderRadius={12} />
      </View>
    </View>
  );
}

// ─── ORDERS ──────────────────────────────────────────────────

export function OrdersShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            marginBottom: 16,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              padding: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ gap: 6 }}>
              <ShimmerBlock width={140} height={16} borderRadius={4} />
              <ShimmerBlock width={110} height={12} borderRadius={4} />
            </View>
            <ShimmerBlock width={90} height={28} borderRadius={20} />
          </View>

          {/* Content */}
          <View style={{ padding: 16, flexDirection: "row" }}>
            <ShimmerBlock width={70} height={70} borderRadius={10} />
            <View style={{ marginLeft: 16, flex: 1, justifyContent: "center", gap: 8 }}>
              <ShimmerBlock width="60%" height={14} borderRadius={4} />
              <ShimmerBlock width="40%" height={18} borderRadius={4} />
            </View>
          </View>

          {/* Footer */}
          <View
            style={{
              padding: 12,
              backgroundColor: colors.backgroundSecondary,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <ShimmerBlock width={120} height={12} borderRadius={4} />
            <ShimmerBlock width={100} height={32} borderRadius={8} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── WISHLIST ────────────────────────────────────────────────

export function WishlistShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            marginBottom: 12,
            overflow: "hidden",
            padding: 16,
          }}
        >
          <View style={{ flexDirection: "row" }}>
            {/* Image */}
            <ShimmerBlock width={100} height={100} borderRadius={8} />
            {/* Details */}
            <View style={{ flex: 1, marginLeft: 16 }}>
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1, gap: 6 }}>
                  <ShimmerBlock width="40%" height={12} borderRadius={4} />
                  <ShimmerBlock width="90%" height={15} borderRadius={4} />
                  <ShimmerBlock width="50%" height={12} borderRadius={4} />
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 }}>
                    <ShimmerBlock width={70} height={18} borderRadius={4} />
                    <ShimmerBlock width={50} height={14} borderRadius={4} />
                  </View>
                </View>
                <ShimmerBlock width={34} height={34} borderRadius={17} />
              </View>

              {/* Stock + Add to Cart */}
              <View style={{ marginTop: 12, gap: 8 }}>
                <ShimmerBlock width={70} height={12} borderRadius={4} />
                <ShimmerBlock width="100%" height={38} borderRadius={8} />
              </View>
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── PRODUCT DETAIL ──────────────────────────────────────────

export function ProductDetailShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Title + Rating */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          backgroundColor: colors.surface,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1, gap: 6 }}>
            <ShimmerBlock width="80%" height={16} borderRadius={4} />
            <ShimmerBlock width="50%" height={14} borderRadius={4} />
          </View>
          <ShimmerBlock width={100} height={16} borderRadius={4} />
        </View>
      </View>

      {/* Image Gallery */}
      <View style={{ backgroundColor: colors.surface }}>
        <ShimmerBlock
          width={SCREEN_WIDTH}
          height={300}
          borderRadius={0}
          style={{ marginBottom: 12 }}
        />
        {/* Dot indicators */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
            paddingBottom: 12,
          }}
        >
          {[1, 2, 3, 4].map((i) => (
            <ShimmerBlock key={i} width={8} height={8} borderRadius={4} />
          ))}
        </View>
      </View>

      {/* Variant Pills */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.surface }}>
        <ShimmerBlock width={100} height={14} borderRadius={4} style={{ marginBottom: 10 }} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} width={80} height={36} borderRadius={8} />
          ))}
        </View>
      </View>

      {/* Price & EMI Section */}
      <View style={{ padding: 16, backgroundColor: colors.surface, marginTop: 8 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <ShimmerBlock width={100} height={24} borderRadius={4} />
          <ShimmerBlock width={70} height={16} borderRadius={4} />
          <ShimmerBlock width={50} height={20} borderRadius={10} />
        </View>
        <ShimmerBlock width="70%" height={14} borderRadius={4} />
      </View>

      {/* Action Buttons */}
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <ShimmerBlock width="48%" height={48} borderRadius={12} style={{ flex: 1 }} />
          <ShimmerBlock width="48%" height={48} borderRadius={12} style={{ flex: 1 }} />
        </View>
        <ShimmerBlock width="100%" height={48} borderRadius={12} />
      </View>

      {/* Separator */}
      <View style={{ height: 8, backgroundColor: colors.backgroundSecondary }} />

      {/* Accordion placeholders */}
      <View style={{ padding: 16, gap: 12 }}>
        {[1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 12,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <ShimmerBlock width={120} height={16} borderRadius={4} />
            <ShimmerBlock width={20} height={20} borderRadius={4} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── WALLET / GAMIFICATION ───────────────────────────────────

export function WalletShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          padding: 20,
          paddingBottom: 10,
        }}
      >
        <View style={{ gap: 6 }}>
          <ShimmerBlock width={160} height={24} borderRadius={4} />
          <ShimmerBlock width={220} height={13} borderRadius={4} />
        </View>
        <ShimmerBlock width={100} height={36} borderRadius={20} />
      </View>

      {/* Tabs */}
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          paddingHorizontal: 16,
          paddingVertical: 8,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <ShimmerBlock key={i} width={90} height={36} borderRadius={20} />
        ))}
      </View>

      {/* Stats Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
          padding: 16,
          paddingTop: 12,
        }}
      >
        {[1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              width: "47%",
              padding: 16,
              borderRadius: 12,
              backgroundColor: colors.surface,
              alignItems: "center",
              gap: 8,
            }}
          >
            <ShimmerBlock width={28} height={28} borderRadius={14} />
            <ShimmerBlock width={60} height={20} borderRadius={4} />
            <ShimmerBlock width={70} height={12} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Progress Card */}
      <View
        style={{
          marginHorizontal: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: colors.surface,
          gap: 10,
        }}
      >
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ShimmerBlock width={120} height={16} borderRadius={4} />
          <ShimmerBlock width={100} height={14} borderRadius={4} />
        </View>
        <ShimmerBlock width="100%" height={8} borderRadius={4} />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <ShimmerBlock width={80} height={12} borderRadius={4} />
          <ShimmerBlock width={60} height={12} borderRadius={4} />
        </View>
      </View>

      {/* Quick Actions */}
      <View
        style={{
          margin: 16,
          padding: 16,
          borderRadius: 12,
          backgroundColor: colors.surface,
          gap: 12,
        }}
      >
        <ShimmerBlock width={120} height={16} borderRadius={4} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          {[1, 2, 3].map((i) => (
            <ShimmerBlock key={i} width="31%" height={44} borderRadius={12} style={{ flex: 1 }} />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── MENU ────────────────────────────────────────────────────

export function MenuShimmer() {
  const { colors } = useTheme();
  const sidebarWidth = SCREEN_WIDTH * 0.22;

  return (
    <View style={{ flex: 1, flexDirection: "row", backgroundColor: colors.background }}>
      {/* Left Sidebar */}
      <View
        style={{
          width: sidebarWidth,
          backgroundColor: colors.backgroundSecondary,
          borderRightWidth: 1,
          borderRightColor: colors.border,
          paddingTop: 8,
        }}
      >
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={{ alignItems: "center", paddingVertical: 12, gap: 6 }}>
            <ShimmerBlock width={44} height={44} borderRadius={8} />
            <ShimmerBlock width={sidebarWidth - 16} height={10} borderRadius={4} />
          </View>
        ))}
      </View>

      {/* Right Content */}
      <View style={{ flex: 1, padding: 12 }}>
        {/* Section titles + grids */}
        {[1, 2].map((s) => (
          <View key={s} style={{ marginBottom: 16 }}>
            <ShimmerBlock
              width={100}
              height={14}
              borderRadius={4}
              style={{ marginBottom: 12, marginLeft: 4 }}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <View
                  key={i}
                  style={{
                    width: "33.3%",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 6,
                  }}
                >
                  <ShimmerBlock width={56} height={56} borderRadius={28} />
                  <ShimmerBlock width={50} height={10} borderRadius={4} />
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── NOTIFICATIONS ───────────────────────────────────────────

export function NotificationsShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View
          key={i}
          style={{
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          {/* Icon */}
          <ShimmerBlock width={44} height={44} borderRadius={22} style={{ marginRight: 16 }} />
          {/* Content */}
          <View style={{ flex: 1, gap: 6 }}>
            <ShimmerBlock width="70%" height={15} borderRadius={4} />
            <ShimmerBlock width="90%" height={13} borderRadius={4} />
            <ShimmerBlock width={60} height={11} borderRadius={4} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── ADDRESSES ───────────────────────────────────────────────

export function AddressesShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            gap: 8,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <ShimmerBlock width={100} height={16} borderRadius={4} />
            <ShimmerBlock width={60} height={24} borderRadius={12} />
          </View>
          <ShimmerBlock width="95%" height={14} borderRadius={4} />
          <ShimmerBlock width="75%" height={14} borderRadius={4} />
          <ShimmerBlock width="50%" height={14} borderRadius={4} />
          <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
            <ShimmerBlock width={60} height={30} borderRadius={6} />
            <ShimmerBlock width={60} height={30} borderRadius={6} />
          </View>
        </View>
      ))}
    </View>
  );
}

// ─── PROFILE ─────────────────────────────────────────────────

export function ProfileShimmer() {
  const { colors } = useTheme();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Avatar + Name */}
      <View style={{ alignItems: "center", paddingVertical: 24, gap: 10 }}>
        <ShimmerBlock width={80} height={80} borderRadius={40} />
        <ShimmerBlock width={140} height={18} borderRadius={4} />
        <ShimmerBlock width={180} height={14} borderRadius={4} />
      </View>

      {/* Form Fields */}
      <View style={{ padding: 16, gap: 14 }}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={{ gap: 6 }}>
            <ShimmerBlock width={80} height={12} borderRadius={4} />
            <ShimmerBlock width="100%" height={44} borderRadius={8} />
          </View>
        ))}
      </View>

      {/* Menu Items */}
      <View style={{ padding: 16, gap: 2 }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View
            key={i}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingVertical: 14,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <ShimmerBlock width={24} height={24} borderRadius={6} />
              <ShimmerBlock width={120} height={14} borderRadius={4} />
            </View>
            <ShimmerBlock width={16} height={16} borderRadius={4} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// ─── GENERIC PAGE (About, Contact, FAQ, Stores) ──────────────

export function GenericPageShimmer() {
  const { colors } = useTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 16 }}>
      {/* Hero / Title Area */}
      <ShimmerBlock width="60%" height={22} borderRadius={4} style={{ marginBottom: 8 }} />
      <ShimmerBlock width="90%" height={14} borderRadius={4} style={{ marginBottom: 4 }} />
      <ShimmerBlock width="80%" height={14} borderRadius={4} style={{ marginBottom: 20 }} />

      {/* Content Cards */}
      {[1, 2, 3].map((i) => (
        <View
          key={i}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            gap: 8,
          }}
        >
          <ShimmerBlock width="50%" height={16} borderRadius={4} />
          <ShimmerBlock width="100%" height={13} borderRadius={4} />
          <ShimmerBlock width="95%" height={13} borderRadius={4} />
          <ShimmerBlock width="70%" height={13} borderRadius={4} />
        </View>
      ))}

      {/* Extra Block */}
      <ShimmerBlock
        width="100%"
        height={120}
        borderRadius={12}
        style={{ marginTop: 4 }}
      />
    </View>
  );
}

export default ShimmerBlock;
