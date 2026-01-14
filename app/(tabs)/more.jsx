import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from "../../store/useTheme";

// This screen is a placeholder - the "More" tab opens a bottom sheet
// If someone navigates here directly, redirect them to home
export default function More() {
  const router = useRouter();
  const { colors } = useTheme();

  useEffect(() => {
    // Redirect to home since More tab opens a bottom sheet
    router.replace("/(tabs)");
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
      }}
    >
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}
