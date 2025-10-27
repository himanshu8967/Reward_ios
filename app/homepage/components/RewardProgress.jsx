"use client";
import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";


const RewardProgress = ({ stats }) => {
    const router = useRouter();
    const rewardGoal = 6000;

    // OPTIMIZED: Memoize expensive calculations to prevent re-computation
    const pointsData = useMemo(() => {
        const currentProgress = stats?.currentXP ?? 0;
        const pointsNeeded = Math.max(0, rewardGoal - currentProgress);
        const progressPercentage = Math.min(
            (currentProgress / rewardGoal) * 100,
            100
        );

        return {
            currentPoints: currentProgress,
            targetPoints: rewardGoal,
            pointsNeeded: pointsNeeded,
            currentLevel: stats?.tier ?? 2,
            nextLevel: (stats?.tier ?? 2) + 1,
            progressPercentage,
        };
    }, [stats?.currentXP, stats?.tier]);

    // OPTIMIZED: Memoize click handler
    const handleHurryBoxClick = useCallback(() => {
        // Navigate to wallet to show balance breakdown and transaction history
        router.push('/Wallet');
    }, [router]);


    const walletScreen = useSelector((state) => state.walletTransactions.walletScreen);
    const balance = walletScreen?.wallet?.balance || 0;

    return (
        <div
            className="relative w-full max-w-[375px] mx-auto h-[135px]"
            data-model-id="1151:33569"
        >
            <div className="relative w-full h-[135px]">
                <div className="absolute w-full h-[135px] top-0 left-0">
                    <div
                        className="relative w-full h-[135px] bg-black rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8),2.48px_2.48px_18.58px_#3b3b3b80,-1.24px_-1.24px_16.1px_#825700] cursor-pointer hover:opacity-95 transition-opacity duration-200"
                        onClick={handleHurryBoxClick}
                        role="button"
                        tabIndex={0}
                        aria-label="View wallet balance and transaction history"
                    >
                        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_30px_8px_rgba(255,215,0,0.06)]" />
                        <div className="absolute w-[calc(100%-34px)] max-w-[302px] h-[25px] top-[79px] left-[17px]">
                            <div className="absolute w-full h-[25px] top-0 left-0">
                                <div className="w-full h-[25px]">
                                    <div className="relative w-full h-[25px]">
                                        {/* Progress bar background */}
                                        <div className="absolute w-full h-full rounded-full overflow-hidden ring-1 ring-[#8b7332] bg-gradient-to-r from-[#4a3c1a] to-[#6b5424] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25)]"></div>

                                        {/* Progress bar fill */}
                                        <div
                                            className="absolute h-full rounded-full bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f4d03f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                                            style={{
                                                width: `${(pointsData.currentPoints / pointsData.targetPoints) *
                                                    100
                                                    }%`,
                                            }}
                                        ></div>
                                        {/* Current level indicator */}
                                        <div className="absolute w-[23px] h-[24px] top-0.3 left-[-1px] bg-[#ffd700] rounded-full border-0.5 border-[#b8860b] flex items-center justify-center ">
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#815c23] text-[12px] tracking-[0.02px] leading-[normal]">
                                                {pointsData.currentLevel}
                                            </div>
                                        </div>
                                        {/* Next level indicator - MOVED & FIXED */}
                                        <div className="absolute w-[23px] h-[24px] top-0.3 right-[-1px] bg-[#ffd700] rounded-full border-0.5 border-[#b8860b] flex items-center justify-center ">
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#815c23] text-[12px] tracking-[0.02px] leading-[normal]">
                                                2
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <p className="absolute top-1 left-1/2 -translate-x-1/2 opacity-80 [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[12px] tracking-[0.02px] leading-[normal]">
                                <span className="text-white">
                                    <span
                                        role="img"
                                        aria-label="star"
                                        className="inline-block relative "
                                        style={{
                                            filter: 'drop-shadow(0 0 2px rgba(255, 215, 0, 0.5))',
                                            transform: 'translateY(-1px)'
                                        }}
                                    >
                                        ⭐
                                    </span>{" "}
                                    {balance}
                                </span>

                                <span className="text-gray-400">
                                    /{pointsData.targetPoints}
                                </span>
                            </p>
                        </div>

                        <header className="absolute w-[calc(100%-40px)] max-w-[299px] h-[42px] top-[19px]  left-5">
                            <div className="relative  w-full h-[42px]">
                                <div className="absolute w-full h-[21px] top-0 left-0">
                                    <h1 className="absolute w-full top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-lg sm:text-xl tracking-[-0.37px] leading-[27.2px] truncate">
                                        {pointsData.pointsNeeded > 0
                                            ? `Hurry! Earn ${pointsData.pointsNeeded} more & Claim`
                                            : 'Congratulations! You\'ve reached your goal!'
                                        }
                                    </h1>
                                </div>

                                <p className="absolute w-full top-[27px] left-0 [font-family:'Poppins',Helvetica] font-semibold text-[#ffffff99] text-sm tracking-[0.02px] leading-[normal] truncate">
                                    {pointsData.pointsNeeded > 0
                                        ? `${pointsData.pointsNeeded} Points until your next reward`
                                        : 'You can now claim your reward!'
                                    }
                                </p>
                            </div>
                        </header>
                    </div>
                </div>
                {/* The misplaced circle and star icon have been removed from here */}
            </div>
        </div>
    );
};

export default RewardProgress;
