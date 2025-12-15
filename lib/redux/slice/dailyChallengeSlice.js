import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getDailyChallengeCalendar,
  getTodaysChallenge,
  selectChallengeGame as apiSelectChallengeGame,
  startChallenge as apiStartChallenge,
  completeChallenge as apiCompleteChallenge,
} from "../../api";

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialState = {
  // Calendar
  calendar: null, // { year, month, monthName, today, calendarDays[] }
  calendarStatus: "idle", // idle | loading | succeeded | failed
  calendarCacheTimestamp: null,
  calendarCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // Today
  today: null, // { hasChallenge, challenge, progress, countdown, actions }
  todayStatus: "idle",
  todayCacheTimestamp: null,
  todayCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds

  // UI
  modalOpen: false,

  // Streak
  streak: null, // No default values

  // Completion
  completionStatus: "idle",

  // Error handling
  error: null,
};

// ============================================================================
// ASYNC THUNKS
// ============================================================================

/**
 * Fetch daily challenges for user
 * Retrieves historical and current challenge data
 */
export const fetchCalendar = createAsyncThunk(
  "dailyChallenge/fetchCalendar",
  async ({ year, month, token, force = false, background = false }, { rejectWithValue, getState }) => {
    console.log("📅 [REDUX] fetchCalendar thunk called:", {
      year,
      month,
      hasToken: !!token,
      force,
      background,
      timestamp: new Date().toISOString(),
    });
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedCalendar = state.dailyChallenge.calendar;
        const cacheTimestamp = state.dailyChallenge.calendarCacheTimestamp;
        const cacheTTL = state.dailyChallenge.calendarCacheTTL;

        // Check if cached calendar matches requested month
        if (cachedCalendar && cacheTimestamp && cachedCalendar.year === year && cachedCalendar.month === month) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            console.log(
              `[Redux] Using cached calendar (age: ${Math.round(cacheAge / 1000)}s)`
            );

            // Trigger background refresh if cache is 80% expired (4 minutes)
            if (cacheAge > cacheTTL * 0.8) {
              console.log(
                `[Redux] Calendar cache is 80% expired, triggering background refresh`
              );
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchCalendar({
                    year,
                    month,
                    token,
                    background: true,
                  })
                );
              }, 0);
            }

            return {
              ...cachedCalendar,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          console.log(
            `[Redux] Calendar cache is stale (age: ${Math.round(cacheAge / 1000)}s), refreshing in background`
          );

          // Trigger background refresh immediately
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchCalendar({
                year,
                month,
                token,
                background: true,
              })
            );
          }, 0);

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedCalendar,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getDailyChallengeCalendar(year, month, token);
      console.log("📅 [REDUX] fetchCalendar API response:", {
        success: response?.success,
        hasData: !!response?.data,
      });
      if (!response.success)
        throw new Error(response.error || "Calendar error");
      console.log("📅 [REDUX] fetchCalendar fulfilled:", {
        calendarDays: response.data?.calendarDays?.length || 0,
        streak: response.data?.streak,
      });
      return {
        ...response.data,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      console.error("📅 [REDUX] fetchCalendar rejected:", {
        error: error.message,
        stack: error.stack,
      });
      return rejectWithValue(error.message || "Failed to fetch calendar");
    }
  }
);

export const fetchToday = createAsyncThunk(
  "dailyChallenge/fetchToday",
  async ({ token, force = false, background = false }, { rejectWithValue, getState }) => {
    console.log("🎯 [REDUX] fetchToday thunk called:", {
      hasToken: !!token,
      force,
      background,
      timestamp: new Date().toISOString(),
    });
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedToday = state.dailyChallenge.today;
        const cacheTimestamp = state.dailyChallenge.todayCacheTimestamp;
        const cacheTTL = state.dailyChallenge.todayCacheTTL;

        if (cachedToday && cacheTimestamp) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            console.log(
              `[Redux] Using cached today (age: ${Math.round(cacheAge / 1000)}s)`
            );

            // Trigger background refresh if cache is 80% expired (4 minutes)
            if (cacheAge > cacheTTL * 0.8) {
              console.log(
                `[Redux] Today cache is 80% expired, triggering background refresh`
              );
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchToday({
                    token,
                    background: true,
                  })
                );
              }, 0);
            }

            return {
              ...cachedToday,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          console.log(
            `[Redux] Today cache is stale (age: ${Math.round(cacheAge / 1000)}s), refreshing in background`
          );

          // Trigger background refresh immediately
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchToday({
                token,
                background: true,
              })
            );
          }, 0);

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedToday,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getTodaysChallenge(token);
      console.log("🎯 [REDUX] fetchToday API response:", {
        success: response?.success,
        hasChallenge: response?.data?.hasChallenge,
        progressStatus: response?.data?.progress?.status,
      });
      if (!response.success) throw new Error(response.error || "Today error");
      console.log("🎯 [REDUX] fetchToday fulfilled:", {
        hasChallenge: response.data?.hasChallenge,
        challengeId: response.data?.challenge?.id,
        progressStatus: response.data?.progress?.status,
      });
      return {
        ...response.data,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      console.error("🎯 [REDUX] fetchToday rejected:", {
        error: error.message,
        stack: error.stack,
      });
      return rejectWithValue(
        error.message || "Failed to fetch today's challenge"
      );
    }
  }
);

