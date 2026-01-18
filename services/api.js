import axios from "axios";
import { BACKEND_URL } from "../constants/constants";

import AsyncStorage from "@react-native-async-storage/async-storage";

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
    }
);

export default api;
