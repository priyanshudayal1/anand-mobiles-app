import React, { useState } from "react";
import { View, Text, Alert } from "react-native";
import { useRouter } from "expo-router";
import GoogleAuthButton from "../../components/auth/GoogleAuthButton";
import { useAuthStore } from "../../store/authStore";
import { API_BASE_URL } from "../../constants/config";

export default function GoogleSignInScreen() {
    const router = useRouter();
    const { setToken, setUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);

    const handleGoogleSuccess = async (firebaseToken, firebaseUser) => {
        try {
            setIsLoading(true);
            console.log("Google Sign-In successful, sending to backend...");

            // Send Firebase token to your backend for verification and user creation/login
            const response = await fetch(`${API_BASE_URL}/auth/google/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    firebase_token: firebaseToken,
                    email: firebaseUser.email,
                    display_name: firebaseUser.displayName,
                    photo_url: firebaseUser.photoURL,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store the backend token and user data
                setToken(data.token);
                setUser(data.user);

                Alert.alert("Success", "Signed in successfully!");
                router.replace("/(tabs)");
            } else {
                throw new Error(data.error || "Failed to authenticate with backend");
            }
        } catch (error) {
            console.error("Backend authentication error:", error);
            Alert.alert(
                "Authentication Error",
                error.message || "Failed to complete sign-in. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleError = (error) => {
        console.error("Google Sign-In error:", error);
        Alert.alert(
            "Sign-In Failed",
            error.message || "Failed to sign in with Google. Please try again."
        );
    };

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                    Sign in with Google
                </Text>
                <Text className="text-gray-600 text-base">
                    Continue with your Google account to get started
                </Text>
            </View>

            <GoogleAuthButton
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                mode="login"
            />

            <View className="mt-6">
                <Text className="text-center text-gray-500 text-sm">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </View>
    );
}
