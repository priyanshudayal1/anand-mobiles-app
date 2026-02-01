import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from "react-native";
import Svg, { Path, G, Text as SvgText } from "react-native-svg";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  cancelAnimation,
} from "react-native-reanimated";
import { useTheme } from "../../store/useTheme";
import { useGamification } from "../../store/useGamification";
import { X, Sparkles } from "lucide-react-native";

const { width, height } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.85, 340);
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

// Confetti particle component
const ConfettiPiece = ({ delay, startX }) => {
  const translateY = useSharedValue(-20);
  const translateX = useSharedValue(startX);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    const randomX = (Math.random() - 0.5) * 100;
    translateY.value = withTiming(height + 50, {
      duration: 3000 + delay,
      easing: Easing.linear,
    });
    translateX.value = withTiming(startX + randomX, { duration: 3000 + delay });
    rotate.value = withTiming(360 * 3, { duration: 3000 + delay });
    opacity.value = withTiming(0, { duration: 3000 + delay });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
    opacity: opacity.value,
  }));

  const colors = [
    "#FFD700",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#DDA0DD",
    "#7C3AED",
    "#FF69B4",
    "#00CED1",
  ];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 10,
          height: 10,
          backgroundColor: color,
          borderRadius: Math.random() > 0.5 ? 5 : 0,
        },
        animatedStyle,
      ]}
    />
  );
};

const DEFAULT_SEGMENTS = [
  {
    id: 1,
    label: "10% OFF",
    value: 10,
    type: "discount",
    color: "#FF6B6B",
    textColor: "#FFFFFF",
  },
  {
    id: 2,
    label: "FREE SHIP",
    value: "shipping",
    type: "freebie",
    color: "#4ECDC4",
    textColor: "#FFFFFF",
  },
  {
    id: 3,
    label: "20% OFF",
    value: 20,
    type: "discount",
    color: "#45B7D1",
    textColor: "#FFFFFF",
  },
  {
    id: 4,
    label: "50 COINS",
    value: 50,
    type: "coins",
    color: "#96CEB4",
    textColor: "#FFFFFF",
  },
  {
    id: 5,
    label: "5% OFF",
    value: 5,
    type: "discount",
    color: "#FFEAA7",
    textColor: "#2D3436",
  },
  {
    id: 6,
    label: "100 COINS",
    value: 100,
    type: "coins",
    color: "#DDA0DD",
    textColor: "#FFFFFF",
  },
  {
    id: 7,
    label: "15% OFF",
    value: 15,
    type: "discount",
    color: "#FD79A8",
    textColor: "#FFFFFF",
  },
  {
    id: 8,
    label: "TRY AGAIN",
    value: "none",
    type: "none",
    color: "#636E72",
    textColor: "#FFFFFF",
  },
];

