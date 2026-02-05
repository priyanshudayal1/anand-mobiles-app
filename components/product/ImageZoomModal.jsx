import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Pressable,
  StyleSheet,
} from "react-native";
import { Image } from "expo-image";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useToast } from "../../store/useToast";
import * as WebBrowser from "expo-web-browser";

const { width, height } = Dimensions.get("window");

const ImageZoomModal = ({ visible, onClose, media = [], initialIndex = 0 }) => {
  const { colors } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollViewRef = useRef(null);
  const { error } = useToast();

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

  // Open video in browser
  const openVideo = async (url) => {
    try {
      await WebBrowser.openBrowserAsync(url);
    } catch (_error) {
      error("Unable to open video");
    }
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

  const handleNext = () => {
    const nextIndex = currentIndex === media.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(nextIndex);
    scrollViewRef.current?.scrollTo({
      x: nextIndex * width,
      animated: true,
    });
  };

  const handlePrev = () => {
    const prevIndex = currentIndex === 0 ? media.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    scrollViewRef.current?.scrollTo({
      x: prevIndex * width,
      animated: true,
    });
  };

  const handleScroll = (event) => {
    const slideIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setCurrentIndex(slideIndex);
  };

  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: initialIndex * width,
          animated: false,
        });
      }, 100);
    }
  }, [visible, initialIndex]);

  if (!visible || !media || media.length === 0) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={true}
    >
      <View style={styles.modalContainer}>
        {/* Backdrop */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Close Button */}
        <TouchableOpacity
          onPress={onClose}
          style={[styles.closeButton, { backgroundColor: colors.black + "80" }]}
        >
          <X size={24} color={colors.white} />
        </TouchableOpacity>

        {/* Navigation Buttons */}
        {media.length > 1 && (
          <>
            <TouchableOpacity
              onPress={handlePrev}
              style={[
                styles.navButton,
                styles.prevButton,
                { backgroundColor: colors.black + "80" },
              ]}
            >
              <ChevronLeft size={28} color={colors.white} />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.navButton,
                styles.nextButton,
                { backgroundColor: colors.black + "80" },
              ]}
            >
              <ChevronRight size={28} color={colors.white} />
            </TouchableOpacity>
          </>
        )}

        {/* Media Content */}
        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {media.map((item, index) => {
            const isVideoItem = isVideo(item);
            return (
              <View key={index} style={styles.mediaContainer}>
                {isVideoItem ? (
                  <TouchableOpacity
                    onPress={() => openVideo(item)}
                    style={styles.videoContainer}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{ uri: getYouTubeThumbnail(item) }}
                      style={styles.image}
                      contentFit="contain"
                    />
                    <View style={styles.playOverlay}>
                      <View
                        style={[
                          styles.playButton,
                          { backgroundColor: colors.error },
                        ]}
                      >
                        <Play
                          size={40}
                          color={colors.white}
                          fill={colors.white}
                        />
                      </View>
                      <Text style={[styles.playText, { color: colors.white }]}>
                        Tap to watch video
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  <Image
                    source={{ uri: item }}
                    style={styles.image}
                    contentFit="contain"
                    transition={200}
                  />
                )}
              </View>
            );
          })}
        </ScrollView>

        {/* Media Counter */}
        <View
          style={[styles.counter, { backgroundColor: colors.black + "80" }]}
        >
          <Text style={[styles.counterText, { color: colors.white }]}>
            {currentIndex + 1} / {media.length}
          </Text>
        </View>

        {/* Thumbnail Navigation */}
        {media.length > 1 && (
          <View
            style={[
              styles.thumbnailContainer,
              { backgroundColor: colors.black + "80" },
            ]}
          >
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailScroll}
            >
              {media.map((item, index) => {
                const isVideoThumb = isVideo(item);
                const thumbnailUri = isVideoThumb
                  ? getYouTubeThumbnail(item)
                  : item;

                return (
                  <TouchableOpacity
                    key={index}
                    onPress={() => {
                      setCurrentIndex(index);
                      scrollViewRef.current?.scrollTo({
                        x: index * width,
                        animated: true,
                      });
                    }}
                    style={[
                      styles.thumbnail,
                      {
                        borderColor:
                          index === currentIndex
                            ? colors.primary
                            : "transparent",
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: thumbnailUri }}
                      style={styles.thumbnailImage}
                      contentFit="cover"
                    />
                    {isVideoThumb && (
                      <View style={styles.thumbnailPlayOverlay}>
                        <Play
                          size={14}
                          color={colors.white}
                          fill={colors.white}
                        />
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 100,
    padding: 12,
    borderRadius: 24,
  },
  navButton: {
    position: "absolute",
    top: "50%",
    zIndex: 100,
    padding: 12,
    borderRadius: 24,
  },
  prevButton: {
    left: 20,
  },
  nextButton: {
    right: 20,
  },
  scrollView: {
    flex: 1,
  },
  mediaContainer: {
    width: width,
    height: height,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: width - 40,
    height: height - 200,
  },
  videoContainer: {
    width: width - 40,
    height: height - 200,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  playText: {
    fontSize: 16,
    fontWeight: "600",
  },
  counter: {
    position: "absolute",
    bottom: 140,
    left: "50%",
    marginLeft: -40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  counterText: {
    fontSize: 14,
    fontWeight: "600",
  },
  thumbnailContainer: {
    position: "absolute",
    bottom: 40,
    left: "50%",
    marginLeft: -width / 2 + 20,
    width: width - 40,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  thumbnailScroll: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    overflow: "hidden",
    position: "relative",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  thumbnailPlayOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ImageZoomModal;
