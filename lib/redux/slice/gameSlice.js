import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getUserData,
  getConversions,
  getSurveys,
  getUserProfiling,
  getMessenger,
  getOffers,
  getGamesBySection,
  getGameById,
} from "@/lib/api";

// ============================================================================
// INITIAL STATE
// ============================================================================

/**
 * Initial state for the games slice
 * Manages user-specific game data, earnings, and various game-related features
 */
const initialState = {
  // Core game data from User Data API
  userData: null,
  availableGames: [], // Games user can start playing
  inProgressGames: [], // Games user is currently playing
  completedGames: [], // Games user has finished
  mostPlayedGames: [], // Processed games for homepage display

  // Offers data from Besitos API
  offers: [], // Available offers/games for swipe cards
  offersStatus: "idle", // idle | loading | succeeded | failed

  // New game discovery API data - SEPARATE STATE FOR EACH UI SECTION
  gamesBySection: {}, // Games for specific UI sections: { "Most Played": [...], "Swipe": [...], etc. }
  gamesBySectionStatus: {}, // Status for each section: { "Most Played": "idle", "Swipe": "loading", etc. }

  // Dedicated state for Most Played Screen
  mostPlayedScreenGames: [], // Games specifically for Most Played Screen
  mostPlayedScreenStatus: "idle", // idle | loading | succeeded | failed
  mostPlayedScreenError: null, // Error state for Most Played Screen

  currentGameDetails: null, // Detailed game information
  gameDetailsStatus: "idle", // idle | loading | succeeded | failed
  availableUiSections: [], // Available UI sections from API

  // User earnings and financial data
  userEarnings: {
    historyAmount: 0, // Total amount user has earned
    currency: "$", // Currency symbol
    balance: 0, // Available balance for withdrawal
  },

  // Additional game features
  conversions: [], // Conversion tracking data
  surveys: [], // Available surveys
  userProfiling: null, // User profiling data
  messenger: null, // Messenger/chat data

  // Loading states for different API calls
  userDataStatus: "idle", // idle | loading | succeeded | failed
  conversionsStatus: "idle",
  surveysStatus: "idle",
  userProfilingStatus: "idle",
  messengerStatus: "idle",

  // Error handling
  error: null,

  // OPTIMIZED: Image caching for performance (serializable)
  imageCache: {}, // Cache of optimized image URLs
  preloadedImages: [], // Array of preloaded image URLs (serializable alternative to Set)
};

