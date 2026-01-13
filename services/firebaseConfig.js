import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyDsPZsRwk4uFh7r-IN8NCzAca_mxPe67OE",
    authDomain: "anandmobiles-daa8b.firebaseapp.com",
    projectId: "anandmobiles-daa8b",
    storageBucket: "anandmobiles-daa8b.firebasestorage.app",
    messagingSenderId: "403268549781",
    appId: "1:403268549781:web:4aa820dddb7db1fa076f",
    measurementId: "G-PQSMJKJFFS"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence
const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
