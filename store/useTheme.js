import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appearance } from "react-native";
import api from "../services/api";

// Storage key for persisting theme
const THEME_STORAGE_KEY = "@anand_mobiles_theme";
const THEME_PREFERENCE_KEY = "@anand_mobiles_theme_preference";

// Light mode colors - matching backend defaults
const lightColors = {
  primary: "#3b82f6", // blue-500 (backend default)
  primaryDark: "#2563eb", // blue-600
  primaryLight: "#dbeafe", // blue-100
  secondary: "#10b981", // emerald-500
  secondaryDark: "#059669", // emerald-600
  accent: "#8b5cf6", // violet-500
  background: "#ffffff", // white
  backgroundSecondary: "#f9fafb", // gray-50
  surface: "#ffffff", // white
  surfaceSecondary: "#f3f4f6", // gray-100
  text: "#111827", // gray-900
  textSecondary: "#6b7280", // gray-500
  textLight: "#9ca3af", // gray-400
  border: "#e5e7eb", // gray-200
  borderLight: "#f3f4f6", // gray-100
  error: "#ef4444", // red-500
  errorLight: "#fee2e2", // red-100
  success: "#10b981", // emerald-500
  successLight: "#d1fae5", // emerald-100
  warning: "#f59e0b", // amber-500
  warningLight: "#fef3c7", // amber-100
  info: "#3b82f6", // blue-500
  infoLight: "#dbeafe", // blue-100
  white: "#ffffff",
  black: "#000000",
  inputBg: "#ffffff",
  cardBg: "#ffffff",
  overlay: "rgba(0, 0, 0, 0.5)",
  headerBg: "#3b82f6", // primary color for header
  tabBarBg: "#ffffff",
  tabBarActive: "#3b82f6",
  tabBarInactive: "#9ca3af",
};

// Dark mode colors
const darkColors = {
  primary: "#60a5fa", // blue-400
  primaryDark: "#3b82f6", // blue-500
  primaryLight: "#1e3a5f", // custom dark blue
  secondary: "#34d399", // emerald-400
  secondaryDark: "#10b981", // emerald-500
  accent: "#a78bfa", // violet-400
  background: "#111827", // gray-900
  backgroundSecondary: "#1f2937", // gray-800
  surface: "#1f2937", // gray-800
  surfaceSecondary: "#374151", // gray-700
  text: "#f9fafb", // gray-50
  textSecondary: "#9ca3af", // gray-400
  textLight: "#6b7280", // gray-500
  border: "#374151", // gray-700
  borderLight: "#4b5563", // gray-600
  error: "#f87171", // red-400
  errorLight: "#450a0a", // red-950
  success: "#34d399", // emerald-400
  successLight: "#064e3b", // emerald-900
  warning: "#fbbf24", // amber-400
  warningLight: "#451a03", // amber-950
  info: "#60a5fa", // blue-400
  infoLight: "#1e3a5f", // custom dark blue
  white: "#ffffff",
  black: "#000000",
  inputBg: "#1f2937", // gray-800
  cardBg: "#1f2937", // gray-800
  overlay: "rgba(0, 0, 0, 0.7)",
  headerBg: "#1f2937", // gray-800
  tabBarBg: "#1f2937",
  tabBarActive: "#60a5fa",
  tabBarInactive: "#6b7280",
};

// Default theme configuration
const defaultTheme = {
  colors: lightColors,
  mode: "light",
};

// Helper to generate derived colors from primary
const generateDerivedColors = (primaryColor, mode = "light") => {
  // Simple color manipulation - you can enhance this
  return {
    primaryDark: primaryColor,
    primaryLight: mode === "light" ? `${primaryColor}20` : `${primaryColor}40`,
    headerBg: primaryColor,
    tabBarActive: primaryColor,
    info: primaryColor,
  };
};

