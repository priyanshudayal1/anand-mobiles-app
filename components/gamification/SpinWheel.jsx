import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
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
  FadeIn,
  FadeInUp,
} from "react-native-reanimated";
import { useGamification } from "../../store/useGamification";
import { useToast } from "../../store/useToast";
import { X, Sparkles, Loader2, Check, Trophy } from "lucide-react-native";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    label: "10 Coins",
    value: 10,
    type: "coins",
    color: "#FFD700",
    textColor: "#333333",
    weight: 30,
  },
  {
    id: 2,
    label: "25 Coins",
    value: 25,
    type: "coins",
    color: "#4ECDC4",
    textColor: "#FFFFFF",
    weight: 20,
  },
  {
    id: 3,
    label: "50 Coins",
    value: 50,
    type: "coins",
    color: "#96CEB4",
    textColor: "#FFFFFF",
    weight: 15,
  },
  {
    id: 4,
    label: "5% OFF",
    value: 5,
    type: "discount",
    color: "#FFEAA7",
    textColor: "#2D3436",
    weight: 15,
  },
  {
    id: 5,
    label: "10% OFF",
    value: 10,
    type: "discount",
    color: "#45B7D1",
    textColor: "#FFFFFF",
    weight: 10,
  },
  {
    id: 6,
    label: "FREE SHIPPING",
    value: "shipping",
    type: "freebie",
    color: "#FF6B6B",
    textColor: "#FFFFFF",
    weight: 8,
  },
  {
    id: 7,
    label: "100 Coins",
    value: 100,
    type: "coins",
    color: "#DDA0DD",
    textColor: "#FFFFFF",
    weight: 2,
  },
  {
    id: 8,
    label: "TRY AGAIN",
    value: "none",
    type: "none",
    color: "#636E72",
    textColor: "#FFFFFF",
    weight: 10,
  },
];

