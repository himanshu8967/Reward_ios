"use client";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly

const RecommendationCard = React.memo(({ card, onCardClick }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = useCallback(() => {
        setImageError(true);
    }, []);

    // Pre-compute image source for better performance - use API image
    const imageSrc = card.image || card.backgroundImage || '/game.png';

    return (
        <article
            className="flex flex-col w-[158px] rounded-xl overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onCardClick(card)}
        >
            <div className="relative w-full h-[158px] flex items-center justify-center bg-black/20 overflow-hidden">
                {!imageError ? (
                    <Image
                        className="object-cover w-full h-full"
                        alt={card.title || "Game promotion"}
                        src={imageSrc}
                        width={158}
                        height={158}
                        sizes="158px"
                        priority
                        onError={handleImageError}
                    />
                ) : (
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                        <div className="text-center text-white">
                            <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <p className="text-sm font-medium">{card.title || 'Game'}</p>
                        </div>
                    </div>
                )}
            </div>
            <div className="flex flex-col h-[60px] w-[158px] px-2 pt-2 pb-3 bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)] rounded-b-xl">

                <div className="flex flex-col mt-auto gap-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px] whitespace-nowrap">Earn upto {card.earnings || "100"}</p>
                        <Image
                            className="w-[18px] h-[19px] flex-shrink-0"
                            alt="Coin"
                            src="/dollor.png"
                            width={18}
                            height={19}
                            priority
                            unoptimized
                        />
                    </div>
                    <div className="flex items-center gap-1 min-w-0">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px] whitespace-nowrap">and {card.xpPoints || "50"}</p>
                        <Image
                            className="w-[21px] h-[16px] flex-shrink-0"
                            alt="Reward icon"
                            src="/xp.svg"
                            width={21}
                            height={16}
                            priority
                            unoptimized
                        />
                    </div>
                </div>
            </div>
        </article>
    );
});

