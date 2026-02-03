/**
 * Gamification Store
 * Zustand store for managing gamification state including wallet, coins, and rewards
 */

import { create } from "zustand";
import api from "../services/api";
import { API_ENDPOINTS } from "../constants/constants";

export const useGamification = create((set, get) => ({
  // State
  wallet: null,
  coinBalance: 0,
  userLevel: "Bronze",
  gamificationStatus: null,
  achievements: [],
  leaderboard: [],
  referralData: null,
  isLoading: false,
  error: null,

  // Fetch Wallet Data
  fetchWallet: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(API_ENDPOINTS.wallet);
      const walletData = response.data;

      set({
        wallet: walletData.wallet || walletData,
        coinBalance:
          walletData.wallet?.balance ||
          walletData.coin_balance ||
          walletData.balance ||
          0,
        userLevel: walletData.level || "Bronze",
        isLoading: false,
      });

      return { success: true };
    } catch (error) {
      // Silence 401 errors
      if (error.response && error.response.status === 401) {
        set({
          wallet: null,
          coinBalance: 0,
          userLevel: "Bronze",
          isLoading: false,
          error: null,
        });
        return { success: false, error: "Unauthorized" };
      }
      console.error(
        "Wallet fetch error:",
        error.response?.data || error.message,
      );
      set({
        error: error.response?.data?.error || "Failed to fetch wallet",
        isLoading: false,
      });
      return { success: false, error: error.message };
    }
  },

  // Fetch Gamification Status
  fetchGamificationStatus: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.gamificationStatus);
      set({
        gamificationStatus: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Gamification status error:",
        error.response?.data || error.message,
      );
      return { success: false, error: error.message };
    }
  },

  // Fetch Achievements
  fetchAchievements: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.achievements);
      set({
        achievements: response.data.achievements || response.data || [],
      });
      return { success: true };
    } catch (error) {
      console.error(
        "Achievements fetch error:",
        error.response?.data || error.message,
      );
      return { success: false, error: error.message };
    }
  },

  // Fetch Leaderboard
  fetchLeaderboard: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.leaderboard);
      set({
        leaderboard: response.data.leaderboard || response.data || [],
      });
      return { success: true };
    } catch (error) {
      console.error(
        "Leaderboard fetch error:",
        error.response?.data || error.message,
      );
      return { success: false, error: error.message };
    }
  },

  // Fetch Referral Data
  fetchReferralData: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.referrals);
      set({
        referralData: response.data,
      });
      return { success: true, data: response.data };
    } catch (error) {
      console.error(
        "Referral data fetch error:",
        error.response?.data || error.message,
      );
      return { success: false, error: error.message };
    }
  },

  // Spin Wheel
  spinWheel: async () => {
    try {
      const response = await api.post(API_ENDPOINTS.spinWheel);

      if (response.data?.reward) {
        // Update local balance if coins were won
        if (response.data.reward.type === "coins") {
          const currentBalance = get().coinBalance;
          set({
            coinBalance: currentBalance + response.data.reward.value,
          });
        }

        // Refresh wallet data
        setTimeout(() => {
          get().fetchWallet();
          get().fetchGamificationStatus();
        }, 500);

        return { success: true, data: response.data };
      }

      return { success: false, error: "Invalid response from spin wheel" };
    } catch (error) {
      console.error("Spin wheel error:", error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.error || "Spin failed",
      };
    }
  },

  // Load all gamification data
  loadAllData: async () => {
    set({ isLoading: true, error: null });

    try {
      await Promise.all([
        get().fetchWallet(),
        get().fetchGamificationStatus(),
        get().fetchAchievements(),
        get().fetchLeaderboard(),
        get().fetchReferralData(),
      ]);

      set({ isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return { success: false, error: error.message };
    }
  },

  // Get level info
  getLevelInfo: (level) => {
    const levels = {
      Bronze: { color: "#CD7F32", nextLevel: "Silver", threshold: 500 },
      Silver: { color: "#C0C0C0", nextLevel: "Gold", threshold: 1000 },
      Gold: { color: "#FFD700", nextLevel: "Platinum", threshold: 2500 },
      Platinum: { color: "#E5E4E2", nextLevel: "Diamond", threshold: 5000 },
      Diamond: { color: "#B9F2FF", nextLevel: "Max Level", threshold: 10000 },
    };
    return levels[level] || levels.Bronze;
  },

  // Reset error
  resetError: () => set({ error: null }),
  reset: () =>
    set({
      wallet: null,
      coinBalance: 0,
      userLevel: "Bronze",
      gamificationStatus: null,
      achievements: [],
      leaderboard: [],
      referralData: null,
      isLoading: false,
      error: null,
    }),
}));
