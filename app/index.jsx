import { useEffect, useState } from "react";
import { Redirect } from "expo-router";
import { useAuthStore } from "../store/useAuth";
import { useSiteConfig } from "../store/useSiteConfig";
import AnimatedLoader from "../components/common/AnimatedLoader";

export default function Index() {
  const { isAuthenticated } = useAuthStore();
  const { fetchSiteConfig, isInitialized } = useSiteConfig();
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
    return <AnimatedLoader />;
  }

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
