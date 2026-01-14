import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { useTheme } from "../store/useTheme";
import { THEME_REFRESH_INTERVAL } from "../constants/constants";

/**
 * ThemeProvider component that initializes and manages the theme
 * Wraps the app content and ensures theme is loaded before rendering
 */
const ThemeProvider = ({ children, showLoadingIndicator = false }) => {
  const { initializeTheme, fetchTheme, isInitialized, isLoading, colors } =
    useTheme();

  // Initialize theme on mount
  useEffect(() => {
    initializeTheme();
  }, [initializeTheme]);

  // Set up periodic theme refresh
  useEffect(() => {
    if (!isInitialized) return;

    // Refresh theme periodically to catch admin changes
    const refreshInterval = setInterval(() => {
      fetchTheme();
    }, THEME_REFRESH_INTERVAL);

    return () => clearInterval(refreshInterval);
  }, [isInitialized, fetchTheme]);

  // Optionally show loading indicator while theme is initializing
  if (showLoadingIndicator && !isInitialized && isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
};

export default ThemeProvider;
