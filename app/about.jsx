import React, { useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import {
  ArrowLeft,
  Award,
  Users,
  Laptop,
  Target,
  Eye,
  ShoppingBag,
  Phone,
} from "lucide-react-native";
import { useTheme } from "../store/useTheme";
import { usePageContent } from "../store/usePageContent";

export default function AboutScreen() {
  const router = useRouter();
  const { colors, isDarkMode } = useTheme();
  const isDark = isDarkMode();
  const { width } = useWindowDimensions();
  const { content, loading, fetchPageContent, clearContent } = usePageContent();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchPageContent("about-us");
    return () => clearContent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPageContent("about-us", true);
    setRefreshing(false);
  };

  // Parse and render backend content with formatting
  const renderBackendContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Clean up HTML
    let cleanContent = htmlContent
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/p>/gi, "\n\n")
      .replace(/<p[^>]*>/gi, "")
      .replace(/<[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/\n{3,}/g, "\n\n");

    const paragraphs = cleanContent.split("\n\n").filter((p) => p.trim());

    return paragraphs.map((para, index) => (
      <Text
        key={index}
        style={{
          fontSize: 15,
          color: colors.textSecondary,
          lineHeight: 24,
          marginBottom: 12,
        }}
      >
        {para.trim()}
      </Text>
    ));
  };

  const whyChooseUs = [
    {
      icon: Award,
      title: "Quality Assurance",
      description:
        "All our products are genuine and come with official warranties.",
    },
    {
      icon: Users,
      title: "Expert Support",
      description:
        "Our knowledgeable team is always ready to help you make the right choice.",
    },
    {
      icon: Laptop,
      title: "Wide Selection",
      description:
        "From budget-friendly to premium, we have options for every need.",
    },
  ];

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
          About Us
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
          <Text
            style={{
              fontSize: 32,
              fontWeight: "bold",
              color: colors.primary,
              marginBottom: 12,
              textAlign: "center",
            }}
          >
            About Us
          </Text>
          <Text
            style={{
              fontSize: 16,
              color: colors.textSecondary,
              textAlign: "center",
              lineHeight: 24,
            }}
          >
            We are a{" "}
            <Text style={{ fontWeight: "bold", color: colors.text }}>
              premier electronics retailer
            </Text>{" "}
            specializing in the latest mobile phones, laptops, tablets, and
            accessories.
          </Text>
        </View>

        {/* Our Story Section */}
        <View style={{ padding: 16 }}>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 16,
            }}
          >
            Our Story
          </Text>

          {loading ? (
            <View style={{ padding: 32, alignItems: "center" }}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : content ? (
            <View>{renderBackendContent(content)}</View>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 24,
                  marginBottom: 12,
                }}
              >
                Founded in{" "}
                <Text style={{ fontWeight: "bold", color: colors.text }}>
                  2010
                </Text>
                , we began as a small mobile phone shop with a vision to make
                technology{" "}
                <Text style={{ fontStyle: "italic" }}>
                  accessible to everyone
                </Text>
                . Over the years, we have grown to become one of the{" "}
                <Text style={{ fontWeight: "bold", color: colors.text }}>
                  most trusted electronics retailers
                </Text>{" "}
                in the region.
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 24,
                  marginBottom: 12,
                }}
              >
                Our journey has been defined by a commitment to{" "}
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  quality
                </Text>
                ,{" "}
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  innovation
                </Text>
                , and{" "}
                <Text style={{ fontWeight: "600", color: colors.text }}>
                  customer satisfaction
                </Text>
                . We carefully select each product in our inventory to ensure it
                meets our high standards.
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: colors.textSecondary,
                  lineHeight: 24,
                }}
              >
                Today, we continue to{" "}
                <Text style={{ fontStyle: "italic" }}>
                  expand our offerings
                </Text>{" "}
                while maintaining the personalized service that has been the{" "}
                <Text style={{ fontWeight: "bold", color: colors.primary }}>
                  cornerstone of our success
                </Text>
                .
              </Text>
            </>
          )}
        </View>

        {/* Store Image */}
        <View style={{ paddingHorizontal: 16, marginBottom: 24 }}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
            }}
            style={{
              width: width - 32,
              height: 200,
              borderRadius: 12,
            }}
            contentFit="cover"
          />
        </View>

        {/* Why Choose Us */}
        <View
          style={{ padding: 16, backgroundColor: colors.backgroundSecondary }}
        >
          <Text
            style={{
              fontSize: 24,
              fontWeight: "bold",
              color: colors.text,
              marginBottom: 16,
              textAlign: "center",
            }}
          >
            Why Choose Us
          </Text>

          {whyChooseUs.map((item, index) => (
            <View
              key={index}
              style={{
                backgroundColor: colors.cardBg,
                padding: 20,
                borderRadius: 12,
                marginBottom: 12,
                alignItems: "center",
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <View
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 28,
                  backgroundColor: colors.primary + "20",
                  justifyContent: "center",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <item.icon size={28} color={colors.primary} />
              </View>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: colors.text,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: colors.textSecondary,
                  textAlign: "center",
                  lineHeight: 20,
                }}
              >
                {item.description}
              </Text>
            </View>
          ))}
        </View>

        {/* Vision & Mission */}
        <View style={{ padding: 16 }}>
          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              padding: 20,
              borderRadius: 12,
              marginBottom: 16,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Eye
                size={24}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                Our Vision
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                lineHeight: 24,
              }}
            >
              To be the{" "}
              <Text style={{ fontWeight: "bold", color: colors.text }}>
                leading electronics retailer
              </Text>{" "}
              known for exceptional customer experience,{" "}
              <Text style={{ fontStyle: "italic" }}>
                innovative product offerings
              </Text>
              , and making technology{" "}
              <Text style={{ fontWeight: "600", color: colors.primary }}>
                accessible to all
              </Text>
              .
            </Text>
          </View>

          <View
            style={{
              backgroundColor: colors.backgroundSecondary,
              padding: 20,
              borderRadius: 12,
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 12,
              }}
            >
              <Target
                size={24}
                color={colors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  fontSize: 20,
                  fontWeight: "bold",
                  color: colors.primary,
                }}
              >
                Our Mission
              </Text>
            </View>
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                lineHeight: 24,
              }}
            >
              To provide our customers with{" "}
              <Text style={{ fontWeight: "bold", color: colors.text }}>
                high-quality electronics
              </Text>{" "}
              at competitive prices,{" "}
              <Text style={{ fontStyle: "italic" }}>
                exceptional customer service
              </Text>
              , and an{" "}
              <Text style={{ fontWeight: "600", color: colors.primary }}>
                enjoyable shopping experience
              </Text>
              .
            </Text>
          </View>
        </View>

        {/* CTA Section */}
        <View
          style={{
            margin: 16,
            padding: 24,
            backgroundColor: colors.primary,
            borderRadius: 12,
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: colors.white,
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Ready to Experience the Difference?
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: colors.white + "CC",
              textAlign: "center",
              marginBottom: 20,
            }}
          >
            Browse our collection to find the perfect device for your needs.
          </Text>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/menu")}
              style={{
                backgroundColor: colors.white,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <ShoppingBag
                size={18}
                color={colors.primary}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: colors.primary, fontWeight: "600" }}>
                Shop Now
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/contact")}
              style={{
                borderWidth: 2,
                borderColor: colors.white,
                paddingVertical: 12,
                paddingHorizontal: 20,
                borderRadius: 8,
                flexDirection: "row",
                alignItems: "center",
              }}
            >
              <Phone
                size={18}
                color={colors.white}
                style={{ marginRight: 6 }}
              />
              <Text style={{ color: colors.white, fontWeight: "600" }}>
                Contact Us
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