export const selectGame = createAsyncThunk(
  "dailyChallenge/selectGame",
  async ({ gameId, token }, { rejectWithValue }) => {
    console.log("🎮 [REDUX] selectGame thunk called:", {
      gameId,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });
    try {
      const response = await apiSelectChallengeGame(gameId, token);
      console.log("🎮 [REDUX] selectGame API response:", {
        success: response?.success,
        selectedGame: response?.data?.selectedGame,
      });
      if (!response.success)
        throw new Error(response.error || "Select game error");
      console.log("🎮 [REDUX] selectGame fulfilled:", {
        selectedGame: response.data?.selectedGame,
        canPlayNow: response.data?.canPlayNow,
      });
      return response.data;
    } catch (error) {
      console.error("🎮 [REDUX] selectGame rejected:", {
        error: error.message,
        stack: error.stack,
        gameId,
      });
      return rejectWithValue(error.message || "Failed to select game");
    }
  }
);

export const startTodayChallenge = createAsyncThunk(
  "dailyChallenge/start",
  async ({ token }, { rejectWithValue }) => {
    console.log("🚀 [REDUX] startTodayChallenge thunk called:", {
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });
    try {
      const response = await apiStartChallenge(token);
      console.log("🚀 [REDUX] startTodayChallenge API response:", {
        success: response?.success,
        deepLink: response?.data?.deepLink,
      });
      if (!response.success) throw new Error(response.error || "Start error");
      console.log("🚀 [REDUX] startTodayChallenge fulfilled:", {
        deepLink: response.data?.deepLink,
        gameId: response.data?.gameId,
        progress: response.data?.progress,
      });
      return response.data;
    } catch (error) {
      console.error("🚀 [REDUX] startTodayChallenge rejected:", {
        error: error.message,
        stack: error.stack,
      });
      return rejectWithValue(error.message || "Failed to start challenge");
    }
  }
);

/**
 * Complete a daily challenge
 * Updates challenge status and awards rewards
 */
export const completeTodayChallenge = createAsyncThunk(
  "dailyChallenge/complete",
  async ({ conversionId, token }, { rejectWithValue }) => {
    console.log("✅ [REDUX] completeTodayChallenge thunk called:", {
      conversionId,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });
    try {
      const response = await apiCompleteChallenge(conversionId, token);
      console.log("✅ [REDUX] completeTodayChallenge API response:", {
        success: response?.success,
        rewards: response?.data?.rewards,
      });
      if (!response.success)
        throw new Error(response.error || "Complete challenge error");
      console.log("✅ [REDUX] completeTodayChallenge fulfilled:", {
        rewards: response.data?.rewards,
        streak: response.data?.streak,
        transactionId: response.data?.transactionId,
      });
      return response.data;
    } catch (error) {
      console.error("✅ [REDUX] completeTodayChallenge rejected:", {
        error: error.message,
        stack: error.stack,
        conversionId,
      });
      return rejectWithValue(error.message || "Failed to complete challenge");
    }
  }
);

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate mock challenges for development
 */
function generateMockChallenges() {
  const challenges = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);

    challenges.push({
      id: `challenge_${date.getTime()}`,
      date: date.toISOString(),
      description: "Complete a purchase in any game",
      coinReward: 20,
      xpReward: 50,
      status: i < 5 ? "completed" : "expired",
      completedAt: i < 5 ? date.toISOString() : null,
    });
  }

  return challenges;
}

/**
 * Generate mock completed dates for development
 */
function generateMockCompletedDates() {
  const dates = [];
  const today = new Date();

  // Simulate completed challenges for the last 5 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString());
  }

  return dates;
}

/**
 * Calculate current streak from completed dates
 */
function calculateStreak(completedDates) {
  if (!completedDates || completedDates.length === 0) return 0;

  // Sort dates in descending order
  const sortedDates = completedDates
    .map((d) => new Date(d))
    .sort((a, b) => b - a);

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 0; i < sortedDates.length; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    checkDate.setHours(0, 0, 0, 0);

    const completedDate = new Date(sortedDates[i]);
    completedDate.setHours(0, 0, 0, 0);

    if (checkDate.getTime() === completedDate.getTime()) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}

/**
 * Get end of current day
 */
function getEndOfDay() {
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return end.toISOString();
}

// ============================================================================
// SLICE
// ============================================================================

