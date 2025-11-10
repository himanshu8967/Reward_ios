"use client";

import React, { useState, useEffect } from "react";

export const TimerBadge = ({ nextUnlockTime, isClaimed, countdown }) => {
    const [timeLeft, setTimeLeft] = useState("");
    const [isExpired, setIsExpired] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Only show timer if we have valid data
        if (!countdown && !nextUnlockTime) {
            setIsLoading(false);
            return;
        }

        setIsLoading(false);

        const calculateTimeLeft = () => {
            let timeUntilUnlock;

            if (countdown && countdown > 0) {
                // Use backend countdown (milliseconds)
                timeUntilUnlock = countdown;
            } else if (nextUnlockTime) {
                // Use nextUnlockTime if countdown not available
                const now = new Date().getTime();
                const unlockTime = new Date(nextUnlockTime).getTime();
                timeUntilUnlock = unlockTime - now;
            } else {
                // Don't show timer if no valid data
                setTimeLeft("");
                return;
            }

            if (timeUntilUnlock <= 0) {
                setIsExpired(true);
                setTimeLeft("Ready!");
                return;
            }

            const hours = Math.floor(timeUntilUnlock / (1000 * 60 * 60));
            const minutes = Math.floor((timeUntilUnlock % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeUntilUnlock % (1000 * 60)) / 1000);

            // Format: "23h:30m" for clear countdown display
            setTimeLeft(`${hours}h:${minutes.toString().padStart(2, '0')}m`);
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(interval);
    }, [nextUnlockTime, isClaimed, countdown]);

    // Only show timer if we have valid countdown data
    if (!countdown && !nextUnlockTime) return null;

    return (
        <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[120px] h-8 bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg flex items-center justify-center shadow-lg border border-purple-400 z-10">
            <div className="flex items-center gap-2">
                {/* Countdown Icon */}
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>

                {/* Timer Text */}
                <span className="text-white text-xs font-bold">
                    {isLoading ? "Loading..." : timeLeft}
                </span>
            </div>
        </div>
    );
};
