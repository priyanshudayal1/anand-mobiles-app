import React from "react";
import { View } from "react-native";
import CustomToast from "./CustomToast";
import { useToast } from "../../store/useToast";

/**
 * Toast Container
 * Renders all active toasts
 * Add this to your root layout (_layout.jsx)
 */
const ToastContainer = () => {
  const { toasts, hideToast } = useToast();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
      }}
    >
      {toasts.map((toast) => (
        <CustomToast
          key={toast.id}
          visible={toast.visible}
          type={toast.type}
          message={toast.message}
          position={toast.position}
          onHide={() => hideToast(toast.id)}
        />
      ))}
    </View>
  );
};

export default ToastContainer;
