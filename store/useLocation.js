import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

// Default location (Bhopal)
const DEFAULT_LOCATION = {
    city: 'Bhopal',
    state: 'MP',
    pincode: '462016',
    country: 'India',
    area: '',
    latitude: 23.2599,
    longitude: 77.4126
};

export const useLocationStore = create(
    persist(
        (set, get) => ({
            // State
            location: {
                ...DEFAULT_LOCATION,
                loading: false,
                error: null,
            },

            // Actions
            setLocationLoading: (loading) => set(state => ({
                location: { ...state.location, loading }
            })),

            setLocationError: (error) => set(state => ({
                location: { ...state.location, error, loading: false }
            })),

            updateLocation: (newLocation) => set(state => ({
                location: {
                    ...state.location,
                    ...newLocation,
                    loading: false,
                    error: null
                }
            })),


            // Update location manually by pincode (using Nominatim like web)
            updateLocationByPincode: async (pincode) => {
                const { setLocationLoading, updateLocation } = get();

                try {
                    setLocationLoading(true);

                    // Validation
                    if (!/^\d{6}$/.test(pincode)) {
                        set(state => ({
                            location: { ...state.location, error: 'Invalid pincode format', loading: false }
                        }));
                        return { success: false, error: 'Invalid pincode format' };
                    }

                    // Use OpenStreetMap Nominatim API (same as web)
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/search?postalcode=${pincode}&country=in&format=json&addressdetails=1&limit=1`,
                        {
                            headers: {
                                'User-Agent': 'AnandMobilesApp/1.0'
                            }
                        }
                    );

                    if (response.ok) {
                        const data = await response.json();

                        if (data && data.length > 0) {
                            const result = data[0];
                            const address = result.address;

                            const newLocation = {
                                city: address.city || address.town || address.village || address.state_district || DEFAULT_LOCATION.city,
                                state: address.state || DEFAULT_LOCATION.state,
                                pincode: address.postcode || pincode,
                                country: address.country || DEFAULT_LOCATION.country,
                                area: address.suburb || address.neighbourhood || '',
                                latitude: parseFloat(result.lat),
                                longitude: parseFloat(result.lon)
                            };

                            updateLocation(newLocation);
                            return { success: true, location: newLocation };
                        }
                    }

                    // Fallback if not found
                    throw new Error('Pincode not found');

                } catch (error) {
                    console.error('Pincode update error:', error);
                    set(state => ({
                        location: { ...state.location, error: 'Could not fetch location details', loading: false }
                    }));
                    return { success: false, error: error.message };
                }
            },
        }),
        {
            name: 'location-storage',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
