import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useFooterStore = create((set, get) => ({
    // State
    footerData: null,
    customPages: [],
    isLoading: false,
    error: null,
    isInitialized: false,

    // Fetch footer configuration
    fetchFooterData: async () => {
        if (get().isLoading) return;

        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.footer || "/admin/footer/");
            const data = response.data;

            if (data.success && data.footer_config) {
                set({
                    footerData: data.footer_config,
                    isLoading: false,
                    isInitialized: true,
                });
            } else {
                set({ isLoading: false, isInitialized: true });
            }

            return { success: true, data: data.footer_config };
        } catch (error) {
            console.error("Failed to fetch footer data:", error);
            set({
                error: error.response?.data?.error || "Failed to fetch footer data",
                isLoading: false,
                isInitialized: true,
            });
            return { success: false, error: error.message };
        }
    },

    // Get contact info
    getContactInfo: () => {
        const { footerData } = get();
        return footerData?.contact_info || {
            phone: "+91 9876543210",
            email: "contact@anandmobiles.com",
            whatsapp: "919876543210",
            address: "123 Tech Street, Mobile City",
        };
    },

    // Get social links
    getSocialLinks: () => {
        const { footerData } = get();
        if (footerData?.social_links?.links && Array.isArray(footerData.social_links.links)) {
            return footerData.social_links.links;
        }
        // Default social links
        return [
            { platform: "facebook", url: "https://facebook.com", icon: "logo-facebook" },
            { platform: "instagram", url: "https://instagram.com", icon: "logo-instagram" },
            { platform: "twitter", url: "https://twitter.com", icon: "logo-twitter" },
            { platform: "youtube", url: "https://youtube.com", icon: "logo-youtube" },
        ];
    },

    // Get quick links (Store section)
    getQuickLinks: () => {
        const { footerData } = get();
        if (footerData?.quick_links?.links && Array.isArray(footerData.quick_links.links)) {
            return footerData.quick_links.links;
        }
        // Default quick links for mobile app
        return [
            { text: "Home", route: "/(tabs)" },
            { text: "Products", route: "/(tabs)/menu" },
            { text: "About Us", route: "/about" },
            { text: "Contact", route: "/contact" },
        ];
    },

    // Get newsletter config
    getNewsletterConfig: () => {
        const { footerData } = get();
        return footerData?.newsletter || {
            enabled: true,
            title: "Newsletter",
            description: "Subscribe to get updates on new products and offers",
        };
    },

    // Check if a section is enabled
    isSectionEnabled: (sectionName) => {
        const { footerData } = get();
        if (!footerData || !footerData[sectionName]) return true; // Default to enabled
        return footerData[sectionName].enabled !== false;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
        footerData: null,
        customPages: [],
        isLoading: false,
        error: null,
        isInitialized: false,
    }),
}));
