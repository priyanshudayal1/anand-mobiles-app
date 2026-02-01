import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert
} from 'react-native';
import Svg, { Path, G, Text as SvgText, Circle, Polygon } from 'react-native-svg';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDecay,
  withSpring,
  Easing,
  runOnJS,
  useDerivedValue,
  cancelAnimation,
  withSequence
} from 'react-native-reanimated';
import { useTheme } from '../../store/useTheme';
import { useGamification } from '../../store/useGamification';
import { Ionicons } from '@expo/vector-icons';
import { Gift } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.9; // 90% of screen width
const RADIUS = WHEEL_SIZE / 2;
const CENTER = RADIUS;

const DEFAULT_SEGMENTS = [
  { id: 1, label: "10% OFF", value: 10, type: "discount", color: "#FF6B6B", textColor: "#FFFFFF" },
  { id: 2, label: "FREE SHIP", value: "shipping", type: "freebie", color: "#4ECDC4", textColor: "#FFFFFF" },
  { id: 3, label: "20% OFF", value: 20, type: "discount", color: "#45B7D1", textColor: "#FFFFFF" },
  { id: 4, label: "50 COINS", value: 50, type: "coins", color: "#96CEB4", textColor: "#FFFFFF" },
  { id: 5, label: "5% OFF", value: 5, type: "discount", color: "#FFEAA7", textColor: "#2D3436" },
  { id: 6, label: "100 COINS", value: 100, type: "coins", color: "#DDA0DD", textColor: "#FFFFFF" },
  { id: 7, label: "15% OFF", value: 15, type: "discount", color: "#FD79A8", textColor: "#FFFFFF" },
  { id: 8, label: "TRY AGAIN", value: "none", type: "none", color: "#636E72", textColor: "#FFFFFF" },
];

