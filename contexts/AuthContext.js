"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  login,
  signup,
  getProfile,
  getDailyRewardsWeek,
  getXPTierProgressBar,
} from "@/lib/api";
import useOnboardingStore from "@/stores/useOnboardingStore";
import { App } from "@capacitor/app";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchUserProfile,
  fetchProfileStats,
  fetchVipStatus,
  clearProfile,
  fetchHomeDashboard,
  fetchLocationHistory,
  fetchUserAchievements,
} from "@/lib/redux/slice/profileSlice";
import { fetchFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";
import { fetchOnboardingOptions } from "@/lib/redux/slice/onboardingSlice";
import { fetchVipTiers } from "@/lib/redux/slice/vipSlice";
import {
  fetchWalletTransactions,
  fetchWalletScreen,
  fetchFullWalletTransactions,
} from "@/lib/redux/slice/walletTransactionsSlice";
import {
  fetchAccountOverview,
  clearAccountOverview,
} from "@/lib/redux/slice/accountOverviewSlice";
import { fetchUserData, clearGames } from "@/lib/redux/slice/gameSlice";
import { clearWalletTransactions } from "@/lib/redux/slice/walletTransactionsSlice";
import { store, persistor } from "@/lib/redux/store";
import {
  fetchCalendar as fetchDailyCalendar,
  fetchToday as fetchDailyToday,
} from "@/lib/redux/slice/dailyChallengeSlice";

const AuthContext = createContext({});

export function useAuth() {
  return useContext(AuthContext);
}

const PROTECTED_ROUTES = [
  "/homepage",
  "/myprofile",
  "/edit-profile",
  "/games",
  "/permissions",
  "/location",
];
const PUBLIC_ONLY_ROUTES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/select-age",
  "/onboarding/select-gender",
  "/onboarding/game-preferences",
  "/onboarding/game-styles",
  "/onboarding/player-type",
  "/welcome",
];

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNewUserFlow, setIsNewUserFlow] = useState(false);

  // NEW: Get the Redux dispatch function and the current status of the profile fetch
  const dispatch = useDispatch();
  const { detailsStatus } = useSelector((state) => state.profile);
  const { status: onboardingStatus } = useSelector((state) => state.onboarding);
  const { status: walletTransactionsStatus, walletScreenStatus } = useSelector(
    (state) => state.walletTransactions
  );
  const { status: accountOverviewStatus } = useSelector(
    (state) => state.accountOverview
  );
  // Deep link listener useEffect - Handles both custom scheme and HTTPS deep links
  useEffect(() => {
    let listener = null;

    // Check if we're in a Capacitor environment
    if (typeof window !== "undefined" && window.Capacitor && App) {
      try {
        listener = App.addListener("appUrlOpen", (event) => {
          const urlString = event.url;
          console.log("Deep link received:", urlString);

          let parsableUrl;
          let path;
          let token;

          // Handle custom URL scheme (com.jackson.app://)
          if (urlString.startsWith("com.jackson.app://")) {
            parsableUrl = new URL(
              urlString.replace("com.jackson.app://", "http://app/")
            );
            path = parsableUrl.pathname;
            token = parsableUrl.searchParams.get("token");
          }
          // Handle HTTPS deep links (Android App Links)
          else if (urlString.startsWith("https://")) {
            parsableUrl = new URL(urlString);
            path = parsableUrl.pathname;
            token = parsableUrl.searchParams.get("token");
          }

          // Process the deep link
          if (path && token) {
            console.log("Processing deep link:", {
              path,
              token: token.substring(0, 10) + "...",
            });

            if (path === "/reset-password") {
              router.push(`/reset-password?token=${token}`);
            } else if (path === "/auth/callback") {
              handleSocialAuthCallback(token).then((result) => {
                router.replace(result.ok ? "/location" : "/login");
              });
            }
          }
        });
      } catch (error) {
        console.warn(
          "App.addListener not available in this environment:",
          error
        );
      }
    }

    return () => {
      if (listener) {
        try {
          // Try different possible cleanup methods
          if (listener.remove && typeof listener.remove === "function") {
            listener.remove();
          } else if (
            listener.unsubscribe &&
            typeof listener.unsubscribe === "function"
          ) {
            listener.unsubscribe();
          } else if (
            listener.destroy &&
            typeof listener.destroy === "function"
          ) {
            listener.destroy();
          } else if (typeof listener === "function") {
            listener();
          }
        } catch (error) {
          console.warn("Error cleaning up listener:", error);
        }
      }
    };
  }, [router]);

  // MODIFIED: This effect now focuses only on loading the session from storage
  useEffect(() => {
    try {
      const storedToken = localStorage.getItem("authToken");
      const storedUser = localStorage.getItem("user");
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("❌ Failed to load session from storage", error);
      localStorage.clear();
    } finally {
      setIsLoading(false);
    }
  }, []);

  // OPTIMIZED: Smart data fetching with persistence awareness
  useEffect(() => {
    if (!token) return;

    // Get current state to check what data is already available
    const currentState = store.getState();
    const {
      detailsStatus,
      statsStatus,
      dashboardStatus,
      details,
      stats,
      dashboardData,
    } = currentState.profile;
    const { userDataStatus, userData, gamesBySection } = currentState.games;
    const { walletScreenStatus, walletScreen } =
      currentState.walletTransactions;
    const {
      calendarStatus: dailyCalendarStatus,
      todayStatus: dailyTodayStatus,
    } = currentState.dailyChallenge || {};

    // OPTIMIZED: Check if data exists and is valid before fetching
    const hasProfileData = details && detailsStatus === "succeeded";
    const hasStatsData =
      (stats || dashboardData?.stats) && statsStatus === "succeeded";
    const hasUserData = userData && userDataStatus === "succeeded";
    const hasWalletData = walletScreen && walletScreenStatus === "succeeded";
    const hasGamesData = gamesBySection && gamesBySection.length > 0;

    console.log("🔍 [AuthContext] Data availability check:", {
      hasProfileData,
      hasStatsData,
      hasUserData,
      hasWalletData,
      hasGamesData,
      detailsStatus,
      statsStatus,
      userDataStatus,
      walletScreenStatus,
      dailyCalendarStatus,
      dailyTodayStatus,
    });

    // PRIORITY 1: Only fetch essential data if not already loaded and valid
    if (!hasProfileData && detailsStatus === "idle") {
      console.log("🔑 [AuthContext] Fetching user profile (not cached)");
      dispatch(fetchUserProfile(token));
    }

    if (user && user._id && !hasUserData && userDataStatus === "idle") {
      console.log("🎮 [AuthContext] Fetching games data (not cached)");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    // NEW: Prefetch Daily Challenge data early for instant page load
    // Only trigger if not already loading/succeeded to avoid duplicate requests
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    if (dailyCalendarStatus === "idle") {
      console.log("📅 [AuthContext] Prefetching daily challenge calendar");
      dispatch(
        fetchDailyCalendar({
          year,
          month,
          token,
        })
      );
    }
    if (dailyTodayStatus === "idle") {
      console.log("🗓️ [AuthContext] Prefetching today's challenge");
      dispatch(
        fetchDailyToday({
          token,
        })
      );
    }

    // PRIORITY 2: Defer heavy data fetching to prevent app slowdown
    // Only fetch if not already loaded or loading
    if (!hasStatsData && statsStatus === "idle") {
      setTimeout(() => {
        console.log("📊 [AuthContext] Fetching profile stats (not cached)");
        dispatch(fetchProfileStats(token));
      }, 100);
    }

    if (!hasStatsData && dashboardStatus === "idle") {
      setTimeout(() => {
        console.log("🏠 [AuthContext] Fetching dashboard data (not cached)");
        dispatch(fetchHomeDashboard(token));
      }, 100);
    }

    // PRIORITY 3: Load heavy data after a longer delay - only if not already loaded
    setTimeout(() => {
      if (!hasWalletData && walletScreenStatus === "idle") {
        console.log("💰 [AuthContext] Fetching wallet data (not cached)");
        dispatch(fetchWalletScreen(token));
      }

      // Only fetch other heavy data if not already loaded
      dispatch(fetchAccountOverview()); // Account overview for games page
      dispatch(fetchVipStatus(token));
      dispatch(fetchFinancialGoals(token));
      dispatch(fetchVipTiers("US"));
      dispatch(fetchWalletTransactions({ token, limit: 5 }));
      dispatch(
        fetchFullWalletTransactions({
          token,
          page: 1,
          limit: 20,
          type: "all",
        })
      );
      dispatch(fetchLocationHistory(token));
      dispatch(
        fetchUserAchievements({
          token,
          category: "games",
          status: "completed",
        })
      );
    }, 500);
  }, [token, dispatch, user]);

  // Refresh profile and wallet when app comes to foreground (to get admin updates)
  useEffect(() => {
    if (!token) return;

    const handleFocus = () => {
      console.log(
        "🔄 [AuthContext] App focused - refreshing profile, wallet, and VIP to get admin updates"
      );
      dispatch(fetchUserProfile({ token, force: true }));
      dispatch(fetchVipStatus(token));
      // Also refresh wallet/balance/XP when app comes to foreground
      dispatch(fetchWalletScreen({ token, force: true }));
      dispatch(fetchProfileStats({ token, force: true }));
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [token, dispatch]);

  useEffect(() => {
    // Only fetch if we haven't fetched before
    if (onboardingStatus === "idle") {
      console.log("🚀 [Onboarding] Preloading all onboarding options...");
      dispatch(fetchOnboardingOptions("age_range"));
      dispatch(fetchOnboardingOptions("gender"));
      dispatch(fetchOnboardingOptions("game_preferences"));
      dispatch(fetchOnboardingOptions("game_style"));
      dispatch(fetchOnboardingOptions("dealy_game"));
    }
  }, [dispatch, onboardingStatus]);

  // Gatekeeper logic for routing (No changes needed here)
  useEffect(() => {
    if (isLoading) return;
    if (pathname === "/") return;

    // Skip gatekeeper logic during auth callback to prevent redirect loop
    if (pathname === "/auth/callback") return;

    const isAuthenticated = !!user;
    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isPublicOnlyRoute = PUBLIC_ONLY_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAuthenticated && isPublicOnlyRoute) {
      // Check if user has already completed permissions
      const permissionsAccepted =
        localStorage.getItem("permissionsAccepted") === "true";
      const locationCompleted =
        localStorage.getItem("locationCompleted") === "true";
      const faceVerificationCompleted =
        localStorage.getItem("faceVerificationCompleted") === "true";
      const faceVerificationSkipped =
        localStorage.getItem("faceVerificationSkipped") === "true";
      const hasCompletedOnboarding =
        localStorage.getItem("onboardingComplete") === "true";

      // Check if this is a new signup (onboarding not complete) or existing user login
      const isNewSignup = !hasCompletedOnboarding;

      if (
        permissionsAccepted &&
        locationCompleted &&
        (faceVerificationCompleted || faceVerificationSkipped || !isNewSignup)
      ) {
        // User has completed the flow OR this is an existing user login
        // Existing users skip face verification and go directly to homepage
        router.replace("/homepage");
      } else if (
        isNewSignup &&
        permissionsAccepted &&
        locationCompleted &&
        !faceVerificationCompleted &&
        !faceVerificationSkipped
      ) {
        // Only show face verification for NEW SIGNUPS, not for login
        // User completed location but hasn't completed face verification (new signup only)
        router.replace("/face-verification");
      } else if (permissionsAccepted && !locationCompleted) {
        // User accepted permissions but hasn't completed location
        router.replace("/location");
      } else {
        // User hasn't accepted permissions yet
        router.replace("/permissions");
      }
      return;
    }

    if (!isAuthenticated && isProtectedRoute) {
      router.replace("/login");
      return;
    }

    if (isAuthenticated && isProtectedRoute && isNewUserFlow) {
      setIsNewUserFlow(false);
    }
  }, [isLoading, user, pathname, router, isNewUserFlow]);

  // Hardware back button handler for Capacitor - prevents logout on back navigation
  useEffect(() => {
    let backButtonListener = null;

    // Check if we're in a Capacitor environment
    if (typeof window !== "undefined" && window.Capacitor && App) {
      try {
        backButtonListener = App.addListener('backButton', ({ canGoBack }) => {
          console.log('🔙 Hardware back button pressed', { canGoBack, pathname });
          
          // Always check authentication from localStorage first (most reliable)
          const storedToken = localStorage.getItem('authToken');
          const storedUser = localStorage.getItem('user');
          const isAuthenticated = !!storedToken && !!storedUser;
          
          if (!isAuthenticated) {
            // Not authenticated - allow default behavior (go to login)
            console.log('🔙 Not authenticated, allowing default back behavior');
            App.exitApp();
            return;
          }

          // User is authenticated - handle navigation safely
          const currentPath = window.location.pathname;
          const isHomepage = currentPath === '/homepage' || currentPath === '/';
          const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
            currentPath.startsWith(route)
          );

          // Check if we can go back in browser history
          const hasHistory = window.history.length > 1;
          
          if (hasHistory && !isHomepage) {
            // Has history and not on homepage - navigate back
            console.log('🔙 Navigating back in history');
            router.back();
          } else if (isHomepage) {
            // On homepage with no history or can't go back - exit app
            console.log('🔙 On homepage, exiting app');
            App.exitApp();
          } else if (isProtectedRoute) {
            // On protected route with no history - go to homepage instead of login
            console.log('🔙 On protected route with no history, navigating to homepage');
            router.push('/homepage');
          } else {
            // On public route - navigate to homepage
            console.log('🔙 On public route, navigating to homepage');
            router.push('/homepage');
          }
        });
        
        console.log('✅ Hardware back button listener registered');
      } catch (error) {
        console.warn('⚠️ Hardware back button listener not available:', error);
      }
    }

    return () => {
      if (backButtonListener) {
        try {
          if (backButtonListener.remove && typeof backButtonListener.remove === "function") {
            backButtonListener.remove();
            console.log('🧹 Hardware back button listener removed');
          } else if (backButtonListener.unsubscribe && typeof backButtonListener.unsubscribe === "function") {
            backButtonListener.unsubscribe();
            console.log('🧹 Hardware back button listener unsubscribed');
          }
        } catch (error) {
          console.warn("⚠️ Error cleaning up back button listener:", error);
        }
      }
    };
  }, [router, pathname]);

  // Prefetch Daily Rewards current week so data is ready on navigation
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const prefetchDailyRewards = async () => {
      try {
        const existing = localStorage.getItem("daily_rewards_current_week");
        if (existing) {
          try {
            const parsed = JSON.parse(existing);
            if (
              parsed?.cacheTime &&
              Date.now() - parsed.cacheTime < 5 * 60 * 1000
            ) {
              return; // Fresh cache exists
            }
          } catch (_) {}
        }

        // Use centralized API function instead of hardcoded URL
        const data = await getDailyRewardsWeek(null, token);
        if (data?.success && data?.data) {
          const cacheData = { data: data.data, cacheTime: Date.now() };
          localStorage.setItem(
            "daily_rewards_current_week",
            JSON.stringify(cacheData)
          );
        }
      } catch (_) {
        // ignore prefetch errors
      }
    };
    prefetchDailyRewards();
    return () => controller.abort();
  }, [token]);

  const handleAuthSuccess = (data) => {
    console.log("🔑 handleAuthSuccess called with:", data);
    const { token, user } = data;

    setUser(user);
    setToken(token); // Setting the token here triggers the Redux fetch effect above

    // IMPORTANT: Store user data in Redux profile immediately after login
    // This ensures age and gender are available immediately for game fetching
    // without waiting for the profile API call
    if (user && (user.age || user.ageRange || user.gender || user._id)) {
      console.log(
        "🔑 [AuthContext] Storing login user data in Redux profile:",
        {
          age: user.age,
          ageRange: user.ageRange,
          gender: user.gender,
          _id: user._id,
        }
      );
      dispatch({
        type: "profile/setUserFromLogin",
        payload: user,
      });
    }

    // Preload games data immediately after successful login
    if (user && user._id) {
      console.log("🎮 [AuthContext] Preloading games data after login");
      dispatch(
        fetchUserData({
          userId: user._id,
          token: token,
        })
      );
    }

    // Preload XP tier progress bar data immediately after successful login/signup
    // This pre-populates the cache so the homepage shows data instantly
    if (token) {
      console.log(
        "📊 [AuthContext] Preloading XP tier progress bar data after login/signup"
      );
      // Fetch in background without blocking - cache will be populated
      getXPTierProgressBar(token)
        .then((response) => {
          if (response.success && response.data) {
            // Cache the data immediately
            const CACHE_KEY = "xpTierProgressBar";
            const cacheData = {
              data: response.data,
              timestamp: Date.now(),
            };
            try {
              localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
              console.log(
                "✅ [AuthContext] XP tier progress bar data cached successfully"
              );
            } catch (err) {
              console.warn(
                "⚠️ [AuthContext] Failed to cache XP tier data:",
                err
              );
            }
          }
        })
        .catch((err) => {
          console.error(
            "❌ [AuthContext] Failed to preload XP tier data (non-blocking):",
            err
          );
          // Don't fail auth if this fails - it's just a preload
        });
    }

    try {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("authToken", token);
      localStorage.setItem("onboardingComplete", "true");
    } catch (err) {
      console.error("❌ Failed to save to localStorage", err);
    }
    return { ok: true, user };
  };

  const signIn = async (emailOrMobile, password, turnstileToken = null) => {
    try {
      const data = await login(emailOrMobile, password, turnstileToken);
      localStorage.setItem("permissionsAccepted", "true");
      // Purge persisted state to avoid showing previous account balances
      try {
        localStorage.removeItem("persist:root");
        localStorage.removeItem("persist:walletTransactions");
        localStorage.removeItem("persist:profile");
        localStorage.removeItem("persist:accountOverview");
      } catch (_) {}
      // Clear Redux slices proactively
      dispatch(clearWalletTransactions());
      dispatch(clearProfile());
      dispatch(clearAccountOverview());

      // Save credentials for biometric login (following capacitor-native-biometric documentation)
      // Only save if on native platform
      if (
        typeof window !== "undefined" &&
        window.Capacitor &&
        window.Capacitor.isNativePlatform()
      ) {
        try {
          const {
            setCredentials,
            enableBiometricLocally,
            checkBiometricAvailability,
          } = await import("@/lib/biometricAuth");

          // Check if biometric is available before saving
          const availability = await checkBiometricAvailability();
          if (availability.isAvailable) {
            // Save credentials securely using native biometric storage
            // Store username and a JSON string containing token and user data
            // This way we don't rely on localStorage for user data during biometric login
            const credentialPayload = {
              token: data.token,
              user: data.user,
            };

            console.log(
              "💾 [AuthContext] Attempting to save biometric credentials..."
            );
            console.log("💾 [AuthContext] Username:", emailOrMobile);
            console.log(
              "💾 [AuthContext] Token length:",
              data.token?.length || 0
            );
            console.log("💾 [AuthContext] User ID:", data.user?._id);

            const credentialResult = await setCredentials({
              username: emailOrMobile,
              password: JSON.stringify(credentialPayload), // Store token + user as JSON
            });

            if (credentialResult.success) {
              // Enable biometric locally
              enableBiometricLocally(availability.biometryTypeName);
              console.log(
                "✅ [AuthContext] Biometric credentials saved successfully"
              );
              console.log(
                "✅ [AuthContext] Biometric type:",
                availability.biometryTypeName
              );
            } else {
              console.warn(
                "⚠️ [AuthContext] Failed to save biometric credentials:",
                credentialResult.error
              );
              console.warn(
                "⚠️ [AuthContext] Error code:",
                credentialResult.errorCode
              );
            }
          }
        } catch (biometricError) {
          console.error(
            "❌ [AuthContext] Error setting up biometric:",
            biometricError
          );
          // Don't fail login if biometric setup fails
        }
      }

      return handleAuthSuccess(data);
    } catch (error) {
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  const signUpAndSignIn = async (signupData) => {
    try {
      const data = await signup(signupData);
      useOnboardingStore.getState().resetOnboarding();
      setIsNewUserFlow(true);

      // Clear permission/location flags for new signups so they go through the flow
      localStorage.removeItem("permissionsAccepted");
      localStorage.removeItem("locationCompleted");
      localStorage.removeItem("faceVerificationCompleted");
      localStorage.removeItem("faceVerificationSkipped");

      // DON'T save biometric credentials here for new users
      // New users will go through: Permissions → Location → Face Verification
      // Biometric credentials will be saved AFTER face verification is complete
      // This ensures proper onboarding flow

      return handleAuthSuccess(data);
    } catch (error) {
      return { ok: false, error: error.body || { error: error.message } };
    }
  };

  // MODIFIED: signOut clears the profile state in the Redux store but KEEPS biometric credentials
  // Biometric credentials are preserved so users can login with biometric after signout
  const signOut = async () => {
    console.log("🚪 signOut called. Clearing session...");
    dispatch(clearProfile()); // NEW: Dispatch action to reset the profile slice
    dispatch(clearGames()); // NEW: Clear games data when logging out
    dispatch(clearWalletTransactions());
    dispatch(clearAccountOverview());
    setUser(null);
    setToken(null);

    // DON'T delete biometric credentials on signout
    // This allows users to use biometric login after signout without needing to login manually first
    // Biometric credentials are stored in native secure storage and remain available
    console.log(
      "ℹ️ [AuthContext] Biometric credentials preserved for next login"
    );

    try {
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("onboarding-storage");
      localStorage.removeItem("persist:root");
      localStorage.removeItem("persist:walletTransactions");
      localStorage.removeItem("persist:profile");
      localStorage.removeItem("persist:accountOverview");

      // Don't clear permission/location flags on logout
      // Existing users should be able to login without re-doing permissions
      // Only new signups will clear these flags

      // Don't clear biometric flags (biometricEnabled, biometricType) on logout
      // Biometric credentials are preserved in native secure storage
      // This allows users to use biometric login after signout without manual login

      // Clear daily rewards data from localStorage
      // Remove all daily rewards cache entries
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("daily_rewards_")) {
          localStorage.removeItem(key);
        }
      });

      // Clear quest timer data from localStorage
      // Remove all quest timer cache entries
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("questTimer_")) {
          localStorage.removeItem(key);
        }
      });

      console.log("🧹 Cleared user + token from localStorage & Redux store");
    } catch (err) {
      console.error("❌ Failed to clear localStorage", err);
    }
    router.push("/login");
  };

  // MODIFIED: This function now leverages our Redux thunk for cleaner logic
  const handleSocialAuthCallback = async (socialToken) => {
    console.log("🔐 [AuthContext] handleSocialAuthCallback called:", {
      hasToken: !!socialToken,
      tokenLength: socialToken?.length || 0,
      tokenPreview: socialToken?.substring(0, 20) + "...",
    });

    setIsLoading(true);
    try {
      // Dispatch the thunk and await its completion
      console.log(
        "📡 [AuthContext] Fetching user profile with social token..."
      );
      const resultAction = await dispatch(fetchUserProfile(socialToken));

      // Check if the thunk was fulfilled (successful)
      if (fetchUserProfile.fulfilled.match(resultAction)) {
        const userProfile = resultAction.payload;
        console.log("✅ [AuthContext] User profile fetched successfully:", {
          userId: userProfile?.data?.user?._id || userProfile?.user?._id,
          email: userProfile?.data?.user?.email || userProfile?.user?.email,
        });
        return handleAuthSuccess({
          token: socialToken,
          user: userProfile.data?.user || userProfile.user || userProfile,
        });
      } else {
        // If the thunk was rejected, throw an error to be caught below
        const errorMessage =
          resultAction.payload || "Social auth profile fetch failed";
        console.error("❌ [AuthContext] Profile fetch rejected:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ [AuthContext] handleSocialAuthCallback failed:", {
        error: error.message,
        stack: error.stack,
        name: error.name,
      });
      // Don't sign out on error - let the callback page handle the error display
      return {
        ok: false,
        error: error.message || "Failed to authenticate. Please try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserInContext = (newUserData) => {
    setUser(newUserData);
    localStorage.setItem("user", JSON.stringify(newUserData));
  };

  const value = {
    user,
    token,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUpAndSignIn,
    signOut,
    updateUserInContext,
    handleSocialAuthCallback,
    refreshSession: handleAuthSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
