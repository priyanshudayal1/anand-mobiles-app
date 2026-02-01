import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Clock } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";

/**
 * CountdownTimer Component
 * Displays a countdown timer for deals and flash sales
 */
const CountdownTimer = ({
  endTime,
  label = "",
  size = "md",
  variant = "default",
  onExpire,
  showIcon = true,
  showLabels = true,
  style,
}) => {
  const { colors } = useTheme();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    expired: false,
  });

  const calculateTimeLeft = useCallback(() => {
    if (!endTime) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    // Handle different date formats if necessary, but Date constructor is usually robust
    const endDate = new Date(endTime);
    const now = new Date();
    const difference = endDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      expired: false,
    };
  }, [endTime]);

  useEffect(() => {
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.expired && onExpire) {
        onExpire();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [calculateTimeLeft, onExpire]);

  // Size configurations
  const sizes =
    {
      sm: {
        boxSize: 28,
        fontSize: 12,
        labelSize: 9,
        iconSize: 12,
        gap: 2,
      },
      md: {
        boxSize: 36,
        fontSize: 14,
        labelSize: 10,
        iconSize: 14,
        gap: 4,
      },
      lg: {
        boxSize: 44,
        fontSize: 18,
        labelSize: 12,
        iconSize: 18,
        gap: 6,
      },
    }[size] || sizes.md;

  // Variant configurations
  const isUrgent =
    !timeLeft.expired &&
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes < 60; // Less than 1 hour is usually "urgent" but logic in web was days=0 hours=0.

  const getVariantStyles = () => {
    // If urgent and default variant, switch to urgent styling
    const activeVariant =
      isUrgent && variant === "default" ? "urgent" : variant;

    switch (activeVariant) {
      case "urgent":
        return {
          bg: colors.error + "20", // lighter error
          text: colors.error,
          boxBg: colors.error,
          boxText: colors.white,
          border: colors.error,
        };
      case "minimal":
        return {
          bg: "transparent",
          text: colors.text,
          boxBg: colors.cardBg, // or grey
          boxText: colors.text,
          border: colors.border,
        };
      case "default":
      default:
        return {
          bg: colors.primary + "15", // light primary
          text: colors.primary, // dark primary text if available, else primary
          boxBg: colors.primary,
          boxText: colors.white,
          border: colors.primary,
        };
    }
  };

  const styles = getVariantStyles();

  if (timeLeft.expired) {
    return (
      <View
        style={[
          {
            flexDirection: "row",
            alignItems: "center",
            padding: 4,
            borderRadius: 4,
            backgroundColor: colors.border,
          },
          style,
        ]}
      >
        <Text
          style={{
            fontSize: sizes.fontSize,
            color: colors.textSecondary,
            fontWeight: "500",
          }}
        >
          Offer Expired
        </Text>
      </View>
    );
  }

  const TimeBox = ({ value, labelText }) => (
    <View style={{ alignItems: "center" }}>
      <View
        style={{
          width: sizes.boxSize,
          height: sizes.boxSize,
          backgroundColor: styles.boxBg,
          borderColor: styles.border,
          borderWidth: variant === "minimal" ? 1 : 0,
          borderRadius: 6,
          justifyContent: "center",
          alignItems: "center",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: variant === "minimal" ? 0 : 0.1,
          shadowRadius: 1,
          elevation: variant === "minimal" ? 0 : 2,
        }}
      >
        <Text
          style={{
            color: styles.boxText,
            fontSize: sizes.fontSize,
            fontWeight: "bold",
            fontVariant: ["tabular-nums"],
          }}
        >
          {String(value).padStart(2, "0")}
        </Text>
      </View>
      {showLabels && (
        <Text
          style={{
            fontSize: sizes.labelSize,
            color: colors.textSecondary,
            marginTop: 2,
            fontWeight: "500",
          }}
        >
          {labelText}
        </Text>
      )}
    </View>
  );

  const Separator = () => (
    <Text
      style={{
        fontSize: sizes.fontSize,
        fontWeight: "bold",
        color: variant === "minimal" ? colors.text : styles.boxBg,
        marginHorizontal: 2,
        marginBottom: showLabels ? 12 : 0,
      }}
    >
      :
    </Text>
  );

  return (
    <View style={[{ alignItems: "flex-start" }, style]}>
      {label ? (
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
            gap: 4,
          }}
        >
          {showIcon && <Clock size={sizes.iconSize} color={styles.text} />}
          <Text
            style={{
              color: styles.text,
              fontSize: sizes.fontSize,
              fontWeight: "600",
            }}
          >
            {label}
          </Text>
        </View>
      ) : null}

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {timeLeft.days > 0 && (
          <>
            <TimeBox value={timeLeft.days} labelText="Days" />
            <Separator />
          </>
        )}
        <TimeBox value={timeLeft.hours} labelText="Hrs" />
        <Separator />
        <TimeBox value={timeLeft.minutes} labelText="Min" />
        <Separator />
        <TimeBox value={timeLeft.seconds} labelText="Sec" />
      </View>
    </View>
  );
};

export default CountdownTimer;
