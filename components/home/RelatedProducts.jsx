import { useCallback } from "react";
import { View, Text, FlatList } from "react-native";
import { useTheme } from "../../store/useTheme";
import ProductCard from "./ProductCard";

export default function RelatedProducts({ products, currentProductId }) {
  const { colors } = useTheme();

  const renderItem = useCallback(({ item }) => (
    <View style={{ marginRight: 16 }}>
      <ProductCard product={item} size="small" />
    </View>
  ), []);

  const keyExtractor = useCallback(
    (item, index) =>
      item.id?.toString() || item.product_id?.toString() || index.toString(),
    [],
  );

  // Filter out current product and limit to 8
  const related = products
    .filter((p) => (p.id || p.product_id) !== currentProductId)
    .slice(0, 8);

  if (related.length === 0) return null;

  return (
    <View style={{ marginTop: 24, paddingBottom: 16 }}>
      <View style={{ paddingHorizontal: 16, marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text }}>
          Related Products
        </Text>
        <View
          style={{
            width: 40,
            height: 4,
            backgroundColor: colors.primary,
            marginTop: 4,
            borderRadius: 2,
          }}
        />
      </View>

      <FlatList
        data={related}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16 }}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        removeClippedSubviews={true}
        maxToRenderPerBatch={5}
        initialNumToRender={5}
        windowSize={7}
      />
    </View>
  );
}
