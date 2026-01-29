import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../store/useTheme';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NotificationsScreen() {
    const { colors, isDarkMode } = useTheme();
    const router = useRouter();

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
            <StatusBar style={isDarkMode ? "light" : "dark"} />

            {/* Header */}
            <View style={{
                padding: 16,
                flexDirection: "row",
                alignItems: "center",
                borderBottomWidth: 1,
                borderBottomColor: colors.border,
                backgroundColor: colors.surface,
            }}>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color={colors.text} />
                </TouchableOpacity>
                <Text style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: colors.text,
                    marginLeft: 16
                }}>
                    Notifications
                </Text>
            </View>

            {/* Empty State */}
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
                <Ionicons name="notifications-outline" size={80} color={colors.textSecondary} />
                <Text style={{
                    marginTop: 20,
                    fontSize: 18,
                    color: colors.text,
                    fontWeight: '500'
                }}>
                    No Notifications Yet
                </Text>
                <Text style={{
                    marginTop: 10,
                    fontSize: 14,
                    color: colors.textSecondary,
                    textAlign: 'center'
                }}>
                    You're all caught up! Check back later for updates.
                </Text>
            </View>
        </SafeAreaView>
    );
}
