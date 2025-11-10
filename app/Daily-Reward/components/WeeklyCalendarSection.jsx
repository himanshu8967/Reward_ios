"use client";

import React, { useState, useMemo, useCallback } from "react";
import { MemoizedButton } from "./PerformanceWrapper";

export const WeeklyCalendarSection = ({ weekData, currentWeekStart }) => {
    const [error, setError] = useState(null);

    // Memoized calendar days generation
    const generateCalendarDays = useCallback(() => {
        try {
            if (!weekData || !weekData.days) {
                setError("No week data available");
                return [];
            }

            const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
            const weekStart = new Date(weekData.weekStart);

            return weekData.days.map((dayData, index) => {
                const dayDate = new Date(weekStart);
                dayDate.setDate(dayDate.getDate() + index);

                return {
                    day: days[index],
                    date: dayDate.getDate().toString().padStart(2, '0'),
                    isActive: dayData.dayNumber === weekData.todayDayNumber,
                    status: dayData.status,
                    dayNumber: dayData.dayNumber
                };
            });
        } catch (err) {
            setError(err.message);
            return [];
        }
    }, [weekData]);

    // Memoized calendar days
    const calendarDays = useMemo(() => generateCalendarDays(), [generateCalendarDays]);

    // Memoized button styling
    const getButtonStyle = useCallback((item) => {
        if (item.isActive) {
            return "w-10 h-[43px] flex bg-[#716ae7] rounded-[10px]";
        } else if (item.status === 'claimed') {
            return "w-10 h-[57px] ml-[19px] flex bg-green-600 rounded-[10px]";
        } else if (item.status === 'missed') {
            return "w-10 h-[57px] ml-[19px] flex bg-red-600 rounded-[10px]";
        } else {
            return "w-10 h-[57px] ml-[19px] flex bg-gray-600 rounded-[10px]";
        }
    }, []);

    // Memoized margin classes
    const getMarginClass = useCallback((index) => {
        const marginMap = {
            0: "",
            1: "ml-[26px]",
            2: "ml-7",
            4: "ml-5",
            5: "ml-[27px]",
            6: "ml-[27px]"
        };
        return marginMap[index] || "ml-[27px]";
    }, []);

    // Memoized day margin classes
    const getDayMargin = useCallback((index) => {
        if (index === 0 || index === 4 || index === 5 || index === 6) {
            return "ml-[7px]";
        } else if (index === 1) {
            return "ml-[5px]";
        } else {
            return "ml-1.5";
        }
    }, []);

    // Memoized day width classes
    const getDayWidth = useCallback((index) => {
        if (index === 1) return "w-[11px]";
        if (index === 3) return "w-3";
        return "w-[7px]";
    }, []);

    // Memoized date width classes
    const getDateWidth = useCallback((index) => {
        return index === 6 ? "w-[21px]" : "w-5";
    }, []);

    // Memoized container width classes
    const getContainerWidth = useCallback((index) => {
        return index === 6 ? "w-[25px]" : "w-6";
    }, []);

    return (
        <nav
            className="w-full max-w-[328px] h-[57px] flex items-start justify-center"
            role="navigation"
            aria-label="Weekly calendar"
        >
            <div className="w-full max-w-[328px] mr-4 flex justify-center">
                {calendarDays.map((item, index) => {
                    if (item.isActive) {
                        const marginClass = getMarginClass(index);
                        return (
                            <MemoizedButton
                                key={index}
                                className={`${getButtonStyle(item)} ${marginClass} mt-[7px]`}
                                ariaLabel={`${item.day} ${item.date}, selected`}
                                aria-current="date"
                            >
                                <div className="w-full h-full flex flex-col items-center justify-center gap-px">
                                    <div className="w-3 h-[18px] [font-family:'Poppins',Helvetica] font-medium text-white text-xs tracking-[0] leading-[normal] text-center">
                                        {item.day}
                                    </div>
                                    <div className="w-5 text-white h-6 [font-family:'Poppins',Helvetica] font-semibold text-base text-center tracking-[0] leading-[normal]">
                                        {item.date}
                                    </div>
                                </div>
                            </MemoizedButton>
                        );
                    }

                    const marginClass = getMarginClass(index);
                    const dateWidth = getDateWidth(index);
                    const containerWidth = getContainerWidth(index);
                    const dayMargin = getDayMargin(index);
                    const dayWidth = getDayWidth(index);

                    return (
                        <MemoizedButton
                            key={index}
                            className={`mt-[7px] ${containerWidth} h-[43px] ${marginClass} flex flex-col gap-px`}
                            ariaLabel={`${item.day} ${item.date}`}
                        >
                            <div
                                className={`${dayMargin} ${dayWidth} h-[18px] [font-family:'Poppins',Helvetica] font-medium text-[#bcc1cd] text-xs text-center tracking-[0] leading-[normal]`}
                            >
                                {item.day}
                            </div>
                            <div
                                className={`${dateWidth} h-6 [font-family:'Poppins',Helvetica] font-semibold text-[#d5d5d5] text-base text-center tracking-[0] leading-[normal]`}
                            >
                                {item.date}
                            </div>
                        </MemoizedButton>
                    );
                })}
            </div>

            {/* Error Modal */}
            {error && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-black border border-gray-600 rounded-lg p-6 max-w-sm mx-4 animate-in slide-in-from-top-2 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white text-lg font-semibold">Error</h3>
                            <button
                                onClick={() => setError(null)}
                                className="text-white hover:text-gray-400 text-xl transition-colors"
                            >
                                ✕
                            </button>
                        </div>
                        <p className="text-red-500 text-sm">{error}</p>
                    </div>
                </div>
            )}
        </nav>
    );
};