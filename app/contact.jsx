import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import { usePageContent } from "../store/usePageContent";

export default function ContactScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const {
    contactInfo,
    contactHero,
    contactFaq,
    loading,
    fetchContactInfo,
    submitContactForm,
  } = usePageContent();

  const [refreshing, setRefreshing] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  useEffect(() => {
    fetchContactInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchContactInfo();
    setRefreshing(false);
  };

  const getIcon = (iconName) => {
    const icons = {
      FiPhone: Phone,
      FiMail: Mail,
      FiMapPin: MapPin,
      FiClock: Clock,
    };
    const IconComponent = icons[iconName] || Phone;
    return <IconComponent size={20} color={colors.white} />;
  };

  const handleContactAction = (info) => {
    if (info.icon === "FiPhone" && info.details[0]) {
      const phone = info.details[0].replace(/[^0-9+]/g, "");
      Linking.openURL(`tel:${phone}`);
    } else if (info.icon === "FiMail" && info.details[0]) {
      Linking.openURL(`mailto:${info.details[0]}`);
    } else if (info.icon === "FiMapPin" && info.details[0]) {
      const address = info.details.join(", ");
      Linking.openURL(
        `https://maps.google.com/?q=${encodeURIComponent(address)}`,
      );
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    const result = await submitContactForm(formData);
    setSubmitting(false);

    if (result.success) {
      Alert.alert(
        "Success",
        "Thank you for your message! We'll get back to you soon.",
      );
      setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
    } else {
      Alert.alert("Error", result.error || "Failed to submit message");
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  if (loading && contactInfo.length === 0) {
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
          Contact Us
        </Text>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 24 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
        >
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
                fontSize: 32,
                fontWeight: "bold",
                color: colors.primary,
                marginBottom: 12,
                textAlign: "center",
              }}
            >
              {contactHero.title}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: colors.textSecondary,
                textAlign: "center",
                lineHeight: 24,
              }}
            >
              {contactHero.description}
            </Text>
          </View>

          {/* Contact Info Cards */}
          <View style={{ padding: 16 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 12,
              }}
            >
              Get in Touch
            </Text>
            <View
              style={{
                flexDirection: "row",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              {contactInfo.map((info, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => handleContactAction(info)}
                  style={{
                    width: "48%",
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
                      width: 40,
                      height: 40,
                      borderRadius: 20,
                      backgroundColor: colors.primary,
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 12,
                    }}
                  >
                    {getIcon(info.icon)}
                  </View>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "bold",
                      color: colors.text,
                      marginBottom: 4,
                    }}
                  >
                    {info.title}
                  </Text>
                  {info.details.map((detail, i) => (
                    <Text
                      key={i}
                      style={{
                        fontSize: 12,
                        color: colors.textSecondary,
                        marginTop: 2,
                      }}
                    >
                      {detail}
                    </Text>
                  ))}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Quick Actions */}
          <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Quick Actions
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 12,
                fontStyle: "italic",
              }}
            >
              Connect with us instantly
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  const phone = contactInfo
                    .find((i) => i.icon === "FiPhone")
                    ?.details[0]?.replace(/[^0-9+]/g, "");
                  if (phone) Linking.openURL(`tel:${phone}`);
                }}
                style={{
                  flex: 1,
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Phone
                  size={18}
                  color={colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: colors.white, fontWeight: "600" }}>
                  Call Us
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  Linking.openURL("https://wa.me/919876543210");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#25D366",
                  paddingVertical: 14,
                  borderRadius: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <MessageCircle
                  size={18}
                  color={colors.white}
                  style={{ marginRight: 8 }}
                />
                <Text style={{ color: colors.white, fontWeight: "600" }}>
                  WhatsApp
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Contact Form */}
          <View
            style={{ padding: 16, backgroundColor: colors.backgroundSecondary }}
          >
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 4,
              }}
            >
              Send Us a Message
            </Text>
            <Text
              style={{
                fontSize: 13,
                color: colors.textSecondary,
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              We will get back to you within 24 hours
            </Text>

            <View
              style={{
                backgroundColor: colors.cardBg,
                padding: 16,
                borderRadius: 12,
              }}
            >
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  Your Name *
                </Text>
                <TextInput
                  value={formData.name}
                  onChangeText={(text) =>
                    setFormData({ ...formData, name: text })
                  }
                  placeholder="Enter your name"
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

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  Email Address *
                </Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(text) =>
                    setFormData({ ...formData, email: text })
                  }
                  placeholder="Enter your email"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
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

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  Phone Number
                </Text>
                <TextInput
                  value={formData.phone}
                  onChangeText={(text) =>
                    setFormData({ ...formData, phone: text })
                  }
                  placeholder="Enter your phone number"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="phone-pad"
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

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  Subject
                </Text>
                <TextInput
                  value={formData.subject}
                  onChangeText={(text) =>
                    setFormData({ ...formData, subject: text })
                  }
                  placeholder="Enter subject"
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

              <View style={{ marginBottom: 16 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: colors.text,
                    marginBottom: 6,
                  }}
                >
                  Message *
                </Text>
                <TextInput
                  value={formData.message}
                  onChangeText={(text) =>
                    setFormData({ ...formData, message: text })
                  }
                  placeholder="Write your message here..."
                  placeholderTextColor={colors.textSecondary}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  style={{
                    backgroundColor: colors.background,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 8,
                    padding: 12,
                    color: colors.text,
                    fontSize: 15,
                    minHeight: 100,
                  }}
                />
              </View>

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={submitting}
                style={{
                  backgroundColor: colors.primary,
                  paddingVertical: 14,
                  borderRadius: 8,
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
                      size={18}
                      color={colors.white}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={{
                        color: colors.white,
                        fontWeight: "600",
                        fontSize: 16,
                      }}
                    >
                      Send Message
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* FAQ Section */}
          {contactFaq.length > 0 && (
            <View style={{ padding: 16 }}>
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 16,
                }}
              >
                Frequently Asked Questions
              </Text>

              {contactFaq.map((faq, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => toggleFaq(index)}
                  style={{
                    backgroundColor: colors.cardBg,
                    borderRadius: 12,
                    marginBottom: 8,
                    borderWidth: 1,
                    borderColor: colors.border,
                    overflow: "hidden",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: 16,
                    }}
                  >
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 15,
                        fontWeight: "600",
                        color: colors.text,
                        marginRight: 12,
                      }}
                    >
                      {faq.question}
                    </Text>
                    {expandedFaq === index ? (
                      <ChevronUp size={20} color={colors.primary} />
                    ) : (
                      <ChevronDown size={20} color={colors.textSecondary} />
                    )}
                  </View>
                  {expandedFaq === index && (
                    <View
                      style={{
                        paddingHorizontal: 16,
                        paddingBottom: 16,
                        borderTopWidth: 1,
                        borderTopColor: colors.border,
                        paddingTop: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 14,
                          color: colors.textSecondary,
                          lineHeight: 22,
                        }}
                      >
                        {faq.answer}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
