"use client";
import React from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchMostPlayedScreenGames } from "@/lib/redux/slice/gameSlice";
import { useAuth } from "@/contexts/AuthContext";
import { getAgeGroupFromProfile, getGenderFromProfile } from "@/lib/utils/ageGroupUtils";
import GameItemCard from "./GameItemCard";
import WatchAdCard from "./WatchAdCard";
// Note: This file uses fetchMostPlayedScreenGames, not fetchGamesBySection
// If fetchMostPlayedScreenGames also needs user object support, it should be updated separately

export const MostPlayedCategories = ({ searchQuery = "", showSearch = false }) => {
    // Redux state management
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();

    // Get data from Redux store - using dedicated Most Played Screen state
    const { mostPlayedScreenGames, mostPlayedScreenStatus, mostPlayedScreenError } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Fetch games from API for "Most Played Screen" section
    React.useEffect(() => {
        // Get dynamic age group and gender from user profile
        const ageGroup = getAgeGroupFromProfile(userProfile);
        const gender = getGenderFromProfile(userProfile);

        console.log('🎮 MostPlayedCategories: Using dynamic user profile:', {
            age: userProfile?.age,
            calculatedAgeGroup: ageGroup,
            calculatedGender: gender
        });

        // Only fetch if we don't have data and status is idle
        if (mostPlayedScreenStatus === "idle" && (!mostPlayedScreenGames || mostPlayedScreenGames.length === 0)) {
            dispatch(fetchMostPlayedScreenGames({
                ageGroup,
                gender,
                page: 1,
                limit: 50
            }));
        }
    }, [dispatch, mostPlayedScreenStatus, mostPlayedScreenGames, userProfile]);

    console.log("mostPlayedScreenGames", mostPlayedScreenGames)



    // Process games from API into the same format - using besitosRawData (same flow as other components)
    const processGames = (games) => {
        return games.map((game, index) => {
            // Use besitosRawData if available, otherwise fallback to existing structure
            const rawData = game.besitosRawData || {};

            // Clean game name - remove platform suffix after "-"
            const cleanGameName = (rawData.title || game.details?.name || game.name || game.title || "Game").split(' - ')[0].trim();

            // Get category from besitosRawData first, then fallback
            const category = rawData.categories?.[0]?.name || game.details?.category || "Game";

            // Calculate coins - use rewards.coins first (from API), then fallback to amount
            // Priority: rewards.coins > besitosRawData.amount > game.amount
            const coinAmount = game.rewards?.coins || rawData.amount || game.amount || 0;
            const amount = typeof coinAmount === 'number' ? coinAmount : (typeof coinAmount === 'string' ? parseFloat(coinAmount.replace('$', '')) || 0 : 0);

            // Calculate total XP with progressive multiplier (same as game details page and other components)
            // Task 1: baseXP × multiplier^0
            // Task 2: baseXP × multiplier^1
            // Task 3: baseXP × multiplier^2
            // ...
            // Total = sum of all task XPs
            let totalXP = 0;
            if (game.rewards?.xp) {
                // Use rewards.xp if available
                totalXP = game.rewards.xp;
            } else {
                // Calculate from xpRewardConfig with progressive multiplier
                const xpConfig = game.xpRewardConfig || { baseXP: 1, multiplier: 1 };
                const baseXP = xpConfig.baseXP || 1;
                const multiplier = xpConfig.multiplier || 1;

                // Get total number of tasks/goals
                const goals = rawData.goals || game.goals || [];
                const totalTasks = goals.length || 0;

                // Calculate total XP: sum of baseXP × multiplier^taskIndex for all tasks
                // This is a geometric series: baseXP × (multiplier^totalTasks - 1) / (multiplier - 1) when multiplier ≠ 1
                // When multiplier = 1, it's just baseXP × totalTasks
                if (multiplier === 1) {
                    // Simple case: all tasks have same XP
                    totalXP = baseXP * totalTasks;
                } else if (totalTasks > 0) {
                    // Geometric series: baseXP × (multiplier^totalTasks - 1) / (multiplier - 1)
                    totalXP = baseXP * (Math.pow(multiplier, totalTasks) - 1) / (multiplier - 1);
                }
            }

            return {
                id: game._id || game.id || game.gameId,
                name: cleanGameName,
                genre: category,
                // Use besitosRawData images first (highest priority)
                image: rawData.square_image || rawData.image || game.images?.banner || game.images?.large_image || game.details?.square_image || game.details?.image || "/placeholder-game.png",
                overlayImage: rawData.image || rawData.square_image || game.details?.image || game.details?.square_image,
                amount: amount, // Coins without $ sign
                xp: Math.floor(totalXP), // Total XP calculated with progressive multiplier
                coinIcon: "/dollor.png",
                picIcon: "/xp.svg",
                // Use besitosRawData large_image for background
                backgroundImage: rawData.large_image || rawData.image || game.images?.banner || game.details?.large_image || game.details?.image,
                // Use besitosRawData url for download
                downloadUrl: rawData.url || game.details?.downloadUrl,
                // Store full game data including besitosRawData
                fullData: game,
            };
        });
    };

    // Categorize games by earning amount
    const categorizeGamesByEarning = (games) => {
        const processedGames = processGames(games);

        // Sort games by earning amount (highest to lowest)
        const sortedGames = processedGames.sort((a, b) => {
            const amountA = parseFloat(a.amount) || 0;
            const amountB = parseFloat(b.amount) || 0;
            return amountB - amountA;
        });

        // Calculate threshold for categorization
        const totalGames = sortedGames.length;
        const highestEarningCount = Math.ceil(totalGames * 0.4); // Top 40% as highest earning
        const mediumEarningCount = Math.ceil(totalGames * 0.3); // Next 30% as medium earning

        const highestEarningGames = sortedGames.slice(0, highestEarningCount);
        const mediumEarningGames = sortedGames.slice(highestEarningCount, highestEarningCount + mediumEarningCount);

        return {
            highestEarning: highestEarningGames,
            mediumEarning: mediumEarningGames
        };
    };

    // Handle click on game - navigate to game details with full data
    // Matches the pattern used in Swipe, Highest Earning, TaskListSection, and other sections
    const handleGameClick = React.useCallback((game) => {
        if (!game || !game.fullData) {
            console.warn('🎮 MostPlayedCategories: Game or fullData is missing');
            return;
        }

        const fullGame = game.fullData;
        console.log('🎮 MostPlayedCategories: Navigating to game details for:', {
            title: fullGame.besitosRawData?.title || fullGame.details?.name || fullGame.title || fullGame.name,
            _id: fullGame._id,
            id: fullGame.id,
            gameId: fullGame.gameId,
            usingId: fullGame.id || fullGame._id || fullGame.gameId,
            hasBesitosRawData: !!fullGame.besitosRawData
        });

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Store full game data including besitosRawData in localStorage for details page
        // This matches the pattern used in Swipe, Highest Earning, TaskListSection, etc.
        try {
            localStorage.setItem('selectedGameData', JSON.stringify(fullGame));
            console.log('💾 [MostPlayedCategories] Stored full game data with besitosRawData:', {
                hasBesitosRawData: !!fullGame.besitosRawData,
                gameId: fullGame.id || fullGame._id || fullGame.gameId
            });
        } catch (error) {
            console.error('❌ Failed to store game data:', error);
        }

        // Use 'id' field first (as expected by API), fallback to '_id' or 'gameId'
        // Use gameId query parameter (not id) to match other sections
        const gameId = fullGame.id || fullGame._id || fullGame.gameId;
        router.push(`/gamedetails?gameId=${gameId}&source=mostPlayedScreen`);
    }, [router, dispatch]);

    const filterGamesBySearch = (games, query) => {
        if (!query || query.trim() === "") return games;
        const searchTerm = query.toLowerCase().trim();
        return games.filter(game =>
            game.name.toLowerCase().includes(searchTerm) ||
            game.genre.toLowerCase().includes(searchTerm)
        );
    };

    // Get categorized games
    const categorizedGames = React.useMemo(() => {
        if (mostPlayedScreenGames && mostPlayedScreenGames.length > 0) {
            return categorizeGamesByEarning(mostPlayedScreenGames);
        }
        return { highestEarning: [], mediumEarning: [] };
    }, [mostPlayedScreenGames]);

    // Apply search filters to both categories
    const filteredHighestEarning = filterGamesBySearch(categorizedGames.highestEarning, searchQuery);
    const filteredMediumEarning = filterGamesBySearch(categorizedGames.mediumEarning, searchQuery);

    return (
        <div className={`flex flex-col max-w-[335px] w-full mx-auto items-start gap-8 relative animate-fade-in ${showSearch ? 'top-[180px]' : 'top-[130px]'}`}>

            {/* ==================== HIGHEST EARNING GAMES SECTION ==================== */}
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-full items-start gap-[49px] relative flex-[0_0_auto]">
                    <div className="flex w-full items-center justify-between">
                        <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
                            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                                Highest Earning Games
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
                    {mostPlayedScreenStatus === "failed" ? (
                        <div className="text-red-400 text-center py-4 w-full">
                            <p>Failed to load games</p>
                            <button
                                onClick={() => {
                                    const ageGroup = getAgeGroupFromProfile(userProfile);
                                    const gender = getGenderFromProfile(userProfile);
                                    dispatch(fetchMostPlayedScreenGames({
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
                    ) : filteredHighestEarning.length > 0 ? (
                        filteredHighestEarning.map((game) => (
                            <GameItemCard
                                key={game.id}
                                game={game}
                                isEmpty={false}
                                onClick={() => handleGameClick(game)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full py-8 px-4">
                            <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-base text-center">
                                No games available at the moment
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* ==================== WATCH AD SECTION ==================== */}
            <WatchAdCard xpAmount={5} />

            {/* ==================== MEDIUM EARNING GAMES SECTION ==================== */}
            <div className="flex flex-col items-start gap-2.5 relative self-stretch w-full flex-[0_0_auto]">
                <div className="flex flex-col w-full items-start gap-[49px] relative flex-[0_0_auto]">
                    <div className="flex w-full items-center justify-between">
                        <div className="inline-flex items-center gap-0.5 relative flex-[0_0_auto]">
                            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                                Medium Earning Games
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full items-start gap-2.5 px-0 py-2.5 relative flex-[0_0_auto] overflow-y-scroll">
                    {mostPlayedScreenStatus === "failed" ? (
                        <div className="text-red-400 text-center py-4 w-full">
                            <p>Failed to load games</p>
                            <button
                                onClick={() => {
                                    const ageGroup = getAgeGroupFromProfile(userProfile);
                                    const gender = getGenderFromProfile(userProfile);
                                    dispatch(fetchMostPlayedScreenGames({
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
                    ) : filteredMediumEarning.length > 0 ? (
                        filteredMediumEarning.map((game) => (
                            <GameItemCard
                                key={game.id}
                                game={game}
                                isEmpty={false}
                                onClick={() => handleGameClick(game)}
                            />
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full py-8 px-4">
                            <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-base text-center">
                                No games available at the moment
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Extra spacing to ensure content isn't hidden behind navigation */}

        </div>
    );
};
