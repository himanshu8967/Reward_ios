"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";

const SCALE_CONFIG = [
    { minWidth: 0, scaleClass: "scale-90" },
    { minWidth: 320, scaleClass: "scale-90" },
    { minWidth: 375, scaleClass: "scale-100" },
    { minWidth: 480, scaleClass: "scale-125" },
    { minWidth: 640, scaleClass: "scale-120" },
    { minWidth: 768, scaleClass: "scale-150" },
    { minWidth: 1024, scaleClass: "scale-175" },
    { minWidth: 1280, scaleClass: "scale-200" },
    { minWidth: 1536, scaleClass: "scale-225" },
];


// Simple 5-Minute Timer Modal
const SimpleTimerModal = ({ onClose, timeLeft }) => {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-black rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border-2 border-white/20">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-white text-2xl font-bold mb-2">Please Wait</h2>
                    <p className="text-white/80 text-sm">5 minutes to see conversion rate</p>
                </div>

                {/* Timer */}
                <div className="text-center mb-6">
                    <div className="text-5xl font-bold text-white mb-2 font-mono">
                        {formatTime(timeLeft)}
                    </div>
                    <div className="text-white/60 text-sm">Time Remaining</div>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                    <p className="text-white text-base leading-relaxed">
                        Please wait 5 minutes to see the conversion rate and how much you get.
                    </p>
                </div>

                {/* Got it Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] text-white  cursor-pointer font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

// Simple Convert Now Modal
const ConvertNowModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/90 flex flex-col justify-center items-center z-50 p-4">
            <div className="bg-black rounded-2xl p-8 max-w-sm w-full mx-4 shadow-2xl border-2 border-white/20">
                {/* Header */}
                <div className="text-center mb-6">
                    <h2 className="text-white text-2xl font-bold mb-2">Convert Now</h2>
                    <p className="text-white/80 text-sm">Instant conversion available</p>
                </div>

                {/* Message */}
                <div className="text-center mb-6">
                    <p className="text-white text-base leading-relaxed">
                        If you want to see without wait, click on convert now.
                    </p>
                </div>

                {/* Got it Button */}
                <button
                    onClick={onClose}
                    className="w-full bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] text-white  cursor-pointer font-bold py-3 px-6 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                    Got it
                </button>
            </div>
        </div>
    );
};

