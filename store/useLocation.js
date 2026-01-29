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

            // Detect current location
            detectLocation: async () => {
                const { setLocationLoading, setLocationError, updateLocation } = get();

                try {
                    setLocationLoading(true);

                    // Request permission
                    const { status } = await Location.requestForegroundPermissionsAsync();

                    if (status !== 'granted') {
                        setLocationError('Permission to access location was denied');
                        return false;
                    }

                    // Get current position
                    const location = await Location.getCurrentPositionAsync({
                        accuracy: Location.Accuracy.Balanced,
                    });

                    const { latitude, longitude } = location.coords;

                    // Reverse geocode
                    const [address] = await Location.reverseGeocodeAsync({
                        latitude,
                        longitude
                    });

                    if (address) {
                        updateLocation({
                            city: address.city || address.subregion || DEFAULT_LOCATION.city,
                            state: address.region || DEFAULT_LOCATION.state,
                            pincode: address.postalCode || DEFAULT_LOCATION.pincode,
                            country: address.country || DEFAULT_LOCATION.country,
                            area: address.district || address.street || '',
                            latitude,
                            longitude,
                        });
                        return true;
                    } else {
                        throw new Error('Could not fetch address details');
                    }

                } catch (error) {
                    console.error('Location detection error:', error);
                    setLocationError('Failed to detect location');
                    return false;
                }
            },

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
