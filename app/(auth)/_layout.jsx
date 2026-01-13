import { Stack } from 'expo-router';
import { useTheme } from '../../store/useTheme';

export default function AuthLayout() {
    const { colors } = useTheme();

    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.background },
            }}
        >
            <Stack.Screen name="welcome" />
            <Stack.Screen name="login" />
            <Stack.Screen name="register" />
        </Stack>
    );
}
