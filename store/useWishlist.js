import { create } from "zustand";
import api from "../services/api";

export const useWishlistStore = create((set, get) => ({
    items: [],
    isLoading: false,
    error: null,

    // Fetch wishlist items from API
    fetchWishlist: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get("/users/wishlist/");
            const wishlistData = response.data.wishlist || response.data || [];

            // Transform to consistent format
            const transformedItems = wishlistData.map((item) => ({
                id: item.product_id,
                item_id: item.item_id, // The unique wishlist item identifier
                name: item.name || "Product",
                price: item.price || 0,
                original_price: item.original_price || item.price,
                image: item.image_url || item.image,
                stock: item.stock ?? 1,
                category: item.category || "Product",
                brand: item.brand,
                added_at: item.added_at,
                variant_id: item.variant_id,
                variant: item.variant,
            }));

            set({ items: transformedItems, isLoading: false });
            return transformedItems;
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to fetch wishlist";
            set({ error: msg, isLoading: false, items: [] });
            console.error("Failed to fetch wishlist:", error);
            return [];
        }
    },

    // Add product to wishlist
    addToWishlist: async (productId, variantId = null) => {
        const { items } = get();

        // Check if already in wishlist
        const existingItem = items.find((item) => item.id === productId);
        if (existingItem) {
            return { success: true, alreadyExists: true };
        }

        set({ isLoading: true, error: null });
        try {
            const response = await api.post(`/users/wishlist/add/${productId}/`, {
                variant_id: variantId,
            });

            // Refetch to get complete item data
            await get().fetchWishlist();

            return { success: true, message: response.data.message };
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to add to wishlist";
            set({ error: msg, isLoading: false });
            console.error("Failed to add to wishlist:", error);
            return { success: false, error: msg };
        }
    },

    // Remove item from wishlist using item_id (not product_id)
    removeFromWishlist: async (itemId) => {
        const { items } = get();
        const itemToRemove = items.find((item) => item.item_id === itemId);

        if (!itemToRemove) {
            return { success: false, error: "Item not found in wishlist" };
        }

        // Optimistic update
        set({ items: items.filter((item) => item.item_id !== itemId) });

        try {
            await api.delete(`/users/wishlist/remove/${itemId}/`);
            return { success: true };
        } catch (error) {
            // Revert optimistic update on error
            set({ items: [...items] });
            const msg = error.response?.data?.error || "Failed to remove from wishlist";
            console.error("Failed to remove from wishlist:", error);
            return { success: false, error: msg };
        }
    },

    // Check if product is in wishlist
    isInWishlist: (productId) => {
        const { items } = get();
        return items.some((item) => item.id === productId);
    },

    // Toggle wishlist status
    toggleWishlist: async (productId, variantId = null) => {
        const isInList = get().isInWishlist(productId);
        if (isInList) {
            const item = get().items.find((i) => i.id === productId);
            return await get().removeFromWishlist(item?.item_id || productId);
        } else {
            return await get().addToWishlist(productId, variantId);
        }
    },

    // Get wishlist count
    getWishlistCount: () => {
        return get().items.length;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({ items: [], isLoading: false, error: null }),
}));
