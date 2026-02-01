import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../store/useTheme";
import { Play, Heart, ZoomIn } from "lucide-react-native";
import ImageZoomModal from "./ImageZoomModal";

const { width } = Dimensions.get("window");

const ProductImageGallery = ({
  images = [],
  videos = [],
  activeIndex = 0,
  onScroll,
  discountPercentage = 0,
  onWishlistPress,
  isInWishlist = false,
}) => {
  const { colors } = useTheme();
  const [zoomModalVisible, setZoomModalVisible] = useState(false);
  // Combine images and videos
  const allMedia = [...images, ...videos];

  // Ensure we have at least one item to show
  const displayMedia = allMedia.length > 0 ? allMedia : [null];

  // Check if media is a video URL
  const isVideo = (url) => {
    if (!url) return false;
    return (
      url.includes("youtube.com") ||
      url.includes("youtu.be") ||
      url.includes("vimeo.com") ||
      url.includes(".mp4")
    );
  };

  // Get YouTube thumbnail
  const getYouTubeThumbnail = (url) => {
    let videoId = "";
    if (url.includes("youtube.com/watch?v=")) {
      videoId = url.split("v=")[1].split("&")[0];
    } else if (url.includes("youtu.be/")) {
      videoId = url.split("youtu.be/")[1].split("?")[0];
    }
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  return (
    <View style={{ backgroundColor: colors.white }}>
      {/* Main Image/Video Carousel */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        decelerationRate="fast"
      >
        {displayMedia.map((media, index) => {
          const isVideoMedia = isVideo(media);
          const imageUri =
            typeof media === "string"
              ? isVideoMedia
                ? getYouTubeThumbnail(media)
                : media
              : media?.image || media?.url;

          return (
            <View
              key={index}
              style={{
                width,
                height: 400,
                justifyContent: "center",
                alignItems: "center",
                padding: 20,
                position: "relative",
              }}
            >
              {imageUri ? (
                <Image
                  source={{ uri: imageUri }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="contain"
                  transition={200}
                />
              ) : (
                <View
                  style={{ alignItems: "center", justifyContent: "center" }}
                >
                  <Text style={{ color: colors.textSecondary }}>
                    No Image Available
                  </Text>
                </View>
              )}

              {/* Video Play Button Overlay */}
              {isVideoMedia && (
                <View
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <View
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: 30,
                      backgroundColor: colors.error,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Play size={28} color={colors.white} fill={colors.white} />
                  </View>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Discount Badge - Top Left */}
      {discountPercentage > 0 && (
        <View
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            backgroundColor: colors.error,
            paddingHorizontal: 10,
            paddingVertical: 5,
            borderRadius: 4,
            zIndex: 10,
          }}
        >
          <Text
            style={{ color: colors.white, fontSize: 13, fontWeight: "bold" }}
          >
            {discountPercentage}% OFF
          </Text>
        </View>
      )}

      {/* Wishlist Heart - Top Right */}
      {onWishlistPress && (
        <TouchableOpacity
          onPress={onWishlistPress}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.white,
            alignItems: "center",
            justifyContent: "center",
            elevation: 3,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.15,
            shadowRadius: 4,
            zIndex: 10,
          }}
        >
          <Heart
            size={22}
            color={isInWishlist ? colors.error : colors.textSecondary}
            fill={isInWishlist ? colors.error : "transparent"}
          />
        </TouchableOpacity>
      )}

      {/* Zoom indicator - Bottom Right */}
      <TouchableOpacity
        onPress={() => setZoomModalVisible(true)}
        style={{
          position: "absolute",
          bottom: 60,
          right: 16,
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: colors.white + "CC",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 10,
          elevation: 3,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        }}
        activeOpacity={0.7}
      >
        <ZoomIn size={18} color={colors.textSecondary} />
      </TouchableOpacity>

      {/* Pagination Dots */}
      {displayMedia.length > 1 && (
        <View
          style={{
            flexDirection: "row",
            width: "100%",
            justifyContent: "center",
            paddingBottom: 16,
            position: "absolute",
            bottom: 0,
          }}
        >
          {displayMedia.map((media, i) => {
            const isVideoMedia = isVideo(media);

            return (
              <View
                key={i}
                style={{
                  width: i === activeIndex ? 20 : 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 3,
                  backgroundColor:
                    i === activeIndex
                      ? isVideoMedia
                        ? colors.error
                        : colors.primary
                      : colors.border,
                }}
              />
            );
          })}
        </View>
      )}

      {/* Image count indicator */}
      {displayMedia.length > 1 && (
        <View
          style={{
            position: "absolute",
            bottom: 50,
            left: 16,
            backgroundColor: colors.black + "80",
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: colors.white, fontSize: 12 }}>
            {activeIndex + 1}/{displayMedia.length}
          </Text>
        </View>
      )}

      {/* Thumbnail Strip */}
      {displayMedia.length > 1 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 12,
            paddingVertical: 12,
          }}
          style={{
            backgroundColor: colors.backgroundSecondary,
          }}
        >
          {displayMedia.map((media, i) => {
            const isActive = i === activeIndex;
            const isVideoMedia = isVideo(media);
            const thumbnailUri =
              typeof media === "string"
                ? isVideoMedia
                  ? getYouTubeThumbnail(media)
                  : media
                : media?.image || media?.url;

            return (
              <View
                key={i}
                style={{
                  width: 50,
                  height: 50,
                  marginHorizontal: 4,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: isActive ? colors.primary : "transparent",
                  overflow: "hidden",
                }}
              >
                {thumbnailUri ? (
                  <Image
                    source={{ uri: thumbnailUri }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                ) : (
                  <View
                    style={{
                      width: "100%",
                      height: "100%",
                      backgroundColor: colors.border,
                    }}
                  />
                )}

                {/* Video indicator on thumbnail */}
                {isVideoMedia && (
                  <View
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      alignItems: "center",
                      justifyContent: "center",
                      backgroundColor: colors.black + "40",
                    }}
                  >
                    <Play size={16} color={colors.white} fill={colors.white} />

                    {/* Image Zoom Modal */}
                    <ImageZoomModal
                      visible={zoomModalVisible}
                      onClose={() => setZoomModalVisible(false)}
                      media={displayMedia.filter((m) => m !== null)}
                      initialIndex={activeIndex}
                    />
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

export default ProductImageGallery;