export default function SpinWheel({ visible, onClose, onSpinComplete }) {
  const { colors } = useTheme();
  const { spinWheel, gamificationStatus, isLoading } = useGamification();

  const [segments, setSegments] = useState(DEFAULT_SEGMENTS);
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState(null);
  const [canSpinState, setCanSpinState] = useState(true);

  const rotation = useSharedValue(0);
  const savedRotation = useSharedValue(0);
  const isDragging = useSharedValue(false);

  useEffect(() => {
    if (gamificationStatus?.spin_wheel_rewards) {
      // Ensure we have valid colors and text colors
      const backendSegments = gamificationStatus.spin_wheel_rewards.map((reward, index) => ({
        ...reward,
        color: reward.color || getSegmentColor(index),
        textColor: reward.textColor || getTextColor(reward.color || getSegmentColor(index)),
        label: reward.label || reward.title // Fallback if label is missing
      }));
      // Backend usually sends top-level list, make sure it is array
      if (Array.isArray(backendSegments) && backendSegments.length > 0) {
        setSegments(backendSegments);
      }
    }
  }, [gamificationStatus]);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      rotation.value = 0;
      savedRotation.value = 0;
      setResult(null);
      setIsSpinning(false);
      setCanSpinState(true);
    }
  }, [visible]);

  const getSegmentColor = (index) => {
    const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#FD79A8", "#636E72"];
    return colors[index % colors.length];
  };

  const getTextColor = (bgColor) => {
    return "#FFFFFF"; // Simple fallback, or calculate brightness
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
    const angle = ((index * anglePerSegment) + (anglePerSegment / 2) - 90) * (Math.PI / 180);
    const textRadius = RADIUS * 0.65; // Place text at 65% of radius
    return {
      x: CENTER + textRadius * Math.cos(angle),
      y: CENTER + textRadius * Math.sin(angle),
      rotation: (index * anglePerSegment) + (anglePerSegment / 2)
    };
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  const gesture = Gesture.Pan()
    .onBegin(() => {
      if (isSpinning || !canSpinState) return;
      isDragging.value = true;
      cancelAnimation(rotation);
      savedRotation.value = rotation.value;
    })
    .onUpdate((e) => {
      if (isSpinning || !canSpinState) return;
      // Simple rotation logic based on x/y movement approximation or angle
      // Let's just use drag distance for simplicity and feel
      rotation.value = savedRotation.value + e.translationX + e.translationY;
    })
    .onEnd((e) => {
      if (isSpinning || !canSpinState) return;
      isDragging.value = false;

      // Calculate velocity
      const velocity = Math.abs(e.velocityX) + Math.abs(e.velocityY);

      if (velocity > 500) { // Threshold to trigger spin
        runOnJS(handleSpin)();
      } else {
        // Snap back if not enough force
        rotation.value = withSpring(0);
      }
    });

  const handleSpin = async () => {
    if (isSpinning || !canSpinState) return;

    setIsSpinning(true);
    setResult(null);
    setCanSpinState(false);

    // Start spinning indefinitely first
    rotation.value = withSequence(
      withTiming(rotation.value + 360 * 5, { duration: 3000, easing: Easing.linear }),
      withTiming(rotation.value + 360 * 10, { duration: 3000, easing: Easing.linear }) // Continue spinning if needed
    );

    const response = await spinWheel();

    cancelAnimation(rotation); // Stop the indefinite spin, we will now animate to target

    if (response.success && response.data?.reward) {
      const reward = response.data.reward;
      let rewardIndex = -1;

      rewardIndex = segments.findIndex(s =>
        s.type === reward.type &&
        s.value === reward.value &&
        s.label === reward.label
      );

      if (rewardIndex === -1 && response.data.reward_index !== undefined) {
        rewardIndex = response.data.reward_index;
      }

      if (rewardIndex === -1) rewardIndex = 0;

      const currentRotation = rotation.value % 360;
      const segmentAngleStart = rewardIndex * anglePerSegment;

      // Target angle (where the segment center aligns with -90 pointer)
      // Segment range: [start, start + angle]
      // Center: start + angle/2
      // Pointer is at -90 (or 270)
      // We need Rotation + Center = 270 (mod 360)
      // So Rotation = 270 - Center

      const segmentCenter = (rewardIndex * anglePerSegment) + (anglePerSegment / 2);

      // We want final angle to be such that segmentCenter is at top.
      // The wheel starts at 0 rotation, seg 0 center is at -90 + angle/2.
      // Wait, my SVG logic has -90 offset baked in.
      // Seg 0 is at top if rotation is 0 - angle/2? No.

      // Let's assume standard position:
      // createSegmentPath(index) -> starts at (index*angle - 90).
      // Pointer is at Top (-90).
      // So Seg 0 starts at pointer.
      // Center of Seg 0 is at -90 + angle/2.
      // To align Center of Seg 0 with pointer (-90), we need to rotate by -angle/2.

      // General: Center of Seg I is at (-90 + I*angle + angle/2).
      // We want this point to be at -90 after rotation R.
      // (-90 + I*angle + angle/2) + R = -90 (mod 360).
      // R = -(I*angle + angle/2).

      // We are currently at `rotation.value`.
      // We want to land on (`base_rotation + R`).
      // We want to add at least 2 full spins more for effect.

      const targetR = -(segmentCenter);
      // Normalize current rotation value
      const currentRot = rotation.value;

      // Find next multiple of 360 that allows us to reach targetR + buffer
      const minSpins = 5;
      const targetRot = currentRot + (360 * minSpins) + (targetR - (currentRot % 360));

      // Adjust for seamlessness if target is behind
      const finalRot = targetRot < currentRot ? targetRot + 360 : targetRot;

      rotation.value = withTiming(finalRot, {
        duration: 4000,
        easing: Easing.out(Easing.cubic),
      }, (finished) => {
        if (finished) {
          runOnJS(handleSpinComplete)(reward);
        }
      });

    } else {
      Alert.alert("Error", response.error || "Failed to spin. Try again.");
      setIsSpinning(false);
      setCanSpinState(true);
    }
  };

  const handleSpinComplete = (reward) => {
    setResult(reward);
    //setIsSpinning(false); // Keep it true so button stays disabled until closed or reset
    if (onSpinComplete) onSpinComplete(reward);

    // Show confetti or success modal content here? 
    // For now simple alert or local state within modal
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.content}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#FFF" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Daily Spin & Win</Text>
            <Text style={styles.subtitle}>Spin the wheel for amazing rewards!</Text>
          </View>

          {/* Wheel Container */}
          <GestureHandlerRootView>
            <View style={styles.wheelContainer}>
              {/* Pointer */}
              <View style={styles.pointerContainer}>
                <View style={styles.pointer} />
              </View>

              <GestureDetector gesture={gesture}>
                <Animated.View style={[styles.wheel, animatedStyle]}>
                  <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
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
                              fontSize="12"
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

              {/* Center Button */}
              <TouchableOpacity
                style={[styles.spinButton, (isSpinning || !canSpinState) && styles.disabledButton]}
                onPress={handleSpin}
                disabled={isSpinning || isLoading || !canSpinState}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.spinButtonText}>{isSpinning ? "..." : "SPIN"}</Text>
                )}
              </TouchableOpacity>
              <Text style={{ marginTop: 20, color: '#FFF', opacity: 0.7, fontSize: 12 }}>
                Tap 'SPIN' or Swipe the wheel!
              </Text>
            </View>
          </GestureHandlerRootView>

          {/* Result */}
          {result && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultTitle}>Congratulations!</Text>
              <Text style={styles.resultValue}>You won {result.label}</Text>
              <TouchableOpacity style={styles.claimButton} onPress={onClose}>
                <Text style={styles.claimButtonText}>Claim Reward</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  title: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4
  },
  subtitle: {
    color: '#EEE',
    fontSize: 14
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    zIndex: 10
  },
  wheelContainer: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  wheel: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
  },
  pointerContainer: {
    position: 'absolute',
    top: 0,
    zIndex: 10,
    alignItems: 'center',
    width: 40,
    height: 40,
    justifyContent: 'flex-start',
    marginTop: -10 // Overlap slightly
  },
  pointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 15,
    borderRightWidth: 15,
    borderBottomWidth: 30,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFD700', // Gold pointer
    transform: [{ rotate: '180deg' }], // Point down
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  spinButton: {
    position: 'absolute',
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#7c3aed', // Purple
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 8,
    zIndex: 20
  },
  disabledButton: {
    opacity: 0.8,
    borderColor: '#9ca3af'
  },
  spinButtonText: {
    color: '#7c3aed',
    fontWeight: 'bold',
    fontSize: 16
  },
  resultContainer: {
    marginTop: 30,
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    width: '80%'
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#166534', // Green
    marginBottom: 10
  },
  resultValue: {
    fontSize: 18,
    color: '#333',
    marginBottom: 15,
    textAlign: 'center'
  },
  claimButton: {
    backgroundColor: '#7c3aed',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20
  },
  claimButtonText: {
    color: '#FFF',
    fontWeight: '600'
  }
});
