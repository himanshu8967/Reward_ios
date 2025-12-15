"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useDispatch, useSelector } from "react-redux";
import { fetchSurveys } from "@/lib/redux/slice/surveysSlice";

const SurveysSection = () => {
    const { token } = useAuth();
    const dispatch = useDispatch();
    const [activesIndex, setActivesIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const HORIZONTALS_SPREAD = 120;
    const MIN_SWIPE_DISTANCE = 50;

    // Get surveys from Redux store
    const { surveys, status, error } = useSelector((state) => state.surveys);

    // Fetch surveys on mount and when token changes
    useEffect(() => {
        if (!token) return;

        // Fetch surveys (will use cache if available)
        dispatch(fetchSurveys({ token }));
    }, [token, dispatch]);

    // Refresh surveys in background when app comes to foreground (admin might have updated)
    useEffect(() => {
        if (!token) return;

        const handleFocus = () => {
            console.log("🔄 [SurveysSection] App focused - refreshing surveys to get admin updates");
            dispatch(fetchSurveys({ token, force: true, background: true }));
        };

        // Listen for window focus (app comes to foreground)
        window.addEventListener("focus", handleFocus);

        // Also listen for visibility change (tab/app visibility)
        const handleVisibilityChange = () => {
            if (!document.hidden && token) {
                console.log("🔄 [SurveysSection] App visible - refreshing surveys to get admin updates");
                dispatch(fetchSurveys({ token, force: true, background: true }));
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.removeEventListener("focus", handleFocus);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [token, dispatch]);

    // Reset active index when surveys change
    useEffect(() => {
        if (surveys && surveys.length > 0) {
            setActivesIndex(0);
        }
    }, [surveys?.length]);

    const totalsCards = surveys?.length || 0;

    const handleSurveyClick = (survey) => {
        console.log('Survey clicked:', survey.title);
        // Directly redirect to clickUrl from survey response
        if (survey.clickUrl) {
            // Open in new tab/window
            window.open(survey.clickUrl, '_blank', 'noopener,noreferrer');
        } else {
            console.error('❌ Survey has no clickUrl');
        }
    };

    // Touch handlers for circular swipe
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd || isAnimating) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
        const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

        if (isLeftSwipe && surveys && surveys.length > 0) {
            setIsAnimating(true);
            setActivesIndex((prev) => (prev + 1) % surveys.length);
            setTimeout(() => setIsAnimating(false), 400);
        }
        if (isRightSwipe && surveys && surveys.length > 0) {
            setIsAnimating(true);
            setActivesIndex((prev) => (prev - 1 + surveys.length) % surveys.length);
            setTimeout(() => setIsAnimating(false), 400);
        }
    };

    // Circular rotation calculation
    const getCardTransform = (index, totalCards) => {
        const currentIndex = activesIndex;
        let offset = index - currentIndex;

        // Handle circular wrapping for smooth rotation
        if (offset > totalCards / 2) {
            offset = offset - totalCards;
        } else if (offset < -totalCards / 2) {
            offset = offset + totalCards;
        }

        // Calculate circular position with 3D effect
        const angle = (offset * 50) * (Math.PI / 180); // 50 degrees per card for smoother curve
        const radius = 70; // Circular radius
        const x = Math.sin(angle) * radius;
        const scale = 0.8 + (1 - Math.abs(offset) * 0.2);
        const opacity = 1 - Math.abs(offset) * 0.5;

        return {
            transform: `translateX(calc(-50% + ${x}px)) scale(${scale})`,
            opacity: Math.max(opacity, 0.4),
            zIndex: totalCards - Math.abs(offset),
        };
    };

    // Show loading state (only if no cached data)
    if (status === "loading" && (!surveys || surveys.length === 0)) {
        return (
            <div className="flex w-full flex-col my-1 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] text-[16px] font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                        Get Paid to do Surveys
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-white text-sm">Loading surveys...</p>
                </div>
            </div>
        );
    }

    // Show error state (only if we have an error and no surveys)
    if (status === "failed" && (!surveys || surveys.length === 0)) {
        return (
            <div className="flex w-full flex-col my-1 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] text-[16px] font-semibold leading-[normal] tracking-[0] text-[#FFFFFF]">
                        Get Paid to do Surveys
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-gray-400 text-sm">
                        {error || "No surveys available at the moment"}
                    </p>
                </div>
            </div>
        );
    }

    // Show empty state if no surveys but not loading/error
    if (!surveys || surveys.length === 0) {
        return (
            <div className="flex w-full flex-col my-1  mt-8 items-start gap-3 relative">
                <div className="flex w-full items-center justify-between">
                    <p className="[font-family:'Poppins',Helvetica] font-bold text-[#F4F3FC] pb-12   mr-20 text-xl opacity-[100%] leading-[normal] tracking-[0] t">
                        Get Paid to do Surveys
                    </p>
                </div>
                <div className="relative flex h-[190px] rounded-[10px] w-full items-center justify-center">
                    <p className="text-gray-400 text-lg">
                        No surveys available at the moment
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-between items-center transition-transform  px-2 mb-4 duration-200 ease-in-out">
            <section className="flex flex-col w-full max-w-[335px] justify-center items-start gap-2.5 mx-auto">
                <h3 className="font-bold text-[#F4F3FC] pb-12   mr-20 text-xl opacity-[100%]">
                    Get Paid to do Surveys
                </h3>
                <div
                    className="flex items-center gap-[15px] w-full overflow-visible px-2 relative mt-4"
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <div className="flex items-center gap-[15px] w-full relative" style={{ height: '200px', perspective: '1000px' }}>
                        {surveys.length > 0 ? surveys.map((survey, index) => {
                            // Get survey image (banner or icon)
                            const surveyImage = survey.banner || survey.icon || survey.category?.icon_url || "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-2@2x.png";

                            // Get coins and XP from reward object
                            const coins = survey.reward?.coins || 0;
                            const xp = survey.reward?.xp || 0;
                            const estimatedTime = survey.estimatedTime || 0;

                            // Calculate positioning for circular animation
                            const isThirdCard = index === 2;
                            const cardWidth = 'w-28'; // Same size for all cards
                            const cardHeight = 'min-h-[180px]'; // Same size for all cards
                            const imageHeight = 'h-[110px]'; // Same size for all cards
                            const bannerHeight = 'h-[55px]'; // Height to accommodate title, coins/XP, and time

                            // Get circular transform
                            const circularTransform = getCardTransform(index, surveys.length);
                            const isActive = index === activesIndex;

                            const cardStyle = {
                                position: 'absolute',
                                left: '50%',
                                ...circularTransform,
                                transition: isAnimating ? 'all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'all 0.3s ease-out',
                            };

                            return (
                                <article
                                    key={survey.id || survey.surveyId || index}
                                    className={`relative ${cardWidth} ${cardHeight} flex-shrink-0 cursor-pointer ${isActive ? 'hover:scale-110' : 'hover:scale-105'} transition-all duration-200`}
                                    style={cardStyle}
                                    onClick={() => {
                                        if (index !== activesIndex) {
                                            setIsAnimating(true);
                                            setActivesIndex(index);
                                            setTimeout(() => setIsAnimating(false), 400);
                                        } else {
                                            handleSurveyClick(survey);
                                        }
                                    }}
                                >
                                    {/* Unified Card Container */}
                                    <div className={`relative ${cardWidth} rounded-[15px] overflow-hidden border-2 border-white/20 bg-gradient-to-br from-gray-800 to-gray-900 shadow-lg`}>
                                        {/* Survey Image Section */}
                                        <div className={`relative w-full ${imageHeight} bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center`}>
                                            <img
                                                className="w-[64px] h-[64px] object-contain"
                                                src={surveyImage}
                                                alt="Survey"
                                                onError={(e) => {
                                                    e.target.src = "https://static.bitlabs.ai/categories/other.svg";
                                                }}
                                            />
                                            {/* Overlay to ensure visibility */}
                                            <div className="absolute inset-0 bg-black/10" />
                                        </div>

                                        {/* Gradient Banner Section - Connected */}
                                        <div
                                            className={`relative w-full ${bannerHeight} overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] flex flex-col justify-center px-3 py-1 gap-0.5`}
                                            role="banner"
                                            aria-label="Survey rewards banner"
                                        >
                                            {/* First Row - Title */}
                                            {survey.title && (
                                                <div className="flex items-center justify-start w-full">
                                                    <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[9px] tracking-[0] leading-tight break-words text-left">
                                                        {survey.title}
                                                    </span>
                                                </div>
                                            )}

                                            {/* Second Row - Coins and XP */}
                                            <div className="flex items-center justify-center w-full gap-3">
                                                <div className="flex items-center gap-1">
                                                    <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                        {coins}
                                                    </span>
                                                    <img
                                                        className="w-[11px] h-[11px] aspect-[0.97] translate-x-[1px] -translate-y-[1px]"
                                                        alt="Dollar coin icon"
                                                        src="/dollor.png"
                                                    />
                                                </div>

                                                {/* XP */}
                                                {xp > 0 && (
                                                    <div className="flex items-center gap-1">
                                                        <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[11px] tracking-[0] leading-[normal]">
                                                            {xp}
                                                        </span>
                                                        <img
                                                            className="w-[11px] h-[11px] translate-x-[1px] -translate-y-[1px]"
                                                            alt="XP points icon"
                                                            src="/xp.svg"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                            }}
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Third Row - Time */}
                                            {estimatedTime > 0 && (
                                                <div className="flex items-center justify-center w-full">
                                                    <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-[10px] tracking-[0] leading-[normal]">
                                                        {estimatedTime} min
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        }) : (
                            <div className="w-full flex flex-col items-center justify-center py-6 px-4">
                                <h4 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[14px] text-center mb-2">
                                    No Surveys Available
                                </h4>
                                <p className="[font-family:'Poppins',Helvetica] font-normal text-white text-[12px] text-center opacity-90">
                                    Check back later for new survey opportunities!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default SurveysSection;
