"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';


const WatchAdCard = ({
    xpAmount = 5,
    coinAmount = 50,
    cooldownHours = 4,
    className = "",
    onClick,
    onAdComplete
}) => {
    // State management
    const [isAdAvailable, setIsAdAvailable] = useState(true);
    const [isWatchingAd, setIsWatchingAd] = useState(false);
    const [cooldownRemaining, setCooldownRemaining] = useState(0); // in minutes
    const [error, setError] = useState(null);
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);

    // API Configuration
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://rewardsapi.hireagent.co";


    useEffect(() => {
        checkAdAvailability();
        const interval = setInterval(() => {
            checkAdAvailability();
        }, 60000); // 60 seconds

        return () => clearInterval(interval);
    }, []);


    const checkAdAvailability = () => {
        const lastWatchedTime = localStorage.getItem('lastBoosterAdWatched');

        if (lastWatchedTime) {
            const timeDiff = Date.now() - parseInt(lastWatchedTime);
            const cooldownPeriod = cooldownHours * 60 * 60 * 1000; // Convert to milliseconds

            if (timeDiff < cooldownPeriod) {
                setIsAdAvailable(false);
                const remainingMs = cooldownPeriod - timeDiff;
                const remainingMinutes = Math.ceil(remainingMs / (60 * 1000));
                setCooldownRemaining(remainingMinutes);
            } else {
                setIsAdAvailable(true);
                setCooldownRemaining(0);
            }
        } else {
            setIsAdAvailable(true);
            setCooldownRemaining(0);
        }
    };

    /**
     * Format cooldown time for display
     */
    const formatCooldownTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    /**
     * Handle ad watch click
     * Integrates with ad network SDK and backend API
     */
    const handleAdClick = async (e) => {
        e.stopPropagation();

        // Check if ad is available
        if (!isAdAvailable) {
            setError('Ad is not available yet. Please wait for cooldown to expire.');
            setTimeout(() => setError(null), 3000);
            return;
        }

        if (isWatchingAd) {
            return;
        }

        // Custom onClick handler
        if (onClick) {
            onClick(e);
        }

        setIsWatchingAd(true);
        setError(null);

        try {
            // Get auth token
            const token = localStorage.getItem('authToken') || localStorage.getItem('x-auth-token');

            if (!token) {
                throw new Error('Authentication required. Please log in.');
            }
            await simulateAdWatch();

            // Ad completed successfully - send reward request to backend
            const response = await fetch(`${BASE_URL}/api/booster-reward`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rewardType: 'booster_ad',
                    coinAmount: coinAmount,
                    xpAmount: xpAmount,
                    source: 'rewarded_ad',
                    timestamp: Date.now(),
                    adId: `ad_${Date.now()}` // Unique ad identifier
                })
            });

            if (response.ok) {
                const result = await response.json();

                // Store last watched time
                localStorage.setItem('lastBoosterAdWatched', Date.now().toString());

                // Update state
                setIsAdAvailable(false);
                setCooldownRemaining(cooldownHours * 60);
                setShowSuccessMessage(true);

                // Call completion callback
                if (onAdComplete) {
                    onAdComplete({
                        coins: coinAmount,
                        xp: xpAmount,
                        success: true
                    });
                }

                // Hide success message after 3 seconds
                setTimeout(() => {
                    setShowSuccessMessage(false);
                }, 3000);


            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to process reward');
            }
        } catch (error) {
            console.error('❌ Ad watch failed:', error);
            setError(error.message || 'Failed to process ad reward. Please try again.');

            // Clear error after 5 seconds
            setTimeout(() => setError(null), 5000);
        } finally {
            setIsWatchingAd(false);
        }
    };

    /**
     * Simulate ad watching (replace with actual Ad SDK integration)
     */
    const simulateAdWatch = () => {
        return new Promise((resolve, reject) => {
            // Simulate 15-second ad
            const adDuration = 15000;
            setTimeout(() => {
                // Simulate 95% success rate
                const adCompleted = Math.random() > 0.05;

                if (adCompleted) {
                    resolve();
                } else {
                    reject(new Error('Ad was not completed'));
                }
            }, adDuration);
        });
    };

    /**
     * Render the component
     */
    return (
        <div className="relative w-full max-w-[335px] mx-auto mb-1">
            <div
                className={`relative w-full h-[100px] bg-[#360875] rounded-[10px] overflow-hidden ${isAdAvailable && !isWatchingAd ? 'cursor-pointer hover:shadow-lg hover:shadow-purple-500/50' : 'cursor-not-allowed opacity-75'
                    } transition-all duration-200 ${className}`}
                onClick={handleAdClick}
            >
                <div className="relative h-[99px] top-px bg-[url(https://c.animaapp.com/3mn7waJw/img/clip-path-group-3@2x.png)] bg-[length:100%_100%] bg-no-repeat bg-center">
                    {/* Content Section */}
                    <div className="flex flex-col w-[205px] h-12 items-start absolute top-[25px] left-[116px]">
                        <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto] mt-[2.4px]">
                            <p className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-normal text-white text-sm tracking-[0] leading-4 whitespace-nowrap">
                                {isAdAvailable && !isWatchingAd ? 'Watch an ad to get' : 'Next ad available in'}
                            </p>

                            {/* Reward Display or Cooldown */}
                            {isAdAvailable && !isWatchingAd ? (
                                <div className="flex items-center gap-1">
                                    <span className="relative w-fit ml-[-0.50px] [text-shadow:0px_4px_8px_#1a002f40] [-webkit-text-stroke:0.5px_transparent] [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,245,245,1)_100%)] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[28px] tracking-[0] leading-8 whitespace-nowrap">
                                        {coinAmount}
                                    </span>
                                    <Image
                                        className="w-[34px] h-[30px] mb-[2px] object-contain"
                                        alt="Coins"
                                        src="/dollor.png"
                                        width={34}
                                        height={30}
                                    />
                                </div>
                            ) : (
                                <div className="flex items-center gap-1">
                                    <span className="relative w-fit ml-[-0.50px] [text-shadow:0px_4px_8px_#1a002f40] [-webkit-text-stroke:0.5px_transparent] [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,245,245,1)_100%)] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[24px] tracking-[0] leading-8 whitespace-nowrap">
                                        {formatCooldownTime(cooldownRemaining)}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Left Icon/Image */}
                    <Image
                        className="absolute w-[85px] h-[85px] top-[9px] left-[11px] object-cover"
                        alt="Watch Ad"
                        src="https://c.animaapp.com/3mn7waJw/img/image-3941@2x.png"
                        width={85}
                        height={85}
                    />

                    {/* Loading Overlay */}
                    {isWatchingAd && (
                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-white text-sm font-medium [font-family:'Poppins',Helvetica]">
                                    Loading Ad...
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Success Message */}
            {showSuccessMessage && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-gradient-to-r from-[#4bba56] to-[#2a8a3e] rounded-lg p-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium [font-family:'Poppins',Helvetica]">
                            🎉 You earned {coinAmount} coins + {xpAmount} XP!
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-red-600 rounded-lg p-3 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="text-white text-sm font-medium [font-family:'Poppins',Helvetica]">
                            {error}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WatchAdCard;
