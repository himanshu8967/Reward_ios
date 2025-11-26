"use client";
import React from "react";
import Image from "next/image";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { fetchMostPlayedScreenGames, fetchGameById } from "@/lib/redux/slice/gameSlice";
import { useAuth } from "@/contexts/AuthContext";
import GameItemCard from "./GameItemCard";
import WatchAdCard from "./WatchAdCard";
import { getAgeGroupFromProfile, getGenderFromProfile } from "@/lib/utils/ageGroupUtils";

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



    // Process games from API into the same format
    const processGames = (games) => {
        return games.map((game, index) => {
            // Clean game name - remove platform suffix after "-"
            const cleanGameName = (game.details?.name || game.name || game.title || "Game").split(' - ')[0].trim();

            return {
                id: game._id || game.id,
                name: cleanGameName,
                genre: game.details?.category || "Game",
                image: game.images?.banner || game.images?.large_image || game.details?.square_image || game.details?.image || "/placeholder-game.png",
                overlayImage: game.details?.image || game.details?.square_image,
                amount: game.rewards?.coins || game.amount || "50", // Use rewards from API
                xp: game.rewards?.xp || "100", // Use XP from API
                coinIcon: "/dollor.png",
                picIcon: "/xp.svg",
                backgroundImage: game.images?.banner || game.details?.large_image || game.details?.image,
                downloadUrl: game.details?.downloadUrl,
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
    const handleGameClick = async (game) => {
        if (game && game.fullData) {
            console.log('🎮 MostPlayedCategories: Game clicked:', {
                gameId: game.id,
                gameName: game.name,
                hasFullData: !!game.fullData
            });

            // Clear Redux state
            dispatch({ type: 'games/clearCurrentGameDetails' });

            try {
                // Fetch detailed game data with goals/levels using getGameById
                console.log('🎮 MostPlayedCategories: Fetching detailed game data for:', game.id);
                await dispatch(fetchGameById(game.id));

                // Navigate to game details page
                router.push(`/gamedetails?id=${game.id}`);
            } catch (error) {
                console.error('❌ MostPlayedCategories: Failed to fetch game details:', error);

                // Fallback: Store basic game data and navigate
                localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
                router.push(`/gamedetails?id=${game.id}`);
            }
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
                        <GameItemCard isEmpty={true} />
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
                        <GameItemCard isEmpty={true} />
                    )}
                </div>
            </div>

            {/* Extra spacing to ensure content isn't hidden behind navigation */}

        </div>
    );
};
