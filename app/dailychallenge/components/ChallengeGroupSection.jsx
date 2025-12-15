import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBonusDays } from "../../../lib/api";
import { useAuth } from "../../../contexts/AuthContext";

export const ChallengeGroupSection = ({ streak }) => {
    const { token } = useAuth() || {};
    const [bonusDays, setBonusDays] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [apiCurrentStreak, setApiCurrentStreak] = useState(null);

    // Fetch bonus days on component mount
    useEffect(() => {
        console.log("🎁 [CHALLENGE GROUP] Component mounted, fetching bonus days:", {
            hasToken: !!token,
            timestamp: new Date().toISOString(),
        });

        if (!token) {
            console.warn("⚠️ [CHALLENGE GROUP] No token available, skipping bonus days fetch");
            setLoading(false);
            return;
        }

        const fetchBonusDaysData = async () => {
            try {
                console.log("🎁 [CHALLENGE GROUP] Starting bonus days API call...");
                setLoading(true);
                setError(null);

                const response = await getBonusDays(token);
                console.log("🎁 [CHALLENGE GROUP] Bonus days API response:", {
                    success: response?.success,
                    hasData: !!response?.data,
                    bonusDaysCount: response?.data?.bonusDays?.length || 0,
                    currentStreak: response?.data?.currentStreak,
                    fullResponse: response,
                });

                if (response?.success && response?.data?.bonusDays) {
                    console.log("🎁 [CHALLENGE GROUP] Bonus days received:", {
                        count: response.data.bonusDays.length,
                        currentStreak: response.data.currentStreak,
                        totalBonusDays: response.data.totalBonusDays,
                        reachedBonusDays: response.data.reachedBonusDays,
                        upcomingBonusDays: response.data.upcomingBonusDays,
                        userTier: response.data.userTier,
                        tierMultiplier: response.data.tierMultiplier,
                        bonusDays: response.data.bonusDays.map(bd => ({
                            dayNumber: bd.dayNumber,
                            coins: bd.coins,
                            xp: bd.xp,
                            isReached: bd.isReached,
                            rewardType: bd.rewardType,
                        })),
                    });
                    setBonusDays(response.data.bonusDays);
                    // Store currentStreak from API response
                    setApiCurrentStreak(response.data.currentStreak || null);
                    console.log("🎁 [CHALLENGE GROUP] Stored currentStreak from API:", response.data.currentStreak);
                } else {
                    console.warn("⚠️ [CHALLENGE GROUP] Invalid response structure:", response);
                    setBonusDays([]);
                    setApiCurrentStreak(null);
                }
            } catch (err) {
                console.error("❌ [CHALLENGE GROUP] Error fetching bonus days:", {
                    error: err.message,
                    stack: err.stack,
                    timestamp: new Date().toISOString(),
                });
                setError(err.message);
                setBonusDays([]);
            } finally {
                setLoading(false);
                console.log("🎁 [CHALLENGE GROUP] Bonus days fetch completed");
            }
        };

        fetchBonusDaysData();
    }, [token]);

    // Generate milestones dynamically from bonus days or fallback to streak data
    const generateMilestones = () => {
        console.log("🎁 [CHALLENGE GROUP] Generating milestones:", {
            bonusDaysCount: bonusDays.length,
            hasStreak: !!streak,
            streakMilestones: streak?.milestones,
        });

        // If we have bonus days, use them
        if (bonusDays.length > 0) {
            // Calculate positions dynamically based on number of bonus days
            const positions = bonusDays.length === 3
                ? ["7.35%", "50%", "92.65%"]  // Spread evenly for 3 milestones
                : bonusDays.length === 4
                    ? ["7.35%", "31.76%", "56.17%", "80.58%"]
                    : bonusDays.length === 5
                        ? ["7.35%", "31.76%", "56.17%", "80.58%", "90%"]
                        : bonusDays.map((_, index) => `${((index + 1) / (bonusDays.length + 1)) * 100}%`);

            const milestones = bonusDays.map((bonusDay, index) => {
                // Use direct coins and xp fields from simplified API response
                const coins = bonusDay.coins || 0;
                const xp = bonusDay.xp || 0;
                const rewardType = bonusDay.rewardType || null;

                const milestone = {
                    value: bonusDay.dayNumber,
                    leftPosition: positions[index] || `${((index + 1) / (bonusDays.length + 1)) * 100}%`,
                    isReached: bonusDay.isReached || false,
                    coins: coins,
                    xp: xp,
                    rewardType: rewardType,
                };
                console.log(`🎁 [CHALLENGE GROUP] Milestone ${index + 1}:`, {
                    dayNumber: milestone.value,
                    isReached: milestone.isReached,
                    coins: milestone.coins,
                    xp: milestone.xp,
                    rewardType: milestone.rewardType,
                });
                return milestone;
            });
            console.log("🎁 [CHALLENGE GROUP] Generated milestones from bonus days:", milestones);
            return milestones;
        }

        // Fallback to streak milestones if available
        if (streak?.milestones && Array.isArray(streak.milestones) && streak.milestones.length > 0) {
            const positions = ["7.35%", "31.76%", "56.17%", "80.58%"];
            const milestones = streak.milestones.map((milestone, index) => ({
                value: milestone,
                leftPosition: positions[index] || `${(index + 1) * 20}%`,
            }));
            console.log("🎁 [CHALLENGE GROUP] Generated milestones from streak (fallback):", milestones);
            return milestones;
        }

        console.warn("⚠️ [CHALLENGE GROUP] No bonus days or streak milestones, returning empty array");
        return [];
    };

    const milestones = generateMilestones();

    // Get current streak from API response or fallback to streak prop
    const currentStreak = apiCurrentStreak !== null
        ? apiCurrentStreak
        : (streak?.current ?? 0);

    // Calculate max milestone for progress calculation
    const maxMilestone = milestones.length > 0
        ? Math.max(...milestones.map(m => m.value))
        : (streak?.nextMilestone ?? 0);

    // Calculate progress percentage
    const progressPercentage = maxMilestone > 0
        ? Math.min((currentStreak / maxMilestone) * 100, 100)
        : 0;

    console.log("🎁 [CHALLENGE GROUP] Progress calculation:", {
        currentStreak,
        maxMilestone,
        progressPercentage: `${progressPercentage.toFixed(2)}%`,
        milestonesCount: milestones.length,
    });

    // Don't render if no milestones available
    if (milestones.length === 0) {
        return null;
    }

    return (
        <section
            className="w-full max-w-[340px] h-[30px] flex mx-auto"
            role="region"
            aria-label="Challenge progress milestones"
        >
            <div className="flex-1 w-full relative">
                {/* Progress bar background - using RewardProgress design */}
                <div className="absolute w-full h-[25px] top-0 left-0">
                    <div className="relative w-full h-[25px]">
                        {/* Progress bar background - lighter colors */}
                        <div className="absolute w-full h-full rounded-full overflow-hidden ring-1 ring-[#a68b4a] bg-gradient-to-r from-[#6b5424] to-[#8b7332] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25)]"></div>

                        {/* Progress bar fill */}
                        <div
                            className="absolute h-full rounded-full bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f4d03f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                            style={{
                                width: `${progressPercentage}%`,
                            }}
                        ></div>

                        {/* Milestone indicators with treasure chests and rewards */}
                        {milestones.map((milestone, index) => {
                            const isCompleted = milestone.isReached || currentStreak >= milestone.value;
                            const containerWidth = 340; // Max width of container
                            const position = parseFloat(milestone.leftPosition) / 100 * containerWidth; // Convert percentage to pixels
                            const isLastMilestone = index === milestones.length - 1;

                            console.log(`🎁 [CHALLENGE GROUP] Rendering milestone ${index + 1}:`, {
                                dayNumber: milestone.value,
                                isCompleted,
                                currentStreak,
                                position: `${milestone.leftPosition} (${position}px)`,
                                coins: milestone.coins,
                                xp: milestone.xp,
                                rewardType: milestone.rewardType,
                                isLastMilestone,
                            });

                            // Green treasure chest images (for all except last)
                            const greenChestImages = [
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-2@2x.png", // Small green chest
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-3@2x.png", // Medium green chest
                                "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-4@2x.png", // Large green chest
                            ];

                            // Golden treasure chest image (for last milestone) - use tesurebox.png
                            const goldenChestImage = "/tesurebox.png";

                            // Use golden chest for last milestone, green for others
                            const imageUrl = isLastMilestone
                                ? goldenChestImage
                                : greenChestImages[Math.min(index, greenChestImages.length - 1)];

                            // Calculate chest size based on index (progressive sizing)
                            // Last milestone (golden) should be same size as medium green chest
                            const chestSizes = [
                                { width: "31px", height: "35px" },
                                { width: "37px", height: "47px" },
                                { width: "55px", height: "58px" },
                            ];

                            // Use larger size for golden chest (last milestone)
                            const chestSize = isLastMilestone
                                ? { width: "55px", height: "58px" } // Larger size for golden
                                : (chestSizes[Math.min(index, chestSizes.length - 1)] || chestSizes[0]);

                            return (
                                <React.Fragment key={index}>
                                    {/* Reward image above milestone */}
                                    {imageUrl && (
                                        <img
                                            className="absolute"
                                            style={{
                                                // Align above the day number circle - adjust for golden chest size
                                                top: isLastMilestone ? "-64px" : (index === 0 ? "-40px" : index === 1 ? "-54px" : "-56px"),
                                                // Center the chest above the day number circle (15px is half of 30px circle)
                                                left: `${position - parseFloat(chestSize.width) / 2}px`,
                                                width: chestSize.width,
                                                height: chestSize.height,
                                                zIndex: isLastMilestone ? 15 : 10, // Higher z-index for golden treasure
                                                opacity: isCompleted ? 1 : 0.6, // Dim if not reached
                                                transform: 'translateX(0)', // Ensure proper centering
                                            }}
                                            alt={`Reward ${index + 1} - Day ${milestone.value} ${isLastMilestone ? '(Golden)' : '(Green)'}`}
                                            src={imageUrl}
                                            onError={(e) => {
                                                // Fallback to default chest image if custom image fails
                                                e.target.src = isLastMilestone
                                                    ? goldenChestImage
                                                    : greenChestImages[Math.min(index, greenChestImages.length - 1)];
                                            }}
                                        />
                                    )}

                                    {/* Milestone indicator circle with day number */}
                                    <div
                                        className="absolute w-[30px] h-[30px] top-[-3px] rounded-full border-2 flex items-center justify-center"
                                        style={{
                                            left: `${position - 15}px`, // Better centering to match chest positioning
                                            backgroundColor: isCompleted ? '#ffd700' : '#6b5424',
                                            borderColor: isCompleted ? '#b8860b' : '#a68b4a', // Match progress bar track border color
                                            zIndex: 5, // Ensure indicators are above progress bar
                                        }}
                                    >
                                        <div className="[font-family:'Poppins',Helvetica] font-semibold text-[14px] tracking-[0.02px] leading-[normal]"
                                            style={{
                                                color: isCompleted ? '#815c23' : '#ffffff'
                                            }}>
                                            {milestone.value}
                                        </div>
                                    </div>

                                    {/* Reward value below circle - white text with coin and xp images (vertical layout) */}
                                    {(milestone.coins > 0 || milestone.xp > 0) && (
                                        <div
                                            className="absolute top-[32px] flex flex-col items-center justify-center gap-0.5"
                                            style={{
                                                left: `${position - 20}px`,
                                                width: "40px",
                                                zIndex: 5,
                                            }}
                                        >
                                            {milestone.coins > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-[12px] tracking-[0.02px] leading-[normal] text-white">
                                                        {milestone.coins}
                                                    </span>
                                                    <Image
                                                        src="/dollor.png"
                                                        alt="Coins"
                                                        width={14}
                                                        height={14}
                                                        className="inline-block"
                                                    />
                                                </div>
                                            )}
                                            {milestone.xp > 0 && (
                                                <div className="flex items-center gap-1">
                                                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-[12px] tracking-[0.02px] leading-[normal] text-white">
                                                        {milestone.xp}
                                                    </span>
                                                    <Image
                                                        src="/xp.svg"
                                                        alt="XP"
                                                        width={14}
                                                        height={14}
                                                        className="inline-block"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
};