export const Conversion = () => {
    // State Management
    const [conversionAmount, setConversionAmount] = useState("?");
    const [coinAmount, setCoinAmount] = useState("0"); // Editable coin input
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");
    const [flowState, setFlowState] = useState("idle"); // 'idle', 'timerRunning', 'convertNow'
    const [timeLeft, setTimeLeft] = useState(5 * 60); // 5 minutes in seconds
    const timerRef = useRef(null);

    // --- Simple Flow Handlers ---

    // Handle Convert in 5:00 - Show timer modal
    const handleScheduledConvert = () => {
        if (flowState !== "idle") return;

        setFlowState("timerRunning");
        setTimeLeft(5 * 60); // 5 minutes (300 seconds)

        timerRef.current = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 1) {
                    clearInterval(timerRef.current);
                    // Show conversion result after timer completes
                    const userAmount = parseFloat(coinAmount) || 0;
                    const conversionRate = 0.10; // 1 dollar = 10 coins, so 1 coin = 0.10 dollars
                    setConversionAmount((userAmount * conversionRate).toFixed(2));
                    setFlowState("idle"); // Reset if time runs out
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
    };

    // Handle Convert Now - Show simple modal
    const handleConvertNow = () => {
        if (flowState !== "idle") return;
        setFlowState("convertNow");
    };

    // Handle Convert Now modal close - Show conversion result
    const handleConvertNowClose = () => {
        const userAmount = parseFloat(coinAmount) || 0;
        const conversionRate = 0.10; // 1 dollar = 10 coins, so 1 coin = 0.10 dollars
        setConversionAmount((userAmount * conversionRate).toFixed(2));
        setFlowState("idle");
    };

    // Cleanup timer on component unmount
    useEffect(() => {
        return () => clearInterval(timerRef.current);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    const getScaleClass = useCallback((width) => {
        for (let i = SCALE_CONFIG.length - 1; i >= 0; i--) {
            if (width >= SCALE_CONFIG[i].minWidth) {
                return SCALE_CONFIG[i].scaleClass;
            }
        }
        return "scale-100";
    }, []);

    useEffect(() => {
        const updateScale = () => {
            setCurrentScaleClass(getScaleClass(window.innerWidth));
        };
        updateScale();

        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [getScaleClass]);

    return (
        <div className="flex p-4 w-full justify-center items-center">
            <div
                className={`flex flex-col  w-full max-w-[335px] items-start justify-between gap-2.5 relative transition-transform duration-200 ease-in-out`}
                role="main"
                aria-label="Currency conversion interface"
            >
                {/* Conditional rendering of overlays based on flowState */}
                {flowState === 'timerRunning' && (
                    <SimpleTimerModal
                        onClose={() => {
                            clearInterval(timerRef.current);
                            // Don't show conversion if user closes early
                            setFlowState("idle");
                        }}
                        timeLeft={timeLeft}
                    />
                )}
                {flowState === 'convertNow' && (
                    <ConvertNowModal
                        onClose={handleConvertNowClose}
                    />
                )}
                <h1 className="relative mb-1 text-family:'Poppins',Helvetica] font-semibold text-[#f4f3fc] text-[16px] tracking-[0] leading-[normal]">
                    Check Conversion Rates
                </h1>

                <div
                    className="inline-flex items-center justify-center gap-2.5 relative flex-[0_0_auto]"
                    role="group"
                    aria-label="Currency conversion calculator"
                >
                    {/* Editable Coin Input Field */}
                    <div
                        className={`relative h-[53px] flex items-center justify-center gap-1.5 rounded-[8px] border px-3 transition-all duration-200 ${flowState === 'idle'
                            ? 'border-[#3C3C3C] hover:border-purple-500/50 focus-within:border-purple-500'
                            : 'border-[#3C3C3C] opacity-50'
                            }`}
                        style={{
                            width: `${Math.max(80, Math.min(coinAmount.length * 14 + 50, 150))}px`,
                            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(0, 0, 0, 0.9) 100%)',
                        }}
                    >
                        <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={coinAmount}
                            onChange={(e) => {
                                const value = e.target.value;
                                // Allow only numbers and limit to 5 digits, allow empty string
                                if (/^\d*$/.test(value) && value.length <= 5) {
                                    setCoinAmount(value);
                                }
                            }}
                            className="bg-transparent text-white text-[13px] outline-none text-center font-medium [appearance:none] [-webkit-appearance:none] [-moz-appearance:textfield]"
                            placeholder="0"
                            disabled={flowState !== 'idle'}
                            style={{
                                width: `${Math.max(coinAmount.length * 14, 30)}px`,
                                textAlign: 'center'
                            }}
                        />
                        <img
                            className="w-[23px] h-[23px] flex-shrink-0"
                            alt="Coin"
                            src="https://c.animaapp.com/GgG4W9O5/img/image-3937@2x.png"
                        />
                    </div>

                    <div
                        className="relative w-3 h-[17px] font-semibold text-[#f4f3fc] text-base whitespace-nowrap [font-family:'Poppins',Helvetica] tracking-[0] leading-[normal]"
                        aria-label="equals"
                    >
                        =
                    </div>

                    {/* Second field: conversionAmount (Output result) */}
                    <div
                        className={`relative h-[53px] flex items-center rounded-[8px] border px-3 transition-all duration-200 ${flowState === 'idle'
                            ? 'border-[#3C3C3C] hover:border-purple-500/50 focus-within:border-purple-500'
                            : 'border-[#3C3C3C] opacity-50'
                            }`}
                        role="textbox"
                        aria-label="Converted amount"
                        style={{
                            width: `${Math.max(80, Math.min(conversionAmount.length * 8 + 50, 120))}px`,
                            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(0, 0, 0, 0.9) 100%)',
                        }}
                    >
                        <span
                            className="[font-family:'Poppins',Helvetica] font-normal text-neutral-400 text-[13px] tracking-[0] leading-[normal] text-center w-full"
                            aria-live="polite"
                            style={{ textAlign: 'center' }}
                        >
                            {conversionAmount}
                        </span>
                    </div>

                    {/* Currency Display (Static USD) */}
                    <div
                        className={`relative h-[53px] w-[85px] flex items-center rounded-[8px] border px-3 transition-all duration-200 ${flowState === 'idle'
                            ? 'border-[#3C3C3C] hover:border-purple-500/50'
                            : 'border-[#3C3C3C] opacity-50'
                            }`}
                        role="textbox"
                        aria-label="Target currency"
                        style={{
                            background: 'linear-gradient(to right, rgba(255, 255, 255, 0.2) 0%, rgba(255, 255, 255, 0.15) 20%, rgba(0, 0, 0, 0.9) 100%)',
                        }}
                    >
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-white text-[13px] tracking-[0] leading-[normal] text-center w-full">
                            USD
                        </span>
                    </div>
                </div>

                <div
                    className="inline-flex items-center gap-4  relative flex-[0_0_auto]"
                    role="group"
                    aria-label="Conversion options"
                >
                    {/* Convert in 5 Mins Button */}
                    <button
                        className="bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] relative w-[159px] h-10 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
                        onClick={handleScheduledConvert}
                        disabled={flowState !== 'idle'}
                        aria-label="Schedule conversion for 5 minutes"
                        role="button"
                        tabIndex={0}
                    >
                        <div className="absolute inset-0 flex justify-center items-center font-semibold text-white text-[13px]">
                            {flowState === 'timerRunning' ? `Time Left: ${formatTime(timeLeft)}` : 'Convert in 05:00'}
                        </div>
                    </button>

                    {/* Convert Now Button */}
                    <button
                        className="bg-[linear-gradient(180deg,rgba(251,159,68,1)_0%,rgba(241,188,132,1)_100%)] relative w-[159px] h-10 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 flex items-center justify-center"
                        onClick={handleConvertNow}
                        disabled={flowState !== 'idle'}
                        aria-label="Convert currency now"
                        role="button"
                        tabIndex={0}
                    >
                        <img className="w-7 h-7 mr-2" alt="Convert now icon" src="https://c.animaapp.com/GgG4W9O5/img/image-3941@2x.png" />
                        <span className="font-semibold text-white text-[13px]">
                            Convert Now
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};