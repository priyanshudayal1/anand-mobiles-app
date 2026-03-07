import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

/**
 * FadeInView — Fades children in from transparent to opaque.
 * @param {number} delay - ms to wait before starting (for staggering)
 * @param {number} duration - animation duration in ms
 */
export function FadeInView({ delay = 0, duration = 400, style, children }) {
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(opacity, {
            toValue: 1,
            duration,
            delay,
            useNativeDriver: true,
        }).start();
    }, [opacity, delay, duration]);

    return (
        <Animated.View style={[{ opacity }, style]}>
            {children}
        </Animated.View>
    );
}

/**
 * SlideInView — Slides children up + fades in.
 * @param {number} delay - ms to wait before starting
 * @param {number} duration - animation duration in ms
 * @param {number} fromY - starting Y offset (default 24)
 */
export function SlideInView({ delay = 0, duration = 450, fromY = 24, style, children }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(fromY)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.timing(translateY, {
                toValue: 0,
                duration,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, translateY, delay, duration]);

    return (
        <Animated.View style={[{ opacity, transform: [{ translateY }] }, style]}>
            {children}
        </Animated.View>
    );
}

/**
 * ScaleInView — Scales children from small to full size + fades in.
 * @param {number} delay - ms to wait before starting
 * @param {number} duration - animation duration in ms
 * @param {number} fromScale - starting scale (default 0.85)
 */
export function ScaleInView({ delay = 0, duration = 400, fromScale = 0.85, style, children }) {
    const opacity = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(fromScale)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(opacity, {
                toValue: 1,
                duration,
                delay,
                useNativeDriver: true,
            }),
            Animated.spring(scale, {
                toValue: 1,
                friction: 6,
                tension: 50,
                delay,
                useNativeDriver: true,
            }),
        ]).start();
    }, [opacity, scale, delay, duration]);

    return (
        <Animated.View style={[{ opacity, transform: [{ scale }] }, style]}>
            {children}
        </Animated.View>
    );
}
