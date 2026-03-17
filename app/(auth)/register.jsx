import React, { useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { StatusBar } from "expo-status-bar";
import CustomInput from "../../components/CustomInput";
import CustomButton from "../../components/CustomButton";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import SpinWheel from "../../components/gamification/SpinWheel";
import { useTheme } from "../../store/useTheme";
import { useAuthStore } from "../../store/useAuth";
import { useGamification } from "../../store/useGamification";
import {
  FadeInView,
  SlideInView,
} from "../../components/common/AnimationWrappers";

const Register = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    register,
    googleLogin,
    googleSignup,
    error: authError,
    isLoading: authLoading,
  } = useAuthStore();
  const { fetchGamificationStatus, fetchWallet } = useGamification();

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
  const [showPostSignupReward, setShowPostSignupReward] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [postSignupCanSpin, setPostSignupCanSpin] = useState(true);
  const [signupRewardMessage, setSignupRewardMessage] = useState("");

  const preparePostSignupReward = async (message) => {
    setSignupRewardMessage(message);

    const [statusResult] = await Promise.allSettled([
      fetchGamificationStatus(),
      fetchWallet(),
    ]);

    if (statusResult.status === "fulfilled") {
      setPostSignupCanSpin(
        statusResult.value?.data?.daily_spin_available ?? true,
      );
    } else {
      setPostSignupCanSpin(true);
    }

    setShowPostSignupReward(true);
  };

  const handleContinueAfterSignup = () => {
    setShowPostSignupReward(false);
    router.replace("/(tabs)");
  };

  const handleGoogleSignup = async (firebaseToken, googleUser) => {
    try {
      const result = await googleLogin(firebaseToken, googleUser);
      if (result.success) {
        router.replace("/(tabs)");
      } else if (result.redirect_to_signup) {
        const signupResult = await googleSignup(firebaseToken, googleUser);
        if (signupResult.success) {
          await preparePostSignupReward(
            "Your Google account is ready. Spin the reward wheel before you enter the app.",
          );
        }
      }
    } catch (err) {
      Alert.alert(
        "Google Sign-Up Failed",
        err.message || "Something went wrong",
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
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    }

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
      await preparePostSignupReward(
        "Your account has been created. Take your welcome spin right on this register screen.",
      );
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
        <FadeInView delay={0} duration={500}>
          <View className="mb-6 mt-4">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary }}
            >
              Create Account
            </Text>
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              {showPostSignupReward
                ? "Your account is ready. Claim your welcome spin before continuing."
                : "Join us to start shopping"}
            </Text>
          </View>

          {authError && !showPostSignupReward && (
            <View
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.errorLight }}
            >
              <Text style={{ color: colors.error }}>{authError}</Text>
            </View>
          )}
        </FadeInView>

        {showPostSignupReward ? (
          <FadeInView delay={150} duration={500}>
            <View
              className="rounded-3xl p-5 mb-6"
              style={{
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-2xl font-bold text-center"
                style={{ color: colors.primary }}
              >
                Account Created
              </Text>
              <Text
                className="text-center mt-3 leading-6"
                style={{ color: colors.textSecondary }}
              >
                {signupRewardMessage}
              </Text>

              <View
                className="mt-4 p-4 rounded-2xl"
                style={{ backgroundColor: colors.warningLight }}
              >
                <Text
                  className="text-center font-semibold"
                  style={{ color: colors.accent }}
                >
                  New users can spin the reward wheel right here before opening
                  the app.
                </Text>
              </View>

              <View className="mt-5 gap-3">
                <CustomButton
                  title={
                    postSignupCanSpin ? "Spin The Wheel" : "Open Reward Wheel"
                  }
                  onPress={() => setShowSpinWheel(true)}
                  size="lg"
                />
                <CustomButton
                  title="Continue To App"
                  onPress={handleContinueAfterSignup}
                  size="lg"
                  variant="outline"
                />
              </View>
            </View>
          </FadeInView>
        ) : (
          <>
            <SlideInView delay={150} duration={500}>
              <View
                className="mb-4 p-4 rounded-2xl"
                style={{
                  backgroundColor: colors.cardBg,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <Text
                  className="text-center"
                  style={{ color: colors.textSecondary }}
                >
                  Create your account and we&apos;ll offer a spin-wheel reward on
                  this same screen as soon as signup finishes.
                </Text>
              </View>

              <View className="flex-row gap-4">
                <View className="flex-1">
                  <CustomInput
                    label="First Name"
                    value={formData.firstName}
                    onChangeText={(text) => handleChange("firstName", text)}
                    icon="user"
                    error={errors.firstName}
                    required
                    textContentType="givenName"
                    autoComplete="name-given"
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
                    textContentType="familyName"
                    autoComplete="name-family"
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
                textContentType="emailAddress"
                autoComplete="email"
                autoCapitalize="none"
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
                textContentType="telephoneNumber"
                autoComplete="tel"
              />

              <CustomInput
                label="Password"
                placeholder="********"
                value={formData.password}
                onChangeText={(text) => handleChange("password", text)}
                icon="lock"
                secureTextEntry
                error={errors.password}
                required
                textContentType="password"
              />

              <CustomInput
                label="Confirm Password"
                placeholder="********"
                value={formData.confirmPassword}
                onChangeText={(text) =>
                  handleChange("confirmPassword", text)
                }
                icon="lock"
                secureTextEntry
                error={errors.confirmPassword}
                required
                textContentType="password"
              />

              <View className="mt-4 mb-4">
                <CustomButton
                  title="Create Account"
                  onPress={handleRegister}
                  isLoading={localLoading || authLoading}
                  size="lg"
                />
              </View>
            </SlideInView>

            <FadeInView delay={350} duration={500}>
              <View className="mb-4 flex-row items-center">
                <View
                  className="flex-1 h-[1px]"
                  style={{ backgroundColor: colors.border }}
                />
                <Text className="mx-4" style={{ color: colors.textSecondary }}>
                  OR
                </Text>
                <View
                  className="flex-1 h-[1px]"
                  style={{ backgroundColor: colors.border }}
                />
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
                    <Text
                      className="font-bold"
                      style={{ color: colors.primary }}
                    >
                      Sign In
                    </Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </FadeInView>
          </>
        )}
      </ScrollView>

      <SpinWheel
        visible={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        canSpin={postSignupCanSpin}
        onSpinComplete={() => {
          setPostSignupCanSpin(false);
          setSignupRewardMessage(
            "Your reward has been claimed. Continue into the app whenever you're ready.",
          );
        }}
      />
    </SafeAreaView>
  );
};

export default Register;
