import { create } from "zustand";
import api from "../services/api";

export const useCartStore = create((set, get) => ({
  cartItems: [],
  cartTotal: 0,
  itemCount: 0,
  isLoading: false,
  error: null,

  // Fetch cart
  fetchCart: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/users/cart/");
      const data = response.data;

      const items = data.cart_items || data.items || data.cart || [];
      let total = data.total || data.cart_total || 0;
      const count = data.item_count || items.length || 0;

      // Recalculate total if backend returns 0 or null
      if (!total && items.length > 0) {
        total = items.reduce((sum, item) => {
          const price = item.discounted_price || item.price || 0;
          return sum + price * (item.quantity || 1);
        }, 0);
      }

      set({
        cartItems: items,
        cartTotal: total,
        itemCount: count,
        isLoading: false,
      });

      return { items, total, count };
    } catch (error) {
      // Silence 401 errors as they are handled by the interceptor
      if (error.response && error.response.status === 401) {
        set({
          cartItems: [],
          cartTotal: 0,
          itemCount: 0,
          isLoading: false,
          error: null,
        });
        return { items: [], total: 0, count: 0 };
      }
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to fetch cart";
      set({ error: msg, isLoading: false });
      console.error("Failed to fetch cart:", error);
      throw error;
    }
  },

  // Add to cart - now handles both adding new items and updating existing quantities
  addItem: async (product, quantity = 1) => {
    set({ isLoading: true, error: null });
    try {
      const productId = product?.id || product?.product_id || product?._id;
      const variantId = product?.variant_id || product?.variant?.id || null;

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

      return { success: true, data };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to add to cart";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // Legacy method for compatibility
  addToCart: async (productId, quantity = 1, variantId = null) => {
    const product = { id: productId, variant_id: variantId };
    return await get().addItem(product, quantity);
  },

  // Update cart item quantity (sets absolute quantity)
  updateQuantity: async (itemId, quantity) => {
    if (quantity < 1) {
      return await get().removeFromCart(itemId);
    }

    try {
      const response = await api.put("/users/cart/update/", {
        item_id: itemId,
        quantity: quantity,
      });

      // Refresh cart to get updated data from backend
      await get().fetchCart();

      return { success: true };
    } catch (error) {
      console.error(
        `[Cart] Update failed:`,
        error.response?.data || error.message,
      );
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to update quantity";
      set({ error: msg });
      throw error;
    }
  },

  // Remove from cart
  removeFromCart: async (itemId) => {
    try {
      // Backend expects item_id in URL path: /users/cart/remove/{itemId}/
      const endpoint = `/users/cart/remove/${itemId}/`;
      const response = await api.delete(endpoint);

      // Refresh cart to get updated data from backend
      await get().fetchCart();

      return { success: true };
    } catch (error) {
      console.error(
        `[Cart] Remove failed:`,
        error.response?.data || error.message,
      );
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to remove from cart";
      set({ error: msg });
      throw error;
    }
  },

  // Clear cart
  clearCart: async () => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(API_ENDPOINTS.clearCart || "/users/cart/clear/");
      set({
        cartItems: [],
        cartTotal: 0,
        itemCount: 0,
        isLoading: false,
      });
      return { success: true };
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.detail ||
        "Failed to clear cart";
      set({ error: msg, isLoading: false });
      throw error;
    }
  },

  // Increment item quantity
  incrementQuantity: async (itemId) => {
    const { cartItems } = get();
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) {
      console.error(`[Cart] Item not found: ${itemId}`);
      throw new Error("Item not found in cart");
    }
    return await get().updateQuantity(itemId, item.quantity + 1);
  },

  // Decrement item quantity
  decrementQuantity: async (itemId) => {
    const { cartItems } = get();
    const item = cartItems.find((i) => i.id === itemId);
    if (!item) {
      console.error(`[Cart] Item not found: ${itemId}`);
      throw new Error("Item not found in cart");
    }
    if (item.quantity > 1) {
      return await get().updateQuantity(itemId, item.quantity - 1);
    } else {
      return await get().removeFromCart(itemId);
    }
  },

  // Check if product is in cart
  isInCart: (productId) => {
    const { cartItems } = get();
    return cartItems.some(
      (item) => item.product_id === productId || item.product?.id === productId,
    );
  },

  // Get cart item count
  getCartCount: () => {
    const { cartItems } = get();
    return cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () =>
    set({
      cartItems: [],
      cartTotal: 0,
      itemCount: 0,
      isLoading: false,
      error: null,
    }),
}));
