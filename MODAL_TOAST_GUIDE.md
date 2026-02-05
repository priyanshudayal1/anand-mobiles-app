# Custom Modal and Toast Components

This document explains how to use the reusable Modal and Toast components in the Anand Mobiles app.

## 🎨 Features

- **Theme-aware**: Both components automatically adapt to the admin-configured theme colors
- **Type-based styling**: Different visual styles for success, error, warning, info, and confirm types
- **Smooth animations**: Beautiful entrance/exit animations
- **Customizable**: Support for custom buttons, messages, and positions

---

## 📦 Components

### 1. CustomModal

A reusable modal component for confirmations and important messages.

#### Location
`components/common/CustomModal.jsx`

#### Import
```javascript
import CustomModal from "../components/common/CustomModal";
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `visible` | boolean | `false` | Controls modal visibility |
| `onClose` | function | required | Callback when modal is closed |
| `title` | string | required | Modal title |
| `message` | string | - | Modal message/description |
| `type` | string | `"info"` | Modal type: `'info'`, `'success'`, `'warning'`, `'error'`, `'confirm'` |
| `buttons` | array | - | Array of button configs (see below) |
| `children` | node | - | Custom content (overrides message) |
| `showCloseButton` | boolean | `true` | Show X button in header |
| `size` | string | `"md"` | Modal size: `'sm'`, `'md'`, `'lg'` |

#### Button Configuration

```javascript
{
  text: "Button Label",           // Button text
  variant: "primary",              // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  onPress: () => {},              // Callback function
  closeOnPress: true              // Auto-close modal after press (default: true)
}
```

#### Usage Examples

##### 1. Success Modal
```javascript
const [showSuccess, setShowSuccess] = useState(false);

<CustomModal
  visible={showSuccess}
  onClose={() => setShowSuccess(false)}
  type="success"
  title="Order Placed!"
  message="Your order has been placed successfully."
  buttons={[
    { text: "OK", variant: "primary", onPress: () => setShowSuccess(false) }
  ]}
/>
```

##### 2. Confirmation Modal
```javascript
const [showConfirm, setShowConfirm] = useState(false);

<CustomModal
  visible={showConfirm}
  onClose={() => setShowConfirm(false)}
  type="confirm"
  title="Delete Item"
  message="Are you sure you want to delete this item?"
  buttons={[
    { text: "Cancel", variant: "outline", onPress: () => setShowConfirm(false) },
    { text: "Delete", variant: "danger", onPress: handleDelete }
  ]}
/>
```

##### 3. Error Modal
```javascript
<CustomModal
  visible={showError}
  onClose={() => setShowError(false)}
  type="error"
  title="Payment Failed"
  message="There was an error processing your payment. Please try again."
/>
```

##### 4. Custom Content Modal
```javascript
<CustomModal
  visible={showCustom}
  onClose={() => setShowCustom(false)}
  type="info"
  title="Order Details"
  size="lg"
>
  <View>
    <Text>Custom content goes here</Text>
    <Text>Order ID: #12345</Text>
    {/* Any custom JSX */}
  </View>
</CustomModal>
```

---

### 2. CustomToast (with useToast hook)

A lightweight toast notification system for non-blocking messages.

#### Location
- Component: `components/common/CustomToast.jsx`
- Store: `store/useToast.js`
- Container: `components/common/ToastContainer.jsx`

#### Setup (Already Done)

The `ToastContainer` is already added to the root layout (`app/_layout.jsx`):

```javascript
import ToastContainer from "../components/common/ToastContainer";

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <BottomSheetModalProvider>
          <RootLayoutNav />
          <ToastContainer />
        </BottomSheetModalProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

#### Import
```javascript
import { useToast } from "../store/useToast";
```

#### Methods

```javascript
const { success, error, info, warning } = useToast();

// Show success toast
success("Item added to cart!");

// Show error toast
error("Failed to load data");

// Show info toast
info("This feature is coming soon");

// Show warning toast
warning("Low stock alert");

// Custom toast with options
const { showToast } = useToast();
showToast({
  type: "success",
  message: "Operation completed",
  duration: 5000,  // default: 3000ms
  position: "top"  // "top" or "bottom"
});
```

