import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  ActivityIndicator,
} from "react-native";
import {
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  Check,
  Star,
  RotateCcw,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useProducts } from "../../store/useProducts";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Top Rated" },
  { value: "name", label: "Name A-Z" },
];

const DISCOUNT_OPTIONS = [50, 40, 30, 20, 10];
const RATING_OPTIONS = [4, 3, 2, 1];

export default function ProductFilterModal({ visible, onClose, onApply }) {
  const { colors, mode } = useTheme();
  const { filters, filterOptions, fetchFilterOptions, setFilters } =
    useProducts();

  const [loading, setLoading] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    brands: [],
    categories: [],
    minPrice: 0,
    maxPrice: 10000000,
    sortBy: "newest",
    inStockOnly: false,
    rating: 0,
    discount: null,
  });

  // Accordion sections
  const [openSections, setOpenSections] = useState({
    sort: true,
    category: false,
    brands: false,
    price: false,
    rating: false,
    discount: false,
    stock: false,
  });

  // Load filter options and sync with current filters when modal opens
  useEffect(() => {
    if (visible) {
      setLocalFilters({
        brands: filters.brands || [],
        categories: filters.category ? [filters.category] : [],
        minPrice: filters.minPrice || 0,
        maxPrice: filters.maxPrice || 10000000,
        sortBy: filters.sortBy || "newest",
        inStockOnly: filters.inStockOnly || false,
        rating: filters.rating || 0,
        discount: filters.discount || null,
      });
      loadFilterOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadFilterOptions = async () => {
    setLoading(true);
    try {
      await fetchFilterOptions(filters.category);
    } catch (error) {
      console.error("Failed to load filter options:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSection = (section) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const toggleArrayFilter = (key, value) => {
    setLocalFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const handleApply = () => {
    const newFilters = {
      brands: localFilters.brands,
      category:
        localFilters.categories.length > 0 ? localFilters.categories[0] : null,
      minPrice: localFilters.minPrice,
      maxPrice: localFilters.maxPrice,
      sortBy: localFilters.sortBy,
      inStockOnly: localFilters.inStockOnly,
      rating: localFilters.rating,
      discount: localFilters.discount,
    };
    setFilters(newFilters);
    if (onApply) onApply(newFilters);
    onClose();
  };

  const handleReset = () => {
    setLocalFilters({
      brands: [],
      categories: [],
      minPrice: 0,
      maxPrice: 10000000,
      sortBy: "newest",
      inStockOnly: false,
      rating: 0,
      discount: null,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (localFilters.brands.length > 0) count++;
    if (localFilters.categories.length > 0) count++;
    if (localFilters.minPrice > 0 || localFilters.maxPrice < 10000000) count++;
    if (localFilters.sortBy !== "newest") count++;
    if (localFilters.inStockOnly) count++;
    if (localFilters.rating > 0) count++;
    if (localFilters.discount) count++;
    return count;
  };

  // Components
  const FilterSection = ({ title, section, children, badge }) => (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.border }}>
      <TouchableOpacity
        onPress={() => toggleSection(section)}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 14,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Text style={{ fontSize: 15, fontWeight: "600", color: colors.text }}>
            {title}
          </Text>
          {badge ? (
            <View
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 6,
                paddingVertical: 2,
                borderRadius: 10,
              }}
            >
              <Text
                style={{ fontSize: 10, color: colors.white, fontWeight: "600" }}
              >
                {badge}
              </Text>
            </View>
          ) : null}
        </View>
        {openSections[section] ? (
          <ChevronUp size={20} color={colors.textSecondary} />
        ) : (
          <ChevronDown size={20} color={colors.textSecondary} />
        )}
      </TouchableOpacity>
      {openSections[section] ? (
        <View style={{ paddingHorizontal: 16, paddingBottom: 14 }}>
          {children}
        </View>
      ) : null}
    </View>
  );

  const CheckboxOption = ({ checked, onPress, label, count }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingVertical: 10,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {checked ? <Check size={14} color={colors.white} /> : null}
        </View>
        <Text style={{ fontSize: 14, color: colors.text }}>{label}</Text>
      </View>
      {count !== undefined ? (
        <Text style={{ fontSize: 12, color: colors.textSecondary }}>
          ({count})
        </Text>
      ) : null}
    </TouchableOpacity>
  );

  const RadioOption = ({ selected, onPress, label }) => (
    <TouchableOpacity
      onPress={onPress}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 12,
      }}
    >
      <View
        style={{
          width: 20,
          height: 20,
          borderRadius: 10,
          borderWidth: 2,
          borderColor: selected ? colors.primary : colors.border,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selected ? (
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: colors.primary,
            }}
          />
        ) : null}
      </View>
      <Text style={{ fontSize: 14, color: colors.text }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)" }}>
        <TouchableOpacity
          style={{ flex: 0.15 }}
          activeOpacity={1}
          onPress={onClose}
        />
        <View
          style={{
            flex: 0.85,
            backgroundColor: colors.background,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingHorizontal: 16,
              paddingVertical: 16,
              borderBottomWidth: 1,
              borderBottomColor: colors.border,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
            >
              <Filter size={20} color={colors.primary} />
              <Text
                style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
              >
                Filters
              </Text>
              {getActiveFilterCount() > 0 ? (
                <View
                  style={{
                    backgroundColor: colors.primary + "20",
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    borderRadius: 12,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.primary,
                      fontWeight: "600",
                    }}
                  >
                    {getActiveFilterCount()} active
                  </Text>
                </View>
              ) : null}
            </View>
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 16 }}
            >
              <TouchableOpacity onPress={handleReset}>
                <RotateCcw size={20} color={colors.error} />
              </TouchableOpacity>
              <TouchableOpacity onPress={onClose}>
                <X size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>

          {loading ? (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={{ marginTop: 12, color: colors.textSecondary }}>
                Loading filters...
              </Text>
            </View>
          ) : (
            <ScrollView
              style={{ flex: 1 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Sort By */}
              <FilterSection
                title="Sort By"
                section="sort"
                badge={localFilters.sortBy !== "newest" ? "1" : null}
              >
                {SORT_OPTIONS.map((option) => (
                  <RadioOption
                    key={option.value}
                    selected={localFilters.sortBy === option.value}
                    onPress={() =>
                      setLocalFilters((prev) => ({
                        ...prev,
                        sortBy: option.value,
                      }))
                    }
                    label={option.label}
                  />
                ))}
              </FilterSection>

              {/* Categories */}
              {filterOptions.categories &&
              filterOptions.categories.length > 0 ? (
                <FilterSection
                  title="Categories"
                  section="category"
                  badge={
                    localFilters.categories.length > 0
                      ? localFilters.categories.length
                      : null
                  }
                >
                  {filterOptions.categories.map((cat) => (
                    <CheckboxOption
                      key={cat}
                      checked={localFilters.categories.includes(cat)}
                      onPress={() => toggleArrayFilter("categories", cat)}
                      label={cat}
                    />
                  ))}
                </FilterSection>
              ) : null}

              {/* Brands */}
              {filterOptions.brands && filterOptions.brands.length > 0 ? (
                <FilterSection
                  title="Brands"
                  section="brands"
                  badge={
                    localFilters.brands.length > 0
                      ? localFilters.brands.length
                      : null
                  }
                >
                  {filterOptions.brands.map((brand) => (
                    <CheckboxOption
                      key={brand}
                      checked={localFilters.brands.includes(brand)}
                      onPress={() => toggleArrayFilter("brands", brand)}
                      label={brand}
                    />
                  ))}
                </FilterSection>
              ) : null}

              {/* Price Range */}
              <FilterSection
                title="Price Range"
                section="price"
                badge={
                  localFilters.minPrice > 0 || localFilters.maxPrice < 10000000
                    ? "1"
                    : null
                }
              >
                <View style={{ gap: 12 }}>
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 6,
                        }}
                      >
                        Min Price
                      </Text>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          color: colors.text,
                          backgroundColor:
                            mode === "dark"
                              ? colors.surfaceSecondary
                              : colors.white,
                        }}
                        placeholder="₹ 0"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={
                          localFilters.minPrice > 0
                            ? localFilters.minPrice.toString()
                            : ""
                        }
                        onChangeText={(text) => {
                          const num = parseInt(text) || 0;
                          setLocalFilters((prev) => ({
                            ...prev,
                            minPrice: num,
                          }));
                        }}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 12,
                          color: colors.textSecondary,
                          marginBottom: 6,
                        }}
                      >
                        Max Price
                      </Text>
                      <TextInput
                        style={{
                          borderWidth: 1,
                          borderColor: colors.border,
                          borderRadius: 8,
                          paddingHorizontal: 12,
                          paddingVertical: 10,
                          fontSize: 14,
                          color: colors.text,
                          backgroundColor:
                            mode === "dark"
                              ? colors.surfaceSecondary
                              : colors.white,
                        }}
                        placeholder="₹ 10,00,000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={
                          localFilters.maxPrice < 10000000
                            ? localFilters.maxPrice.toString()
                            : ""
                        }
                        onChangeText={(text) => {
                          const num = parseInt(text) || 10000000;
                          setLocalFilters((prev) => ({
                            ...prev,
                            maxPrice: num,
                          }));
                        }}
                      />
                    </View>
                  </View>
                  {filterOptions.priceRange ? (
                    <Text style={{ fontSize: 11, color: colors.textSecondary }}>
                      Available range: ₹
                      {filterOptions.priceRange.min?.toLocaleString()} - ₹
                      {filterOptions.priceRange.max?.toLocaleString()}
                    </Text>
                  ) : null}
                </View>
              </FilterSection>

              {/* Rating */}
              <FilterSection
                title="Rating"
                section="rating"
                badge={localFilters.rating > 0 ? "1" : null}
              >
                <RadioOption
                  selected={localFilters.rating === 0}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, rating: 0 }))
                  }
                  label="All Ratings"
                />
                {RATING_OPTIONS.map((rating) => (
                  <RadioOption
                    key={rating}
                    selected={localFilters.rating === rating}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, rating: rating }))
                    }
                    label={
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Text style={{ fontSize: 14, color: colors.text }}>
                          {rating}
                        </Text>
                        <Star
                          size={12}
                          color={colors.warning}
                          fill={colors.warning}
                        />
                        <Text style={{ fontSize: 14, color: colors.text }}>
                          {" "}
                          & above
                        </Text>
                      </View>
                    }
                  />
                ))}
              </FilterSection>

              {/* Discount */}
              <FilterSection
                title="Discount"
                section="discount"
                badge={localFilters.discount ? "1" : null}
              >
                <RadioOption
                  selected={localFilters.discount === null}
                  onPress={() =>
                    setLocalFilters((prev) => ({ ...prev, discount: null }))
                  }
                  label="Any Discount"
                />
                {DISCOUNT_OPTIONS.map((disc) => (
                  <RadioOption
                    key={disc}
                    selected={localFilters.discount === disc}
                    onPress={() =>
                      setLocalFilters((prev) => ({ ...prev, discount: disc }))
                    }
                    label={`${disc}% or more`}
                  />
                ))}
              </FilterSection>

              {/* Availability */}
              <FilterSection
                title="Availability"
                section="stock"
                badge={localFilters.inStockOnly ? "1" : null}
              >
                <CheckboxOption
                  checked={localFilters.inStockOnly}
                  onPress={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      inStockOnly: !prev.inStockOnly,
                    }))
                  }
                  label="In Stock Only"
                />
              </FilterSection>

              {/* Bottom padding */}
              <View style={{ height: 100 }} />
            </ScrollView>
          )}

          {/* Footer Buttons */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              paddingVertical: 16,
              gap: 12,
              borderTopWidth: 1,
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            }}
          >
            <TouchableOpacity
              onPress={handleReset}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.border,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: colors.text }}
              >
                Reset All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApply}
              style={{
                flex: 2,
                paddingVertical: 14,
                borderRadius: 12,
                backgroundColor: colors.primary,
                alignItems: "center",
              }}
            >
              <Text
                style={{ fontSize: 15, fontWeight: "600", color: colors.white }}
              >
                Apply Filters
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
