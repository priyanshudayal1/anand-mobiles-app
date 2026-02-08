# Anand Mobiles - React Native (Expo) Project Documentation

> A comprehensive guide for building a reusable, theme-aware React Native application with backend-controlled UI customization.

---

## Table of Contents
1. [Project Setup](#project-setup)
2. [Project Architecture](#project-architecture)
3. [Theme System (Backend-Controlled)](#theme-system-backend-controlled)
4. [Reusable Component Guidelines](#reusable-component-guidelines)
5. [State Management](#state-management)
6. [API Integration](#api-integration)
7. [Package Reference](#package-reference)

---

## Project Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Android Studio / Xcode (for device emulators)

### Installation
```bash
# Clone and navigate to project
cd anand-mobiles

# Install dependencies
npm install

# Start development server
npx expo start
```

### Environment Configuration
Create a `.env` file in the project root:
```env
EXPO_PUBLIC_BACKEND_URL=http://your-backend-ip:8000/api
```

Update `constants/constants.js` with your backend URL:
```javascript
export const BACKEND_URL = "http://192.168.29.7:8000/api";
```

---

## Project Architecture

### Folder Structure
```
anand-mobiles/
├── app/                    # Expo Router screens (file-based routing)
│   ├── _layout.jsx         # Root layout with ThemeProvider
│   ├── index.jsx           # Entry redirect
│   ├── (auth)/             # Authentication screens group
│   │   ├── _layout.jsx
│   │   ├── welcome.jsx
│   │   ├── login.jsx
│   │   └── register.jsx
│   └── (tabs)/             # Main app tab screens
│       ├── _layout.jsx
│       ├── index.jsx       # Home tab
│       ├── cart.jsx
│       ├── menu.jsx
│       ├── profile.jsx
│       └── more.jsx
├── components/             # Reusable UI components
│   ├── CustomButton.jsx
│   ├── CustomInput.jsx
│   ├── ThemeProvider.jsx
│   └── home/               # Feature-specific components
│       ├── BannerCarousel.jsx
│       ├── CategoryGrid.jsx
│       ├── FeaturedSection.jsx
│       └── HomeHeader.jsx
├── constants/              # App-wide constants and config
│   └── constants.js
├── services/               # API and external service integrations
│   ├── api.js              # Axios instance configuration
│   └── firebaseConfig.js   # Firebase setup (if used)
├── store/                  # Zustand state stores
│   ├── useAuth.js          # Authentication state
│   └── useTheme.js         # Theme/colors state
└── assets/                 # Static assets (images, fonts)
    └── images/
```

### Key Principles
1. **Separation of Concerns**: Keep screens, components, services, and state separate
2. **Reusability**: Build components that accept props and use theme colors
3. **Theming**: All colors come from `useTheme()` hook - never hardcode colors
4. **Type Safety**: Use consistent prop patterns across components

---

## Theme System (Backend-Controlled)

The theme system allows the admin to control app colors from the backend. Colors are fetched from the API and cached locally.

### How It Works

1. **ThemeProvider** wraps the entire app in `app/_layout.jsx`
2. On app start, theme is loaded from AsyncStorage (cache) and then fetched from backend
3. Theme refreshes periodically (every 5 minutes) to catch admin changes
4. Light/Dark mode is supported with proper color palettes

### Theme Store (`store/useTheme.js`)

```javascript
import {useTheme} from '../store/useTheme';

// In any component
const {colors, mode, isDarkMode, toggleMode} = useTheme();

// Use colors directly
<View style={{backgroundColor: colors.background}}>
  <Text style={{color: colors.text}}>Hello</Text>
  <TouchableOpacity style={{backgroundColor: colors.primary}}>
    <Text style={{color: colors.white}}>Button</Text>
  </TouchableOpacity>
</View>
```

### Available Color Tokens
| Token | Light Mode | Dark Mode | Usage |
|-------|------------|-----------|-------|
| `primary` | Backend-controlled | Backend-controlled | Primary brand color |
| `primaryDark` | Darker shade | Darker shade | Hover/pressed states |
| `primaryLight` | Lighter shade | Lighter shade | Backgrounds/badges |
| `secondary` | Emerald | Emerald | Secondary actions |
| `accent` | Violet | Violet | Highlights |
| `background` | White | Gray-900 | Main background |
| `backgroundSecondary` | Gray-50 | Gray-800 | Cards/sections |
| `surface` | White | Gray-800 | Card surfaces |
| `text` | Gray-900 | Gray-50 | Primary text |
| `textSecondary` | Gray-500 | Gray-400 | Secondary text |
| `border` | Gray-200 | Gray-700 | Borders/dividers |
| `error` | Red-500 | Red-400 | Error states |
| `success` | Emerald-500 | Emerald-400 | Success states |
| `warning` | Amber-500 | Amber-400 | Warning states |
| `headerBg` | Primary | Gray-800 | Header background |
| `tabBarBg` | White | Gray-800 | Tab bar background |
| `tabBarActive` | Primary | Blue-400 | Active tab icon |
| `cardBg` | White | Gray-800 | Card backgrounds |

### Backend API Endpoint
The theme is fetched from:
```
GET /api/admin/theme/public/

Response:
{
  "success": true,
  "theme": {
    "colors": {
      "primary": "#3b82f6",
      "secondary": "#10b981",
      "accent": "#8b5cf6"
      // ... other custom colors
    },
    "mode": "light" // or "dark"
  }
}
```

### Theme Provider Integration

Wrap your app with ThemeProvider in `app/_layout.jsx`:
```javascript
import ThemeProvider from '../components/ThemeProvider';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutNav />
    </ThemeProvider>
  );
}
```

---

## Reusable Component Guidelines

### Component Creation Rules

1. **Always use theme colors** - Never hardcode color values
2. **Accept variants via props** - Support different styles through props
3. **Use consistent prop naming** - Follow established patterns
4. **Support loading states** - Include isLoading prop where applicable
5. **Handle disabled states** - Include disabled prop and visual feedback

### Example: Reusable Button Component

```javascript
import React from 'react';
import {Text, TouchableOpacity, ActivityIndicator, View} from 'react-native';
import {useTheme} from '../store/useTheme';

const CustomButton = ({
  title,
  onPress,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost'
  isLoading = false,
  fullWidth = true,
  disabled = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  icon = null,
  iconPosition = 'left', // 'left' | 'right'
}) => {
  const {colors} = useTheme();

  const getBackgroundColor = () => {
    switch (variant) {
      case 'secondary': return colors.secondary;
      case 'outline': return 'transparent';
      case 'ghost': return 'transparent';
      default: return colors.primary;
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'outline': return colors.primary;
      case 'ghost': return colors.primary;
      default: return colors.white;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      style={{
        backgroundColor: getBackgroundColor(),
        borderRadius: 8,
        paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
        paddingHorizontal: size === 'sm' ? 12 : size === 'lg' ? 24 : 16,
        borderWidth: variant === 'outline' ? 1 : 0,
        borderColor: colors.primary,
        opacity: disabled ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {isLoading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <View style={{marginRight: 8}}>{icon}</View>}
          <Text style={{color: getTextColor(), fontWeight: '600'}}>{title}</Text>
          {icon && iconPosition === 'right' && <View style={{marginLeft: 8}}>{icon}</View>}
        </>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
```

### Example: Reusable Card Component

```javascript
import React from 'react';
import {View, TouchableOpacity} from 'react-native';
import {useTheme} from '../store/useTheme';

const Card = ({
  children,
  onPress,
  padding = 16,
  marginBottom = 12,
  elevated = true,
  rounded = true,
}) => {
  const {colors, mode} = useTheme();

  const cardStyle = {
    backgroundColor: colors.cardBg,
    borderRadius: rounded ? 12 : 0,
    padding,
    marginBottom,
    borderWidth: 1,
    borderColor: colors.border,
    ...(elevated && {
      shadowColor: mode === 'dark' ? '#000' : '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: mode === 'dark' ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    }),
  };

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress} activeOpacity={0.8}>
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

export default Card;
```

### Example: Reusable Input Component

```javascript
import React, {useState} from 'react';
import {View, TextInput, Text, TouchableOpacity} from 'react-native';
import {useTheme} from '../store/useTheme';
import {Eye, EyeOff} from 'lucide-react-native';

const CustomInput = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error = '',
  icon = null,
  multiline = false,
  editable = true,
}) => {
  const {colors} = useTheme();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={{marginBottom: 16}}>
      {label && (
        <Text style={{
          color: colors.text,
          marginBottom: 6,
          fontWeight: '500',
        }}>
          {label}
        </Text>
      )}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: error ? colors.error : colors.border,
        paddingHorizontal: 12,
      }}>
        {icon && <View style={{marginRight: 8}}>{icon}</View>}
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.textLight}
          secureTextEntry={secureTextEntry && !showPassword}
          keyboardType={keyboardType}
          multiline={multiline}
          editable={editable}
          style={{
            flex: 1,
            color: colors.text,
            paddingVertical: 12,
          }}
        />
        {secureTextEntry && (
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.textSecondary} />
            ) : (
              <Eye size={20} color={colors.textSecondary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={{color: colors.error, fontSize: 12, marginTop: 4}}>
          {error}
        </Text>
      )}
    </View>
  );
};

export default CustomInput;
```

### Component Organization by Feature

Group related components in feature folders:
```
components/
├── common/                 # App-wide reusable components
│   ├── Button.jsx
│   ├── Card.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Badge.jsx
│   └── LoadingSpinner.jsx
├── home/                   # Home screen components
│   ├── BannerCarousel.jsx
│   ├── CategoryGrid.jsx
│   └── FeaturedSection.jsx
├── product/                # Product-related components
│   ├── ProductCard.jsx
│   ├── ProductList.jsx
│   └── ProductDetails.jsx
├── cart/                   # Cart-related components
│   ├── CartItem.jsx
│   └── CartSummary.jsx
└── auth/                   # Auth-related components
    ├── LoginForm.jsx
    └── RegisterForm.jsx
```

---

## State Management

### Zustand Stores

The project uses Zustand for lightweight, simple state management.

#### Auth Store (`store/useAuth.js`)
```javascript
import {create} from 'zustand';
import * as SecureStore from 'expo-secure-store';
import api from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({isLoading: true});
    try {
      const response = await api.post('/shop_users/login/', {email, password});
      const {user, token} = response.data;
      
      await SecureStore.setItemAsync('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      set({user, token, isAuthenticated: true, isLoading: false});
      return {success: true};
    } catch (error) {
      set({isLoading: false});
      return {success: false, error: error.response?.data?.message};
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    delete api.defaults.headers.common['Authorization'];
    set({user: null, token: null, isAuthenticated: false});
  },

  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('token');
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Validate token with backend...
      set({token, isAuthenticated: true});
    }
  },
}));
```

#### Theme Store (`store/useTheme.js`)
See the [Theme System](#theme-system-backend-controlled) section above.

#### Creating New Stores
```javascript
// store/useCart.js
import {create} from 'zustand';

export const useCart = create((set, get) => ({
  items: [],
  
  addItem: (product, quantity = 1) => {
    set((state) => {
      const existing = state.items.find(i => i.id === product.id);
      if (existing) {
        return {
          items: state.items.map(i =>
            i.id === product.id ? {...i, quantity: i.quantity + quantity} : i
          ),
        };
      }
      return {items: [...state.items, {...product, quantity}]};
    });
  },
  
  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter(i => i.id !== productId),
    }));
  },
  
  getTotal: () => {
    return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  },
  
  clearCart: () => set({items: []}),
}));
```

---

## API Integration

### Axios Configuration (`services/api.js`)

```javascript
import axios from 'axios';
import {BACKEND_URL} from '../constants/constants';

const api = axios.create({
  baseURL: BACKEND_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    // Token is set in useAuth store after login
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - maybe logout user
    }
    return Promise.reject(error);
  }
);

export default api;
```

### API Endpoints (`constants/constants.js`)

```javascript
export const API_ENDPOINTS = {
  // Authentication
  login: '/shop_users/login/',
  register: '/shop_users/register/',
  googleLogin: '/shop_users/google-login/',
  logout: '/shop_users/logout/',
  profile: '/shop_users/profile/',

  // Theme (Backend-controlled UI)
  publicTheme: '/admin/theme/public/',

  // Products
  products: '/products/',
  categories: '/products/categories/',
  brands: '/admin/brands/',
  featuredProducts: '/products/featured/',

  // Cart & Wishlist
  cart: '/shop_users/cart/',
  wishlist: '/shop_users/wishlist/',

  // Orders
  orders: '/shop_users/orders/',

  // Homepage Content
  banners: '/admin/banners/',
  headerBanners: '/admin/header-banners/',
  homepage: '/admin/homepage/',
};
```

### Using API in Components

```javascript
import React, {useEffect, useState} from 'react';
import {View, Text, FlatList} from 'react-native';
import api from '../services/api';
import {API_ENDPOINTS} from '../constants/constants';
import {useTheme} from '../store/useTheme';

const ProductList = () => {
  const {colors} = useTheme();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get(API_ENDPOINTS.products);
      setProducts(response.data.products || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({item}) => <ProductCard product={item} />}
      style={{backgroundColor: colors.background}}
    />
  );
};
```

---

## Package Reference

### Core Framework
| Package | Purpose | Usage |
|---------|---------|-------|
| `expo` | Core runtime for React Native + web builds | Main framework |
| `react`, `react-native` | Core UI libraries | Building components |
| `react-dom`, `react-native-web` | Web platform support | Web builds |

### Navigation
| Package | Purpose | Usage |
|---------|---------|-------|
| `expo-router` | File-based navigation | Define screens in `app/` folder |
| `@react-navigation/native` | Navigation primitives | Core navigation functionality |
| `@react-navigation/bottom-tabs` | Bottom tab navigation | Tab bar layout in `(tabs)/_layout.jsx` |
| `@react-navigation/elements` | Navigation UI components | Headers, back buttons |

### UI Components & Styling
| Package | Purpose | Usage |
|---------|---------|-------|
| `nativewind` | Tailwind CSS for React Native | Use className prop for styling |
| `tailwindcss` | Utility-first CSS framework | Configure in `tailwind.config.js` |
| `lucide-react-native` | Icon library | `<Home size={24} color={colors.primary} />` |
| `@expo/vector-icons` | Extended icon sets | Alternative icons |
| `expo-linear-gradient` | Gradient backgrounds | `<LinearGradient colors={[...]} />` |
| `@gorhom/bottom-sheet` | Bottom sheet modal | Product details, filters |

### Animations
| Package | Purpose | Usage |
|---------|---------|-------|
| `moti` | Declarative animations | Animate presence, transitions |
| `react-native-reanimated` | Performance animations | Complex gesture animations |
| `react-native-gesture-handler` | Gesture handling | Swipe, pan, pinch gestures |

### Data & Storage
| Package | Purpose | Usage |
|---------|---------|-------|
| `zustand` | State management | Create stores in `store/` |
| `axios` | HTTP client | API calls via `services/api.js` |
| `@react-native-async-storage/async-storage` | Persistent storage | Cache theme, user prefs |
| `expo-secure-store` | Encrypted storage | Auth tokens, sensitive data |

### Lists & Performance
| Package | Purpose | Usage |
|---------|---------|-------|
| `@shopify/flash-list` | High-performance lists | Product grids, long lists |

### Device Features
| Package | Purpose | Usage |
|---------|---------|-------|
| `expo-haptics` | Haptic feedback | Button press feedback |
| `expo-image` | Optimized image loading | Product images, banners |
| `expo-linking` | Deep link handling | Share links, external URLs |
| `expo-web-browser` | In-app browser | External links |
| `expo-splash-screen` | Splash screen control | Hide after theme loads |
| `expo-status-bar` | Status bar styling | Match with theme |
| `expo-constants` | App config access | Build info, device info |

### Layout & Safety
| Package | Purpose | Usage |
|---------|---------|-------|
| `react-native-safe-area-context` | Safe area insets | Avoid notches, home indicators |
| `react-native-screens` | Native screen containers | Performance optimization |
| `expo-system-ui` | System UI adjustments | Navigation bar color |

---

## Quick Reference: Common Patterns

### Using Theme Colors
```javascript
import {useTheme} from '../store/useTheme';

const MyComponent = () => {
  const {colors, mode, isDarkMode} = useTheme();
  
  return (
    <View style={{backgroundColor: colors.background}}>
      <Text style={{color: colors.text}}>Content</Text>
    </View>
  );
};
```

### Using Icons
```javascript
import {Home, ShoppingCart, User, ChevronRight} from 'lucide-react-native';
import {useTheme} from '../store/useTheme';

const NavIcon = ({name, focused}) => {
  const {colors} = useTheme();
  const iconColor = focused ? colors.tabBarActive : colors.tabBarInactive;
  
  const icons = {
    home: Home,
    cart: ShoppingCart,
    profile: User,
  };
  
  const Icon = icons[name];
  return <Icon size={24} color={iconColor} />;
};
```

### Creating Animated Components with Moti
```javascript
import {MotiView} from 'moti';

const AnimatedCard = ({children, delay = 0}) => (
  <MotiView
    from={{opacity: 0, translateY: 20}}
    animate={{opacity: 1, translateY: 0}}
    transition={{type: 'timing', duration: 400, delay}}
  >
    {children}
  </MotiView>
);
```

### Using FlashList for Performance
```javascript
import {FlashList} from '@shopify/flash-list';

const ProductGrid = ({products}) => (
  <FlashList
    data={products}
    numColumns={2}
    estimatedItemSize={200}
    renderItem={({item}) => <ProductCard product={item} />}
  />
);
```

---

## Development Tips

1. **Always test on both iOS and Android** - Use `npx expo start` and test on simulators
2. **Check dark mode** - Toggle theme mode and verify all screens look correct
3. **Use theme colors everywhere** - Never hardcode hex colors in components
4. **Prefer FlashList over FlatList** - Better performance for long lists
5. **Cache API responses** - Use AsyncStorage for offline support
6. **Handle loading and error states** - Every API call should have proper UI feedback
7. **Use Secure Store for sensitive data** - Tokens, passwords, etc.
8. **Test with slow network** - Use network throttling in dev tools

---

## Commands Reference

```bash
# Start development
npx expo start

# Run on specific platform
npx expo start --android
npx expo start --ios
npx expo start --web

# Build for production
npx expo build:android
npx expo build:ios

# Clear cache
npx expo start --clear

# Install new package
npx expo install <package-name>

# Check for outdated packages
npx expo-doctor
```
