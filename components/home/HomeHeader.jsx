import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Search, MapPin, Wallet, Bell } from 'lucide-react-native';
import { useTheme } from '../../store/useTheme';

export default function HomeHeader() {
    const { colors } = useTheme();

    return (
        <View className="w-full">
            {/* Top Warning Strip */}
            <View className="bg-orange-500 py-1 px-4 flex-row justify-between items-center">
                <Text className="text-white text-xs font-medium">
                    Website is under development!!! <Text className="underline">Shop Now</Text>
                </Text>
                <TouchableOpacity>
                    <Text className="text-white text-xs">X</Text>
                </TouchableOpacity>
            </View>

            {/* Main Header Area */}
            <View className="bg-orange-500 px-4 pt-2 pb-4">
                <View className="flex-row justify-between items-center mb-4">
                    {/* Brand */}
                    <View className="flex-row items-center">
                        {/* Placeholder for Logo */}
                        <View className="w-8 h-8 bg-black rounded mr-2 justify-center items-center">
                            <Text className="text-white font-bold">A</Text>
                        </View>
                        <Text className="text-black text-xl font-bold">ANAND MOBILES</Text>
                    </View>

                    {/* Right Actions */}
                    <View className="flex-row items-center gap-4">
                        <View className="items-end">
                            <View className="flex-row items-center">
                                <MapPin size={16} color="white" />
                                <Text className="text-white text-xs ml-1">Delivery to</Text>
                            </View>
                            <Text className="text-white font-bold text-sm">जबलपुर</Text>
                        </View>

                        <View className="relative">
                            <Wallet size={24} color="white" />
                            <View className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 justify-center items-center">
                                <Text className="text-orange-500 text-[10px] font-bold">7</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="bg-white rounded-full flex-row items-center px-4 py-2 h-10">
                    <TextInput
                        className="flex-1 text-gray-600 ml-2"
                        placeholder="Search products..."
                        placeholderTextColor="#9CA3AF"
                    />
                    <Search size={20} color="#9CA3AF" />
                </View>
            </View>
        </View>
    );
}
