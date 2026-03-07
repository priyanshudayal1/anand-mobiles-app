import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  getAuth,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyDsPZsRwk4uFh7r-IN8NCzAca_mxPe67OE",
  authDomain: "anandmobiles-daa8b.firebaseapp.com",
  projectId: "anandmobiles-daa8b",
  storageBucket: "anandmobiles-daa8b.firebasestorage.app",
  messagingSenderId: "403268549781",
  appId: "1:403268549781:web:4aa820dddb7db1fa076f",
  measurementId: "G-PQSMJKJFFS",
};

// Initialize Firebase app only if not already initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with AsyncStorage persistence only if not already initialized
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error) {
  if (error.code === "auth/already-initialized") {
    auth = getAuth(app);
  } else {
    throw error;
  }
}

// Initialize Firestore
const db = getFirestore(app);

export { auth, db, firebaseConfig };
