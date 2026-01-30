import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';
import { useRouter } from 'expo-router';
import { BACKEND_URL } from '../../constants/constants';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Sidebar width percentage
const SIDEBAR_WIDTH_PERCENT = 0.28;

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
      // Use the public mega menu endpoint
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

  const handleSubCategoryPress = (path) => {
    if (path) {
      // Convert web path to mobile route if necessary, or just push to a generic category listing
      // Assuming path is like "/category/smartphones?brand=Apple"
      // We might need to parse this or have a generic handler
      // For now, let's just use the path as is, router might need adjustment
      router.push(path);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-100 flex-row items-center gap-3">
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800">Menu</Text>
      </View>

      <View className="flex-1 flex-row">
        {/* Left Sidebar - Main Categories */}
        <View
          style={{ width: width * SIDEBAR_WIDTH_PERCENT }}
          className="bg-gray-50 border-r border-gray-200"
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                onPress={() => handleCategoryPress(category)}
                className={`py-4 px-2 border-l-4 ${selectedCategory?.id === category.id
                  ? 'bg-white border-orange-500'
                  : 'border-transparent'
                  }`}
              >
                {/* You might want to add icons here if available in the future */}
                {/* Category Icon/Image if available */}
                {category.image && (
                  <View className="items-center mb-1">
                    <Image
                      source={{ uri: category.image }}
                      className="w-6 h-6"
                      resizeMode="contain"
                    />
                  </View>
                )}
                <Text
                  className={`text-xs text-center font-medium ${selectedCategory?.id === category.id
                    ? 'text-orange-600 font-bold'
                    : 'text-gray-600'
                    }`}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Right Content - Subcategories & Banners */}
        <View className="flex-1 bg-white">
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
            {selectedCategory && (
              <>
                {/* Top Banners of selected category */}
                {selectedCategory.banners && selectedCategory.banners.length > 0 && (
                  <View className="p-3">
                    <FlatList
                      data={selectedCategory.banners}
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      keyExtractor={(item, index) => `banner-${index}`}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          className="mr-3 rounded-lg overflow-hidden"
                          onPress={() => handleSubCategoryPress(item.link)}
                        >
                          <Image
                            source={{ uri: item.image }}
                            className="w-48 h-24 object-cover"
                            style={{ width: width * 0.6 }}
                          />
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                )}

                {/* Subcategory Grid */}
                <View className="p-3">
                  {/* Convert subcategories (columns) into a grid */}
                  <View className="flex-row flex-wrap justify-between">
                    {selectedCategory.subcategories?.map((subcat, index) => (
                      <TouchableOpacity
                        key={index}
                        className="mb-4 items-center"
                        style={{ width: '31%' }} // 3 columns
                        onPress={() => {
                          // If subcategory has items, maybe navigate to a list? 
                          // Or just the first item's path?
                          // Or searching by this subcategory name?
                          // For now: Alert or generic action
                          console.log('Clicked subcategory:', subcat.title);
                        }}
                      >
                        <View className="w-16 h-16 bg-gray-100 rounded-full mb-2 overflow-hidden justify-center items-center p-2">
                          {subcat.image ? (
                            <Image
                              source={{ uri: subcat.image }}
                              className="w-full h-full"
                              resizeMode="contain"
                            />
                          ) : (
                            // Fallback icon or text
                            <Text className="text-gray-400 text-xs text-center">{subcat.title.substring(0, 2)}</Text>
                          )}
                        </View>
                        <Text className="text-xs text-center text-gray-700 font-medium" numberOfLines={2}>
                          {subcat.title}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Detailed Links List (Traditional Accordion substitute) */}
                {selectedCategory.subcategories?.map((subcat, index) => (
                  <View key={`list-${index}`} className="px-4 mb-4">
                    <Text className="font-bold text-gray-800 mb-2 border-b border-gray-100 pb-1">{subcat.title}</Text>
                    {subcat.items?.map((item, idx) => (
                        <TouchableOpacity
                        key={idx}
                        className="py-2 flex-row items-center"
                        onPress={() => handleSubCategoryPress(item.path)}
                      >
                        {item.image && (
                          <Image 
                            source={{ uri: item.image }} 
                            className="w-8 h-8 mr-3 rounded-md bg-gray-50" 
                            resizeMode="cover"
                          />
                        )}
                        <Text className="text-gray-600 text-sm flex-1">{item.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </>
            )}
          </ScrollView>
        </View>
      </View>
    </SafeAreaView>
  );
}
