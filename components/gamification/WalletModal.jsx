import React from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  Coins,
  TrendingUp,
  ArrowDown,
  ArrowUp,
  Gift,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useGamification } from "../../store/useGamification";

const { height } = Dimensions.get("window");

export default function WalletModal({ visible, onClose }) {
  const { colors } = useTheme();
  const { wallet, gamificationStatus } = useGamification();

  const getTransactionIcon = (type, action) => {
    if (type === "earned") {
      switch (action) {
        case "signup":
          return <User size={20} color="#3B82F6" />;
        case "add_wishlist":
          return <Heart size={20} color="#EF4444" />;
        case "first_purchase":
          return <ShoppingCart size={20} color="#10B981" />;
        case "spin_wheel":
          return <Gift size={20} color="#8B5CF6" />;
        default:
          return <Coins size={20} color="#F59E0B" />;
      }
    }
    return <ArrowDown size={20} color="#EF4444" />;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    // Convert to IST (UTC + 5:30)
    const istDate = new Date(date.getTime() + 5.5 * 60 * 60 * 1000);
    return istDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={[styles.content, { backgroundColor: colors.background }]}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleContainer}>
              <Coins size={24} color={colors.primary} />
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>
                  My Wallet
                </Text>
                <Text
                  style={[
                    styles.headerSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Transaction History
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Balance Overview */}
            <View style={styles.statsRow}>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#F0FDF4", borderColor: "#BBF7D0" },
                ]}
              >
                <Text style={[styles.statLabel, { color: "#166534" }]}>
                  Current Balance
                </Text>
                <Text style={[styles.statValue, { color: "#166534" }]}>
                  {wallet?.balance || 0}
                </Text>
                <Coins
                  size={16}
                  color="#166534"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    opacity: 0.5,
                  }}
                />
              </View>
              <View
                style={[
                  styles.statBox,
                  { backgroundColor: "#EFF6FF", borderColor: "#BFDBFE" },
                ]}
              >
                <Text style={[styles.statLabel, { color: "#1E40AF" }]}>
                  Total Earned
                </Text>
                <Text style={[styles.statValue, { color: "#1E40AF" }]}>
                  {wallet?.total_earned || 0}
                </Text>
                <ArrowUp
                  size={16}
                  color="#1E40AF"
                  style={{
                    position: "absolute",
                    bottom: 10,
                    right: 10,
                    opacity: 0.5,
                  }}
                />
              </View>
            </View>

            {/* Transactions List */}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Recent Transactions
            </Text>

            {wallet?.recent_transactions?.length > 0 ? (
              <View style={styles.transactionsList}>
                {wallet.recent_transactions.map((transaction, index) => (
                  <View
                    key={transaction.id || index}
                    style={[
                      styles.transactionItem,
                      {
                        backgroundColor: colors.surface || "#FFF",
                        borderColor: colors.border || "#E5E7EB",
                      },
                    ]}
                  >
                    <View style={styles.transactionLeft}>
                      <View
                        style={[
                          styles.iconContainer,
                          { backgroundColor: colors.background },
                        ]}
                      >
                        {getTransactionIcon(
                          transaction.type,
                          transaction.action,
                        )}
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text
                          style={[
                            styles.transactionParams,
                            { color: colors.text },
                          ]}
                        >
                          {transaction.description || "Transaction"}
                        </Text>
                        <Text
                          style={[
                            styles.transactionDate,
                            { color: colors.textSecondary },
                          ]}
                        >
                          {formatDate(transaction.created_at)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={[
                          styles.transactionAmount,
                          {
                            color:
                              transaction.type === "earned"
                                ? "#10B981"
                                : "#EF4444",
                          },
                        ]}
                      >
                        {transaction.type === "earned" ? "+" : "-"}
                        {transaction.amount}
                      </Text>
                      <Text
                        style={[
                          styles.coinLabel,
                          { color: colors.textSecondary },
                        ]}
                      >
                        coins
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Coins
                  size={48}
                  color={colors.textSecondary}
                  style={{ opacity: 0.3 }}
                />
                <Text
                  style={[styles.emptyText, { color: colors.textSecondary }]}
                >
                  No transactions yet
                </Text>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  content: {
    height: height * 0.8,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.05)",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  transactionsList: {
    gap: 12,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  transactionInfo: {
    flex: 1,
  },
  transactionParams: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 11,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  coinLabel: {
    fontSize: 10,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    gap: 12,
  },
  emptyText: {
    fontSize: 14,
  },
});
