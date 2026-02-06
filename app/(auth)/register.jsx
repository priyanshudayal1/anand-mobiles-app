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

const Register = () => {
  const router = useRouter();
  const { colors, mode } = useTheme();
  const {
    register,
    googleLogin,
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
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google Auth Request - Firebase OAuth with native Android client
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // Web client ID (for fallback)
    clientId:
      "403268549781-6c4gvnrgol3v8mf81bj025mc8fs04nkh.apps.googleusercontent.com",
    // Android OAuth client ID (configured with SHA-1 fingerprint)
    androidClientId:
      "403268549781-ap66ler0ic5vua4dle16pikm1suqec15.apps.googleusercontent.com",
    // iOS client ID - update after creating iOS OAuth client
    iosClientId:
      "403268549781-mi92udu70ovm0f861ilks4kks6r2bvra.apps.googleusercontent.com",
  });

  const handleGoogleSignup = useCallback(
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
        // The backend will either create new user or login existing
        await googleLogin(firebaseIdToken);
        router.replace("/(tabs)");
      } catch (err) {
        console.error("Google Signup Error:", err);
        Alert.alert(
          "Google Signup Failed",
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
        handleGoogleSignup(id_token);
      }
    } else if (response?.type === "error") {
      Alert.alert(
        "Google Sign Up Error",
        response.error?.message || "Something went wrong",
      );
      setGoogleLoading(false);
    }
  }, [response, handleGoogleSignup]);

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

        {/* Google Sign Up Button */}
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
            marginBottom: 16,
          }}
        >
          <GoogleIcon />
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: "600" }}>
            {googleLoading ? "Signing up..." : "Continue with Google"}
          </Text>
        </TouchableOpacity>

        <View className="flex-row items-center mb-4">
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
          <Text
            style={{
              color: colors.textSecondary,
              paddingHorizontal: 16,
              fontSize: 14,
            }}
          >
            Or sign up with email
          </Text>
          <View
            style={{ flex: 1, height: 1, backgroundColor: colors.border }}
          />
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

        <View className="mt-4 mb-8">
          <CustomButton
            title="Create Account"
            onPress={handleRegister}
            isLoading={localLoading || authLoading}
            size="lg"
          />
        </View>

        <View className="flex-row justify-center mb-6">
          <Text style={{ color: colors.textSecondary }}>
            Already have an account?{" "}
          </Text>
          <Link href="/login" asChild>
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
