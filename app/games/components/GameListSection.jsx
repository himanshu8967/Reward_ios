"use client";
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserData } from "@/lib/redux/slice/gameSlice";
import { safeLocalStorage } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import GameItemCard from "./GameItemCard";
import NonGamingOffersCarousel from "./NonGamingOffersCarousel";
import AccountOverviewCard from "./AccountOverviewCard";
import WatchAdCard from "./WatchAdCard";

// Static data for non-gaming offers carousel
const nonGamingOffers = [
  {
    id: 1,
    name: "Albert- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3982@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
    earnAmount: "Earn upto 100",
  },
  {
    id: 2,
    name: "Chime- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3980@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-73-1@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-1@2x.png",
    earnAmount: "Earn upto 100",
  },
  {
    id: 3,
    name: "Albert- Mobile Banking",
    image: "https://c.animaapp.com/xCaMzUYh/img/image-3982@2x.png",
    bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
    bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
    earnAmount: "Earn upto 100",
  },
];

// Use this custom hook to subscribe to Downloaded events (works in React Native WebView/Android too)
function useGameDownloadedRefetch(callback) {
  useEffect(() => {
    // In ANDROID or WebView, you should post a "game-downloaded" event after download.
    // For pure web fallback, listen to window event.
    // When download happens inside the app (e.g. download button), trigger window.dispatchEvent(new CustomEvent('game-downloaded'))
    function onGameDownloaded(e) {
      callback && callback(e);
    }

    window.addEventListener('game-downloaded', onGameDownloaded);

    // Listen for message events (for Android WebView):
    function onMessage(event) {
      if (
        typeof event.data === 'string' &&
        event.data.toLowerCase().includes('game-downloaded')
      ) {
        callback && callback({ type: "webview", data: event.data });
      }
    }
    window.addEventListener('message', onMessage);

    // In some Android web app glue code, you may have to listen for other bridge events.

    return () => {
      window.removeEventListener('game-downloaded', onGameDownloaded);
      window.removeEventListener('message', onMessage);
    }
  }, [callback]);
}


