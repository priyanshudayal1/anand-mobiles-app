import { View, Text, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { useAuthStore } from "../../store/useAuth";
import { useTheme } from "../../store/useTheme";

export default function GoogleSignInScreen() {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const { googleLogin } = useAuthStore();

  const handleGoogleSuccess = async (firebaseToken, googleUser) => {
    try {
      const result = await googleLogin(firebaseToken, googleUser);
      if (result.success) {
        router.replace("/(tabs)");
      } else if (result.redirect_to_signup) {
        // User doesn't exist — auto-signup with Google
        const { googleSignup } = useAuthStore.getState();
        const signupResult = await googleSignup(firebaseToken, googleUser);
        if (signupResult.success) {
          Alert.alert("Welcome!", "Account created successfully with Google!");
          router.replace("/(tabs)");
        }
      }
    } catch (err) {
      Alert.alert(
        "Google Login Failed",
        err.response?.data?.error || err.message || "Something went wrong",
      );
    }
  };

  const handleGoogleError = (error) => {
    console.error("Google Sign-In error:", error);
    Alert.alert(
      "Sign-In Error",
      error.message || "Something went wrong with Google Sign-In",
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors?.background || "#fff" }}
    >
      <View className="flex-1 px-6 justify-center">
        <View className="mb-8">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: colors?.text || "#111" }}
          >
            Sign in with Google
          </Text>
          <Text
            className="text-base"
            style={{ color: colors?.textSecondary || "#666" }}
          >
            Continue with your Google account to get started
          </Text>
        </View>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleError}
          mode="login"
        />

        <View className="mt-6">
          <Text
            className="text-center text-sm"
            style={{ color: colors?.textSecondary || "#999" }}
          >
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