export default function SpinWheel({
  visible,
  onClose,
  onSpinComplete,
  canSpin = true,
}) {
  const { colors } = useTheme();
  const { spinWheel, gamificationStatus, isLoading } = useGamification();

  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [isSpinningState, setIsSpinningState] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);

  const rotation = useSharedValue(0);
  const gestureRotation = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const canSpinShared = useSharedValue(canSpin);

  // Keep shared values in sync with props
  useEffect(() => {
    canSpinShared.value = canSpin;
  }, [canSpin]);

  useEffect(() => {
    if (gamificationStatus?.spin_wheel_rewards) {
      const backendSegments = gamificationStatus.spin_wheel_rewards.map(
        (reward, index) => ({
          ...reward,
          color: reward.color || getSegmentColor(index),
          textColor: reward.textColor || "#FFFFFF",
          label: reward.label || reward.title,
        }),
      );
      if (Array.isArray(backendSegments) && backendSegments.length > 0) {
        setSegments(backendSegments);
      }
    }
  }, [gamificationStatus]);

  useEffect(() => {
    if (visible) {
      rotation.value = 0;
      gestureRotation.value = 0;
      isSpinning.value = false;
      setResult(null);
      setIsSpinningState(false);
      setShowConfetti(false);
      setConfettiPieces([]);
    }
  }, [visible]);

  const triggerConfetti = () => {
    const pieces = [];
    for (let i = 0; i < 50; i++) {
      pieces.push({
        id: i,
        delay: Math.random() * 500,
        startX: Math.random() * width,
      });
    }
    setConfettiPieces(pieces);
    setShowConfetti(true);
  };

  const getSegmentColor = (index) => {
    const segmentColors = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#FD79A8",
      "#636E72",
    ];
    return segmentColors[index % segmentColors.length];
  };

  const numberOfSegments = segments.length;
  const anglePerSegment = 360 / numberOfSegments;

  const createSegmentPath = (index) => {
    const startAngle = (index * anglePerSegment - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * anglePerSegment - 90) * (Math.PI / 180);

    // Adjust logic to match standard SVG arc
    const x1 = CENTER + RADIUS * Math.cos(startAngle);
    const y1 = CENTER + RADIUS * Math.sin(startAngle);
    const x2 = CENTER + RADIUS * Math.cos(endAngle);
    const y2 = CENTER + RADIUS * Math.sin(endAngle);

    return `M ${CENTER} ${CENTER} L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;
  };

  // Text position calculation
  const getTextCoordinates = (index) => {
    const angle =
      (index * anglePerSegment + anglePerSegment / 2 - 90) * (Math.PI / 180);
    const textRadius = RADIUS * 0.65; // Place text at 65% of radius
    return {
      x: CENTER + textRadius * Math.cos(angle),
      y: CENTER + textRadius * Math.sin(angle),
      rotation: index * anglePerSegment + anglePerSegment / 2,
    };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value + gestureRotation.value}deg` }],
    };
  });

  const triggerSpin = useCallback(() => {
    handleSpin();
  }, [segments, canSpin]);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .onUpdate((e) => {
          "worklet";
          if (isSpinning.value) return;
          gestureRotation.value = (e.translationX + e.translationY) * 0.5;
        })
        .onEnd((e) => {
          "worklet";
          if (isSpinning.value) return;
          const velocity = Math.abs(e.velocityX) + Math.abs(e.velocityY);

          if (velocity > 800 && canSpinShared.value) {
            rotation.value = rotation.value + gestureRotation.value;
            gestureRotation.value = 0;
            isSpinning.value = true;
            runOnJS(triggerSpin)();
          } else {
            gestureRotation.value = withSpring(0);
          }
        }),
    [triggerSpin],
  );

  const handleSpin = async () => {
    if (isSpinningState) return;

    if (!canSpin) {
      isSpinning.value = false;
      Alert.alert(
        "Already Spun",
        "You've already spun the wheel today. Come back tomorrow!",
      );
      return;
    }

    isSpinning.value = true;
    setIsSpinningState(true);
    setResult(null);
    setShowConfetti(false);

    const currentRot = rotation.value;
    rotation.value = withTiming(currentRot + 360 * 8, {
      duration: 4000,
      easing: Easing.out(Easing.quad),
    });

    try {
      const response = await spinWheel();

      if (response.success && response.data?.reward) {
        const reward = response.data.reward;
        let rewardIndex = segments.findIndex(
          (s) => s.type === reward.type && s.value === reward.value,
        );

        if (rewardIndex === -1 && response.data.reward_index !== undefined) {
          rewardIndex = response.data.reward_index;
        }
        if (rewardIndex === -1)
          rewardIndex = Math.floor(Math.random() * segments.length);

        const segmentCenter =
          rewardIndex * anglePerSegment + anglePerSegment / 2;
        const targetRotation =
          360 * 10 - segmentCenter + (Math.random() * 10 - 5);

        cancelAnimation(rotation);
        rotation.value = withTiming(
          targetRotation,
          {
            duration: 5000,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(handleSpinComplete)(reward);
            }
          },
        );
      } else {
        const randomIndex = Math.floor(Math.random() * segments.length);
        const segmentCenter =
          randomIndex * anglePerSegment + anglePerSegment / 2;
        const targetRotation = 360 * 10 - segmentCenter;

        cancelAnimation(rotation);
        rotation.value = withTiming(
          targetRotation,
          {
            duration: 5000,
            easing: Easing.out(Easing.cubic),
          },
          (finished) => {
            if (finished) {
              runOnJS(handleSpinComplete)(segments[randomIndex]);
            }
          },
        );
      }
    } catch (error) {
      console.error("Spin error:", error);
      isSpinning.value = false;
      setIsSpinningState(false);
      Alert.alert("Error", "Failed to spin. Please try again.");
    }
  };

  const handleSpinComplete = (reward) => {
    setResult(reward);
    isSpinning.value = false;
    setIsSpinningState(false);
    triggerConfetti();

    if (onSpinComplete) {
      onSpinComplete(reward);
    }
  };

  const handleClose = () => {
    cancelAnimation(rotation);
    cancelAnimation(gestureRotation);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.container}>
          {showConfetti &&
            confettiPieces.map((piece) => (
              <ConfettiPiece
                key={piece.id}
                delay={piece.delay}
                startX={piece.startX}
              />
            ))}

          <View style={styles.content}>
            <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
              <X size={24} color="#FFF" />
            </TouchableOpacity>

            <View style={styles.header}>
              <Sparkles size={28} color="#FFD700" />
              <Text style={styles.title}>Daily Spin & Win</Text>
              <Text style={styles.subtitle}>
                {canSpin
                  ? "Spin the wheel for amazing rewards!"
                  : "Come back tomorrow for another spin!"}
              </Text>
            </View>

            <View style={styles.wheelWrapper}>
              <View style={styles.pointerContainer}>
                <View style={styles.pointer} />
              </View>

              <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.wheel, animatedStyle]}>
                  <Svg
                    width={WHEEL_SIZE}
                    height={WHEEL_SIZE}
                    viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
                  >
                    <Path
                      d={`M ${CENTER} ${CENTER} m -${RADIUS} 0 a ${RADIUS} ${RADIUS} 0 1 0 ${RADIUS * 2} 0 a ${RADIUS} ${RADIUS} 0 1 0 -${RADIUS * 2} 0`}
                      fill="none"
                      stroke="#FFD700"
                      strokeWidth="4"
                    />
                    <G>
                      {segments.map((segment, index) => {
                        const textCoords = getTextCoordinates(index);
                        return (
                          <G key={segment.id || index}>
                            <Path
                              d={createSegmentPath(index)}
                              fill={segment.color}
                              stroke="#FFF"
                              strokeWidth="2"
                            />
                            <SvgText
                              x={textCoords.x}
                              y={textCoords.y}
                              fill={segment.textColor}
                              fontSize="11"
                              fontWeight="bold"
                              textAnchor="middle"
                              alignmentBaseline="middle"
                              transform={`rotate(${textCoords.rotation + 90}, ${textCoords.x}, ${textCoords.y})`}
                            >
                              {segment.label}
                            </SvgText>
                          </G>
                        );
                      })}
                    </G>
                  </Svg>
                </Animated.View>
              </GestureDetector>

              <TouchableOpacity
                style={[
                  styles.spinButton,
                  (!canSpin || isSpinningState) && styles.spinButtonDisabled,
                ]}
                onPress={handleSpin}
                disabled={isSpinningState || isLoading || !canSpin}
                activeOpacity={0.8}
              >
                {isLoading || isSpinningState ? (
                  <ActivityIndicator size="small" color="#7c3aed" />
                ) : (
                  <Text style={styles.spinButtonText}>
                    {canSpin ? "SPIN" : "✓"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <Text style={styles.instruction}>
              {isSpinningState ? "Spinning..." : "Tap SPIN or swipe the wheel!"}
            </Text>

            {result && (
              <View style={styles.resultContainer}>
                <View style={styles.resultCard}>
                  <Text style={styles.resultEmoji}>🎉</Text>
                  <Text style={styles.resultTitle}>Congratulations!</Text>
                  <Text style={styles.resultValue}>
                    You won: {result.label}
                  </Text>
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={handleClose}
                  >
                    <Text style={styles.claimButtonText}>Claim Reward</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "100%",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  closeButton: {
    position: "absolute",
    top: -80,
    right: 10,
    padding: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 24,
    zIndex: 100,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 8,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    marginTop: 4,
  },
  wheelWrapper: {
    width: WHEEL_SIZE + 40,
    height: WHEEL_SIZE + 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  pointerContainer: {
    position: "absolute",
    top: 0,
    zIndex: 50,
    alignItems: "center",
  },
  pointer: {
    width: 0,
    height: 0,
    borderLeftWidth: 18,
    borderRightWidth: 18,
    borderTopWidth: 35,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderTopColor: "#FFD700",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 10,
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: WHEEL_SIZE / 2,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 20,
  },
  spinButton: {
    position: "absolute",
    width: 72,
    height: 72,
    backgroundColor: "#FFF",
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 5,
    borderColor: "#7c3aed",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 15,
    zIndex: 60,
  },
  spinButtonDisabled: {
    borderColor: "#9ca3af",
    opacity: 0.7,
  },
  spinButtonText: {
    color: "#7c3aed",
    fontWeight: "bold",
    fontSize: 18,
  },
  instruction: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 13,
    marginTop: 16,
  },
  resultContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    zIndex: 100,
  },
  resultCard: {
    backgroundColor: "#FFF",
    paddingVertical: 32,
    paddingHorizontal: 40,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 25,
  },
  resultEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  resultTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 8,
  },
  resultValue: {
    fontSize: 18,
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  claimButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 25,
  },
  claimButtonText: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 16,
  },
});
