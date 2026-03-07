import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Linking,
} from "react-native";
import { Image } from "expo-image";
import { useVideoPlayer, VideoView } from "expo-video";
import {
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
// Aspect ratio 16:9 or similar to web
const VIDEO_HEIGHT = width * (9 / 16);

export default function VideoCarousel({
  showHeader = false,
  videos: propVideos,
  autoPlay = true,
}) {
  const { colors } = useTheme();
  const { promotionVideos } = useHome();
  // Ensure we use the provided videos or fallback to promotionVideos from store
  const videos =
    Array.isArray(propVideos) && propVideos.length > 0
      ? propVideos
      : Array.isArray(promotionVideos)
        ? promotionVideos
        : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  // If items change, reset index
  useEffect(() => {
    setCurrentIndex(0);
  }, [videos.length]);

  const handleNext = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % videos.length);
  }, [videos.length]);

  const hasVideos = videos.length > 0;
  // Safely get current item or empty object
  const currentItem = hasVideos ? videos[currentIndex] : {};
  // Helper to ensure URL is valid string
  const url = currentItem.video_url || currentItem.link || "";
  // Check for explicit thumbnail/image
  const thumbnailUrl =
    currentItem.thumbnail || currentItem.image || currentItem.image_url;

  const isVideo =
    url &&
    (url.endsWith(".mp4") ||
      url.endsWith(".webm") ||
      url.endsWith(".avi") ||
      url.endsWith(".mov") ||
      (url.includes("video") && !url.match(/\.(jpg|jpeg|png|gif|webp)$/i)));

  const player = useVideoPlayer(url, (player) => {
    player.loop = false;
    // Only play if it's a video and we have videos AND autoPlay is true
    if (hasVideos && isVideo && autoPlay) {
      player.play();
      player.muted = isMuted;
    }
  });

  // Listen for video end
  useEffect(() => {
    const subscription = player.addListener("playToEnd", () => {
      handleNext();
    });
    return () => subscription.remove();
  }, [player, handleNext]);

  // Sync mute state
  useEffect(() => {
    player.muted = isMuted;
  }, [isMuted, player]);

  // For images or paused videos (thumbnails), auto-advance after 5 seconds
  useEffect(() => {
    // If not auto-playing video, treat like slideshow
    if (hasVideos && (!isVideo || !autoPlay)) {
      const timer = setTimeout(() => {
        handleNext();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, isVideo, hasVideos, handleNext, autoPlay]);

  const handlePrev = useCallback(() => {
    if (videos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + videos.length) % videos.length);
  }, [videos.length]);

  if (!hasVideos) {
    return null;
  }

  const handlePress = () => {
    if (currentItem.link_url) {
      Linking.openURL(currentItem.link_url).catch((err) =>
        console.error("Failed to open link:", err),
      );
    }
  };

  // Determine if we show the video player or an image (thumbnail/banner)
  const showVideoPlayer = isVideo && (autoPlay || !thumbnailUrl);
  const imageSource = !showVideoPlayer ? thumbnailUrl || url : null;

  return (
    <View
      style={{
        marginTop: 0,
        marginBottom: 0,
        backgroundColor: "transparent",
      }}
    >
      {showHeader && (
        <View>
          <View style={{ alignSelf: "flex-start" }}>
            <Text
              style={{ fontSize: 18, fontWeight: "bold", color: colors.text }}
            >
              Trending Videos
            </Text>
            <View
              style={{
                height: 3,
                width: 40,
                marginTop: 4,
                backgroundColor: colors.primary,
                borderRadius: 2,
                alignSelf: "flex-end",
              }}
            />
          </View>
        </View>
      )}

      <View style={{ width: width, height: VIDEO_HEIGHT }}>
        {showVideoPlayer ? (
          <VideoView
            player={player}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            nativeControls={false}
          />
        ) : (
          <Image
            source={{ uri: imageSource }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
        )}

        {/* Gradient Overlay */}
        <LinearGradient
          colors={["transparent", "rgba(0,0,0,0.7)"]}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />

        {/* Clickable Area for Link */}
        {currentItem.link_url && (
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            onPress={handlePress}
            activeOpacity={1}
          />
        )}

        {/* Mute Toggle */}
        {isVideo && (
          <TouchableOpacity
            onPress={() => setIsMuted(!isMuted)}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              padding: 8,
              borderRadius: 20,
              backgroundColor: "rgba(0,0,0,0.5)",
            }}
          >
            {isMuted ? (
              <VolumeX color={colors.white} size={20} />
            ) : (
              <Volume2 color={colors.white} size={20} />
            )}
          </TouchableOpacity>
        )}

        {/* Text Content */}
        <View
          style={{
            position: "absolute",
            bottom: 16,
            left: 16,
            right: 16,
            pointerEvents: "none",
          }}
        >
          {currentItem.title && (
            <Text
              style={{
                color: colors.white,
                fontSize: 18,
                fontWeight: "bold",
                marginBottom: 4,
                textShadowColor: "rgba(0, 0, 0, 0.75)",
                textShadowOffset: { width: -1, height: 1 },
                textShadowRadius: 10,
              }}
            >
              {currentItem.title}
            </Text>
          )}
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 12,
              textShadowColor: "rgba(0, 0, 0, 0.75)",
              textShadowOffset: { width: -1, height: 1 },
              textShadowRadius: 10,
            }}
          >
            Check out our amazing deals!
          </Text>
        </View>

        {/* Navigation Arrows */}
        {videos.length > 1 && (
          <>
            <TouchableOpacity
              onPress={handlePrev}
              style={{
                position: "absolute",
                left: 8,
                top: "50%",
                marginTop: -16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <ChevronLeft color={colors.white} size={24} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={{
                position: "absolute",
                right: 8,
                top: "50%",
                marginTop: -16,
                padding: 8,
                borderRadius: 20,
                backgroundColor: "rgba(0,0,0,0.3)",
              }}
            >
              <ChevronRight color={colors.white} size={24} />
            </TouchableOpacity>
          </>
        )}

        {/* Dots */}
        {videos.length > 1 && (
          <View
            style={{
              position: "absolute",
              bottom: 16,
              right: 16,
              flexDirection: "row",
              gap: 6,
            }}
          >
            {videos.map((_, index) => (
              <View
                key={index}
                style={{
                  width: index === currentIndex ? 8 : 6,
                  height: index === currentIndex ? 8 : 6,
                  borderRadius: 4,
                  backgroundColor:
                    index === currentIndex
                      ? colors.white
                      : "rgba(255,255,255,0.5)",
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}
