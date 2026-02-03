import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { useTheme } from "../../store/useTheme";
import { Lock, ShoppingCart, Heart } from "lucide-react-native";
import EMIOffers from "../home/EMIOffers";

const ProductActions = ({
  onAddToCart,
  onBuyNow,
  onAddToWishlist,
  isAddingToCart,
  isBuyingNow,
  isAddingToWishlist,
  inStock,
  isInWishlist,
  price,
  quantity = 1,
  productName,
}) => {
  const { colors } = useTheme();

  // Calculate delivery based on subtotal
  const subtotal = (price || 0) * quantity;
  const shipping = subtotal > 50000 ? 0 : 99;
  const totalPrice = subtotal + shipping;

  if (!inStock) {
    return (
      <View style={{ padding: 16, backgroundColor: colors.white }}>
        <View
          style={{
            backgroundColor: colors.error + "10",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: colors.error + "30",
          }}
        >
          <Text
            style={{
              color: colors.error,
              fontSize: 18,
              fontWeight: "bold",
              marginBottom: 4,
            }}
          >
            Currently Unavailable
          </Text>
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            We don&apos;t know when or if this item will be back in stock.
          </Text>
        </View>

        {/* Still show Add to Wishlist for out of stock items */}
        <TouchableOpacity
          onPress={onAddToWishlist}
          disabled={isAddingToWishlist}
          style={{
            paddingVertical: 14,
            borderRadius: 25,
            alignItems: "center",
            marginTop: 16,
            borderWidth: 1,
            borderColor: colors.primary,
            flexDirection: "row",
            justifyContent: "center",
          }}
        >
          {isAddingToWishlist ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <>
              <Heart
                size={18}
                color={isInWishlist ? colors.error : colors.primary}
                fill={isInWishlist ? colors.error : "transparent"}
              />
              <Text
                style={{
                  color: colors.primary,
                  fontSize: 15,
                  fontWeight: "500",
                  marginLeft: 8,
                }}
              >
                {isInWishlist ? "In Wishlist" : "Add to Wishlist"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={{
        paddingHorizontal: 16,
        marginBottom: 16,
        backgroundColor: colors.white,
      }}
    >
      {/* EMI Offers */}
      <View style={{ marginBottom: 16 }}>
        <EMIOffers price={price} />
      </View>

      {/* Price Summary Card */}
      <View
        style={{
          backgroundColor: colors.backgroundSecondary,
          padding: 14,
          borderRadius: 12,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            {quantity > 1 ? `Price (${quantity} items):` : "Price:"}
          </Text>
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: "500" }}>
            ₹{subtotal.toLocaleString()}
          </Text>
        </View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text style={{ color: colors.textSecondary, fontSize: 14 }}>
            Delivery:
          </Text>
          <Text
            style={{
              color: shipping === 0 ? colors.success : colors.text,
              fontSize: 14,
              fontWeight: "500",
            }}
          >
            {shipping > 0 ? `₹${shipping}` : "FREE"}
          </Text>
        </View>
        <View
          style={{
            height: 1,
            backgroundColor: colors.border,
            marginVertical: 8,
          }}
        />
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text
            style={{ color: colors.text, fontSize: 16, fontWeight: "bold" }}
          >
            Total:
          </Text>
          <Text
            style={{ color: colors.primary, fontSize: 16, fontWeight: "bold" }}
          >
            ₹{totalPrice.toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Add to Cart Button */}
      <TouchableOpacity
        onPress={onAddToCart}
        disabled={isAddingToCart}
        style={{
          backgroundColor: colors.warning,
          paddingVertical: 14,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 12,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {isAddingToCart ? (
          <ActivityIndicator color={colors.text} />
        ) : (
          <>
            <ShoppingCart size={18} color={colors.text} />
            <Text
              style={{
                color: colors.text,
                fontSize: 15,
                fontWeight: "600",
                marginLeft: 8,
              }}
            >
              Add to Cart
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Buy Now Button */}
      <TouchableOpacity
        onPress={onBuyNow}
        disabled={isBuyingNow}
        style={{
          backgroundColor: colors.primary,
          paddingVertical: 14,
          borderRadius: 25,
          alignItems: "center",
          marginBottom: 12,
          flexDirection: "row",
          justifyContent: "center",
        }}
      >
        {isBuyingNow ? (
          <ActivityIndicator color={colors.white} />
        ) : (
          <Text
            style={{ color: colors.white, fontSize: 15, fontWeight: "600" }}
          >
            Buy Now
          </Text>
        )}
      </TouchableOpacity>

      {/* Add to Wishlist Button */}
      <TouchableOpacity
        onPress={onAddToWishlist}
        disabled={isAddingToWishlist}
        style={{
          paddingVertical: 12,
          borderRadius: 25,
          alignItems: "center",
          borderWidth: 1,
          borderColor: isInWishlist ? colors.error : colors.primary,
          flexDirection: "row",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        {isAddingToWishlist ? (
          <ActivityIndicator color={colors.primary} size="small" />
        ) : (
          <>
            <Heart
              size={18}
              color={isInWishlist ? colors.error : colors.primary}
              fill={isInWishlist ? colors.error : "transparent"}
            />
            <Text
              style={{
                color: isInWishlist ? colors.error : colors.primary,
                fontSize: 14,
                fontWeight: "500",
                marginLeft: 8,
              }}
            >
              {isInWishlist ? "Added to Wishlist" : "Add to Wishlist"}
            </Text>
          </>
        )}
      </TouchableOpacity>

      {/* Security / Trust indicators */}
      <View
        style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}
      >
        <Lock size={14} color={colors.success} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.success, fontSize: 13 }}>
          Secure transaction
        </Text>
      </View>
    </View>
  );
};

export default ProductActions;
