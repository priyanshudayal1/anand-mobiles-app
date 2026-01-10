import { Text, View, ScrollView, TouchableOpacity } from "react-native";

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header Section */}
        <View className="mb-8 mt-12">
          <Text className="text-4xl font-bold text-gray-900 mb-2">
            Anand Mobiles
          </Text>
          <Text className="text-lg text-gray-600">
            Premium Mobile Devices & Accessories
          </Text>
        </View>

        {/* Featured Card */}
        <View className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-6 mb-6 shadow-lg">
          <Text className="text-white text-2xl font-bold mb-2">
            🎉 Special Offer
          </Text>
          <Text className="text-white text-base mb-4">
            Get up to 30% off on selected smartphones
          </Text>
          <TouchableOpacity className="bg-white rounded-lg py-3 px-6 self-start">
            <Text className="text-blue-600 font-semibold">Shop Now</Text>
          </TouchableOpacity>
        </View>

        {/* Categories Grid */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Categories
          </Text>
          <View className="flex-row flex-wrap -mx-2">
            {["Smartphones", "Tablets", "Accessories", "Smart Watches"].map(
              (category, index) => (
                <View key={index} className="w-1/2 px-2 mb-4">
                  <TouchableOpacity className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                    <Text className="text-lg font-semibold text-gray-800 text-center">
                      {category}
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </View>
        </View>

        {/* Product Cards */}
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-900 mb-4">
            Featured Products
          </Text>
          {[1, 2, 3].map((item) => (
            <View
              key={item}
              className="bg-white rounded-xl p-4 mb-4 shadow-md border border-gray-200"
            >
              <View className="flex-row items-center mb-3">
                <View className="bg-blue-100 w-16 h-16 rounded-lg mr-4" />
                <View className="flex-1">
                  <Text className="text-lg font-bold text-gray-900">
                    Premium Smartphone {item}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    Latest flagship device
                  </Text>
                </View>
              </View>
              <View className="flex-row justify-between items-center">
                <Text className="text-xl font-bold text-blue-600">
                  ₹{49999 - item * 5000}
                </Text>
                <TouchableOpacity className="bg-blue-600 rounded-lg py-2 px-6">
                  <Text className="text-white font-semibold">Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Info Cards */}
        <View className="flex-row flex-wrap -mx-2">
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-green-100 rounded-xl p-4">
              <Text className="text-2xl mb-1">🚚</Text>
              <Text className="text-sm font-semibold text-gray-800">
                Free Delivery
              </Text>
            </View>
          </View>
          <View className="w-1/2 px-2 mb-4">
            <View className="bg-yellow-100 rounded-xl p-4">
              <Text className="text-2xl mb-1">🔒</Text>
              <Text className="text-sm font-semibold text-gray-800">
                Secure Payment
              </Text>
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
