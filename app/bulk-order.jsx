import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Package,
  Users,
  Send,
  Plus,
  Trash2,
  Building,
  CheckCircle,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import api from "../services/api";

export default function BulkOrderScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();

  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstin: "",
    additionalInfo: "",
  });

  const [products, setProducts] = useState([
    { id: 1, name: "", model: "", quantity: "", remarks: "" },
  ]);

  const updateFormField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const updateProduct = (index, field, value) => {
    const updated = [...products];
    updated[index][field] = value;
    setProducts(updated);
  };

  const addProduct = () => {
    setProducts([
      ...products,
      {
        id: products.length + 1,
        name: "",
        model: "",
        quantity: "",
        remarks: "",
      },
    ]);
  };

  const removeProduct = (index) => {
    if (products.length > 1) {
      const updated = [...products];
      updated.splice(index, 1);
      setProducts(updated);
    } else {
      Alert.alert("Error", "At least one product is required");
    }
  };

  const handleSubmit = async () => {
    // Validate
    if (!formData.name || !formData.email || !formData.phone) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    const validProducts = products.filter((p) => p.name && p.quantity);
    if (validProducts.length === 0) {
      Alert.alert(
        "Error",
        "Please add at least one product with name and quantity",
      );
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/admin/contact/form/submit/", {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: `Bulk Order Request from ${formData.company || formData.name}`,
        message: `
Company: ${formData.company || "N/A"}
Address: ${formData.address}, ${formData.city}, ${formData.state} - ${formData.pincode}
GSTIN: ${formData.gstin || "N/A"}

Products Requested:
${validProducts.map((p, i) => `${i + 1}. ${p.name} (Model: ${p.model || "N/A"}) - Qty: ${p.quantity} ${p.remarks ? `- ${p.remarks}` : ""}`).join("\n")}

Additional Info: ${formData.additionalInfo || "None"}
        `,
      });

      Alert.alert(
        "Success",
        "Your bulk order inquiry has been submitted. Our team will contact you shortly.",
        [{ text: "OK", onPress: () => router.back() }],
      );
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to submit request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const benefits = [
    {
      icon: Package,
      title: "Competitive Pricing",
      desc: "Special rates for bulk orders",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      desc: "Personal account manager",
    },
    {
      icon: CheckCircle,
      title: "Quality Assured",
      desc: "100% genuine products",
    },
  ];

  const renderInput = (label, field, placeholder, options = {}) => (
    <View style={{ marginBottom: 16 }}>
      <Text
        style={{
          fontSize: 14,
          fontWeight: "bold",
          color: colors.text,
          marginBottom: 6,
        }}
      >
        {label} {options.required && "*"}
      </Text>
      <TextInput
        value={formData[field]}
        onChangeText={(text) => updateFormField(field, text)}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        keyboardType={options.keyboardType || "default"}
        autoCapitalize={options.autoCapitalize || "sentences"}
        multiline={options.multiline}
        numberOfLines={options.numberOfLines}
        textAlignVertical={options.multiline ? "top" : "center"}
        style={{
          backgroundColor: colors.background,
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          padding: 12,
          color: colors.text,
          fontSize: 15,
          minHeight: options.multiline ? 80 : undefined,
        }}
      />
    </View>
  );

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      <StatusBar style={isDarkMode ? "light" : "dark"} />

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
          Bulk Orders
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
          {/* Hero Section */}
          <View
            style={{
              padding: 24,
              backgroundColor: colors.primary + "15",
              alignItems: "center",
            }}
          >
            <Building
              size={52}
              color={colors.primary}
              style={{ marginBottom: 12 }}
            />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: colors.primary,
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Corporate & Bulk Orders
            </Text>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              Get{" "}
              <Text style={{ fontWeight: "bold", color: colors.text }}>
                special pricing
              </Text>{" "}
              and <Text style={{ fontStyle: "italic" }}>dedicated support</Text>{" "}
              for your business needs
            </Text>
          </View>

          {/* Benefits */}
          <View style={{ flexDirection: "row", padding: 16, gap: 12 }}>
            {benefits.map((item, index) => (
              <View
                key={index}
                style={{
                  flex: 1,
                  backgroundColor: colors.cardBg,
                  padding: 12,
                  borderRadius: 12,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <item.icon
                  size={24}
                  color={colors.primary}
                  style={{ marginBottom: 8 }}
                />
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "600",
                    color: colors.text,
                    textAlign: "center",
                    marginBottom: 4,
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    color: colors.textSecondary,
                    textAlign: "center",
                  }}
                >
                  {item.desc}
                </Text>
              </View>
            ))}
          </View>

          {/* Contact Information */}
          <View
            style={{ padding: 16, backgroundColor: colors.backgroundSecondary }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Contact Information
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              Fields marked with * are required
            </Text>
            <View
              style={{
                backgroundColor: colors.cardBg,
                padding: 16,
                borderRadius: 12,
              }}
            >
              {renderInput("Full Name", "name", "Enter your name", {
                required: true,
              })}
              {renderInput("Company Name", "company", "Enter company name")}
              {renderInput("Email", "email", "Enter email address", {
                required: true,
                keyboardType: "email-address",
                autoCapitalize: "none",
              })}
              {renderInput("Phone", "phone", "Enter phone number", {
                required: true,
                keyboardType: "phone-pad",
              })}
              {renderInput("Address", "address", "Enter address")}

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput("City", "city", "City")}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput("State", "state", "State")}
                </View>
              </View>

              <View style={{ flexDirection: "row", gap: 12 }}>
                <View style={{ flex: 1 }}>
                  {renderInput("Pincode", "pincode", "Pincode", {
                    keyboardType: "number-pad",
                  })}
                </View>
                <View style={{ flex: 1 }}>
                  {renderInput("GSTIN", "gstin", "GSTIN (optional)")}
                </View>
              </View>
            </View>
          </View>

          {/* Products Section */}
          <View style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{ fontSize: 20, fontWeight: "bold", color: colors.text }}
              >
                Products Required
              </Text>
              <TouchableOpacity
                onPress={addProduct}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.primary,
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                }}
              >
                <Plus
                  size={16}
                  color={colors.white}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    color: colors.white,
                    fontWeight: "bold",
                    fontSize: 13,
                  }}
                >
                  Add
                </Text>
              </TouchableOpacity>
            </View>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              Add all products you need with quantities
            </Text>

            {products.map((product, index) => (
              <View
                key={product.id}
                style={{
                  backgroundColor: colors.cardBg,
                  padding: 16,
                  borderRadius: 12,
                  marginBottom: 12,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "600",
                      color: colors.text,
                    }}
                  >
                    Product #{index + 1}
                  </Text>
                  {products.length > 1 && (
                    <TouchableOpacity onPress={() => removeProduct(index)}>
                      <Trash2 size={18} color={colors.error} />
                    </TouchableOpacity>
                  )}
                </View>

                <TextInput
                  value={product.name}
                  onChangeText={(text) => updateProduct(index, "name", text)}
                  placeholder="Product Name *"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    fontSize: 15,
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}
                >
                  <TextInput
                    value={product.model}
                    onChangeText={(text) => updateProduct(index, "model", text)}
                    placeholder="Model"
                    placeholderTextColor={colors.textSecondary}
                    style={{
                      flex: 1,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />
                  <TextInput
                    value={product.quantity}
                    onChangeText={(text) =>
                      updateProduct(index, "quantity", text)
                    }
                    placeholder="Qty *"
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="number-pad"
                    style={{
                      width: 80,
                      backgroundColor: colors.background,
                      borderWidth: 1,
                      borderColor: colors.border,
                      borderRadius: 8,
                      padding: 12,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  />
                </View>

                <TextInput
                  value={product.remarks}
                  onChangeText={(text) => updateProduct(index, "remarks", text)}
                  placeholder="Remarks (optional)"
                  placeholderTextColor={colors.textSecondary}
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    fontSize: 15,
                  }}
                />
              </View>
            ))}
          </View>

          {/* Additional Info */}
          <View style={{ padding: 16, paddingTop: 0 }}>
            {renderInput(
              "Additional Information",
              "additionalInfo",
              "Any other requirements...",
              {
                multiline: true,
                numberOfLines: 4,
              },
            )}
          </View>

          {/* Submit Button */}
          <View style={{ padding: 16 }}>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={submitting}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 16,
                borderRadius: 12,
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Send
                    size={20}
                    color={colors.white}
                    style={{ marginRight: 8 }}
                  />
                  <Text
                    style={{
                      color: colors.white,
                      fontWeight: "bold",
                      fontSize: 16,
                    }}
                  >
                    Submit Inquiry
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
