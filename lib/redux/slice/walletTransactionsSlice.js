import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getWalletTransactions,
  getFullWalletTransactions,
  getWalletScreen,
} from "@/lib/api";

const initialState = {
  transactions: [],
  fullTransactions: [],
  walletScreen: null,
  status: "idle",
  fullTransactionsStatus: "idle",
  walletScreenStatus: "idle",
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasMore: false,
  },
  error: null,
  // STALE-WHILE-REVALIDATE: Cache timestamps for wallet screen (balance)
  walletScreenCacheTimestamp: null,
  walletScreenCacheTTL: 5 * 60 * 1000, // 5 minutes in milliseconds
};

// Fetch wallet transactions
export const fetchWalletTransactions = createAsyncThunk(
  "walletTransactions/fetchWalletTransactions",
  async ({ token, limit = 5 }, { rejectWithValue }) => {
    try {
      const response = await getWalletTransactions(token, limit);
      const transformedTransactions = response
        .map((transaction, index) => {
          // Set coins and XP based on balanceType
          const isCoins = transaction.balanceType === "coins";
          const isXp = transaction.balanceType === "xp";

          // Extract XP values from metadata if available (for Daily Rewards and other transactions)
          const metadataXp = transaction.metadata?.xp || null;
          const finalXp = transaction.metadata?.finalXp || null;
          const baseXp =
            transaction.metadata?.baseXp || transaction.metadata?.baseXP || null;
          const xpEarned = transaction.metadata?.xpEarned || null;

          // Priority: metadata.xp > finalXp > transaction amount for XP
          // Use metadata.xp if available (for Daily Rewards), otherwise use finalXp, or transaction amount for XP transactions
          let xpValue =
            metadataXp !== null
              ? metadataXp
              : isXp
              ? transaction.amount
              : finalXp || 0;

          // If xpValue is zero, use xpEarned from metadata if available
          if (xpValue === 0 && xpEarned !== null && xpEarned !== undefined) {
            xpValue = xpEarned;
          }

          return {
            id: transaction._id,
            gameName: getGameNameFromDescription(transaction.description),
            coins: isCoins ? transaction.amount : 0,
            xpBonus: xpValue,
            xp: metadataXp, // Store metadata.xp for display
            finalXp: finalXp, // Store finalXp separately for display
            baseXp: baseXp, // Store baseXp from metadata for transaction log
            gameLogoSrc: getDefaultGameImage(),
            status: transaction.status,
            description: transaction.description,
            referenceId: transaction.referenceId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            metadata: transaction.metadata, // Include full metadata for reference
          };
        })
        .filter((transaction) => {
          // Filter out the second daily challenge spin transaction
          // Hide transactions with referenceId starting with "SPIN-DC-"
          // This is the duplicate spin transaction that should not be shown
          if (transaction.referenceId && transaction.referenceId.startsWith("SPIN-DC-")) {
            return false;
          }
          return true;
        });
      return transformedTransactions;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch full wallet transactions with pagination
export const fetchFullWalletTransactions = createAsyncThunk(
  "walletTransactions/fetchFullWalletTransactions",
  async (
    { token, page = 1, limit = 20, type = "all" },
    { rejectWithValue }
  ) => {
    try {
      const response = await getFullWalletTransactions(
        token,
        page,
        limit,
        type
      );

      console.log("🔍 [fetchFullWalletTransactions] API Response:", response);

      // Transform the API response to match the component's expected format
      // API returns array directly, not wrapped in data object
      const transformedTransactions = response
        .map((transaction) => {
          // Set coins and XP based on balanceType
          const isCoins = transaction.balanceType === "coins";
          const isXp = transaction.balanceType === "xp";

          // Extract XP values from metadata if available (for Daily Rewards and other transactions)
          const metadataXp = transaction.metadata?.xp || null;
          const finalXp = transaction.metadata?.finalXp || null;
          const baseXp =
            transaction.metadata?.baseXp || transaction.metadata?.baseXP || null;
          const xpEarned = transaction.metadata?.xpEarned || null;

          // Priority: metadata.xp > finalXp > transaction amount for XP
          // Use metadata.xp if available (for Daily Rewards), otherwise use finalXp, or transaction amount for XP transactions
          let xpValue =
            metadataXp !== null
              ? metadataXp
              : isXp
              ? transaction.amount
              : finalXp || 0;

          // If xpValue is zero, use xpEarned from metadata if available
          if (xpValue === 0 && xpEarned !== null && xpEarned !== undefined) {
            xpValue = xpEarned;
          }

          return {
            id: transaction._id,
            gameName: getGameNameFromDescription(transaction.description),
            gameType: transaction.type === "credit" ? "Reward" : "Purchase",
            coins: isCoins ? transaction.amount : 0,
            xpBonus: xpValue,
            xp: metadataXp, // Store metadata.xp for display
            finalXp: finalXp, // Store finalXp separately for display
            baseXp: baseXp, // Store baseXp from metadata for transaction log
            gameLogoSrc: getDefaultGameImage(),
            status: transaction.status,
            description: transaction.description,
            referenceId: transaction.referenceId,
            createdAt: transaction.createdAt,
            updatedAt: transaction.updatedAt,
            metadata: transaction.metadata, // Include full metadata for reference
          };
        })
        .filter((transaction) => {
          // Filter out the second daily challenge spin transaction
          // Hide transactions with referenceId starting with "SPIN-DC-"
          // This is the duplicate spin transaction that should not be shown
          if (transaction.referenceId && transaction.referenceId.startsWith("SPIN-DC-")) {
            return false;
          }
          return true;
        });

      console.log(
        "🔍 [fetchFullWalletTransactions] Transformed Transactions:",
        transformedTransactions
      );

      return {
        transactions: transformedTransactions,
        pagination: {
          currentPage: page,
          totalPages: 1,
          totalItems: transformedTransactions.length,
          hasMore: false,
        },
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Fetch wallet screen data with stale-while-revalidate
export const fetchWalletScreen = createAsyncThunk(
  "walletTransactions/fetchWalletScreen",
  async (
    { token, force = false, background = false } = {},
    { rejectWithValue, getState }
  ) => {
    try {
      // STALE-WHILE-REVALIDATE: Check cache if not forcing refresh
      if (!force && !background) {
        const state = getState();
        const cachedWalletScreen = state.walletTransactions.walletScreen;
        const cacheTimestamp =
          state.walletTransactions.walletScreenCacheTimestamp;
        const cacheTTL = state.walletTransactions.walletScreenCacheTTL;

        if (cachedWalletScreen && cacheTimestamp) {
          const cacheAge = Date.now() - cacheTimestamp;

          // If cache is fresh (< 5 minutes), return cached data immediately
          if (cacheAge < cacheTTL) {
            console.log(
              `[Redux] Using cached wallet screen (age: ${Math.round(
                cacheAge / 1000
              )}s)`
            );

            // Trigger background refresh if cache is 80% expired (4 minutes)
            if (cacheAge > cacheTTL * 0.8) {
              console.log(
                `[Redux] Wallet screen cache is 80% expired, triggering background refresh`
              );
              setTimeout(() => {
                const { store } = require("@/lib/redux/store");
                store.dispatch(
                  fetchWalletScreen({
                    token,
                    background: true,
                  })
                );
              }, 0);
            }

            return {
              ...cachedWalletScreen,
              fromCache: true,
              cacheAge,
            };
          }

          // Cache is stale but exists - return it and refresh in background
          console.log(
            `[Redux] Wallet screen cache is stale (age: ${Math.round(
              cacheAge / 1000
            )}s), refreshing in background`
          );

          // Trigger background refresh immediately
          setTimeout(() => {
            const { store } = require("@/lib/redux/store");
            store.dispatch(
              fetchWalletScreen({
                token,
                background: true,
              })
            );
          }, 0);

          // Return stale cache immediately (stale-while-revalidate pattern)
          return {
            ...cachedWalletScreen,
            fromCache: true,
            cacheAge,
            stale: true,
          };
        }
      }

      // Fetch fresh data from API
      const response = await getWalletScreen(token);
      const walletScreenData = {
        user: response.data.user,
        wallet: response.data.wallet,
        xp: response.data.xp,
        highestEarningGames: response.data.highestEarningGames.map((game) => ({
          id: game.id,
          name: game.name,
          icon: game.icon,
          earnings: game.earnings,
          difficulty: game.difficulty,
          timeRequired: game.timeRequired,
          views: "5.6 K",
        })),
      };
      return {
        ...walletScreenData,
        fromCache: false,
        timestamp: Date.now(),
        background,
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const getGameNameFromDescription = (description) => {
  if (!description) return "Game Reward";
  const parts = description.split("-");
  const gameName = parts[0].trim();
  return gameName || "Game Reward";
};

// Helper function to get default XP bonus based on coin amount
const getDefaultXpBonus = (coinAmount) => {
  if (coinAmount >= 100) return 50;
  if (coinAmount >= 50) return 50;
  if (coinAmount >= 25) return 50;
  if (coinAmount >= 10) return 50;
  return 50;
};

// Helper function to get default game image
const getDefaultGameImage = () => {
  return "/download.png";
};

// --- SLICE DEFINITION ---
const walletTransactionsSlice = createSlice({
  name: "walletTransactions",
  initialState,
  reducers: {
    clearWalletTransactions: (state) => {
      state.transactions = [];
      state.fullTransactions = [];
      state.walletScreen = null;
      state.status = "idle";
      state.fullTransactionsStatus = "idle";
      state.walletScreenStatus = "idle";
      state.pagination = {
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        hasMore: false,
      };
      state.error = null;
      // Clear cache timestamps
      state.walletScreenCacheTimestamp = null;
    },
    addNewTransaction: (state, action) => {
      // Add a new transaction to the beginning of the list
      state.transactions.unshift(action.payload);
      state.fullTransactions.unshift(action.payload);
    },
    loadMoreTransactions: (state, action) => {
      // Append new transactions to existing ones for pagination
      state.fullTransactions = [...state.fullTransactions, ...action.payload];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWalletTransactions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchWalletTransactions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchWalletTransactions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
        // Keep existing transactions on error to avoid UI flicker
      })

      // Reducers for fetchFullWalletTransactions
      .addCase(fetchFullWalletTransactions.pending, (state) => {
        state.fullTransactionsStatus = "loading";
        state.error = null;
      })
      .addCase(fetchFullWalletTransactions.fulfilled, (state, action) => {
        state.fullTransactionsStatus = "succeeded";
        state.fullTransactions = action.payload.transactions;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchFullWalletTransactions.rejected, (state, action) => {
        state.fullTransactionsStatus = "failed";
        state.error = action.payload;
        // Keep existing transactions on error to avoid UI flicker
      })

      // Reducers for fetchWalletScreen with stale-while-revalidate
      .addCase(fetchWalletScreen.pending, (state, action) => {
        const isBackground = action.meta.arg?.background || false;

        // IMPORTANT: Background refreshes do NOT set loading status
        // This ensures UI doesn't show loading spinners during background refresh
        if (!isBackground) {
          state.walletScreenStatus = "loading";
        }
        // Background refreshes keep existing status (don't change it)
        state.error = null;
        console.log(
          `[Redux] ${
            isBackground ? "[BACKGROUND - NO LOADING STATE] " : ""
          }Loading wallet screen`
        );
      })
      .addCase(fetchWalletScreen.fulfilled, (state, action) => {
        const isBackground = action.meta.arg?.background || false;
        const fromCache = action.payload.fromCache || false;

        // Only update wallet screen if not from cache (fresh data)
        if (!fromCache) {
          // Remove cache metadata before storing
          const {
            fromCache: _,
            cacheAge: __,
            stale: ___,
            timestamp: ____,
            background: _____,
            ...walletScreenData
          } = action.payload;
          state.walletScreen = walletScreenData;
          state.walletScreenCacheTimestamp = Date.now();
          console.log(
            `[Redux] ${
              isBackground ? "[BACKGROUND] " : ""
            }Updated wallet screen with fresh data`
          );
        } else {
          console.log(
            `[Redux] Using cached wallet screen (cache age: ${Math.round(
              (action.payload.cacheAge || 0) / 1000
            )}s)`
          );
        }

        // IMPORTANT: Background refreshes do NOT update status
        // This prevents UI from showing loading states during background refresh
        if (!isBackground) {
          state.walletScreenStatus = "succeeded";
        }
        // Background refreshes: status stays as "succeeded" (or whatever it was)
        state.error = null;
      })
      .addCase(fetchWalletScreen.rejected, (state, action) => {
        const isBackground = action.meta.arg?.background || false;

        // Only update status if not background refresh
        if (!isBackground) {
          state.walletScreenStatus = "failed";
          state.error = action.payload;
        }
        // Background refresh errors are silent (don't change status)
        // Keep existing data on error to avoid UI flicker
      });
  },
});

export const {
  clearWalletTransactions,
  addNewTransaction,
  loadMoreTransactions,
} = walletTransactionsSlice.actions;

export default walletTransactionsSlice.reducer;
