import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../../store/useTheme";

/**
 * Branded animated loading screen with Anand Mobiles logo.
 * Use this for full-page loading states (initial data fetches, splash, etc.)
 *
 * @param {string} message - Optional loading text below the logo
 * @param {boolean} fullScreen - Whether to render as a full-screen overlay (default: true)
 */
export default function AnimatedLoader({ message, fullScreen = true }) {
    const { colors } = useTheme();

    // Animation values
    const scaleValue = useRef(new Animated.Value(0.5)).current;
    const opacityValue = useRef(new Animated.Value(0)).current;
    const pulseValue = useRef(new Animated.Value(1)).current;
    const textOpacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // Phase 1: Logo entrance — scale up + fade in
        Animated.parallel([
            Animated.timing(opacityValue, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(scaleValue, {
                toValue: 1,
                friction: 5,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start(() => {
            // Phase 2: After logo appears, fade in text + start pulse loop
            Animated.timing(textOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }).start();

            // Continuous pulse glow
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseValue, {
                        toValue: 1.08,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseValue, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ]),
            ).start();
        });
    }, [opacityValue, scaleValue, pulseValue, textOpacity]);

    const containerStyle = fullScreen
        ? [styles.container, { backgroundColor: colors.primary }]
        : [styles.inlineContainer, { backgroundColor: colors.primary }];

    return (
        <View style={containerStyle}>
            <Animated.View
                style={{
                    alignItems: "center",
                    opacity: opacityValue,
                    transform: [{ scale: Animated.multiply(scaleValue, pulseValue) }],
                }}
            >
                {/* Logo with glow ring */}
                <View
                    style={[
                        styles.logoGlow,
                        { backgroundColor: "rgba(255,255,255,0.08)" },
                    ]}
                >
                    <View
                        style={[
                            styles.logoContainer,
                            { backgroundColor: "rgba(255,255,255,0.12)" },
                        ]}
                    >
                        <Animated.Image
                            source={require("../../assets/images/logo.jpeg")}
                            style={styles.logo}
                        />
                    </View>
                </View>

                {/* Brand name */}
                <Animated.Text
                    style={[styles.brandText, { opacity: textOpacity, color: "#ffffff" }]}
                >
                    ANAND MOBILES
                </Animated.Text>

                {/* Optional loading message */}
                {message ? (
                    <Animated.Text
                        style={[
                            styles.messageText,
                            { opacity: textOpacity, color: "rgba(255,255,255,0.7)" },
                        ]}
                    >
                        {message}
                    </Animated.Text>
                ) : null}
            </Animated.View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    inlineContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderRadius: 12,
    },
    logoGlow: {
        width: 180,
        height: 180,
        borderRadius: 90,
        justifyContent: "center",
        alignItems: "center",
    },
    logoContainer: {
        width: 150,
        height: 150,
        borderRadius: 75,
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 120,
        height: 120,
        resizeMode: "contain",
        borderRadius: 12,
    },
    brandText: {
        fontSize: 22,
        fontWeight: "bold",
        letterSpacing: 2,
        marginTop: 20,
    },
    messageText: {
        fontSize: 14,
        marginTop: 12,
        letterSpacing: 0.5,
    },
});
