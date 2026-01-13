import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

const categories = [
    { id: 1, name: 'tablets', image: 'https://via.placeholder.com/60' },
    { id: 2, name: 'Smartphones', image: 'https://via.placeholder.com/60' },
    { id: 3, name: 'laptops', image: 'https://via.placeholder.com/60' },
    { id: 4, name: 'televisions', image: 'https://via.placeholder.com/60' },
];

export default function CategoryGrid() {
    return (
        <View className="bg-white p-4">
            <View className="flex-row justify-between items-center mb-4">
                <View>
                    <Text className="text-lg font-bold text-gray-800">Shop by Categories</Text>
                    <View className="h-1 w-16 bg-orange-500 mt-1" />
                </View>
                <TouchableOpacity>
                    <Text className="text-orange-500 font-medium">See All →</Text>
                </TouchableOpacity>
            </View>

            <Text className="text-gray-500 text-xs mb-6">
                Discover our wide range of products across different categories
            </Text>

            <View className="flex-row justify-between">
                {categories.map((cat) => (
                    <TouchableOpacity key={cat.id} className="items-center">
                        {/* Placeholder Image Box */}
                        <View className="w-16 h-12 bg-gray-100 mb-2 justify-center items-center rounded">
                            {/* Icon/Image would go here */}
                            <View className="w-10 h-8 bg-blue-200" />
                        </View>
                        <Text className="text-xs font-medium text-gray-800 capitalize">{cat.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
}
