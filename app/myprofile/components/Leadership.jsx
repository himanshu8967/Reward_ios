import React, { useMemo, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useRouter } from 'next/navigation'
import { handleGameDownload } from '@/lib/gameDownloadUtils'
import { fetchGamesBySection } from '@/lib/redux/slice/gameSlice'
// Removed getAgeGroupFromProfile and getGenderFromProfile - now passing user object directly

const Leadership = () => {
    const router = useRouter();
    const dispatch = useDispatch();

    // Use new game discovery API for Leadership section
    const gamesBySection = useSelector((state) => state.games.gamesBySection)
    const gamesBySectionStatus = useSelector((state) => state.games.gamesBySectionStatus)
    const { details: userProfile } = useSelector((state) => state.profile)

    // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
    useEffect(() => {
        console.log('🎮 Leadership: Using user profile:', {
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
            uiSection: "Leadership",
            user: userProfile,
            page: 1,
            limit: 10
        }));
    }, [dispatch, userProfile]);

    // Refresh games in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!userProfile) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [Leadership] Refreshing games in background to get admin updates...");
            dispatch(fetchGamesBySection({
                uiSection: "Leadership",
                user: userProfile,
                page: 1,
                limit: 10,
                force: true,
                background: true
            }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, userProfile]);

    // Refresh games in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!userProfile) return;

        const handleFocus = () => {
            console.log("🔄 [Leadership] App focused - refreshing games to get admin updates");
            dispatch(fetchGamesBySection({
                uiSection: "Leadership",
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
                console.log("🔄 [Leadership] App visible - refreshing games to get admin updates");
                dispatch(fetchGamesBySection({
                    uiSection: "Leadership",
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
    }, [dispatch, userProfile]);

    // Memoize the leadership games from the new API
    const leadershipGames = useMemo(() => {
        const allGames = gamesBySection?.["Leadership"] || [];
        return allGames.slice(0, 2);
    }, [gamesBySection]);

    // Handle game click - navigate to game details
    const handleGameClick = (game) => {
        const rawData = game.besitosRawData || {};
        console.log('🎮 Leadership Games: Navigating to game details for:', rawData.title || game.details?.name || game.title || game.name);

        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Store full game data including besitosRawData in localStorage
        try {
            localStorage.setItem('selectedGameData', JSON.stringify(game));
            console.log('💾 [Leadership] Stored full game data with besitosRawData:', {
                hasBesitosRawData: !!game.besitosRawData,
                gameId: game.id || game._id
            });
        } catch (error) {
            console.error('❌ Failed to store game data:', error);
        }

        // Use 'id' field first (as expected by API), fallback to '_id'
        const gameId = game.id || game._id || game.gameId;
        router.push(`/gamedetails?gameId=${gameId}&source=leadership`);
    };

    // Show loading state if games are still loading
    if (gamesBySectionStatus?.["Leadership"] === 'loading') {
        return (
            <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto px-2 sm:px-0">
                <h3 className="font-semibold text-white text-base w-full mb-2">Leadership</h3>
                <div
                    className={`flex items-start sm:items-center gap-3 sm:gap-[15px] w-full overflow-x-auto pb-2 justify-center`}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {[1, 2].map((i) => (
                        <div key={i} className="relative flex-shrink-0 w-[160px] sm:w-40 h-auto min-h-[281px] animate-pulse">
                            <div className="w-full h-[185px] bg-gray-700 rounded-[16px]"></div>
                            <div className="mt-3 space-y-2">
                                <div className="w-24 h-4 bg-gray-700 rounded"></div>
                                <div className="w-full max-w-[140px] h-[37px] bg-gray-700 rounded-[10px]"></div>
                                <div className="flex gap-2">
                                    <div className="w-16 h-[29px] bg-gray-700 rounded-[10px]"></div>
                                    <div className="w-16 h-[29px] bg-gray-700 rounded-[10px]"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    // Show message if no games available
    if (leadershipGames.length === 0) {
        return (
            <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto">
                <h3 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg mb-2">
                    Gaming - Leadership
                </h3>
                <div className="flex items-center justify-center w-full h-32">
                    <p className="[font-family:'Poppins',Helvetica] font-normal text-gray-400 text-sm text-center">
                        No games available
                    </p>
                </div>
            </section>
        );
    }
    return (
        <section className="flex flex-col w-full max-w-[335px] items-start gap-2.5 mx-auto px-2 sm:px-0">
            {/* JACK_58: Ensure heading is present and styled */}
            <h3 className="font-semibold text-white text-base w-full">Leadership</h3>

            <div
                className={`flex items-start sm:items-center gap-3 sm:gap-[15px] w-full overflow-x-auto pb-2 ${leadershipGames.length === 1 ? 'justify-center' : leadershipGames.length === 2 ? 'justify-start sm:justify-center' : 'justify-start'
                    }`}
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {leadershipGames.map((game, index) => {
                    // Use besitosRawData if available
                    const rawData = game.besitosRawData || {};
                    const displayImage = rawData.square_image || rawData.image || game.images?.icon || game.icon || game.square_image || game.image || '/placeholder-game.png';
                    const displayTitle = rawData.title || game.details?.name || game.title || game.name || 'Game';

                    // Calculate coins and XP
                    const coinAmount = game.rewards?.coins || rawData.amount || game.amount || 0;
                    const coins = typeof coinAmount === 'number' ? coinAmount : (typeof coinAmount === 'string' ? parseFloat(coinAmount.replace('$', '').replace(/,/g, '')) || 0 : 0);

                    // Calculate total XP
                    let totalXP = 0;
                    if (game.rewards?.xp) {
                        totalXP = game.rewards.xp;
                    } else {
                        const xpConfig = game.xpRewardConfig || { baseXP: 1, multiplier: 1 };
                        const baseXP = xpConfig.baseXP || 1;
                        const multiplier = xpConfig.multiplier || 1;
                        const goals = rawData.goals || game.goals || [];
                        const totalTasks = goals.length || 0;

                        if (multiplier === 1) {
                            totalXP = baseXP * totalTasks;
                        } else if (totalTasks > 0) {
                            totalXP = baseXP * (Math.pow(multiplier, totalTasks) - 1) / (multiplier - 1);
                        }
                    }

                    // Format numbers with commas
                    const formatNumber = (num) => {
                        if (num === null || num === undefined) return "0";
                        const numValue = typeof num === 'string' ? parseFloat(num.replace(/,/g, '')) : num;
                        if (isNaN(numValue)) return "0";
                        return numValue.toLocaleString();
                    };

                    return (
                        <article
                            key={game._id || game.id || game.gameId || `game-${index}`}
                            className="relative flex-shrink-0 w-[160px] sm:w-40 h-auto min-h-[281px] cursor-pointer hover:scale-105 transition-all duration-200"
                            onClick={() => handleGameClick(game)}
                        >
                            <div
                                className="relative w-full h-[185px] bg-cover bg-center rounded-[16px] overflow-hidden"
                                style={{
                                    backgroundImage: `url(${displayImage})`,
                                }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>

                            <div className="flex flex-col w-full gap-2 mt-3">
                                <div className="flex flex-col gap-1.5 w-full">
                                    {/* Game Name - Match Highest Earning Games style */}
                                    <h4 className="[font-family:'Poppins',Helvetica] font-bold text-white text-sm sm:text-base leading-tight break-words w-full">
                                        {(() => {
                                            const title = displayTitle;
                                            // Remove "Android" text from the title
                                            return title
                                                .replace(/\s*Android\s*/gi, '') // Removes "Android"
                                                .replace(/-/g, ' ')             // Replaces all hyphens with a space
                                                .trim();
                                        })()}
                                    </h4>

                                    {/* Genre - Match Highest Earning Games style */}
                                    <h4 className="[font-family:'Poppins',Helvetica] mb-2 mt-[2px] font-light text-white text-[11px] sm:text-[12px] leading-tight break-words">
                                        ({rawData.categories?.[0]?.name || game.details?.category || (game.categories && game.categories.length > 0
                                            ? (typeof game.categories[0] === 'object' ? game.categories[0].name || 'Game' : game.categories[0])
                                            : 'Game')})
                                    </h4>

                                    {/* Stats - Match Highest Earning Games alignment and style */}
                                    <div className="flex gap-2 flex-wrap" role="list" aria-label="Game statistics">
                                        <div className="flex items-center justify-center min-w-fit h-[29px] px-2 rounded-[10px] bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] relative">
                                            <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-xs sm:text-sm leading-5 whitespace-nowrap">
                                                {formatNumber(coins)}
                                            </span>
                                            <img
                                                className="w-4 h-4 ml-1 flex-shrink-0"
                                                alt="Coin"
                                                src="https://c.animaapp.com/3btkjiTJ/img/image-3937@2x.png"
                                            />
                                        </div>
                                        <div className="flex items-center justify-center min-w-fit h-[29px] px-2 rounded-[10px] bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] relative">
                                            <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-xs sm:text-sm leading-5 whitespace-nowrap">
                                                {formatNumber(Math.floor(totalXP))}
                                            </span>
                                            <img
                                                className="w-4 h-4 ml-1 flex-shrink-0"
                                                alt="XP"
                                                src="https://c.animaapp.com/3btkjiTJ/img/pic.svg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    )
}

export default Leadership
