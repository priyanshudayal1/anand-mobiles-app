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
        // Backend JWTs have user_id field, Firebase tokens have iss field
        const storedPayload = JSON.parse(atob(token.split(".")[1]));
        if (
          storedPayload.iss &&
          storedPayload.iss.includes("securetoken.google.com")
        ) {
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

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
