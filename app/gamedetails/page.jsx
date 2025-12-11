
"use client";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";

// Component imports
import { DailyChallenge } from "./dailychallange";
import { ActionButtonSection } from "./components/ActionButtonSection";
import { InstructionsTextSection } from "./components/InstructionsTextSection";
import { LevelsSection } from "./components/LevelsSection";
import { Coin } from "./components/coin";
import { Breakdown } from "./components/Breakdown";
import { HomeIndicator } from "@/components/HomeIndicator";
import { SessionStatus } from "./components/SessionStatus";
import { LoadingOverlay } from "@/components/AndroidOptimizedLoader";

// Optimized Image Component for Android - using besitosRawData
const OptimizedGameImage = ({ game, isLoaded, onLoad, onError, className }) => {
    // Use besitosRawData images first (highest priority)
    const rawData = game?.besitosRawData || {};
    const imageUrl = rawData.square_image || rawData.image || rawData.large_image ||
        game?.square_image || game?.image || game?.images?.banner || game?.images?.large_image;

    const displayTitle = rawData.title || game?.title || game?.name || game?.details?.name;

    if (!imageUrl) return null;

    return (
        <img
            className={`w-[335px] h-[164px] object-cover rounded-lg transition-opacity duration-300 game-image image-fade-in ${className || ''}`}
            alt={`${displayTitle} banner`}
            src={imageUrl}
            onLoad={onLoad}
            onError={onError}
            style={{
                opacity: isLoaded ? 1 : 0
            }}
            loading="eager" // Load immediately for better UX
            decoding="async" // Decode asynchronously for better performance
        />
    );
};

// Utility imports
import { handleGameDownload, getUserId } from "@/lib/gameDownloadUtils";
import sessionManager from "@/lib/sessionManager";
import { fetchGameById, fetchUserData } from "@/lib/redux/slice/gameSlice";
import { fetchWalletTransactions, fetchFullWalletTransactions } from "@/lib/redux/slice/walletTransactionsSlice";

/**
 * Game Details Page - Main content component
 * Displays comprehensive game information, progress tracking, and reward management
 */
