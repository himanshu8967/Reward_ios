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

  // Today
  today: null, // { hasChallenge, challenge, progress, countdown, actions }
  todayStatus: "idle",

  // UI
  modalOpen: false,

  // Streak
  streak: { current: 0, milestones: [5, 10, 20, 30], nextMilestone: 5 },

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
  async ({ year, month, token }, { rejectWithValue }) => {
    console.log("📅 [REDUX] fetchCalendar thunk called:", {
      year,
      month,
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });
    try {
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
      return response.data;
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
  async ({ token }, { rejectWithValue }) => {
    console.log("🎯 [REDUX] fetchToday thunk called:", {
      hasToken: !!token,
      timestamp: new Date().toISOString(),
    });
    try {
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
      return response.data;
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
      .addCase(fetchCalendar.pending, (state) => {
        console.log("📅 [REDUX] fetchCalendar.pending");
        state.calendarStatus = "loading";
        state.error = null;
      })
      .addCase(fetchCalendar.fulfilled, (state, action) => {
        console.log("📅 [REDUX] fetchCalendar.fulfilled:", {
          calendarDays: action.payload?.calendarDays?.length || 0,
          streak: action.payload?.streak,
        });
        state.calendarStatus = "succeeded";
        state.calendar = action.payload;
        if (action.payload?.streak) state.streak = action.payload.streak;
      })
      .addCase(fetchCalendar.rejected, (state, action) => {
        console.error("📅 [REDUX] fetchCalendar.rejected:", action.payload);
        state.calendarStatus = "failed";
        state.error = action.payload;
      })

      // Today
      .addCase(fetchToday.pending, (state) => {
        console.log("🎯 [REDUX] fetchToday.pending");
        state.todayStatus = "loading";
        state.error = null;
      })
      .addCase(fetchToday.fulfilled, (state, action) => {
        console.log("🎯 [REDUX] fetchToday.fulfilled:", {
          hasChallenge: action.payload?.hasChallenge,
          progressStatus: action.payload?.progress?.status,
          challengeId: action.payload?.challenge?.id,
        });
        state.todayStatus = "succeeded";
        state.today = action.payload;
      })
      .addCase(fetchToday.rejected, (state, action) => {
        console.error("🎯 [REDUX] fetchToday.rejected:", action.payload);
        state.todayStatus = "failed";
        state.error = action.payload;
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
        });
        if (!state.today) return;
        state.today.progress = state.today.progress || {};
        state.today.progress.status = "started";
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
