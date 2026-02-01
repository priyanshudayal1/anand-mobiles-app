import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Dimensions,
} from "react-native";
import { Image } from "expo-image";
import { PlayCircle } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";

const { width } = Dimensions.get("window");
const VIDEO_WIDTH = width * 0.7;

export default function VideoCarousel({ showHeader = true }) {
  const { colors } = useTheme();
  const { promotionVideos } = useHome();

  if (!promotionVideos || promotionVideos.length === 0) {
    return null;
  }

  const handleVideoPress = (videoUrl) => {
    if (videoUrl) {
      Linking.openURL(videoUrl).catch((err) =>
        console.error("Failed to open video:", err),
      );
    }
  };

  const renderVideoItem = (video, index) => {
    // Determine thumbnail: use provided thumbnail or try to extract from YouTube/etc if logic existed (kept simple here)
    const thumbnail =
      video.thumbnail || "https://via.placeholder.com/400x225?text=Video";

    return (
      <TouchableOpacity
        key={video.id || index}
        onPress={() => handleVideoPress(video.video_url || video.link)}
        style={{
          width: VIDEO_WIDTH,
          marginRight: 16,
          borderRadius: 12,
          overflow: "hidden",
          backgroundColor: colors.cardBg,
          elevation: 2,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        }}
        activeOpacity={0.9}
      >
        <View
          style={{
            height: VIDEO_WIDTH * 0.56,
            width: "100%",
            position: "relative",
          }}
        >
          <Image
            source={{ uri: thumbnail }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
            transition={300}
          />
          {/* Play Overlay */}
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.3)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PlayCircle size={48} color="#FFF" fill="rgba(0,0,0,0.5)" />
          </View>
        </View>

        {video.title && (
          <View style={{ padding: 12 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: "600",
                color: colors.text,
              }}
              numberOfLines={2}
            >
              {video.title}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        marginTop: 8,
        paddingVertical: 16,
        backgroundColor: colors.backgroundSecondary,
      }}
    >
      {showHeader && (
        <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      >
        {promotionVideos.map(renderVideoItem)}
      </ScrollView>
    </View>
  );
}
