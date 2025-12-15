"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { handleGameDownload } from "@/lib/gameDownloadUtils";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly
const SCALE_CONFIG = [
    { minWidth: 0, scaleClass: "scale-90" },
    { minWidth: 320, scaleClass: "scale-90" },
    { minWidth: 375, scaleClass: "scale-100" },
    { minWidth: 480, scaleClass: "scale-125" },
    { minWidth: 640, scaleClass: "scale-120" },
    { minWidth: 768, scaleClass: "scale-150" },
    { minWidth: 1024, scaleClass: "scale-175" },
    { minWidth: 1280, scaleClass: "scale-200" },
    { minWidth: 1536, scaleClass: "scale-225" },
];
export const HighestEarningGame = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");

    // Use new game discovery API for Highest Earning section
    const { gamesBySection, gamesBySectionStatus } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Get data for "Highest Earning" section specifically
    const sectionName = "Highest Earning";
    const highestEarningGames = gamesBySection[sectionName] || [];
    const highestEarningStatus = gamesBySectionStatus[sectionName] || "idle";

    // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
    useEffect(() => {
        console.log('🎮 HighestEarningGame: Using user profile:', {
            age: userProfile?.age,
            ageRange: userProfile?.ageRange,
            gender: userProfile?.gender
        });

        // Always dispatch - stale-while-revalidate will handle cache logic automatically
        // Pass user object directly - API will extract age and gender dynamically
        // This ensures:
        // 1. Shows cached data immediately if available (< 5 min old)
        // 2. Refreshes in background if cache is stale or 80% expired
        // 3. Fetches fresh if no cache exists
        dispatch(fetchGamesBySection({
            uiSection: sectionName,
            user: userProfile,
            page: 1,
            limit: 10
        }));
    }, [dispatch, sectionName, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [HighestEarningGame] Refreshing games in background to get admin updates...");
            dispatch(fetchGamesBySection({
                uiSection: sectionName,
                user: userProfile,
                page: 1,
                limit: 10,
                force: true,
                background: true
            }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, sectionName, userProfile]);

    // Refresh games in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!userProfile) return;

        const handleFocus = () => {
            console.log("🔄 [HighestEarningGame] App focused - refreshing games to get admin updates");
            dispatch(fetchGamesBySection({
                uiSection: sectionName,
                user: userProfile,
                page: 1,
                limit: 10,
                force: true,
                background: true
            }));
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && userProfile) {
                console.log("🔄 [HighestEarningGame] App visible - refreshing games to get admin updates");
                dispatch(fetchGamesBySection({
                    uiSection: sectionName,
                    user: userProfile,
                    page: 1,
                    limit: 10,
                    force: true,
                    background: true
                }));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [dispatch, sectionName, userProfile]);

    // Map the new API data to component format - using besitosRawData
    const processedGames = highestEarningGames?.slice(0, 2).map((game) => {
        // Use besitosRawData if available
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
            id: game._id || game.id || game.gameId,
            title: rawData.title || game.details?.name || game.name || game.title || 'Game',
            category: rawData.categories?.[0]?.name || game.details?.category || (typeof game.categories?.[0] === 'string' ? game.categories[0] : 'Action'),
            image: rawData.square_image || rawData.image || game.images?.banner || game.images?.large_image || game.image || game.square_image,
            earnings: earnings, // Now shows coins without $ sign
            totalXP: Math.floor(totalXP), // Total XP calculated with progressive multiplier
            fullGameData: game // Store full game including besitosRawData
        };
    }) || [];

    // Handle game click - navigate to game details
    const handleGameClick = (game) => {
        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Store full game data including besitosRawData in localStorage
        const fullGame = game.fullGameData || game;
        if (fullGame) {
            try {
                localStorage.setItem('selectedGameData', JSON.stringify(fullGame));
                console.log('💾 [HighestEarningGame] Stored full game data with besitosRawData:', {
                    hasBesitosRawData: !!fullGame.besitosRawData,
                    gameId: game.id || game._id
                });
            } catch (error) {
                console.error('❌ Failed to store game data:', error);
            }
        }

        // Use the id from the API response for navigation
        const gameId = game.id || game._id || game.gameId;
        router.push(`/gamedetails?gameId=${gameId}&source=highestEarning`);
    };

    const getScaleClass = useCallback((width) => {
        for (let i = SCALE_CONFIG.length - 1; i >= 0; i--) {
            if (width >= SCALE_CONFIG[i].minWidth) {
                return SCALE_CONFIG[i].scaleClass;
            }
        }
        return "scale-100";
    }, []);

    useEffect(() => {
        const updateScale = () => {
            setCurrentScaleClass(getScaleClass(window.innerWidth));
        };
        updateScale();
    }, [getScaleClass]);

    // REMOVED: Loading state for better Android UX - show content immediately
    // Games will load in background without blocking UI
    return (
        <div
            className={`flex justify-between   items-center transition-transform p-4  duration-200 ease-in-out`}

        >
            <section className="flex flex-col w-full max-w-[335px] justify-center items-start gap-2.5 mx-auto ">
                <h3 className="font-semibold text-[#F4F3FC] text-[16px] opacity-[100%]">Highest Earning Games</h3>
                <div
                    className="flex items-center gap-[10px] w-full overflow-x-auto pb-0 scrollbar-hide"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    <div className="flex items-center gap-[10px]">
                        {processedGames.length > 0 ? processedGames.map((game) => (
                            <article key={game.id} className="relative w-[155px] min-h-[320px] flex-shrink-0 cursor-pointer hover:scale-105 transition-all duration-200" onClick={() => handleGameClick(game)}>
                                <div className="relative w-full h-[180px] rounded-[20px] overflow-hidden bg-gray-800">
                                    <img
                                        className="w-full h-full object-cover rounded-[20px]"
                                        src={game.image || game.square_image || '/placeholder-game.png'}
                                        alt={game.title || 'Game Image'}
                                    />
                                </div>

                                <div className="flex flex-col w-full gap-2 mt-3">
                                    <div className="flex flex-col gap-0.5">
                                        <h4 className="font-semibold text-[#FFFFFF] text-[16px] leading-tight">
                                            {String(game.title || 'Game').split(' - ')[0]}
                                        </h4>
                                        <div className="text-[#FFFFFF] font-normal text-[13px] opacity-80">{String(game.category || 'Action')}</div>

                                        <div
                                            className="relative w-full min-h-[60px] rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] p-2.5 flex flex-col gap-1"
                                            data-model-id="2255:6425"
                                            role="banner"
                                            aria-label="Earn rewards banner"
                                        >
                                            <div className="flex items-center  gap-1.5 flex-nowrap">
                                                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-normal whitespace-nowrap">
                                                    Earn upto
                                                </span>
                                                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-normal whitespace-nowrap">
                                                    {String(game.earnings || '0')}
                                                </span>
                                                <img
                                                    className="w-[16px] h-[16px] object-contain flex-shrink-0"
                                                    alt="Coin icon"
                                                    src="/dollor.png"
                                                />
                                            </div>

                                            <div className="flex items-center gap-1.5 flex-nowrap">
                                                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-normal whitespace-nowrap">
                                                    and
                                                </span>
                                                <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm tracking-[0] leading-normal whitespace-nowrap">
                                                    {String(game.totalXP || 0)}
                                                </span>
                                                <img
                                                    className="w-4 h-4 object-contain flex-shrink-0 -mt-0.5"
                                                    alt="XP points icon"
                                                    src="/xp.svg"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <div className="w-full flex flex-col items-center justify-center py-6 px-4">
                                <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg mb-2 text-center">
                                    Gaming - Highest Earning
                                </h3>
                                <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-sm text-center">
                                    No games available
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
