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

// Google logo component using base64 encoded PNG
const GoogleLogo = () => (
  <Image
    source={{
      uri: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAArNJREFUaEPtmWtI01EUx//nUqZtQj4k04iCSPSIhIqgD9EPUgSGRoZGFGVaGmVGGmV92Qc9KDQjA6NB9KUEgxCjPqRFkRRaCCYqlZm7OXH+c3fD3dZt5+52f9jDOef/P+f/3HPvOZcCg8EwE4Z5hRGsCawJrAmE2ATCo/b/w5E498f3H9E1cB9dvQO409KJq9c6kXn2MlLSM2C328OiD6E2ImwHtrR2oO9uN+pbO5B37hISk1NgsVjCpj9hM+A/6x9A5512VDecR8GZy0hKTjE+A2E14D/r6Z/AzWvtqG44h4KzV5CYfNq4DITNgP+sd3AANa2XUHW+FfnnLhuPgTAb8J/1DAbQcLkDlWdbkH/uMtLSTxuLgbAZUDC9Q/2obL6A8rOtKDh/GampGcFjIKwGfO/wHxpF5ZkLyD9/FWlpZ4PHQFgN+N7BPtS2XkLluRaUn7uC9LTM4DEQVgO+d3AAtVcuovLMReSfu4r09GzDMRBWA753qB83rrah8kwL8s9dMhwDYTXgewf7cO1KB6rOtCD//BXDMxBWA753qA/Xt15C1ZkWlJ+7YmgGwmrA9w71obbtMqrOtqDCNwPhcMAndw8O4GZLJy77ZqC84goyM7OMz0DIE7BP9g30o6m1E5VnW1BRWQ2r1RbyDPgT/uwfQFPzZVSePo+y8iqsWr0GRqMxLAb8Sb+DP2H/0I+6S+dReaoU5eXVSExSC4t+hM2A7x3qR2vbFZScPIuS0iqsXLXasAyE1YDvHezD7baLKD5xBiUlVVi5aq1hGQi7AQUz0DuIm109KD5+BiUlVVi1ao1hGQi7Ad8/OICmF90oOnYGJSUVWL1mnWEZCKsB3z/Uj6bO71EwA3v3H4DRqH6EwX5YDfjjf/z4iW/f/8BmsyMsLMywDIjVABZ7z2BNYE1gzR9I/wHj2vB+6QAAAABJRU5ErkJggg==",
    }}
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

  // Let makeRedirectUri generate the correct URI for the current environment
  // In Expo Go: MUST use auth.expo.io proxy since Google rejects exp:// schemes
  // In dev build/production: use custom scheme
  const redirectUri = isExpoGo
    ? "https://auth.expo.io/@priyanshudayal1/anand-mobiles"
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
  }, [isExpoGo, redirectUri]);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    // When in Expo Go (Proxy/Web flow), we MUST use the Web Client ID for all platforms.
    // The Android/iOS Client IDs are for native flows which check package names, not Redirect URIs.
    clientId:
      "403268549781-lsqsntlonidq8suavgclol4l8cl0m5o4.apps.googleusercontent.com",
    androidClientId: isExpoGo
      ? "403268549781-lsqsntlonidq8suavgclol4l8cl0m5o4.apps.googleusercontent.com" // Use Web ID in Expo Go
      : "403268549781-ap66ler0ic5vua4dle16pikm1suqec15.apps.googleusercontent.com", // Use Native ID in Prod
    iosClientId: isExpoGo
      ? "403268549781-lsqsntlonidq8suavgclol4l8cl0m5o4.apps.googleusercontent.com" // Use Web ID in Expo Go
      : "403268549781-mi92udu70ovm0f861ilks4kks6r2bvra.apps.googleusercontent.com", // Use Native ID in Prod
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
      if (!isExpoGo && GoogleSignin) {
        try {
          GoogleSignin.configure({
            webClientId:
              "403268549781-lsqsntlonidq8suavgclol4l8cl0m5o4.apps.googleusercontent.com",
            offlineAccess: true,
            forceCodeForRefreshToken: true,
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
  }, [isExpoGo]);

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
    console.log("isExpoGo:", isExpoGo);
    console.log("GoogleSignin available:", !!GoogleSignin);
    console.log("Request ready:", !!request);

    // Use Expo auth-session for Expo Go OR if native module isn't available
    if (isExpoGo || !GoogleSignin) {
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
      disabled={loading || !request}
      className="w-full bg-white border-2 border-gray-300 rounded-xl py-4 px-6 flex-row items-center justify-center active:opacity-70"
      style={{ opacity: loading || !request ? 0.5 : 1 }}
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
