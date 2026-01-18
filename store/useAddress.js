import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useAddressStore = create((set, get) => ({
    addresses: [],
    isLoading: false,
    error: null,

    // Fetch all addresses
    fetchAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.addresses || "/users/addresses/");
            const addressList = response.data.addresses || response.data || [];
            set({ addresses: addressList, isLoading: false });
            return addressList;
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to fetch addresses";
            set({ error: msg, isLoading: false });
            console.error("Failed to fetch addresses:", error);
            throw error;
        }
    },

    // Add new address
    addAddress: async (addressData) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(API_ENDPOINTS.addAddress || "/users/addresses/add/", addressData);
            const newAddress = response.data.address || response.data;

            set((state) => ({
                addresses: [...state.addresses, newAddress],
                isLoading: false,
            }));

            return { success: true, address: newAddress };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to add address";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Update existing address
    updateAddress: async (addressId, addressData) => {
        set({ isLoading: true, error: null });
        try {
            const endpoint = typeof API_ENDPOINTS.updateAddress === 'function'
                ? API_ENDPOINTS.updateAddress(addressId)
                : `/users/addresses/${addressId}/update/`;

            const response = await api.put(endpoint, addressData);
            const updatedAddress = response.data.address || response.data;

            set((state) => ({
                addresses: state.addresses.map((addr) =>
                    addr.id === addressId ? { ...addr, ...updatedAddress } : addr
                ),
                isLoading: false,
            }));

            return { success: true, address: updatedAddress };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to update address";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        set({ isLoading: true, error: null });
        try {
            const endpoint = typeof API_ENDPOINTS.deleteAddress === 'function'
                ? API_ENDPOINTS.deleteAddress(addressId)
                : `/users/addresses/${addressId}/delete/`;

            await api.delete(endpoint);

            set((state) => ({
                addresses: state.addresses.filter((addr) => addr.id !== addressId),
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to delete address";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Set default address
    setDefaultAddress: async (addressId) => {
        set({ isLoading: true, error: null });
        try {
            const endpoint = `/users/addresses/${addressId}/set-default/`;
            await api.post(endpoint);

            set((state) => ({
                addresses: state.addresses.map((addr) => ({
                    ...addr,
                    is_default: addr.id === addressId,
                })),
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || error.response?.data?.detail || "Failed to set default address";
            set({ error: msg, isLoading: false });
            throw error;
        }
    },

    // Get default address
    getDefaultAddress: () => {
        const { addresses } = get();
        return addresses.find((addr) => addr.is_default) || addresses[0] || null;
    },

    // Clear error
    clearError: () => set({ error: null }),

    // Reset store
    reset: () => set({ addresses: [], isLoading: false, error: null }),
}));
