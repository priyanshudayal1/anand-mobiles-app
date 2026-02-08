export const BACKEND_URL = "http://192.168.29.7:8000/api";
// export const BACKEND_URL = "https://anandmobiles.com/api";

// WebSocket URL for real-time notifications
export const getWebSocketURL = () => {
  // Convert HTTP/HTTPS URL to WebSocket URL (http -> ws, https -> wss)
  let wsUrl = BACKEND_URL.replace(/^https/, "wss").replace(/^http/, "ws");
  // Remove /api suffix if present to get base URL
  wsUrl = wsUrl.replace(/\/api$/, "");
  return `${wsUrl}/ws/notifications/`;
};

// App configuration
export const APP_CONFIG = {
  name: "Anand Mobiles",
  tagline: "Your one-stop shop for premium electronics and accessories",
  version: "1.0.0",
};

// Theme refresh interval (in milliseconds) - refresh every 5 minutes
export const THEME_REFRESH_INTERVAL = 5 * 60 * 1000;

// Home data refresh interval (in milliseconds) - refresh every 5 minutes
export const HOME_REFRESH_INTERVAL = 5 * 60 * 1000;

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  login: "/users/login/",
  register: "/users/register/",
  logout: "/users/logout/",
  profile: "/users/profile/",

  // Theme
  publicTheme: "/admin/theme/public/",

  // Site Config
  logo: "/admin/content/logo/",
  footer: "/admin/footer/",

  // Products - Legacy
  products: "/products/products/",
  categories: "/products/categories/",
  brands: "/admin/brands/",

  // Products - Mobile API (optimized for React Native)
  mobileProducts: "/products/mobile/products/",
  mobileFeatured: "/products/mobile/featured/",
  mobileCategories: "/products/mobile/categories/",
  mobileBrands: "/products/mobile/brands/",
  mobileHome: "/products/mobile/home/",
  mobileFilters: "/products/mobile/filters/",

  // Addresses
  addresses: "/users/addresses/",
  addAddress: "/users/addresses/add/",
  updateAddress: (id) => `/users/addresses/${id}/update/`,
  deleteAddress: (id) => `/users/addresses/${id}/delete/`,

  // Cart
  cart: "/users/cart/",
  addToCart: "/users/cart/add/",
  updateCartItem: "/users/cart/update/",
  removeFromCart: "/users/cart/remove/",
  clearCart: "/users/cart/clear/",

  // Wishlist
  wishlist: "/users/wishlist/",
  addToWishlist: "/users/wishlist/add/",
  removeFromWishlist: "/users/wishlist/remove/",

  // Orders
  orders: "/users/orders/",
  orderDetails: (id) => `/users/orders/${id}/`,

  // Notifications
  notifications: "/users/notifications/",
  notificationCount: "/users/notifications/count/",
  markNotificationRead: (id) => `/users/notifications/${id}/read/`,
  markAllNotificationsRead: "/users/notifications/read-all/",
  deleteNotification: (id) => `/users/notifications/${id}/delete/`,
  deleteAllNotifications: "/users/notifications/delete-all/",
  registerPushToken: "/users/notifications/register-token/",

  // Banners
  banners: "/admin/banners/",
  publicBanners: "/admin/banners/public/",
  headerBanners: "/admin/header-banners/",

  // Homepage
  homepage: "/admin/homepage/sections/public/",
  featuredProducts: "/products/mobile/featured/",

  // Gamification / Wallet
  wallet: "/users/wallet/",
  gamificationStatus: "/users/gamification/status/",
  gamificationConfig: "/users/gamification/config/",
  achievements: "/users/rewards/achievements/",
  leaderboard: "/users/rewards/leaderboard/",
  referrals: "/users/rewards/referrals/",
  spinWheel: "/users/rewards/spin-wheel/",
  loginStreak: "/users/rewards/login-streak/",
};
