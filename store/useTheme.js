import { create } from 'zustand';

// Default theme colors matching the reference site (Teal/White/Gray)
const defaultTheme = {
  colors: {
    primary: '#0d9488', // teal-600
    primaryDark: '#0f766e', // teal-700
    secondary: '#ffffff', // white
    background: '#f9fafb', // gray-50
    text: '#111827', // gray-900
    textSecondary: '#6b7280', // gray-500
    border: '#e5e7eb', // gray-200
    error: '#ef4444', // red-500
    success: '#22c55e', // green-500
    white: '#ffffff',
    black: '#000000',
    inputBg: '#ffffff',
  },
};

export const useTheme = create((set) => ({
  colors: defaultTheme.colors,
  
  // Action to update the entire theme
  setTheme: (newColors) => set((state) => ({
    colors: { ...state.colors, ...newColors }
  })),

  // Action to update a specific color
  updateColor: (key, value) => set((state) => ({
    colors: {
      ...state.colors,
      [key]: value
    }
  })),

  // Action to reset to default
  resetTheme: () => set({ colors: defaultTheme.colors }),
}));
