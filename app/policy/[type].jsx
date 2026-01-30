import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  ArrowLeft,
  FileText,
  Shield,
  Truck,
  RotateCcw,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { usePageContent } from "../../store/usePageContent";

// Policy page configuration
const POLICY_CONFIG = {
  terms: {
    title: "Terms & Conditions",
    path: "terms-conditions",
    icon: FileText,
    fallbackContent: `These Terms & Conditions govern your use of our website and services. By accessing our website or purchasing products from us, you agree to be bound by these Terms.

1. Use of the Website
You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others.

2. Product Information
We strive to provide accurate product information, but we do not warrant that product descriptions are accurate, complete, or error-free.

3. Pricing
All prices are listed in INR and are subject to change without notice. We reserve the right to refuse or cancel orders placed at incorrect prices.

4. Orders and Payments
By placing an order, you are offering to purchase a product. All orders are subject to availability and confirmation of the order price.

5. Delivery
We aim to deliver products within the estimated delivery time, but delays may occur due to unforeseen circumstances.

6. Returns and Refunds
Please refer to our Refund Policy for detailed information about returns and refunds.

7. Intellectual Property
All content on this website is the property of Anand Mobiles and is protected by copyright laws.

8. Limitation of Liability
We shall not be liable for any indirect, incidental, special, or consequential damages arising from the use of our products or services.

9. Changes to Terms
We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting.

10. Contact Us
For questions about these Terms, please contact us through our Contact page.`,
  },
  privacy: {
    title: "Privacy Policy",
    path: "privacy-policy",
    icon: Shield,
    fallbackContent: `Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information.

1. Information We Collect
- Personal details (name, email, phone, address)
- Payment information
- Browsing history and preferences
- Device and usage data

2. How We Use Your Information
- Process orders and payments
- Provide customer support
- Send order updates and promotions
- Improve our services

3. Data Security
We implement appropriate security measures to protect your personal information from unauthorized access, alteration, or disclosure.

4. Cookies
We use cookies to enhance your browsing experience. You can control cookie settings through your browser.

5. Third-Party Services
We may share data with trusted third parties for payment processing, shipping, and analytics. These parties are required to maintain the confidentiality of your information.

6. Your Rights
You have the right to access, update, or delete your personal information. Contact us to exercise these rights.

7. Data Retention
We retain your information for as long as necessary to fulfill the purposes outlined in this policy.

8. Updates to This Policy
We may update this policy from time to time. Changes will be posted on this page.

9. Contact Us
For privacy-related inquiries, please contact us through our Contact page.`,
  },
  refund: {
    title: "Refund Policy",
    path: "refund-policy",
    icon: RotateCcw,
    fallbackContent: `We want you to be completely satisfied with your purchase. Please read our refund policy carefully.

1. Return Window
Products can be returned within 7 days of delivery if they meet our return conditions.

2. Return Conditions
- Product must be unused and in original packaging
- All accessories, manuals, and warranty cards must be included
- Original invoice/receipt is required

3. Non-Returnable Items
- Products damaged due to misuse
- Software, accessories once opened
- Products without original packaging
- Customized or personalized items

4. How to Initiate a Return
1. Contact our customer support
2. Provide order details and reason for return
3. Wait for return authorization
4. Ship the product back to us

5. Refund Process
- Refunds are processed within 7-10 business days after receiving the returned product
- Original payment method will be credited
- Shipping charges are non-refundable unless the return is due to our error

6. Exchanges
We offer exchanges for defective products or wrong items delivered. Contact us within 48 hours of delivery.

7. Cancellation
Orders can be cancelled before shipping. Once shipped, the standard return policy applies.

8. Contact Us
For return or refund queries, please contact our customer support.`,
  },
  shipping: {
    title: "Shipping Policy",
    path: "shipping-policy",
    icon: Truck,
    fallbackContent: `We aim to deliver your orders as quickly and efficiently as possible.

1. Delivery Areas
We deliver across India. Some remote areas may have limited service availability.

2. Delivery Time
- Metro cities: 2-4 business days
- Other cities: 4-7 business days
- Remote areas: 7-10 business days

3. Shipping Charges
- Free shipping on orders above ₹999
- Standard shipping: ₹99
- Express shipping: ₹199 (available in select cities)

4. Order Tracking
Once your order is shipped, you will receive a tracking number via SMS and email. Use this to track your delivery.

5. Delivery Process
- Orders are processed within 24-48 hours
- You will receive delivery notifications
- Someone must be available to receive the package
- ID verification may be required for high-value orders

6. Failed Delivery
If delivery fails, our courier partner will attempt redelivery. After 3 failed attempts, the order will be returned.

7. Damaged in Transit
If you receive a damaged package, refuse delivery or report within 24 hours with photos for a replacement or refund.

8. International Shipping
Currently, we only ship within India. International shipping is not available.

9. Contact Us
For shipping queries, please contact our customer support.`,
  },
};

