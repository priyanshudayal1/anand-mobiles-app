import React, {useState} from "react";
import {View, Text, TouchableOpacity, TextInput} from "react-native";
import {Search, MapPin, ShoppingCart, X, Bell} from "lucide-react-native";
import {useRouter} from "expo-router";
import {useTheme} from "../../store/useTheme";
import {useProducts} from "../../store/useProducts";

export default function HomeHeader() {
  const {colors} = useTheme();
  const {setSearch} = useProducts();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [showWarning, setShowWarning] = useState(true);

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
    <View style={{width: "100%"}}>
      {/* Top Warning Strip */}
      {showWarning && (
        <View
          style={{
            paddingVertical: 6,
            paddingHorizontal: 16,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: colors.warning,
          }}
        >
          <Text
            style={{color: colors.white, fontSize: 12, fontWeight: "500"}}
          >
            Website is under development!!!
            <Text style={{textDecorationLine: "underline"}}> Shop Now</Text>
          </Text>
          <TouchableOpacity onPress={() => setShowWarning(false)}>
            <X size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Main Header Area */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: 16,
          backgroundColor: colors.primary,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          {/* Brand */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            {/* Placeholder for Logo */}
            <View
              style={{
                width: 32,
                height: 32,
                borderRadius: 4,
                marginRight: 8,
                justifyContent: "center",
                alignItems: "center",
                backgroundColor: colors.black,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: "bold" }}>A</Text>
            </View>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.black }}
            >
              ANAND MOBILES
            </Text>
          </View>

          {/* Right Actions */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            {/* Location */}
            <TouchableOpacity style={{ alignItems: "flex-end" }}>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <MapPin size={14} color={colors.white} />
                <Text
                  style={{ fontSize: 10, marginLeft: 4, color: colors.white }}
                >
                  Delivery to
                </Text>
              </View>
              <Text
                style={{
                  fontWeight: "bold",
                  fontSize: 12,
                  color: colors.white,
                }}
              >
                जबलपुर
              </Text>
            </TouchableOpacity>

            {/* Notifications */}
            <TouchableOpacity style={{ position: "relative" }}>
              <Bell size={22} color={colors.white} />
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.error,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: colors.white,
                  }}
                >
                  2
                </Text>
              </View>
            </TouchableOpacity>

            {/* Cart */}
            <TouchableOpacity
              style={{ position: "relative" }}
              onPress={() => router.push("/(tabs)/cart")}
            >
              <ShoppingCart size={22} color={colors.white} />
              <View
                style={{
                  position: "absolute",
                  top: -4,
                  right: -4,
                  borderRadius: 8,
                  width: 16,
                  height: 16,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: colors.white,
                }}
              >
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "bold",
                    color: colors.primary,
                  }}
                >
                  0
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View
          style={{
            borderRadius: 24,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 8,
            height: 44,
            backgroundColor: colors.white,
          }}
        >
          <Search size={20} color={colors.textSecondary} />
          <TextInput
            style={{
              flex: 1,
              marginLeft: 8,
              fontSize: 14,
              color: colors.text,
            }}
            placeholder="Search products, brands..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearchSubmit}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
