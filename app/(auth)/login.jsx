import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import { useTheme } from "../../store/useTheme";
import { useAuthStore } from "../../store/useAuth";

WebBrowser.maybeCompleteAuthSession();

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

  // Google Auth Request
  const [request, response, promptAsync] = Google.useAuthRequest({
    // TODO: Replace with your actual Client IDs from Google Cloud Console
    androidClientId: "YOUR_ANDROID_CLIENT_ID",
    iosClientId: "YOUR_IOS_CLIENT_ID",
    webClientId: "YOUR_WEB_CLIENT_ID",
  });

  useEffect(() => {
    if (response?.type === "success") {
      const { id_token } = response.params;
      handleGoogleLogin(id_token);
    }
  }, [response]);

  const handleGoogleLogin = async (idToken) => {
    setLocalLoading(true);
    try {
      // Fetch user info from Google to pass to backend (optional, but good for first signup)
      const userInfoResponse = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: {
            Authorization: `Bearer ${response.authentication.accessToken}`,
          },
        }
      );
      const googleUser = await userInfoResponse.json();

      await googleLogin(idToken, googleUser);
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert("Google Login Failed", err.message);
    } finally {
      setLocalLoading(false);
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

        <CustomButton
          title="Google"
          onPress={() => promptAsync()}
          variant="outline"
          icon={
            <Text
              className="font-bold text-lg mr-2"
              style={{ color: "#DB4437" }}
            >
              G
            </Text>
          }
          disabled={!request}
        />

        <View className="flex-row justify-center mt-8">
          <Text style={{ color: colors.textSecondary }}>
            Don't have an account?{" "}
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