export default function PolicyScreen() {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const { content, loading, fetchPageContent, clearContent } = usePageContent();
  const [refreshing, setRefreshing] = useState(false);

  const config = POLICY_CONFIG[type] || POLICY_CONFIG.terms;
  const IconComponent = config.icon;

  useEffect(() => {
    fetchPageContent(config.path);
    return () => clearContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPageContent(config.path, true);
    setRefreshing(false);
  };

  // Parse and render content with proper formatting
  const renderFormattedContent = (textContent) => {
    if (!textContent) return null;

    // Clean up HTML if present
    let cleanContent = textContent
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/\n{3,}/g, "\n\n");

    // Split content into paragraphs
    const paragraphs = cleanContent.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((paragraph, index) => {
      const trimmedPara = paragraph.trim();

      // Check if it's a numbered heading (e.g., "1. Use of the Website")
      const numberedHeadingMatch = trimmedPara.match(/^(\d+)\.\s+(.+)/);
      if (numberedHeadingMatch) {
        return (
          <View
            key={index}
            style={{ marginTop: index > 0 ? 20 : 0, marginBottom: 8 }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: "bold",
                color: colors.text,
                lineHeight: 24,
              }}
            >
              {trimmedPara}
            </Text>
          </View>
        );
      }

      // Check if it looks like a heading (ends with colon or is short and capitalized)
      const isHeading =
        trimmedPara.endsWith(":") ||
        (trimmedPara.length < 100 &&
          trimmedPara.split(" ").length < 15 &&
          /^[A-Z]/.test(trimmedPara) &&
          !trimmedPara.includes("."));

      if (isHeading) {
        return (
          <View
            key={index}
            style={{ marginTop: index > 0 ? 20 : 0, marginBottom: 8 }}
          >
            <Text
              style={{
                fontSize: 15,
                fontWeight: "bold",
                color: colors.text,
                lineHeight: 24,
              }}
            >
              {trimmedPara}
            </Text>
          </View>
        );
      }

      // Regular paragraph
      return (
        <Text
          key={index}
          style={{
            fontSize: 15,
            color: colors.textSecondary,
            lineHeight: 24,
            marginBottom: 12,
          }}
        >
          {trimmedPara}
        </Text>
      );
    });
  };

  const displayContent = content || config.fallbackContent;

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
        <Text
          style={{
            fontSize: 18,
            fontWeight: "bold",
            color: colors.text,
            flex: 1,
          }}
        >
          {config.title}
        </Text>
      </View>

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
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              backgroundColor: colors.primary + "30",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <IconComponent size={32} color={colors.primary} />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            {config.title}
          </Text>
          <Text
            style={{
              fontSize: 13,
              color: colors.textSecondary,
              fontStyle: "italic",
            }}
          >
            Last Updated: January 2024
          </Text>
        </View>

        {/* Content */}
        <View style={{ padding: 16 }}>
          {loading ? (
            <View style={{ padding: 40, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <View
              style={{
                backgroundColor: colors.cardBg,
                padding: 20,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {renderFormattedContent(displayContent)}
            </View>
          )}
        </View>

        {/* Contact CTA */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              padding: 24,
              borderRadius: 12,
              alignItems: "center",
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: colors.text,
                marginBottom: 8,
              }}
            >
              Have Questions?
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: colors.textSecondary,
                textAlign: "center",
                marginBottom: 16,
                fontStyle: "italic",
              }}
            >
              If you have any questions about this policy, please contact us.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/contact")}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 8,
              }}
            >
              <Text style={{ color: colors.white, fontWeight: "bold" }}>
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
