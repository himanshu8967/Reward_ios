"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly

const RecommendationCard = ({ card, onCardClick }) => {
    return (
        <article
            className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg cursor-pointer hover:scale-105 transition-all duration-200"
            onClick={() => onCardClick(card)}
        >
            <div className="relative w-full min-h-[158px] flex items-center justify-center bg-gray-800">
                <Image
                    className="object-contain w-full max-w-[158px]"
                    alt="Game promotion"
                    src={card.image || '/placeholder.png'}
                    width={158}
                    height={158}
                    sizes="158px"
                    priority
                    style={{
                        height: 'auto',
                        maxHeight: '158px'
                    }}
                />
            </div>
            <div className="flex flex-col h-[60px] p-2  bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)]">

                <div className="flex flex-col mt-auto">
                    <div className="flex items-center mb-1 gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">Earn upto {card.earnings || "100"}</p>
                        <Image
                            className="w-[18px] h-[19px]"
                            alt="Coin"
                            src="/dollor.png"
                            width={18}
                            height={19}
                            priority
                            unoptimized
                        />
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">and {card.xpPoints || "50"}</p>
                        <Image
                            className="w-[21px] h-[16px]"
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
};

export const TaskListSection = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    // Use new game discovery API for Cash Coach Recommendation section
    const { gamesBySection, gamesBySectionStatus } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Get the specific section data and status
    const sectionKey = "Cash Coach Recommendation";
    const sectionGames = gamesBySection?.[sectionKey] || [];
    const sectionStatus = gamesBySectionStatus?.[sectionKey] || "idle";

    // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
    useEffect(() => {
        // Validate userProfile - don't pass error objects
        const isValidUser = userProfile &&
            typeof userProfile === "object" &&
            !Array.isArray(userProfile) &&
            userProfile.success !== false && // Not an error response
            !userProfile.error && // Not an error object
            (userProfile.age !== undefined || userProfile.ageRange !== undefined || userProfile.gender !== undefined || userProfile._id !== undefined); // Has user properties

        console.log('🔍 [COMPONENT] TaskListSection - User Profile Debug:', {
            hasUserProfile: !!userProfile,
            isValidUser,
            userProfileType: typeof userProfile,
            userProfileIsNull: userProfile === null,
            userProfileIsUndefined: userProfile === undefined,
            isErrorObject: userProfile && userProfile.success === false,
            errorMessage: userProfile?.error,
            userProfileKeys: userProfile ? Object.keys(userProfile) : [],
            userProfileAge: userProfile?.age,
            userProfileAgeType: typeof userProfile?.age,
            userProfileAgeRange: userProfile?.ageRange,
            userProfileGender: userProfile?.gender,
            userProfileGenderType: typeof userProfile?.gender,
            fullUserProfile: userProfile,
            userProfileStringified: userProfile ? JSON.stringify(userProfile).substring(0, 300) : 'null/undefined'
        });

        // Only pass user object if it's valid, otherwise pass null to use defaults
        const userToPass = isValidUser ? userProfile : null;

        // Always dispatch - stale-while-revalidate will handle cache logic automatically
        // Pass user object directly - API will extract age and gender dynamically
        // This ensures:
        // 1. Shows cached data immediately if available (< 5 min old)
        // 2. Refreshes in background if cache is stale or 80% expired
        // 3. Fetches fresh if no cache exists
        console.log('🔍 [COMPONENT] TaskListSection - Dispatching fetchGamesBySection with:', {
            uiSection: sectionKey,
            user: userToPass,
            hasUser: !!userToPass,
            isValidUser,
            page: 1,
            limit: 10
        });

        dispatch(fetchGamesBySection({
            uiSection: sectionKey,
            user: userToPass, // Pass null if invalid, API will use defaults
            page: 1,
            limit: 10
        }));
    }, [dispatch, sectionKey, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [TaskListSection] Refreshing games in background to get admin updates...");
            dispatch(fetchGamesBySection({
                uiSection: sectionKey,
                user: userProfile,
                page: 1,
                limit: 10,
                force: true,
                background: true
            }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, sectionKey, userProfile]);

    // Refresh games in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!userProfile) return;

        const handleFocus = () => {
            console.log("🔄 [TaskListSection] App focused - refreshing games to get admin updates");
            dispatch(fetchGamesBySection({
                uiSection: sectionKey,
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
                console.log("🔄 [TaskListSection] App visible - refreshing games to get admin updates");
                dispatch(fetchGamesBySection({
                    uiSection: sectionKey,
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
    }, [dispatch, sectionKey, userProfile]);

    // Map the new API data to component format - using besitosRawData
    const recommendationCards = Array.isArray(sectionGames)
        ? sectionGames.map((game) => {
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
                id: game._id || game.id || game.gameId,
                title: rawData.title || game.details?.name || game.title,
                category: rawData.categories?.[0]?.name || game.details?.category || (typeof game.categories?.[0] === 'string' ? game.categories[0] : 'Action'),
                image: rawData.square_image || rawData.image || game.images?.icon || game.images?.banner,
                earnings: earnings, // Now shows coins without $ sign
                xpPoints: Math.floor(totalXP).toString(), // Total XP calculated with progressive multiplier
                fullGameData: game // Store full game including besitosRawData
            };
        })
        : [];

    // Handle game click - navigate to game details
    const handleGameClick = useCallback((game) => {
        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Store full game data including besitosRawData in localStorage
        const fullGame = game.fullGameData || game;
        if (fullGame) {
            try {
                localStorage.setItem('selectedGameData', JSON.stringify(fullGame));
                console.log('💾 [TaskListSection] Stored full game data with besitosRawData:', {
                    hasBesitosRawData: !!fullGame.besitosRawData,
                    gameId: game.id || game._id
                });
            } catch (error) {
                console.error('❌ Failed to store game data:', error);
            }
        }

        // Use 'id' field first (as expected by API), fallback to '_id'
        const gameId = game.id || game._id || game.gameId;
        router.push(`/gamedetails?gameId=${gameId}&source=cashCoach`);
    }, [router, dispatch]);


    // Show loading state only if games are loading AND we have no cached data
    // With stale-while-revalidate, we show cached data immediately, so loading only shows on first load
    if (sectionStatus === 'loading' && sectionGames.length === 0) {
        return (
            <section className="flex flex-col justify-center items-center gap-2 w-full min-w-0 max-w-full">
                <header>
                    <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                        💸💸Recommendations💸💸
                    </h2>
                </header>
                <div className="flex items-start justify-center gap-3 self-stretch flex-wrap min-w-0 max-w-full">
                    {[1, 2].map((i) => (
                        <div key={i} className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg animate-pulse">
                            <div className="w-full min-h-[158px] bg-gray-700"></div>
                            <div className="h-[71px] bg-gray-700"></div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <section className="flex flex-col justify-center items-center gap-2 w-full min-w-0 max-w-full">
            <header>
                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                    💸💸Recommendations💸💸
                </h2>
            </header>
            <div className="flex items-start justify-center gap-3 self-stretch flex-wrap min-w-0 max-w-full">
                {recommendationCards.length > 0 ? (
                    recommendationCards.map((card) => (
                        <RecommendationCard
                            key={card.id}
                            card={card}
                            onCardClick={handleGameClick}
                        />
                    ))
                ) : (
                    <div className="w-full flex flex-col items-center justify-center py-6 px-4">
                        <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg mb-2 text-center">
                            Gaming - Cash Coach Recommendation
                        </h3>
                        <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-sm text-center">
                            No games available
                        </p>
                    </div>
                )}
            </div>
        </section>
    );
};