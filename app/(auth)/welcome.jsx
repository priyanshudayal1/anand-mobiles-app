import React from 'react';
import { View, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import CustomButton from '../../components/CustomButton';
import { useTheme } from '../../store/useTheme';

const Welcome = () => {
    const router = useRouter();
    const { colors } = useTheme();

    return (
        <SafeAreaView className="flex-1" style={{ backgroundColor: colors.background }}>
            <StatusBar style="auto" />
            <View className="flex-1 justify-center items-center px-6">
                {/* Logo or Hero Image placeholder */}
                <View
                    className="w-32 h-32 rounded-full justify-center items-center mb-10"
                    style={{ backgroundColor: colors.primary + '20' }} // 20% opacity primary
                >
                    <Text
                        className="text-4xl font-bold"
                        style={{ color: colors.primary }}
                    >
                        AM
                    </Text>
                </View>

                <Text
                    className="text-3xl font-bold text-center mb-2"
                    style={{ color: colors.text }}
                >
                    Welcome to Anand Mobiles
                </Text>

                <Text
                    className="text-center mb-12 text-lg"
                    style={{ color: colors.textSecondary }}
                >
                    Your one-stop shop for premium electronics and accessories.
                </Text>

                <View className="w-full space-y-4 gap-4">
                    <CustomButton
                        title="Login"
                        onPress={() => router.push('/login')}
                        fullWidth
                    />

                    <CustomButton
                        title="Create Account"
                        onPress={() => router.push('/register')}
                        variant="outline"
                        fullWidth
                    />
                </View>
            </View>
        </SafeAreaView>
    );
};

export default Welcome;
