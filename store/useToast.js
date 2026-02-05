import { create } from "zustand";

/**
 * Toast Store
 * Manages toast notifications throughout the app
 */
export const useToast = create((set) => ({
  toasts: [],
  
  showToast: ({ type = "info", message, duration = 3000, position = "top" }) => {
    const id = Date.now() + Math.random();
    
    set((state) => ({
      toasts: [
        ...state.toasts,
        {
          id,
          type,
          message,
          duration,
          position,
          visible: true,
        },
      ],
    }));

    // Auto-hide after duration
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.map((toast) =>
          toast.id === id ? { ...toast, visible: false } : toast
        ),
      }));

      // Remove from array after animation
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((toast) => toast.id !== id),
        }));
      }, 300);
    }, duration);

    return id;
  },

  hideToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      ),
    }));

    // Remove from array after animation
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((toast) => toast.id !== id),
      }));
    }, 300);
  },

  success: (message, duration) => {
    return useToast.getState().showToast({ type: "success", message, duration });
  },

  error: (message, duration) => {
    return useToast.getState().showToast({ type: "error", message, duration });
  },

  info: (message, duration) => {
    return useToast.getState().showToast({ type: "info", message, duration });
  },

  warning: (message, duration) => {
    return useToast.getState().showToast({ type: "warning", message, duration });
  },
}));