export const ListGame = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dispatch = useDispatch();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");
    const [loadingTimeout, setLoadingTimeout] = useState(false);
    
    // Check if user came from race banner
    const fromRace = searchParams.get('fromRace') === 'true';

    // Use both API games and downloaded games
    const { gamesBySection, gamesBySectionStatus, inProgressGames, availableUiSections } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Get all games from ALL sections, not just "Swipe"
    const allSectionGames = useMemo(() => {
        const games = [];
        if (gamesBySection && typeof gamesBySection === 'object') {
            // Iterate through all sections and collect all games
            Object.keys(gamesBySection).forEach(sectionName => {
                const sectionGames = gamesBySection[sectionName];
                if (Array.isArray(sectionGames) && sectionGames.length > 0) {
                    games.push(...sectionGames);
                }
            });
        }
        return games;
    }, [gamesBySection]);

    // Check if we have any games loaded
    const hasAnyGames = allSectionGames.length > 0;
    const anySectionStatus = Object.values(gamesBySectionStatus || {}).some(status => status === 'loading');

    // Optimized: Pre-compute games data with both API games and downloaded games
    const recommendationCards = useMemo(() => {
        const allGames = [];

        // Add API games from ALL sections (not downloaded) - using besitosRawData
        if (allSectionGames && allSectionGames.length > 0) {
            // Use a Set to track unique game IDs to avoid duplicates
            const seenGameIds = new Set();
            const apiGames = allSectionGames
                .filter(game => {
                    const gameId = game.id || game._id || game.gameId;
                    if (!gameId || seenGameIds.has(gameId)) {
                        return false; // Skip duplicates
                    }
                    seenGameIds.add(gameId);
                    return true;
                })
                .map((game, index) => {
                    // Use besitosRawData if available, otherwise fallback to existing structure
                    const rawData = game.besitosRawData || {};

                    // Calculate coins - use rewards.coins first (from API), then fallback to amount
                    // Priority: rewards.coins > besitosRawData.amount > game.amount
                    const coinAmount = game.rewards?.coins || rawData.amount || game.amount || 0;
                    const earnings = typeof coinAmount === 'number' ? coinAmount.toString() : (typeof coinAmount === 'string' ? coinAmount.replace('$', '') : '0');

                    // Calculate total XP with progressive multiplier (same as game details page)
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
                        id: game.id || game._id || game.gameId || `api-game-${index}`,
                        originalId: game.id || game._id || game.gameId,
                        title: rawData.title || game.name || game.title || game.details?.name || 'Game',
                        category: rawData.categories?.[0]?.name || game.categories?.[0] || 'Action',
                        // Use besitosRawData images first
                        image: rawData.square_image || rawData.image || game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                        backgroundImage: rawData.large_image || rawData.image || game.image || game.square_image || game.background_image || game.icon || game.thumbnail || game.logo || game.banner,
                        earnings: earnings, // Real coins without $ sign
                        xpPoints: Math.floor(totalXP).toString(), // Real total XP calculated with progressive multiplier
                        isDownloaded: false,
                        source: 'api',
                        fullData: game // Store full game including besitosRawData
                    };
                });
            allGames.push(...apiGames);
        }

        // Add downloaded games
        if (inProgressGames && inProgressGames.length > 0) {
            const downloadedGames = inProgressGames.map((game, index) => {
                // Calculate coins - use rewards.coins first, then fallback to amount
                const coinAmount = game.rewards?.coins || game.amount || 0;
                const earnings = typeof coinAmount === 'number' ? coinAmount.toString() : (typeof coinAmount === 'string' ? coinAmount.replace('$', '') : '0');

                // Calculate total XP with progressive multiplier
                let totalXP = 0;
                if (game.rewards?.xp) {
                    totalXP = game.rewards.xp;
                } else {
                    const xpConfig = game.xpRewardConfig || { baseXP: 1, multiplier: 1 };
                    const baseXP = xpConfig.baseXP || 1;
                    const multiplier = xpConfig.multiplier || 1;
                    const goals = game.goals || [];
                    const totalTasks = goals.length || 0;

                    if (multiplier === 1) {
                        totalXP = baseXP * totalTasks;
                    } else if (totalTasks > 0) {
                        totalXP = baseXP * (Math.pow(multiplier, totalTasks) - 1) / (multiplier - 1);
                    }
                }

                return {
                    id: game.id || game._id || `downloaded-game-${index}`,
                    originalId: game.id || game._id,
                    title: game.title || game.name || 'Downloaded Game',
                    category: game.categories?.[0]?.name || 'Action',
                    image: game.square_image || game.large_image || game.image,
                    backgroundImage: game.large_image || game.image,
                    earnings: earnings, // Real coins without $ sign
                    xpPoints: Math.floor(totalXP).toString(), // Real total XP calculated with progressive multiplier
                    isDownloaded: true,
                    source: 'downloaded',
                    fullData: game // Store full game data for navigation
                };
            });
            allGames.push(...downloadedGames);
        }

        console.log('🎮 ListGame: Combined games:', {
            apiGames: allSectionGames?.length || 0,
            downloadedGames: inProgressGames?.length || 0,
            totalGames: allGames.length,
            sections: Object.keys(gamesBySection || {})
        });

        return allGames;
    }, [allSectionGames, inProgressGames, gamesBySection]);

    // Optimized: Memoized game click handler
    const handleGameClick = useCallback((game) => {
        console.log('🎮 ListGame: Game clicked:', {
            game,
            gameId: game.originalId,
            title: game.title || game.name || game.details?.name,
            isDownloaded: game.isDownloaded,
            source: game.source
        });

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Clear Redux state BEFORE navigation
        dispatch({ type: 'games/clearCurrentGameDetails' });

        if (game.isDownloaded && game.fullData) {
            // For downloaded games, use localStorage method
            console.log('🎮 ListGame: Navigating to downloaded game via localStorage');
            try {
                localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
            } catch (error) {
                console.error('❌ Failed to store game data:', error);
            }
            router.push(`/gamedetails?gameId=${game.originalId}&source=race`);
        } else {
            // For API games, store full data including besitosRawData
            if (game.fullData) {
                try {
                    localStorage.setItem('selectedGameData', JSON.stringify(game.fullData));
                    console.log('💾 [ListGame] Stored full game data with besitosRawData:', {
                        hasBesitosRawData: !!game.fullData.besitosRawData,
                        gameId: game.originalId
                    });
                } catch (error) {
                    console.error('❌ Failed to store game data:', error);
                }
            }

            const gameId = game.originalId || game.id;
            if (!gameId) {
                console.error('❌ ListGame: No game ID found:', game);
                return;
            }
            console.log('🎮 ListGame: Navigating to API game via gameId:', {
                gameId,
                hasBesitosRawData: !!game.fullData?.besitosRawData
            });
            router.push(`/gamedetails?gameId=${gameId}&source=race`);
        }
    }, [router, dispatch]);

    // Handle race button click
    const handleRaceButtonClick = useCallback(() => {
        router.push('/Race');
    }, [router]);



    // Reuse existing game data from homepage - no need to fetch again
    // The games are already loaded in the homepage GameCard component
    // This prevents duplicate API calls and improves performance

    // Fetch games from multiple sections if not already loaded
    useEffect(() => {
        if (!userProfile) return;

        // Use available sections from Redux if available, otherwise use common sections
        const sectionsToFetch = availableUiSections && availableUiSections.length > 0
            ? availableUiSections
            : ["Swipe", "Most Played", "Cash Coach Recommendation", "New Games", "Trending"];

        // Fetch games from sections that don't have games loaded yet
        sectionsToFetch.forEach(section => {
            const sectionGames = gamesBySection?.[section] || [];
            const sectionStatus = gamesBySectionStatus?.[section] || "idle";

            // Only fetch if section is idle and has no games
            if (sectionStatus === 'idle' && sectionGames.length === 0) {
                console.log(`[ListGame] Fetching games for section: ${section}`, {
                    age: userProfile?.age,
                    ageRange: userProfile?.ageRange,
                    gender: userProfile?.gender
                });

                dispatch(fetchGamesBySection({
                    uiSection: section,
                    user: userProfile,
                    page: 1,
                    limit: 50
                }));
            }
        });
    }, [dispatch, gamesBySection, gamesBySectionStatus, availableUiSections, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use available sections from Redux if available, otherwise use common sections
        const sectionsToRefresh = availableUiSections && availableUiSections.length > 0
            ? availableUiSections
            : ["Swipe", "Most Played", "Cash Coach Recommendation", "New Games", "Trending"];

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [ListGame] Refreshing games from all sections in background to get admin updates...");
            sectionsToRefresh.forEach(section => {
                dispatch(fetchGamesBySection({
                    uiSection: section,
                    user: userProfile,
                    page: 1,
                    limit: 50,
                    force: true,
                    background: true
                }));
            });
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, availableUiSections, userProfile]);

    // Refresh games in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!userProfile) return;

        // Use available sections from Redux if available, otherwise use common sections
        const sectionsToRefresh = availableUiSections && availableUiSections.length > 0
            ? availableUiSections
            : ["Swipe", "Most Played", "Cash Coach Recommendation", "New Games", "Trending"];

        const handleFocus = () => {
            console.log("🔄 [ListGame] App focused - refreshing games from all sections to get admin updates");
            sectionsToRefresh.forEach(section => {
                dispatch(fetchGamesBySection({
                    uiSection: section,
                    user: userProfile,
                    page: 1,
                    limit: 50,
                    force: true,
                    background: true
                }));
            });
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && userProfile) {
                console.log("🔄 [ListGame] App visible - refreshing games from all sections to get admin updates");
                sectionsToRefresh.forEach(section => {
                    dispatch(fetchGamesBySection({
                        uiSection: section,
                        user: userProfile,
                        page: 1,
                        limit: 50,
                        force: true,
                        background: true
                    }));
                });
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [dispatch, availableUiSections, userProfile]);

    // Loading timeout handling
    useEffect(() => {
        if (anySectionStatus) {
            const timeout = setTimeout(() => {
                setLoadingTimeout(true);
            }, 10000); // 10 second timeout

            return () => clearTimeout(timeout);
        } else {
            setLoadingTimeout(false);
        }
    }, [anySectionStatus]);

    // REMOVED: Enhanced loading state for better Android UX - show content immediately
    // Games will load in background without blocking UI

    // REMOVED: Error state handling for better Android UX - show content immediately
    // Users can still interact with the app even if games fail to load

    return (
        <section className="relative w-full min-h-screen bg-black max-w-sm mx-auto flex flex-col items-center">
            {/* App Version */}
            <div className="absolute top-[8px] left-8 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                App Version: V0.0.1
            </div>

            {/* Header */}
            <div className="flex flex-col w-full items-start gap-2 pl-7 pr-4 py-4 mt-[34px]">
                <div className="flex items-center gap-4 relative self-stretch w-full flex-[0_0_auto] rounded-[32px]">
                    <button
                        aria-label="Go back"
                        className="flex items-center justify-center w-6 h-6 flex-shrink-0"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <svg
                            className="w-6 h-6 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path
                                d="M15 18L9 12L15 6"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </button>

                    <h1 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Select Game
                    </h1>
                </div>
            </div>

            {/* Game Grid - Centered with proper spacing, scrollable to show all games */}
            <div className="w-full max-w-[335px] mx-auto px-4 mt-4 mb-12 pb-4">
                {recommendationCards.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {recommendationCards.map((card) => (
                            <div key={card.id} className="flex flex-col">
                                <RecommendationCard
                                    card={card}
                                    onCardClick={handleGameClick}
                                    showRaceButton={fromRace}
                                    onRaceClick={handleRaceButtonClick}
                                />
                                {fromRace && (
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRaceButtonClick();
                                        }}
                                        className="w-full h-10 mt-2 rounded-xl overflow-hidden bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)] flex items-center justify-center hover:opacity-90 transition-opacity duration-200 shadow-lg"
                                    >
                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px] tracking-[0] leading-normal">
                                            Race
                                        </span>
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                        <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-base text-center">
                            No game available at this moment
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};