import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useTheme } from "../../store/useTheme";
import { useAuthStore } from "../../store/useAuth";

WebBrowser.maybeCompleteAuthSession();

// Google icon SVG as data URI for consistent cross-platform display
const GoogleIcon = () => (
  <Image
    source={{
      uri: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjIuNTYgMTIuMjVjMC0uNzgtLjA3LTEuNTMtLjItMi4yNUgxMnY0LjI2aDUuOTJjLS4yNiAxLjM3LTEuMDQgMi41My0yLjIxIDMuMzF2Mi43N2gzLjU3YzIuMDgtMS45MiAzLjI4LTQuNzQgMy4yOC04LjA5eiIgZmlsbD0iIzQyODVGNCIvPjxwYXRoIGQ9Ik0xMiAyM2MyLjk3IDAgNS40Ni0uOTggNy4yOC0yLjY2bC0zLjU3LTIuNzdjLS45OC42Ni0yLjIzIDEuMDYtMy43MSAxLjA2LTIuODYgMC01LjI5LTEuOTMtNi4xNi00LjUzSDIuMTh2Mi44NEMzLjk5IDIwLjUzIDcuNyAyMyAxMiAyM3oiIGZpbGw9IiMzNEE4NTMiLz48cGF0aCBkPSJNNS44NCAxNC4wOWMtLjIyLS42Ni0uMzUtMS4zNi0uMzUtMi4wOXMuMTMtMS40My4zNS0yLjA5VjcuMDdIMi4xOEMxLjQzIDguNTUgMSAxMC4yMiAxIDEycy40MyAzLjQ1IDEuMTggNC45M2wzLjY2LTIuODR6IiBmaWxsPSIjRkJCQzA1Ii8+PHBhdGggZD0iTTEyIDUuMzhjMS42MiAwIDMuMDYuNTYgNC4yMSAxLjY0bDMuMTUtMy4xNUMxNy40NSAyLjA5IDE0Ljk3IDEgMTIgMSA3LjcgMSAzLjk5IDMuNDcgMi4xOCA3LjA3bDMuNjYgMi44NGMuODctMi42IDMuMy00LjUzIDYuMTYtNC41M3oiIGZpbGw9IiNFQTQzMzUiLz48L3N2Zz4=",
    }}
    style={{ width: 20, height: 20, marginRight: 8 }}
    resizeMode="contain"
  />
);

const Login = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    login,
    googleLogin,
    error: authError,
    isLoading: authLoading,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth Request - using ID token for Firebase
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId:
      "403268549781-6c4gvnrgol3v8mf81bj025mc8fs04nkh.apps.googleusercontent.com",
    androidClientId:
      "403268549781-6c4gvnrgol3v8mf81bj025mc8fs04nkh.apps.googleusercontent.com",
    iosClientId:
      "403268549781-mi92udu70ovm0f861ilks4kks6r2bvra.apps.googleusercontent.com",
  });

  const handleGoogleLogin = useCallback(
    async (idToken) => {
      setGoogleLoading(true);
      try {
        // Sign in with Firebase using Google credential
        const credential = GoogleAuthProvider.credential(idToken);
        const userCredential = await signInWithCredential(auth, credential);
        const firebaseUser = userCredential.user;

        // Get fresh Firebase ID token for backend
        const firebaseIdToken = await firebaseUser.getIdToken();

        // Call store's googleLogin with the Firebase ID token
        await googleLogin(firebaseIdToken);
        router.replace("/(tabs)");
      } catch (err) {
        console.error("Google Login Error:", err);
        Alert.alert(
          "Google Login Failed",
          err.message || "Something went wrong",
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, router],
  );

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      if (id_token) {
        handleGoogleLogin(id_token);
      }
    } else if (response?.type === "error") {
      Alert.alert(
        "Google Sign In Error",
        response.error?.message || "Something went wrong",
      );
      setGoogleLoading(false);
    }
  }, [response, handleGoogleLogin]);

  const handleGooglePress = async () => {
    setGoogleLoading(true);
    try {
      await promptAsync();
    } catch (err) {
      console.error("Google prompt error:", err);
      setGoogleLoading(false);
    }
  };

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    // Relaxed email validation to allow testing
    // else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Email is invalid';
    // }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;

    setLocalLoading(true);
    try {
      await login(formData.email, formData.password);
      router.replace("/(tabs)");
    } catch (err) {
      // Error is handled in store, but we catch here to stop loading or show alert
      Alert.alert("Login Failed", err.response?.data?.error || err.message);
    } finally {
      setLocalLoading(false);
    }
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <StatusBar style={mode === "dark" ? "light" : "dark"} />
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "center",
          padding: 24,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-8">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            Welcome Back
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Sign in to continue shopping
          </Text>
        </View>

        {authError && (
          <View
            className="mb-4 p-3 rounded-lg"
            style={{ backgroundColor: colors.errorLight }}
          >
            <Text style={{ color: colors.error }}>{authError}</Text>
          </View>
        )}

        <CustomInput
          label="Email Address"
          placeholder="you@gmail.com"
          value={formData.email}
          onChangeText={(text) => handleChange("email", text)}
          icon="mail"
          keyboardType="email-address"
          error={errors.email}
          required
        />

        <CustomInput
          label="Password"
          placeholder="••••••••"
          value={formData.password}
          onChangeText={(text) => handleChange("password", text)}
          icon="lock"
          secureTextEntry
          error={errors.password}
          required
        />

        <View className="flex-row justify-end mb-6">
          <TouchableOpacity>
            <Text className="font-medium" style={{ color: colors.primary }}>
              Forgot Password?
            </Text>
          </TouchableOpacity>
        </View>

        <CustomButton
          title="Sign In"
          onPress={handleLogin}
          isLoading={localLoading || authLoading}
          size="lg"
        />

        <View className="flex-row justify-center mt-6 mb-6">
          <Text style={{ color: colors.textSecondary }}>Or continue with</Text>
        </View>

        <TouchableOpacity
          onPress={handleGooglePress}
          disabled={!request || googleLoading}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 14,
            paddingHorizontal: 24,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.border,
            backgroundColor: colors.surface,
            opacity: !request || googleLoading ? 0.6 : 1,
          }}
        >
          <GoogleIcon />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
            {googleLoading ? "Signing in..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row justify-center mt-8">
          <Text style={{ color: colors.textSecondary }}>
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/register" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Sign Up
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Login;
