"use client";
import React from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchUserData, fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
import { useAuth } from "@/contexts/AuthContext";
import GameItemCard from "./GameItemCard";
import WatchAdCard from "./WatchAdCard";
import { getAgeGroupFromProfile, getGenderFromProfile } from "@/lib/utils/ageGroupUtils";

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


export const GameListSection = ({ searchQuery = "", showSearch = false }) => {
  // Redux state management
  const dispatch = useDispatch();
  const router = useRouter();
  const { token } = useAuth();

  // Get data from Redux store
  const { inProgressGames, userDataStatus, error, gamesBySection, gamesBySectionStatus } = useSelector((state) => state.games);
  const { details: userProfile } = useSelector((state) => state.profile);

  // Extract games from the "Most Played" section
  const mostPlayedGames = gamesBySection?.["Most Played"] || [];
  const mostPlayedStatus = gamesBySectionStatus?.["Most Played"] || "idle";



  // Check if we have featured games data from MostPlayedGames
  const [featuredGames, setFeaturedGames] = React.useState(null);
  const [isFromFeatured, setIsFromFeatured] = React.useState(false);

  // Load featured games data on component mount
  React.useEffect(() => {
    const featuredGamesData = localStorage.getItem('featuredGamesData');
    if (featuredGamesData) {
      try {
        const games = JSON.parse(featuredGamesData);
        setFeaturedGames(games);
        setIsFromFeatured(true);
      } catch (error) {
        console.error('Error parsing featured games data:', error);
      }
    }
  }, []);

  // Cleanup function to clear featured games data
  const clearFeaturedGames = () => {
    localStorage.removeItem('featuredGamesData');
    setFeaturedGames(null);
    setIsFromFeatured(false);
  };

  // Get user ID from localStorage
  const getUserId = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return user._id || user.id;
      }
    } catch (error) {
      console.error('Error getting user ID from localStorage:', error);
    }
    return null;
  };

  // Fetch games from new API for "Most Played" section
  React.useEffect(() => {
    // Get dynamic age group and gender from user profile
    const ageGroup = getAgeGroupFromProfile(userProfile);
    const gender = getGenderFromProfile(userProfile);

    console.log('🎮 GameListSection: Using dynamic user profile:', {
      age: userProfile?.age,
      calculatedAgeGroup: ageGroup,
      calculatedGender: gender
    });

    // Only fetch if we don't have data and status is idle
    if (mostPlayedStatus === "idle" && (!mostPlayedGames || mostPlayedGames.length === 0)) {
      dispatch(fetchGamesBySection({
        uiSection: "Most Played",
        ageGroup,
        gender,
        page: 1,
        limit: 50
      }));
    }
  }, [dispatch, mostPlayedStatus, mostPlayedGames, userProfile]);

  // Fetch user data from Redux when component mounts (lazy loading) - fallback
  React.useEffect(() => {
    const userId = getUserId();
    if (userId && userDataStatus === "idle" && mostPlayedStatus === "failed") {
      dispatch(fetchUserData({ userId, token }));
    }
  }, [dispatch, userDataStatus, mostPlayedStatus]);

  // Process games from new API into the same format
  const processNewApiGames = (games) => {
    return games.map((game, index) => {
      // Clean game name - remove platform suffix after "-"
      const cleanGameName = (game.details?.name || game.name || game.title || "Game").split(' - ')[0].trim();

      return {
        id: game._id || game.id,
        name: cleanGameName,
        genre: game.details?.category || "Game",
        subtitle: "Available to Download",
        image: game.images?.banner || game.images?.large_image || game.details?.square_image || game.details?.image || "/placeholder-game.png",
        overlayImage: game.details?.image || game.details?.square_image,
        amount: game.rewards?.coins || game.amount || "50", // Use rewards from new API
        score: game.rewards?.coins || game.amount || "50", // Also set score for backward compatibility
        bonus: game.rewards?.xp || "100", // Use XP from new API
        coinIcon: "/dollor.png",
        picIcon: "/xp.svg",
        hasStatusDot: false, // New API games don't have active status
        backgroundImage: game.images?.banner || game.details?.large_image || game.details?.image,
        isGradientBg: !game.details?.square_image,
        downloadUrl: game.details?.downloadUrl,
        fullData: game,
        isNewApi: true, // Mark as new API game
      };
    });
  };

  // Process featured games from MostPlayedGames into the same format
  const processFeaturedGames = (games) => {
    return games.map((game, index) => {
      // Clean game name - remove platform suffix after "-"
      const cleanGameName = (game.name || game.title || "Game").split(' - ')[0].trim();

      return {
        id: game.id,
        name: cleanGameName,
        genre: game.categories?.[0]?.name || "Game",
        subtitle: "Available to Download",
        image: game.square_image || game.image || "/placeholder-game.png",
        overlayImage: game.image || game.square_image,
        amount: game.amount || "0", // Use the amount field from game data
        score: game.amount || "0", // Also set score for backward compatibility
        bonus: "50", // Hardcoded XP as requested
        coinIcon: "/dollor.png",
        picIcon: "/xp.svg",
        hasStatusDot: false, // Featured games don't have active status
        backgroundImage: game.large_image || game.image,
        isGradientBg: !game.square_image,
        // Download URL from game data
        downloadUrl: game.downloadUrl || game.redirectUrl,
        // Store full game data for navigation
        fullData: game,
        isFeatured: true, // Mark as featured game
      };
    });
  };

  // Process in-progress games from Redux into downloadedGames format
  const downloadedGames = inProgressGames.map((game, index) => {
    // Calculate completed goals
    const completedGoalsCount = game.goals?.filter(g => g.completed === true).length || 0;
    const totalGoals = game.goals?.length || 0;

    // Calculate actual earnings from completed goals only
    const earnedAmount = game.goals
      ?.filter(g => g.completed === true)
      .reduce((sum, goal) => sum + (goal.amount || 0), 0) || 0;

    // Calculate XP bonus (10% of earned amount)
    const xpBonus = Math.floor(earnedAmount * 0.1);

    // Get game category
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
      hasStatusDot: true, // All in-progress games have active status
      backgroundImage: game.large_image || game.image,
      isGradientBg: !game.square_image, // Use gradient if no square image
      // Store full game data for navigation
      fullData: game,
    };
  });

  // Handle click on downloaded game - navigate to game details with full data
  const handleDownloadedGameClick = (game) => {
    if (game && game.fullData) {
      // For downloaded games, we use localStorage (not API), so clear Redux state
      dispatch({ type: 'games/clearCurrentGameDetails' });

      // Store game data in localStorage for immediate access
      localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
      router.push(`/gamedetails?id=${game.id}`);
    }
  };

  // Handle click on featured game - navigate to game details
  const handleFeaturedGameClick = (game) => {
    if (game && game.fullData) {
      // For featured games, we use localStorage (not API), so clear Redux state
      dispatch({ type: 'games/clearCurrentGameDetails' });

      // Store game data in localStorage for immediate access
      localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
      router.push(`/gamedetails?id=${game.id}`);
    }
  };

  const filterGamesBySearch = (games, query) => {
    if (!query || query.trim() === "") return games;
    const searchTerm = query.toLowerCase().trim();
    return games.filter(game =>
      game.name.toLowerCase().includes(searchTerm) ||
      game.genre.toLowerCase().includes(searchTerm)
    );
  };

  // Determine which games to show - prioritize new API, then featured, then downloaded
  const gamesToShow = React.useMemo(() => {
    // First priority: New API games
    if (mostPlayedGames && mostPlayedGames.length > 0) {
      return processNewApiGames(mostPlayedGames);
    }

    // Second priority: Featured games from MostPlayedGames
    if (isFromFeatured && featuredGames) {
      return processFeaturedGames(featuredGames);
    }

    // Fallback: Downloaded games
    return downloadedGames;
  }, [mostPlayedGames, isFromFeatured, featuredGames, downloadedGames]);

  // Apply search filters to games
  const filteredGames = filterGamesBySearch(gamesToShow, searchQuery);

  return (
    <div className={`flex flex-col max-w-[335px] w-full mx-auto items-start gap-8 relative animate-fade-in ${showSearch ? 'top-[180px]' : 'top-[130px]'}`}>
      {/* ==================== DOWNLOADED GAMES SECTION ==================== */}
      <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
        <div className="flex flex-col w-full items-start gap-[49px] relative flex-[0_0_auto]">
          <div className="flex w-full items-center justify-between">
            <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
              <Image
                className="relative w-5 h-5"
                alt="Badge check"
                src="https://c.animaapp.com/3mn7waJw/img/badgecheck.svg"
                width={20}
                height={20}
              />
              <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                {"Most Played Games"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
          {mostPlayedGames && mostPlayedGames.length > 0 ? (
            // Show new API games - REMOVED loading state for better Android UX
            mostPlayedStatus === "failed" ? (
              <div className="text-red-400 text-center py-4 w-full">
                <p>Failed to load games</p>
                  <button
                    onClick={() => {
                      const ageGroup = getAgeGroupFromProfile(userProfile);
                      const gender = getGenderFromProfile(userProfile);
                      dispatch(fetchGamesBySection({
                        uiSection: "Most Played",
                        ageGroup,
                        gender,
                        page: 1,
                        limit: 50
                      }));
                    }}
                    className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                  >
                    Retry
                  </button>
              </div>
            ) : filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <GameItemCard
                  key={game.id}
                  game={game}
                  isEmpty={false}
                  onClick={() => handleFeaturedGameClick(game)}
                />
              ))
            ) : (
              <GameItemCard isEmpty={true} />
            )
          ) : isFromFeatured ? (
            // Show featured games
            filteredGames.length > 0 ? (
              filteredGames.map((game) => (
                <GameItemCard
                  key={game.id}
                  game={game}
                  isEmpty={false}
                  onClick={() => handleFeaturedGameClick(game)}
                />
              ))
            ) : (
              <GameItemCard isEmpty={true} />
            )
          ) : (
            // Show downloaded games - REMOVED loading state for better Android UX
            userDataStatus === "failed" ? (
              <div className="text-red-400 text-center py-4 w-full">
                <p>Failed to load games</p>
                <button
                  onClick={() => {
                    const userId = getUserId();
                    if (userId) {
                      dispatch(fetchUserData({ userId, token }));
                    }
                  }}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                >
                  Retry
                </button>
              </div>
            ) : downloadedGames.length > 0 ? (
              filteredGames.map((game) => (
                <GameItemCard
                  key={game.id}
                  game={game}
                  isEmpty={false}
                  onClick={() => handleDownloadedGameClick(game)}
                />
              ))
            ) : (
              <GameItemCard isEmpty={true} />
            )
          )}
        </div>
      </div>







      {/* ==================== WATCH AD SECTION ==================== */}
      <WatchAdCard xpAmount={5} />

      {/* ==================== NON-GAMING OFFERS CAROUSEL SECTION ==================== */}
      {/* <NonGamingOffersCarousel offers={nonGamingOffers} /> */}

      {/* Extra spacing to ensure content isn't hidden behind navigation */}
      <div className="h-[6px]"></div>
    </div>
  );
};