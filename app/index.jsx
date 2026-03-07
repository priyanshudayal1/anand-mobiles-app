import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { Redirect } from "expo-router";
import { Image } from "expo-image";
import { useAuthStore } from "../store/useAuth";
import { useSiteConfig } from "../store/useSiteConfig";
import { useTheme } from "../store/useTheme";

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { logoUrl, shopName, fetchSiteConfig, isInitialized } = useSiteConfig();
  const { colors } = useTheme();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!isInitialized) {
        await fetchSiteConfig();
      }
      // Small delay to show splash screen
      setTimeout(() => setIsReady(true), 1000);
    };
    init();
  }, []);

  // Show splash screen while loading
  if (!isReady) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.primary,
        }}
      >
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={{ width: 120, height: 120, marginBottom: 24 }}
            contentFit="contain"
          />
        ) : null}
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
