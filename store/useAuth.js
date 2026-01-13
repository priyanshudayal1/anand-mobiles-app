import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isInitialized: false,

    initialize: async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const userData = await AsyncStorage.getItem('userData');
            if (token && userData) {
                set({ user: JSON.parse(userData), isAuthenticated: true });
            }
        } catch (e) {
            console.error('Auth initialization failed', e);
        } finally {
            set({ isInitialized: true });
        }
    },

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post("/users/login", { email, password });
            const data = response.data;
            console.log('data',data)

            const user = {
                id: data.user_id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                phone: data.phone_number || data.phone,
                token: data.token,
            };

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            set({ user, isAuthenticated: true, isLoading: false });
            return user;
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Login failed";
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
                phone_number: userData.phone
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

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            set({ user, isAuthenticated: true, isLoading: false });
            return user;
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Registration failed";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    googleLogin: async (idToken) => {
        set({ isLoading: true, error: null });
        try {
            // 1. Sign in to Firebase with the ID token
            const credential = GoogleAuthProvider.credential(idToken);
            const userCredential = await signInWithCredential(auth, credential);
            const firebaseUser = userCredential.user;

            // 2. Prepare data for backend
            // Note: We need to get a fresh ID token or reuse the one we have? 
            // The backend expects 'idToken' to verify with Google.
            // We can use the one passed in, or get a fresh one from firebaseUser.

            const backendPayload = {
                idToken: idToken, // Using the token we got from Google Sign-In
                email: firebaseUser.email,
                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                lastName: firebaseUser.displayName?.split(' ').slice(1).join(' ') || '',
                photoURL: firebaseUser.photoURL,
                uid: firebaseUser.uid,
                authProvider: 'google'
            };

            // 3. Send to backend (Try signup logic first as per web app)
            let data;
            try {
                const response = await api.post("/users/signup", backendPayload);
                data = response.data;
            } catch (err) {
                if (err.response?.status === 409 && err.response?.data?.code === 'USER_ALREADY_EXISTS') {
                    // Fallback to login
                    console.log("User exists, falling back to Google Login");
                    const loginResponse = await api.post("/users/google-login", { idToken });
                    data = loginResponse.data;
                } else {
                    throw err;
                }
            }

            const user = {
                id: data.user_id,
                email: data.email,
                firstName: data.first_name,
                lastName: data.last_name,
                phone: data.phone_number,
                photoURL: firebaseUser.photoURL,
                token: data.token,
            };

            await AsyncStorage.setItem('userToken', data.token);
            await AsyncStorage.setItem('userData', JSON.stringify(user));

            set({ user, isAuthenticated: true, isLoading: false });
            return user;

        } catch (error) {
            console.error("Google Login Flow Failed:", error);
            const msg = error.response?.data?.error || error.response?.data?.detail || error.message || "Google Login failed";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    logout: async () => {
        set({ isLoading: true });
        try {
            await AsyncStorage.removeItem('userToken');
            await AsyncStorage.removeItem('userData');
            // Ideally sign out from Firebase too
            await auth.signOut();

            set({ user: null, isAuthenticated: false, isLoading: false });
        } catch (error) {
            set({ isLoading: false });
            console.error("Logout failed", error);
        }
    }
}));
