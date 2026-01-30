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
const BANNER_HEIGHT = width * 0.56; // 16:9 Aspect Ratio roughly
const AUTO_SCROLL_INTERVAL = 4000;

export default function BannerCarousel() {
  const { colors } = useTheme();
  const { banners } = useHome();
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  const renderBannerItem = ({ item }) => (
    <TouchableOpacity
      activeOpacity={0.9}
      style={{ width, height: BANNER_HEIGHT }}
    >
      <Image
        source={{ uri: item.image }}
        style={{ width: "100%", height: "100%" }}
        contentFit="contain"
        transition={300}
      />
    </TouchableOpacity>
  );

  return (
    <View style={{ height: BANNER_HEIGHT, backgroundColor: 'transparent' }}>
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
      />


    </View>
  );
}
