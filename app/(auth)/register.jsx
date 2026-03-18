import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
} from "react-native";
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

// step: 'form' | 'otp' | 'reward'
const Register = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    register,
    googleLogin,
    googleSignup,
    sendOtp,
    verifyOtp,
    finalizeAuth,
    error: authError,
    isLoading: authLoading,
  } = useAuthStore();
  const { fetchGamificationStatus, fetchWallet } = useGamification();

  const [step, setStep] = useState("form");
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

  // OTP state
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef([]);
  const resendTimerRef = useRef(null);

  // Reward state
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [postSignupCanSpin, setPostSignupCanSpin] = useState(true);
  const [signupRewardMessage, setSignupRewardMessage] = useState("");

  const startResendCooldown = () => {
    setResendCooldown(60);
    resendTimerRef.current = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

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

    setStep("reward");
  };

  const handleContinueAfterSignup = () => {
    finalizeAuth();
    router.replace("/(tabs)");
  };

  const handleGoogleSignup = async (firebaseToken, googleUser) => {
    try {
      const result = await googleLogin(firebaseToken, googleUser);
      if (result.success) {
        finalizeAuth();
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

  const handleSendOtp = async () => {
    if (!validate()) return;

    setLocalLoading(true);
    try {
      await sendOtp(formData.email, `${formData.firstName} ${formData.lastName}`);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      setStep("otp");
      startResendCooldown();
    } catch (err) {
      Alert.alert(
        "Failed to Send OTP",
        err.response?.data?.error || err.message || "Something went wrong",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLocalLoading(true);
    try {
      await sendOtp(formData.email, `${formData.firstName} ${formData.lastName}`);
      setOtp(["", "", "", "", "", ""]);
      setOtpError("");
      startResendCooldown();
    } catch (err) {
      Alert.alert(
        "Failed to Resend OTP",
        err.response?.data?.error || err.message || "Something went wrong",
      );
    } finally {
      setLocalLoading(false);
    }
  };

  const handleOtpChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, "").slice(-1);
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);
    setOtpError("");
    if (cleaned && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpCode = otp.join("");
    if (otpCode.length < 6) {
      setOtpError("Please enter the 6-digit code sent to your email");
      return;
    }

    setLocalLoading(true);
    try {
      await verifyOtp(formData.email, otpCode);
      // OTP verified — now create the account
      await register(formData);
      await preparePostSignupReward(
        "Your account has been created. Take your welcome spin right on this register screen.",
      );
    } catch (err) {
      setOtpError(
        err.response?.data?.error || err.message || "Invalid or expired OTP",
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
        keyboardShouldPersistTaps="handled"
      >
        <FadeInView delay={0} duration={500}>
          <View className="mb-6 mt-4">
            <Text
              className="text-3xl font-bold mb-2"
              style={{ color: colors.primary }}
            >
              {step === "otp" ? "Verify Email" : "Create Account"}
            </Text>
            <Text className="text-base" style={{ color: colors.textSecondary }}>
              {step === "form" && "Join us to start shopping"}
              {step === "otp" &&
                `Enter the 6-digit code sent to ${formData.email}`}
              {step === "reward" &&
                "Your account is ready. Claim your welcome spin before continuing."}
            </Text>
          </View>

          {authError && step === "form" && (
            <View
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: colors.errorLight }}
            >
              <Text style={{ color: colors.error }}>{authError}</Text>
            </View>
          )}
        </FadeInView>

        {/* ── STEP: FORM ── */}
        {step === "form" && (
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
                  Create your account and we&apos;ll offer a spin-wheel reward
                  on this same screen as soon as signup finishes.
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
                  title="Continue"
                  onPress={handleSendOtp}
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

        {/* ── STEP: OTP ── */}
        {step === "otp" && (
          <FadeInView delay={100} duration={500}>
            <View
              className="rounded-3xl p-5 mb-6"
              style={{
                backgroundColor: colors.cardBg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
            >
              {/* OTP boxes */}
              <View className="flex-row justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <TextInput
                    key={index}
                    ref={(ref) => (otpInputRefs.current[index] = ref)}
                    value={digit}
                    onChangeText={(val) => handleOtpChange(val, index)}
                    onKeyPress={(e) => handleOtpKeyPress(e, index)}
                    keyboardType="number-pad"
                    maxLength={1}
                    style={{
                      width: 44,
                      height: 52,
                      borderRadius: 10,
                      borderWidth: digit ? 2 : 1,
                      borderColor: digit ? colors.primary : colors.border,
                      backgroundColor: colors.surface,
                      color: colors.text,
                      fontSize: 22,
                      fontWeight: "bold",
                      textAlign: "center",
                    }}
                  />
                ))}
              </View>

              {otpError ? (
                <Text
                  className="text-center mb-4 text-sm"
                  style={{ color: colors.error }}
                >
                  {otpError}
                </Text>
              ) : null}

              <CustomButton
                title="Verify & Create Account"
                onPress={handleVerifyOtp}
                isLoading={localLoading || authLoading}
                size="lg"
              />

              <View className="flex-row justify-center mt-4">
                <Text style={{ color: colors.textSecondary }}>
                  Didn't receive the code?{" "}
                </Text>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || localLoading}
                >
                  <Text
                    className="font-bold"
                    style={{
                      color:
                        resendCooldown > 0 ? colors.textSecondary : colors.primary,
                    }}
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : "Resend"}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="mt-3"
                onPress={() => setStep("form")}
              >
                <Text
                  className="text-center text-sm"
                  style={{ color: colors.textSecondary }}
                >
                  Change email address
                </Text>
              </TouchableOpacity>
            </View>
          </FadeInView>
        )}

        {/* ── STEP: REWARD ── */}
        {step === "reward" && (
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