#### Usage Examples

##### 1. In a Screen Component
```javascript
import { useToast } from "../store/useToast";

export default function ProductScreen() {
  const { success, error } = useToast();
  
  const handleAddToCart = async () => {
    try {
      await addToCart(productId);
      success("Product added to cart!");
    } catch (err) {
      error(err.message || "Failed to add to cart");
    }
  };
  
  return (
    <View>
      {/* Your UI */}
    </View>
  );
}
```

##### 2. In a Store (Zustand)
```javascript
import { useToast } from "./useToast";

export const useCartStore = create((set) => ({
  addToCart: async (productId) => {
    try {
      // API call
      useToast.getState().success("Added to cart!");
    } catch (error) {
      useToast.getState().error("Failed to add to cart");
    }
  }
}));
```

##### 3. Different Toast Types
```javascript
const { success, error, info, warning } = useToast();

// Success - green
success("Profile updated successfully!");

// Error - red
error("Network connection failed");

// Info - blue
info("New version available");

// Warning - yellow
warning("Your session will expire soon");
```

---

## 🎯 When to Use What?

### Use **Modal** for:
- ✅ Confirmations (delete, logout, clear data)
- ✅ Important success messages that require acknowledgment
- ✅ Multi-step choices or decisions
- ✅ Critical errors that block user flow
- ✅ Forms or data input

### Use **Toast** for:
- ✅ Success notifications (item added, saved, updated)
- ✅ Non-critical errors (failed to load optional data)
- ✅ Info messages (tips, hints, status updates)
- ✅ Warning messages (low stock, expiring soon)
- ✅ Quick feedback that doesn't interrupt flow

---

## 🎨 Theme Colors

Both components automatically use these theme colors from `useTheme()`:

```javascript
colors.primary      // Primary brand color
colors.success      // Success green
colors.error        // Error red
colors.warning      // Warning yellow
colors.surface      // Modal/toast background
colors.text         // Primary text
colors.textSecondary // Secondary text
colors.border       // Borders
colors.white        // Button text on colored backgrounds
```

All colors are controlled by the admin from the backend, ensuring consistent branding across the app.

---

## 📝 Migration Guide

### Before (Old Alert.alert)
```javascript
Alert.alert(
  "Success",
  "Item added to cart",
  [
    { text: "OK" },
    { text: "View Cart", onPress: () => router.push("/cart") }
  ]
);
```

### After (New Modal - for confirmations with actions)
```javascript
const [showModal, setShowModal] = useState(false);

<CustomModal
  visible={showModal}
  onClose={() => setShowModal(false)}
  type="success"
  title="Added to Cart"
  message="Item has been added to your cart"
  buttons={[
    { text: "Continue Shopping", variant: "outline" },
    { text: "View Cart", variant: "primary", onPress: () => router.push("/cart") }
  ]}
/>
```

### After (New Toast - for simple notifications)
```javascript
import { useToast } from "../store/useToast";

const { success } = useToast();

// Simple one-liner
success("Item added to cart!");
```

---

## ✨ Best Practices

1. **Use toasts for most notifications** - They're less intrusive
2. **Use modals for confirmations** - When user needs to make a choice
3. **Keep toast messages short** - max 1-2 lines
4. **Use appropriate types** - Colors help users understand message importance
5. **Don't stack too many toasts** - They auto-dismiss after 3 seconds
6. **Test in both light and dark mode** - Components adapt automatically

---

## 🚀 Future Enhancements

Potential improvements:
- Toast queue management for multiple rapid toasts
- Swipe-to-dismiss gesture for toasts
- Modal slide-in from different directions
- Custom animations per modal type
- Haptic feedback integration

---

## 📚 Related Files

- `components/common/CustomModal.jsx` - Modal component
- `components/common/CustomToast.jsx` - Toast component
- `components/common/ToastContainer.jsx` - Toast container
- `store/useToast.js` - Toast state management
- `app/_layout.jsx` - Root layout with ToastContainer

---

## 💡 Tips

- Import toast hooks at the top of your component
- State for modals should be managed in the component
- Use async/await properly when showing notifications after API calls
- Test edge cases like rapid button clicks
- Consider accessibility when designing modal flows
