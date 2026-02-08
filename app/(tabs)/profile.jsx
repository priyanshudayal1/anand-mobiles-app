import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Modal,
  ToastAndroid,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useAuthStore } from "../../store/useAuth";
import { useTheme } from "../../store/useTheme";

export default function Profile() {
  const router = useRouter();
  const {
    user,
    logout,
    fetchUserProfile,
    updateUserProfileAPI,
    isLoading,
    error,
  } = useAuthStore();
  const { colors, isDarkMode, themePreference, setThemePreference } =
    useTheme();

  const [isEditing, setIsEditing] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Load user data on mount
  useEffect(() => {
    fetchUserProfile().catch((err) => {
      console.error("Failed to fetch profile on mount", err);
    });
  }, []);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        firstName: user.firstName || user.first_name || "",
        lastName: user.lastName || user.last_name || "",
        phone: user.phone || user.phone_number || "",
      }));
    }
  }, [user]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!formData.firstName || !formData.lastName) {
      Alert.alert("Error", "First and Last Name are required");
      return;
    }

    // Check for password change
    if (formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        Alert.alert("Error", "New passwords do not match");
        return;
      }
      if (!formData.currentPassword) {
        Alert.alert("Error", "Current password is required to change password");
        return;
      }
    }

    try {
      const payload = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone_number: formData.phone,
      };

      if (formData.newPassword) {
        payload.current_password = formData.currentPassword;
        payload.new_password = formData.newPassword;
        payload.confirm_new_password = formData.confirmPassword;
      }

      const result = await updateUserProfileAPI(payload);
      if (result.success) {
        const message = "Profile updated successfully";
        if (Platform.OS === "android") {
          ToastAndroid.show(message, ToastAndroid.SHORT);
        } else {
          Alert.alert("Success", message);
        }
        setIsEditing(false);
        // Clear password fields
        setFormData((prev) => ({
          ...prev,
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        }));
      }
    } catch (err) {
      Alert.alert(
        "Error",
        typeof error === "string" ? error : "Failed to update profile",
      );
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: () => {
          logout();
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  const isIncomplete = !user?.firstName || !user?.lastName || !user?.phone;

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDarkMode() ? "light" : "dark"} />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.surface,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}>
          My Account
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Incomplete Profile Banner */}
        {isIncomplete && (
          <View
            style={{
              backgroundColor: colors.warningLight,
              borderColor: colors.warning,
              borderWidth: 1,
              padding: 12,
              borderRadius: 8,
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                color: colors.warning,
                fontWeight: "bold",
                marginBottom: 4,
              }}
            >
              ⚠️ Incomplete Profile
            </Text>
            <Text
              style={{ color: colors.warning, fontSize: 13, marginBottom: 8 }}
            >
              Your profile is missing important information. Please complete
              your profile.
            </Text>
            {!isEditing && (
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 6,
                  paddingHorizontal: 12,
                  borderRadius: 4,
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    color: colors.white,
                    fontSize: 12,
                    fontWeight: "600",
                  }}
                >
                  Complete Profile Now
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Profile Info Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.borderLight,
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
            <Text
              style={{ fontSize: 18, fontWeight: "600", color: colors.text }}
            >
              Profile Information
            </Text>
            <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
              <Text style={{ color: colors.primary, fontWeight: "500" }}>
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form Fields */}
          <View style={{ gap: 16 }}>
            {/* First Name */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                First Name
              </Text>
              {isEditing ? (
                <TextInput
                  value={formData.firstName}
                  onChangeText={(text) => handleChange("firstName", text)}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {user?.firstName || user?.first_name || "Not provided"}
                </Text>
              )}
            </View>

            {/* Last Name */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Last Name
              </Text>
              {isEditing ? (
                <TextInput
                  value={formData.lastName}
                  onChangeText={(text) => handleChange("lastName", text)}
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {user?.lastName || user?.last_name || "Not provided"}
                </Text>
              )}
            </View>

            {/* Email (Read only) */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Email
              </Text>
              <View
                style={{
                  backgroundColor: isEditing
                    ? colors.backgroundSecondary
                    : "transparent",
                  padding: isEditing ? 12 : 0,
                  borderRadius: 8,
                  opacity: isEditing ? 0.7 : 1,
                }}
              >
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {user?.email}
                </Text>
              </View>
              {isEditing && (
                <Text
                  style={{
                    fontSize: 11,
                    color: colors.textSecondary,
                    marginTop: 4,
                  }}
                >
                  Email cannot be changed
                </Text>
              )}
            </View>

            {/* Phone */}
            <View>
              <Text
                style={{
                  fontSize: 13,
                  color: colors.textSecondary,
                  marginBottom: 6,
                }}
              >
                Phone Number
              </Text>
              {isEditing ? (
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) => handleChange("phone", text)}
                  keyboardType="phone-pad"
                  style={{
                    backgroundColor: colors.backgroundSecondary,
                    padding: 12,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    color: colors.text,
                  }}
                />
              ) : (
                <Text style={{ fontSize: 16, color: colors.text }}>
                  {user?.phone || user?.phone_number || "Not provided"}
                </Text>
              )}
            </View>

            {/* Password Change Section (only in edit mode) */}
            {isEditing && (
              <View
                style={{
                  marginTop: 10,
                  paddingTop: 16,
                  borderTopWidth: 1,
                  borderTopColor: colors.borderLight,
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.text,
                    marginBottom: 12,
                  }}
                >
                  Change Password (Optional)
                </Text>

                <View style={{ gap: 12 }}>
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginBottom: 6,
                      }}
                    >
                      Current Password
                    </Text>
                    <TextInput
                      value={formData.currentPassword}
                      onChangeText={(text) =>
                        handleChange("currentPassword", text)
                      }
                      secureTextEntry
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginBottom: 6,
                      }}
                    >
                      New Password
                    </Text>
                    <TextInput
                      value={formData.newPassword}
                      onChangeText={(text) => handleChange("newPassword", text)}
                      secureTextEntry
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                        marginBottom: 6,
                      }}
                    >
                      Confirm new Password
                    </Text>
                    <TextInput
                      value={formData.confirmPassword}
                      onChangeText={(text) =>
                        handleChange("confirmPassword", text)
                      }
                      secureTextEntry
                      style={{
                        backgroundColor: colors.backgroundSecondary,
                        padding: 12,
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.border,
                        color: colors.text,
                      }}
                    />
                  </View>
                </View>
              </View>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <TouchableOpacity
                onPress={handleSave}
                disabled={isLoading}
                style={{
                  backgroundColor: colors.primary,
                  padding: 14,
                  borderRadius: 8,
                  alignItems: "center",
                  marginTop: 8,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {isLoading && (
                  <ActivityIndicator color={colors.white} size="small" />
                )}
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  Save Changes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Theme Settings Section */}
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            shadowColor: colors.text,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
            borderWidth: 1,
            borderColor: colors.borderLight,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Appearance
          </Text>

          <TouchableOpacity
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 8,
            }}
            onPress={() => setShowThemeModal(true)}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons
                name={isDarkMode() ? "moon" : "sunny"}
                size={22}
                color={colors.primary}
              />
              <View>
                <Text
                  style={{
                    fontSize: 15,
                    color: colors.text,
                    fontWeight: "500",
                  }}
                >
                  Theme
                </Text>
                <Text
                  style={{
                    fontSize: 13,
                    color: colors.textSecondary,
                    marginTop: 2,
                  }}
                >
                  {themePreference === "system"
                    ? "System Default"
                    : themePreference === "dark"
                      ? "Dark"
                      : "Light"}
                </Text>
              </View>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Other Sections Links - Grid Layout */}
        <View style={{ gap: 12, marginBottom: 30 }}>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={() => router.push("/orders")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="cube-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Orders
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={() => router.push("/wishlist")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="heart-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Wishlist
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={() => router.push("/addresses")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Addresses
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                padding: 16,
                borderRadius: 12,
                shadowColor: colors.text,
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05,
                shadowRadius: 2,
                elevation: 1,
                borderWidth: 1,
                borderColor: colors.borderLight,
              }}
              onPress={() => router.push("/contact")}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 10,
                    flex: 1,
                  }}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={{
                      fontSize: 15,
                      fontWeight: "500",
                      color: colors.text,
                      flex: 1,
                    }}
                    numberOfLines={1}
                  >
                    Help
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colors.textSecondary}
                />
              </View>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={{
              backgroundColor: colors.surface,
              padding: 16,
              borderRadius: 12,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              shadowColor: colors.text,
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 2,
              elevation: 1,
              marginTop: 8,
              borderWidth: 1,
              borderColor: colors.error,
            }}
            onPress={handleLogout}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <Ionicons name="log-out-outline" size={22} color={colors.error} />
              <Text
                style={{ fontSize: 16, fontWeight: "500", color: colors.error }}
              >
                Logout
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Theme Selection Modal */}
      <Modal
        visible={showThemeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowThemeModal(false)}
      >
        <TouchableOpacity
          style={{
            flex: 1,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          }}
          activeOpacity={1}
          onPress={() => setShowThemeModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            style={{
              width: "85%",
              backgroundColor: colors.surface,
              borderRadius: 16,
              padding: 20,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 20,
                textAlign: "center",
              }}
            >
              Choose Theme
            </Text>

            {/* System Default Option */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 12,
                backgroundColor:
                  themePreference === "system"
                    ? colors.primaryLight
                    : colors.backgroundSecondary,
                marginBottom: 12,
                borderWidth: 2,
                borderColor:
                  themePreference === "system" ? colors.primary : "transparent",
              }}
              onPress={() => {
                setThemePreference("system");
                setShowThemeModal(false);
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="phone-portrait-outline"
                  size={24}
                  color={
                    themePreference === "system" ? colors.primary : colors.text
                  }
                />
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color:
                        themePreference === "system"
                          ? colors.primary
                          : colors.text,
                    }}
                  >
                    System Default
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Follow device settings
                  </Text>
                </View>
              </View>
              {themePreference === "system" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            {/* Light Mode Option */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 12,
                backgroundColor:
                  themePreference === "light"
                    ? colors.primaryLight
                    : colors.backgroundSecondary,
                marginBottom: 12,
                borderWidth: 2,
                borderColor:
                  themePreference === "light" ? colors.primary : "transparent",
              }}
              onPress={() => {
                setThemePreference("light");
                setShowThemeModal(false);
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="sunny"
                  size={24}
                  color={
                    themePreference === "light" ? colors.primary : colors.text
                  }
                />
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color:
                        themePreference === "light"
                          ? colors.primary
                          : colors.text,
                    }}
                  >
                    Light Mode
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Bright and clear
                  </Text>
                </View>
              </View>
              {themePreference === "light" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            {/* Dark Mode Option */}
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                padding: 16,
                borderRadius: 12,
                backgroundColor:
                  themePreference === "dark"
                    ? colors.primaryLight
                    : colors.backgroundSecondary,
                marginBottom: 16,
                borderWidth: 2,
                borderColor:
                  themePreference === "dark" ? colors.primary : "transparent",
              }}
              onPress={() => {
                setThemePreference("dark");
                setShowThemeModal(false);
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
              >
                <Ionicons
                  name="moon"
                  size={24}
                  color={
                    themePreference === "dark" ? colors.primary : colors.text
                  }
                />
                <View>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color:
                        themePreference === "dark"
                          ? colors.primary
                          : colors.text,
                    }}
                  >
                    Dark Mode
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      color: colors.textSecondary,
                      marginTop: 2,
                    }}
                  >
                    Easy on the eyes
                  </Text>
                </View>
              </View>
              {themePreference === "dark" && (
                <Ionicons
                  name="checkmark-circle"
                  size={24}
                  color={colors.primary}
                />
              )}
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              style={{
                padding: 14,
                borderRadius: 10,
                backgroundColor: colors.backgroundSecondary,
                alignItems: "center",
              }}
              onPress={() => setShowThemeModal(false)}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: colors.text }}
              >
                Close
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}