const dailyChallengeSlice = createSlice({
  name: "dailyChallenge",
  initialState,
  reducers: {
    /**
     * Reset daily challenge state
     */
    resetDailyChallengeState: (state) => {
      return initialState;
    },

    /**
     * Update streak manually (for testing)
     */
    setModalOpen: (state, action) => {
      state.modalOpen = action.payload;
    },

    /**
     * Clear error
     */
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Calendar
      .addCase(fetchCalendar.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // IMPORTANT: Background refreshes do NOT set loading status
        if (!isBackground) {
          console.log("📅 [REDUX] fetchCalendar.pending");
          state.calendarStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        // Only update calendar if not from cache (fresh data)
        if (!fromCache) {
          // Remove cache metadata before storing
          const {
            fromCache: _,
            cacheAge: __,
            stale: ___,
            timestamp: ____,
            background: _____,
            ...calendarData
          } = action.payload;
          state.calendar = calendarData;
          state.calendarCacheTimestamp = Date.now();
          console.log(
            `[Redux] ${isBackground ? "[BACKGROUND] " : ""}Updated calendar with fresh data`
          );
        } else {
          console.log(
            `[Redux] Using cached calendar (cache age: ${Math.round(
              (action.payload.cacheAge || 0) / 1000
            )}s)`
          );
        }

        // IMPORTANT: Background refreshes do NOT update status
        if (!isBackground) {
          state.calendarStatus = "succeeded";
        }
        if (action.payload?.streak) state.streak = action.payload.streak;
        state.error = null;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // Only update status if not background refresh
        if (!isBackground) {
          console.error("📅 [REDUX] fetchCalendar.rejected:", action.payload);
          state.calendarStatus = "failed";
          state.error = action.payload;
        }
        // Background refresh errors are silent (don't change status)
        // Keep existing data on error to avoid UI flicker
      })

      // Today
      .addCase(fetchToday.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // IMPORTANT: Background refreshes do NOT set loading status
        if (!isBackground) {
          console.log("🎯 [REDUX] fetchToday.pending");
          state.todayStatus = "loading";
        }
        state.error = null;
      })
      .addCase(fetchToday.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        // Only update today if not from cache (fresh data)
        if (!fromCache) {
          // Remove cache metadata before storing
          const {
            fromCache: _,
            cacheAge: __,
            stale: ___,
            timestamp: ____,
            background: _____,
            ...todayData
          } = action.payload;
          state.today = todayData;
          state.todayCacheTimestamp = Date.now();
          console.log(
            `[Redux] ${isBackground ? "[BACKGROUND] " : ""}Updated today with fresh data`
          );
        } else {
          console.log(
            `[Redux] Using cached today (cache age: ${Math.round(
              (action.payload.cacheAge || 0) / 1000
            )}s)`
          );
        }

        // IMPORTANT: Background refreshes do NOT update status
        if (!isBackground) {
          state.todayStatus = "succeeded";
        }
        state.error = null;
      })
      .addCase(fetchToday.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        // Only update status if not background refresh
        if (!isBackground) {
          console.error("🎯 [REDUX] fetchToday.rejected:", action.payload);
          state.todayStatus = "failed";
          state.error = action.payload;
        }
        // Background refresh errors are silent (don't change status)
        // Keep existing data on error to avoid UI flicker
      })

      // Select game
      .addCase(selectGame.fulfilled, (state, action) => {
        console.log("🎮 [REDUX] selectGame.fulfilled:", {
          selectedGame: action.payload?.selectedGame,
          canPlayNow: action.payload?.canPlayNow,
        });
        if (!state.today) state.today = {};
        state.today.selectedGame = action.payload.selectedGame;
        // Some APIs include actions.canPlay flag
        if (state.today.actions) {
          state.today.actions.canPlay = !!action.payload.canPlayNow;
        }
      })

      // Start
      .addCase(startTodayChallenge.fulfilled, (state, action) => {
        console.log("🚀 [REDUX] startTodayChallenge.fulfilled:", {
          deepLink: action.payload?.deepLink,
          gameId: action.payload?.gameId,
          progress: action.payload?.progress,
        });
        if (!state.today) return;
        state.today.progress = state.today.progress || {};
        state.today.progress.status = "started";
        // Track when challenge was started (for 10-minute validation)
        if (action.payload?.progress?.startedAt) {
          state.today.progress.startedAt = action.payload.progress.startedAt;
        } else {
          // Fallback: set startedAt to current time if not provided by API
          state.today.progress.startedAt = new Date().toISOString();
        }
        state.today.started = action.payload;
      })

      // Complete
      .addCase(completeTodayChallenge.pending, (state) => {
        console.log("✅ [REDUX] completeTodayChallenge.pending");
        state.completionStatus = "submitting";
        state.error = null;
      })
      .addCase(completeTodayChallenge.fulfilled, (state, action) => {
        console.log("✅ [REDUX] completeTodayChallenge.fulfilled:", {
          rewards: action.payload?.rewards,
          streak: action.payload?.streak,
        });
        state.completionStatus = "succeeded";
        if (state.today) {
          state.today.progress = state.today.progress || {};
          state.today.progress.status = "completed";
          state.today.progress.rewardsEarned = action.payload.rewards;
        }
        if (action.payload?.streak) state.streak = action.payload.streak;
      })
      .addCase(completeTodayChallenge.rejected, (state, action) => {
        console.error(
          "✅ [REDUX] completeTodayChallenge.rejected:",
          action.payload
        );
        state.completionStatus = "failed";
        state.error = action.payload;
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

export const { resetDailyChallengeState, setModalOpen, clearError } =
  dailyChallengeSlice.actions;

export default dailyChallengeSlice.reducer;
