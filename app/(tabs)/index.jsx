import React from 'react';
import { View, ScrollView, TouchableOpacity, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MessageCircle } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

import HomeHeader from '../../components/home/HomeHeader';
import BannerCarousel from '../../components/home/BannerCarousel';
import CategoryGrid from '../../components/home/CategoryGrid';
import FeaturedSection from '../../components/home/FeaturedSection';
import { useTheme } from '../../store/useTheme';

export default function Home() {
    const { colors } = useTheme();

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            <StatusBar style="light" backgroundColor={colors.primary} />

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1 pb-20">
                <HomeHeader />

                <BannerCarousel />

                <CategoryGrid />

                <FeaturedSection />

                {/* Additional spacing or sections can go here */}
                <View className="h-4" />

                {/* Mobiles & Accessories Section Header */}
                <View className="bg-white p-4 mb-2">
                    <Text className="text-orange-500 text-xl font-bold">Mobiles & Acessories</Text>
                </View>

                <View className="h-20" />
            </ScrollView>

            {/* Floating Action Button (Chat) */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-orange-500 rounded-full justify-center items-center shadow-lg elevation-5"
                activeOpacity={0.8}
            >
                <MessageCircle size={28} color="white" />
                <View className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            </TouchableOpacity>
        </SafeAreaView>
    );
}