function GameDetailsContent() {
    // Navigation and routing
    const router = useRouter();
    const dispatch = useDispatch();
    const searchParams = useSearchParams();
    const gameId = searchParams.get('gameId') || searchParams.get('id');

    // Redux state management
    const {
        offers,
        offersStatus,
        currentGameDetails,
        gameDetailsStatus,
        inProgressGames,
        userData,
        userDataStatus
    } = useSelector((state) => state.games);

    // Component state
    const [selectedGame, setSelectedGame] = useState(null);
    const [loadedFromLocalStorage, setLoadedFromLocalStorage] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true); // Track initial loading state

    // Debug Redux state
    console.log('🎮 GameDetails: Redux state:', {
        gameDetailsStatus,
        hasCurrentGameDetails: !!currentGameDetails,
        gameId,
        selectedGame: !!selectedGame
    });
    // Capitalize tier name (junior -> Junior, senior -> Senior, mid -> Mid)
    const capitalizeTier = (tier) => {
        if (!tier) return 'Junior';
        return tier.charAt(0).toUpperCase() + tier.slice(1);
    };

    // Initialize selectedTier - will be updated when displayGame or userData is available
    const [selectedTier, setSelectedTier] = useState('Junior');
    const [isGameInstalled, setIsGameInstalled] = useState(false);
    const [sessionData, setSessionData] = useState({
        sessionCoins: 0,
        sessionXP: 0,
        isClaimed: false,
        isGameDownloaded: false,
        isMilestoneReached: false // Track actual milestone status
    });
    const [currentSession, setCurrentSession] = useState(null);
    const [isDataLoaded, setIsDataLoaded] = useState(false);
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);


    // Load game data - handle both downloaded games (localStorage) and API games
    useEffect(() => {
        const loadGameData = async () => {
            console.log('🎮 GameDetails: Starting to load game data:', {
                gameId,
                hasLocalStorageData: !!localStorage.getItem('selectedGameData')
            });

            // Priority 1: Check localStorage for downloaded games (from "My Games" section)
            const storedGameData = localStorage.getItem('selectedGameData');
            if (storedGameData) {
                try {
                    const parsedGame = JSON.parse(storedGameData);
                    console.log('🎮 GameDetails: Loading downloaded game from localStorage:', {
                        gameId: parsedGame.id || parsedGame._id,
                        title: parsedGame.title || parsedGame.name || parsedGame.details?.name
                    });

                    setSelectedGame(parsedGame);
                    setLoadedFromLocalStorage(true);
                    setIsDataLoaded(true);
                    setIsInitialLoading(false); // Stop initial loading
                    await initializeSession(parsedGame);

                    // Ensure userData is loaded for userXpTier (for downloaded games)
                    // userData contains userXpTier from getUserData API
                    if (!userData || userDataStatus === 'idle') {
                        const userId = getUserId();
                        const token = localStorage.getItem('authToken');
                        if (userId && token) {
                            console.log('🔄 [GameDetails] Fetching userData for userXpTier...');
                            dispatch(fetchUserData({ userId, token }));
                        }
                    }

                    // Clean up localStorage after loading
                    localStorage.removeItem('selectedGameData');
                    return;
                } catch (error) {
                    console.error('❌ Error parsing localStorage game data:', error);
                    localStorage.removeItem('selectedGameData');
                }
            }

            // Priority 2: Fetch from API if no localStorage data
            // Uses stale-while-revalidate: shows cached data immediately, fetches fresh if needed
            if (gameId && !loadedFromLocalStorage) {
                console.log('🎮 GameDetails: Fetching game from API (stale-while-revalidate):', { gameId });
                // Don't clear Redux state - stale-while-revalidate will handle cache
                // This ensures cached data shows immediately if available
                dispatch(fetchGameById({ gameId }));
            } else if (!gameId) {
                // No gameId provided, stop loading
                setIsInitialLoading(false);
            }
        };

        loadGameData();
    }, [dispatch, gameId]);

    // Refresh game details in background after showing cached data (to get admin updates)
    // Do this in background without blocking UI - show cached data immediately
    useEffect(() => {
        if (!gameId || loadedFromLocalStorage) return;

        // Use setTimeout to refresh in background after showing cached data
        // This ensures smooth UX - cached data shows immediately, fresh data loads in background
        const refreshTimer = setTimeout(() => {
            console.log("🔄 [GameDetails] Refreshing game details in background to get admin updates...");
            dispatch(fetchGameById({ gameId, force: true, background: true }));
        }, 100); // Small delay to let cached data render first

        return () => clearTimeout(refreshTimer);
    }, [dispatch, gameId, loadedFromLocalStorage]);

    // Refresh game details in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!gameId || loadedFromLocalStorage) return;

        const handleFocus = () => {
            console.log("🔄 [GameDetails] App focused - refreshing game details to get admin updates");
            dispatch(fetchGameById({ gameId, force: true, background: true }));
        };

        window.addEventListener("focus", handleFocus);

        const handleVisibilityChange = () => {
            if (!document.hidden && gameId && !loadedFromLocalStorage) {
                console.log("🔄 [GameDetails] App visible - refreshing game details to get admin updates");
                dispatch(fetchGameById({ gameId, force: true, background: true }));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [dispatch, gameId, loadedFromLocalStorage]);

    // Handle game details from new API
    useEffect(() => {
        console.log('🎮 GameDetails: API response handler triggered:', {
            hasCurrentGameDetails: !!currentGameDetails,
            gameDetailsStatus,
            gameId,
            currentGameDetails: currentGameDetails ? {
                id: currentGameDetails.id || currentGameDetails._id,
                title: currentGameDetails.title || currentGameDetails.name || currentGameDetails.details?.name
            } : null
        });

        if (currentGameDetails && gameDetailsStatus === 'succeeded') {
            // Get the fetched game ID (check multiple possible fields including nested gameDetails)
            const fetchedGameId = currentGameDetails.id || currentGameDetails._id || currentGameDetails.gameId || currentGameDetails.gameDetails?.id;
            // Check if the fetched game matches the requested gameId
            // Check all possible ID fields: _id, id, gameId, and nested gameDetails.id
            const isCorrectGame = gameId && (
                fetchedGameId === gameId ||
                fetchedGameId?.toString() === gameId?.toString() ||
                currentGameDetails.gameId === gameId ||
                currentGameDetails.gameId?.toString() === gameId?.toString() ||
                currentGameDetails._id === gameId ||
                currentGameDetails._id?.toString() === gameId?.toString() ||
                currentGameDetails.gameDetails?.id === gameId ||
                currentGameDetails.gameDetails?.id?.toString() === gameId?.toString()
            );

            console.log('🎮 Game details loaded from API:', {
                fetchedGameId,
                _id: currentGameDetails._id,
                gameId: currentGameDetails.gameId,
                gameDetailsId: currentGameDetails.gameDetails?.id,
                title: currentGameDetails.title || currentGameDetails.name || currentGameDetails.gameDetails?.name,
                requestedGameId: gameId,
                isCorrectGame
            });

            // If we already loaded from localStorage, don't overwrite to avoid flicker/race
            // Only set game if we haven't loaded from localStorage AND we don't have a selected game yet
            // Trust the API response if it succeeded - the API should return the correct game
            // Only check gameId match if gameId is provided, otherwise trust the API
            if (!loadedFromLocalStorage && !selectedGame) {
                // If gameId is provided, verify it matches, otherwise trust the API response
                if (gameId && !isCorrectGame) {
                    console.warn('⚠️ Game ID mismatch, but trusting API response:', {
                        requestedGameId: gameId,
                        fetchedGameId,
                        _id: currentGameDetails._id,
                        gameId: currentGameDetails.gameId,
                        gameDetailsId: currentGameDetails.gameDetails?.id
                    });
                }
                console.log('✅ Setting game from API response');
                setSelectedGame(currentGameDetails);
                setIsDataLoaded(true);
                setIsInitialLoading(false); // Stop initial loading
                initializeSession(currentGameDetails);
            } else {
                console.log('⚠️ Not setting game from API:', {
                    loadedFromLocalStorage,
                    hasSelectedGame: !!selectedGame,
                    isCorrectGame,
                    gameId
                });
            }
        } else if (gameDetailsStatus === 'failed') {
            console.error('❌ Game details API failed:', {
                gameId,
                status: gameDetailsStatus,
                error: 'API request failed'
            });
            setIsInitialLoading(false); // Stop loading on error
        } else if (gameDetailsStatus === 'loading') {
            console.log('⏳ Game details API is loading...', { gameId });
        } else if (gameDetailsStatus === 'succeeded' && !currentGameDetails) {
            // API succeeded but no game data - this shouldn't happen, but clear loading anyway
            console.warn('⚠️ API succeeded but no game data received');
            setIsInitialLoading(false);
        }
    }, [currentGameDetails, gameDetailsStatus, gameId, loadedFromLocalStorage, selectedGame]);

    // Use fresh API data (Redux state cleared before navigation)
    // Normalize game data by merging gameDetails into root level for easier access
    const rawGame = selectedGame || currentGameDetails;

    const displayGame = useMemo(() => {
        if (!rawGame) return null;

        // Use besitosRawData if available - it has the most complete data
        const rawData = rawGame.besitosRawData || {};

        // If game has nested gameDetails, merge it with root properties
        // Priority: besitosRawData > gameDetails > root properties
        if (rawGame.gameDetails || rawData.id) {
            const normalized = {
                ...rawGame,
                ...rawGame.gameDetails,
                // Use besitosRawData properties first (highest priority)
                // Keep root-level properties that might be important
                _id: rawGame._id,
                gameId: rawGame.gameId || rawData.id || rawGame.gameDetails?.id,
                title: rawData.title || rawGame.title || rawGame.gameDetails?.name || rawGame.gameDetails?.title,
                // Merge goals and points - use besitosRawData first
                goals: rawData.goals || rawGame.gameDetails?.goals || rawGame.goals,
                points: rawData.points || rawGame.gameDetails?.points || rawGame.points,
                // Merge images - use besitosRawData first
                image: rawData.image || rawGame.gameDetails?.image || rawGame.image,
                square_image: rawData.square_image || rawGame.gameDetails?.square_image || rawGame.square_image,
                large_image: rawData.large_image || rawGame.gameDetails?.large_image || rawGame.large_image,
                // Merge amount and cpi - use besitosRawData first
                amount: rawData.amount || rawGame.gameDetails?.amount || rawGame.amount,
                cpi: rawData.cpi || rawGame.gameDetails?.cpi || rawGame.cpi,
                // Merge category - use besitosRawData first
                category: rawData.categories?.[0]?.name || rawGame.gameDetails?.category || rawGame.category || rawGame.metadata?.genre,
                // Keep rewards from root level (they're already there)
                rewards: rawGame.rewards || rawGame.gameDetails?.rewards,
                // Keep xpRewardConfig for XP calculation
                xpRewardConfig: rawGame.xpRewardConfig || { baseXP: 1, multiplier: 1 },
                // Keep besitosRawData for full access
                besitosRawData: rawGame.besitosRawData || rawData,
                // Keep gameDetails for backward compatibility
                gameDetails: rawGame.gameDetails,
                // Keep description from besitosRawData
                description: rawData.description || rawGame.description || rawGame.gameDetails?.description,
                // Keep URL from besitosRawData
                url: rawData.url || rawGame.url || rawGame.gameDetails?.downloadUrl,
                // Keep bundle_id from besitosRawData
                bundle_id: rawData.bundle_id || rawGame.bundle_id,
                // Keep taskProgression and userXpTier
                taskProgression: rawGame.taskProgression || null,
                userXpTier: rawGame.userXpTier || null
            };

            console.log('🔄 Normalized game data with besitosRawData:', {
                hasBesitosRawData: !!normalized.besitosRawData,
                hasGoals: !!normalized.goals,
                goalsLength: normalized.goals?.length || 0,
                hasImage: !!normalized.square_image,
                imageUrl: normalized.square_image,
                hasAmount: !!normalized.amount,
                amount: normalized.amount,
                title: normalized.title
            });

            return normalized;
        }

        // If no gameDetails, still use besitosRawData if available
        if (rawData.id) {
            return {
                ...rawGame,
                // Override with besitosRawData values
                title: rawData.title || rawGame.title,
                image: rawData.image || rawGame.image,
                square_image: rawData.square_image || rawGame.square_image,
                large_image: rawData.large_image || rawGame.large_image,
                amount: rawData.amount || rawGame.amount,
                description: rawData.description || rawGame.description,
                goals: rawData.goals || rawGame.goals,
                points: rawData.points || rawGame.points,
                category: rawData.categories?.[0]?.name || rawGame.category,
                url: rawData.url || rawGame.url,
                bundle_id: rawData.bundle_id || rawGame.bundle_id,
                // Keep rewards and xpRewardConfig
                rewards: rawGame.rewards,
                xpRewardConfig: rawGame.xpRewardConfig || { baseXP: 1, multiplier: 1 },
                // Keep taskProgression and userXpTier
                taskProgression: rawGame.taskProgression || null,
                userXpTier: rawGame.userXpTier || null,
                besitosRawData: rawGame.besitosRawData || rawData
            };
        }

        return rawGame;
    }, [rawGame]);

    // Update selectedTier based on userXpTier from displayGame or userData
    // Priority: displayGame.userXpTier (from game discovery API) > userData.userXpTier (from getUserData API)
    useEffect(() => {
        const tier = displayGame?.userXpTier || userData?.userXpTier || null;
        if (tier) {
            const capitalizedTier = capitalizeTier(tier);
            setSelectedTier(capitalizedTier);
            console.log('🎯 [GameDetails] Setting tier from userXpTier:', {
                tier,
                capitalizedTier,
                source: displayGame?.userXpTier ? 'displayGame' : 'userData'
            });
        }
    }, [displayGame?.userXpTier, userData?.userXpTier]);

    // Preload game image to prevent delay - use besitosRawData image first
    useEffect(() => {
        if (displayGame) {
            // Priority: besitosRawData images > displayGame images
            const rawData = displayGame.besitosRawData || {};
            const imageUrl = rawData.square_image || rawData.image || rawData.large_image ||
                displayGame.square_image || displayGame.image ||
                displayGame.images?.banner || displayGame.images?.large_image;
            if (imageUrl) {
                setIsImageLoaded(false);
                setImageError(false);

                const img = new Image();
                img.onload = () => {
                    setIsImageLoaded(true);
                };
                img.onerror = () => {
                    setImageError(true);
                    setIsImageLoaded(false);
                };
                img.src = imageUrl;
            }
        }
    }, [displayGame]);

    // Initialize session for the game
    const initializeSession = async (game) => {
        if (!game || (!game.id && !game._id)) return;

        try {
            // Get user ID
            const getUserId = () => {
                try {
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        return user._id || user.id;
                    }
                } catch (error) {
                    console.error('Error getting user ID:', error);
                }
                return null;
            };

            const userId = getUserId();
            if (!userId) {
                console.warn('⚠️ No user ID found, cannot create session');
                return;
            }

            // Use the correct game ID (either id or _id from new API)
            const gameIdForSession = game.id || game._id;

            // Check for existing active session
            const existingSession = sessionManager.getActiveSessionForGame(gameIdForSession, userId);
            if (existingSession) {
                console.log('🔄 Found existing session:', existingSession.id);
                setCurrentSession(existingSession);

                // Validate existing session
                const isValid = await sessionManager.validateSession(existingSession.id);
                if (!isValid) {
                    console.log('⚠️ Existing session invalid, creating new one');
                    const newSessionId = sessionManager.createSession(gameIdForSession, userId, game);
                    const newSession = sessionManager.getSession(newSessionId);
                    setCurrentSession(newSession);
                }
            } else {
                // Create new session
                const rawData = game?.besitosRawData || {};
                console.log('🆕 Creating new session for game:', rawData.title || game.title || game.name);
                const sessionId = sessionManager.createSession(gameIdForSession, userId, game);
                const session = sessionManager.getSession(sessionId);
                setCurrentSession(session);
            }
        } catch (error) {
            console.error('❌ Error initializing session:', error);
        }
    };


    // Refresh user data when page regains focus (after user downloads game)
    useEffect(() => {
        const handleFocus = () => {
            const userId = getUserId();
            const token = localStorage.getItem('authToken');
            if (userId && token) {
                console.log('🔄 GameDetails: Page focused, refreshing downloaded games list...');
                dispatch(fetchUserData({ userId, token }));
            }
        };

        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [dispatch]);

    // Listen for gameDownloaded event to refresh list immediately
    useEffect(() => {
        const handleGameDownloaded = (event) => {
            console.log('🎮 GameDetails: Game download event received:', event);
            const userId = getUserId();
            const token = localStorage.getItem('authToken');
            if (userId && token) {
                console.log('🔄 GameDetails: Refreshing downloaded games list after download...');
                dispatch(fetchUserData({ userId, token }));
            }
        };

        window.addEventListener('gameDownloaded', handleGameDownloaded);
        return () => window.removeEventListener('gameDownloaded', handleGameDownloaded);
    }, [dispatch]);

    // Check game installation status - Check if game is in downloaded games list
    useEffect(() => {
        if (!displayGame) {
            setIsGameInstalled(false);
            return;
        }

        // Get the current game ID (handle both id and _id formats)
        const currentGameId = displayGame.id || displayGame._id;

        if (!currentGameId) {
            setIsGameInstalled(false);
            return;
        }

        // Check if the game is in the inProgressGames (downloaded games) array
        const isDownloaded = inProgressGames && inProgressGames.some(game => {
            const gameId = game.id || game._id;
            return gameId === currentGameId || gameId?.toString() === currentGameId?.toString();
        });

        setIsGameInstalled(isDownloaded || false);

        console.log('🎮 GameDetails: Installation status check:', {
            gameId: currentGameId,
            isDownloaded,
            inProgressGamesCount: inProgressGames?.length || 0
        });
    }, [displayGame, inProgressGames]);

    // Event handlers
    const handleBack = () => router.back();

    const handleGameAction = async () => {
        if (displayGame || selectedGame) {
            // Use displayGame (which has besitosRawData merged) or selectedGame
            const gameToDownload = displayGame || selectedGame;
            try {
                // Use besitosRawData URL if available
                const rawData = gameToDownload?.besitosRawData || {};
                const downloadUrl = rawData.url || gameToDownload?.url || gameToDownload?.details?.downloadUrl;
                const gameWithUrl = downloadUrl ? { ...gameToDownload, url: downloadUrl } : gameToDownload;

                await handleGameDownload(gameWithUrl);

                // Refresh downloaded games list after a short delay to allow server to update
                // This ensures the button updates to "Start Playing" after download
                setTimeout(() => {
                    const userId = getUserId();
                    const token = localStorage.getItem('authToken');
                    if (userId && token) {
                        console.log('🔄 GameDetails: Refreshing downloaded games list after download action...');
                        dispatch(fetchUserData({ userId, token }));
                    }
                }, 2000); // Wait 2 seconds for server to process download
            } catch (error) {
                console.error('❌ Game action failed:', error);
            }
        }
    };

    const handleTierChange = (tier) => setSelectedTier(tier);

    const handleSessionUpdate = (data) => {
        setSessionData(data);

        // Update session manager with new data
        if (currentSession) {
            sessionManager.updateSessionActivity(currentSession.id, {
                sessionCoins: data.sessionCoins,
                sessionXP: data.sessionXP,
                type: 'progress_update'
            });
        }
    };

    const handleDailyChallenge = () => {
        router.push(`/gamedetails/dailychallange?gameId=${gameId}`);
    };

    // Handle reward claiming with session lock
    const handleClaimRewards = async () => {
        if (!currentSession) {
            console.error('❌ No active session for claiming rewards');
            throw new Error('No active session found. Please refresh the page.');
        }

        try {
            console.log('🎁 Claiming rewards for session:', currentSession.id);

            // Use session manager to claim rewards
            const claimResult = await sessionManager.claimSessionRewards(currentSession.id, {
                coins: sessionData.sessionCoins,
                xp: sessionData.sessionXP,
                isClaimed: true
            });

            // Update local state
            setSessionData(prev => ({ ...prev, isClaimed: true }));

            // End the session
            sessionManager.endSession(currentSession.id, 'claimed', {
                coins: sessionData.sessionCoins,
                xp: sessionData.sessionXP,
                isClaimed: true
            });

            // Refresh transaction history immediately after reward claim
            try {
                const token = localStorage.getItem('authToken');
                if (token) {
                    await Promise.all([
                        dispatch(fetchWalletTransactions({ token, limit: 5 })),
                        dispatch(fetchFullWalletTransactions({ token, page: 1, limit: 20, type: "all" }))
                    ]);
                    console.log("✅ Transaction history refreshed after reward claim");
                }
            } catch (transactionError) {
                console.warn("⚠️ Failed to refresh transaction history:", transactionError);
                // Don't throw error - reward was still claimed successfully
            }

            // Show success message
            alert(`✅ Rewards claimed!\n💰 $${sessionData.sessionCoins.toFixed(2)} Coins\n⭐ ${sessionData.sessionXP} XP\n\nSession ended successfully.`);

            console.log('✅ Rewards claimed successfully:', claimResult);
        } catch (error) {
            console.error('❌ Claim rewards failed:', error);
            throw error;
        }
    };

    // Show skeleton loader for initial loading or when API is loading
    const hasGameData = !!displayGame;
    const hasLocalStorageData = loadedFromLocalStorage || (typeof window !== 'undefined' && !!localStorage.getItem('selectedGameData'));
    const isLoading = isInitialLoading || (gameId && !hasGameData && !hasLocalStorageData && (gameDetailsStatus === 'loading' || gameDetailsStatus === 'idle'));

    if (isLoading) {
        return (
            <div className="flex flex-col  overflow-x-hidden w-full h-full items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto loading-container android-optimized">
                {/* App Version */}
                <div className="w-full max-w-[375px] px-3  mb-3 ml-2 pt-2">
                    <div className="[font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3">
                        App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.1.0"}
                    </div>
                </div>

                {/* Header Skeleton */}
                <div className="flex w-[375px] items-center gap-6 px-4 py-4 relative">
                    <div
                        className="w-6 h-6 bg-gray-800 rounded-full animate-pulse"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                    <div
                        className="flex-1 h-6 bg-gray-800 rounded animate-pulse"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '0.2s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                </div>

                {/* Game Image Skeleton */}
                <div className="flex w-[375px] items-center justify-center px-4 relative mt-4">
                    <div
                        className="w-[335px] h-[164px] bg-gray-800 rounded-lg animate-pulse"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '0.4s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                </div>

                {/* Game Info Skeleton */}
                <div className="w-full max-w-[375px] mt-6 space-y-3">
                    <div
                        className="h-8 bg-gray-800 rounded animate-pulse w-3/4"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '0.6s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                    <div
                        className="h-4 bg-gray-800 rounded animate-pulse w-1/2"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '0.8s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                    <div className="flex gap-2 mt-4">
                        <div
                            className="h-10 bg-gray-800 rounded animate-pulse w-24"
                            style={{
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '1.0s',
                                transform: 'translateZ(0)',
                                willChange: 'opacity'
                            }}
                        />
                        <div
                            className="h-10 bg-gray-800 rounded animate-pulse w-24"
                            style={{
                                animation: 'pulse 1.5s ease-in-out infinite',
                                animationDelay: '1.2s',
                                transform: 'translateZ(0)',
                                willChange: 'opacity'
                            }}
                        />
                    </div>
                </div>

                {/* Reward Summary Skeleton */}
                <div className="flex w-[280px] items-center justify-center relative mt-6">
                    <div
                        className="flex flex-row items-center justify-center gap-2 bg-gray-800 rounded-[10px] py-2 w-full h-12 animate-pulse"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '1.4s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                </div>

                {/* Description Skeleton */}
                <div className="w-full max-w-[375px] mt-6 space-y-2">
                    <div
                        className="h-4 bg-gray-800 rounded animate-pulse w-full"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '1.6s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                    <div
                        className="h-4 bg-gray-800 rounded animate-pulse w-5/6"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '1.8s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                    <div
                        className="h-4 bg-gray-800 rounded animate-pulse w-4/6"
                        style={{
                            animation: 'pulse 1.5s ease-in-out infinite',
                            animationDelay: '2.0s',
                            transform: 'translateZ(0)',
                            willChange: 'opacity'
                        }}
                    />
                </div>

                {/* Loading indicator */}

            </div>
        );
    }

    // Error state - game not found
    if (!displayGame) {
        console.error('❌ GameDetails: Game not found - Debug info:', {
            gameId,
            gameDetailsStatus,
            hasCurrentGameDetails: !!currentGameDetails,
            hasSelectedGame: !!selectedGame,
            loadedFromLocalStorage,
            isDataLoaded
        });

        return (
            <div className="flex flex-col items-center justify-center h-screen bg-black animate-fade-in">
                <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h2 className="text-white text-xl font-semibold mb-2">Game not found</h2>
                    <p className="text-gray-400 text-sm mb-2">Game ID: {gameId || 'No ID provided'}</p>
                    <p className="text-gray-400 text-sm">Status: {gameDetailsStatus || 'Unknown'}</p>
                </div>
                <button
                    onClick={handleBack}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <LoadingOverlay
            isLoading={!isDataLoaded && !isInitialLoading}
            message="Loading game details..."
            className="w-full h-full"
        >
            <div
                className="flex flex-col overflow-x-hidden w-full h-full items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto transition-all duration-300 ease-in-out animate-fade-in android-optimized"
            >
                {/* App Version */}
                <div className="w-full max-w-[375px] px-3 ml-2 mb-3 pt-2">
                    <div className="[font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px] tracking-[0] leading-3">
                        App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.1.0"}
                    </div>
                </div>

                {/* Header */}
                <div className="flex w-[375px] items-center gap-6  px-2 py-4 relative ">
                    <button
                        onClick={handleBack}
                        className="flex  justify-center items-center w-8 h-8 rounded-full transition-colors hover:bg-gray-800"
                    >
                        <svg className="w-6 h-6 mt-[3px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    <div className="flex  items-center">
                        <h1 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px] tracking-[0] leading-[normal]">
                            {(displayGame?.title || 'Game Details').split(' - ')[0]
                                .split(':')[0]}
                        </h1>
                    </div>

                    <div className="w-8 h-8" /> {/* Spacer for centering */}
                </div>

                {/* Game Banner */}
                {(displayGame?.square_image || displayGame?.image || displayGame?.images?.banner || displayGame?.images?.large_image) && (
                    <div className="flex w-[375px] items-center justify-center px-4 relative">
                        {/* Image Skeleton - Show while loading */}
                        {!isImageLoaded && !imageError && (
                            <div
                                className="w-[335px] h-[164px] bg-gray-800 rounded-lg animate-pulse shadow-[100px] shadow-blue"
                                style={{
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                    transform: 'translateZ(0)',
                                    willChange: 'opacity'
                                }}
                            />
                        )}

                        {/* Actual Image - Show when loaded */}
                        {!imageError && (
                            <OptimizedGameImage
                                game={displayGame}
                                isLoaded={isImageLoaded}
                                onLoad={() => setIsImageLoaded(true)}
                                onError={() => setImageError(true)}
                                // We pass the shadow classes as a prop
                                className="shadow-[0_14px_50px_-2px_rgba(113,106,231,0.5)]"
                            />
                        )}

                        {/* Error State - Show if image fails to load */}
                        {imageError && (
                            <div className="w-[335px] h-[164px] bg-gray-800 rounded-lg flex items-center justify-center shadow-lg shadow-white/30">
                                <div className="text-center">
                                    <svg className="w-8 h-8 text-gray-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <p className="text-gray-500 text-sm">Image unavailable</p>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Game Info */}
                <div className="flex flex-col w-[375px] items-start justify-center mt-6 px-6 py-2 relative">
                    <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px] ">
                        {(displayGame?.title || displayGame?.name || displayGame?.details?.name || 'Game Title')
                            .split(' - ')[0]
                            .split(':')[0]}

                    </h2>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="[font-family:'Poppins',Helvetica] font-regular text-[#f4f3fc] text-[13px]">
                            {displayGame?.category || displayGame?.details?.category || 'Casual'}
                        </span>
                        {displayGame?.userXpTier && (
                            <>
                                <span className="text-[#f4f3fc] text-[13px]">•</span>
                                <span className="[font-family:'Poppins',Helvetica] font-medium text-[#A4A4A4] text-[13px] capitalize">
                                    {displayGame.userXpTier} Tier
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex w-[266px] items-center justify-start  mt-3 relative ">
                        <div className="flex flex-row items-center justify-center gap-2 bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] rounded-[10px] py-2 w-full">
                            <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[16px] flex items-center justify-center gap-2 flex-wrap">
                                <span className="whitespace-nowrap text-[16px] font-medium">Earn up to</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold text-[16px]">
                                        {(() => {
                                            // Use rewards.coins first, then fallback to amount
                                            return displayGame?.rewards?.coins || displayGame?.besitosRawData?.amount || displayGame?.amount || 0;
                                        })()}
                                    </span>
                                    <img
                                        className="w-[23px] h-[22px] object-contain"
                                        alt="Coin icon"
                                        src="https://c.animaapp.com/ltgoa7L3/img/image-3937-7@2x.png"
                                    />
                                </span>
                                <span className="whitespace-nowrap">and</span>
                                <span className="flex items-center gap-1">
                                    <span className="font-semibold">
                                        {(() => {
                                            // Calculate total XP with progressive multiplier
                                            // Or use rewards.xp if available
                                            if (displayGame?.rewards?.xp) {
                                                return displayGame.rewards.xp;
                                            }

                                            // Calculate from xpRewardConfig with progressive multiplier
                                            // Task 1: baseXP × multiplier^0
                                            // Task 2: baseXP × multiplier^1
                                            // Task 3: baseXP × multiplier^2
                                            // ...
                                            // Total = sum of all task XPs
                                            const xpConfig = displayGame?.xpRewardConfig || { baseXP: 1, multiplier: 1 };
                                            const baseXP = xpConfig.baseXP || 1;
                                            const multiplier = xpConfig.multiplier || 1;

                                            // Get total number of tasks/goals
                                            const goals = displayGame?.besitosRawData?.goals || displayGame?.goals || [];
                                            const totalTasks = goals.length || 0;

                                            // Calculate total XP: sum of baseXP × multiplier^taskIndex for all tasks
                                            // This is a geometric series: baseXP × (multiplier^totalTasks - 1) / (multiplier - 1) when multiplier ≠ 1
                                            // When multiplier = 1, it's just baseXP × totalTasks
                                            let totalXP = 0;
                                            if (multiplier === 1) {
                                                // Simple case: all tasks have same XP
                                                totalXP = baseXP * totalTasks;
                                            } else {
                                                // Geometric series: baseXP × (multiplier^totalTasks - 1) / (multiplier - 1)
                                                totalXP = baseXP * (Math.pow(multiplier, totalTasks) - 1) / (multiplier - 1);
                                            }

                                            return Math.floor(totalXP) > 0 ? Math.floor(totalXP) : 0;
                                        })()}
                                    </span>
                                    <img
                                        className="w-[22px] h-[23px] object-contain"
                                        alt="XP icon"
                                        src="https://c.animaapp.com/ltgoa7L3/img/pic-7.svg"
                                    />
                                </span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Reward Summary */}

                {/* Main Content Sections */}
                <div className="animate-fade-in">
                    <InstructionsTextSection game={displayGame} />
                </div>

                <div className="animate-fade-in">
                    <ActionButtonSection
                        game={displayGame}
                        isInstalled={isGameInstalled}
                        onGameAction={handleGameAction}
                    />
                </div>

                <div className="animate-fade-in">
                    <LevelsSection
                        game={displayGame}
                        selectedTier={selectedTier}
                        onTierChange={handleTierChange}
                        onSessionUpdate={handleSessionUpdate}
                    />
                </div>

                <div className="animate-fade-in">
                    <Coin
                        game={displayGame}
                        sessionCoins={sessionData.sessionCoins}
                        sessionXP={sessionData.sessionXP}
                        isClaimed={sessionData.isClaimed}
                        isMilestoneReached={sessionData.isMilestoneReached}
                        onClaimRewards={handleClaimRewards}
                    />
                </div>

                <div className="animate-fade-in">
                    <Breakdown
                        game={displayGame}
                        sessionCoins={sessionData.sessionCoins}
                        sessionXP={sessionData.sessionXP}
                    />
                </div>

                <div className="animate-fade-in">
                    <DailyChallenge
                        game={displayGame}
                        onChallengeClick={handleDailyChallenge}
                    />
                </div>

                <HomeIndicator />

                {/* Session Status Component */}
                <SessionStatus
                    game={selectedGame}
                    currentSession={currentSession}
                />

            </div>
        </LoadingOverlay>
    );
}


export default function GameDetailsPage() {
    return (
        <Suspense fallback={
            <div className="w-full min-h-screen bg-black flex justify-center items-center">
                <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-white animate-spin" />
                <p className="text-white text-lg font-medium mt-4">Loading game details...</p>
            </div>
        }>
            <GameDetailsContent />
        </Suspense>
    );
}