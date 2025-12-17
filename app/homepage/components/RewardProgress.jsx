"use client";
import React, { useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";


const RewardProgress = ({ stats }) => {
    const router = useRouter();
    const rewardGoal = 60000;

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

    // Calculate progress for the progress bar image
    const progressPercentage = Math.min((pointsData.currentPoints / pointsData.targetPoints) * 100, 100);

    return (
        <section
            className="flex flex-col items-center gap-2 sm:gap-2.5 p-1 sm:p-2 md:p-3 pr-0 py-0 relative w-full max-w-full sm:max-w-[375px] mx-auto overflow-visible"
            aria-label="Loyalty points tracker"
        >
            <article
                className="relative w-full sm:w-[335px] h-[130px] sm:h-[140px] md:h-[147px] rounded-[8px] sm:rounded-[10px] bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] cursor-pointer hover:opacity-95 transition-opacity duration-200 overflow-visible"
                onClick={handleHurryBoxClick}
                role="button"
                tabIndex={0}
            >
                <header className="absolute w-[calc(100%_-_80px)] sm:w-[calc(100%_-_88px)] top-[16px] sm:top-[18px] md:top-[22px] left-[48px] sm:left-[50px] md:left-[54px] h-4 sm:h-5">
                    <h1 className="font-semibold text-[13px] sm:text-[14px] md:text-[15px] leading-[18px] sm:leading-[20px] md:leading-5 flex items-center justify-start sm:justify-center [font-family:'Poppins',Helvetica] text-white tracking-[0] line-clamp-2 sm:line-clamp-none">
                        {"Keep a track of loyalty points"}
                    </h1>
                </header>

                <img
                    className="absolute top-2.5 sm:top-3 left-2.5 sm:left-3 w-[28px] h-[29px] sm:w-[30px] sm:h-[31px] md:w-[34px] md:h-[35px] aspect-[0.97]"
                    alt="Loyalty points icon"
                    src="/dollor.png"
                />

                <div
                    className="absolute top-[58px] sm:top-[62px] md:top-[67px] left-[12px] sm:left-[14px] md:left-[15px] right-[12px] sm:right-[14px] md:right-[15px] h-10 sm:h-12 md:h-14 overflow-visible"
                    role="group"
                    aria-label="Points progress"
                >
                    <div
                        className="inline-flex items-center gap-[2px] sm:gap-[3px] absolute top-0 left-0 z-10"
                        aria-label="Current points"
                    >
                        <span className="relative flex items-center justify-center w-fit [font-family:'Poppins',Helvetica] font-semibold text-white text-[16px] sm:text-[16px] md:text-[16px] tracking-[0] leading-normal whitespace-nowrap">
                            {balance}
                        </span>

                        <img
                            className="relative w-[18px] h-[19px] sm:w-[18px] sm:h-[19px] md:w-[18px] md:h-[19px] aspect-[0.97]"
                            alt=""
                            src="/dollor.png"
                            aria-hidden="true"
                        />
                    </div>

                    <div
                        className="inline-flex items-center gap-[2px] sm:gap-[3px] absolute top-0 right-0 z-10"
                        aria-label="Maximum points"
                    >
                        <span className="relative flex items-center justify-center w-fit [font-family:'Poppins',Helvetica] font-semibold text-white text-[16px] sm:text-[16px] md:text-[16px] tracking-[0] leading-normal whitespace-nowrap">
                            {pointsData.targetPoints}
                        </span>

                        <img
                            className="relative w-[18px] h-[19px] sm:w-[18px] sm:h-[19px] md:w-[18px] md:h-[19px] aspect-[0.97]"
                            alt=""
                            src="/dollor.png"
                            aria-hidden="true"
                        />
                    </div>

                    <div
                        className="absolute top-[24px] sm:top-[26px] md:top-[29px] left-[-4px] sm:left-[-6px] md:left-[-8px] right-[4px] sm:right-[6px] md:right-[8px] h-6"
                        role="progressbar"
                        aria-valuenow={pointsData.currentPoints}
                        aria-valuemin={0}
                        aria-valuemax={pointsData.targetPoints}
                        aria-label={`Progress: ${pointsData.currentPoints} out of ${pointsData.targetPoints} points`}
                    >
                        {/* Progress bar background - pink theme from card gradient */}
                        <div className="absolute w-full h-[19px] top-0.5 left-0 bg-[#b13388] rounded-[32px] border-4 border-solid border-[#FFFFFF33]" />

                        {/* Progress bar fill - same as XPTierTracker */}
                        <div
                            className="absolute h-[11px] top-1.5 left-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-[32px] transition-all duration-300 ease-out"
                            style={{
                                width: `calc(${progressPercentage}% - 8px)`,
                            }}
                        />

                        {/* Current progress indicator - same as XPTierTracker with proper circle */}
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-4 border-solid border-[#FFD700] transition-all duration-300 ease-out"
                            style={{
                                left: `calc(${progressPercentage}% - 12px)`,
                            }}
                        />
                    </div>
                </div>

            </article>
        </section>
    );
};

export default RewardProgress;
