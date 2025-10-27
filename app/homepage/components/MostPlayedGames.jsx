"use client";
import React, { useEffect, useMemo, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";

const MostPlayedGames = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const {
        gamesBySection,
        gamesBySectionStatus,
        error
    } = useSelector((state) => state.games);

    // Get data for "Most Played" section specifically
    const sectionName = "Most Played";
    const mostPlayedGames = gamesBySection[sectionName] || [];
    const mostPlayedStatus = gamesBySectionStatus[sectionName] || "idle";

    const { details: userProfile } = useSelector((state) => state.profile);

    // OPTIMIZED: Use section-specific games data
    const allGames = useMemo(() => {
        return mostPlayedGames;
    }, [mostPlayedGames]);

    // OPTIMIZED: Simplified image processing for faster rendering
    const filteredGames = useMemo(() => {
        return allGames.map(game => ({
            ...game,
            // Simplified image selection for faster processing
            optimizedImage: game.details?.square_image
        }));
    }, [allGames]);

    // OPTIMIZED: Reduced image preloading for faster initial render
    useEffect(() => {
        if (filteredGames.length > 0) {
            // Only preload first game for immediate display
            const firstGame = filteredGames[0];
            if (firstGame?.optimizedImage && firstGame.optimizedImage !== "/placeholder-game.png") {
                const img = new Image();
                img.src = firstGame.optimizedImage;
            }
        }
    }, [filteredGames]);

    // Memoize game click handler to prevent recreation on every render
    const handleGameClick = useCallback((game) => {
        console.log('🎮 MostPlayedGames: Navigating to game details for:', {
            title: game.details?.name || game.title || game.name,
            _id: game._id,
            id: game.id,
            usingId: game.id || game._id
        });

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Use 'id' field first (as expected by API), fallback to '_id'
        const gameId = game.id || game._id;
        router.push(`/gamedetails?gameId=${gameId}&source=mostPlayed`);
    }, [router, dispatch]);

    // OPTIMIZED: Smart fetch - only fetch if no data exists for this specific section
    useEffect(() => {
        const ageGroup = userProfile?.ageRange || "18-24";
        const gender = userProfile?.gender || "male";

        // Only fetch if we don't have data for "Most Played" section and not currently loading
        if (mostPlayedStatus === "idle" && mostPlayedGames.length === 0) {
            console.log("🎮 OPTIMIZED: Fetching Most Played games (no cached data for this section)");

            const apiParams = {
                uiSection: sectionName,
                ageGroup,
                gender,
                page: 1,
                limit: 10 // Reduced limit for faster loading
            };

            dispatch(fetchGamesBySection(apiParams));
        } else {
            console.log("🎮 OPTIMIZED: Using cached Most Played games:", mostPlayedGames.length);
        }
    }, [dispatch, mostPlayedStatus, mostPlayedGames, sectionName]); // Smart dependencies

    // OPTIMIZED: Memoize localStorage operations to prevent unnecessary writes
    const handleStoreGamesData = useCallback((games) => {
        try {
            localStorage.setItem('featuredGamesData', JSON.stringify(games));
        } catch (error) {
            console.warn('Failed to store games data:', error);
        }
    }, []);


    return (
        <div className="flex flex-col items-start gap-4 relative w-full animate-fade-in">
            <div className="flex w-full items-center justify-between">
                <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                    Most Played Games
                </div>
                <Link
                    href="/DownloadGame"
                    className="[font-family:'Poppins',Helvetica] font-medium text-[#8b92de] text-base tracking-[0] leading-[normal] hover:text-[#9ba0e8] transition-colors duration-200"
                    onClick={() => handleStoreGamesData(filteredGames.slice(0, 1))}
                >
                    See All
                </Link>
            </div>
            <div className="flex h-[110px] items-start gap-1 w-full justify-start">
                {filteredGames.length > 0 ? (
                    filteredGames.map((game, index) => {
                        return (
                            <div
                                key={game._id || game.id}
                                className="items-start inline-flex flex-col gap-1.5 relative flex-[0_0_auto] w-[80px] cursor-pointer hover:scale-105 transition-all duration-200"
                                onClick={() => handleGameClick(game)}
                            >
                                <div
                                    className="relative w-[72px] h-[72px] rounded-full bg-gradient-to-br from-[#983EFF] to-[#FFB700] p-[2.5px]"
                                    style={{
                                        boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3), 0 0 8px #983EFF40`,
                                    }}
                                >
                                    <div className="w-full h-full rounded-full bg-black p-[1.8px]">
                                        <img
                                            className="w-full h-full object-cover rounded-full"
                                            alt={game.details?.name}
                                            src={game.optimizedImage}
                                            loading="lazy"
                                            decoding="async"
                                            onError={(e) => {
                                                e.target.src = "/placeholder-game.png";
                                            }}
                                        />
                                    </div>
                                </div>
                                <div className="relative w-[72px] [font-family:'Poppins',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                                    {(game.details?.name).split(' - ')[0]}
                                </div>

                                {/* New tag - only for first game */}
                                {/* {index < 1 && (
                                    <div className="absolute w-11 h-4 top-[59px] left-3.5 rounded overflow-hidden bg-[linear-gradient(90deg,rgba(34,197,94,1)_0%,rgba(16,185,129,1)_100%)]">
                                        <div className="absolute w-[33px] -top-px left-[5px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xs text-center tracking-[0] leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                                            New
                                        </div>
                                    </div>
                                )} */}
                            </div>
                        );
                    })
                ) : (
                    // OPTIMIZED: Show placeholder content immediately while data loads
                    [1, 2, 3, 4].map((i) => (
                        <div key={`placeholder-${i}`} className="items-start inline-flex flex-col gap-1.5 relative flex-[0_0_auto] w-[80px]">
                            <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
                                <div className="w-full h-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                                    <span className="text-gray-400 text-xs">🎮</span>
                                </div>
                            </div>
                            <div className="relative w-[72px] [font-family:'Poppins',Helvetica] font-medium text-gray-400 text-xs text-center tracking-[0] leading-4">
                                Loading...
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MostPlayedGames;