import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Search, MapPin, ShoppingCart, X, Bell, Heart, User, ChevronDown, Check, Plus, Briefcase, Home } from "lucide-react-native";
import { useRouter } from "expo-router";
import { BottomSheetModal, BottomSheetBackdrop, BottomSheetFlatList } from "@gorhom/bottom-sheet";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";
import { useCartStore } from "../../store/useCart";
import { useSiteConfig } from "../../store/useSiteConfig";
import { useLocationStore } from "../../store/useLocation";
import { useAddressStore } from "../../store/useAddress";

export default function HomeHeader() {
  const { colors, mode } = useTheme();
  const { setSearch } = useProducts();
  const { getCartCount, fetchCart } = useCartStore();
  const { logoUrl, shopName, fetchSiteConfig, isInitialized } = useSiteConfig();
  const { location, detectLocation } = useLocationStore();
  const { addresses, fetchAddresses, setDefaultAddress } = useAddressStore();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Bottom Sheet Refs
  const bottomSheetModalRef = useRef(null);
  const snapPoints = useMemo(() => ["50%"], []);

  useEffect(() => {
    fetchCart();
    fetchAddresses();
    if (!isInitialized) {
      fetchSiteConfig();
    }
    detectLocation();
  }, []);

  // Update selected address when addresses change or on initial load
  useEffect(() => {
    if (addresses.length > 0) {
      if (!selectedAddress) {
        // Default to the one marked is_default, or the first one
        const defaultAddr = addresses.find(a => a.is_default);
        setSelectedAddress(defaultAddr || addresses[0]);
      } else {
        // If we have a selected address, ensure it still exists in the list (e.g. after deletion)
        const exists = addresses.find(a => a.id === selectedAddress.id);
        if (!exists) {
          const defaultAddr = addresses.find(a => a.is_default);
          setSelectedAddress(defaultAddr || addresses[0]);
        } else {
          // Optional: update the object to get latest fields
          setSelectedAddress(exists);
        }
      }
    }
  }, [addresses]);

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

  const handleAddressSelect = useCallback(async (address) => {
    setSelectedAddress(address);
    bottomSheetModalRef.current?.dismiss();
    await setDefaultAddress(address.id);
  }, [setDefaultAddress]);

  const handlePresentModalPress = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleAddAddress = () => {
    bottomSheetModalRef.current?.dismiss();
    router.push("/addresses");
  };

  // Render Backdrop for Bottom Sheet
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    []
  );

  // Address Item Renderer
  const renderAddressItem = useCallback(({ item }) => {
    const isSelected = selectedAddress?.id === item.id;
    return (
      <TouchableOpacity
        onPress={() => handleAddressSelect(item)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          backgroundColor: isSelected ? colors.primary + "10" : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: colors.primary + "15",
            justifyContent: "center",
            alignItems: "center",
            marginRight: 12,
          }}
        >
          {item.type?.toLowerCase() === "office" ? (
            <Briefcase size={18} color={colors.primary} />
          ) : (
            <Home size={18} color={colors.primary} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", color: colors.text, fontSize: 14 }}>
            {item.type || "Address"}
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 12 }} numberOfLines={1}>
            {item.street_address}, {item.city}
          </Text>
        </View>
        {isSelected && <Check size={20} color={colors.primary} />}
      </TouchableOpacity>
    );
  }, [colors, selectedAddress, handleAddressSelect]);

  // Determine what to display in the header
  // User requested "show the default address", prioritizing street address for better context
  const displayLabel = selectedAddress 
      ? `${selectedAddress.street_address?.substring(0, 25)}${selectedAddress.street_address?.length > 25 ? '...' : ''}${selectedAddress.city ? ', ' + selectedAddress.city : ''}`
      : location.city 
        ? `${location.city}, ${location.pincode}` 
        : "Select Location";

  return (
    <View style={{ width: "100%", backgroundColor: colors.headerBg, zIndex: 10 }}>

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
            onPress={handlePresentModalPress}
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
                {displayLabel}
              </Text>
              <ChevronDown size={14} color={colors.white} style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        </View>

        {/* Row 2: Search Bar & Icons */}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>

          {/* Search Bar */}
          <View
            style={{
              flex: 1,
              borderRadius: 8,
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: 12,
              height: 44,
              backgroundColor: mode === 'dark' ? colors.surfaceSecondary : colors.white,
            }}
          >
            <Image
              source={{ uri: logoUrl || "https://upload.wikimedia.org/wikipedia/commons/4/4a/Myntra_Logo.png" }}
              style={{ width: 28, height: 28, marginRight: 8, borderRadius: 4 }}
              contentFit="contain"
            />
            <TextInput
              style={{
                flex: 1,
                fontSize: 14,
                color: colors.text,
                height: '100%',
                textAlignVertical: 'center',
                paddingVertical: 0,
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

      {/* Address Selection Bottom Sheet */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: colors.surface }}
        handleIndicatorStyle={{ backgroundColor: colors.textSecondary }}
      >
        <View style={{ flex: 1 }}>
          <View style={{
            padding: 16,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
              Select Delivery Location
            </Text>
            <TouchableOpacity onPress={() => bottomSheetModalRef.current?.dismiss()}>
              <X size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <BottomSheetFlatList
            data={addresses}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderAddressItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", padding: 20 }}>
                <Text style={{ color: colors.textSecondary }}>No addresses found.</Text>
              </View>
            }
          />

          <View style={{ padding: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
            <TouchableOpacity
              onPress={handleAddAddress}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: colors.primary,
                padding: 12,
                borderRadius: 8,
              }}
            >
              <Plus size={20} color={colors.white} style={{ marginRight: 8 }} />
              <Text style={{ color: colors.white, fontWeight: "600" }}>Add New Address</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheetModal>
    </View>
  );
}
