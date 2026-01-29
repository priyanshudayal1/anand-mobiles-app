import axios from "axios";
import { BACKEND_URL } from "../constants/constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    const token = await AsyncStorage.getItem("userToken");
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
      console.log("[API] 401 Unauthorized detected - Calling logout callback");
      if (unauthorizedCallback) {
        unauthorizedCallback();
      }
    }
    return Promise.reject(error);
  },
);

export default api;
