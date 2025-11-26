import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchWalletScreen } from "@/lib/redux/slice/walletTransactionsSlice";

/**
 * Custom hook to handle real-time wallet updates
 * Monitors wallet screen data changes and provides refresh functionality
 */
export const useWalletUpdates = (token) => {
  const dispatch = useDispatch();

  // Get wallet screen data from Redux store
  const { walletScreen, walletScreenStatus } = useSelector(
    (state) => state.walletTransactions
  );

  // Monitor wallet screen changes
  useEffect(() => {
    console.log(
      "🔄 [useWalletUpdates] Wallet screen data updated:",
      walletScreen
    );
  }, [walletScreen]);

  // Function to refresh wallet data
  const refreshWalletData = async () => {
    if (!token) {
      console.warn(
        "⚠️ [useWalletUpdates] No token provided for wallet refresh"
      );
      return;
    }

    try {
      console.log("🔄 [useWalletUpdates] Refreshing wallet data...");
      // STALE-WHILE-REVALIDATE: Force refresh to get latest admin changes
      await dispatch(fetchWalletScreen({ token, force: true }));
      console.log("✅ [useWalletUpdates] Wallet data refreshed successfully");
    } catch (error) {
      console.error(
        "❌ [useWalletUpdates] Error refreshing wallet data:",
        error
      );
    }
  };

  // Get real-time balance and earnings data
  const realTimeBalance = walletScreen?.wallet?.balance || 0;
  const realTimeXP = walletScreen?.xp?.current || 0;
  const realTimeLevel = walletScreen?.xp?.level || 1;

  return {
    walletScreen,
    walletScreenStatus,
    realTimeBalance,
    realTimeXP,
    realTimeLevel,
    refreshWalletData,
    isLoading: walletScreenStatus === "loading",
    hasError: walletScreenStatus === "failed",
  };
};
