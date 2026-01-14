import { useRef, useCallback } from "react";
import { Tabs } from "expo-router";
import { Platform, TouchableOpacity, Text } from "react-native";
import { House, User, Layers, ShoppingCart, Menu } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useTheme } from "../../store/useTheme";
import MoreBottomSheet from "../../components/MoreBottomSheet";

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const moreSheetRef = useRef(null);

  // Calculate bottom padding - use safe area insets for gesture phones, minimum for button phones
  const bottomPadding = Math.max(insets.bottom, 8);

  // Handle opening the more bottom sheet
  const handleOpenMore = useCallback(() => {
    moreSheetRef.current?.snapToIndex(0);
  }, []);

  // Handle closing the more bottom sheet
  const handleCloseMore = useCallback(() => {
    moreSheetRef.current?.close();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: colors.tabBarBg || "#FFFFFF",
            borderTopWidth: 1,
            borderTopColor: colors.border || "#E5E5E5",
            height: 56 + bottomPadding,
            paddingBottom: bottomPadding,
            paddingTop: 8,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
          },
          tabBarActiveTintColor: colors.primary || "#FF8C00",
          tabBarInactiveTintColor: colors.tabBarInactive || "#666666",
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "500",
            marginTop: Platform.OS === "ios" ? 0 : -4,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === "ios" ? 0 : 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Home",
            tabBarIcon: ({ color, size }) => (
              <House size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: "You",
            tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          }}
        />
        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            tabBarIcon: ({ color, size }) => (
              <Layers size={size} color={color} />
            ),
            tabBarButton: (props) => (
              <TouchableOpacity
                {...props}
                onPress={handleOpenMore}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingTop: Platform.OS === "ios" ? 0 : 4,
                }}
                activeOpacity={0.7}
              >
                <Layers size={24} color={colors.tabBarInactive || "#666666"} />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "500",
                    marginTop: Platform.OS === "ios" ? 0 : -4,
                    color: colors.tabBarInactive || "#666666",
                  }}
                >
                  More
                </Text>
              </TouchableOpacity>
            ),
          }}
        />
        <Tabs.Screen
          name="cart"
          options={{
            title: "Cart",
            tabBarIcon: ({ color, size }) => (
              <ShoppingCart size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="menu"
          options={{
            title: "Menu",
            tabBarIcon: ({ color, size }) => <Menu size={size} color={color} />,
          }}
        />
      </Tabs>

      {/* More Bottom Sheet */}
      <MoreBottomSheet ref={moreSheetRef} onClose={handleCloseMore} />
    </GestureHandlerRootView>
  );
}
