import { create } from "zustand";
import api from "../services/api";

export const usePageContent = create((set, get) => ({
  // State
  content: null,
  loading: false,
  error: null,
  contentCache: {}, // Cache for page contents with timestamps

  // Contact page specific state
  contactInfo: [],
  contactHero: {
    title: "Contact Us",
    description: "Have questions? We're here to help!",
  },
  contactFaq: [],
  contactMap: { enabled: false, embedUrl: "", title: "" },

  // Store locations state
  stores: [],
  storesLoading: false,

  // Fetch page content (about-us, terms, privacy, etc.)
  fetchPageContent: async (pagePath, forceRefresh = false) => {
    set({ loading: true, error: null });

    // Check cache (5 minute TTL)
    const cache = get().contentCache;
    const now = Date.now();
    const cacheEntry = cache[pagePath];
    const CACHE_TTL = 5 * 60 * 1000;

    if (!forceRefresh && cacheEntry && now - cacheEntry.timestamp < CACHE_TTL) {
      set({ content: cacheEntry.content, loading: false });
      return cacheEntry.content;
    }

    try {
      const response = await api.get(
        `/admin/content/pages/${pagePath.replace(/^\//, "")}/`,
      );

      if (response.data) {
        const content = response.data.content;
        set({
          content,
          loading: false,
          contentCache: {
            ...cache,
            [pagePath]: { content, timestamp: now },
          },
        });
        return content;
      }
    } catch (error) {
      console.error("Error fetching page content:", error);
      set({
        error: error.response?.data?.error || "Failed to fetch page content",
        loading: false,
      });
    }
    return null;
  },

  // Fetch contact info (public endpoint)
  fetchContactInfo: async () => {
    set({ loading: true, error: null });
    try {
      const response = await api.get("/admin/contact/info/");

      if (response.data && response.data.success) {
        const data = response.data.data;
        set({
          contactInfo: data.contact_info || [],
          contactHero: data.hero || {
            title: "Contact Us",
            description: "Have questions? We're here to help!",
          },
          contactFaq: data.faq || [],
          contactMap: data.map || { enabled: false, embedUrl: "", title: "" },
          loading: false,
        });
        return data;
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      // Use default values if fetch fails
      set({
        contactInfo: [
          {
            icon: "FiPhone",
            title: "Phone Number",
            details: ["+91 98765 43210"],
          },
          {
            icon: "FiMail",
            title: "Email Address",
            details: ["support@anandmobiles.com"],
          },
          {
            icon: "FiMapPin",
            title: "Address",
            details: ["123 Tech Street, New Delhi"],
          },
          {
            icon: "FiClock",
            title: "Working Hours",
            details: ["Mon - Sat: 10 AM - 8 PM"],
          },
        ],
        contactFaq: [
          {
            question: "What is your return policy?",
            answer: "We offer a 7-day return policy on all products.",
          },
          {
            question: "Do you offer warranty?",
            answer: "Yes, all products come with manufacturer warranty.",
          },
        ],
        loading: false,
        error: error.message,
      });
    }
    return null;
  },

  // Submit contact form
  submitContactForm: async (formData) => {
    try {
      const response = await api.post("/admin/contact/form/submit/", formData);
      if (response.data && response.data.success) {
        return { success: true };
      }
      return { success: false, error: "Failed to submit form" };
    } catch (error) {
      console.error("Error submitting contact form:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to submit form",
      };
    }
  },

  // Fetch store locations
  fetchStores: async () => {
    set({ storesLoading: true });
    try {
      const response = await api.get("/stores/");

      if (response.data && response.data.stores) {
        set({ stores: response.data.stores, storesLoading: false });
        return response.data.stores;
      }
    } catch (error) {
      console.error("Error fetching stores:", error);
      set({ storesLoading: false });
    }
    return [];
  },

  // Clear content
  clearContent: () => set({ content: null }),

  // Clear error
  clearError: () => set({ error: null }),
}));
