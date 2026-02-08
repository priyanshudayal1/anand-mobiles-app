import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import { usePageContent } from "../store/usePageContent";

export default function FAQScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const isDark = isDarkMode();
  const { contactInfo, fetchContactInfo } = usePageContent();

  const [loading, setLoading] = useState(true);
  const [faqData, setFaqData] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);

  // Default FAQ data
  const defaultFAQ = [
    {
      category: "Orders & Shipping",
      items: [
        {
          question: "How long does delivery take?",
          answer:
            "Standard delivery takes 3-5 business days. Express delivery is available in select cities and typically takes 1-2 days.",
        },
        {
          question: "How can I track my order?",
          answer:
            "You can track your order in the 'My Orders' section. You'll also receive SMS and email updates with tracking information.",
        },
        {
          question: "Do you deliver to my area?",
          answer:
            "We deliver across India. Enter your pincode at checkout to verify delivery availability and estimated delivery time for your location.",
        },
        {
          question: "What are the shipping charges?",
          answer:
            "Shipping is free for orders above ₹500. For orders below ₹500, a nominal delivery charge of ₹50 applies.",
        },
      ],
    },
    {
      category: "Returns & Refunds",
      items: [
        {
          question: "What is your return policy?",
          answer:
            "We offer a 7-day return policy on all products. Items must be in original condition with all accessories and packaging intact.",
        },
        {
          question: "How do I return a product?",
          answer:
            "Go to 'My Orders', select the order you want to return, and click 'Request Return'. Our team will arrange pickup from your location.",
        },
        {
          question: "How long does refund take?",
          answer:
            "Refunds are processed within 5-7 business days after we receive and inspect the returned product. The amount will be credited to your original payment method.",
        },
      ],
    },
    {
      category: "Warranty & Support",
      items: [
        {
          question: "Do you offer warranty on products?",
          answer:
            "Yes, all products come with manufacturer warranty. The warranty period varies by product and brand - typically 1 year for mobiles and 6 months for accessories.",
        },
        {
          question: "How do I claim warranty?",
          answer:
            "For warranty claims, visit our store with your product, bill, and warranty card. You can also contact our support team for assistance.",
        },
        {
          question: "Is software-related damage covered?",
          answer:
            "Manufacturer warranty covers hardware defects only. Software issues, physical damage, and water damage are not covered under standard warranty.",
        },
      ],
    },
    {
      category: "Payment & Billing",
      items: [
        {
          question: "What payment methods do you accept?",
          answer:
            "We accept UPI, Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking, and Cash on Delivery. EMI options are available on select cards.",
        },
        {
          question: "Is COD (Cash on Delivery) available?",
          answer:
            "Yes, Cash on Delivery is available for most locations. There's a nominal ₹30 COD convenience fee. COD is not available for orders above ₹50,000.",
        },
        {
          question: "Can I get a GST invoice?",
          answer:
            "Yes, GST invoice is provided for all orders. You can also enter your GSTIN at checkout for B2B purchases.",
        },
      ],
    },
  ];

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await fetchContactInfo();
      // If contact info has FAQ data, use it
      if (contactInfo?.faq && contactInfo.faq.length > 0) {
        setFaqData([{ category: "General", items: contactInfo.faq }]);
      } else {
        setFaqData(defaultFAQ);
      }
    } catch (_error) {
      setFaqData(defaultFAQ);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    setExpandedIndex(expandedIndex === key ? null : key);
  };

  const renderFAQItem = (item, categoryIndex, itemIndex) => {
    const key = `${categoryIndex}-${itemIndex}`;
    const isExpanded = expandedIndex === key;

    return (
      <TouchableOpacity
        key={key}
        onPress={() => toggleExpand(categoryIndex, itemIndex)}
        activeOpacity={0.7}
        style={{
          backgroundColor: colors.cardBg,
          borderRadius: 12,
          marginBottom: 12,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: isExpanded ? colors.primary : colors.border,
          shadowColor: isExpanded ? colors.primary : "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isExpanded ? 0.15 : 0.05,
          shadowRadius: 4,
          elevation: isExpanded ? 4 : 1,
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
              fontWeight: "bold",
              color: isExpanded ? colors.primary : colors.text,
              marginRight: 12,
            }}
          >
            {item.question}
          </Text>
          <View
            style={{
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: isExpanded
                ? colors.primary
                : colors.backgroundSecondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isExpanded ? (
              <ChevronUp size={16} color={colors.white} />
            ) : (
              <ChevronDown size={16} color={colors.textSecondary} />
            )}
          </View>
        </View>

        {isExpanded && (
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
              {item.answer}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
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
          FAQ
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Hero Section */}
        <View
          style={{
            padding: 24,
            backgroundColor: colors.primary + "15",
            alignItems: "center",
          }}
        >
          <HelpCircle
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
            Frequently Asked Questions
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
            }}
          >
            Find{" "}
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              quick answers
            </Text>{" "}
            to commonly asked questions
          </Text>
        </View>

        {/* FAQ Categories */}
        {faqData.map((category, categoryIndex) => (
          <View key={categoryIndex} style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 4,
                  height: 24,
                  backgroundColor: colors.primary,
                  borderRadius: 2,
                  marginRight: 10,
                }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.text,
                }}
              >
                {category.category}
              </Text>
            </View>
            {category.items.map((item, itemIndex) =>
              renderFAQItem(item, categoryIndex, itemIndex),
            )}
          </View>
        ))}

        {/* Still Have Questions */}
        <View
          style={{
            margin: 16,
            backgroundColor: colors.cardBg,
            padding: 24,
            borderRadius: 16,
            alignItems: "center",
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <MessageCircle
            size={40}
            color={colors.primary}
            style={{ marginBottom: 12 }}
          />
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 8,
            }}
          >
            Still have questions?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.textSecondary,
              textAlign: "center",
              marginBottom: 16,
            }}
          >
            Cannot find the answer you are looking for? Reach out to our support
            team.
          </Text>
          <TouchableOpacity
            onPress={() => router.push("/contact")}
            style={{
              backgroundColor: colors.primary,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 8,
            }}
          >
            <Text
              style={{ color: colors.white, fontWeight: "600", fontSize: 14 }}
            >
              Contact Support
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
