import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Dimensions,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import { useTheme } from "../../store/useTheme";
import { useHome } from "../../store/useHome";

const { width } = Dimensions.get("window");
// Remove fixed constant, use dynamic height
const AUTO_SCROLL_INTERVAL = 4000;

export default function BannerCarousel() {
  const { colors } = useTheme();
  const { banners } = useHome();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerHeight, setBannerHeight] = useState(width * 0.56); // Default to 16:9
  const autoScrollRef = useRef(null);

  // Filter active banners
  const activeBanners = banners.filter((b) => b.image);

  // Fallback banners if no data
  const displayBanners =
    activeBanners.length > 0
      ? activeBanners
      : [
          {
            id: "1",
            title: "Welcome to Anand Mobiles",
            subtitle: "Best deals on smartphones",
            image:
              "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=400&fit=crop",
            cta_text: "Shop Now",
          },
        ];

  // Auto scroll
  useEffect(() => {
    if (displayBanners.length <= 1) return;

    autoScrollRef.current = setInterval(() => {
      const nextIndex = (currentIndex + 1) % displayBanners.length;
      flatListRef.current?.scrollToIndex({
        index: nextIndex,
        animated: true,
      });
      setCurrentIndex(nextIndex);
    }, AUTO_SCROLL_INTERVAL);

    return () => {
      if (autoScrollRef.current) {
        clearInterval(autoScrollRef.current);
      }
    };
  }, [currentIndex, displayBanners.length]);

  const onViewableItemsChanged = useCallback(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }, []);

  const viewabilityConfig = {
    itemVisiblePercentThreshold: 50,
  };

  const renderBannerItem = ({ item, index }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ width, height: bannerHeight, backgroundColor: "transparent" }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        transition={0}
        cachePolicy="memory-disk"
        onLoad={(e) => {
          // Adjust height based on the first banner's aspect ratio
          if (index === 0) {
            const { width: imgW, height: imgH } = e.source;
            if (imgW && imgH) {
              const newHeight = (width * imgH) / imgW;
              setBannerHeight(newHeight);
            }
          }
        }}
      />
    </TouchableOpacity>
  );

  return (
    <View
      style={{
        height: bannerHeight,
        backgroundColor: "transparent",
        marginTop: 0,
        marginBottom: 0,
      }}
    >
      <FlatList
        ref={flatListRef}
        data={displayBanners}
        renderItem={renderBannerItem}
        keyExtractor={(item, index) => item.id || index.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(data, index) => ({
          length: width,
          offset: width * index,
          index,
        })}
        style={{ backgroundColor: "transparent" }}
        initialNumToRender={displayBanners.length}
        maxToRenderPerBatch={displayBanners.length}
        windowSize={displayBanners.length + 1}
      />
    </View>
  );
}
