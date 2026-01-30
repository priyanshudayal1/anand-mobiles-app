import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  SectionList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sidebar width percentage
const SIDEBAR_WIDTH = width * 0.22;
const CONTENT_WIDTH = width - SIDEBAR_WIDTH;
const ITEM_WIDTH = (CONTENT_WIDTH - 24) / 3; // 24 = padding (12*2)

// Memoized Grid Item Component for Performance
const GridItem = React.memo(({ item, onPress }) => (
  <TouchableOpacity
    style={{
      width: ITEM_WIDTH,
      paddingHorizontal: 4,
      marginBottom: 16,
    }}
    onPress={() => onPress(item)}
  >
    <View className="items-center">
      <View
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#f9fafb',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        {item.image || item.image_url ? (
          <Image
            source={{ uri: item.image || item.image_url }}
            style={{ width: 48, height: 48 }}
            contentFit="contain"
            transition={200}
          />
        ) : (
          <View
            style={{
              width: 48,
              height: 48,
              backgroundColor: '#e5e7eb',
              borderRadius: 24,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, color: '#9ca3af', fontWeight: '600' }}>
              {item.name?.substring(0, 2).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <Text
        style={{
          fontSize: 11,
          color: '#374151',
          textAlign: 'center',
          fontWeight: '500',
        }}
        numberOfLines={2}
      >
        {item.name}
      </Text>
    </View>
  </TouchableOpacity>
));

export default function Menu() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      const response = await axios.get(`${BACKEND_URL}/admin/public/mega-menu/`);
      if (response.data && response.data.tabs) {
        setCategories(response.data.tabs);
        if (response.data.tabs.length > 0) {
          setSelectedCategory(response.data.tabs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryPress = (category) => {
    setSelectedCategory(category);
  };

  const handleSubCategoryPress = useCallback((item) => {
    const path = item.path;
    const name = item.name;

    if (!path) return;

    // Helper to parse query params
    const parseQueryParams = (queryString) => {
      const params = {};
      if (queryString) {
        queryString.split('&').forEach(param => {
          const [key, value] = param.split('=');
          if (key && value) {
            params[key] = decodeURIComponent(value);
          }
        });
      }
      return params;
    };

    if (path.startsWith('/category/')) {
      // Extract slug and query params e.g. /category/smartphones?brand=Apple
      const pathWithoutPrefix = path.replace('/category/', '');
      const [categorySlug, queryString] = pathWithoutPrefix.split('?');
      const queryParams = parseQueryParams(queryString);

      const navParams = {
        category: categorySlug,
        categoryName: name
      };

      // Add brand if present in query params
      if (queryParams.brand) {
        navParams.brand = queryParams.brand;
      }

      router.push({
        pathname: "/products",
        params: navParams
      });
    } else if (path.startsWith('/brand/')) {
      const pathWithoutPrefix = path.replace('/brand/', '');
      const [brandSlug, queryString] = pathWithoutPrefix.split('?');
      const queryParams = parseQueryParams(queryString);

      const navParams = { brand: brandSlug };

      // Add category if present in query params
      if (queryParams.category) {
        navParams.category = queryParams.category;
      }

      router.push({
        pathname: "/products",
        params: navParams
      });
    } else if (path.includes('search=')) {
      // Handle search links if any
      const search = path.split('search=')[1];
      router.push({
        pathname: "/products",
        params: { search: search }
      });
    } else {
      // Fallback for direct links or other pages
      // Remove leading slash to avoid issues with expo-router if needed, 
      // but usually push handles it.
      router.push(path);
    }
  }, [router]); // Re-created when router changes (unlikely)

  const handleQuickAction = (action) => {
    switch (action) {
      case 'orders':
        router.push('/orders');
        break;
      case 'account':
        router.push('/profile');
        break;
      default:
        console.log('Action:', action);
    }
  };

  // Prepare sections for SectionList
  const sections = useMemo(() => {
    if (!selectedCategory?.subcategories) return [];

    return selectedCategory.subcategories.map((subcat) => {
      // Chunk items into groups of 3
      const items = subcat.items || [];
      const chunkedData = [];
      for (let i = 0; i < items.length; i += 3) {
        chunkedData.push({
          id: `${subcat.id}-row-${i}`,
          items: items.slice(i, i + 3),
        });
      }
      return {
        title: subcat.title,
        data: chunkedData,
      };
    });
  }, [selectedCategory]);

  const renderSectionHeader = useCallback(({ section: { title } }) => (
    <View className="px-4 pt-4 pb-2 bg-white">
      <Text className="text-sm font-bold text-gray-800 uppercase tracking-wider">
        {title}
      </Text>
    </View>
  ), []);

  const renderItem = useCallback(({ item }) => (
    <View className="flex-row px-3">
      {item.items.map((gridItem, index) => (
        <GridItem
          key={gridItem.id || index}
          item={gridItem}
          onPress={handleSubCategoryPress}
        />
      ))}
    </View>
  ), [handleSubCategoryPress]);



  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <View className="flex-1 flex-row">
        {/* Left Sidebar - Main Categories */}
        <View
          style={{ width: SIDEBAR_WIDTH }}
          className="bg-gray-50 border-r border-gray-100"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                style={{
                  paddingVertical: 12,
                  paddingHorizontal: 4,
                  borderLeftWidth: 3,
                  borderLeftColor: selectedCategory?.id === category.id ? '#f97316' : 'transparent',
                  backgroundColor: selectedCategory?.id === category.id ? '#fff' : 'transparent',
                }}
              >
                {/* Category Image */}
                <View className="items-center mb-1">
                  {category.image || category.image_url ? (
                    <Image
                      source={{ uri: category.image || category.image_url }}
                      style={{ width: 44, height: 44, borderRadius: 8 }}
                      contentFit="contain"
                      transition={200}
                    />
                  ) : (
                    <View
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: 8,
                        backgroundColor: '#f3f4f6',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Ionicons name="grid-outline" size={20} color="#9ca3af" />
                    </View>
                  )}
                </View>
                {/* Category Name */}
                <Text
                  style={{
                    fontSize: 10,
                    textAlign: 'center',
                    fontWeight: selectedCategory?.id === category.id ? '700' : '500',
                    color: selectedCategory?.id === category.id ? '#f97316' : '#4b5563',
                    marginTop: 2,
                  }}
                  numberOfLines={2}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - SectionList */}
        <View className="flex-1 bg-white">
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => item.id}
            renderItem={renderItem}
            renderSectionHeader={renderSectionHeader}

            contentContainerStyle={{ paddingBottom: 100 }}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />

          {/* Quick Action Buttons - Fixed at bottom */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#fff',
              borderTopWidth: 1,
              borderTopColor: '#f3f4f6',
              paddingVertical: 12,
              paddingHorizontal: 12,
            }}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
            >
              {[
                { id: 'orders', label: 'Orders' },
                { id: 'buyAgain', label: 'Buy Again' },
                { id: 'account', label: 'Account' },
                { id: 'lists', label: 'Lists' }
              ].map((action) => (
                <TouchableOpacity
                  key={action.id}
                  onPress={() => handleQuickAction(action.id)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    backgroundColor: '#fff',
                  }}
                >
                  <Text style={{ fontSize: 13, color: '#374151', fontWeight: '500' }}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
