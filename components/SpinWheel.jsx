import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getSpinConfig, getSpinStatus, performSpin, redeemSpinReward } from "@/lib/api";

export default function SpinWheel() {
    const { token } = useAuth();
    const [isSpinning, setIsSpinning] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [spins, setSpins] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [result, setResult] = useState("");
    const [coins, setCoins] = useState(0);
    const [pendingReward, setPendingReward] = useState(0);
    const [pendingSpinId, setPendingSpinId] = useState(null);
    const [isAdWatched, setIsAdWatched] = useState(false);
    const [appVersion] = useState("V0.0.1");
    const [dailySpinsUsed, setDailySpinsUsed] = useState(0);
    const [maxDailySpins, setMaxDailySpins] = useState(5);
    const [canSpin, setCanSpin] = useState(false);
    const [spinConfig, setSpinConfig] = useState(null);
    const [spinStatus, setSpinStatus] = useState(null);
    const [error, setError] = useState(null);

    // Audio ref for sound effects
    const audioRef = useRef(null);

    // Load spin config and status on mount
    useEffect(() => {
        if (token) {
            loadSpinData();
        }
    }, [token]);

    const loadSpinData = async () => {
        if (!token) return;

        setIsLoading(true);
        setError(null);

        try {
            console.log("🔄 [SPIN] Loading spin config and status...");

            // Load config and status in parallel
            const [configResponse, statusResponse] = await Promise.all([
                getSpinConfig(token),
                getSpinStatus(token)
            ]);

            if (configResponse.success && configResponse.data) {
                const config = configResponse.data;
                setSpinConfig(config);
                setMaxDailySpins(config.config?.maxSpinsPerDay || 5);
                console.log("✅ [SPIN] Config loaded:", config);
            }

            if (statusResponse.success && statusResponse.data) {
                const status = statusResponse.data;
                setSpinStatus(status);
                setCanSpin(status.canSpin || false);
                setSpins(status.remainingSpins || 0);
                setDailySpinsUsed((status.dailyLimit || 5) - (status.remainingSpins || 0));
                console.log("✅ [SPIN] Status loaded:", status);
            }
        } catch (err) {
            console.error("❌ [SPIN] Error loading spin data:", err);
            setError(err.message || "Failed to load spin data");
        } finally {
            setIsLoading(false);
        }
    };

    // Function to play sound effect
    const playSpinSound = () => {
        try {
            if (audioRef.current) {
                audioRef.current.currentTime = 0; // Reset to beginning
                audioRef.current.play().catch(error => {
                    console.log("Audio play failed:", error);
                });
            }
        } catch (error) {
            console.log("Sound effect error:", error);
        }
    };

    const handleSpin = async () => {
        console.log("🎰 [SPIN] Spin button clicked!", { isSpinning, spins, canSpin, dailySpinsUsed, maxDailySpins });

        if (!token) {
            setError("Please log in to spin");
            setShowResult(true);
            setResult("❌ Please log in to spin");
            setTimeout(() => setShowResult(false), 5000);
            return;
        }

        // Check if already spinning - COMMENTED OUT: Allow multiple clicks to see loading state
        // if (isSpinning) {
        //     console.log("⚠️ [SPIN] Already spinning...");
        //     return;
        // }

        try {
            console.log("🎰 [SPIN] Starting spin...");

            // Play sound effect when user clicks spin
            playSpinSound();

            setIsSpinning(true);
            setShowResult(false);
            setPendingReward(0);
            setPendingSpinId(null);
            setIsAdWatched(false);
            setError(null);

            // Call API to perform spin - always call API, even if no spins left
            // Backend will return error message if no spins available
            const spinResponse = await performSpin(token);

            if (spinResponse.success && spinResponse.data) {
                const spinData = spinResponse.data;
                console.log("✅ [SPIN] Spin result:", spinData);

                // Wait for animation to complete (3 seconds)
                setTimeout(() => {
                    setIsSpinning(false);

                    if (spinData.reward) {
                        const rewardAmount = spinData.reward.amount || 0;
                        const vipMultiplier = spinData.vipMultiplier || 1;
                        const finalReward = Math.floor(rewardAmount * vipMultiplier);

                        // Store pending reward and spin ID for redemption
                        setPendingReward(finalReward);
                        setPendingSpinId(spinData.spinId);

                        setResult(`🎉 Congratulations! You won ${finalReward} coins!\n\n${spinData.message || "Watch ad to redeem your reward."}`);
                        setShowResult(true);
                    } else {
                        setPendingReward(0);
                        setResult(`😔 Better Luck Next Time!\n\nNo reward this time.\nTry spinning again!`);
                        setShowResult(true);
                    }

                    // Reload status to update remaining spins
                    loadSpinData();

                    // Hide result after 5 seconds
                    setTimeout(() => {
                        setShowResult(false);
                    }, 5000);
                }, 3000);
            } else {
                // Handle backend error response
                const errorMessage = spinResponse.error || "Spin failed";
                const errorData = spinResponse.data || {};

                console.error("❌ [SPIN] Backend error:", errorMessage, errorData);
                setIsSpinning(false);

                // Show backend error message in modal
                let displayMessage = errorMessage;

                // Add "Daily spin limit reached" if it's a limit error
                if (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("daily")) {
                    if (!displayMessage.toLowerCase().includes("daily spin limit reached")) {
                        displayMessage = `Daily spin limit reached\n\n${displayMessage}`;
                    }
                }

                if (errorData.remainingSpins !== undefined && errorData.dailyLimit !== undefined) {
                    displayMessage = `${displayMessage}\n\nRemaining Spins: ${errorData.remainingSpins}/${errorData.dailyLimit}`;
                }

                setResult(`🚫 ${displayMessage}`);
                setShowResult(true);

                // Reload status to update remaining spins
                loadSpinData();

                // Hide result after 5 seconds
                setTimeout(() => {
                    setShowResult(false);
                }, 5000);
            }
        } catch (err) {
            console.error("❌ [SPIN] Spin error:", err);
            setIsSpinning(false);

            // Extract error message from API error
            let errorMessage = "Failed to spin. Please try again.";
            if (err.message) {
                errorMessage = err.message;
            } else if (err.body?.error) {
                errorMessage = err.body.error;
            } else if (err.body?.message) {
                errorMessage = err.body.message;
            }

            // Add "Daily spin limit reached" if it's a limit error
            if (errorMessage.toLowerCase().includes("limit") || errorMessage.toLowerCase().includes("daily")) {
                if (!errorMessage.toLowerCase().includes("daily spin limit reached")) {
                    errorMessage = `Daily spin limit reached\n\n${errorMessage}`;
                }
            }

            // Show error in modal
            setResult(`🚫 ${errorMessage}`);
            setShowResult(true);

            // Reload status
            loadSpinData();

            // Hide result after 5 seconds
            setTimeout(() => {
                setShowResult(false);
            }, 5000);
        }
    };

    const handleWatchToRedeem = async () => {
        if (!token) {
            setError("Please log in to redeem");
            return;
        }

        if (pendingReward > 0 && pendingSpinId) {
            console.log("💰 [REDEEM] Watch to Redeem clicked - Redeeming reward...");

            try {
                // Call API to redeem reward
                const redeemResponse = await redeemSpinReward(pendingSpinId, token);

                if (redeemResponse.success && redeemResponse.data) {
                    const redeemData = redeemResponse.data;
                    console.log("✅ [REDEEM] Reward redeemed:", redeemData);

                    // Update coins with new balance
                    if (redeemData.newBalance !== undefined) {
                        setCoins(redeemData.newBalance);
                    }

                    setIsAdWatched(true);
                    setResult(`✅ ${redeemData.reward || pendingReward}💰 added to your wallet!\n\n${redeemData.message || "Reward claimed successfully!"}`);
                    setShowResult(true);

                    // Clear pending reward and spin ID
                    setPendingReward(0);
                    setPendingSpinId(null);

                    // Reload status to update balance
                    loadSpinData();

                    // Hide result after 3 seconds
                    setTimeout(() => {
                        setShowResult(false);
                    }, 3000);
                } else {
                    throw new Error(redeemResponse.error || "Redemption failed");
                }
            } catch (err) {
                console.error("❌ [REDEEM] Redemption error:", err);
                setError(err.message || "Failed to redeem reward. Please try again.");
                setResult(`❌ Error: ${err.message || "Failed to redeem"}`);
                setShowResult(true);
                setTimeout(() => setShowResult(false), 5000);
            }
        } else {
            console.log("⚠️ [REDEEM] No pending reward to redeem");
            setResult("❌ No pending reward to redeem!");
            setShowResult(true);
            setTimeout(() => setShowResult(false), 3000);
        }
    };

    const handleBackToWallet = () => {
        console.log("Back to Wallet clicked");
        // In a real app, this would navigate to the wallet screen
        // For now, we'll just log it
    };

    const handleBackNavigation = () => {
        console.log("Back navigation clicked");
    };

    return (
        <div
            className="relative w-full h-[620px] bg-black overflow-hidden"
            data-model-id="3721:8597"
        >
            {/* Spin Count Display at Top */}
            <div className="absolute top-2 left-1/2 transform -translate-x-1/2 z-30">
                <motion.div
                    className="flex flex-col items-center gap-1 px-4 py-2 bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#B8860B] rounded-full shadow-[0_4px_15px_rgba(255,215,0,0.5)] border-2 border-[#FFD700]"
                    animate={isSpinning ? {
                        scale: [1, 1.1, 1],
                        boxShadow: [
                            "0 4px 15px rgba(255,215,0,0.5)",
                            "0 8px 25px rgba(255,215,0,0.8)",
                            "0 4px 15px rgba(255,215,0,0.5)"
                        ]
                    } : {
                        scale: [1, 1.05, 1]
                    }}
                    transition={isSpinning ? {
                        duration: 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    } : {
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <motion.span
                        className="text-[#2C1810] text-2xl font-black tracking-tight"
                        style={{
                            fontFamily: 'Arial Black, sans-serif',
                            fontWeight: 900,
                            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                        }}
                        animate={isSpinning ? {
                            scale: [1, 1.2, 1],
                            color: ["#2C1810", "#FFD700", "#2C1810"]
                        } : {}}
                        transition={isSpinning ? {
                            duration: 0.5,
                            repeat: Infinity,
                            ease: "easeInOut"
                        } : {}}
                    >
                        {isLoading ? "..." : spins}
                    </motion.span>
                    <span
                        className="text-[#2C1810] text-xs font-bold tracking-wide"
                        style={{
                            fontFamily: 'Arial Black, sans-serif',
                            fontWeight: 700,
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        SPINS
                    </span>
                </motion.div>
            </div>

            {/* 3D Animated Border for Slot Machine - COMMENTED OUT: White transparent overlay over PUSH TO SPIN button */}
            {/*
            <div className="absolute top-[20px] left-0 w-full h-[563px] z-20 pointer-events-none">
                <div className="relative w-full h-full">
                    <div className="absolute inset-0 rounded-[20px] border-[4px] border-gradient-to-br from-yellow-400 via-orange-500 to-red-700 shadow-[0_0_40px_10px_rgba(255,140,0,0.25),0_8px_32px_0_rgba(0,0,0,0.5)]"
                        style={{
                            boxShadow: `
                                0 0 32px 8px rgba(255, 200, 80, 0.25),
                                0 0 0 6px rgba(255, 180, 60, 0.10) inset,
                                0 8px 32px 0 rgba(0,0,0,0.5)
                            `,
                            borderImage: "linear-gradient(120deg, #FFD700 10%, #FF9800 40%, #B45309 90%) 1"
                        }}
                    ></div>
                    {["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"].map((pos, idx) => (
                        <span
                            key={pos}
                            className={`absolute ${pos} w-8 h-8 pointer-events-none`}
                        >
                            <span
                                className="block w-full h-full rounded-full bg-gradient-to-br from-yellow-300 via-orange-400 to-red-500 opacity-70 blur-[6px] animate-pulse"
                                style={{
                                    animationDelay: `${idx * 0.3}s`,
                                    filter: "drop-shadow(0 0 16px #FFD700) drop-shadow(0 0 32px #FF9800)"
                                }}
                            ></span>
                        </span>
                    ))}
                    {[
                        { className: "top-0 left-8 right-8 h-2", deg: 0 },
                        { className: "bottom-0 left-8 right-8 h-2", deg: 180 },
                        { className: "left-0 top-8 bottom-8 w-2", deg: 270 },
                        { className: "right-0 top-8 bottom-8 w-2", deg: 90 }
                    ].map((side, idx) => (
                        <span
                            key={side.className}
                            className={`absolute ${side.className} pointer-events-none`}
                        >
                            <span
                                className="block w-full h-full rounded-full bg-gradient-to-r from-yellow-200 via-orange-400 to-red-500 opacity-60 blur-[2px] animate-border-glow"
                                style={{
                                    animationDelay: `${idx * 0.2}s`,
                                    background: side.deg % 180 === 0
                                        ? "linear-gradient(90deg, #FFD700 0%, #FF9800 60%, #B45309 100%)"
                                        : "linear-gradient(180deg, #FFD700 0%, #FF9800 60%, #B45309 100%)"
                                }}
                            ></span>
                        </span>
                    ))}
                </div>
                <style jsx>{`
                    @keyframes border-glow {
                        0%, 100% { opacity: 0.7; filter: blur(2px) brightness(1.1);}
                        50% { opacity: 1; filter: blur(6px) brightness(1.4);}
                    }
                    .animate-border-glow {
                        animation: border-glow 2.2s ease-in-out infinite;
                    }
                `}</style>
            </div>
            */}


            <div className="absolute top-[20px] left-0 w-full h-[563px] aspect-[0.68] z-10">
                <img
                    className="w-full h-full object-cover transition-transform duration-300"
                    alt="Spin wheel slot machine"
                    src="/spinwheel.png"
                />

                {/* Slot Machine Display Overlay - "2 SPINS" with Coins */}
                <div className="absolute top-[52%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    {/* Side lights and main frame container */}
                    <div className="relative flex items-center">

                        {/* Left side lights with animation */}
                        <div className="flex flex-col gap-0.5 mr-1">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-gradient-to-br from-[#FFA500] to-[#FF8C00] rounded-full shadow-[0_0_4px_rgba(255,165,0,0.8)]"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                        {/* Main slot machine frame with 3D effects */}
                        <motion.div
                            className="relative bg-gradient-to-b from-[#8B4513] via-[#6B3410] to-[#4A2511] rounded-xl p-[3px] shadow-[0_8px_25px_rgba(0,0,0,0.8),0_4px_12px_rgba(0,0,0,0.6)]"
                            whileHover={{
                                scale: 1.02,
                                rotateY: 5,
                                rotateX: 2,
                            }}
                            whileTap={{
                                scale: 0.98,
                                rotateY: -2,
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                            {/* Inner brown display area with 3D depth */}
                            <div className="relative bg-gradient-to-b from-[#D2B48C] via-[#BC9A6A] to-[#A0522D] rounded-lg p-[4px] shadow-[inset_0_3px_8px_rgba(0,0,0,0.3),inset_0_-1px_2px_rgba(255,255,255,0.1)]">
                                {/* Three panel slots container */}
                                <div className="flex items-stretch gap-0 rounded-md overflow-hidden">

                                    {/* Left Coin Panel with 3D animation */}
                                    <motion.div
                                        className="flex items-center justify-center w-[60px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A] border-r-[1px] border-[#8B4513]"
                                        whileHover={{ scale: 1.05 }}
                                        animate={isSpinning ? {
                                            rotateY: [0, 10, -10, 10, 0],
                                            scale: [1, 1.05, 1.08, 1.05, 1]
                                        } : {}}
                                        transition={isSpinning ? { duration: 3, ease: "easeOut" } : { type: "spring", stiffness: 400 }}
                                    >
                                        {/* Coin Image */}
                                        <motion.div
                                            className="relative w-[35px] h-[35px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, 1800, 3600],
                                                rotateZ: [0, 720, 1440],
                                                rotateX: [0, 360, 720],
                                                scale: [1, 1.3, 1.1, 1.3, 1.15, 1],
                                                y: [0, -15, -10, -15, -5, 0]
                                            } : {
                                                rotateY: [0, 360],
                                                scale: [1, 1.05, 1],
                                                y: [0, -1, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: [0.43, 0.13, 0.23, 0.96],
                                                times: [0, 0.5, 0.7, 0.85, 0.95, 1]
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]"
                                                style={{
                                                    filter: isSpinning ? 'drop-shadow(0 0 20px rgba(255,215,0,1)) drop-shadow(0 0 35px rgba(255,165,0,0.9)) brightness(1.5) blur(0.3px)' : 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Center Panel - Coin Image Only */}
                                    <motion.div
                                        className="flex items-center justify-center w-[75px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A] border-r-[1px] border-[#8B4513] relative overflow-hidden"
                                        animate={isSpinning ? {
                                            boxShadow: [
                                                "inset 0 0 0 rgba(255,215,0,0)",
                                                "inset 0 0 40px rgba(255,215,0,1)",
                                                "inset 0 0 30px rgba(255,165,0,0.8)",
                                                "inset 0 0 40px rgba(255,215,0,1)",
                                                "inset 0 0 0 rgba(255,215,0,0)"
                                            ],
                                            scale: [1, 1.12, 1.08, 1.12, 1.05, 1],
                                            rotateZ: [0, 8, -8, 5, 0]
                                        } : {
                                            boxShadow: [
                                                "inset 0 0 0 rgba(255,215,0,0)",
                                                "inset 0 0 20px rgba(255,215,0,0.3)",
                                                "inset 0 0 0 rgba(255,215,0,0)"
                                            ]
                                        }}
                                        transition={isSpinning ? {
                                            duration: 3,
                                            ease: [0.43, 0.13, 0.23, 0.96],
                                            times: [0, 0.3, 0.6, 0.8, 1]
                                        } : {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }}
                                    >
                                        {/* Coin Image in Center */}
                                        <motion.div
                                            className="relative w-[45px] h-[45px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, 2160, 4320],
                                                rotateX: [0, 1080, 2160],
                                                rotateZ: [0, 540, 1080],
                                                scale: [1, 1.4, 1.2, 1.4, 1.2, 1],
                                                y: [0, -20, -15, -20, -10, 0]
                                            } : {
                                                rotateY: [0, 360],
                                                scale: [1, 1.1, 1],
                                                y: [0, -2, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: [0.43, 0.13, 0.23, 0.96],
                                                times: [0, 0.4, 0.6, 0.8, 0.9, 1]
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]"
                                                style={{
                                                    filter: isSpinning ? 'drop-shadow(0 0 20px rgba(255,215,0,1)) drop-shadow(0 0 35px rgba(255,165,0,0.9)) brightness(1.5) blur(0.3px)' : 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                    {/* Right Coin Panel with 3D animation */}
                                    <motion.div
                                        className="flex items-center justify-center w-[60px] h-[95px] bg-gradient-to-b from-[#DEB887] via-[#D2B48C] to-[#BC9A6A]"
                                        whileHover={{ scale: 1.05 }}
                                        animate={isSpinning ? {
                                            rotateY: [0, -10, 10, -10, 0],
                                            scale: [1, 1.05, 1.08, 1.05, 1]
                                        } : {}}
                                        transition={isSpinning ? { duration: 3, ease: "easeOut", delay: 0.1 } : { type: "spring", stiffness: 400 }}
                                    >
                                        {/* Coin Image */}
                                        <motion.div
                                            className="relative w-[35px] h-[35px]"
                                            animate={isSpinning ? {
                                                rotateY: [0, -1800, -3600],
                                                rotateZ: [0, -720, -1440],
                                                rotateX: [0, -360, -720],
                                                scale: [1, 1.3, 1.1, 1.3, 1.15, 1],
                                                y: [0, -15, -10, -15, -5, 0]
                                            } : {
                                                rotateY: [0, -360],
                                                scale: [1, 1.05, 1],
                                                y: [0, 1, 0]
                                            }}
                                            transition={isSpinning ? {
                                                duration: 3,
                                                ease: [0.43, 0.13, 0.23, 0.96],
                                                times: [0, 0.5, 0.7, 0.85, 0.95, 1],
                                                delay: 0.1
                                            } : {
                                                duration: 4,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(255,215,0,0.6)]"
                                                style={{
                                                    filter: isSpinning ? 'drop-shadow(0 0 20px rgba(255,215,0,1)) drop-shadow(0 0 35px rgba(255,165,0,0.9)) brightness(1.5) blur(0.3px)' : 'drop-shadow(0 0 6px rgba(255,215,0,0.6))'
                                                }}
                                            />
                                        </motion.div>
                                    </motion.div>

                                </div>

                                {/* Sparkle effects during spinning */}
                                {isSpinning && (
                                    <>
                                        {/* Left sparkles */}
                                        <motion.div
                                            className="absolute top-2 left-2 w-2 h-2 bg-yellow-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -20, -40],
                                                x: [0, -10, -20]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-4 left-4 w-1 h-1 bg-orange-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -15, -30],
                                                x: [0, 5, 10]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.3,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />

                                        {/* Right sparkles */}
                                        <motion.div
                                            className="absolute top-2 right-2 w-2 h-2 bg-yellow-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -20, -40],
                                                x: [0, 10, 20]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.2,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-4 right-4 w-1 h-1 bg-orange-400 rounded-full"
                                            animate={{
                                                scale: [0, 1, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -15, -30],
                                                x: [0, -5, -10]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.5,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />

                                        {/* Center sparkles */}
                                        <motion.div
                                            className="absolute top-1/2 left-1/2 w-1 h-1 bg-yellow-300 rounded-full"
                                            animate={{
                                                scale: [0, 1.5, 0],
                                                opacity: [0, 1, 0],
                                                y: [0, -10, -20],
                                                x: [0, 0, 0]
                                            }}
                                            transition={{
                                                duration: 1,
                                                delay: 0.1,
                                                repeat: 3,
                                                ease: "easeOut"
                                            }}
                                        />
                                    </>
                                )}
                            </div>
                        </motion.div>

                        {/* Right side lights with animation */}
                        <div className="flex flex-col gap-0.5 ml-1">
                            {[...Array(4)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 h-2 bg-gradient-to-br from-[#FFA500] to-[#FF8C00] rounded-full shadow-[0_0_4px_rgba(255,165,0,0.8)]"
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        opacity: [0.7, 1, 0.7],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                    }}
                                />
                            ))}
                        </div>

                    </div>
                </div>

                {/* PUSH TO SPIN Button Overlay */}
                <div className="absolute top-[67%] left-1/2  mr-2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                    <motion.button
                        onClick={handleSpin}
                        // disabled={isSpinning || isLoading} // COMMENTED OUT: Allow button to remain visible during spinning/loading
                        className={`w-[200px] h-12 text-white text-lg font-bold px-8 rounded-lg border-2 ${
                            // (isSpinning || isLoading) // COMMENTED OUT: Don't change styling during spinning/loading
                            //     ? 'bg-gray-600 border-gray-700 cursor-not-allowed opacity-50'
                            //     : 
                            'bg-gradient-to-b from-red-600 to-red-800 border-red-900 shadow-[0_8px_0px_#8f1a1a,inset_0_2px_4px_rgba(255,255,255,0.4)]'
                            }`}
                        whileHover={{ scale: 1.02 }} // COMMENTED OUT: Always allow hover effect
                        whileTap={{
                            scale: 0.98,
                            y: 4,
                            boxShadow: '0 4px 0px #8f1a1a, inset 0 2px 4px rgba(255,255,255,0.4)'
                        }} // COMMENTED OUT: Always allow tap effect
                    >
                        {isSpinning ? "SPINNING..." : isLoading ? "LOADING..." : "PUSH TO SPIN"}
                    </motion.button>
                </div>
            </div>

            <button
                onClick={handleWatchToRedeem}
                disabled={pendingReward === 0 || !pendingSpinId || isAdWatched}
                className={`top-[500px] left-[calc(50.00%_-_122px)] w-60 h-[55px] gap-[9.7px] rounded-[12.97px] overflow-hidden flex absolute cursor-pointer transition-all ${pendingReward > 0 && pendingSpinId && !isAdWatched
                    ? 'bg-[linear-gradient(180deg,rgba(223,131,40,1)_0%,rgba(221,135,42,1)_100%)] hover:scale-105'
                    : 'bg-gray-500 cursor-not-allowed opacity-50'
                    }`}
                aria-label="Redeem reward"
            >
                <img
                    className="mt-[7px] w-[42px] h-[42px] ml-[18px] aspect-[1] object-cover"
                    alt=""
                    src="https://c.animaapp.com/3wi5zxvU/img/image-3941@2x.png"
                />

                <span className="mt-[15.1px] w-[146px] h-6 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                    {isAdWatched ? 'Redeemed!' : pendingReward > 0 ? `Redeem ${pendingReward}💰` : 'No Reward to Redeem'}
                </span>
            </button>

            {/* Header with App Version and Back Button */}


            {/* Pending Reward Indicator */}
            {/* {pendingReward > 0 && (
                <div className="absolute  left-1/2 transform -translate-x-1/2 z-40">
                    <div className="bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg animate-pulse">
                        <div className="text-sm font-bold">🎉 {pendingReward}💰 Pending!</div>
                        <div className="text-xs">Watch ad to redeem</div>
                    </div>
            </div>
            )} */}

            {/* Error Display */}
            {error && (
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-900/90 text-white px-4 py-2 rounded-lg shadow-lg max-w-sm">
                    <p className="text-sm font-medium">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-2 text-xs underline"
                    >
                        Dismiss
                    </button>
                </div>
            )}

            {/* Result Modal */}
            {showResult && (
                <motion.div
                    className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <motion.div
                        className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-3xl p-5 mx-4 text-center shadow-2xl border-2 border-[#8f4d1e] max-w-sm relative overflow-hidden"
                        initial={{ scale: 0.8, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 50 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 25,
                            duration: 0.5
                        }}
                    >
                        {/* Animated background particles */}
                        <div className="absolute inset-0 overflow-hidden">
                            {[...Array(6)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                    animate={{
                                        x: [0, Math.random() * 200 - 100],
                                        y: [0, Math.random() * 200 - 100],
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0]
                                    }}
                                    transition={{
                                        duration: 2,
                                        delay: i * 0.2,
                                        repeat: Infinity,
                                        repeatDelay: 3
                                    }}
                                    style={{
                                        left: `${Math.random() * 100}%`,
                                        top: `${Math.random() * 100}%`
                                    }}
                                />
                            ))}
                        </div>

                        {/* Main content */}
                        <div className="relative z-10">
                            {/* Animated emoji with coin icons for congratulations */}
                            <motion.div
                                className="text-5xl mb-3"
                                animate={{
                                    scale: [1, 1.2, 1],
                                    rotate: [0, 5, -5, 0]
                                }}
                                transition={{
                                    duration: 0.6,
                                    repeat: result.includes("🎉") ? 3 : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {result.includes("🎉") ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span className="text-4xl">🎉</span>
                                        <motion.div
                                            animate={{
                                                rotate: [0, 360],
                                                scale: [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: 1,
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-7 h-7"
                                            />
                                        </motion.div>
                                    </div>
                                ) : result.includes("🚫") ? (
                                    <span className="text-4xl">🚫</span>
                                ) : (
                                    <span className="text-4xl">😔</span>
                                )}
                            </motion.div>

                            {/* Title with improved styling */}
                            <motion.h2
                                className="text-xl font-bold mb-3 text-white leading-tight"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.4 }}
                            >
                                {result.includes("🎉") ? "Congratulations!" :
                                    result.includes("🚫") ? "Daily Limit Reached" :
                                        "Better Luck Next Time"}
                            </motion.h2>

                            {/* Description with coin icons for rewards */}
                            <motion.div
                                className="text-base text-gray-300 mb-3 leading-snug"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.4 }}
                            >
                                {result.includes("🎉") ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <span>You won</span>
                                        <motion.div
                                            animate={{
                                                scale: [1, 1.2, 1],
                                                rotate: [0, 10, -10, 0]
                                            }}
                                            transition={{
                                                duration: 0.8,
                                                repeat: 2,
                                                ease: "easeInOut"
                                            }}
                                        >
                                            <img
                                                src="/dollor.png"
                                                alt="Coin"
                                                className="w-5 h-5"
                                            />
                                        </motion.div>
                                        <span className="font-bold text-yellow-400">{pendingReward}</span>
                                        <span>coins!</span>
                                    </div>
                                ) : result.includes("🚫") ? (
                                    <div>
                                        <p className="text-sm">You've used all {maxDailySpins} spins today.</p>
                                        <p className="text-xs text-gray-400 mt-1">Come back tomorrow!</p>
                                    </div>
                                ) : (
                                    <p className="text-sm">No reward this time. Try spinning again!</p>
                                )}
                            </motion.div>

                            {/* Status information */}
                            {!result.includes("🚫") && (
                                <motion.div
                                    className="bg-[#2a2a2a] rounded-xl p-3 mb-2"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ scale: [1, 1.02, 1] }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <p className="text-gray-400 text-xs">
                                        Daily Spins: <span className="text-yellow-400 font-semibold">{dailySpinsUsed}/{maxDailySpins}</span>
                                    </p>
                                </motion.div>
                            )}

                            {/* Limit reached info */}
                            {result.includes("🚫") && (
                                <motion.div
                                    className="bg-gradient-to-r from-red-900/30 to-red-800/20 rounded-xl p-3 mb-2 border border-red-700/50"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.4, duration: 0.3 }}
                                >
                                    <p className="text-red-300 text-xs font-medium">
                                        Daily Spins Used: {dailySpinsUsed}/{maxDailySpins}
                                    </p>
                                    <p className="text-gray-400 text-[10px] mt-0.5">
                                        Resets at midnight
                                    </p>
                                </motion.div>
                            )}

                            {/* Pending reward indicator */}
                            {pendingReward > 0 && (
                                <motion.div
                                    className="bg-gradient-to-r from-yellow-900/30 to-orange-800/20 rounded-xl p-3 border border-yellow-600/50"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{
                                        opacity: 1,
                                        y: 0,
                                        scale: [1, 1.02, 1]
                                    }}
                                    transition={{
                                        delay: 0.5,
                                        duration: 0.4,
                                        scale: {
                                            duration: 2,
                                            repeat: Infinity,
                                            ease: "easeInOut"
                                        }
                                    }}
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <img
                                            src="/dollor.png"
                                            alt="Coin"
                                            className="w-4 h-4"
                                        />
                                        <span className="text-yellow-400 font-bold text-xs">
                                            {pendingReward} coins pending
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-[10px] mt-0.5">
                                        Watch ad to redeem
                                    </p>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}

            {/* Audio element for sound effects */}
            <audio
                ref={audioRef}
                preload="auto"
                src="/spinning-coin-on-table-352448.mp3"
            />

        </div>
    );
}
