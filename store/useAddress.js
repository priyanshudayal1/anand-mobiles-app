import { create } from "zustand";
import api from "../services/api";

export const useAddressStore = create((set, get) => ({
    addresses: [],
    isLoading: false,
    error: null,

    // Fetch all addresses
    fetchAddresses: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get("/users/addresses/");
            const addressList = response.data.addresses || response.data || [];

            // Transform to ensure consistent format
            const transformedAddresses = addressList.map((addr) => ({
                id: addr.id,
                type: addr.type || "Home",
                street_address: addr.street_address || addr.address || "",
                city: addr.city || "",
                state: addr.state || "",
                postal_code: addr.postal_code || addr.pincode || "",
                phone_number: addr.phone_number || addr.phone || "",
                is_default: addr.is_default || false,
                created_at: addr.created_at,
                updated_at: addr.updated_at,
            }));

            set({ addresses: transformedAddresses, isLoading: false });
            return transformedAddresses;
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to fetch addresses";
            set({ error: msg, isLoading: false, addresses: [] });
            console.error("Failed to fetch addresses:", error);
            return [];
        }
    },

    // Add new address
    addAddress: async (addressData) => {
        set({ isLoading: true, error: null });
        try {
            // Transform to API format
            const apiData = {
                type: addressData.type || addressData.name || "Home",
                street_address: addressData.street_address || addressData.address,
                city: addressData.city,
                state: addressData.state,
                postal_code: addressData.postal_code || addressData.pincode,
                phone_number: addressData.phone_number || addressData.phone,
                is_default: addressData.is_default || false,
            };

            const response = await api.post("/users/addresses/add/", apiData);
            const newAddress = response.data.address || response.data;

            // If this is set as default, update other addresses
            set((state) => {
                let updatedAddresses = state.addresses;
                if (apiData.is_default) {
                    updatedAddresses = state.addresses.map((addr) => ({
                        ...addr,
                        is_default: false,
                    }));
                }
                return {
                    addresses: [...updatedAddresses, {
                        id: response.data.address_id || newAddress.id,
                        ...newAddress,
                        ...apiData,
                    }],
                    isLoading: false,
                };
            });

            return { success: true, address: newAddress };
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to add address";
            set({ error: msg, isLoading: false });
            console.error("Failed to add address:", error);
            return { success: false, error: msg };
        }
    },

    // Update existing address
    updateAddress: async (addressId, addressData) => {
        set({ isLoading: true, error: null });
        try {
            // Transform to API format
            const apiData = {
                type: addressData.type || addressData.name,
                street_address: addressData.street_address || addressData.address,
                city: addressData.city,
                state: addressData.state,
                postal_code: addressData.postal_code || addressData.pincode,
                phone_number: addressData.phone_number || addressData.phone,
                is_default: addressData.is_default || false,
            };

            const response = await api.put(`/users/addresses/update/${addressId}/`, apiData);
            const updatedAddress = response.data.address || response.data;

            set((state) => {
                let updatedAddresses = state.addresses;

                // If this is set as default, update other addresses
                if (apiData.is_default) {
                    updatedAddresses = state.addresses.map((addr) => ({
                        ...addr,
                        is_default: addr.id === addressId,
                    }));
                } else {
                    updatedAddresses = state.addresses.map((addr) =>
                        addr.id === addressId
                            ? { ...addr, ...apiData, ...updatedAddress }
                            : addr
                    );
                }

                return {
                    addresses: updatedAddresses,
                    isLoading: false,
                };
            });

            return { success: true, address: updatedAddress };
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to update address";
            set({ error: msg, isLoading: false });
            console.error("Failed to update address:", error);
            return { success: false, error: msg };
        }
    },

    // Delete address
    deleteAddress: async (addressId) => {
        set({ isLoading: true, error: null });
        try {
            await api.delete(`/users/addresses/delete/${addressId}/`);

            set((state) => ({
                addresses: state.addresses.filter((addr) => addr.id !== addressId),
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to delete address";
            set({ error: msg, isLoading: false });
            console.error("Failed to delete address:", error);
            return { success: false, error: msg };
        }
    },

    // Set default address
    setDefaultAddress: async (addressId) => {
        set({ isLoading: true, error: null });
        try {
            await api.post(`/users/addresses/set-default/${addressId}/`);

            set((state) => ({
                addresses: state.addresses.map((addr) => ({
                    ...addr,
                    is_default: addr.id === addressId,
                })),
                isLoading: false,
            }));

            return { success: true };
        } catch (error) {
            const msg = error.response?.data?.error || "Failed to set default address";
            set({ error: msg, isLoading: false });
            console.error("Failed to set default address:", error);
            return { success: false, error: msg };
        }
    },

    // Get address by ID
    getAddressById: (id) => {
        const { addresses } = get();
        return addresses.find((addr) => addr.id === id) || null;
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