export const GameListSection = ({ searchQuery = "", showSearch = false }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = useAuth();

  // Redux
  const { inProgressGames, userDataStatus, error } = useSelector((state) => state.games);

  // Client-side only state to prevent hydration mismatches
  const [isClient, setIsClient] = useState(false);
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    setIsClient(true);
    setHasNavigated(true); // Mark that user has navigated to this page
  }, []);

  // Force data fetch on component mount - ALWAYS fetch when navigating to games page
  useEffect(() => {
    if (isClient && hasNavigated) {
      const userId = getUserId();
      if (userId) {
        console.log('🎮 [GameListSection] User navigated to games page, fetching fresh data immediately');
        // Always fetch fresh data when user navigates to games page
        dispatch(fetchUserData({ userId, token }));
      }
    }
  }, [isClient, hasNavigated, dispatch]);

  // Also fetch data when page becomes visible (focus)
  useEffect(() => {
    const handleFocus = () => {
      if (isClient) {
        const userId = getUserId();
        if (userId) {
          console.log('🎮 [GameListSection] Page focused, refreshing game data');
          dispatch(fetchUserData({ userId, token }));
        }
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [isClient, dispatch]);

  // Helper to get userId
  const getUserId = () => {
    try {
      const userData = safeLocalStorage.getItem('user');
      console.log('🔍 [GameListSection] getUserId - localStorage user data:', userData);

      if (userData) {
        const user = JSON.parse(userData);
        const userId = user._id || user.id;
        console.log('✅ [GameListSection] Found userId:', userId, 'from user object:', user);
        return userId;
      } else {
        console.warn('⚠️ [GameListSection] No user data found in localStorage');
      }
    } catch (error) {
      console.error('❌ [GameListSection] Error getting user ID from localStorage:', error);
    }
    return null;
  };

  // Track loading at download event
  const refreshingRef = useRef(false);

  // When component is mounted or userDataStatus changes (client-side only)
  useEffect(() => {
    // Only run on client side
    if (!isClient) {
      console.log('🔍 [GameListSection] useEffect - Not on client side yet, skipping data fetch');
      return;
    }

    const userId = getUserId();
    console.log('🎮 [GameListSection] useEffect triggered:', {
      userId,
      userDataStatus,
      hasUserId: !!userId,
      status: userDataStatus,
      gamesCount: inProgressGames?.length || 0
    });

    // ALWAYS fetch data when navigating to games page - ignore previous status
    if (userId) {
      console.log('🚀 [GameListSection] ALWAYS fetching data on navigation to games page');
      dispatch(fetchUserData({ userId, devicePlatform: "android" }));
    } else {
      console.warn('⚠️ [GameListSection] No userId found in localStorage');
    }
  }, [dispatch, isClient]);

  // Main fix: Listen to game download event - refetch without full refresh
  useGameDownloadedRefetch((event) => {
    console.log('🎮 [GameListSection] Game download event received:', event);
    const userId = getUserId();
    if (userId && userDataStatus !== 'loading') {
      console.log('🔄 [GameListSection] Refreshing game data due to download event...');
      refreshingRef.current = true;

      // Add retry logic for VPN connections
      const fetchWithRetry = async (retryCount = 0) => {
        try {
          await dispatch(fetchUserData({ userId, devicePlatform: "android" }));
        } catch (error) {
          if (retryCount < 3 && error.message.includes('timeout')) {
            console.log(`🔄 Retry ${retryCount + 1}/3 for VPN timeout...`);
            setTimeout(() => fetchWithRetry(retryCount + 1), 2000);
          } else {
            console.error('❌ Failed to refresh after retries:', error);
          }
        }
      };

      fetchWithRetry();
    }
  });

  // Auto hide manual loading indicator after update
  useEffect(() => {
    if (refreshingRef.current && userDataStatus !== "loading") {
      refreshingRef.current = false;
    }
  }, [userDataStatus]);

  // Debug logging for games data
  console.log('🎮 [GameListSection] Current state:', {
    inProgressGames: inProgressGames?.length || 0,
    userDataStatus,
    error,
    refreshingRef: refreshingRef.current
  });

  // Add retry mechanism for failed requests
  useEffect(() => {
    if (userDataStatus === "failed" && !refreshingRef.current) {
      console.log('🔄 [GameListSection] Data fetch failed, attempting retry...');
      const userId = getUserId();
      if (userId) {
        setTimeout(() => {
          console.log('🔄 [GameListSection] Retrying fetchUserData...');
          dispatch(fetchUserData({ userId, token }));
        }, 2000); // Retry after 2 seconds
      }
    }
  }, [userDataStatus, dispatch]);

  // Debug: Log the inProgressGames data
  console.log('🎮 [GameListSection] inProgressGames from Redux:', inProgressGames);
  console.log('🎮 [GameListSection] inProgressGames length:', inProgressGames?.length);

  // Re-map
  const downloadedGames = inProgressGames.map((game) => {
    const completedGoalsCount = game.goals?.filter(g => g.completed === true).length || 0;
    const totalGoals = game.goals?.length || 0;
    const earnedAmount = game.goals
      ?.filter(g => g.completed === true)
      .reduce((sum, goal) => sum + (goal.amount || 0), 0) || 0;
    const xpBonus = Math.floor(earnedAmount * 0.1);
    const category = game.categories?.[0]?.name || "Game";
    return {
      id: game.id,
      name: game.title,
      genre: category,
      subtitle: `${completedGoalsCount} of ${totalGoals} completed`,
      image: game.square_image || game.large_image || game.image,
      overlayImage: game.image || game.square_image,
      score: earnedAmount.toFixed(2),
      bonus: `+${xpBonus}`,
      coinIcon: "/dollor.png",
      picIcon: "/xp.svg",
      hasStatusDot: true,
      backgroundImage: game.large_image || game.image,
      isGradientBg: !game.square_image,
      fullData: game,
    };
  });

  // Navigation
  const handleDownloadedGameClick = (game) => {
    if (game && game.fullData) {
      // For downloaded games, we use localStorage (not API), so clear Redux state
      dispatch({ type: 'games/clearCurrentGameDetails' });

      // Store game data in localStorage for immediate access
      localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
      router.push(`/gamedetails?id=${game.id}`);
    }
  };

  // Search
  const filterGamesBySearch = (games, query) => {
    if (!query || query.trim() === "") return games;
    const searchTerm = query.toLowerCase().trim();
    return games.filter(game =>
      game.name.toLowerCase().includes(searchTerm) ||
      game.genre.toLowerCase().includes(searchTerm)
    );
  };

  const filteredDownloadedGames = filterGamesBySearch(downloadedGames, searchQuery);

  return (
    <div className={`flex flex-col w-full items-start gap-8 relative px-5 ${showSearch ? 'top-[180px]' : 'top-[96px]'}`}>
      {/* ==================== DOWNLOADED GAMES SECTION ==================== */}
      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto] max-w-sm mx-auto">
        <div className="flex flex-col w-full items-start gap-4 relative flex-[0_0_auto]">
          <div className="relative flex-[0_0_auto]">
            <div className="relative w-fit [font-family:'Poppins',Helvetica] font-medium text-[#4bba56] text-base tracking-[0] leading-[normal]">
              {downloadedGames.length > 0 ? "Downloaded" : "Downloaded Games"}
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
          {/* REMOVED: Loading state for better Android UX - show content immediately */}
          {userDataStatus === "failed" ? (
            <div className="text-red-400 text-center py-4 w-full">
              <p>Failed to load games</p>
              <p className="text-sm text-gray-400 mt-1">Check your internet connection</p>
              <button
                onClick={() => {
                  const userId = getUserId();
                  console.log('🔄 [GameListSection] Manual retry triggered for userId:', userId);
                  if (userId) {
                    dispatch(fetchUserData({ userId, token }));
                  } else {
                    console.error('❌ [GameListSection] Cannot retry - no userId found');
                  }
                }}
                className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
              >
                Retry
              </button>
            </div>
          ) : downloadedGames.length > 0 ? (
            filteredDownloadedGames.length > 0 ? (
              filteredDownloadedGames.map((game) => (
                <GameItemCard
                  key={game.id}
                  game={game}
                  isEmpty={false}
                  onClick={() => handleDownloadedGameClick(game)}
                />
              ))
            ) : (
              <div className="text-white text-md text-center py-4 w-full">
                No games found matching your search
              </div>
            )
          ) : (
            <div className="text-white text-center py-4 w-full">
              <GameItemCard isEmpty={true} />
              <p className="mt-4 text-sm text-gray-400">No games downloaded yet</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== ACCOUNT OVERVIEW SECTION ==================== */}
      <AccountOverviewCard />

      {/* ==================== WATCH AD SECTION ==================== */}
      <WatchAdCard xpAmount={5} />

      {/* ==================== NON-GAMING OFFERS CAROUSEL SECTION ==================== */}
      {/* <NonGamingOffersCarousel offers={nonGamingOffers} /> */}

      {/* Extra spacing to ensure content isn't hidden behind navigation */}
      <div className="h-[6px]"></div>
    </div>
  );
};