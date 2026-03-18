import React, { useState, useEffect, useCallback } from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Image,
  Platform,
} from "react-native";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../../services/firebaseConfig";
import Constants from "expo-constants";

const GOOGLE_ICON = require("../../assets/images/google_icon.png");

// CRITICAL: Must be called at module level for auth redirect to complete
WebBrowser.maybeCompleteAuthSession();

// Import native Google Sign-In for production builds
let GoogleSignin = null;
let statusCodes = null;
try {
  const nativeModule = require("@react-native-google-signin/google-signin");
  GoogleSignin = nativeModule.GoogleSignin;
  statusCodes = nativeModule.statusCodes;
} catch (e) {
  console.log(
    "Native Google Sign-In not available (expected in Expo Go):",
    e.message,
  );
}

// Google logo loaded from local asset for consistency across auth screens
const GoogleLogo = () => (
  <Image
    source={GOOGLE_ICON}
    style={{ width: 20, height: 20, marginRight: 10 }}
  />
);

/**
 * Unified Google Authentication Button
 * - Uses expo-auth-session for Expo Go (development)
 * - Uses native @react-native-google-signin for production builds
 */
export default function GoogleAuthButton({
  onSuccess,
  onError,
  mode = "login",
}) {
  const [loading, setLoading] = useState(false);
  // Initial check for environment (synchronous)
  const isExpoGo = Constants.appOwnership === "expo";

  // If native Google Sign-In module isn't available, we must use the web/proxy flow
  // This covers both Expo Go AND dev builds without native module linked
  const useWebFlow = isExpoGo || !GoogleSignin;
  const expoOwner = Constants.expoConfig?.owner;
  const expoSlug = Constants.expoConfig?.slug;

  // When using web flow (no native module), we MUST use the Expo auth proxy
  // because Google rejects custom scheme redirects for Web client types,
  // and Android/iOS client IDs don't work with browser-based OAuth
  const redirectUri = useWebFlow
    ? expoOwner && expoSlug
      ? `https://auth.expo.io/@${expoOwner}/${expoSlug}`
      : "https://auth.expo.io/@priyanshudayal1/anand-mobiles"
    : makeRedirectUri({
        scheme: "anandmobiles",
        path: "auth",
      });

  // Warm up browser on Android for faster auth
  useEffect(() => {
    if (Platform.OS === "android") {
      WebBrowser.warmUpAsync();
      return () => {
        WebBrowser.coolDownAsync();
      };
    }
  }, []);

  // Debug logging on mount
  useEffect(() => {
    console.log("=== GOOGLE AUTH BUTTON MOUNT ===");
    console.log("Environment:", {
      appOwnership: Constants.appOwnership,
      isExpoGo,
      redirectUri,
      nativeModuleAvailable: !!GoogleSignin,
      platform: Platform.OS,
    });
  }, [isExpoGo, useWebFlow, redirectUri]);

  // Web client ID, native client IDs, and request config defined below
  // Web client ID (client_type: 3) — works with browser-based OAuth + Expo proxy
  const WEB_CLIENT_ID =
    "403268549781-6c4gvnrgol3v8mf81bj025mc8fs04nkh.apps.googleusercontent.com";
  // Native client IDs — only work with native Google Sign-In (SHA-1 verified)
  const ANDROID_CLIENT_ID =
    "403268549781-lg7ddkoljh60t54vkfbm4dbd51u5lld6.apps.googleusercontent.com";
  const IOS_CLIENT_ID =
    "403268549781-lmnfnklpa9bqs0s3hu2favqen86h8acd.apps.googleusercontent.com";

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // When using web flow (no native module), use Web client ID for all platforms
    // Web client ID accepts https:// redirect URIs (Expo auth proxy)
    clientId: useWebFlow ? WEB_CLIENT_ID : undefined,
    androidClientId: useWebFlow ? WEB_CLIENT_ID : ANDROID_CLIENT_ID,
    iosClientId: useWebFlow ? WEB_CLIENT_ID : IOS_CLIENT_ID,
    redirectUri,
    scopes: ["profile", "email", "openid"],
  });

  // Log request state changes
  useEffect(() => {
    console.log("=== AUTH REQUEST STATE ===");
    console.log("Request ready:", !!request);
    if (request) {
      console.log("Request URL:", request.url);
      console.log(
        "Request codeVerifier:",
        request.codeVerifier ? "present" : "missing",
      );
      console.log("Request state:", request.state);
    }
  }, [request]);

  // Detect environment changes (for side effects if needed)
  useEffect(() => {
    const checkEnvironment = () => {
      // Configure native Google Sign-In for production if not in Expo Go and module is available
      if (!useWebFlow && GoogleSignin) {
        try {
          GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID, // Must be Web client ID for Firebase token exchange
          });
          console.log("Native Google Sign-In configured successfully");
        } catch (error) {
          console.log("Native Google Sign-In configuration failed:", error);
          // Fallback to Expo auth is handled by isExpoGo check above,
          // but we might want to state var if dynamic detection needed
        }
      }
    };

    checkEnvironment();
  }, [useWebFlow]);

  // Handle expo-auth-session response
  const handleExpoAuth = useCallback(
    async (idToken) => {
      console.log("=== HANDLE EXPO AUTH CALLED ===");
      console.log(
        "ID Token received:",
        idToken ? `${idToken.substring(0, 50)}...` : "NULL",
      );

      try {
        setLoading(true);
        console.log("Creating Firebase credential...");
        const credential = GoogleAuthProvider.credential(idToken);
        console.log("Credential created, signing in with Firebase...");

        const result = await signInWithCredential(auth, credential);
        console.log("Firebase sign-in successful!");
        console.log("User:", result.user.email);

        const firebaseToken = await result.user.getIdToken();
        console.log(
          "Firebase token obtained:",
          firebaseToken ? `${firebaseToken.substring(0, 50)}...` : "NULL",
        );

        if (onSuccess) {
          console.log("Calling onSuccess callback...");
          await onSuccess(firebaseToken, result.user);
          console.log("onSuccess callback completed");
        }
      } catch (error) {
        console.error("=== EXPO GOOGLE AUTH ERROR ===");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error code:", error.code);
        console.error("Full error:", JSON.stringify(error, null, 2));
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [onSuccess, onError],
  );

  // Monitor response from Google OAuth
  useEffect(() => {
    console.log("=== AUTH RESPONSE CHANGED ===");
    console.log("Response:", JSON.stringify(response, null, 2));

    if (!response) {
      console.log("No response yet (initial state)");
      return;
    }

    console.log("Response type:", response.type);

    if (response.type === "success") {
      console.log("=== SUCCESS RESPONSE ===");
      console.log("Params:", JSON.stringify(response.params, null, 2));
      const { id_token } = response.params;
      if (id_token) {
        console.log("id_token found, calling handleExpoAuth...");
        handleExpoAuth(id_token);
      } else {
        console.error("ERROR: No id_token in response.params!");
        console.log("Available params:", Object.keys(response.params || {}));
      }
    } else if (response.type === "error") {
      console.error("=== ERROR RESPONSE ===");
      console.error("Error:", response.error);
      console.error("Error description:", response.errorDescription);
      console.error("Params:", JSON.stringify(response.params, null, 2));
      if (onError) {
        onError(
          new Error(
            response.error?.message ||
              response.errorDescription ||
              "Google Sign-In failed",
          ),
        );
      }
    } else if (response.type === "cancel") {
      console.log("=== USER CANCELLED ===");
    } else if (response.type === "dismiss") {
      console.log("=== DISMISSED ===");
    } else {
      console.log("Unknown response type:", response.type);
    }
  }, [response, handleExpoAuth, onError]);

  // Native Google Sign-In (Production)
  const handleNativeGoogleSignIn = async () => {
    if (!GoogleSignin) {
      console.error("Native Google Sign-In module not available");
      if (onError) {
        onError(
          new Error(
            "Native Google Sign-In is not available. Please use Expo Go for development.",
          ),
        );
      }
      return;
    }

    try {
      setLoading(true);

      // Check if device supports Google Play Services
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });

      // Sign in - Note: In v16+, signIn() returns { data: { idToken, user } } structure
      const signInResult = await GoogleSignin.signIn();

      // Handle different API response structures (v15 vs v16+)
      let idToken;
      if (signInResult.data) {
        // v16+ API: { data: { idToken, user } }
        idToken = signInResult.data.idToken;
      } else if (signInResult.idToken) {
        // v15 and older: { idToken, user }
        idToken = signInResult.idToken;
      } else {
        throw new Error("Failed to get ID token from Google Sign-In");
      }

      // Get Firebase credential
      const credential = GoogleAuthProvider.credential(idToken);

      // Sign in to Firebase
      const result = await signInWithCredential(auth, credential);
      const firebaseToken = await result.user.getIdToken();

      if (onSuccess) {
        await onSuccess(firebaseToken, result.user);
      }
    } catch (error) {
      console.error("Native Google Sign-In Error:", error);

      // Handle specific error codes for better UX
      if (statusCodes) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) {
          console.log("User cancelled the sign-in flow");
          // Don't call onError for user cancellation
          setLoading(false);
          return;
        } else if (error.code === statusCodes.IN_PROGRESS) {
          console.log("Sign-in is already in progress");
          setLoading(false);
          return;
        } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
          if (onError) {
            onError(
              new Error(
                "Google Play Services is not available. Please update or install it.",
              ),
            );
          }
          setLoading(false);
          return;
        }
      }

      if (onError) {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // Main handler - chooses between native and expo auth
  const handlePress = async () => {
    console.log("=== GOOGLE SIGN-IN BUTTON PRESSED ===");
    console.log("useWebFlow:", useWebFlow);
    console.log("GoogleSignin available:", !!GoogleSignin);
    console.log("Request ready:", !!request);

    // Use Expo auth-session for Expo Go OR if native module isn't available
    if (useWebFlow) {
      // Use expo-auth-session (Browser OAuth)
      console.log("Using Expo Auth Session for Google Sign-In");
      console.log("Redirect URI:", redirectUri);

      if (!request) {
        console.error("ERROR: Request object is not ready!");
        return;
      }

      try {
        console.log("Calling promptAsync()...");
        const result = await promptAsync();
        console.log("promptAsync() returned:", JSON.stringify(result, null, 2));
      } catch (error) {
        console.error("promptAsync() threw an error:", error);
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        if (onError) {
          onError(error);
        }
      }
    } else {
      // Use native Google Sign-In
      console.log("Using Native Google Sign-In");
      await handleNativeGoogleSignIn();
    }
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={loading || (useWebFlow && !request)}
      className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center active:opacity-70"
      style={{ opacity: loading || (useWebFlow && !request) ? 0.5 : 1 }}
    >
      {loading ? (
        <ActivityIndicator size="small" color="#4285F4" />
      ) : (
        <>
          <GoogleLogo />
          <Text className="text-gray-700 text-base font-semibold">
            {mode === "login" ? "Continue" : "Sign up"} with Google
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
