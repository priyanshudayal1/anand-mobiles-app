import { View, Text } from "react-native";
export default function GoogleSignInScreen() {

    return (
        <View className="flex-1 bg-white px-6 justify-center">
            <View className="mb-8">
                <Text className="text-3xl font-bold text-gray-900 mb-2">
                    Sign in with Google
                </Text>
                <Text className="text-gray-600 text-base">
                    Continue with your Google account to get started
                </Text>
            </View>




            <View className="mt-6">
                <Text className="text-center text-gray-500 text-sm">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                </Text>
            </View>
        </View>
    );
}
