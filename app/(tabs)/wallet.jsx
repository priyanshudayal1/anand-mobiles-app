import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Wallet, CreditCard, History, Plus, ArrowUpRight, ArrowDownLeft } from "lucide-react-native";
import { useTheme } from "../../store/useTheme";

export default function WalletScreen() {
  const { colors } = useTheme();

  // Mock wallet data
  const walletBalance = 2450.50;
  const transactions = [
    { id: 1, type: "credit", amount: 500, description: "Added to wallet", date: "Today, 10:30 AM" },
    { id: 2, type: "debit", amount: 150, description: "Purchase - iPhone Case", date: "Yesterday, 3:45 PM" },
    { id: 3, type: "credit", amount: 200, description: "Cashback", date: "Jan 25, 2026" },
    { id: 4, type: "debit", amount: 320, description: "Purchase - Wireless Earbuds", date: "Jan 24, 2026" },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Wallet</Text>
        </View>

        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: colors.primary || "#FF8C00" }]}>
          <View style={styles.balanceHeader}>
            <Wallet size={28} color="#FFF" />
            <Text style={styles.balanceLabel}>Total Balance</Text>
          </View>
          <Text style={styles.balanceAmount}>₹{walletBalance.toFixed(2)}</Text>
          
          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Plus size={20} color="#FFF" />
              </View>
              <Text style={styles.actionButtonText}>Add Money</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.actionButton}>
              <View style={[styles.actionIconContainer, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <CreditCard size={20} color="#FFF" />
              </View>
              <Text style={styles.actionButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <History size={20} color={colors.text} />
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
          </View>

          {transactions.map((transaction) => (
            <View
              key={transaction.id}
              style={[styles.transactionItem, { backgroundColor: colors.surface || "#F5F5F5", borderColor: colors.border || "#E5E5E5" }]}
            >
              <View style={[
                styles.transactionIcon,
                { backgroundColor: transaction.type === "credit" ? "#E8F5E9" : "#FFEBEE" }
              ]}>
                {transaction.type === "credit" ? (
                  <ArrowDownLeft size={18} color="#4CAF50" />
                ) : (
                  <ArrowUpRight size={18} color="#F44336" />
                )}
              </View>
              
              <View style={styles.transactionDetails}>
                <Text style={[styles.transactionDescription, { color: colors.text }]}>
                  {transaction.description}
                </Text>
                <Text style={[styles.transactionDate, { color: colors.textSecondary || "#666" }]}>
                  {transaction.date}
                </Text>
              </View>
              
              <Text
                style={[
                  styles.transactionAmount,
                  { color: transaction.type === "credit" ? "#4CAF50" : "#F44336" }
                ]}
              >
                {transaction.type === "credit" ? "+" : "-"}₹{transaction.amount}
              </Text>
            </View>
          ))}
        </View>

        {/* Empty State for No Transactions */}
        {transactions.length === 0 && (
          <View style={styles.emptyState}>
            <Wallet size={48} color={colors.textSecondary || "#999"} />
            <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>
              No transactions yet
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
  },
  balanceCard: {
    margin: 20,
    marginTop: 10,
    padding: 24,
    borderRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#FFF",
    opacity: 0.9,
    marginLeft: 8,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 20,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    padding: 20,
    paddingTop: 0,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 15,
    fontWeight: "500",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    marginTop: 16,
  },
});
