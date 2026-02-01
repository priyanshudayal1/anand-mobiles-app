import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../services/api";

// Storage key for caching home data
const HOME_DATA_CACHE_KEY = "@anand_mobiles_home_data";
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useHome = create((set, get) => ({
  // State
  banners: [],
  categories: [],
  featuredProducts: [],
  sections: [],
  brands: [],
  promotionVideos: [],

  // Loading states
  isLoading: false,
  isRefreshing: false,
  isInitialized: false,

  // Error state
  error: null,
  lastFetched: null,

  // Initialize home data from cache and fetch from backend
  initializeHome: async () => {
    try {
      set({ isLoading: true });

      // Try to load cached data first
      const cachedData = await AsyncStorage.getItem(HOME_DATA_CACHE_KEY);
      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheAge = Date.now() - (parsed.timestamp || 0);

        // Use cache if less than 5 minutes old
        if (cacheAge < CACHE_DURATION) {
          set({
            banners: parsed.banners || [],
            categories: parsed.categories || [],
            featuredProducts: parsed.featuredProducts || [],
            sections: parsed.sections || [],
            brands: parsed.brands || [],
            promotionVideos: parsed.promotionVideos || [],
            isInitialized: true,
            isLoading: false,
            lastFetched: parsed.timestamp,
          });

          // Still fetch fresh data in background
          get().fetchHomeData(true);
          return;
        }
      }

      // Fetch fresh data
      await get().fetchHomeData();
      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize home:", error);
      set({ isInitialized: true, isLoading: false, error: error.message });
    }
  },

  // Fetch home data from backend
  fetchHomeData: async (isBackground = false) => {
    if (!isBackground) {
      set({ isLoading: true, error: null });
    }

    try {
      const response = await api.get("/products/mobile/home/");

      if (response.data && response.data.success && response.data.data) {
        const homeData = response.data.data;

        const newState = {
          banners: homeData.banners || [],
          categories: homeData.categories || [],
          featuredProducts: homeData.featured_products || [],
          sections: homeData.sections || [],
          brands: homeData.brands || [],
          promotionVideos: homeData.promotion_videos || [],
          lastFetched: Date.now(),
          isLoading: false,
          error: null,
        };

        set(newState);

        // Cache the data
        await AsyncStorage.setItem(
          HOME_DATA_CACHE_KEY,
          JSON.stringify({
            ...newState,
            timestamp: Date.now(),
          }),
        );
      } else {
        if (!isBackground) {
          set({ isLoading: false });
        }
      }
    } catch (error) {
      console.error("Failed to fetch home data:", error);
      if (!isBackground) {
        set({ error: error.message, isLoading: false });
      }
    }
  },

  // Refresh home data (pull-to-refresh)
  refreshHomeData: async () => {
    set({ isRefreshing: true });
    try {
      await get().fetchHomeData();
    } finally {
      set({ isRefreshing: false });
    }
  },

  // Fetch only banners
  fetchBanners: async () => {
    try {
      const response = await api.get("/admin/banners/public/");
      if (response.data && response.data.banners) {
        set({ banners: response.data.banners });
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
    }
  },

  // Fetch only categories
  fetchCategories: async () => {
    try {
      const response = await api.get("/products/mobile/categories/");
      if (response.data && response.data.categories) {
        set({ categories: response.data.categories });
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  },

  // Fetch only featured products
  fetchFeaturedProducts: async (limit = 10) => {
    try {
      const response = await api.get(
        `/products/mobile/featured/?limit=${limit}`,
      );
      if (response.data && response.data.products) {
        set({ featuredProducts: response.data.products });
      }
    } catch (error) {
      console.error("Failed to fetch featured products:", error);
    }
  },

  // Fetch brands
  fetchBrands: async (featured_only = false, limit = null) => {
    try {
      let url = "/admin/brands/public/";
      const params = [];

      if (featured_only) {
        params.push(`featured_only=true`);
      }

      if (limit) {
        params.push(`limit=${limit}`);
      }

      if (params.length > 0) {
        url += `?${params.join("&")}`;
      }

      const response = await api.get(url);
      if (response.data && response.data.brands) {
        set({ brands: response.data.brands });
      }
    } catch (error) {
      console.error("Failed to fetch brands:", error);
    }
  },

  // Clear cached data
  clearCache: async () => {
    await AsyncStorage.removeItem(HOME_DATA_CACHE_KEY);
    set({
      banners: [],
      categories: [],
      featuredProducts: [],
      sections: [],
      brands: [],
      promotionVideos: [],
      isInitialized: false,
      lastFetched: null,
    });
  },

  // Get category by ID or slug
  getCategoryBySlug: (slug) => {
    const { categories } = get();
    return categories.find(
      (c) =>
        c.slug === slug ||
        c.id === slug ||
        c.name.toLowerCase() === slug.toLowerCase(),
    );
  },

  // Get brand by ID or slug
  getBrandBySlug: (slug) => {
    const { brands } = get();
    return brands.find(
      (b) =>
        b.slug === slug ||
        b.id === slug ||
        b.name.toLowerCase() === slug.toLowerCase(),
    );
  },
}));