export const fetchUserData = createAsyncThunk(
  "games/fetchUserData",
  async ({ userId, token }, { rejectWithValue }) => {
    try {
      console.log("[Redux] Fetching user data for:", {
        userId,
        token,
      });

      const response = await getUserData(userId, token);
      console.log("[Redux] User Data API response:", response);
      console.log("[Redux] API response structure:", {
        hasData: !!response.data,
        hasAvailable: !!response.available,
        hasInProgress: !!response.in_progress,
        availableCount:
          response.data?.available?.length || response.available?.length || 0,
        inProgressCount:
          response.data?.in_progress?.length ||
          response.in_progress?.length ||
          0,
      });

      // Process and structure the User Data API response
      // Handle nested data structure from API response
      const apiData = response.data || response;

      return {
        available: apiData.available || [],
        in_progress: apiData.in_progress || [],
        completed: apiData.completed || [],
        userEarnings: {
          historyAmount: apiData.history_amount || 0,
          currency: apiData.currency || "$",
          balance: apiData.balance || 0,
        },
        termsOfService: apiData.terms_of_service,
        privacyPolicy: apiData.privacy_policy,
        faq: apiData.faq,
        support: apiData.support,
      };
    } catch (error) {
      console.error("[Redux] Error fetching user data:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchConversions = createAsyncThunk(
  "games/fetchConversions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await getConversions();
      return response.data || [];
    } catch (error) {
      console.error("[Redux] Error fetching conversions:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchSurveys = createAsyncThunk(
  "games/fetchSurveys",
  async ({ userId, device = "mobile", userIp }, { rejectWithValue }) => {
    try {
      const response = await getSurveys(userId, device, userIp);
      return response.data || [];
    } catch (error) {
      console.error("[Redux] Error fetching surveys:", error);
      return rejectWithValue(error.message);
    }
  }
);

/**
 * Fetch user profiling data from Besitos API
 * Provides insights about user preferences and behavior
 *
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User profiling data
 */
export const fetchUserProfiling = createAsyncThunk(
  "games/fetchUserProfiling",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getUserProfiling(userId);
      return response;
    } catch (error) {
      console.error("[Redux] Error fetching user profiling:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMessenger = createAsyncThunk(
  "games/fetchMessenger",
  async (userId, { rejectWithValue }) => {
    try {
      const response = await getMessenger(userId);
      return response;
    } catch (error) {
      console.error("[Redux] Error fetching messenger data:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchOffers = createAsyncThunk(
  "games/fetchOffers",
  async (
    { per_page = 5, device_platform = "android", page = 1 } = {},
    { rejectWithValue }
  ) => {
    try {
      console.log("[Redux] Fetching offers with params:", {
        per_page,
        device_platform,
        page,
      });

      const response = await getOffers({ per_page, device_platform, page });
      console.log("[Redux] Offers API response:", response);

      // Ensure we only get exactly the requested number of games
      const offersData = response.data || [];
      const limitedOffers = offersData.slice(0, per_page);

      return limitedOffers;
    } catch (error) {
      console.error("[Redux] Error fetching offers:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGamesBySection = createAsyncThunk(
  "games/fetchGamesBySection",
  async (
    {
      uiSection = "Swipe",
      ageGroup = "18-24",
      gender = "male",
      page = 1,
      limit = 20,
      token = null,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // Get authentication token
      const authToken = token || localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication required. Please log in.");
      }

      console.log("[Redux] Fetching games by section with params:", {
        uiSection,
        ageGroup,
        gender,
        page,
        limit,
        hasToken: !!authToken,
      });

      const response = await getGamesBySection({
        uiSection,
        ageGroup,
        gender,
        page,
        limit,
        token: authToken,
      });
      console.log("[Redux] Games by section API response:", response);
      console.log("[Redux] API response data:", response.data);
      console.log("[Redux] API response data length:", response.data?.length);
      console.log("[Redux] API response structure:", {
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length,
        firstGame: response.data?.[0],
        allGames: response.data,
      });

      // DEBUG: Check if the returned games match the requested section
      if (response.data && Array.isArray(response.data)) {
        console.log("[Redux] Checking returned games sections:");
        response.data.forEach((game, index) => {
          console.log(`[Redux] Game ${index + 1} section:`, {
            requestedSection: uiSection,
            actualSection: game.uiSection,
            matches: game.uiSection === uiSection,
            gameId: game.id || game._id,
            title: game.title || game.name || game.details?.name,
          });
        });
      }

      return {
        games: response.data || [],
        pagination: response.pagination || {},
        uiSections: response.uiSections || [],
      };
    } catch (error) {
      console.error("[Redux] Error fetching games by section:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMostPlayedScreenGames = createAsyncThunk(
  "games/fetchMostPlayedScreenGames",
  async (
    {
      ageGroup = "18-24",
      gender = "male",
      page = 1,
      limit = 50,
      token = null,
    } = {},
    { rejectWithValue }
  ) => {
    try {
      // Get authentication token
      const authToken = token || localStorage.getItem("authToken");
      if (!authToken) {
        throw new Error("Authentication required. Please log in.");
      }

      console.log("[Redux] Fetching Most Played Screen games with params:", {
        ageGroup,
        gender,
        page,
        limit,
        hasToken: !!authToken,
      });

      const response = await getGamesBySection({
        uiSection: "Most Played Screen",
        ageGroup,
        gender,
        page,
        limit,
        token: authToken,
      });

      console.log("[Redux] Most Played Screen games API response:", response);
      console.log("[Redux] Most Played Screen games data:", response.data);

      return {
        games: response.data || [],
        pagination: response.pagination || {},
      };
    } catch (error) {
      console.error("[Redux] Error fetching Most Played Screen games:", error);
      return rejectWithValue(error.message);
    }
  }
);

export const fetchGameById = createAsyncThunk(
  "games/fetchGameById",
  async (gameId, { rejectWithValue }) => {
    try {
      // Get authentication token
      const token = localStorage.getItem("authToken");
      if (!token) {
        throw new Error("Authentication required. Please log in.");
      }

      console.log("[Redux] Fetching game by ID:", {
        gameId,
        hasToken: !!token,
        tokenLength: token?.length || 0,
      });

      const response = await getGameById(gameId, token);
      console.log("[Redux] Game by ID API response:", {
        gameId,
        response,
        hasData: !!response.data,
        dataType: typeof response.data,
        isArray: Array.isArray(response.data),
        dataLength: response.data?.length,
        firstItem: response.data?.[0],
        success: response.success,
        error: response.error,
      });

      // Handle both array and object responses
      let gameData = null;
      if (Array.isArray(response.data)) {
        // If data is an array, get the first item
        gameData = response.data?.[0] || null;
      } else if (response.data && typeof response.data === "object") {
        // If data is an object, use it directly
        gameData = response.data;
      }

      console.log("[Redux] Returning game data:", {
        gameId,
        hasGameData: !!gameData,
        gameTitle:
          gameData?.title || gameData?.name || gameData?.gameDetails?.name,
        gameIdMatch: gameData
          ? (gameData.id || gameData._id || gameData.gameId) === gameId ||
            gameData.gameId === gameId ||
            gameData.gameDetails?.id === gameId
          : false,
      });

      return gameData;
    } catch (error) {
      console.error("[Redux] Error fetching game by ID:", error);
      return rejectWithValue(error.message);
    }
  }
);

// ============================================================================
// REDUX SLICE
// ============================================================================

/**
 * Games slice for managing game-related state
 * Handles user data, game categories, earnings, and additional features
 */
const gameSlice = createSlice({
  name: "games",
  initialState,

  // ============================================================================
  // REDUCERS - SYNCHRONOUS ACTIONS
  // ============================================================================

  reducers: {
    /**
     * Preserve games data across navigation
     * Prevents data loss when navigating between pages
     */
    preserveGamesData: (state) => {
      // Keep existing data, just update status to prevent refetching
      if (state.gamesBySectionStatus === "succeeded") {
        // Data is already loaded, keep it
        return;
      }
    },

    /**
     * Clear all games data and reset to initial state
     * Useful for logout or data refresh
     */
    clearGames: (state) => {
      // Reset core game data
      state.userData = null;
      state.availableGames = [];
      state.inProgressGames = [];
      state.completedGames = [];
      state.mostPlayedGames = [];

      // Reset offers data
      state.offers = [];

      // Reset additional features
      state.conversions = [];
      state.surveys = [];
      state.userProfiling = null;
      state.messenger = null;

      // Reset loading states
      state.userDataStatus = "idle";
      state.conversionsStatus = "idle";
      state.surveysStatus = "idle";
      state.userProfilingStatus = "idle";
      state.messengerStatus = "idle";
      state.offersStatus = "idle";

      // Reset error and earnings
      state.error = null;
      state.userEarnings = {
        historyAmount: 0,
        currency: "$",
        balance: 0,
      };

      // OPTIMIZED: Clear image cache when clearing games
      state.imageCache = {};
      state.preloadedImages = [];
    },

    /**
     * Clear games by section data to force fresh fetch
     */
    clearGamesBySection: (state) => {
      state.gamesBySection = {};
      state.gamesBySectionStatus = {};
      state.availableUiSections = [];
      console.log("[Redux] Cleared all games by section data");
    },

    /**
     * Clear specific section data
     */
    clearSpecificSection: (state, action) => {
      const sectionName = action.payload;
      if (state.gamesBySection[sectionName]) {
        delete state.gamesBySection[sectionName];
        delete state.gamesBySectionStatus[sectionName];
        console.log(`[Redux] Cleared data for section: ${sectionName}`);
      }
    },

    /**
     * Manually set most played games
     * Used for custom game processing or external data
     *
     * @param {Object} state - Current state
     * @param {Object} action - Action with payload containing games array
     */
    setMostPlayedGames: (state, action) => {
      state.mostPlayedGames = action.payload;
    },

    /**
     * Cache optimized image URL for a game
     * Used for performance optimization
     *
     * @param {Object} state - Current state
     * @param {Object} action - Action with payload containing gameId and imageUrl
     */
    cacheImage: (state, action) => {
      const { gameId, imageUrl } = action.payload;
      if (gameId && imageUrl) {
        state.imageCache[gameId] = imageUrl;
      }
    },

    /**
     * Add image to preloaded images list
     * Used for tracking preloaded images
     *
     * @param {Object} state - Current state
     * @param {Object} action - Action with payload containing imageUrl
     */
    addPreloadedImage: (state, action) => {
      const { imageUrl } = action.payload;
      if (imageUrl && !state.preloadedImages.includes(imageUrl)) {
        state.preloadedImages.push(imageUrl);
      }
    },

    /**
     * Clear image cache and preloaded images
     * Used for cleanup or reset
     */
    clearImageCache: (state) => {
      state.imageCache = {};
      state.preloadedImages = [];
    },

    /**
     * Clear current game details
     * Used when navigating to prevent showing old game data
     */
    clearCurrentGameDetails: (state) => {
      state.currentGameDetails = null;
      state.gameDetailsStatus = "idle";
      state.gameDetailsError = null;
      console.log("[Redux] Current game details cleared");
    },

    /**
     * Update user earnings with new coins and XP
     */
    updateUserEarnings: (state, action) => {
      const { coins, xp } = action.payload;

      // Update balance with new coins
      state.userEarnings.balance += coins || 0;

      // Update history amount with new coins
      state.userEarnings.historyAmount += coins || 0;

      console.log("💰 [Redux] Updated user earnings:", {
        coinsAdded: coins,
        xpAdded: xp,
        newBalance: state.userEarnings.balance,
        newHistoryAmount: state.userEarnings.historyAmount,
      });
    },
  },
  // ============================================================================
  // EXTRA REDUCERS - ASYNC ACTIONS
  // ============================================================================

  extraReducers: (builder) => {
    builder
      // ========================================================================
      // USER DATA API - Core game data management
      // ========================================================================

      .addCase(fetchUserData.pending, (state) => {
        state.userDataStatus = "loading";
        state.error = null; // Clear previous errors
      })

      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.userDataStatus = "succeeded";
        state.userData = action.payload;

        // Update game categories
        state.availableGames = action.payload.available || [];
        state.inProgressGames = action.payload.in_progress || [];
        state.completedGames = action.payload.completed || [];

        console.log("🎮 [Redux] fetchUserData.fulfilled - Processed Data:", {
          availableGames: state.availableGames.length,
          inProgressGames: state.inProgressGames.length,
          completedGames: state.completedGames.length,
          userEarnings: action.payload.userEarnings,
        });

        // Debug logging for API response
        console.log("🎮 [Redux] fetchUserData.fulfilled - API Response:", {
          available: action.payload.available?.length || 0,
          inProgress: action.payload.in_progress?.length || 0,
          completed: action.payload.completed?.length || 0,
          fullPayload: action.payload,
        });

        // Update user earnings
        state.userEarnings = action.payload.userEarnings || {
          historyAmount: 0,
          currency: "$",
          balance: 0,
        };

        // Process available games for homepage display
        if (action.payload.available && action.payload.available.length > 0) {
          const processedGames = action.payload.available
            .filter((game) => game.categories && game.categories.length > 0)
            .sort((a, b) => (b.amount || 0) - (a.amount || 0))
            // Remove the .slice(0, 12) limit to show all games
            .map((game, index) => ({
              id: game.id,
              name: game.title,
              title: game.title,
              image: game.square_image || game.image,
              square_image: game.square_image,
              large_image: game.large_image,
              bgImage: game.large_image || game.image,
              borderImage: game.image,
              borderColor: "#FF69B4",
              isNew: index < 2,
              amount: game.amount,
              currency: game.currency || "$",
              description: game.description,
              url: game.url,
              // Add direct app store URLs for bypassing Besitos wall
              appStoreUrl:
                game.appStoreUrl || game.playStoreUrl || game.googlePlayUrl,
              packageName: game.packageName || game.package_name,
              appStoreId: game.appStoreId || game.app_store_id,
              categories: game.categories,
              goals: game.goals || [],
              budget_status: "Active", // User Data API only returns eligible games
              cpi: game.cpi,
              image_text: game.image_text,
              card_text: game.card_text,
              details: game.details,
              points: game.points || [],
            }));

          state.mostPlayedGames = processedGames;
        }
      })

      .addCase(fetchUserData.rejected, (state, action) => {
        state.userDataStatus = "failed";
        state.error = action.payload;
        console.error("[Redux] Failed to fetch user data:", action.payload);
      })

      // ========================================================================
      // CONVERSIONS - Track user conversions and earnings
      // ========================================================================

      .addCase(fetchConversions.pending, (state) => {
        state.conversionsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchConversions.fulfilled, (state, action) => {
        state.conversionsStatus = "succeeded";
        state.conversions = action.payload;
      })
      .addCase(fetchConversions.rejected, (state, action) => {
        state.conversionsStatus = "failed";
        state.error = action.payload;
        console.error("[Redux] Failed to fetch conversions:", action.payload);
      })

      // ========================================================================
      // SURVEYS - Available surveys for the user
      // ========================================================================

      .addCase(fetchSurveys.pending, (state) => {
        state.surveysStatus = "loading";
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.surveysStatus = "succeeded";
        state.surveys = action.payload;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.surveysStatus = "failed";
        state.error = action.payload;
        console.error("[Redux] Failed to fetch surveys:", action.payload);
      })

      // ========================================================================
      // USER PROFILING - User preferences and behavior insights
      // ========================================================================

      .addCase(fetchUserProfiling.pending, (state) => {
        state.userProfilingStatus = "loading";
        state.error = null;
      })
      .addCase(fetchUserProfiling.fulfilled, (state, action) => {
        state.userProfilingStatus = "succeeded";
        state.userProfiling = action.payload;
      })
      .addCase(fetchUserProfiling.rejected, (state, action) => {
        state.userProfilingStatus = "failed";
        state.error = action.payload;
        console.error(
          "[Redux] Failed to fetch user profiling:",
          action.payload
        );
      })

      // ========================================================================
      // MESSENGER - Chat and communication features
      // ========================================================================

      .addCase(fetchMessenger.pending, (state) => {
        state.messengerStatus = "loading";
        state.error = null;
      })
      .addCase(fetchMessenger.fulfilled, (state, action) => {
        state.messengerStatus = "succeeded";
        state.messenger = action.payload;
      })
      .addCase(fetchMessenger.rejected, (state, action) => {
        state.messengerStatus = "failed";
        state.error = action.payload;
        console.error(
          "[Redux] Failed to fetch messenger data:",
          action.payload
        );
      })

      // ========================================================================
      // OFFERS - Available games for swipe cards
      // ========================================================================

      .addCase(fetchOffers.pending, (state) => {
        state.offersStatus = "loading";
        state.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offersStatus = "succeeded";
        state.offers = action.payload;
        console.log(
          "[Redux] Offers loaded successfully:",
          action.payload.length,
          "games"
        );
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.offersStatus = "failed";
        state.error = action.payload;
        console.error("[Redux] Failed to fetch offers:", action.payload);
      })

      // ========================================================================
      // GAMES BY SECTION - New game discovery API
      // ========================================================================

      .addCase(fetchGamesBySection.pending, (state, action) => {
        const uiSection = action.meta.arg.uiSection || "Unknown";
        state.gamesBySectionStatus[uiSection] = "loading";
        state.error = null;
        console.log(`[Redux] Loading games for section: ${uiSection}`);
      })
      .addCase(fetchGamesBySection.fulfilled, (state, action) => {
        const uiSection = action.meta.arg.uiSection || "Unknown";
        state.gamesBySectionStatus[uiSection] = "succeeded";
        state.gamesBySection[uiSection] = action.payload.games;
        state.availableUiSections = action.payload.uiSections;
        console.log(
          `[Redux] Games for section "${uiSection}" loaded successfully:`,
          action.payload.games.length,
          "games"
        );
        console.log(
          `[Redux] Section "${uiSection}" games:`,
          action.payload.games
        );
      })
      .addCase(fetchGamesBySection.rejected, (state, action) => {
        const uiSection = action.meta.arg.uiSection || "Unknown";
        state.gamesBySectionStatus[uiSection] = "failed";
        state.error = action.payload;
        console.error(
          `[Redux] Failed to fetch games for section "${uiSection}":`,
          action.payload
        );
      })

      // ========================================================================
      // GAME DETAILS - Game details by ID
      // ========================================================================

      .addCase(fetchGameById.pending, (state) => {
        state.gameDetailsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchGameById.fulfilled, (state, action) => {
        state.gameDetailsStatus = "succeeded";
        state.currentGameDetails = action.payload;
        console.log(
          "[Redux] Game details loaded successfully:",
          action.payload?.title
        );
      })
      .addCase(fetchGameById.rejected, (state, action) => {
        state.gameDetailsStatus = "failed";
        state.error = action.payload;
        console.error("[Redux] Failed to fetch game details:", action.payload);
      })

      // ========================================================================
      // MOST PLAYED SCREEN GAMES - Dedicated state for Most Played Screen
      // ========================================================================

      .addCase(fetchMostPlayedScreenGames.pending, (state) => {
        state.mostPlayedScreenStatus = "loading";
        state.mostPlayedScreenError = null;
        console.log("[Redux] Loading Most Played Screen games...");
      })
      .addCase(fetchMostPlayedScreenGames.fulfilled, (state, action) => {
        state.mostPlayedScreenStatus = "succeeded";
        state.mostPlayedScreenGames = action.payload.games;
        console.log(
          "[Redux] Most Played Screen games loaded successfully:",
          action.payload.games.length,
          "games"
        );
        console.log("[Redux] Most Played Screen games:", action.payload.games);
      })
      .addCase(fetchMostPlayedScreenGames.rejected, (state, action) => {
        state.mostPlayedScreenStatus = "failed";
        state.mostPlayedScreenError = action.payload;
        console.error(
          "[Redux] Failed to fetch Most Played Screen games:",
          action.payload
        );
      });
  },
});

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Action creators for synchronous operations
 * @type {Object}
 */
export const {
  clearGames,
  setMostPlayedGames,
  clearGamesBySection,
  clearSpecificSection,
  clearCurrentGameDetails,
  updateUserEarnings,
} = gameSlice.actions;

/**
 * Async thunk exports
 * Note: All async thunks (fetchUserData, fetchConversions, fetchSurveys, etc.)
 * are already exported at their definitions (lines 74-379).
 * No additional export block needed.
 */

/**
 * Default export - the games reducer
 * Handles all game-related state management
 * @type {Function}
 */
export default gameSlice.reducer;
