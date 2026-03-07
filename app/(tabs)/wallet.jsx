import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Share,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import {
  Wallet,
  TrendingUp,
  Trophy,
  Users,
  Gift,
  Star,
  Calendar,
  Share2,
  Copy,
  Coins,
} from "lucide-react-native";
import { useTheme } from "../../store/useTheme";
import { useGamification } from "../../store/useGamification";
import { useAuthStore } from "../../store/useAuth";
import SpinWheel from "../../components/gamification/SpinWheel";
import WalletModal from "../../components/gamification/WalletModal";
import { WalletShimmer } from "../../components/common/ShimmerPlaceholder";
import {
  ScaleInView,
  SlideInView,
  FadeInView,
} from "../../components/common/AnimationWrappers";

export default function WalletScreen() {
  const { colors, isDarkMode } = useTheme();
  const insets = useSafeAreaInsets();
  const { isAuthenticated, user } = useAuthStore();
  const {
    coinBalance,
    gamificationStatus,
    gamificationConfig,
    achievements,
    leaderboard,
    referralData,
    isLoading,
    loadAllData,
    getLevelInfo,
  } = useGamification();

  const [activeTab, setActiveTab] = useState("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [showSpinWheel, setShowSpinWheel] = useState(false);
  const [showWalletModal, setShowWalletModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadAllData();
    }
  }, [isAuthenticated, user, loadAllData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
  }, [loadAllData]);

  const tabs = [
    { id: "overview", label: "Overview", icon: TrendingUp },
    { id: "achievements", label: "Achievements", icon: Trophy },
    { id: "leaderboard", label: "Leaderboard", icon: Users },
    { id: "rewards", label: "Rewards", icon: Gift },
  ];

  const levelInfo = getLevelInfo(gamificationStatus?.level || "Bronze");

  const handleShare = async () => {
    if (!referralData?.referral_code) {
      Alert.alert(
        "Error",
        "Referral code not available. Please try again later.",
      );
      return;
    }

    const message = `🎁 Join me on Anand Mobiles and get exclusive rewards! Use my referral code: ${referralData.referral_code}\n\n💰 You'll get bonus coins when you join!`;

    try {
      await Share.share({
        message,
      });
    } catch (error) {
      console.error("Share error:", error);
    }
  };

  const copyReferralCode = async () => {
    if (referralData?.referral_code) {
      await Clipboard.setStringAsync(referralData.referral_code);
      Alert.alert("Copied!", "Referral code copied to clipboard.");
    }
  };

  // Not authenticated state
  if (!isAuthenticated || !user) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <View style={styles.emptyState}>
          <Wallet size={64} color={colors.textSecondary} />
          <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
            Login Required
          </Text>
          <Text
            style={[styles.emptyStateText, { color: colors.textSecondary }]}
          >
            Please login to access gamification features
          </Text>
        </View>
      </View>
    );
  }

  // Loading state - only show on initial load when there's no data yet
  if (isLoading && !refreshing && !gamificationStatus) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, paddingTop: insets.top },
        ]}
      >
        <WalletShimmer />
      </View>
    );
  }

  // Calculate progress
  const progressPercentage = Math.min(
    ((coinBalance - (levelInfo.threshold - 500)) / 500) * 100,
    100,
  );

  const renderOverviewTab = () => (
    <View style={styles.tabContent}>
      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <ScaleInView
          delay={0}
          style={[styles.statCard, { backgroundColor: colors.surface }]}
        >
          <Coins size={28} color={colors.warning} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {coinBalance.toLocaleString()}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Total Coins
          </Text>
        </ScaleInView>

        <ScaleInView
          delay={100}
          style={[styles.statCard, { backgroundColor: colors.surface }]}
        >
          <Star size={28} color={levelInfo.color} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {gamificationStatus?.level || "Bronze"}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Current Level
          </Text>
        </ScaleInView>

        <ScaleInView
          delay={200}
          style={[styles.statCard, { backgroundColor: colors.surface }]}
        >
          <Calendar size={28} color={colors.success} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {gamificationStatus?.login_streak || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Day Streak
          </Text>
        </ScaleInView>

        <ScaleInView
          delay={300}
          style={[styles.statCard, { backgroundColor: colors.surface }]}
        >
          <Trophy size={28} color={colors.primary} />
          <Text style={[styles.statValue, { color: colors.text }]}>
            {achievements?.length || 0}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
            Achievements
          </Text>
        </ScaleInView>
      </View>

      {/* Level Progress */}
      <SlideInView delay={350}>
        <View
          style={[styles.progressCard, { backgroundColor: colors.surface }]}
        >
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: colors.text }]}>
              Level Progress
            </Text>
            <Text
              style={[styles.progressText, { color: colors.textSecondary }]}
            >
              {coinBalance} / {levelInfo.threshold} coins
            </Text>
          </View>

          <View
            style={[styles.progressBarBg, { backgroundColor: colors.border }]}
          >
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.max(0, Math.min(100, progressPercentage))}%`,
                  backgroundColor: levelInfo.color,
                },
              ]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              Current: {gamificationStatus?.level || "Bronze"}
            </Text>
            <Text
              style={[styles.progressLabel, { color: colors.textSecondary }]}
            >
              Next: {levelInfo.nextLevel}
            </Text>
          </View>
        </View>
      </SlideInView>

      {/* Quick Actions */}
      <SlideInView delay={450}>
        <View style={[styles.actionsCard, { backgroundColor: colors.surface }]}>
          <Text style={[styles.actionsTitle, { color: colors.text }]}>
            Quick Actions
          </Text>

          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                {
                  backgroundColor: colors.primary,
                  opacity: gamificationStatus?.daily_spin_available ? 1 : 0.7,
                },
              ]}
              disabled={!gamificationStatus?.daily_spin_available}
              onPress={() => setShowSpinWheel(true)}
            >
              <Gift size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                {gamificationStatus?.daily_spin_available
                  ? "Daily Spin!"
                  : "Come Back Tomorrow"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={() => setShowWalletModal(true)}
            >
              <Coins size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                View Wallet
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
            >
              <Share2 size={20} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Refer Friends
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SlideInView>
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Your Achievements
      </Text>

      {achievements && achievements.length > 0 ? (
        <View style={styles.achievementsGrid}>
          {achievements.map((achievement, index) => (
            <View
              key={index}
              style={[
                styles.achievementCard,
                { backgroundColor: colors.surface },
              ]}
            >
              <Text style={styles.achievementIcon}>
                {achievement.icon || "🏆"}
              </Text>
              <Text style={[styles.achievementTitle, { color: colors.text }]}>
                {achievement.title}
              </Text>
              <Text
                style={[
                  styles.achievementDesc,
                  { color: colors.textSecondary },
                ]}
              >
                {achievement.description}
              </Text>
              <View
                style={[
                  styles.achievementReward,
                  { backgroundColor: colors.success },
                ]}
              >
                <Text
                  style={[
                    styles.achievementRewardText,
                    { color: colors.white },
                  ]}
                >
                  +{achievement.reward_coins || 0} coins
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Trophy size={48} color={colors.textSecondary} />
          <Text
            style={[styles.emptyStateText, { color: colors.textSecondary }]}
          >
            No achievements yet. Start shopping to unlock rewards!
          </Text>
        </View>
      )}
    </View>
  );

  const renderLeaderboardTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Community Leaderboard
      </Text>

      {leaderboard && leaderboard.length > 0 ? (
        <View
          style={[
            styles.leaderboardContainer,
            { backgroundColor: colors.surface },
          ]}
        >
          {leaderboard.map((user, index) => (
            <View
              key={index}
              style={[
                styles.leaderboardItem,
                index !== leaderboard.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <View style={styles.leaderboardLeft}>
                <View
                  style={[
                    styles.rankBadge,
                    {
                      backgroundColor:
                        index < 3 ? colors.warning : colors.background,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.rankText,
                      { color: index < 3 ? colors.white : colors.text },
                    ]}
                  >
                    {index + 1}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text
                    style={[styles.leaderboardName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {user.name}
                  </Text>
                  <Text
                    style={[
                      styles.leaderboardLevel,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Level {user.level}
                  </Text>
                </View>
              </View>
              <View style={styles.leaderboardRight}>
                <Text style={[styles.leaderboardCoins, { color: colors.text }]}>
                  {user.coins?.toLocaleString()} coins
                </Text>
                <Text
                  style={[
                    styles.leaderboardPoints,
                    { color: colors.textSecondary },
                  ]}
                >
                  {user.points} points
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <Users size={48} color={colors.textSecondary} />
          <Text
            style={[styles.emptyStateText, { color: colors.textSecondary }]}
          >
            Leaderboard will update soon!
          </Text>
        </View>
      )}
    </View>
  );

  const renderRewardsTab = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Rewards & Referrals
      </Text>

      {/* Referral Section */}
      <View style={[styles.rewardCard, { backgroundColor: colors.surface }]}>
        <View style={styles.rewardHeader}>
          <Users size={24} color={colors.primary} />
          <Text style={[styles.rewardTitle, { color: colors.text }]}>
            Refer & Earn
          </Text>
        </View>

        {referralData ? (
          <View style={styles.referralContent}>
            <View
              style={[
                styles.referralCodeBox,
                { backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[
                  styles.referralCodeLabel,
                  { color: colors.textSecondary },
                ]}
              >
                Your Referral Code:
              </Text>
              <View style={styles.referralCodeRow}>
                <View
                  style={[
                    styles.referralCodeBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[styles.referralCodeText, { color: colors.white }]}
                  >
                    {referralData.referral_code}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.copyButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={copyReferralCode}
                >
                  <Copy size={16} color={colors.white} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.referralStats}>
              <View style={styles.referralStatItem}>
                <Text
                  style={[styles.referralStatValue, { color: colors.primary }]}
                >
                  {referralData.total_referrals || 0}
                </Text>
                <Text
                  style={[
                    styles.referralStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Referrals
                </Text>
              </View>
              <View style={styles.referralStatItem}>
                <Text
                  style={[styles.referralStatValue, { color: colors.primary }]}
                >
                  {referralData.total_earned || 0}
                </Text>
                <Text
                  style={[
                    styles.referralStatLabel,
                    { color: colors.textSecondary },
                  ]}
                >
                  Coins Earned
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.referralInfo,
                { backgroundColor: colors.background },
              ]}
            >
              <Text
                style={[
                  styles.referralInfoText,
                  { color: colors.textSecondary },
                ]}
              >
                Earn{" "}
                <Text style={{ color: colors.primary, fontWeight: "bold" }}>
                  {referralData.reward_per_referral || 50} coins
                </Text>{" "}
                for each successful referral!
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.shareButton, { backgroundColor: colors.primary }]}
              onPress={handleShare}
            >
              <Share2 size={18} color={colors.white} />
              <Text style={[styles.shareButtonText, { color: colors.white }]}>
                Share Referral Link
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>

      {/* Daily Rewards */}
      <View style={[styles.rewardCard, { backgroundColor: colors.surface }]}>
        <View style={styles.rewardHeader}>
          <Gift size={24} color={colors.primary} />
          <Text style={[styles.rewardTitle, { color: colors.text }]}>
            Daily Rewards
          </Text>
        </View>

        <View
          style={[
            styles.dailyRewardBox,
            { backgroundColor: colors.background },
          ]}
        >
          <Gift size={32} color={colors.primary} />
          <Text
            style={[styles.dailyRewardText, { color: colors.textSecondary }]}
          >
            Daily Login:{" "}
            <Text style={{ color: colors.primary, fontWeight: "bold" }}>
              +{gamificationConfig?.daily_login_bonus || 1} coins
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          style={[
            styles.spinButton,
            {
              backgroundColor: colors.primary, // Always colored, maybe dim if unavailable in future
              opacity: gamificationStatus?.daily_spin_available ? 1 : 0.8,
            },
          ]}
          onPress={() => {
            if (gamificationStatus?.daily_spin_available) {
              setShowSpinWheel(true);
            } else {
              setShowSpinWheel(true); // Open it anyway so they can see the wheel, handle disabled state inside if needed, or just show alert.
              // For better UX, let's open it but maybe the SpinWheel component should handle "already spun".
              // However, the user said "nothing happening".
              // Let's just open it. The SpinWheel component needs to handle the case where they can't spin.
              // For now, I'll allow opening.
            }
          }}
        >
          <Text style={[styles.spinButtonText, { color: colors.white }]}>
            {gamificationStatus?.daily_spin_available
              ? "🎰 Daily Spin Wheel"
              : "✅ Spin Completed (View)"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{ height: insets.top, backgroundColor: colors.background }}
      />
      <View style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1, paddingRight: 12 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Gamification Hub
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.textSecondary }]}
            >
              Track progress, earn coins & unlock rewards!
            </Text>
          </View>

          {/* Coin Balance Badge */}
          <View style={[styles.coinBadge, { backgroundColor: colors.primary }]}>
            <Coins size={18} color={colors.white} />
            <Text style={[styles.coinBadgeText, { color: colors.white }]}>
              {coinBalance.toLocaleString()}
            </Text>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsContent}
          >
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  style={[
                    styles.tab,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.surface,
                    },
                  ]}
                  onPress={() => setActiveTab(tab.id)}
                >
                  <TabIcon
                    size={18}
                    color={isActive ? colors.white : colors.text}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                      { color: isActive ? colors.white : colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {tab.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <ScrollView
          style={{ flex: 1 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 56 + 10 + insets.bottom }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "achievements" && renderAchievementsTab()}
          {activeTab === "leaderboard" && renderLeaderboardTab()}
          {activeTab === "rewards" && renderRewardsTab()}
        </ScrollView>
      </View>

      <SpinWheel
        visible={showSpinWheel}
        onClose={() => setShowSpinWheel(false)}
        canSpin={gamificationStatus?.daily_spin_available}
        onSpinComplete={() => {
          loadAllData();
        }}
      />

      <WalletModal
        visible={showWalletModal}
        onClose={() => setShowWalletModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 4,
  },
  coinBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  coinBadgeText: {
    fontWeight: "bold",
    fontSize: 16,
  },
  coinBadgeLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
  tabsContainer: {
    height: 56,
    flexShrink: 0,
  },
  tabsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    alignItems: "center",
  },
  tab: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
    height: 36,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  tabContent: {
    padding: 16,
    paddingTop: 12,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    width: "47%",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  progressCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  progressText: {
    fontSize: 12,
  },
  progressBarBg: {
    height: 12,
    borderRadius: 6,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressLabel: {
    fontSize: 12,
  },
  actionsCard: {
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionsTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  actionsGrid: {
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  actionButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  achievementsGrid: {
    gap: 12,
    width: "100%",
  },
  achievementCard: {
    width: "100%",
    padding: 16,
    borderRadius: 12,
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  achievementIcon: {
    fontSize: 36,
    marginBottom: 8,
    alignSelf: "flex-start",
  },
  achievementTitle: {
    width: "100%",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "left",
    marginBottom: 4,
  },
  achievementDesc: {
    width: "100%",
    fontSize: 13,
    textAlign: "left",
    marginBottom: 12,
  },
  achievementReward: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  achievementRewardText: {
    fontSize: 12,
    fontWeight: "600",
  },
  leaderboardContainer: {
    width: "100%",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  leaderboardItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  leaderboardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },
  leaderboardInfo: {
    flex: 1,
    minWidth: 0,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  rankText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  leaderboardName: {
    fontSize: 15,
    fontWeight: "500",
    flexShrink: 1,
  },
  leaderboardLevel: {
    fontSize: 12,
    marginTop: 2,
  },
  leaderboardRight: {
    minWidth: 82,
    marginLeft: 12,
    alignItems: "flex-end",
    flexShrink: 0,
  },
  leaderboardCoins: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
  },
  leaderboardPoints: {
    fontSize: 12,
    marginTop: 2,
    textAlign: "right",
  },
  rewardCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rewardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  referralContent: {
    gap: 16,
  },
  referralCodeBox: {
    padding: 12,
    borderRadius: 10,
  },
  referralCodeLabel: {
    fontSize: 12,
    marginBottom: 8,
  },
  referralCodeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  referralCodeBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
  },
  referralCodeText: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
  copyButton: {
    padding: 10,
    borderRadius: 8,
  },
  referralStats: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  referralStatItem: {
    alignItems: "center",
  },
  referralStatValue: {
    fontSize: 22,
    fontWeight: "bold",
  },
  referralStatLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  referralInfo: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  referralInfoText: {
    fontSize: 13,
    textAlign: "center",
  },
  shareButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
    gap: 8,
  },
  shareButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  dailyRewardBox: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  dailyRewardText: {
    marginTop: 8,
    fontSize: 14,
  },
  spinButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 10,
  },
  spinButtonText: {
    fontWeight: "600",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
