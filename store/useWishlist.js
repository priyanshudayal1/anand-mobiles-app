import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useWishlistStore = create((set, get) => ({
    wishlistItems: [],
    isLoading: false,
    error: null,

    // Fetch wishlist items
    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.wishlist || "/users/wishlist/");
            const items = response.data.wishlist || response.data.items || response.data || [];
            set({ wishlistItems: items, isLoading: false });
            return items;
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to fetch wishlist";
            set({ error: msg, isLoading: false });
            console.error("Failed to fetch wishlist:", error);
            throw error;
        }
    },

    // Add to wishlist
    addToWishlist: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(API_ENDPOINTS.addToWishlist || "/users/wishlist/add/", {
                product_id: productId,
            });

            const newItem = response.data.item || response.data;

            set((state) => ({
                wishlistItems: [...state.wishlistItems, newItem],
                isLoading: false,
            }));

            return { success: true, item: newItem };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to add to wishlist";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Remove from wishlist
    removeFromWishlist: async (productId) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(API_ENDPOINTS.removeFromWishlist || "/users/wishlist/remove/", {
                product_id: productId,
            });

            set((state) => ({
                wishlistItems: state.wishlistItems.filter(
                    (item) => item.product_id !== productId && item.id !== productId && item.product?.id !== productId
                ),
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to remove from wishlist";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Check if product is in wishlist
    isInWishlist: (productId) => {
        const { wishlistItems } = get();
        return wishlistItems.some(
            (item) => item.product_id === productId || item.id === productId || item.product?.id === productId
        );
    },

    // Toggle wishlist (add if not present, remove if present)
    toggleWishlist: async (productId) => {
        const isInList = get().isInWishlist(productId);
        if (isInList) {
            return await get().removeFromWishlist(productId);
        } else {
            return await get().addToWishlist(productId);
        }
    },

    // Clear wishlist
    clearWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            await api.delete("/users/wishlist/clear/");
            set({ wishlistItems: [], isLoading: false });
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to clear wishlist";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Get wishlist count
    getWishlistCount: () => {
        return get().wishlistItems.length;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({ wishlistItems: [], isLoading: false, error: null }),
}));
