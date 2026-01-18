import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useOrderStore = create((set, get) => ({
    orders: [],
    currentOrder: null,
    isLoading: false,
    error: null,

    getAllOrders: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.orders);
            set({ orders: response.data.orders || [], isLoading: false });
        } catch (error) {
            set({
                error: error.response?.data?.error || "Failed to fetch orders",
                isLoading: false,
            });
        }
    },

    getOrderById: async (orderId) => {
        set({ isLoading: true, error: null, currentOrder: null });
        try {
            const endpoint = typeof API_ENDPOINTS.orderDetails === 'function'
                ? API_ENDPOINTS.orderDetails(orderId)
                : `/users/orders/${orderId}/`; // Fallback

            const response = await api.get(endpoint);
            set({ currentOrder: response.data.order_details, isLoading: false });
            return response.data.order_details;
        } catch (error) {
            set({
                error: error.response?.data?.error || "Failed to fetch order details",
                isLoading: false,
            });
            throw error;
        }
    },

    clearCurrentOrder: () => set({ currentOrder: null }),
}));
