import axios from "axios";
import { BACKEND_URL } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "./firebaseConfig";

let unauthorizedCallback = null;

export const setUnauthorizedCallback = (callback) => {
  unauthorizedCallback = callback;
};

const api = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const isFirebaseToken = (token) => {
  try {
    if (!token || typeof token !== "string") return false;
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1]));
    return !!(payload?.iss && payload.iss.includes("securetoken.google.com"));
  } catch {
    return false;
  }
};

// Add a request interceptor
api.interceptors.request.use(
  async (config) => {
    let token = await AsyncStorage.getItem("userToken");

    // If Firebase user is signed in, refresh token if it looks like a Firebase token
    // Firebase ID tokens expire every hour, so get a fresh one
    if (auth.currentUser && token) {
      try {
        const freshToken = await auth.currentUser.getIdToken();
        // Only replace if current stored token is a Firebase token (not backend JWT)
        if (isFirebaseToken(token)) {
          token = freshToken;
          await AsyncStorage.setItem("userToken", freshToken);
        }
      } catch (e) {
        // Token refresh failed, use existing token
      }
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Auth endpoints that should NOT trigger auto-logout on 401
const AUTH_ENDPOINTS = [
  "/users/google-login",
  "/users/signup",
  "/users/login",
  "/users/send-otp",
  "/users/verify-otp",
  "/users/notifications/",
  "/users/notifications/count/",
  "/users/notifications/read-all/",
];

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const url = error.config?.url || "";
      const isAuthEndpoint = AUTH_ENDPOINTS.some((ep) => url.includes(ep));
      if (unauthorizedCallback && !isAuthEndpoint) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
