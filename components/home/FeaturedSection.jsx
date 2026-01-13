import React from 'react';
import { View, Text, Image, ScrollView } from 'react-native';
import { ChevronRight, ChevronLeft } from 'lucide-react-native';

export default function FeaturedSection() {
    return (
        <View className="mt-2 h-40 bg-black relative justify-center">
            <Image
                source={{ uri: 'https://via.placeholder.com/400x160' }}
                className="absolute w-full h-full opacity-50"
            />

            <View className="px-4">
                <Text className="text-white text-2xl font-bold mb-1">TELEVISIONS</Text>
                <View className="flex-row items-center gap-4">
                    <Text className="text-white text-xs">SONY</Text>
                    <Text className="text-white text-xs">SAMSUNG</Text>
                </View>

                <View className="mt-4 bg-orange-500 self-start px-4 py-1 rounded-full flex-row items-center">
                    <Text className="text-white text-xs font-bold mr-1">SHOP NOW</Text>
                </View>
            </View>

            {/* Navigation Arrows */}
            <View className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1">
                <ChevronLeft size={20} color="black" />
            </View>
            <View className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-1">
                <ChevronRight size={20} color="black" />
            </View>

            {/* Dots */}
            <View className="absolute bottom-2 left-0 right-0 flex-row justify-center gap-2">
                <View className="w-2 h-2 rounded-full bg-white" />
                <View className="w-2 h-2 rounded-full border border-white" />
                <View className="w-2 h-2 rounded-full border border-white" />
            </View>
        </View>
    );
}
