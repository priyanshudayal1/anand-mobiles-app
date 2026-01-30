import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useSiteConfig = create((set, get) => ({
    // State
    logoUrl: null,
    shopName: "Anand Mobiles",
    isLoading: false,
    error: null,
    isInitialized: false,

    // Fetch site configuration (logo)
    fetchSiteConfig: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.logo || "/admin/content/logo/");
            const data = response.data;

            if (data.logo_url) {
                set({
                    logoUrl: data.logo_url,
                    isLoading: false,
                    isInitialized: true,
                });
            } else {
                set({ isLoading: false, isInitialized: true });
            }

            return { success: true, logoUrl: data.logo_url };
        } catch (error) {
            console.error("Failed to fetch site config:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch site config",
                isLoading: false,
                isInitialized: true,
            });
            return { success: false, error: error.message };
        }
    },

    // Set logo URL manually
    setLogoUrl: (url) => set({ logoUrl: url }),

    // Set shop name
    setShopName: (name) => set({ shopName: name }),

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
        logoUrl: null,
        shopName: "Anand Mobiles",
        isLoading: false,
        error: null,
        isInitialized: false,
    }),
}));
