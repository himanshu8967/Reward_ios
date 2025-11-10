"use client";
import React, { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { XPPointsModal } from "../../../components/XPPointsModal";
import { useWalletUpdates } from "@/hooks/useWalletUpdates";

const XPTierTracker = ({ stats, token }) => {
    const [isXPModalOpen, setIsXPModalOpen] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const buttonRef = useRef(null);
    const { realTimeXP } = useWalletUpdates(token);
    const xpCurrent = realTimeXP;

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isXPModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isXPModalOpen]);

    // Handle Escape key to close modal
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isXPModalOpen) {
                setIsAnimating(false);
                setTimeout(() => {
                    setIsXPModalOpen(false);
                }, 500);
            }
        };
        if (isXPModalOpen) {
            window.addEventListener('keydown', handleEscape);
        }
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isXPModalOpen]);

    // OPTIMIZED: Memoize tier goals and calculations
    const tierGoals = useMemo(() => ({ junior: 0, mid: 5000, senior: 10000 }), []);

    const progressData = useMemo(() => {
        console.log("🔍 [XPTierTracker] Stats:", stats);
        const currentXp = stats?.currentXP ?? 2592;
        const totalXpGoal = tierGoals.senior;
        const progressPercentage = Math.min((currentXp / totalXpGoal) * 100, 100);

        return {
            title: "You're off to a great start!",
            currentXP: currentXp,
            totalXP: totalXpGoal,
            levels: ["Junior", "Mid-level", "Senior"],
            progressPercentage: progressPercentage,
        };
    }, [stats?.currentXP, tierGoals]);

    // OPTIMIZED: Memoize event handler with smooth animation
    const handleModalOpen = useCallback(() => {
        setIsXPModalOpen(true);
        // Small delay to ensure DOM is updated before animation starts
        setTimeout(() => {
            setIsAnimating(true);
        }, 100);
    }, []);

    const handleModalClose = useCallback(() => {
        setIsAnimating(false);
        // Delay closing to allow animation to complete
        setTimeout(() => {
            setIsXPModalOpen(false);
        }, 500);
    }, []);

    const toggleExpanded = useCallback(() => {
        setIsExpanded(!isExpanded);
    }, [isExpanded]);

    return (
        <div
            className="flex flex-col items-center relative"
            data-model-id="4001:7762"
        >
            <section className={`relative w-[335px] bg-black rounded-[10px] border border-solid border-neutral-700 transition-all duration-300 overflow-hidden ${isExpanded ? "h-[620px]" : "h-[160px]"}`}>
                <div className="absolute w-[304px] h-6 top-[84px] left-3.5">
                    <div className="relative w-full h-6">
                        {/* Progress bar background */}
                        <div className="absolute w-full h-[19px] top-0.5 left-0 bg-[#373737] rounded-[32px] border-4 border-solid border-[#ffffff33]" />

                        {/* Progress bar fill */}
                        <div
                            className="absolute h-[11px] top-1.5 left-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-[32px]"
                            style={{
                                width: `${Math.min((progressData.progressPercentage / 100) * 288, 288)}px`,
                            }}
                        />
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-5 border-[#FFD700]"
                            style={{ left: "280px" }}
                        />

                        {/* Current progress indicator */}
                        <div
                            className="absolute w-6 h-6 top-0 bg-white rounded-full border-5 border-[#FFD700]"
                            style={{
                                left: `${Math.min((progressData.progressPercentage / 100) * 278, 278)}px`,
                            }}
                        />

                    </div>
                </div>

                <h2 className="absolute w-[210px] h-6 top-4 left-[62px] [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-6">
                    {progressData.title}
                </h2>

                <button
                    ref={buttonRef}
                    className="absolute w-10 h-8 top-[15px] left-4 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={handleModalOpen}
                    aria-label="Open XP Points information"
                >
                    <img
                        className="w-full h-full"
                        alt="XP icon"
                        src="https://c.animaapp.com/mHRmJGe1/img/pic.svg"
                    />
                </button>

                <div className="absolute w-[153px] h-[21px] top-[113px] left-[18px] flex items-center">
                    <div className="font-medium text-[#d2d2d2] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
                        {xpCurrent}
                    </div>

                    <img
                        className="w-5 h-[18px] mx-1"
                        alt="XP points icon"
                        src="https://c.animaapp.com/mHRmJGe1/img/pic-1.svg"
                    />

                    <div className="font-medium text-[#dddddd] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
                        out of {progressData.totalXP.toLocaleString()}
                    </div>
                </div>

                {/* Double Down Arrow Button */}
                <button
                    className="absolute top-[138px] left-1/2 -translate-x-1/2 cursor-pointer hover:opacity-80 transition-opacity flex flex-col items-center justify-center z-10"
                    onClick={toggleExpanded}
                    aria-label="Toggle XP Points details"
                >
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={`text-white transition-transform duration-300 ${isExpanded ? "rotate-180" : ""}`}
                    >
                        <path
                            d="M7 10L12 15L17 10"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <path
                            d="M7 5L12 10L17 5"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </button>

                <nav className="absolute w-[303px] h-[15px] top-[63px] left-4">
                    {progressData.levels.map((level, index) => (
                        <div
                            key={level}
                            className={`h-3.5 font-light text-[#FFFFFF] leading-[14px] whitespace-nowrap absolute -top-px [font-family:'Poppins',Helvetica] text-[13px] tracking-[0] ${index === 0
                                ? "left-0"
                                : index === 1
                                    ? "left-[114px]"
                                    : "left-[259px]"
                                }`}
                        >
                            {level}
                        </div>
                    ))}
                </nav>

                {/* Expanded content - Inline like WelcomeOffer */}
                {isExpanded && (
                    <div className="absolute w-full top-[160px] left-0 bg-black rounded-[0px_0px_10px_10px] px-4 pt-4 pb-10 animate-fade-in -mt-2">
                        <div className="relative">
                            {/* Decorative Stars */}
                            <img
                                className="absolute w-3 h-3 top-[35px] right-[15%] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-3 top-[95px] left-[10px] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-3 top-[170px] right-[15%] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-3 top-[42px] left-[12px] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-3 top-[80px] right-[12px] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-7.svg"
                                aria-hidden="true"
                            />
                            <img
                                className="absolute w-3 h-3 top-[28px] left-[28%] pointer-events-none opacity-60 z-0"
                                alt=""
                                src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                aria-hidden="true"
                            />

                            {/* Main Logo */}
                            <div className="flex justify-center mb-3 mt-1">
                                <img
                                    className="w-[90px] h-[78px]"
                                    alt="XP Points Logo"
                                    src="https://c.animaapp.com/rTwEmiCB/img/pic.svg"
                                />
                            </div>

                            {/* Header Section */}
                            <header className="flex flex-col items-center mb-4">
                                <div className="flex items-center gap-1.5">
                                    <h1
                                        className="text-white [font-family:'Poppins',Helvetica] font-bold text-[24px] tracking-[0] leading-6 whitespace-nowrap"
                                    >
                                        XP Points
                                    </h1>
                                    <img
                                        className="w-[14px] h-[14px]"
                                        alt=""
                                        src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                        aria-hidden="true"
                                    />
                                </div>
                            </header>

                            {/* Description */}
                            <div className="mb-5">
                                <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-xs text-center tracking-[0] leading-4 px-2">
                                    Play more, level up, and multiply your rewards with XP Points.
                                </p>
                            </div>

                            {/* Levels Section */}
                            <section className="flex flex-col w-full items-start gap-2 mb-5">
                                <div className="flex items-center justify-around gap-2.5 pt-0 pb-2 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                    <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xs text-center tracking-[0] leading-4">
                                        Levels
                                    </h2>
                                </div>

                                <div className="flex items-start justify-between w-full gap-1">
                                    {[
                                        { name: "Junior", reward: "Reward:", width: "80px" },
                                        { name: "Mid-level", reward: "1.2x", width: "55px" },
                                        { name: "Senior", reward: "1.5x", width: "58px" }
                                    ].map((level, index) => (
                                        <div key={index} className="inline-flex flex-col items-start gap-0.5">
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] tracking-[0] leading-[normal]">
                                                {level.name}
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className="h-[24px] rounded-[16px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between px-1.5"
                                                    style={{ width: level.width }}
                                                >
                                                    <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] tracking-[0] leading-[14px] whitespace-nowrap">
                                                        {level.reward}
                                                    </div>
                                                    <img
                                                        className="w-[14px] h-[15px] aspect-[0.97] flex-shrink-0"
                                                        alt=""
                                                        src={`https://c.animaapp.com/rTwEmiCB/img/image-3937-${index + 3}@2x.png`}
                                                        aria-hidden="true"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Example Section */}
                            <section className="flex flex-col w-full items-start gap-2 mb-4">
                                <div className="flex items-center gap-2.5 pt-0 pb-2 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                    <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xs text-center tracking-[0] leading-4">
                                        Example
                                    </h2>
                                </div>

                                <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-xs text-center tracking-[0] leading-4 mb-3 px-1">
                                    If you&apos;re playing game say &quot;Fortnite&quot; &amp; the task is
                                    complete 5 levels of the game. Here&apos;s how XP Points benefits you
                                </p>

                                <div className="flex items-start justify-between w-full gap-1">
                                    {[
                                        { name: "Junior", points: "5", width: "42px" },
                                        { name: "Mid-level", points: "8", width: "75px" },
                                        { name: "Senior", points: "10", width: "48px" },
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-start gap-0.5"
                                            style={{ width: item.width }}
                                        >
                                            <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] tracking-[0] leading-[normal]">
                                                {item.name}
                                            </div>
                                            <div className="flex items-center">
                                                <div
                                                    className="h-6 rounded-[16px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-1"
                                                    style={{ width: item.width }}
                                                >
                                                    <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] tracking-[0] leading-[14px] flex items-center gap-[3px] whitespace-nowrap">
                                                        <span>{item.points}</span>
                                                        <img
                                                            className="w-[12px] h-[12px] mb-0.5 object-contain"
                                                            alt=""
                                                            src="/dollor.png"
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                )}
            </section>

            {/* Custom Dropdown Modal - Fixed to top of screen (for info icon) */}
            {isXPModalOpen && (
                <>
                    {/* Backdrop/Overlay */}
                    <div
                        className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
                        onClick={handleModalClose}
                        style={{
                            opacity: isAnimating ? 1 : 0,
                        }}
                    />

                    {/* Modal Container - Fixed at top */}
                    <div className="fixed top-0 left-0 right-0 z-50 flex justify-center pt-12 sm:pt-16 md:pt-20 lg:pt-24">
                        <div
                            className={`xp-modal-content w-[90%] max-w-[300px] sm:max-w-[320px] md:max-w-[340px] bg-black rounded-[20px] border border-solid border-[#ffffff80] bg-[linear-gradient(0deg,rgba(0,0,0,1)_0%,rgba(0,0,0,1)_100%)] overflow-hidden transform transition-all duration-500 ease-out max-h-[85vh] overflow-y-auto ${isAnimating
                                ? 'translate-y-0 opacity-100 scale-100'
                                : '-translate-y-full opacity-0 scale-95'
                                }`}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Modal Content */}
                            <div className="relative p-4 sm:p-5 md:p-6">
                                {/* Decorative Stars - Responsive and Fixed */}
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[35px] sm:top-[40px] right-[15%] sm:right-[20%] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                    aria-hidden="true"
                                />
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[95px] sm:top-[105px] left-[10px] sm:left-[15px] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                    aria-hidden="true"
                                />
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[170px] sm:top-[190px] right-[15%] sm:right-[20%] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-2.svg"
                                    aria-hidden="true"
                                />
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[42px] sm:top-[48px] left-[12px] sm:left-[15px] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-5.svg"
                                    aria-hidden="true"
                                />
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[80px] sm:top-[90px] right-[12px] sm:right-[15px] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-7.svg"
                                    aria-hidden="true"
                                />
                                <img
                                    className="absolute w-3 h-3 sm:w-4 sm:h-4 top-[28px] sm:top-[32px] left-[28%] sm:left-[30%] pointer-events-none opacity-60 z-0"
                                    alt=""
                                    src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                    aria-hidden="true"
                                />

                                {/* Close Button - Responsive */}
                                <button
                                    className="absolute w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] top-3 right-3 sm:top-4 sm:right-4 cursor-pointer hover:opacity-80 transition-opacity z-10"
                                    aria-label="Close dialog"
                                    type="button"
                                    onClick={handleModalClose}
                                >
                                    <img alt="Close" src="https://c.animaapp.com/rTwEmiCB/img/close.svg" className="w-full h-full" />
                                </button>

                                {/* Main Logo - Smaller and Responsive */}
                                <div className="flex justify-center mb-3 sm:mb-4 mt-1 sm:mt-2">
                                    <img
                                        className="w-[90px] h-[78px] sm:w-[100px] sm:h-[86px] md:w-[110px] md:h-[95px]"
                                        alt="XP Points Logo"
                                        src="https://c.animaapp.com/rTwEmiCB/img/pic.svg"
                                    />
                                </div>

                                {/* Header Section - Responsive */}
                                <header className="flex flex-col items-center mb-4 sm:mb-5">
                                    <div className="flex items-center gap-1.5 sm:gap-2">
                                        <h1
                                            className="text-white [font-family:'Poppins',Helvetica] font-bold text-[24px] sm:text-[28px] md:text-[30px] tracking-[0] leading-6 sm:leading-7 whitespace-nowrap"
                                        >
                                            XP Points
                                        </h1>
                                        <img
                                            className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]"
                                            alt=""
                                            src="https://c.animaapp.com/rTwEmiCB/img/vector-8.svg"
                                            aria-hidden="true"
                                        />
                                    </div>
                                </header>

                                {/* Description - Responsive */}
                                <div className="mb-5 sm:mb-6">
                                    <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-xs sm:text-sm text-center tracking-[0] leading-4 sm:leading-5 px-2 sm:px-4">
                                        Play more, level up, and multiply your rewards with XP Points.
                                    </p>
                                </div>

                                {/* Levels Section - Responsive */}
                                <section className="flex flex-col w-full items-start gap-2 sm:gap-3 mb-5 sm:mb-6">
                                    <div className="flex items-center justify-around gap-2.5 pt-0 pb-2 sm:pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                        <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xs sm:text-sm text-center tracking-[0] leading-4 sm:leading-5">
                                            Levels
                                        </h2>
                                    </div>

                                    <div className="flex items-start justify-between w-full gap-1 sm:gap-2">
                                        {[
                                            { name: "Junior", reward: "Reward:", width: "80px", smWidth: "85px", mdWidth: "90px" },
                                            { name: "Mid-level", reward: "1.2x", width: "55px", smWidth: "58px", mdWidth: "61px" },
                                            { name: "Senior", reward: "1.5x", width: "58px", smWidth: "62px", mdWidth: "66px" }
                                        ].map((level, index) => (
                                            <div key={index} className="inline-flex flex-col items-start gap-0.5 sm:gap-1">
                                                <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] sm:text-[14px] md:text-[15px] tracking-[0] leading-[normal]">
                                                    {level.name}
                                                </div>
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-[24px] sm:h-[26px] md:h-[28.52px] rounded-[16px] sm:rounded-[18px] md:rounded-[19.01px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between px-1.5 sm:px-2"
                                                        style={{ width: level.width }}
                                                    >
                                                        <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] sm:text-[14px] md:text-[15.6px] tracking-[0] leading-[14px] sm:leading-[15px] md:leading-[16.9px] whitespace-nowrap">
                                                            {level.reward}
                                                        </div>
                                                        <img
                                                            className="w-[14px] h-[15px] sm:w-[16px] sm:h-[17px] md:w-[18px] md:h-[19px] aspect-[0.97] flex-shrink-0"
                                                            alt=""
                                                            src={`https://c.animaapp.com/rTwEmiCB/img/image-3937-${index + 3}@2x.png`}
                                                            aria-hidden="true"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Example Section - Responsive */}
                                <section className="flex flex-col w-full items-start gap-2 sm:gap-3">
                                    <div className="flex items-center gap-2.5 pt-0 pb-2 sm:pb-3 px-0 w-full border-b [border-bottom-style:solid] border-[#383838]">
                                        <h2 className="flex-1 [font-family:'Poppins',Helvetica] font-semibold text-white text-xs sm:text-sm text-center tracking-[0] leading-4 sm:leading-5">
                                            Example
                                        </h2>
                                    </div>

                                    <p className="w-full [font-family:'Poppins',Helvetica] font-light text-white text-xs sm:text-sm text-center tracking-[0] leading-4 sm:leading-5 mb-3 sm:mb-4 px-1 sm:px-2">
                                        If you&apos;re playing game say &quot;Fortnite&quot; &amp; the task is
                                        complete 5 levels of the game. Here&apos;s how XP Points benefits you
                                    </p>

                                    <div className="flex items-start justify-between w-full gap-1 sm:gap-2">
                                        {[
                                            { name: "Junior", points: "5", width: "42px", smWidth: "45px", mdWidth: "49px" },
                                            { name: "Mid-level", points: "8", width: "75px", smWidth: "82px", mdWidth: "90px" },
                                            { name: "Senior", points: "10", width: "48px", smWidth: "51px", mdWidth: "54px" },
                                        ].map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex flex-col items-start gap-0.5 sm:gap-1"
                                                style={{ width: item.width }}
                                            >
                                                <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[13px] sm:text-[14px] md:text-[15px] tracking-[0] leading-[normal]">
                                                    {item.name}
                                                </div>
                                                <div className="flex items-center">
                                                    <div
                                                        className="h-6 sm:h-[26px] md:h-7 rounded-[16px] sm:rounded-[17px] md:rounded-[18.64px] bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-1 sm:px-1.5"
                                                        style={{ width: item.width }}
                                                    >
                                                        <div className="[font-family:'Poppins',Helvetica] font-medium text-white text-[13px] sm:text-[14px] md:text-[15.3px] tracking-[0] leading-[14px] sm:leading-[15px] md:leading-[16.5px] flex items-center gap-[3px] sm:gap-[4px] whitespace-nowrap">
                                                            <span>{item.points}</span>
                                                            <img
                                                                className="w-[12px] h-[12px] sm:w-[14px] sm:h-[14px] md:w-[16px] md:h-[16px] mb-0.5 sm:mb-1 object-contain"
                                                                alt=""
                                                                src="/dollor.png"
                                                                aria-hidden="true"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                </section>
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default XPTierTracker;
