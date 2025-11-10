"use client";
import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { fetchStreakStatus } from "@/lib/redux/slice/streakSlice";
import { getStreakHistory, getStreakLeaderboard } from "@/lib/api";
import { TitleSection } from "./components/TitleSection";
import { ProgressSection } from "./components/ProgressSection";
import { RewardModal } from "./components/RewardModal";
import { InfoModal } from "./components/InfoModal";
import { HomeIndicator } from "@/components/HomeIndicator";

/**
 * 30-Day Win Streak Page
 * 
 * Main page component for the 30-day streak feature that:
 * - Displays streak progress with visual tree
 * - Shows completed days and milestones
 * - Handles reward claiming on milestones
 * - Manages streak resets and fallbacks
 * 
 * @component
 */
export default function WinStreakPage() {
    const router = useRouter();
    const dispatch = useDispatch();

    // Get data from Redux store
    const {
        currentStreak,
        completedDays,
        streakHistory,
        status,
        error: streakError,
        lastFetched
    } = useSelector((state) => state.streak);

    // Local state for additional data and modals
    const [leaderboard, setLeaderboard] = useState([]);
    const [showRewardModal, setShowRewardModal] = useState(false);
    const [showInfoModal, setShowInfoModal] = useState(false);
    const [rewardData, setRewardData] = useState(null);

    // Ref for scrollable container
    const scrollContainerRef = useRef(null);

    // Check if data is fresh (less than 5 minutes old)
    const isDataFresh = lastFetched && (Date.now() - lastFetched) < 5 * 60 * 1000;

    // Load streak data only if not already loaded or data is stale
    useEffect(() => {
        if (status === 'idle' || (!isDataFresh && status !== 'loading')) {
            dispatch(fetchStreakStatus());
        }
    }, [dispatch, status, isDataFresh]);

    // Load additional data (history and leaderboard) only if needed
    useEffect(() => {
        if (status === 'succeeded' && currentStreak !== undefined) {
            loadAdditionalData();
        }
    }, [status, currentStreak]);

    // Scroll to bottom when page loads/navigates
    useEffect(() => {
        // Wait for content to render, then scroll to bottom
        const scrollToBottom = () => {
            if (scrollContainerRef.current) {
                // Use setTimeout to ensure content is rendered
                setTimeout(() => {
                    if (scrollContainerRef.current) {
                        // Scroll to absolute bottom - use maximum scrollable position
                        const scrollHeight = scrollContainerRef.current.scrollHeight;
                        // Scroll to the absolute maximum position
                        scrollContainerRef.current.scrollTo({
                            top: scrollHeight, // Scroll to absolute bottom
                            behavior: 'smooth'
                        });
                    }
                }, 500); // Increased timeout to ensure all content is fully rendered
            }
        };

        // Scroll when component mounts
        scrollToBottom();

        // Also scroll when data is loaded
        if (status === 'succeeded') {
            scrollToBottom();
        }
    }, [status]);

    // Load additional data (history and leaderboard)
    const loadAdditionalData = async () => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return;

            const [historyResponse, leaderboardResponse] = await Promise.all([
                getStreakHistory(1, 30, token),
                getStreakLeaderboard(10, token)
            ]);

            if (leaderboardResponse && leaderboardResponse.data) {
                setLeaderboard(leaderboardResponse.data.leaderboard || []);
            }

            // Scroll to bottom after additional data is loaded
            setTimeout(() => {
                if (scrollContainerRef.current) {
                    // Scroll to absolute bottom - use maximum scrollable position
                    const scrollHeight = scrollContainerRef.current.scrollHeight;
                    // Scroll to the absolute maximum position
                    scrollContainerRef.current.scrollTo({
                        top: scrollHeight, // Scroll to absolute bottom
                        behavior: 'smooth'
                    });
                }
            }, 600); // Increased timeout to ensure all content is fully rendered
        } catch (error) {
            console.error("Failed to load additional data:", error);
        }
    };

    // Check for milestone rewards based on current streak
    useEffect(() => {
        if (currentStreak > 0) {
            const milestones = [7, 14, 21, 30];
            const reachedMilestone = milestones.find(m => m === currentStreak);

            if (reachedMilestone) {
                // Calculate reward based on milestone
                const rewardAmounts = {
                    7: { coins: 50, xp: 25 },
                    14: { coins: 100, xp: 50 },
                    21: { coins: 150, xp: 75 },
                    30: { coins: 250, xp: 125 }
                };

                const reward = rewardAmounts[reachedMilestone];
                if (reward) {
                    setRewardData({
                        milestone: reachedMilestone,
                        coins: reward.coins,
                        xp: reward.xp,
                        badge: `Day ${reachedMilestone} Champion!`
                    });
                    setShowRewardModal(true);
                }
            }
        }
    }, [currentStreak]);

    // Generate streak tree data for ProgressSection
    const generateStreakTree = () => {
        const tree = [];
        for (let day = 1; day <= 30; day++) {
            tree.push({
                day,
                isCompleted: completedDays.includes(day),
                isCurrent: day === currentStreak + 1,
                isMilestone: [7, 14, 21, 30].includes(day),
                reward: [7, 14, 21, 30].includes(day) ? {
                    coins: day === 7 ? 50 : day === 14 ? 100 : day === 21 ? 150 : 250,
                    xp: day === 7 ? 25 : day === 14 ? 50 : day === 21 ? 75 : 125
                } : null
            });
        }
        return tree;
    };

    // Generate rewards data
    const generateRewards = () => {
        const rewards = [];
        const milestones = [7, 14, 21, 30];

        milestones.forEach(day => {
            if (completedDays.includes(day)) {
                rewards.push({
                    day,
                    isReached: true,
                    reward: {
                        coins: day === 7 ? 50 : day === 14 ? 100 : day === 21 ? 150 : 250,
                        xp: day === 7 ? 25 : day === 14 ? 50 : day === 21 ? 75 : 125,
                        badge: `Day ${day} Champion!`
                    }
                });
            }
        });
        return rewards;
    };

    // Handle close button
    const handleClose = () => {
        router.back();
    };

    // Handle info icon tap
    const handleInfoClick = () => {
        setShowInfoModal(true);
    };

    // Handle reward modal close
    const handleRewardClaim = () => {
        setShowRewardModal(false);
        setRewardData(null);
    };

    // Handle refresh
    const handleRefresh = () => {
        dispatch(fetchStreakStatus());
    };

    // Show loading state only if no data is available and we're loading
    if (status === 'loading' && currentStreak === undefined) {
        return (
            <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden flex items-center justify-center">
                <div className="text-white text-center">
                    <div className="text-lg mb-2">🔄</div>
                    <div className="text-sm">Loading streak information...</div>
                </div>
            </div>
        );
    }

    // Show error state only if there's an actual error
    if (status === 'failed' && streakError) {
        return (
            <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden flex items-center justify-center">
                <div className="text-center p-4">
                    <div className="text-red-400 text-lg mb-4">❌</div>
                    <div className="text-white text-sm mb-4">{streakError}</div>
                    <button
                        onClick={handleRefresh}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        🔄 Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full h-screen bg-black overflow-hidden">
            {/* Background Overlay */}
            <div className="absolute inset-0  backdrop-blur-[5px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(5px)_brightness(100%)]" />

            {/* Main Content */}
            <div className="relative w-full max-w-[375px] mx-auto h-full flex flex-col">
                {/* Scrollable Content - everything scrolls together */}
                <div ref={scrollContainerRef} className="flex-1 relative overflow-y-auto">
                    {/* Header - scrolls with ladder */}
                    <div className="bg-gradient-to-b from-gray-900 to-transparent">
                        <TitleSection
                            currentStreak={currentStreak || 0}
                            onClose={handleClose}
                            onInfoClick={handleInfoClick}
                        />
                    </div>

                    {/* Ladder Section - scrolls with header */}
                    <ProgressSection
                        streakData={{
                            currentStreak,
                            completedDays,
                            streakTree: generateStreakTree(),
                            rewards: generateRewards()
                        }}
                        streakHistory={streakHistory}
                        leaderboard={leaderboard}
                        onRefresh={handleRefresh}
                    />

                    {/* Bottom Spacing - Increased for more scroll space */}
                    <div className="h-20">
                        <HomeIndicator />
                    </div>
                </div>
            </div>

            {/* Reward Modal */}
            {showRewardModal && rewardData && (
                <RewardModal
                    isVisible={showRewardModal}
                    milestone={rewardData.milestone}
                    coins={rewardData.coins}
                    xp={rewardData.xp}
                    badge={rewardData.badge}
                    onClose={handleRewardClaim}
                />
            )}

            {/* Info Modal */}
            <InfoModal
                isVisible={showInfoModal}
                onClose={() => setShowInfoModal(false)}
            />
        </div>
    );
}
