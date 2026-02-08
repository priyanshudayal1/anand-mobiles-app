import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Clock,
  Mail,
  Navigation,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import { usePageContent } from "../store/usePageContent";

export default function StoresScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const isDark = isDarkMode();
  const { stores, storesLoading, fetchStores } = usePageContent();

  const [refreshing, setRefreshing] = useState(false);
  const [selectedCity, setSelectedCity] = useState("all");
  const [cities, setCities] = useState(["all"]);

  useEffect(() => {
    loadStores();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadStores = async () => {
    const storesList = await fetchStores();
    if (storesList && storesList.length > 0) {
      const uniqueCities = [
        "all",
        ...new Set(storesList.map((store) => store.city?.toLowerCase())),
      ];
      setCities(uniqueCities.filter(Boolean));
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
    setRefreshing(false);
  };

  const filteredStores =
    selectedCity === "all"
      ? stores
      : stores.filter((store) => store.city?.toLowerCase() === selectedCity);

  const handleDirections = (store) => {
    const address = `${store.address}, ${store.city}`;
    Linking.openURL(
      `https://maps.google.com/?q=${encodeURIComponent(address)}`,
    );
  };

  const handleCall = (phone) => {
    const cleanPhone = phone?.replace(/[^0-9+]/g, "");
    if (cleanPhone) Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleEmail = (email) => {
    if (email) Linking.openURL(`mailto:${email}`);
  };

  const renderStoreCard = ({ item: store }) => (
    <View
      style={{
        backgroundColor: colors.cardBg,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.border,
        overflow: "hidden",
      }}
    >
      {/* Store Header */}
      <View
        style={{
          backgroundColor: colors.primary + "10",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}>
          {store.name}
        </Text>
        {store.city && (
          <Text
            style={{
              fontSize: 13,
              fontWeight: "600",
              color: colors.primary,
              marginTop: 2,
            }}
          >
            {store.city}
          </Text>
        )}
      </View>

      {/* Store Details */}
      <View style={{ padding: 16 }}>
        {/* Address */}
        <View style={{ flexDirection: "row", marginBottom: 12 }}>
          <MapPin
            size={18}
            color={colors.primary}
            style={{ marginRight: 12, marginTop: 2 }}
          />
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                lineHeight: 20,
              }}
            >
              {store.address}
            </Text>
          </View>
        </View>

        {/* Phone */}
        {store.phone && (
          <TouchableOpacity
            onPress={() => handleCall(store.phone)}
            style={{ flexDirection: "row", marginBottom: 12 }}
          >
            <Phone
              size={18}
              color={colors.primary}
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <Text style={{ fontSize: 14, color: colors.text }}>
              {store.phone}
            </Text>
          </TouchableOpacity>
        )}

        {/* Email */}
        {store.email && (
          <TouchableOpacity
            onPress={() => handleEmail(store.email)}
            style={{ flexDirection: "row", marginBottom: 12 }}
          >
            <Mail
              size={18}
              color={colors.primary}
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <Text style={{ fontSize: 14, color: colors.text }}>
              {store.email}
            </Text>
          </TouchableOpacity>
        )}

        {/* Working Hours */}
        {store.hours && (
          <View style={{ flexDirection: "row", marginBottom: 12 }}>
            <Clock
              size={18}
              color={colors.primary}
              style={{ marginRight: 12, marginTop: 2 }}
            />
            <Text style={{ fontSize: 14, color: colors.textSecondary }}>
              {store.hours}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <View
        style={{
          flexDirection: "row",
          borderTopWidth: 1,
          borderTopColor: colors.border,
        }}
      >
        <TouchableOpacity
          onPress={() => handleCall(store.phone)}
          style={{
            flex: 1,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
            borderRightWidth: 1,
            borderRightColor: colors.border,
          }}
        >
          <Phone size={16} color={colors.primary} style={{ marginRight: 6 }} />
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>
            Call
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDirections(store)}
          style={{
            flex: 1,
            paddingVertical: 14,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Navigation
            size={16}
            color={colors.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={{ color: colors.primary, fontWeight: "bold" }}>
            Directions
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (storesLoading && stores.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          backgroundColor: colors.surface,
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginRight: 16 }}
        >
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
          Our Stores
        </Text>
      </View>

      {/* Hero Section */}
      <View
        style={{
          padding: 24,
          backgroundColor: colors.primary + "15",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontSize: 28,
            fontWeight: "bold",
            color: colors.primary,
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          Visit Our Stores
        </Text>
        <Text
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            textAlign: "center",
            lineHeight: 22,
          }}
        >
          Find a store{" "}
          <Text style={{ fontWeight: "bold", color: colors.text }}>
            near you
          </Text>{" "}
          and experience our products{" "}
          <Text style={{ fontStyle: "italic" }}>in person</Text>
        </Text>
      </View>

      {/* City Filter */}
      {cities.length > 1 && (
        <View style={{ paddingVertical: 12 }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16 }}
          >
            {cities.map((city) => (
              <TouchableOpacity
                key={city}
                onPress={() => setSelectedCity(city)}
                style={{
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  marginRight: 8,
                  backgroundColor:
                    selectedCity === city ? colors.primary : colors.cardBg,
                  borderWidth: 1,
                  borderColor:
                    selectedCity === city ? colors.primary : colors.border,
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: selectedCity === city ? colors.white : colors.text,
                    textTransform: "capitalize",
                  }}
                >
                  {city === "all" ? "All Cities" : city}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Stores List */}
      <FlatList
        data={filteredStores}
        renderItem={renderStoreCard}
        keyExtractor={(item, index) => item.id || index.toString()}
        contentContainerStyle={{ paddingVertical: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={{ alignItems: "center", padding: 40 }}>
            <MapPin size={48} color={colors.textSecondary} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "600",
                color: colors.text,
                marginTop: 16,
              }}
            >
              No stores found
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginTop: 8,
              }}
            >
              {selectedCity !== "all"
                ? `No stores available in ${selectedCity}`
                : "No store locations available at the moment"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
