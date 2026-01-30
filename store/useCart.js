import { create } from "zustand";
import api from "../services/api";

export const useCartStore = create((set, get) => ({
    cartItems: [],
    cartTotal: 0,
    itemCount: 0,
    isLoading: false,
    error: null,

    // Fetch cart from server
    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get("/users/cart/");
            const data = response.data;

            // Backend returns { cart: [...] }
            const items = data.cart || data.cart_items || data.items || [];

            // Calculate total from items
            const total = items.reduce((sum, item) => {
                const price = item.price || 0;
                return sum + price * (item.quantity || 1);
            }, 0);

            const count = items.reduce((sum, item) => sum + (item.quantity || 1), 0);

            set({
                cartItems: items,
                cartTotal: total,
                itemCount: count,
                isLoading: false,
            });

            return { items, total, count };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to fetch cart";
            set({ error: msg, isLoading: false });
            console.error("Failed to fetch cart:", error);
            throw error;
        }
    },

    // Add to cart - uses POST /users/cart/add/<product_id>/
    // Backend ACCUMULATES quantity, not replaces
    addToCart: async (productId, quantity = 1, variantId = null) => {
        set({ isLoading: true, error: null });
        try {
            const payload = {
                quantity: quantity,
            };

            if (variantId) {
                payload.variant_id = variantId;
            }

            // Backend expects product_id in URL path: /users/cart/add/{productId}/
            const endpoint = `/users/cart/add/${productId}/`;
            const response = await api.post(endpoint, payload);
            const data = response.data;

            // Refresh cart to get updated data
            await get().fetchCart();

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to add to cart";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Update cart item quantity by removing and re-adding with new quantity
    updateQuantity: async (itemId, newQuantity) => {
        if (newQuantity <= 0) {
            return await get().removeFromCart(itemId);
        }

        set({ isLoading: true, error: null });
        try {
            // Find the item to get product_id and current quantity
            const { cartItems } = get();
            const item = cartItems.find((i) => i.item_id === itemId);

            if (!item) {
                throw new Error("Item not found in cart");
            }

            // First remove the item
            await api.delete(`/users/cart/remove/${itemId}/`);

            // Then add it back with the new quantity
            const payload = {
                quantity: newQuantity,
            };
            if (item.variant_id) {
                payload.variant_id = item.variant_id;
            }
            await api.post(`/users/cart/add/${item.product_id}/`, payload);

            // Refresh cart to get accurate state from server
            await get().fetchCart();

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to update quantity";
            set({ error: msg, isLoading: false });
            // Refresh cart to get accurate state
            await get().fetchCart();
            throw error;
        }
    },

    // Remove from cart - uses DELETE /users/cart/remove/<item_id>/
    removeFromCart: async (itemId) => {
        set({ isLoading: true, error: null });
        try {
            // Backend expects item_id in URL path
            await api.delete(`/users/cart/remove/${itemId}/`);

            // Update local state
            set((state) => {
                const updatedItems = state.cartItems.filter((item) => item.item_id !== itemId);
                const newTotal = updatedItems.reduce((sum, item) => {
                    const price = item.price || 0;
                    return sum + price * item.quantity;
                }, 0);

                return {
                    cartItems: updatedItems,
                    cartTotal: newTotal,
                    itemCount: updatedItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
                    isLoading: false,
                };
            });

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to remove from cart";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Clear cart (remove all items one by one since there's no clear endpoint)
    clearCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const { cartItems } = get();

            // Remove each item
            for (const item of cartItems) {
                await api.delete(`/users/cart/remove/${item.item_id}/`);
            }

            set({
                cartItems: [],
                cartTotal: 0,
                itemCount: 0,
                isLoading: false,
            });
            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to clear cart";
            set({ error: msg, isLoading: false });
            // Refresh cart on error
            await get().fetchCart();
            throw error;
        }
    },

    // Increment item quantity - adds 1 to current quantity
    incrementQuantity: async (itemId) => {
        const { cartItems } = get();
        const item = cartItems.find((i) => i.item_id === itemId);
        if (item) {
            // Optimistically update local state first
            set((state) => ({
                cartItems: state.cartItems.map((i) =>
                    i.item_id === itemId ? { ...i, quantity: (i.quantity || 1) + 1 } : i
                ),
                isLoading: true,
            }));

            try {
                // Backend accumulates, so we just add 1
                const payload = { quantity: 1 };
                if (item.variant_id) {
                    payload.variant_id = item.variant_id;
                }
                await api.post(`/users/cart/add/${item.product_id}/`, payload);

                // Update totals
                get().updateTotals();
                set({ isLoading: false });
                return { success: true };
            } catch (error) {
                // Revert on error
                await get().fetchCart();
                throw error;
            }
        }
    },

    // Decrement item quantity
    decrementQuantity: async (itemId) => {
        const { cartItems } = get();
        const item = cartItems.find((i) => i.item_id === itemId);
        if (item && item.quantity > 1) {
            // Need to remove and re-add with new quantity since backend only accumulates
            return await get().updateQuantity(itemId, item.quantity - 1);
        } else if (item) {
            return await get().removeFromCart(itemId);
        }
    },

    // Check if product is in cart
    isInCart: (productId) => {
        const { cartItems } = get();
        return cartItems.some(
            (item) => item.product_id === productId
        );
    },

    // Get cart item for a product
    getCartItem: (productId) => {
        const { cartItems } = get();
        return cartItems.find((item) => item.product_id === productId);
    },

    // Get cart item count
    getCartCount: () => {
        const { cartItems } = get();
        return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
    },

    // Update totals helper
    updateTotals: () => {
        set((state) => {
            const total = state.cartItems.reduce((sum, item) => {
                const price = item.price || 0;
                return sum + price * (item.quantity || 1);
            }, 0);
            const count = state.cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
            return { cartTotal: total, itemCount: count };
        });
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({
        cartItems: [],
        cartTotal: 0,
        itemCount: 0,
        isLoading: false,
        error: null,
    }),
}));
