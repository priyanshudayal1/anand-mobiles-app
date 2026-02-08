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

const Register = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    register,
    googleSignup,
    error: authError,
    isLoading: authLoading,
  } = useAuthStore();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [localLoading, setLocalLoading] = useState(false);

  const handleGoogleSignup = async (firebaseToken, googleUser) => {
    try {
      const result = await googleSignup(firebaseToken, googleUser);
      if (result.success) {
        Alert.alert("Success", "Account created successfully with Google!");
        router.replace("/(tabs)");
      }
    } catch (err) {
      // If user already exists, try login instead
      if (err.response?.status === 409) {
        try {
          const { googleLogin } = useAuthStore.getState();
          const loginResult = await googleLogin(firebaseToken, googleUser);
          if (loginResult.success) {
            router.replace("/(tabs)");
          }
        } catch (loginErr) {
          Alert.alert(
            "Google Sign-Up Failed",
            loginErr.response?.data?.error || loginErr.message,
          );
        }
      } else {
        Alert.alert(
          "Google Sign-Up Failed",
          err.response?.data?.error || err.message || "Something went wrong",
        );
      }
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
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";

    if (!formData.email) {
      newErrors.email = "Email is required";
    }
    // else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    //   newErrors.email = 'Email is invalid';
    // }

    if (!formData.phone) {
      newErrors.phone = "Phone number is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;

    setLocalLoading(true);
    try {
      await register(formData);
      Alert.alert("Success", "Account created successfully!");
      // router.replace('/login'); // Usually auto-login, but based on store logic it might set user immediately
      router.replace("/(tabs)");
    } catch (err) {
      Alert.alert(
        "Registration Failed",
        err.response?.data?.error || err.message,
      );
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
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-6 mt-4">
          <Text
            className="text-3xl font-bold mb-2"
            style={{ color: colors.primary }}
          >
            Create Account
          </Text>
          <Text className="text-base" style={{ color: colors.textSecondary }}>
            Join us to start shopping
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

        <View className="flex-row gap-4">
          <View className="flex-1">
            <CustomInput
              label="First Name"
              value={formData.firstName}
              onChangeText={(text) => handleChange("firstName", text)}
              icon="user"
              error={errors.firstName}
              required
            />
          </View>
          <View className="flex-1">
            <CustomInput
              label="Last Name"
              value={formData.lastName}
              onChangeText={(text) => handleChange("lastName", text)}
              icon="user"
              error={errors.lastName}
              required
            />
          </View>
        </View>

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
          label="Phone Number"
          placeholder="9876543210"
          value={formData.phone}
          onChangeText={(text) => handleChange("phone", text)}
          icon="phone"
          keyboardType="phone-pad"
          error={errors.phone}
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

        <CustomInput
          label="Confirm Password"
          placeholder="••••••••"
          value={formData.confirmPassword}
          onChangeText={(text) => handleChange("confirmPassword", text)}
          icon="lock"
          secureTextEntry
          error={errors.confirmPassword}
          required
        />

        <View className="mt-4 mb-4">
          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            isLoading={localLoading || authLoading}
            size="lg"
          />
        </View>

        <View className="mb-4 flex-row items-center">
          <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
          <Text className="mx-4" style={{ color: colors.textSecondary }}>OR</Text>
          <View className="flex-1 h-[1px]" style={{ backgroundColor: colors.border }} />
        </View>

        <GoogleAuthButton
          onSuccess={handleGoogleSignup}
          onError={(error) => {
            console.error("Google auth error:", error);
            Alert.alert(
              "Google Sign-Up Error",
              error.message || "Something went wrong",
            );
          }}
          mode="signup"
        />

        <View className="flex-row justify-center mt-4 mb-6">
          <Text style={{ color: colors.textSecondary }}>
            Already have an account?{" "}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="font-bold" style={{ color: colors.primary }}>
                Sign In
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Register;