export default function SpinWheel({
  visible,
  onClose,
  onSpinComplete,
  canSpin = true,
}) {
  const { spinWheel, gamificationConfig, fetchGamificationConfig, isLoading } =
    useGamification();

  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [isSpinningState, setIsSpinningState] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [configLoaded, setConfigLoaded] = useState(false);

  const rotation = useSharedValue(0);
  const gestureRotation = useSharedValue(0);
  const isSpinning = useSharedValue(false);
  const canSpinShared = useSharedValue(canSpin);

  // Keep shared values in sync with props
  useEffect(() => {
    canSpinShared.value = canSpin;
  }, [canSpin, canSpinShared]);

  // Fetch config when wheel becomes visible if not already loaded
  useEffect(() => {
    if (visible && !gamificationConfig?.spin_wheel_rewards && !isLoading) {
      fetchGamificationConfig();
    }
  }, [visible, gamificationConfig, isLoading, fetchGamificationConfig]);

  useEffect(() => {
    // Skip logging if config is still loading
    if (isLoading && !configLoaded) {
      return;
    }

    if (
      gamificationConfig?.spin_wheel_rewards &&
      Array.isArray(gamificationConfig.spin_wheel_rewards) &&
      gamificationConfig.spin_wheel_rewards.length > 0
    ) {
      const backendSegments = gamificationConfig.spin_wheel_rewards.map(
        (reward, index) => ({
          ...reward,
          color: reward.color || getSegmentColor(index),
          textColor: reward.textColor || "#FFFFFF",
          label:
            reward.label || reward.title || `${reward.value} ${reward.type}`,
        }),
      );
      setSegments(backendSegments);
      setConfigLoaded(true);
    } else if (configLoaded || (!isLoading && gamificationConfig !== null)) {
      // Only show warning if we've already tried loading or config explicitly has no rewards
      // No backend config found; using defaults
    }
  }, [gamificationConfig, isLoading, configLoaded]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [triggerSpin],
  );

  const handleSpin = async () => {
    if (isSpinningState) return;

    if (!canSpin) {
      isSpinning.value = false;
      warning("You've already spun the wheel today. Come back tomorrow!");
      return;
    }

    isSpinning.value = true;
    setIsSpinningState(true);
    setResult(null);
    setShowConfetti(false);

    // Get current rotation value
    const startRotation = rotation.value;

    // Start immediate continuous spinning animation (keeps wheel rotating while waiting for API)
    const continuousSpinDuration = 10000; // 10 seconds of spinning
    const continuousSpins = 360 * 15; // 15 full rotations

    rotation.value = withTiming(startRotation + continuousSpins, {
      duration: continuousSpinDuration,
      easing: Easing.linear,
    });

    try {
      // Make API call while wheel is spinning
      const response = await spinWheel();

      let targetSegmentIndex;
      let rewardToShow;

      if (response.success && response.data?.reward) {
        const reward = response.data.reward;

        targetSegmentIndex = segments.findIndex(
          (s) => s.type === reward.type && s.value === reward.value,
        );

        if (
          targetSegmentIndex === -1 &&
          response.data.reward_index !== undefined
        ) {
          targetSegmentIndex = response.data.reward_index;
        }
        if (targetSegmentIndex === -1) {
          targetSegmentIndex = Math.floor(Math.random() * segments.length);
        }
        
        // Always use the segment object for display, not the API reward
        rewardToShow = segments[targetSegmentIndex];
      } else {
        // Fallback to random segment
        targetSegmentIndex = Math.floor(Math.random() * segments.length);
        rewardToShow = segments[targetSegmentIndex];
      }

      // Cancel the continuous spin and get current rotation value
      cancelAnimation(rotation);
      const currentRotationValue = rotation.value;

      // Calculate exact center of target segment
      const segmentCenter =
        targetSegmentIndex * anglePerSegment + anglePerSegment / 2;

      // Calculate final rotation to land exactly on segment center
      // The pointer is at 0 degrees (top), we want segment center aligned with it
      const targetAngle = (360 - segmentCenter) % 360;

      // Get current angle in 0-360 range from where wheel currently is
      const currentAngle = ((currentRotationValue % 360) + 360) % 360;

      // Calculate additional rotation needed (with extra spins for dramatic effect)
      const additionalRotation = (targetAngle - currentAngle + 360) % 360;
      const extraSpins = 360 * 5; // 5 more full spins
      const finalRotation =
        currentRotationValue + extraSpins + additionalRotation;

      // Smoothly decelerate to final target
      rotation.value = withTiming(
        finalRotation,
        {
          duration: 4000,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            runOnJS(handleSpinComplete)(rewardToShow);
          }
        },
      );
    } catch (error) {
      console.error("Spin error:", error);

      // Even on error, complete the spin gracefully
      cancelAnimation(rotation);
      const currentRotationValue = rotation.value;

      const randomIndex = Math.floor(Math.random() * segments.length);
      const segmentCenter = randomIndex * anglePerSegment + anglePerSegment / 2;

      const targetAngle = (360 - segmentCenter) % 360;
      const currentAngle = ((currentRotationValue % 360) + 360) % 360;
      const additionalRotation = (targetAngle - currentAngle + 360) % 360;
      const extraSpins = 360 * 4;
      const finalRotation =
        currentRotationValue + extraSpins + additionalRotation;

      rotation.value = withTiming(
        finalRotation,
        {
          duration: 3000,
          easing: Easing.out(Easing.cubic),
        },
        (finished) => {
          if (finished) {
            isSpinning.value = false;
            setIsSpinningState(false);
            runOnJS(showError)("Failed to spin. Please try again.");
          }
        },
      );
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
          <View style={styles.content}>
            <View style={styles.header}>
              <Sparkles size={28} color="#FFD700" />
              <Text style={styles.title}>Daily Spin & Win</Text>
              <Text style={styles.subtitle}>
                {canSpin
                  ? "Spin the wheel for amazing rewards!"
                  : "Come back tomorrow for another spin!"}
              </Text>
            </View>

            {!result && (
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
                  disabled={isSpinningState || !canSpin}
                  activeOpacity={0.8}
                >
                  {isSpinningState ? (
                    <Loader2
                      size={24}
                      color="#7c3aed"
                      style={{ transform: [{ rotate: "45deg" }] }}
                    />
                  ) : canSpin ? (
                    <Text style={styles.spinButtonText}>SPIN</Text>
                  ) : (
                    <Check size={24} color="#7c3aed" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={styles.instruction}>
              {isSpinningState ? "Spinning..." : "Tap SPIN or swipe the wheel!"}
            </Text>

            {result && (
              <Animated.View
                entering={FadeIn.duration(300)}
                style={styles.resultContainer}
              >
                <Animated.View
                  entering={FadeInUp.duration(500).springify()}
                  style={styles.resultCard}
                >
                  <View style={styles.celebrationIcon}>
                    <Trophy size={48} color="#7c3aed" />
                  </View>
                  <Text style={styles.resultTitle}>Congratulations!</Text>
                  <Text style={styles.resultSubtitle}>You won</Text>
                  <View style={styles.rewardBadge}>
                    <Text style={styles.resultValue}>{result.label}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.claimButton}
                    onPress={handleClose}
                    activeOpacity={0.9}
                  >
                    <Text style={styles.claimButtonText}>Close</Text>
                  </TouchableOpacity>
                </Animated.View>
              </Animated.View>
            )}
          </View>

          {showConfetti && (
            <View style={styles.confettiContainer} pointerEvents="none">
              {confettiPieces.map((piece) => (
                <ConfettiPiece
                  key={piece.id}
                  delay={piece.delay}
                  startX={piece.startX}
                />
              ))}
            </View>
          )}
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
    paddingTop: 40,
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
    zIndex: 100,
  },
  resultCard: {
    backgroundColor: "#FFF",
    paddingVertical: 40,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: "center",
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.4,
    shadowRadius: 25,
    elevation: 30,
    minWidth: 280,
    borderWidth: 3,
    borderColor: "#FFD700",
  },
  celebrationIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFF5E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#166534",
    marginBottom: 8,
  },
  resultSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  rewardBadge: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: "#7c3aed",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  resultValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFF",
  },
  claimButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 28,
    shadowColor: "#FFD700",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
  },
  claimButtonText: {
    color: "#1a1a1a",
    fontWeight: "700",
    fontSize: 18,
    letterSpacing: 0.5,
  },
  confettiContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 500,
  },
});
