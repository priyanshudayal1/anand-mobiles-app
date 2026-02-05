import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";
import RazorpayCheckout from "react-native-razorpay";
import { useCartStore } from "./useCart";

export const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  isLoading: false,
  isProcessingPayment: false,
  paymentSuccessful: false,
  error: null,

  // Initialize Razorpay payment
  initiatePayment: (razorpayData) => {
    return new Promise((resolve, reject) => {
      if (!RazorpayCheckout) {
        const msg =
          "Razorpay module is not initialized. If you are on Expo Go, this native module will not work. Please use a Development Build.";
        console.error(msg);
        set({ error: msg, isProcessingPayment: false });
        reject(new Error(msg));
        return;
      }

      const options = {
        description: "Order Payment",
        image: "https://i.imgur.com/3g7nmJC.png", // Replace with app logo
        currency: razorpayData.currency || "INR",
        key: razorpayData.key_id,
        amount: razorpayData.amount,
        name: "Anand Mobiles",
        order_id: razorpayData.razorpay_order_id,
        prefill: {
          contact: "", // Can be prefilled if user data available
          email: "",
        },
        theme: { color: "#53a15d" },
      };

      try {
        RazorpayCheckout.open(options)
          .then(async (data) => {
            // handle success

            try {
              // Verify payment with backend
              const paymentData = {
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_order_id: data.razorpay_order_id,
                razorpay_signature: data.razorpay_signature,
                order_id: razorpayData.app_order_id,
              };

              const verifyResponse = await api.post(
                "/users/order/razorpay/verify/",
                paymentData,
              );

              // Update local state
              set((state) => ({
                orders: state.orders.map((order) =>
                  order.id === razorpayData.app_order_id
                    ? { ...order, status: "paid", payment_details: data }
                    : order,
                ),
                paymentSuccessful: true,
                isProcessingPayment: false,
              }));

              // Clear cart if successful
              useCartStore.getState().fetchCart();

              // Reset success flag after delay
              setTimeout(() => {
                set({ paymentSuccessful: false });
              }, 2000);

              resolve(verifyResponse.data);
            } catch (verifyError) {
              console.error("Payment verification failed:", verifyError);
              set({
                error: "Payment verification failed",
                isProcessingPayment: false,
              });
              reject(verifyError);
            }
          })
          .catch((error) => {
            // handle failure
            console.error("Payment Error:", error);
            let errorMessage = "Payment failed or cancelled";
            if (error.code && error.description) {
              errorMessage = error.description;
            } else if (error.message) {
              errorMessage = error.message;
            }
            set({ error: errorMessage, isProcessingPayment: false });
            reject(error);
          });
      } catch (e) {
        console.error("Razorpay Error:", e);
        const msg =
          "Razorpay is not available in this environment (likely Expo Go). Please use a native development build.";
        set({ error: msg, isProcessingPayment: false });
        reject(new Error(msg));
      }
    });
  },

  // Place order from cart
  placeOrderFromCart: async (addressId) => {
    set({ isProcessingPayment: true, error: null });
    try {
      if (!addressId) {
        throw new Error("Address ID is required");
      }

      const cartItems = useCartStore.getState().cartItems;
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Cart is empty");
      }

      // Calculate amount in paise
      const total = useCartStore.getState().cartTotal;
      const amountInPaise = Math.round(total * 100);

      // FIX: Map to product_id correctly
      const productIds = cartItems
        .map((item) => item.product_id || item.product?.id || item.id)
        .filter(Boolean);

      if (productIds.length === 0) {
        console.warn("No valid product IDs found in cart items:", cartItems);
      }

      const orderData = {
        address_id: addressId,
        amount: amountInPaise,
        currency: "INR",
        product_ids: productIds,
      };

      const response = await api.post(
        "/users/order/razorpay/create/",
        orderData,
      );
      const razorpayData = response.data;

      if (!razorpayData.key_id || !razorpayData.razorpay_order_id) {
        throw new Error("Invalid payment configuration from server");
      }

      // Add pending order to list
      const newOrder = {
        id: razorpayData.app_order_id,
        status: "pending_payment",
        total_amount: total,
        created_at: new Date().toISOString(),
        // ... other details
      };

      set((state) => ({
        orders: [newOrder, ...state.orders],
        currentOrder: newOrder,
      }));

      // Initiate Payment
      await get().initiatePayment(razorpayData);

      return newOrder;
    } catch (error) {
      console.error("Place order failed:", error);
      const msg =
        error.response?.data?.error || error.message || "Failed to place order";
      set({ error: msg, isProcessingPayment: false });
      throw error;
    }
  },

  getAllOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.orders);
      set({ orders: response.data.orders || [], isLoading: false });
    } catch (error) {
      // Silence 401 errors
      if (error.response && error.response.status === 401) {
        set({ orders: [], isLoading: false, error: null });
        return;
      }
      set({
        error: error.response?.data?.error || "Failed to fetch orders",
        isLoading: false,
      });
    }
  },

  getOrderById: async (orderId) => {
    set({ isLoading: true, error: null, currentOrder: null });
    try {
      const endpoint =
        typeof API_ENDPOINTS.orderDetails === "function"
          ? API_ENDPOINTS.orderDetails(orderId)
          : `/users/orders/${orderId}/`; // Fallback

      const response = await api.get(endpoint);
      set({ currentOrder: response.data.order_details, isLoading: false });
      return response.data.order_details;
    } catch (error) {
      // Silence 401 errors
      if (error.response && error.response.status === 401) {
        set({ currentOrder: null, isLoading: false, error: null });
        return null;
      }
      set({
        error: error.response?.data?.error || "Failed to fetch order details",
        isLoading: false,
      });
      throw error;
    }
  },

  clearCurrentOrder: () => set({ currentOrder: null }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      orders: [],
      currentOrder: null,
      isLoading: false,
      isProcessingPayment: false,
      paymentSuccessful: false,
      error: null,
    }),
}));
