import React, { useEffect, useRef, useState } from "react";
import { getDailyChallengeCalendar } from "@/lib/api";
import { useDispatch, useSelector } from "react-redux";
import { useAuth } from "../../../contexts/AuthContext";
import {
    fetchCalendar,
    fetchToday,
    setModalOpen,
    clearError
} from "../../../lib/redux/slice/dailyChallengeSlice";
import { BannerSection } from "./BannerSection";
import { ChallengeGroupSection } from "./ChallengeGroupSection";
import { ChallengeModal } from "./ChallengeModal";

export const DailyChallenge = () => {
    // Redux state and dispatch
    const dispatch = useDispatch();
    const { token } = useAuth() || {};
    const {
        calendar,
        today,
        streak,
        calendarStatus,
        todayStatus,
        modalOpen,
        error
    } = useSelector((state) => state.dailyChallenge || {});

    const [isMonthLoading, setIsMonthLoading] = useState(false);
    const [pendingCalendar, setPendingCalendar] = useState(null);
    const calendarCacheRef = useRef({});
    const isLoading = calendarStatus === "loading" || todayStatus === "loading" || isMonthLoading;

    // Fetch data on component mount (only if not already prefetched)
    useEffect(() => {
        if (!token) {
            console.warn("⚠️ No authentication token available for daily challenge");
            return;
        }

        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();



        // Avoid duplicate requests if prefetch already ran
        if (calendarStatus === "idle") {
            dispatch(fetchCalendar({ year, month, token }));
        }
        if (todayStatus === "idle") {
            dispatch(fetchToday({ token }));
        }
    }, [dispatch, token, calendarStatus, todayStatus]);

    // Clear errors when component unmounts
    useEffect(() => {
        return () => {
            dispatch(clearError());
        };
    }, [dispatch]);

    // Keep local loading true during month navigation until calendar request settles
    useEffect(() => {
        if (calendarStatus === "loading") {
            setIsMonthLoading(true);
        } else {
            setIsMonthLoading(false);
            setPendingCalendar(null);
        }
    }, [calendarStatus]);

    // Cache the loaded calendar keyed by "year-month" for instant reuse
    useEffect(() => {
        if (calendar && calendarStatus === "succeeded" && typeof calendar.year === 'number' && typeof calendar.month === 'number') {
            const key = `${calendar.year}-${calendar.month}`;
            calendarCacheRef.current[key] = calendar;
        }
    }, [calendar, calendarStatus]);

    // Prefetch adjacent months via API (no UI swap) to have data ready before click
    useEffect(() => {
        if (!token) return;
        const baseYear = calendar?.year ?? new Date().getFullYear();
        const baseMonth = calendar?.month ?? new Date().getMonth();
        const base = new Date(baseYear, baseMonth, 1);
        const prev = new Date(base);
        prev.setMonth(prev.getMonth() - 1);
        const next = new Date(base);
        next.setMonth(next.getMonth() + 1);

        const tasks = [
            { y: prev.getFullYear(), m: prev.getMonth() },
            { y: next.getFullYear(), m: next.getMonth() },
        ];

        tasks.forEach(async ({ y, m }) => {
            const cacheKey = `${y}-${m}`;
            if (calendarCacheRef.current[cacheKey]) return;
            try {
                const resp = await getDailyChallengeCalendar(y, m, token);
                if (resp?.success && resp.data) {
                    calendarCacheRef.current[cacheKey] = resp.data;
                }
            } catch (_e) {
                // Ignore prefetch errors silently
            }
        });
    }, [token, calendar?.year, calendar?.month]);

    const generateSkeletonCalendar = (year, month) => {
        try {
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            // Show only the month label during preview to avoid confusing placeholder years
            const monthName = firstDay.toLocaleString('en-US', { month: 'long' }).toUpperCase();

            const startWeekday = firstDay.getDay(); // 0-6 (Sun-Sat)
            const daysInMonth = lastDay.getDate();

            const calendarDays = new Array(42).fill(null).map((_, index) => {
                const dayOffset = index - startWeekday + 1; // day numbers start at 1
                const inCurrent = dayOffset >= 1 && dayOffset <= daysInMonth;
                const dateObj = new Date(year, month, inCurrent ? dayOffset : 1);
                return {
                    day: inCurrent ? String(dayOffset) : "",
                    isToday: false,
                    isCompleted: false,
                    isMissed: false,
                    isLocked: !inCurrent,
                    isClickable: false,
                    isFuture: !inCurrent && index > startWeekday + daysInMonth - 1,
                    isPast: !inCurrent && index < startWeekday,
                    isCurrentMonth: inCurrent,
                    isPrevMonth: !inCurrent && index < startWeekday,
                    isNextMonth: !inCurrent && index > startWeekday + daysInMonth - 1,
                    challenge: null,
                    progress: null,
                    isMilestone: false,
                    date: dateObj.toISOString(),
                    dayOfWeek: index % 7,
                };
            });

            return {
                year,
                month,
                monthName,
                calendarDays,
                streak: calendar?.streak || { current: 0 },
            };
        } catch (e) {
            return { monthName: "", calendarDays: [] };
        }
    };

    // Handle month navigation
    const handlePreviousMonth = () => {
        if (isMonthLoading || calendarStatus === "loading") return;
        if (!token) return;

        const currentDate = new Date(calendar?.year || new Date().getFullYear(), calendar?.month || new Date().getMonth());
        const previousMonth = new Date(currentDate);
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        setIsMonthLoading(true);
        {
            const key = `${previousMonth.getFullYear()}-${previousMonth.getMonth()}`;
            const cached = calendarCacheRef.current[key];
            setPendingCalendar(cached || generateSkeletonCalendar(previousMonth.getFullYear(), previousMonth.getMonth()));
        }
        dispatch(fetchCalendar({
            year: previousMonth.getFullYear(),
            month: previousMonth.getMonth(),
            token
        }));
    };

    const handleNextMonth = () => {
        if (isMonthLoading || calendarStatus === "loading") return;
        if (!token) return;

        const currentDate = new Date(calendar?.year || new Date().getFullYear(), calendar?.month || new Date().getMonth());
        const nextMonth = new Date(currentDate);
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        setIsMonthLoading(true);
        {
            const key = `${nextMonth.getFullYear()}-${nextMonth.getMonth()}`;
            const cached = calendarCacheRef.current[key];
            setPendingCalendar(cached || generateSkeletonCalendar(nextMonth.getFullYear(), nextMonth.getMonth()));
        }
        dispatch(fetchCalendar({
            year: nextMonth.getFullYear(),
            month: nextMonth.getMonth(),
            token
        }));
    };

    // Handle today's challenge click
    const handleTodayClick = () => {
        if (today?.hasChallenge) {
            dispatch(setModalOpen(true));
        } else {
            // Show modal with response data instead of alert
            dispatch(setModalOpen(true));
        }
    };

    // Generate streak indicators dynamically based on streak data
    const generateStreakIndicators = () => {
        if (!streak?.current) return [];
        const indicators = [];
        const positions = ["64px", "148px", "190px", "233px", "276px", "318px"];
        for (let i = 0; i < 6; i++) {
            const hasStreak = i < Math.floor(streak.current / 5);
            indicators.push({
                left: positions[i],
                top: "527px",
                // image: hasStreak
                //     ? "https://c.animaapp.com/b23YVSTi/img/image-3943-7@2x.png"
                //     : "https://c.animaapp.com/b23YVSTi/img/image-3943-6@2x.png",
                hasStreak,
            });
        }
        return indicators;
    };

    const streakIndicators = generateStreakIndicators();

    // Generate treasure chests dynamically based on milestone progress
    const generateTreasureChests = () => {
        if (!streak?.milestones) return [];

        const chests = [];
        const positions = [
            { left: "43px", top: "calc(50.00%_-_247px)", width: "31px", height: "35px" },
            { left: "123px", top: "calc(50.00%_-_259px)", width: "37px", height: "47px" },
            { left: "203px", top: "calc(50.00%_-_270px)", width: "55px", height: "58px" },
        ];

        const images = [
            "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-2@2x.png",
            "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-3@2x.png",
            "https://c.animaapp.com/b23YVSTi/img/2211-w030-n003-510b-p1-510--converted--02-4@2x.png",
        ];

        streak.milestones.forEach((milestone, index) => {
            if (index < positions.length) {
                const isUnlocked = streak.current >= milestone;
                chests.push({
                    ...positions[index],
                    src: images[index],
                    isUnlocked,
                    milestone,
                });
            }
        });

        return chests;
    };

    const treasureChests = generateTreasureChests();

    // Generate coin badges dynamically based on today's challenge rewards
    const generateCoinBadges = () => {
        // If no challenge today, show default rewards or hide badges
        if (!today?.hasChallenge) return [];

        const badges = [];
        const positions = ["56.80%", "84.53%"];
        const images = [
            "https://c.animaapp.com/b23YVSTi/img/ellipse-35-1.svg",
            "https://c.animaapp.com/b23YVSTi/img/ellipse-35-2.svg",
        ];

        // Show default rewards if no specific rewards available
        const coins = today?.rewards?.coins || 100; // Default reward
        const xp = today?.rewards?.xp || 50; // Default

        badges.push({
            left: positions[0],
            value: coins.toString(),
            bgImage: images[0],
        });

        badges.push({
            left: positions[1],
            value: xp.toString(),
            bgImage: images[1],
        });

        return badges;
    };

    const coinBadges = generateCoinBadges();


    return (
        <div
            className="relative w-[375px] h-[640px] bg-black"
            data-model-id="3291:8378"
        >
            <div className="absolute top-[8px] left-7 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                App Version: V0.0.1
            </div>

            {/* Removed status bar */}

            <header className="flex flex-col w-[375px] items-start gap-2 px-5 py-3 absolute top-[36px]">
                <nav className="items-center gap-4 self-stretch w-full rounded-[32px] flex relative flex-[0_0_auto]">
                    <button aria-label="Go back">
                        <img
                            className="relative w-6 h-6"
                            alt="Arrow back ios new"
                            src="https://c.animaapp.com/b23YVSTi/img/arrow-back-ios-new@2x.png"
                        />
                    </button>

                    <h1 className="relative w-[255px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Daily Challenge
                    </h1>


                </nav>
            </header>

            {isLoading ? (
                pendingCalendar ? (
                    <BannerSection
                        calendar={pendingCalendar}
                        today={{ hasChallenge: false }}
                        onDayClick={() => { }}
                        onPreviousMonth={() => { }}
                        onNextMonth={() => { }}
                        onTodayClick={() => { }}
                        isDisabled
                    />
                ) : (
                    <section className="flex flex-col w-[375px] h-[343px] items-center gap-2.5 px-4 py-0 absolute top-[220px] left-0">
                        <article className="relative w-[335px] h-[343.08px] rounded-[17.96px] border border-gray-700/40 bg-gray-900 animate-pulse" />
                    </section>
                )
            ) : (
                <BannerSection
                    calendar={calendar || { monthName: "October 2025", calendarDays: [] }}
                    today={today || { hasChallenge: false, message: "No challenge available" }}
                    onDayClick={(dayData) => {
                        if (dayData.isToday) {
                            if (today?.hasChallenge) {
                                dispatch(setModalOpen(true));
                            } else {
                                // Show message that no challenge is available today
                                alert("No challenge available for today. Check back tomorrow!");
                            }
                        }
                    }}
                    onPreviousMonth={handlePreviousMonth}
                    onNextMonth={handleNextMonth}
                    onTodayClick={handleTodayClick}
                    isDisabled={isMonthLoading}
                />
            )}

            <div className="top-[566px] left-16 absolute w-3 h-3">

            </div>

            {/* {streakIndicators.map((indicator, index) => (
                <div
                    key={index}
                    style={{ top: indicator.top, left: indicator.left }}
                    className="absolute w-3 h-3"
                >
                    <img
                        className="absolute top-px left-px w-2.5 h-2.5 aspect-[1] object-cover"
                        alt="Streak indicator"
                        src={indicator.image}
                    />
                    <div className="absolute top-0 left-0 w-3 h-3 bg-[#d6d6d680] rounded-md" />
                </div>
            ))} */}



            <ChallengeGroupSection streak={streak || { current: 0, milestones: [5, 10, 20, 30], nextMilestone: 5 }} />

            {coinBadges.map((badge, index) => (
                <div
                    key={index}
                    className="absolute w-[8.54%] h-[3.63%] top-[24.63%] opacity-50"
                    style={{ left: badge.left }}
                >
                    <div className="absolute w-[30px] h-[29px] top-0 left-0 flex">
                        <div
                            className="flex-1 w-[30.03px] bg-[100%_100%]"
                            style={{ backgroundImage: `url(${badge.bgImage})` }}
                        >
                            <div className="relative w-[50.00%] h-[46.43%] top-[27.62%] left-[25.00%] overflow-hidden">
                                <img
                                    className="absolute w-full h-full top-[-477406.21%] left-[99394.81%]"
                                    alt="Coin icon"
                                    src="/img/vector.png"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="absolute w-[59.33%] h-[74.01%] top-[13.72%] left-[19.56%] [font-family:'Poppins',Helvetica] font-semibold text-[#815c23] text-[14.9px] tracking-[0.02px] leading-[normal]">
                        {badge.value}
                    </div>
                </div>
            ))}

            {/* Treasure chests moved to progress bar alignment */}

            <div className="absolute top-[calc(50.00%_-_250px)] left-[289px] w-[73px] h-[69px] flex">
                <img
                    className="-mt-6 w-[104.15px] h-[109.51px] ml-[-18.2px] object-cover"
                    alt="Buried treasure"
                    src="https://c.animaapp.com/b23YVSTi/img/png-clipart-buried-treasure-treasure-miscellaneous-treasure-tran@2x.png"
                />
            </div>

            <div className="absolute top-[590px] left-0 w-[375px] px-4 pb-2">
                <button
                    className={`relative w-full h-12 rounded-[12.97px] overflow-hidden transition-transform duration-150 scale-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 shadow-lg border-2 border-white/20 ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:scale-105'} bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)]`}
                    style={{
                        boxShadow: '0 8px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
                        transform: 'translateZ(10px)',
                        transformStyle: 'preserve-3d'
                    }}
                    onClick={isLoading ? undefined : handleTodayClick}
                    aria-label="Check Daily Challenge"
                    type="button"
                    disabled={isLoading}
                >
                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-[normal] whitespace-nowrap">
                        {isLoading ? 'Loading…' : 'Check Daily Challenge'}
                    </span>
                </button>
            </div>


            {/* Challenge Modal */}
            <ChallengeModal
                isOpen={modalOpen}
                onClose={() => dispatch(setModalOpen(false))}
                today={today}
                onStartChallenge={() => {
                }}
            />

            {/* Error Display */}
            {error && (
                <div className="fixed top-4 left-4 right-4 bg-red-500/90 text-white p-3 rounded-lg z-50">
                    <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Error: {error}</span>
                        <button
                            onClick={() => dispatch(clearError())}
                            className="text-white hover:text-gray-200"
                        >
                            ×
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
};
