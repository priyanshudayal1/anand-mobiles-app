import { create } from "zustand";
import api from "../services/api";

// Default pagination settings
const DEFAULT_PAGE_SIZE = 20;

export const useProducts = create((set, get) => ({
  // Product list state
  products: [],
  isLoading: false,
  isLoadingMore: false,
  error: null,

  // Pagination state
  pagination: {
    page: 1,
    limit: DEFAULT_PAGE_SIZE,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  },

  // Filter state
  filters: {
    category: null,
    brands: [],
    search: "",
    minPrice: 0,
    maxPrice: 10000000,
    sortBy: "newest", // 'price_asc', 'price_desc', 'name', 'rating', 'newest'
    inStockOnly: false,
    featuredOnly: false,
    rating: 0,
    discount: null,
  },

  // Filter options (from backend)
  filterOptions: {
    brands: [],
    categories: [],
    storageOptions: [],
    colorOptions: [],
    ramOptions: [],
    priceRange: { min: 0, max: 100000 },
  },

  // Current product detail
  currentProduct: null,
  isLoadingProduct: false,

  // Fetch products with current filters
  fetchProducts: async (resetList = true) => {
    const { filters, pagination } = get();

    if (resetList) {
      set({ isLoading: true, error: null, products: [] });
    } else {
      set({ isLoadingMore: true });
    }

    try {
      const params = new URLSearchParams();
      params.append("page", resetList ? "1" : pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.brands.length > 0) {
        params.append("brand", filters.brands.join(","));
      }
      if (filters.search) {
        params.append("search", filters.search);
      }
      if (filters.minPrice > 0) {
        params.append("min_price", filters.minPrice.toString());
      }
      if (filters.maxPrice < 10000000) {
        params.append("max_price", filters.maxPrice.toString());
      }
      if (filters.sortBy) {
        params.append("sort_by", filters.sortBy);
      }
      if (filters.inStockOnly) {
        params.append("in_stock", "true");
      }
      if (filters.featuredOnly) {
        params.append("featured", "true");
      }
      if (filters.rating > 0) {
        params.append("rating", filters.rating.toString());
      }
      if (filters.discount) {
        params.append("discount", filters.discount.toString());
      }

      const response = await api.get(
        `/products/mobile/products/?${params.toString()}`,
      );

      if (response.data && response.data.success) {
        const newProducts = response.data.products || [];
        const paginationData = response.data.pagination || {};

        set({
          products: resetList
            ? newProducts
            : [...get().products, ...newProducts],
          pagination: {
            page: paginationData.page || 1,
            limit: paginationData.limit || DEFAULT_PAGE_SIZE,
            totalCount: paginationData.total_count || 0,
            totalPages: paginationData.total_pages || 0,
            hasNext: paginationData.has_next || false,
            hasPrev: paginationData.has_prev || false,
          },
          isLoading: false,
          isLoadingMore: false,
          error: null,
        });
      } else {
        set({ isLoading: false, isLoadingMore: false });
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      set({
        error: error.message,
        isLoading: false,
        isLoadingMore: false,
      });
    }
  },

  // Load more products (infinite scroll)
  loadMoreProducts: async () => {
    const { pagination, isLoadingMore, isLoading } = get();

    if (isLoadingMore || isLoading || !pagination.hasNext) {
      return;
    }

    set({
      pagination: { ...pagination, page: pagination.page + 1 },
    });

    await get().fetchProducts(false);
  },

  // Update filters and refetch
  setFilters: (newFilters) => {
    set({
      filters: { ...get().filters, ...newFilters },
      pagination: { ...get().pagination, page: 1 },
    });
  },

  // Apply filters and fetch
  applyFilters: async (newFilters = null) => {
    if (newFilters) {
      set({
        filters: { ...get().filters, ...newFilters },
        pagination: { ...get().pagination, page: 1 },
      });
    }
    await get().fetchProducts(true);
  },

  // Reset all filters
  resetFilters: () => {
    set({
      filters: {
        category: null,
        brands: [],
        search: "",
        minPrice: 0,
        maxPrice: 10000000,
        sortBy: "newest",
        inStockOnly: false,
        featuredOnly: false,
        rating: 0,
        discount: null,
      },
      pagination: { ...get().pagination, page: 1 },
    });
  },

  // Set category filter
  setCategory: async (category) => {
    set({
      filters: { ...get().filters, category },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Set brand filter
  setBrands: async (brands) => {
    set({
      filters: {
        ...get().filters,
        brands: Array.isArray(brands) ? brands : [brands],
      },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Set search query
  setSearch: async (search) => {
    set({
      filters: { ...get().filters, search },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Set sort option
  setSortBy: async (sortBy) => {
    set({
      filters: { ...get().filters, sortBy },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Set price range
  setPriceRange: async (minPrice, maxPrice) => {
    set({
      filters: { ...get().filters, minPrice, maxPrice },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Toggle in stock filter
  toggleInStockOnly: async () => {
    const { filters } = get();
    set({
      filters: { ...filters, inStockOnly: !filters.inStockOnly },
      pagination: { ...get().pagination, page: 1 },
    });
    await get().fetchProducts(true);
  },

  // Fetch filter options
  fetchFilterOptions: async (category = null) => {
    try {
      const url = category
        ? `/products/mobile/filters/?category=${category}`
        : "/products/mobile/filters/";

      const response = await api.get(url);

      if (response.data && response.data.success) {
        const filterData = response.data.filters || {};
        set({
          filterOptions: {
            brands: filterData.brands || [],
            categories: filterData.categories || [],
            storageOptions: filterData.storage_options || [],
            colorOptions: filterData.color_options || [],
            ramOptions: filterData.ram_options || [],
            priceRange: filterData.price_range || { min: 0, max: 100000 },
          },
        });
      }
    } catch (error) {
      console.error("Failed to fetch filter options:", error);
    }
  },

  // Fetch single product details
  fetchProductDetails: async (productId) => {
    set({ isLoadingProduct: true, currentProduct: null });

    try {
      const response = await api.get(`/products/products/${productId}/`);

      if (response.data && response.data.product) {
        set({
          currentProduct: response.data.product,
          isLoadingProduct: false,
        });
        return response.data.product;
      }
      set({ isLoadingProduct: false });
      return null;
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      set({ isLoadingProduct: false, error: error.message });
      return null;
    }
  },

  // Clear current product
  clearCurrentProduct: () => {
    set({ currentProduct: null });
  },

  // Search products
  searchProducts: async (query) => {
    if (!query || query.trim().length < 2) {
      return [];
    }

    try {
      const response = await api.get(
        `/products/mobile/products/?search=${encodeURIComponent(query)}&limit=10`,
      );

      if (response.data && response.data.success) {
        return response.data.products || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to search products:", error);
      return [];
    }
  },

  // Get products by category
  getProductsByCategory: async (category, limit = 10) => {
    try {
      const response = await api.get(
        `/products/mobile/products/?category=${category}&limit=${limit}`,
      );

      if (response.data && response.data.success) {
        return response.data.products || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch products by category:", error);
      return [];
    }
  },

  // Get products by brand
  getProductsByBrand: async (brand, limit = 10) => {
    try {
      const response = await api.get(
        `/products/mobile/products/?brand=${brand}&limit=${limit}`,
      );

      if (response.data && response.data.success) {
        return response.data.products || [];
      }
      return [];
    } catch (error) {
      console.error("Failed to fetch products by brand:", error);
      return [];
    }
  },
}));