export const useTheme = create((set, get) => ({
  colors: defaultTheme.colors,
  mode: defaultTheme.mode,
  themePreference: "system", // 'light', 'dark', or 'system'
  isLoading: false,
  isInitialized: false,
  error: null,
  lastFetched: null,
  appearanceSubscription: null, // Store the subscription reference

  // Initialize theme from storage and fetch from backend
  initializeTheme: async () => {
    try {
      set({ isLoading: true });

      // Load theme preference (system/light/dark)
      const savedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
      const themePreference = savedPreference || "system";

      // Determine actual mode based on preference
      let actualMode = "light";
      if (themePreference === "system") {
        const systemColorScheme = Appearance.getColorScheme();
        actualMode = systemColorScheme === "dark" ? "dark" : "light";
      } else {
        actualMode = themePreference;
      }

      // Try to load cached theme from AsyncStorage
      const cachedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (cachedTheme) {
        const parsed = JSON.parse(cachedTheme);
        const baseColors = actualMode === "dark" ? darkColors : lightColors;
        set({
          colors: { ...baseColors, ...parsed.colors },
          mode: actualMode,
          themePreference: themePreference,
        });
      } else {
        const baseColors = actualMode === "dark" ? darkColors : lightColors;
        set({
          mode: actualMode,
          themePreference: themePreference,
          colors: baseColors,
        });
      }

      // Listen to system theme changes if preference is 'system'
      if (themePreference === "system") {
        const subscription = Appearance.addChangeListener(({ colorScheme }) => {
          const newMode = colorScheme === "dark" ? "dark" : "light";
          get().applyMode(newMode);
        });
        set({ appearanceSubscription: subscription });
      }

      // Fetch latest theme from backend
      await get().fetchTheme();

      set({ isInitialized: true, isLoading: false });
    } catch (error) {
      console.error("Failed to initialize theme:", error);
      set({ isInitialized: true, isLoading: false });
    }
  },

  // Action to update the entire theme from backend
  fetchTheme: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get("/admin/theme/public/");
      if (response.data && response.data.success && response.data.theme) {
        const { colors: backendColors } = response.data.theme;

        // Use the user's current mode preference, NOT the backend mode
        const currentMode = get().mode;

        // Get base colors based on user's current mode
        const baseColors = currentMode === "dark" ? darkColors : lightColors;

        // Generate derived colors from primary if primary was updated
        const derivedColors = backendColors?.primary
          ? generateDerivedColors(backendColors.primary, currentMode)
          : {};

        // Merge: base colors <- derived colors <- backend colors
        const mergedColors = {
          ...baseColors,
          ...derivedColors,
          ...backendColors,
        };

        // Save to state - keep user's mode
        set({
          colors: mergedColors,
          isLoading: false,
          lastFetched: new Date().toISOString(),
        });

        // Persist backend colors to AsyncStorage (without overriding mode)
        await AsyncStorage.setItem(
          THEME_STORAGE_KEY,
          JSON.stringify({
            colors: backendColors,
            mode: currentMode,
          }),
        );
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Failed to fetch theme:", error);
      set({ error: error.message, isLoading: false });
    }
  },

  // Helper to apply mode without changing preference
  applyMode: async (newMode) => {
    const baseColors = newMode === "dark" ? darkColors : lightColors;
    const cachedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    let customColors = {};
    if (cachedTheme) {
      const parsed = JSON.parse(cachedTheme);
      customColors = parsed.colors || {};
    }

    const derivedColors = customColors.primary
      ? generateDerivedColors(customColors.primary, newMode)
      : {};

    const mergedColors = {
      ...baseColors,
      ...derivedColors,
      ...customColors,
    };

    set({
      mode: newMode,
      colors: mergedColors,
    });
  },

  // Set theme preference (system/light/dark)
  setThemePreference: async (preference) => {
    if (!["system", "light", "dark"].includes(preference)) return;

    // Remove existing appearance listener if any
    const currentSubscription = get().appearanceSubscription;
    if (currentSubscription) {
      currentSubscription.remove();
      set({ appearanceSubscription: null });
    }

    set({ themePreference: preference });
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);

    // Determine actual mode
    let actualMode = "light";
    if (preference === "system") {
      const systemColorScheme = Appearance.getColorScheme();
      actualMode = systemColorScheme === "dark" ? "dark" : "light";

      // Add listener for system changes
      const subscription = Appearance.addChangeListener(({ colorScheme }) => {
        const newMode = colorScheme === "dark" ? "dark" : "light";
        get().applyMode(newMode);
      });
      set({ appearanceSubscription: subscription });
    } else {
      actualMode = preference;
    }

    await get().applyMode(actualMode);
  },

  // Toggle between light and dark mode (legacy - for manual toggle)
  toggleMode: async () => {
    const currentMode = get().mode;
    const newMode = currentMode === "light" ? "dark" : "light";
    await get().setThemePreference(newMode);
  },

  // Set mode explicitly
  setMode: async (mode) => {
    if (mode !== "light" && mode !== "dark") return;

    const baseColors = mode === "dark" ? darkColors : lightColors;

    const cachedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
    let customColors = {};
    if (cachedTheme) {
      const parsed = JSON.parse(cachedTheme);
      customColors = parsed.colors || {};
    }

    const derivedColors = customColors.primary
      ? generateDerivedColors(customColors.primary, mode)
      : {};

    const mergedColors = {
      ...baseColors,
      ...derivedColors,
      ...customColors,
    };

    set({
      mode: mode,
      colors: mergedColors,
    });

    await AsyncStorage.setItem(
      THEME_STORAGE_KEY,
      JSON.stringify({
        colors: customColors,
        mode: mode,
      }),
    );
  },

  // Action to update the entire theme manually
  setTheme: (newColors) =>
    set((state) => ({
      colors: { ...state.colors, ...newColors },
    })),

  // Action to update a specific color
  updateColor: (key, value) =>
    set((state) => ({
      colors: {
        ...state.colors,
        [key]: value,
      },
    })),

  // Action to reset to default
  resetTheme: async () => {
    set({ colors: defaultTheme.colors, mode: defaultTheme.mode });
    await AsyncStorage.removeItem(THEME_STORAGE_KEY);
  },

  // Get computed styles helpers
  getButtonStyle: (variant = "primary") => {
    const { colors } = get();
    switch (variant) {
      case "secondary":
        return {
          backgroundColor: colors.secondary,
          textColor: colors.white,
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          borderColor: colors.primary,
          textColor: colors.primary,
        };
      case "ghost":
        return {
          backgroundColor: "transparent",
          textColor: colors.primary,
        };
      default:
        return {
          backgroundColor: colors.primary,
          textColor: colors.white,
        };
    }
  },

  // Get isDarkMode helper
  isDarkMode: () => get().mode === "dark",
}));
