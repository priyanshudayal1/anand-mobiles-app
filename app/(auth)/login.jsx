import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { useTheme } from "../../store/useTheme";
import { useAuthStore } from "../../store/useAuth";

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

        <View className="my-5 flex-row items-center">
          <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
          <Text className="mx-4" style={{ color: colors.textSecondary }}>OR</Text>
          <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
        </View>

        <GoogleAuthButton
          onSuccess={handleGoogleSuccess}
          onError={(error) => {
            console.error("Google auth error:", error);
            Alert.alert(
              "Google Sign-In Error",
              error.message || "Something went wrong",
            );
          }}
          mode="login"
        />

        <View className="flex-row justify-center mt-8">
          <Text style={{ color: colors.textSecondary }}>
            Don&apos;t have an account?{" "}
          </Text>
          <Link href="/(auth)/register" asChild>
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
