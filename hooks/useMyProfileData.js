import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUserProfile,
  fetchProfileStats,
  fetchVipStatus,
  fetchUserAchievements,
} from "@/lib/redux/slice/profileSlice";
import { fetchUserData } from "@/lib/redux/slice/gameSlice";
import { fetchWalletScreen } from "@/lib/redux/slice/walletTransactionsSlice";

/**
 * Custom hook to manage MyProfile data efficiently
 * Prevents unnecessary API calls and re-renders
 * Similar to useHomepageData but optimized for profile page
 */
export const useMyProfileData = (token, user) => {
  const dispatch = useDispatch();

  // Get all necessary state from Redux
  const {
    details: profile,
    stats,
    vipStatus,
    achievements,
    detailsStatus,
    statsStatus,
    vipStatusState,
    achievementsStatus,
  } = useSelector((state) => state.profile);

  const { userDataStatus, userData } = useSelector((state) => state.games);
  const { walletScreenStatus, walletScreen } = useSelector(
    (state) => state.walletTransactions
  );

  // OPTIMIZED: Enhanced data availability check with persistence awareness
  const dataAvailability = useMemo(() => {
    const hasProfile = profile && detailsStatus === "succeeded";
    const hasStats = stats && statsStatus === "succeeded";
    const hasVipStatus = vipStatus && vipStatusState === "succeeded";
    const hasAchievements = achievements && achievementsStatus === "succeeded";
    const hasUserData = userData && userDataStatus === "succeeded";
    const hasWalletData = walletScreen && walletScreenStatus === "succeeded";

    // OPTIMIZED: More intelligent loading state
    const isLoading =
      detailsStatus === "loading" ||
      statsStatus === "loading" ||
      vipStatusState === "loading" ||
      achievementsStatus === "loading" ||
      userDataStatus === "loading" ||
      walletScreenStatus === "loading";

    const hasAnyData =
      hasProfile ||
      hasStats ||
      hasVipStatus ||
      hasAchievements ||
      hasUserData ||
      hasWalletData;

    return {
      hasProfile,
      hasStats,
      hasVipStatus,
      hasAchievements,
      hasUserData,
      hasWalletData,
      // Only show loading if we have NO data at all and are actively loading
      shouldShowLoading: !hasAnyData && isLoading,
    };
  }, [
    profile,
    stats,
    vipStatus,
    achievements,
    userData,
    walletScreen,
    detailsStatus,
    statsStatus,
    vipStatusState,
    achievementsStatus,
    userDataStatus,
    walletScreenStatus,
  ]);

  // Only fetch data if it's not already available
  useEffect(() => {
    if (!token) return;

    // Fetch profile details if not loaded
    if (detailsStatus === "idle" && !profile) {
      console.log("👤 [useMyProfileData] Fetching user profile (not cached)");
      dispatch(fetchUserProfile(token));
    }

    // Fetch stats if not loaded
    if (statsStatus === "idle" && !stats) {
      console.log("📊 [useMyProfileData] Fetching profile stats (not cached)");
      // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
      dispatch(fetchProfileStats({ token }));
    }

    // Fetch VIP status if not loaded
    if (vipStatusState === "idle" && !vipStatus) {
      console.log("👑 [useMyProfileData] Fetching VIP status (not cached)");
      dispatch(fetchVipStatus(token));
    }

    // Fetch achievements if not loaded
    if (achievementsStatus === "idle" && !achievements) {
      console.log("🏆 [useMyProfileData] Fetching achievements (not cached)");
      dispatch(
        fetchUserAchievements({
          token,
          category: "games",
          status: "completed",
        })
      );
    }

    // Fetch user data if not loaded and user ID is available
    if (user?._id && userDataStatus === "idle" && !userData) {
      console.log("🎮 [useMyProfileData] Fetching user data (not cached)");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    // Fetch wallet data if not loaded
    if (walletScreenStatus === "idle" && !walletScreen) {
      console.log("💰 [useMyProfileData] Fetching wallet data (not cached)");
      // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
      dispatch(fetchWalletScreen({ token }));
    }
  }, [
    token,
    user,
    profile,
    stats,
    vipStatus,
    achievements,
    userData,
    walletScreen,
    detailsStatus,
    statsStatus,
    vipStatusState,
    achievementsStatus,
    userDataStatus,
    walletScreenStatus,
    dispatch,
  ]);

  // Computed values for easy access
  const computedValues = useMemo(() => {
    // Map the correct fields from stats object (similar to homepage)
    const coinBalance = stats?.coinBalance || walletScreen?.coinBalance || 0;
    const xpCurrent = stats?.currentXP || walletScreen?.currentXP || 0; // Use currentXP like homepage
    const xpLevel = stats?.tier || walletScreen?.tier || 1; // Use tier like homepage
    const isVipActive =
      vipStatus?.data?.isActive &&
      vipStatus?.data?.currentTier &&
      vipStatus?.data?.currentTier !== "Free";
    const currentTier = vipStatus?.data?.currentTier || "Bronze";

    // DEBUG: Log the computed values to help debug
    console.log("🔍 [useMyProfileData] Computed values:", {
      coinBalance,
      xpCurrent,
      xpLevel,
      isVipActive,
      currentTier,
      stats: stats ? "✅ Available" : "❌ Missing",
      walletScreen: walletScreen ? "✅ Available" : "❌ Missing",
      vipStatus: vipStatus ? "✅ Available" : "❌ Missing",
      rawStats: stats, // Log the actual stats object structure
      rawWalletScreen: walletScreen, // Log the actual walletScreen object structure
    });

    return {
      coinBalance,
      xpCurrent,
      xpLevel,
      isVipActive,
      currentTier,
    };
  }, [stats, walletScreen, vipStatus]);

  return {
    // Data
    profile,
    stats,
    vipStatus,
    achievements,
    userData,
    walletScreen,

    // Computed values
    ...computedValues,

    // Loading states
    isLoading: dataAvailability.shouldShowLoading,
    hasProfile: dataAvailability.hasProfile,
    hasStats: dataAvailability.hasStats,
    hasVipStatus: dataAvailability.hasVipStatus,
    hasAchievements: dataAvailability.hasAchievements,
    hasUserData: dataAvailability.hasUserData,
    hasWalletData: dataAvailability.hasWalletData,

    // Status
    detailsStatus,
    statsStatus,
    vipStatusState,
    achievementsStatus,
    userDataStatus,
    walletScreenStatus,
  };
};
