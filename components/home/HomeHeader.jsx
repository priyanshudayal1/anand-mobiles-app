import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, FlatList, Keyboard } from "react-native";
import { Image } from "expo-image";
import { Search, MapPin, ShoppingCart, X, Bell, Heart, User, ChevronDown, Check, Plus, Briefcase, Home, TrendingUp } from "lucide-react-native";
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
  // We don't need useProducts.setSearch here anymore as we pass param directly
  const { getCartCount, fetchCart } = useCartStore();
  const { logoUrl, shopName, fetchSiteConfig, isInitialized } = useSiteConfig();
  const { location, detectLocation } = useLocationStore();
  const { addresses, fetchAddresses, setDefaultAddress } = useAddressStore();

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAddress, setSelectedAddress] = useState(null);

  // Search Suggestions State
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceTimer = useRef(null);

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
        // If we have a selected address, ensure it still exists in the list
        const exists = addresses.find(a => a.id === selectedAddress.id);
        if (!exists) {
          const defaultAddr = addresses.find(a => a.is_default);
          setSelectedAddress(defaultAddr || addresses[0]);
        } else {
          setSelectedAddress(exists);
        }
      }
    }
  }, [addresses]);

  // Debounced Search Suggestions
  const fetchSuggestions = async (text) => {
    if (!text || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://suggestqueries.google.com/complete/search?client=firefox&ds=sh&q=${encodeURIComponent(text)}`
      );
      const data = await response.json();
      // Google API returns [query, [suggestions...]]
      if (Array.isArray(data) && data[1]) {
        setSuggestions(data[1]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (text.length > 0) {
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300); // 300ms debounce
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      Keyboard.dismiss();
      // Use replace to ensure navigation even when already on products page
      router.replace({
        pathname: "/products",
        params: { search: searchQuery.trim() },
      });
    }
  };

  const handleSuggestionPress = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    Keyboard.dismiss();
    // Use replace to ensure navigation even when already on products page
    router.replace({
      pathname: "/products",
      params: { search: suggestion },
    });
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    Keyboard.dismiss();
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

  const displayLabel = selectedAddress
    ? `${selectedAddress.street_address?.substring(0, 25)}${selectedAddress.street_address?.length > 25 ? '...' : ''}${selectedAddress.city ? ', ' + selectedAddress.city : ''}`
    : location.city
      ? `${location.city}, ${location.pincode}`
      : "Select Location";

  return (
    <View style={{ width: "100%", backgroundColor: colors.headerBg, zIndex: 100 }}>

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
            zIndex: 1
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, zIndex: 2 }}>

          {/* Search Bar Container */}
          <View style={{ flex: 1, zIndex: 10 }}>
            <View
              style={{
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 12,
                height: 44,
                backgroundColor: mode === 'dark' ? colors.surfaceSecondary : colors.white,
                // Add border if showing suggestions
                borderBottomLeftRadius: showSuggestions && suggestions.length > 0 ? 0 : 8,
                borderBottomRightRadius: showSuggestions && suggestions.length > 0 ? 0 : 8,
              }}
            >
              <Search size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={{
                  flex: 1,
                  fontSize: 14,
                  color: colors.text,
                  height: '100%',
                  textAlignVertical: 'center',
                  paddingVertical: 0,
                }}
                placeholder='Search "Mobile"'
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={handleSearchChange}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                onFocus={() => {
                  if (searchQuery.length > 0) setShowSuggestions(true);
                }}
                onBlur={() => {
                  // Small delay to allow clicking on suggestions
                  setTimeout(() => setShowSuggestions(false), 200);
                }}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={clearSearch}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 44,
                  left: 0,
                  right: 0,
                  backgroundColor: mode === 'dark' ? colors.surfaceSecondary : colors.white,
                  borderBottomLeftRadius: 8,
                  borderBottomRightRadius: 8,
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.2,
                  shadowRadius: 3.84,
                  zIndex: 1000,
                  maxHeight: 300,
                  borderTopWidth: 1,
                  borderTopColor: colors.border,
                }}
              >
                <View style={{ maxHeight: 300 }}>
                  {suggestions.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => handleSuggestionPress(item)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        borderBottomWidth: 1,
                        borderBottomColor: colors.border + "40",
                      }}
                    >
                      <TrendingUp size={16} color={colors.textSecondary} style={{ marginRight: 12 }} />
                      <Text style={{ color: colors.text, fontSize: 14 }}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
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
