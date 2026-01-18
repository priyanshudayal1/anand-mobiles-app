export const BACKEND_URL = "http://192.168.29.7:8000/api";

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
  googleLogin: "/users/google-login/",
  logout: "/users/logout/",
  profile: "/users/profile/",

  // Theme
  publicTheme: "/admin/theme/public/",

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

  // Cart & Wishlist
  cart: "/users/cart/",
  wishlist: "/users/wishlist/",

  // Orders
  orders: "/users/orders/",

  // Banners
  banners: "/admin/banners/",
  publicBanners: "/admin/banners/public/",
  headerBanners: "/admin/header-banners/",

  // Homepage
  homepage: "/admin/homepage/sections/public/",
  featuredProducts: "/products/mobile/featured/",
};
