"use client";
import React from "react";

/**
 * InfoModal Component
 * 
 * Displays information about the 30-day streak feature:
 * - How it works
 * - Rules and requirements
 * - Milestone rewards
 * - Reset logic
 * 
 * @param {boolean} isVisible - Modal visibility state
 * @param {function} onClose - Handler for closing modal
 * @param {array} milestones - Milestone rewards from API
 */
export const InfoModal = ({ isVisible = false, onClose, milestones = [] }) => {
    if (!isVisible) return null;

    // Use API milestones if available, otherwise fallback to defaults
    const milestoneRewards = milestones.length > 0 
        ? milestones.map(m => ({
            day: m.day,
            coins: m.rewards?.find(r => r.type === 'coins')?.value || 0,
            xp: m.rewards?.find(r => r.type === 'xp')?.value || 0
        }))
        : [
            { day: 7, coins: 50, xp: 25 },
            { day: 14, coins: 100, xp: 50 },
            { day: 21, coins: 150, xp: 75 },
            { day: 30, coins: 250, xp: 125 }
        ];

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-2 animate-fade-in">
            <div className="relative w-full max-w-[95vw] bg-gradient-to-b from-gray-900 to-black rounded-[20px] border border-gray-600 overflow-hidden shadow-2xl max-h-[95vh] overflow-y-auto scrollbar-hide">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-xl font-bold text-white [font-family:'Poppins',Helvetica]">
                        ℹ️ How It Works
                    </h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full hover:bg-white/30 transition-all duration-200"
                        aria-label="Close"
                    >
                        <span className="text-white text-center mb-1 text-xl">×</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 pb-20 space-y-6">
                    {/* Main Rules */}
                    <div className="bg-white/5 rounded-[15px] p-4 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3 [font-family:'Poppins',Helvetica]">
                            📜 Basic Rules
                        </h3>
                        <ul className="space-y-2 text-gray-300 text-sm [font-family:'Poppins',Helvetica]">
                            <li className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Complete <strong>at least 1 task per day</strong> to maintain your streak</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Multiple tasks in one day still count as <strong>1 day progress</strong></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-yellow-400">⚠</span>
                                <span>Missing a day will reset your streak to the <strong>last milestone</strong></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Climb the tree from Day 1 to Day 30 to earn amazing rewards</span>
                            </li>
                        </ul>
                    </div>

                    {/* Milestone Rewards */}
                    <div className="bg-white/5 rounded-[15px] p-4 border border-white/10">
                        <h3 className="text-lg font-semibold text-white mb-3 [font-family:'Poppins',Helvetica]">
                            🎁 Milestone Rewards
                        </h3>
                        <div className="space-y-3">
                            {milestoneRewards.map((reward) => (
                                <div
                                    key={reward.day}
                                    className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-transparent rounded-lg p-3 border border-purple-500/30"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-b from-yellow-400 to-yellow-500 rounded-full shadow-lg">
                                            <span className="text-purple-900 font-bold text-lg [font-family:'Lilita_One',Helvetica]">
                                                {reward.day}
                                            </span>
                                        </div>
                                        <span className="text-white font-medium [font-family:'Poppins',Helvetica]">
                                            Day {reward.day}
                                        </span>
                                    </div>
                                    <div className="flex gap-3">
                                        {reward.coins > 0 && (
                                            <div className="flex items-center gap-1 bg-yellow-500/20 rounded-full px-3 py-1">
                                                <img
                                                    className="w-4 h-4"
                                                    alt="Coins"
                                                    src="/dollor.png"
                                                />
                                                <span className="text-yellow-400 font-bold text-sm">
                                                    {reward.coins}
                                                </span>
                                            </div>
                                        )}
                                        {reward.xp > 0 && (
                                            <div className="flex items-center gap-1 bg-purple-500/20 rounded-full px-3 py-1">
                                                <img
                                                    className="w-4 h-4"
                                                    alt="XP"
                                                    src="/xp.svg"
                                                    onError={(e) => { e.target.src = "/xp.png"; }}
                                                />
                                                <span className="text-purple-400 font-bold text-sm">
                                                    {reward.xp}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Streak Reset Logic */}
                    <div className="bg-red-500/10 rounded-[15px] p-4 border border-red-500/30">
                        <h3 className="text-lg font-semibold text-red-400 mb-3 [font-family:'Poppins',Helvetica] flex items-center gap-2">
                            ⚠️ What Happens If I Miss a Day?
                        </h3>
                        <p className="text-gray-300 text-sm [font-family:'Poppins',Helvetica] mb-3">
                            Don't worry! Your progress won't be completely lost:
                        </p>
                        <ul className="space-y-2 text-gray-300 text-sm [font-family:'Poppins',Helvetica]">
                            <li className="flex gap-2">
                                <span className="text-yellow-400">→</span>
                                <span>You'll return to your <strong>last completed milestone</strong></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-yellow-400">→</span>
                                <span>Example: If you're at Day 11 and miss a day, you'll restart from Day 7</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">✓</span>
                                <span>Your milestone rewards are <strong>safe and won't be lost</strong></span>
                            </li>
                        </ul>
                    </div>

                    {/* Tips & Tricks */}
                    <div className="bg-blue-500/10 rounded-[15px] p-4 border border-blue-500/30">
                        <h3 className="text-lg font-semibold text-blue-400 mb-3 [font-family:'Poppins',Helvetica] flex items-center gap-2">
                            💡 Pro Tips
                        </h3>
                        <ul className="space-y-2 text-gray-300 text-sm [font-family:'Poppins',Helvetica]">
                            <li className="flex gap-2">
                                <span className="text-green-400">★</span>
                                <span>Complete your daily task early in the day</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">★</span>
                                <span>Set a reminder to help maintain your streak</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">★</span>
                                <span>Focus on reaching milestones for maximum rewards</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-green-400">★</span>
                                <span>Check your progress daily to stay motivated</span>
                            </li>
                        </ul>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="w-full h-12 rounded-[15px] bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold text-base [font-family:'Poppins',Helvetica] shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                        Got It!
                    </button>
                </div>
            </div>

            <style jsx>{`
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
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
        </div>
    );
};

