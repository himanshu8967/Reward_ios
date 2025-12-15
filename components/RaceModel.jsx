"use client";
import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { useWalletUpdates } from "@/hooks/useWalletUpdates";

export const RaceModal = ({ isOpen, isAnimating, onClose, token }) => {
    if (!isOpen) return null;

    // Get real-time XP data
    const { realTimeXP } = useWalletUpdates(token);
    const { walletScreen } = useSelector((state) => state.walletTransactions);
    const xpCurrent = realTimeXP !== null && realTimeXP !== undefined ? realTimeXP : (walletScreen?.xp?.current || 0);
    const xpLevel = walletScreen?.xp?.level || 1;

    // Get XP tier data from Redux if available
    const { xpTierData } = useSelector((state) => state.profile) || {};
    const currentTier = xpTierData?.currentTier || null;
    const tiers = xpTierData?.tiers || [];

    // Calculate dynamic progress data
    const progressData = useMemo(() => {
        let currentPoints = xpCurrent || 0;
        let maxPoints = 10000;
        let currentLevel = "Junior";
        let nextLevel = "Mid-level";
        let achievementText = "You discovered Mid-level feature";

        if (currentTier && tiers.length > 0) {
            // Find the maximum tier's xpMax for totalXP display
            const maxTier = tiers.reduce((max, tier) =>
                (tier.xpMax > (max?.xpMax || 0)) ? tier : max, tiers[0]
            );
            maxPoints = maxTier.xpMax || currentTier.xpMax || 10000;

            const tierName = currentTier.name || "";
            currentLevel = tierName;

            // Determine next level and achievement text
            if (tierName === "Junior" || tierName.toLowerCase() === "junior") {
                nextLevel = "Mid-level";
                achievementText = "You discovered Mid-level feature";
            } else if (tierName === "Middle" || tierName === "Mid-level" || tierName.toLowerCase() === "middle" || tierName.toLowerCase() === "mid-level") {
                nextLevel = "Senior";
                achievementText = "You discovered Senior feature";
            } else if (tierName === "Senior" || tierName.toLowerCase() === "senior") {
                nextLevel = "Senior";
                achievementText = "You've reached the highest tier!";
            }
        }

        return {
            currentPoints,
            maxPoints,
            currentLevel,
            nextLevel,
            achievementText,
        };
    }, [xpCurrent, currentTier, tiers]);

    const decorativeStars = [
        { id: 1, top: "44px", left: "248px" },
        { id: 2, top: "125px", left: "12px" },
        { id: 3, top: "220px", left: "213px" },
        { id: 4, top: "54px", left: "16px" },
        { id: 5, top: "104px", left: "312px" },
        { id: 6, top: "33px", left: "79px" },
        { id: 7, top: "0px", left: "271px" },
        { id: 8, top: "29px", left: "13px" },
    ];

    return (
        <>
            {/* Backdrop/Overlay */}
            <div
                className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                onClick={onClose}
                style={{
                    opacity: isAnimating ? 1 : 0,
                }}
            />

            {/* Modal Container - Fixed at top, same format as XP modal */}
            <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24">
                <div
                    className={`w-[90%] max-w-[280px] sm:max-w-[300px] md:max-w-[320px] bg-black rounded-[20px] border border-solid border-[#ffffff80] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%)] overflow-hidden transform transition-all duration-500 ease-out max-h-[85vh] overflow-y-auto ${isAnimating
                        ? 'translate-y-0 opacity-100 scale-100'
                        : '-translate-y-full opacity-0 scale-95'
                        }`}
                    data-model-id="2035:13685"
                    role="dialog"
                    aria-labelledby="banner-title"
                    aria-describedby="banner-description"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Modal Content */}
                    <div className="relative p-4 sm:p-5 md:p-6">
                        {/* Decorative Stars - Responsive and Fixed */}
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[35px] sm:top-[40px] right-[15%] sm:right-[20%] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-2.svg"
                            aria-hidden="true"
                        />
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[95px] sm:top-[105px] left-[10px] sm:left-[15px] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-2.svg"
                            aria-hidden="true"
                        />
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[170px] sm:top-[190px] right-[15%] sm:right-[20%] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-2.svg"
                            aria-hidden="true"
                        />
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[42px] sm:top-[48px] left-[12px] sm:left-[15px] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-5.svg"
                            aria-hidden="true"
                        />
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[80px] sm:top-[90px] right-[12px] sm:right-[15px] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-7.svg"
                            aria-hidden="true"
                        />
                        <img
                            className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[28px] sm:top-[32px] left-[28%] sm:left-[30%] pointer-events-none opacity-60 z-0"
                            alt=""
                            src="https://c.animaapp.com/b76V1iGo/img/vector-8.svg"
                            aria-hidden="true"
                        />

                        {/* Close Button - Responsive */}
                        <button
                            className="absolute w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] top-3 right-3 sm:top-4 sm:right-4 cursor-pointer hover:opacity-80 transition-opacity z-10"
                            aria-label="Close dialog"
                            type="button"
                            onClick={onClose}
                        >
                            <img alt="Close" src="https://c.animaapp.com/b76V1iGo/img/close.svg" className="w-full h-full" />
                        </button>

                        {/* Main XP Icon - Smaller and Responsive */}
                        <div className="flex justify-center mb-3 sm:mb-4 mt-1 sm:mt-2">
                            <img
                                className="w-[90px] h-[78px] sm:w-[100px] sm:h-[86px] md:w-[110px] md:h-[95px]"
                                alt="XP Points icon"
                                src="https://c.animaapp.com/b76V1iGo/img/pic.svg"
                            />
                        </div>

                        {/* Title Section - Responsive */}
                        <header className="flex flex-col items-center mb-4 sm:mb-5">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <h1
                                    id="banner-title"
                                    className="text-white [font-family:'Poppins',Helvetica] font-bold text-[24px] sm:text-[28px] md:text-[30px] tracking-[0] leading-6 sm:leading-7 whitespace-nowrap"
                                >
                                    XP Points
                                </h1>
                                <img
                                    className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]"
                                    alt=""
                                    src="https://c.animaapp.com/b76V1iGo/img/vector-8.svg"
                                    aria-hidden="true"
                                />
                            </div>
                        </header>

                        {/* Description Section - Responsive with Dynamic XP Values */}
                        <div className="mb-5 sm:mb-6">
                            <p
                                id="banner-description"
                                className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-xs sm:text-sm text-center tracking-[0] leading-4 sm:leading-5 px-2 sm:px-4"
                            >
                                Compete against players by completing tasks. Finish first to win extra XP & reward coins. You currently have <span className="font-semibold text-[#ffb568]">{progressData.currentPoints.toLocaleString()}</span> XP out of <span className="font-semibold text-[#ffb568]">{progressData.maxPoints.toLocaleString()}</span> XP. Higher XP tiers unlock tougher races with bigger rewards.
                            </p>
                        </div>

                        {/* Progress Section - Responsive */}
                        <section className="flex flex-col w-full items-center justify-center gap-3 sm:gap-4 mb-4 sm:mb-5">
                            <img
                                className="w-[45px] h-[48px] sm:w-[50px] sm:h-[54px] aspect-[0.94]"
                                alt="Achievement unlock icon"
                                src="https://c.animaapp.com/b76V1iGo/img/image-3966@2x.png"
                            />

                            <div className="flex items-center justify-center gap-2 pt-0 pb-2 sm:pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#ffb568] text-xs sm:text-sm tracking-[0] leading-4 sm:leading-5 text-center">
                                    {progressData.achievementText}
                                </div>
                            </div>

                            <div className="flex justify-between items-center w-full px-2 mb-2">
                                <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-xs sm:text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                                    Junior
                                </div>
                                <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-xs sm:text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                                    Mid-level
                                </div>
                                <div className="[font-family:'Poppins',Helvetica] font-normal text-white text-xs sm:text-sm tracking-[0] leading-[14px] whitespace-nowrap">
                                    Senior
                                </div>
                            </div>

                            <div
                                className="w-full max-w-[280px] sm:max-w-[300px] h-5 sm:h-6 mb-3 sm:mb-4"
                                role="progressbar"
                                aria-valuenow={progressData.currentPoints}
                                aria-valuemin={0}
                                aria-valuemax={progressData.maxPoints}
                                aria-label={`Progress: ${progressData.currentPoints} out of ${progressData.maxPoints} XP points`}
                            >
                                <img
                                    alt=""
                                    src="https://c.animaapp.com/b76V1iGo/img/progress-bar.svg"
                                    className="w-full h-full"
                                />
                            </div>

                            <div className="flex items-center justify-center gap-1 w-full">
                                <div className="[font-family:'Poppins',Helvetica] font-medium text-[#d2d2d2] text-xs sm:text-sm tracking-[0] leading-[normal]">
                                    {progressData.currentPoints.toLocaleString()}
                                </div>

                                <img
                                    className="w-4 h-[14px] sm:w-5 sm:h-[18px]"
                                    alt=""
                                    src="https://c.animaapp.com/b76V1iGo/img/pic-1.svg"
                                />

                                <div className="[font-family:'Poppins',Helvetica] font-medium text-[#dddddd] text-xs sm:text-sm tracking-[0] leading-[normal]">
                                    out of {progressData.maxPoints.toLocaleString()}
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </>
    );
};
