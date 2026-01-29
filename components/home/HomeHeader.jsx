import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { Image } from "expo-image";
import { Search, MapPin, ShoppingCart, X, Bell, Heart, User } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import { useCartStore } from "../../store/useCart";
import { useSiteConfig } from "../../store/useSiteConfig";
import { useLocationStore } from "../../store/useLocation";

export default function HomeHeader() {
  const { colors, mode } = useTheme();
  const { setSearch } = useProducts();
  const { getCartCount, fetchCart } = useCartStore();
  const { logoUrl, shopName, fetchSiteConfig, isInitialized } = useSiteConfig();
  const { location, detectLocation } = useLocationStore();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showWarning, setShowWarning] = useState(true);
  const cartCount = getCartCount();

  useEffect(() => {
    fetchCart();
    // Fetch site config (logo) if not already initialized
    if (!isInitialized) {
      fetchSiteConfig();
    }
    // Detect location on load
    detectLocation();
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setSearch(searchQuery.trim());
      router.push({
        pathname: "/(tabs)/menu",
        params: { search: searchQuery.trim() },
      });
    }
  };

  const handleSearchSubmit = () => {
    handleSearch();
  };

  return (
    <View style={{ width: "100%", backgroundColor: colors.headerBg }}>

      {/* Main Header Area */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
        }}
      >
        {/* Row 1: Logo & Location */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          {/* Location (Deliver to) */}
          <TouchableOpacity
            style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
            onPress={() => useLocationStore.getState().detectLocation()}
          >
            <MapPin size={16} color={colors.white} />
            <View style={{
              marginLeft: 6, flex: 1, flexDirection: "row", alignItems: "center"
            }}>
              <Text style={{ fontSize: 12, color: colors.white, opacity: 0.9 }}>
                Deliver to &nbsp;
              </Text>
              <Text style={{
                fontSize: 12,
                fontWeight: "bold",
                color: colors.white,
              }}>
                {location.city}, {location.pincode}
              </Text>
            </View>
          </TouchableOpacity>

        </View>

        {/* Row 2: Search Bar & Icons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>

          {/* Search Bar */}
          <View
            style={{
              flex: 1,
              borderRadius: 8, // More rounded as per image
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              height: 44, // Match search bar height
              backgroundColor: mode === 'dark' ? colors.surfaceSecondary : colors.white,
            }}
          >
            <Image
              source={{ uri: logoUrl || "https://upload.wikimedia.org/wikipedia/commons/4/4a/Myntra_Logo.png" }}
              style={{ width: 28, height: 28, marginRight: 8, borderRadius: 4 }}
              contentFit="contain"
            />
            {/* Ensure M logo is replaced by actual shop logo if desired, or keep generic search icon if that image was just a reference */}
            {/* Replacing image's M logo with actual logic: If user wants *exact* looks, they might want the M. But "Search 'Jeans'" suggests generic.
              Let's stick to standard search icon or shop logo if small.
            */}
            {/* Text "Search 'Jeans'" */}
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.text,
                height: '100%', // Ensure it takes full height
                textAlignVertical: 'center', // Fix vertical alignment on Android
                paddingVertical: 0, // Remove default padding
              }}
              placeholder='Search "Jeans"'
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              returnKeyType="search"
            />
            <TouchableOpacity onPress={handleSearchSubmit}>
              <Search size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Notification */}
          <TouchableOpacity onPress={() => router.push("/notifications")}>
            <Bell size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Wishlist */}
          <TouchableOpacity onPress={() => router.push("/wishlist")}>
            <Heart size={24} color={colors.white} />
          </TouchableOpacity>

          {/* Profile */}
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")}>
            <User size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
