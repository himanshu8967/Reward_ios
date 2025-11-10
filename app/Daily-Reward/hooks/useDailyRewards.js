import { useState, useCallback, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { updateUserEarnings } from "@/lib/redux/slice/gameSlice";
import {
  fetchWalletScreen,
  fetchWalletTransactions,
  fetchFullWalletTransactions,
} from "@/lib/redux/slice/walletTransactionsSlice";
import { fetchProfileStats } from "@/lib/redux/slice/profileSlice";

const BASE_URL = "https://rewardsapi.hireagent.co";

export const useDailyRewards = () => {
  const dispatch = useDispatch();
  const [weekData, setWeekData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [isNavigating, setIsNavigating] = useState(false);
  const [isCurrentWeek, setIsCurrentWeek] = useState(true);
  const [isFutureWeek, setIsFutureWeek] = useState(false);

  // Use ref to always have the latest currentWeekStart value
  const currentWeekStartRef = useRef(currentWeekStart);

  // Update ref whenever currentWeekStart changes
  useEffect(() => {
    currentWeekStartRef.current = currentWeekStart;
  }, [currentWeekStart]);

  // Hydrate from localStorage cache immediately to avoid initial loading flicker
  useEffect(() => {
    try {
      const cached = localStorage.getItem("daily_rewards_current_week");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed?.data) {
          setWeekData(parsed.data);
          if (parsed.data.weekStart) {
            setCurrentWeekStart(new Date(parsed.data.weekStart));
          }
        }
      }
    } catch (_e) {
      // ignore cache errors
    }
  }, []);

  // Fetch week data (with cache)
  const fetchWeekData = useCallback(
    async (date = null, forceRefresh = false) => {
      try {
        const cacheKey = date
          ? `week_${date.toISOString().split("T")[0]}`
          : "current_week";
        const cachedData = localStorage.getItem(`daily_rewards_${cacheKey}`);

        // Only use cache if not forcing refresh and cache is fresh
        if (cachedData && !date && !forceRefresh) {
          try {
            const parsedData = JSON.parse(cachedData);
            const cacheTime = parsedData.cacheTime;
            const now = Date.now();

            // Use cache if less than 2 minutes old (reduced from 5 minutes for better freshness)
            if (now - cacheTime < 2 * 60 * 1000) {
              setWeekData(parsedData.data);
              setCurrentWeekStart(new Date(parsedData.data.weekStart));
              return parsedData.data;
            }
          } catch (e) {
            // Ignore cache parse error
          }
        }

        // Show loading state when navigating to a different week
        setLoading(true);
        setError(null);

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Please log in to view daily rewards.");
        }

        const url = date
          ? `${BASE_URL}/api/daily-rewards/week?date=${
              date.toISOString().split("T")[0]
            }`
          : `${BASE_URL}/api/daily-rewards/week`;

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || data.message || "Failed to load week data"
          );
        }

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          } else if (response.status === 404) {
            throw new Error("No reward data found for this week.");
          } else {
            throw new Error(
              data.error ||
                data.message ||
                `Failed to load week data (${response.status})`
            );
          }
        }

        if (data.success && data.data) {
          // Update state with new week data
          const newWeekData = data.data;
          const newWeekStart = new Date(newWeekData.weekStart);

          setWeekData(newWeekData);
          setCurrentWeekStart(newWeekStart);

          // Check if this is the current week or future week
          const now = new Date();
          const weekStart = new Date(newWeekData.weekStart);
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 6);

          const isCurrentWeek = now >= weekStart && now <= weekEnd;
          const isFutureWeek = weekStart > now;
          setIsCurrentWeek(isCurrentWeek);
          setIsFutureWeek(isFutureWeek);

          const cacheData = {
            data: newWeekData,
            cacheTime: Date.now(),
          };
          localStorage.setItem(
            `daily_rewards_${cacheKey}`,
            JSON.stringify(cacheData)
          );

          // Also update the current week cache if this is the current week
          if (isCurrentWeek) {
            localStorage.setItem(
              `daily_rewards_current_week`,
              JSON.stringify(cacheData)
            );
          }

          return newWeekData;
        } else {
          throw new Error(
            data.error || data.message || "Failed to fetch week data"
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [] // Remove weekData dependency to avoid stale closures
  );

  // Go to previous week
  const goToPreviousWeek = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      // Use ref to get the latest currentWeekStart value (not from closure)
      const current = currentWeekStartRef.current;
      const previousWeek = new Date(current);
      previousWeek.setDate(previousWeek.getDate() - 7);

      // Fetch data for the previous week
      await fetchWeekData(previousWeek);
    } catch (error) {
      console.error("Error navigating to previous week:", error);
    } finally {
      setIsNavigating(false);
    }
  }, [fetchWeekData, isNavigating]);

  // Go to next week
  const goToNextWeek = useCallback(async () => {
    if (isNavigating) return;

    setIsNavigating(true);
    try {
      // Use ref to get the latest currentWeekStart value (not from closure)
      const current = currentWeekStartRef.current;
      const nextWeek = new Date(current);
      nextWeek.setDate(nextWeek.getDate() + 7);

      // Fetch data for the next week
      await fetchWeekData(nextWeek);
    } catch (error) {
      console.error("Error navigating to next week:", error);
    } finally {
      setIsNavigating(false);
    }
  }, [fetchWeekData, isNavigating]);

  // Claim reward
  const handleRewardClaim = useCallback(
    async (dayNumber) => {
      try {
        if (!dayNumber || dayNumber < 1 || dayNumber > 7) {
          throw new Error("Invalid day number. Must be between 1-7.");
        }

        const token = localStorage.getItem("authToken");
        if (!token) {
          throw new Error("Please log in to claim rewards.");
        }

        const response = await fetch(`${BASE_URL}/api/daily-rewards/claim`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ day: dayNumber }),
        });

        const data = await response.json();

        if (!data.success) {
          throw new Error(
            data.error || data.message || "Failed to claim reward"
          );
        }

        if (!response.ok) {
          if (response.status === 400) {
            throw new Error(
              data.error ||
                data.message ||
                "Invalid request. Please check if this reward is claimable."
            );
          } else if (response.status === 401) {
            throw new Error("Session expired. Please log in again.");
          } else if (response.status === 403) {
            throw new Error("You don't have permission to claim this reward.");
          } else if (response.status === 404) {
            throw new Error("Reward not found for this day.");
          } else if (response.status === 409) {
            throw new Error("This reward has already been claimed.");
          } else {
            throw new Error(
              data.error ||
                data.message ||
                `Server error (${response.status}). Please try again.`
            );
          }
        }

        if (data.success && data.data) {
          // Update Redux store with new coins and XP
          dispatch(
            updateUserEarnings({
              coins: data.data.coins || 0,
              xp: data.data.xp || 0,
            })
          );

          // Refresh wallet screen data for real-time updates
          try {
            await dispatch(fetchWalletScreen(token));
          } catch (walletError) {
            console.warn("⚠️ Failed to refresh wallet screen:", walletError);
            // Don't throw error - reward was still claimed successfully
          }

          // Refresh transaction history immediately after reward claim
          try {
            await Promise.all([
              dispatch(fetchWalletTransactions({ token, limit: 5 })),
              dispatch(
                fetchFullWalletTransactions({
                  token,
                  page: 1,
                  limit: 20,
                  type: "all",
                })
              ),
            ]);
            console.log("✅ Transaction history refreshed after reward claim");
          } catch (transactionError) {
            console.warn(
              "⚠️ Failed to refresh transaction history:",
              transactionError
            );
            // Don't throw error - reward was still claimed successfully
          }

          // Refresh profile stats for homepage components (RewardProgress, XPTierTracker)
          try {
            await dispatch(fetchProfileStats(token));
          } catch (statsError) {
            console.warn("⚠️ Failed to refresh profile stats:", statsError);
            // Don't throw error - reward was still claimed successfully
          }

          // Force refresh to get updated status and timer
          // Clear cache for current week to force fresh fetch
          const cacheKey = "current_week";
          localStorage.removeItem(`daily_rewards_${cacheKey}`);
          localStorage.removeItem(`daily_rewards_current_week`);

          // Small delay to ensure API has updated, then force refresh
          await new Promise((resolve) => setTimeout(resolve, 300));
          await fetchWeekData(currentWeekStartRef.current, true);

          setSuccessMessage(
            `Reward claimed! You earned ${data.data.coins} coins and ${data.data.xp} XP!`
          );
          setError(null);
          return data.data;
        } else {
          throw new Error(
            data.error || data.message || "Failed to claim reward"
          );
        }
      } catch (err) {
        setError(err.message);
        throw err;
      }
    },
    [fetchWeekData, dispatch]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Clear success message
  const clearSuccessMessage = useCallback(() => {
    setSuccessMessage(null);
  }, []);

  return {
    weekData,
    loading,
    error,
    successMessage,
    currentWeekStart,
    isNavigating,
    isCurrentWeek,
    isFutureWeek,
    fetchWeekData,
    goToPreviousWeek,
    goToNextWeek,
    handleRewardClaim,
    clearError,
    clearSuccessMessage,
  };
};
