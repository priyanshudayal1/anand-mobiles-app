import React, { useCallback, useMemo, forwardRef, useState } from "react";
import { View, Text, TouchableOpacity, Linking, Platform } from "react-native";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
} from "@gorhom/bottom-sheet";
import {
  X,
  ChevronDown,
  ChevronUp,
  Home,
  Info,
  Phone,
  Mail,
  Package,
  FileText,
  Shield,
  Truck,
  MessageCircle,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  HelpCircle,
  Store,
  ShoppingBag,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../store/useTheme";

const MoreBottomSheet = forwardRef(({ onClose }, ref) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [expandedSection, setExpandedSection] = useState(null);

  // Snap points for the bottom sheet
  const snapPoints = useMemo(() => ["80%"], []);

  // Backdrop component
  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.5}
      />
    ),
    [],
  );

  // Handle sheet changes
  const handleSheetChanges = useCallback(
    (index) => {
      if (index === -1) {
        onClose?.();
      }
    },
    [onClose],
  );

  // Navigation links
  const storeLinks = [
    { name: "Home", icon: Home, route: "/(tabs)" },
    { name: "About Us", icon: Info, route: "/about" },
    { name: "Contact Us", icon: Phone, route: "/contact" },
    { name: "Our Stores", icon: Store, route: "/stores" },
  ];

  const helpLinks = [
    { name: "Track Your Order", icon: Package, route: "/order-tracking" },
    { name: "Bulk Orders", icon: ShoppingBag, route: "/bulk-order" },
    { name: "FAQ", icon: HelpCircle, route: "/faq" },
  ];

  const policyLinks = [
    { name: "Terms & Conditions", icon: FileText, route: "/policy/terms" },
    { name: "Privacy Policy", icon: Shield, route: "/policy/privacy" },
    { name: "Refund Policy", icon: FileText, route: "/policy/refund" },
    { name: "Shipping Policy", icon: Truck, route: "/policy/shipping" },
  ];

  // Contact information
  const contactInfo = {
    phone: "+91 98765 43210",
    email: "info@anandmobiles.com",
    whatsapp: "919876543210",
  };

  // Social links
  const socialLinks = [
    {
      name: "Instagram",
      icon: Instagram,
      url: "https://instagram.com",
      color: "#E4405F",
    },
    {
      name: "Facebook",
      icon: Facebook,
      url: "https://facebook.com",
      color: "#1877F2",
    },
    {
      name: "Twitter",
      icon: Twitter,
      url: "https://twitter.com",
      color: "#1DA1F2",
    },
    {
      name: "YouTube",
      icon: Youtube,
      url: "https://youtube.com",
      color: "#FF0000",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      url: "https://linkedin.com",
      color: "#0A66C2",
    },
  ];

  // Sections configuration
  const sections = [
    { id: "store", title: "Store", links: storeLinks },
    { id: "help", title: "Help", links: helpLinks },
    { id: "policies", title: "Policies", links: policyLinks },
    { id: "connect", title: "Connect With Us", type: "social" },
    { id: "contact", title: "Contact", type: "contact" },
  ];

  const toggleSection = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  const handleLinkPress = (route) => {
    ref.current?.close();
    // Small delay to allow sheet to close before navigation
    setTimeout(() => {
      router.push(route);
    }, 200);
  };

  const handleExternalLink = (url) => {
    Linking.openURL(url);
  };

  const handlePhoneCall = () => {
    Linking.openURL(`tel:${contactInfo.phone}`);
  };

  const handleEmail = () => {
    Linking.openURL(`mailto:${contactInfo.email}`);
  };

  const handleWhatsApp = () => {
    const url =
      Platform.OS === "ios"
        ? `whatsapp://send?phone=${contactInfo.whatsapp}`
        : `whatsapp://send?phone=${contactInfo.whatsapp}`;
    Linking.openURL(url).catch(() => {
      // If WhatsApp is not installed, open in browser
      Linking.openURL(`https://wa.me/${contactInfo.whatsapp}`);
    });
  };

  const renderSectionHeader = (section) => (
    <TouchableOpacity
      onPress={() => toggleSection(section.id)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor:
          expandedSection === section.id
            ? colors.backgroundSecondary
            : "transparent",
      }}
      activeOpacity={0.7}
    >
      <Text
        style={{
          fontSize: 17,
          fontWeight: "600",
          color: colors.text,
        }}
      >
        {section.title}
      </Text>
      {expandedSection === section.id ? (
        <ChevronUp size={20} color={colors.textSecondary} />
      ) : (
        <ChevronDown size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const renderLinks = (links) => (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 12,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      {links.map((link, index) => {
        const IconComponent = link.icon;
        return (
          <TouchableOpacity
            key={index}
            onPress={() => handleLinkPress(link.route)}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 12,
              paddingHorizontal: 12,
              marginBottom: 4,
              borderRadius: 10,
              backgroundColor: colors.surface,
            }}
            activeOpacity={0.7}
          >
            <IconComponent size={20} color={colors.primary} />
            <Text
              style={{
                fontSize: 15,
                color: colors.textSecondary,
                marginLeft: 12,
                fontWeight: "500",
              }}
            >
              {link.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const renderSocialLinks = () => (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      <Text
        style={{
          fontSize: 14,
          color: colors.textSecondary,
          marginBottom: 12,
        }}
      >
        Follow us on social media
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {socialLinks.map((social, index) => {
          const IconComponent = social.icon;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => handleExternalLink(social.url)}
              style={{
                width: 48,
                height: 48,
                borderRadius: 24,
                backgroundColor: social.color,
                justifyContent: "center",
                alignItems: "center",
              }}
              activeOpacity={0.7}
            >
              <IconComponent size={22} color="#FFFFFF" />
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderContactSection = () => (
    <View
      style={{
        paddingHorizontal: 20,
        paddingBottom: 16,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      {/* WhatsApp */}
      <TouchableOpacity
        onPress={handleWhatsApp}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: "#25D366",
        }}
        activeOpacity={0.8}
      >
        <MessageCircle size={22} color="#FFFFFF" />
        <Text
          style={{
            fontSize: 15,
            color: "#FFFFFF",
            marginLeft: 12,
            fontWeight: "600",
          }}
        >
          WhatsApp Business
        </Text>
      </TouchableOpacity>

      {/* Phone */}
      <TouchableOpacity
        onPress={handlePhoneCall}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          marginBottom: 8,
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <Phone size={22} color={colors.primary} />
        <Text
          style={{
            fontSize: 15,
            color: colors.text,
            marginLeft: 12,
            fontWeight: "500",
          }}
        >
          {contactInfo.phone}
        </Text>
      </TouchableOpacity>

      {/* Email */}
      <TouchableOpacity
        onPress={handleEmail}
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingVertical: 14,
          paddingHorizontal: 16,
          borderRadius: 12,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <Mail size={22} color={colors.primary} />
        <Text
          style={{
            fontSize: 15,
            color: colors.text,
            marginLeft: 12,
            fontWeight: "500",
          }}
        >
          {contactInfo.email}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <BottomSheet
      ref={ref}
      index={-1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      backdropComponent={renderBackdrop}
      enablePanDownToClose={true}
      backgroundStyle={{
        backgroundColor: colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
      }}
      handleIndicatorStyle={{
        backgroundColor: colors.textSecondary,
        width: 40,
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        }}
      >
        <Text
          style={{
            fontSize: 22,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          More
        </Text>
        <TouchableOpacity
          onPress={() => ref.current?.close()}
          style={{
            padding: 8,
            borderRadius: 20,
            backgroundColor: colors.backgroundSecondary,
          }}
          activeOpacity={0.7}
        >
          <X size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <BottomSheetScrollView
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {sections.map((section) => (
          <View
            key={section.id}
            style={{
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            {renderSectionHeader(section)}
            {expandedSection === section.id && (
              <>
                {section.type === "social" && renderSocialLinks()}
                {section.type === "contact" && renderContactSection()}
                {section.links && renderLinks(section.links)}
              </>
            )}
          </View>
        ))}
      </BottomSheetScrollView>
    </BottomSheet>
  );
});

MoreBottomSheet.displayName = "MoreBottomSheet";

export default MoreBottomSheet;
