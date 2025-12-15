"use client";
import React, { useEffect, useState } from "react";

/**
 * RewardModal Component
 * 
 * Displays milestone reward popup with:
 * - Confetti animation
 * - Reward amount (coins + XP)
 * - Celebration message
 * - Claim button
 * 
 * @param {boolean} isVisible - Modal visibility state
 * @param {number} milestone - Milestone day (7, 14, 21, 30)
 * @param {number} coins - Coin reward amount
 * @param {number} xp - XP reward amount
 * @param {string} badge - Badge reward text
 * @param {function} onClose - Handler for closing modal
 */
export const RewardModal = ({
    isVisible = false,
    milestone = 7,
    coins = 0,
    xp = 0,
    badge = "",
    onClose
}) => {
    const [claiming, setClaiming] = useState(false);
    const [showConfetti, setShowConfetti] = useState(true);

    // Show confetti animation on mount
    useEffect(() => {
        if (isVisible) {
            setShowConfetti(true);
            const timer = setTimeout(() => {
                setShowConfetti(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isVisible]);

    // Handle reward claim
    const handleClaim = async () => {
        setClaiming(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setTimeout(() => {
                onClose();
                setClaiming(false);
            }, 500);
        } catch (error) {
            console.error('Failed to claim reward:', error);
            setClaiming(false);
        }
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Confetti Animation */}
            {showConfetti && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    {[...Array(50)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-2 h-2 rounded-full animate-confetti"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '-10%',
                                backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'][Math.floor(Math.random() * 5)],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Modal Content */}
            <div className="relative w-full max-w-[335px] bg-gradient-to-b from-purple-900 to-purple-950 rounded-[20px] border-2 border-yellow-400 overflow-hidden shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="relative h-32 bg-gradient-to-b from-yellow-400 to-yellow-500 flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16"></div>
                    </div>
                    <div className="relative text-center">
                        <h2 className="text-4xl font-bold text-purple-900 [font-family:'Lilita_One',Helvetica]">
                            🎉 MILESTONE!
                        </h2>
                        <p className="text-lg font-semibold text-purple-800 mt-1">
                            Day {milestone} Completed!
                        </p>
                    </div>
                </div>

                {/* Reward Details */}
                <div className="p-6 space-y-6">
                    {/* Congratulations Message */}
                    <div className="text-center">
                        <p className="text-white text-lg font-semibold [font-family:'Poppins',Helvetica]">
                            Amazing Work! 🌟
                        </p>
                        <p className="text-gray-300 text-sm mt-2 [font-family:'Poppins',Helvetica]">
                            You've earned your milestone rewards
                        </p>
                    </div>

                    {/* Rewards */}
                    <div className="flex gap-4 justify-center">
                        {/* Coins Reward - Only show if coins > 0 */}
                        {coins > 0 && (
                            <div className="flex flex-col items-center bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-[15px] px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <img
                                        className="w-8 h-8"
                                        alt="Coins"
                                        src="/dollor.png"
                                    />
                                    <span className="text-3xl font-bold text-white [font-family:'Lilita_One',Helvetica]">
                                        {coins}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-yellow-900">Coins</span>
                            </div>
                        )}

                        {/* XP Reward - Only show if xp > 0 */}
                        {xp > 0 && (
                            <div className="flex flex-col items-center bg-gradient-to-b from-purple-500 to-purple-600 rounded-[15px] px-6 py-4 shadow-lg">
                                <div className="flex items-center gap-2 mb-1">
                                    <img
                                        className="w-8 h-8"
                                        alt="XP"
                                        src="/xp.svg"
                                        onError={(e) => { e.target.src = "/xp.png"; }}
                                    />
                                    <span className="text-3xl font-bold text-white [font-family:'Lilita_One',Helvetica]">
                                        {xp}
                                    </span>
                                </div>
                                <span className="text-xs font-medium text-purple-900">XP Points</span>
                            </div>
                        )}
                    </div>

                    {/* Badge Display */}
                    {badge && (
                        <div className="text-center bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-3">
                            <p className="text-purple-900 text-sm font-bold [font-family:'Poppins',Helvetica]">
                                🏆 {badge}
                            </p>
                        </div>
                    )}

                    {/* Motivational Message */}
                    <div className="text-center bg-white/10 rounded-lg p-3">
                        <p className="text-white text-sm [font-family:'Poppins',Helvetica]">
                            {milestone === 30
                                ? "🏆 You've completed the entire streak! Amazing dedication!"
                                : `Keep going! Next milestone at Day ${milestone === 7 ? 14 : milestone === 14 ? 21 : 30}`
                            }
                        </p>
                    </div>

                    {/* Claim Button */}
                    <button
                        onClick={handleClaim}
                        disabled={claiming}
                        className={`w-full h-14 rounded-[15px] bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-purple-900 font-bold text-lg [font-family:'Poppins',Helvetica] shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 ${claiming ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                    >
                        {claiming ? (
                            <span className="flex items-center justify-center gap-2">
                                <div className="w-5 h-5 border-2 border-purple-900 border-t-transparent rounded-full animate-spin"></div>
                                Claiming...
                            </span>
                        ) : (
                            'Claim Rewards'
                        )}
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti linear forwards;
        }
        @keyframes scale-in {
          0% {
            transform: scale(0.8);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
        @keyframes fade-in {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
        </div>
    );
};

