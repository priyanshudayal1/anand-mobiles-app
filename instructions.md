# Anand Mobiles - Development Instructions

> Follow these guidelines when developing new features or components.

---

## Quick Reference

| Aspect | Guideline |
|--------|-----------|
| **Colors** | Always use `useTheme()` hook - NEVER hardcode colors |
| **API Calls** | Use Zustand stores - NEVER call `api` directly in screens |
| **Icons** | Use `lucide-react-native` or `@expo/vector-icons` |
| **Lists** | Use `@shopify/flash-list` for performance |
| **Components** | Create reusable components in `components/` folder |

---

## 1. Theme & Colors

### Always Use Theme Colors

```javascript
import { useTheme } from "../store/useTheme";

const MyComponent = () => {
    const { colors, isDarkMode } = useTheme();
    
    return (
        <View style={{ backgroundColor: colors.background }}>
            <Text style={{ color: colors.text }}>Hello</Text>
            <TouchableOpacity style={{ backgroundColor: colors.primary }}>
                <Text style={{ color: colors.white }}>Button</Text>
            </TouchableOpacity>
        </View>
    );
};
```

### Available Color Tokens

| Token | Usage |
|-------|-------|
| `colors.primary` | Primary brand color (buttons, links, highlights) |
| `colors.secondary` | Secondary actions |
| `colors.accent` | Accent highlights |
| `colors.background` | Main app background |
| `colors.backgroundSecondary` | Cards, sections background |
| `colors.surface` | Card surfaces |
| `colors.text` | Primary text |
| `colors.textSecondary` | Secondary/muted text |
| `colors.border` | Borders and dividers |
| `colors.error` | Error states |
| `colors.success` | Success states |
| `colors.warning` | Warning states |
| `colors.cardBg` | Card backgrounds |
| `colors.white` / `colors.black` | Pure white/black |

### ❌ Never Do This
```javascript
// BAD - Hardcoded colors
<View style={{ backgroundColor: "#ffffff" }}>
<Text style={{ color: "#333333" }}>
```

### ✅ Always Do This
```javascript
// GOOD - Theme colors
<View style={{ backgroundColor: colors.background }}>
<Text style={{ color: colors.text }}>
```

---

## 2. State Management (Zustand Stores)

### Rule: All API calls go through stores

Screens should ONLY consume state from stores. Never import `api` directly in screen files.

### Existing Stores

| Store | File | Purpose |
|-------|------|---------|
| `useAuthStore` | `store/useAuth.js` | Authentication, user profile |
| `useTheme` | `store/useTheme.js` | Theme colors, dark mode |
| `useHome` | `store/useHome.js` | Home page data (banners, categories, featured) |
| `useProducts` | `store/useProducts.js` | Product listing, filtering, search |
| `useOrderStore` | `store/useOrder.js` | Orders list, order details |
| `useAddressStore` | `store/useAddress.js` | User addresses CRUD |
| `useWishlistStore` | `store/useWishlist.js` | Wishlist management |
| `useCartStore` | `store/useCart.js` | Cart management |

### Using a Store in a Screen

```javascript
import { useOrderStore } from "../store/useOrder";

export default function OrdersScreen() {
    const { orders, isLoading, error, getAllOrders } = useOrderStore();
    
    useEffect(() => {
        getAllOrders();
    }, []);
    
    if (isLoading) return <ActivityIndicator />;
    
    return (
        <FlatList
            data={orders}
            renderItem={({ item }) => <OrderCard order={item} />}
        />
    );
}
```

### Creating a New Store

```javascript
// store/useExample.js
import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useExampleStore = create((set, get) => ({
    // State
    items: [],
    isLoading: false,
    error: null,

    // Actions
    fetchItems: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get(API_ENDPOINTS.example);
            set({ items: response.data.items || [], isLoading: false });
        } catch (error) {
            set({ 
                error: error.response?.data?.error || "Failed to fetch",
                isLoading: false 
            });
        }
    },

    addItem: async (data) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post(API_ENDPOINTS.exampleAdd, data);
            set((state) => ({
                items: [...state.items, response.data.item],
                isLoading: false,
            }));
            return { success: true };
        } catch (error) {
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    clearError: () => set({ error: null }),
}));
```

---

## 3. API Configuration

### Use the API Instance

```javascript
// services/api.js - Already configured with auth interceptor
import api from "../services/api";

// Usage in stores:
const response = await api.get("/users/orders/");
const response = await api.post("/users/cart/add/", { product_id: 123 });
```

### API Endpoints (constants/constants.js)

```javascript
import { API_ENDPOINTS } from "../constants/constants";

// Usage:
api.get(API_ENDPOINTS.orders);
api.get(API_ENDPOINTS.orderDetails(orderId));
```

---

## 4. Reusable Components

### Component Location

```
components/
├── CustomButton.jsx      # App-wide button
├── CustomInput.jsx       # App-wide input
├── ThemeProvider.jsx     # Theme wrapper
└── home/                 # Feature-specific
    ├── ProductCard.jsx
    ├── CategoryGrid.jsx
    └── ...
```

### Component Pattern

