import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth, db } from "../services/firebaseConfig";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import api, { setUnauthorizedCallback } from "../services/api";
import { useCartStore } from "./useCart";
import { useAddressStore } from "./useAddress";
import { useWishlistStore } from "./useWishlist";
import { useOrderStore } from "./useOrder";
import { useGamification } from "./useGamification";
import { useNotificationStore } from "./useNotification";

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isInitialized: false,

  initialize: async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      const userData = await AsyncStorage.getItem("userData");
      if (token && userData) {
        set({ user: JSON.parse(userData), isAuthenticated: true });
      } else if (auth.currentUser) {
        // Firebase user exists but no local data — restore from Firestore
        const uid = auth.currentUser.uid;
        const userDocRef = doc(db, "users", uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          const freshToken = await auth.currentUser.getIdToken();
          const backendToken = await get()._fetchBackendToken(
            freshToken,
            auth.currentUser,
            uid,
          );
          const activeToken = backendToken || freshToken;
          const user = {
            id: uid,
            email: data.email || auth.currentUser.email,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone_number || "",
            photoURL: data.photo_url || auth.currentUser.photoURL || "",
            authProvider: data.auth_provider || "google",
            token: activeToken,
          };
          await AsyncStorage.setItem("userToken", activeToken);
          await AsyncStorage.setItem("userData", JSON.stringify(user));
          await AsyncStorage.setItem("userId", uid);
          set({ user, isAuthenticated: true });
        }
      }
    } catch (e) {
      console.error("Auth initialization failed", e);
    } finally {
      set({ isInitialized: true });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/users/login", { email, password });
      const data = response.data;

      const user = {
        id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone_number || data.phone,
        token: data.token,
      };

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.setItem("userId", data.user_id);

      set({ user, isAuthenticated: true, isLoading: false });
      return user;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Login failed";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        phone_number: userData.phone,
      };

      const response = await api.post("/users/signup", payload);
      const data = response.data;

      const user = {
        id: data.user_id,
        email: data.email,
        firstName: data.first_name,
        lastName: data.last_name,
        phone: data.phone_number || payload.phone_number,
        token: data.token,
      };

      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.setItem("userId", data.user_id);

      // Do NOT set isAuthenticated: true here — caller must invoke finalizeAuth()
      // after any post-signup flows (e.g. spin wheel) complete.
      set({ user, isLoading: false });
      return user;
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Registration failed";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // Call this after post-signup flows (spin wheel, etc.) are done.
  finalizeAuth: () => {
    set({ isAuthenticated: true });
  },

  sendOtp: async (email, name) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/users/auth/send-otp/", {
        email: email.toLowerCase().trim(),
        name: name.trim(),
        purpose: "registration",
      });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to send OTP";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ isLoading: true, error: null });
    try {
      await api.post("/users/auth/verify-otp/", {
        email: email.toLowerCase().trim(),
        otp,
        purpose: "registration",
      });
      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Invalid or expired OTP";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  googleLogin: async (firebaseToken, googleUser) => {
    set({ isLoading: true, error: null });
    try {
      const uid = googleUser.uid;
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const backendToken = await get()._fetchBackendToken(
          firebaseToken,
          googleUser,
          uid,
        );
        const activeToken = backendToken || firebaseToken;

        const user = {
          id: uid,
          email: userData.email || googleUser.email,
          firstName: userData.first_name || "",
          lastName: userData.last_name || "",
          phone: userData.phone_number || "",
          photoURL: userData.photo_url || googleUser.photoURL || "",
          authProvider: "google",
          token: activeToken,
        };

        await AsyncStorage.setItem("userToken", activeToken);
        await AsyncStorage.setItem("userData", JSON.stringify(user));
        await AsyncStorage.setItem("userId", uid);

        // Do NOT set isAuthenticated: true — caller must invoke finalizeAuth().
        set({ user, isLoading: false });

        return { success: true, user };
      } else {
        // User not in Firestore — needs signup
        set({ isLoading: false, error: null });
        return { success: false, redirect_to_signup: true };
      }
    } catch (error) {
      console.error("Google login error:", error);
      const msg = error.message || "Google login failed";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  googleSignup: async (firebaseToken, googleUser) => {
    set({ isLoading: true, error: null });
    try {
      const uid = googleUser.uid;
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        // User already exists — redirect to login
        set({ isLoading: false, error: null });
        return { success: false, already_exists: true };
      }

      // Write user to Firestore with exact same structure as backend
      const firestorePayload = {
        email: googleUser.email || "",
        first_name: googleUser.displayName?.split(" ")[0] || "",
        last_name: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
        phone_number: null,
        auth_provider: "google",
        uid: uid,
        photo_url: googleUser.photoURL || null,
        created_at: serverTimestamp(),
      };

      await setDoc(userDocRef, firestorePayload);

      const backendToken = await get()._fetchBackendToken(
        firebaseToken,
        googleUser,
        uid,
      );
      const activeToken = backendToken || firebaseToken;

      const user = {
        id: uid,
        email: firestorePayload.email,
        firstName: firestorePayload.first_name,
        lastName: firestorePayload.last_name,
        phone: "",
        photoURL: googleUser.photoURL || "",
        authProvider: "google",
        token: activeToken,
      };

      await AsyncStorage.setItem("userToken", activeToken);
      await AsyncStorage.setItem("userData", JSON.stringify(user));
      await AsyncStorage.setItem("userId", uid);

      // Do NOT set isAuthenticated: true — caller must invoke finalizeAuth() after post-signup flows.
      set({ user, isLoading: false });

      return { success: true, user };
    } catch (error) {
      console.error("Google signup error:", error);
      const msg = error.message || "Google signup failed";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // Background helper: fetch backend JWT silently for API calls (cart, orders, etc.)
  _fetchBackendToken: async (firebaseToken, googleUser, uid) => {
    try {
      const response = await api.post("/users/google-login", {
        idToken: firebaseToken,
        email: googleUser.email,
        firstName: googleUser.displayName?.split(" ")[0] || "",
        lastName: googleUser.displayName?.split(" ").slice(1).join(" ") || "",
        photoURL: googleUser.photoURL || "",
        uid: uid,
        authProvider: "google",
      });
      const data = response.data;
      if (data.token) {
        console.log("Backend JWT fetched successfully");
        return data.token;
      }
    } catch (err) {
      // If backend is down or user not found on backend, try signup endpoint
      try {
        const response = await api.post("/users/signup", {
          idToken: firebaseToken,
          email: googleUser.email,
          first_name: googleUser.displayName?.split(" ")[0] || "",
          last_name:
            googleUser.displayName?.split(" ").slice(1).join(" ") || "",
          photoURL: googleUser.photoURL || "",
          uid: uid,
          authProvider: "google",
        });
        const data = response.data;
        if (data.token) {
          console.log("Backend JWT fetched via signup endpoint");
          return data.token;
        }
      } catch (signupErr) {
        console.log(
          "Backend token fetch failed (non-blocking):",
          signupErr.message,
        );
        // Keep using Firebase token — API calls may fail but auth works
      }
    }
    return null;
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await AsyncStorage.removeItem("userToken");
      await AsyncStorage.removeItem("userData");
      await AsyncStorage.removeItem("userId");
      await auth.signOut();

      // Reset other stores
      useCartStore.getState().reset();
      useAddressStore.getState().reset();
      useWishlistStore.getState().reset();
      useOrderStore.getState().reset();
      useGamification.getState().reset();
      useNotificationStore.getState().reset();

      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Logout failed", error);
    }
  },

  fetchUserProfile: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/users/profile/");
      const data = response.data;

      set((state) => {
        const updatedUser = { ...state.user, ...data };
        AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
        return { user: updatedUser, isLoading: false };
      });

      return data;
    } catch (error) {
      console.error("Fetch profile failed", error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateUserProfileAPI: async (profileData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post("/users/profile/update/", profileData);
      const data = response.data;

      if (response.status === 200 && data.user) {
        set((state) => {
          const updatedUser = {
            ...state.user,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            phone: data.user.phone_number,
            email: data.user.email || state.user.email,
          };
          AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
          return { user: updatedUser, isLoading: false };
        });
        return { success: true, ...data };
      } else if (response.status === 200) {
        set({ isLoading: false });
        return { success: true, ...data };
      }

      set({ isLoading: false });
      return { success: false, ...data };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to update profile";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));

// Register callback to handle 401s from API
setUnauthorizedCallback(() => {
  useAuthStore.getState().logout();
});
