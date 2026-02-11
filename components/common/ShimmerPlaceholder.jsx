import React, { useEffect, useRef } from "react";
import { View, Animated, Dimensions } from "react-native";
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
              <ShimmerBlock width={64} height={64} borderRadius={32} />
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

export default ShimmerBlock;