```javascript
import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../store/useTheme";

const MyComponent = ({
    title,
    onPress,
    variant = "primary",  // Support variants
    disabled = false,     // Support disabled state
    isLoading = false,    // Support loading state
}) => {
    const { colors } = useTheme();  // Always use theme
    
    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || isLoading}
            style={{
                backgroundColor: variant === "primary" ? colors.primary : colors.secondary,
                opacity: disabled ? 0.5 : 1,
                // ... other styles using colors
            }}
        >
            {isLoading ? (
                <ActivityIndicator color={colors.white} />
            ) : (
                <Text style={{ color: colors.white }}>{title}</Text>
            )}
        </TouchableOpacity>
    );
};

export default MyComponent;
```

---

## 5. Available Packages

### Icons
```javascript
// Primary - Lucide Icons
import { Home, ShoppingCart, Heart, User, ChevronRight } from "lucide-react-native";
<Home size={24} color={colors.primary} />

// Alternative - Expo Vector Icons
import { Ionicons, Feather, MaterialIcons } from "@expo/vector-icons";
<Ionicons name="heart-outline" size={24} color={colors.primary} />
```

### Images
```javascript
import { Image } from "expo-image";

<Image
    source={{ uri: imageUrl }}
    style={{ width: 100, height: 100 }}
    contentFit="contain"
    transition={200}
/>
```

### Lists (High Performance)
```javascript
import { FlashList } from "@shopify/flash-list";

<FlashList
    data={products}
    numColumns={2}
    estimatedItemSize={200}
    renderItem={({ item }) => <ProductCard product={item} />}
    keyExtractor={(item) => item.id.toString()}
/>
```

### Animations
```javascript
import { MotiView } from "moti";

<MotiView
    from={{ opacity: 0, translateY: 20 }}
    animate={{ opacity: 1, translateY: 0 }}
    transition={{ type: "timing", duration: 400 }}
>
    {children}
</MotiView>
```

### Bottom Sheets
```javascript
import BottomSheet from "@gorhom/bottom-sheet";

const sheetRef = useRef(null);
const snapPoints = useMemo(() => ["25%", "50%", "90%"], []);

<BottomSheet ref={sheetRef} snapPoints={snapPoints}>
    <View>{content}</View>
</BottomSheet>
```

### Safe Area
```javascript
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

const insets = useSafeAreaInsets();

<SafeAreaView style={{ flex: 1 }} edges={["top"]}>
    {content}
</SafeAreaView>
```

### Status Bar
```javascript
import { StatusBar } from "expo-status-bar";

<StatusBar style={isDarkMode() ? "light" : "dark"} />
```

---

## 6. Screen Template

```javascript
import React, { useEffect } from "react";
import {
    View,
    Text,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
    RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../store/useTheme";
import { useExampleStore } from "../store/useExample";

export default function ExampleScreen() {
    const router = useRouter();
    const { colors, isDarkMode } = useTheme();
    const { items, isLoading, error, fetchItems } = useExampleStore();
    const [refreshing, setRefreshing] = React.useState(false);

    useEffect(() => {
        fetchItems();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchItems();
        setRefreshing(false);
    };

    if (isLoading && !refreshing) {
        return (
            <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
                <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode() ? "light" : "dark"} />
            
            {/* Header */}
            <View style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
            }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={{ 
                    fontSize: 20, 
                    fontWeight: "bold", 
                    color: colors.text,
                    marginLeft: 16 
                }}>
                    Screen Title
                </Text>
            </View>

            {/* Content */}
            <FlatList
                data={items}
                renderItem={({ item }) => (
                    <View style={{ 
                        padding: 16, 
                        backgroundColor: colors.surface,
                        marginBottom: 8,
                        borderRadius: 12,
                    }}>
                        <Text style={{ color: colors.text }}>{item.name}</Text>
                    </View>
                )}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={{ padding: 16 }}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={{ alignItems: "center", marginTop: 50 }}>
                        <Text style={{ color: colors.textSecondary }}>
                            No items found
                        </Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}
```

---

## 7. Common Patterns

### Loading State
```javascript
if (isLoading) {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={{ marginTop: 16, color: colors.textSecondary }}>Loading...</Text>
        </View>
    );
}
```

### Empty State
```javascript
<View style={{ alignItems: "center", marginTop: 80, padding: 20 }}>
    <Ionicons name="cart-outline" size={60} color={colors.textSecondary} />
    <Text style={{ fontSize: 18, fontWeight: "bold", color: colors.text, marginTop: 16 }}>
        Your Cart is Empty
    </Text>
    <Text style={{ color: colors.textSecondary, textAlign: "center", marginTop: 8 }}>
        Start shopping to add items to your cart.
    </Text>
    <TouchableOpacity
        onPress={() => router.push("/(tabs)")}
        style={{ backgroundColor: colors.primary, padding: 12, borderRadius: 8, marginTop: 24 }}
    >
        <Text style={{ color: "#FFF", fontWeight: "600" }}>Start Shopping</Text>
    </TouchableOpacity>
</View>
```

### Pull-to-Refresh
```javascript
<FlatList
    refreshControl={
        <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
        />
    }
/>
```

### Error Handling
```javascript
try {
    await someAction();
    Alert.alert("Success", "Operation completed!");
} catch (error) {
    Alert.alert("Error", error.message || "Something went wrong");
}
```

---

## 8. Checklist Before Committing

- [ ] No hardcoded colors (use `colors.xxx`)
- [ ] No direct `api` imports in screens (use stores)
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Error states handled
- [ ] Pull-to-refresh implemented where applicable
- [ ] Used existing stores if available
- [ ] Created store for new features
- [ ] Reusable components in `components/` folder
- [ ] Tested in both light and dark mode
