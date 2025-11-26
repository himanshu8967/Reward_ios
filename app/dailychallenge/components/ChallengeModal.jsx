import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import {
    selectGame,
    startTodayChallenge,
    completeTodayChallenge,
    fetchCalendar,
    fetchToday
} from "../../../lib/redux/slice/dailyChallengeSlice";

export const ChallengeModal = ({
    isOpen,
    onClose,
    today,
    onStartChallenge
}) => {
    const dispatch = useDispatch();
    const router = useRouter();
    const { user, token } = useAuth();
    const [countdown, setCountdown] = useState("");
    const [selectedGameId, setSelectedGameId] = useState(null);
    const [isSelecting, setIsSelecting] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [isCompleting, setIsCompleting] = useState(false);

    // Log modal state changes
    useEffect(() => {
        console.log("🔔 [CHALLENGE MODAL] Modal state changed:", {
            isOpen,
            hasChallenge: today?.hasChallenge,
            challengeTitle: today?.challenge?.title,
            challengeId: today?.challenge?.id,
            gameId: today?.challenge?.gameId,
            progressStatus: today?.progress?.status,
            selectedGame: today?.selectedGame,
            rewards: today?.rewards || (today?.challenge ? { coins: today.challenge.coinReward, xp: today.challenge.xpReward } : null),
            countdown: today?.countdown,
            actions: today?.actions,
            fullToday: today,
            timestamp: new Date().toISOString(),
        });
    }, [isOpen, today]);

    // Calculate countdown timer
    useEffect(() => {
        if (!today?.countdown) {
            setCountdown("");
            return;
        }

        const updateCountdown = () => {
            const now = new Date();
            let endTime = null;

            // Priority 1: Use endsAt (most accurate - absolute time)
            if (today.countdown.endsAt) {
                endTime = new Date(today.countdown.endsAt);
            }
            // Priority 2: Use timeRemaining (relative time from when data was fetched)
            else if (today.countdown.timeRemaining) {
                // Calculate end time from timeRemaining
                // Note: This is less accurate as it's based on when the data was fetched
                endTime = new Date(now.getTime() + today.countdown.timeRemaining);
            }
            // Priority 3: Fallback to formatted (static, won't update)
            else if (today.countdown.formatted) {
                setCountdown(today.countdown.formatted);
                return;
            }
            else {
                console.warn("🔔 [CHALLENGE MODAL] No valid countdown data available");
                setCountdown("");
                return;
            }

            // Calculate difference
            const diff = endTime - now;

            if (diff <= 0) {
                setCountdown("Challenge expired");
                return;
            }

            // Calculate hours, minutes, seconds
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            // Format and set countdown
            const formatted = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            setCountdown(formatted);
        };

        // Initial update
        updateCountdown();

        // Update every second for live countdown
        const interval = setInterval(updateCountdown, 1000);

        return () => clearInterval(interval);
    }, [today?.countdown]);

    if (!isOpen) return null;

    // Handle case when no challenge is available
    if (!today?.hasChallenge) {
        return (
            <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                onClick={onClose}
            >
                <div
                    className="bg-black/95 backdrop-blur-sm rounded-[12px] px-4 py-3 w-full max-w-sm shadow-2xl border border-gray-600/50 relative"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="text-center">
                        <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal mb-4">
                            No challenge available for today you can select the list of game by clicking below button
                        </div>
                        <button
                            onClick={() => {
                                router.push('/Race/ListGame');
                            }}
                            className="relative w-full h-12 rounded-[12.97px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] transition-transform duration-150 scale-100 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg border-2 border-white/20"
                            style={{
                                boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                                transform: 'translateZ(10px)',
                                transformStyle: 'preserve-3d'
                            }}
                        >
                            <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-[normal] whitespace-nowrap">
                                Select Game
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const handleSelectGame = async (gameId) => {
        console.log("🎮 [CHALLENGE MODAL] handleSelectGame called:", {
            gameId,
            hasToken: !!localStorage.getItem('authToken'),
            timestamp: new Date().toISOString(),
        });
        try {
            setIsSelecting(true);
            console.log("🎮 [CHALLENGE MODAL] Dispatching selectGame action");
            const result = await dispatch(selectGame({ gameId, token: localStorage.getItem('authToken') }));
            console.log("🎮 [CHALLENGE MODAL] selectGame result:", {
                type: result.type,
                payload: result.payload,
            });
            setSelectedGameId(gameId);
            console.log("🎮 [CHALLENGE MODAL] Game selected successfully:", gameId);
        } catch (error) {
            console.error("🎮 [CHALLENGE MODAL] Failed to select game:", {
                error: error.message,
                stack: error.stack,
                gameId,
            });
        } finally {
            setIsSelecting(false);
        }
    };

    const handleStartChallenge = async () => {
        console.log("🚀 [CHALLENGE MODAL] handleStartChallenge called:", {
            hasToken: !!localStorage.getItem('authToken'),
            today: today,
            timestamp: new Date().toISOString(),
        });
        try {
            setIsStarting(true);
            console.log("🚀 [CHALLENGE MODAL] Dispatching startTodayChallenge action");
            const result = await dispatch(startTodayChallenge({ token: localStorage.getItem('authToken') }));
            console.log("🚀 [CHALLENGE MODAL] startTodayChallenge result:", {
                type: result.type,
                payload: result.payload,
                game: result.payload?.game,
                deepLink: result.payload?.game?.deepLink,
            });

            // Check for deep link in game object
            let deepLink = result.payload?.game?.deepLink;
            if (deepLink) {
                // Append user ID to deep link for Besitos tracking
                if (user?._id || user?.id) {
                    const userId = user._id || user.id;
                    // Check if URL already has partner_user_id parameter
                    if (deepLink.includes('partner_user_id=')) {
                        // Append user ID to existing parameter
                        deepLink = deepLink + userId;
                    } else {
                        // Add partner_user_id parameter
                        const separator = deepLink.includes('?') ? '&' : '?';
                        deepLink = `${deepLink}${separator}partner_user_id=${userId}`;
                    }
                    console.log("🚀 [CHALLENGE MODAL] Added user ID to deep link:", {
                        userId,
                        finalUrl: deepLink
                    });
                }
                console.log("🚀 [CHALLENGE MODAL] Opening game deep link:", deepLink);
                // Open the game deep link
                window.open(deepLink, '_blank');
            } else {
                console.warn("🚀 [CHALLENGE MODAL] No deep link in response:", result.payload);
            }
            onStartChallenge();
        } catch (error) {
            console.error("🚀 [CHALLENGE MODAL] Failed to start challenge:", {
                error: error.message,
                stack: error.stack,
            });
        } finally {
            setIsStarting(false);
        }
    };

    const handleCompleteChallenge = async () => {
        console.log("✅ [CHALLENGE MODAL] handleCompleteChallenge called:", {
            conversionId: today?.conversionId,
            hasToken: !!token,
            today: today,
            timestamp: new Date().toISOString(),
        });
        try {
            setIsCompleting(true);
            console.log("✅ [CHALLENGE MODAL] Dispatching completeTodayChallenge action");
            const result = await dispatch(completeTodayChallenge({
                conversionId: today?.conversionId,
                token: token
            }));
            console.log("✅ [CHALLENGE MODAL] completeTodayChallenge result:", {
                type: result.type,
                payload: result.payload,
                rewards: result.payload?.rewards,
            });

            // Check if completion was successful
            if (result.type.includes('fulfilled')) {
                console.log("✅ [CHALLENGE MODAL] Challenge completed successfully, refreshing calendar and today's data");

                // Refresh calendar to show updated completion status
                const now = new Date();
                const year = now.getFullYear();
                const month = now.getMonth();
                await dispatch(fetchCalendar({ year, month, token }));

                // Refresh today's challenge to get updated status
                await dispatch(fetchToday({ token }));

                console.log("✅ [CHALLENGE MODAL] Calendar and today's data refreshed");
            }

            onClose();
            console.log("✅ [CHALLENGE MODAL] Modal closed");
        } catch (error) {
            console.error("✅ [CHALLENGE MODAL] Failed to complete challenge:", {
                error: error.message,
                stack: error.stack,
                conversionId: today?.conversionId,
            });
        } finally {
            setIsCompleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-lg p-6 w-full max-w-sm border border-gray-700">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-white">Today's Challenge</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                    >
                        ×
                    </button>
                </div>

                {/* Countdown Timer */}
                {countdown && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <div className="text-red-200 text-sm font-medium mb-1">Time Remaining</div>
                        <div className="text-red-100 text-lg font-bold font-mono">{countdown}</div>
                    </div>
                )}

                {/* Challenge Title and Description */}
                {today?.challenge && (
                    <div className="mb-4">
                        <div className="text-white text-lg font-bold mb-2">{today.challenge.title || 'Daily Challenge'}</div>
                        {today.challenge.description && (
                            <div className="text-gray-300 text-sm leading-relaxed">
                                {today.challenge.description}
                            </div>
                        )}
                        {today.challenge.instructions && (
                            <div className="text-gray-400 text-xs mt-2 italic">
                                {today.challenge.instructions}
                            </div>
                        )}
                    </div>
                )}

                {/* Game Selection */}
                {!today?.selectedGame && (
                    <div className="mb-4">
                        <div className="text-white text-sm font-medium mb-2">Select a Game:</div>
                        <div className="space-y-2">
                            {today?.availableGames?.map((game) => (
                                <button
                                    key={game.id}
                                    onClick={isSelecting ? undefined : () => handleSelectGame(game.id)}
                                    disabled={isSelecting}
                                    className={`w-full p-3 rounded-lg text-left transition-colors ${isSelecting ? 'bg-gray-700 cursor-not-allowed' : 'bg-gray-800 hover:bg-gray-700'}`}
                                >
                                    <div className="text-white font-medium">{game.name}</div>
                                    <div className="text-gray-400 text-sm">{game.description}</div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Selected Game */}
                {today?.selectedGame && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                        <div className="text-green-200 text-sm font-medium mb-1">Selected Game:</div>
                        <div className="text-green-100 font-medium">{today.selectedGame.name}</div>
                    </div>
                )}

                {/* Progress Status */}
                {today?.progress && (
                    <div className="mb-4">
                        <div className="text-white text-sm font-medium mb-2">Progress:</div>
                        <div className="text-gray-300 text-sm">
                            Status: <span className="capitalize">{today.progress.status}</span>
                        </div>
                        {today.progress.rewardsEarned && (
                            <div className="text-green-400 text-sm mt-1">
                                Rewards Earned: {today.progress.rewardsEarned.coins} coins, {today.progress.rewardsEarned.xp} XP
                            </div>
                        )}
                    </div>
                )}

                {/* Action Buttons - Using actions flags from API */}
                <div className="flex gap-3">
                    {today?.actions?.canClaimRewards ? (
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                        >
                            ✓ Challenge Completed!
                        </button>
                    ) : today?.actions?.canComplete ? (
                        <button
                            onClick={isCompleting ? undefined : handleCompleteChallenge}
                            disabled={isCompleting}
                            className={`flex-1 py-3 text-white rounded-lg font-medium transition-colors ${isCompleting ? 'bg-blue-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isCompleting ? 'Completing…' : 'Mark as Complete'}
                        </button>
                    ) : today?.actions?.canPlay ? (
                        <button
                            onClick={isStarting ? undefined : handleStartChallenge}
                            disabled={isStarting}
                            className={`flex-1 py-3 text-white rounded-lg font-medium transition-colors ${isStarting ? 'bg-purple-500 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}
                        >
                            {isStarting ? 'Opening…' : 'Play Now'}
                        </button>
                    ) : today?.actions?.canSelectGame ? (
                        <button
                            disabled
                            className="flex-1 py-3 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                            Select Game First
                        </button>
                    ) : (
                        <button
                            disabled
                            className="flex-1 py-3 bg-gray-600 text-gray-400 rounded-lg font-medium cursor-not-allowed"
                        >
                            Not Available
                        </button>
                    )}
                </div>

                {/* Rewards Info */}
                {(today?.rewards || today?.challenge) && (
                    <div className="mt-4 p-3 bg-yellow-500/20 border border-yellow-500/30 rounded-lg">
                        <div className="text-yellow-200 text-sm font-medium mb-1">Rewards:</div>
                        <div className="text-yellow-100 text-sm">
                            {today?.rewards?.coins || today?.challenge?.coinReward || 0} coins, {today?.rewards?.xp || today?.challenge?.xpReward || 0} XP
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
