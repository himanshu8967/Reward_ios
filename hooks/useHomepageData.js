import { useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchUserData } from "@/lib/redux/slice/gameSlice";
import { fetchWalletScreen } from "@/lib/redux/slice/walletTransactionsSlice";
import { fetchProfileStats } from "@/lib/redux/slice/profileSlice";

/**
 * Custom hook to manage homepage data efficiently
 * Prevents unnecessary API calls and re-renders
 */
export const useHomepageData = (token, user) => {
  const dispatch = useDispatch();

  // Get all necessary state from Redux
  const {
    stats,
    statsStatus,
    dashboardData,
    dashboardStatus,
    details,
    detailsStatus,
  } = useSelector((state) => state.profile);

  const { userDataStatus, userData } = useSelector((state) => state.games);
  const { walletScreenStatus, walletScreen } = useSelector(
    (state) => state.walletTransactions
  );

  // OPTIMIZED: Enhanced data availability check with persistence awareness
  const dataAvailability = useMemo(() => {
    const hasStats =
      (dashboardData?.stats || stats) &&
      (statsStatus === "succeeded" || dashboardStatus === "succeeded");
    const hasUserData =
      userData && (userDataStatus === "succeeded" || userDataStatus === "idle");
    const hasWalletData =
      walletScreen &&
      (walletScreenStatus === "succeeded" || walletScreenStatus === "idle");
    const hasDashboardData = dashboardData && dashboardStatus === "succeeded";

    // OPTIMIZED: More intelligent loading state
    const isLoading =
      statsStatus === "loading" ||
      userDataStatus === "loading" ||
      walletScreenStatus === "loading";
    const hasAnyData =
      hasStats || hasUserData || hasWalletData || hasDashboardData;

    return {
      hasStats,
      hasUserData,
      hasWalletData,
      hasDashboardData,
      // Only show loading if we have NO data at all and are actively loading
      shouldShowLoading: !hasAnyData && isLoading,
    };
  }, [
    dashboardData,
    stats,
    userDataStatus,
    userData,
    walletScreenStatus,
    walletScreen,
    statsStatus,
    dashboardStatus,
  ]);

  // STALE-WHILE-REVALIDATE: Always fetch stats and wallet screen - will use cache if available and fresh
  useEffect(() => {
    if (!token || !user?._id) return;

    // Always dispatch - stale-while-revalidate will handle cache logic automatically
    // This ensures:
    // 1. Shows cached data immediately if available (< 5 min old)
    // 2. Refreshes in background if cache is stale or 80% expired
    // 3. Fetches fresh if no cache exists
    console.log(
      "💰 [useHomepageData] Fetching stats and wallet screen (stale-while-revalidate)"
    );
    dispatch(fetchProfileStats({ token }));
    dispatch(fetchWalletScreen({ token }));

    // Only fetch user data if not already loaded
    if (userDataStatus === "idle" && !userData) {
      console.log("🎮 [useHomepageData] Fetching user data (not cached)");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }
  }, [token, user, userDataStatus, userData, dispatch]);

  // Refresh balance/XP when app comes to foreground (admin changes)
  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      console.log(
        "🔄 [useHomepageData] App focused - refreshing balance and XP"
      );
      // Force refresh to get latest admin changes
      dispatch(fetchProfileStats({ token, force: true }));
      dispatch(fetchWalletScreen({ token, force: true }));
    };

    // Listen for window focus (app comes to foreground)
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, dispatch]);

  return {
    // Data
    stats: dashboardData?.stats || stats,
    userData,
    walletScreen,
    details,

    // Loading states
    isLoading: dataAvailability.shouldShowLoading,
    hasStats: dataAvailability.hasStats,
    hasUserData: dataAvailability.hasUserData,
    hasWalletData: dataAvailability.hasWalletData,

    // Status
    statsStatus,
    userDataStatus,
    walletScreenStatus,
    detailsStatus,
  };
};
