"use client";
import Image from "next/image";
import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { handleGameDownload } from "@/lib/gameDownloadUtils";
import { fetchGamesBySection } from "@/lib/redux/slice/gameSlice";
import { getAgeGroupFromProfile, getGenderFromProfile } from "@/lib/utils/ageGroupUtils";
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
export const HighestEarningGame = () => {
    const router = useRouter();
    const dispatch = useDispatch();
    const [currentScaleClass, setCurrentScaleClass] = useState("scale-100");

    // Use new game discovery API for Highest Earning section
    const { gamesBySection, gamesBySectionStatus } = useSelector((state) => state.games);
    const { details: userProfile } = useSelector((state) => state.profile);

    // Get data for "Highest Earning" section specifically
    const sectionName = "Highest Earning";
    const highestEarningGames = gamesBySection[sectionName] || [];
    const highestEarningStatus = gamesBySectionStatus[sectionName] || "idle";

    // STALE-WHILE-REVALIDATE: Always fetch - will use cache if available and fresh
    useEffect(() => {
        // Get dynamic age group and gender from user profile
        const ageGroup = getAgeGroupFromProfile(userProfile);
        const gender = getGenderFromProfile(userProfile);

        console.log('🎮 HighestEarningGame: Using dynamic user profile:', {
            age: userProfile?.age,
            ageRange: userProfile?.ageRange,
            gender: userProfile?.gender,
            calculatedAgeGroup: ageGroup,
            calculatedGender: gender
        });

        // Always dispatch - stale-while-revalidate will handle cache logic automatically
        // This ensures:
        // 1. Shows cached data immediately if available (< 5 min old)
        // 2. Refreshes in background if cache is stale or 80% expired
        // 3. Fetches fresh if no cache exists
        dispatch(fetchGamesBySection({
            uiSection: sectionName,
            ageGroup,
            gender,
            page: 1,
            limit: 10
        }));
    }, [dispatch, sectionName, userProfile]);

    // Map the new API data to component format
    const processedGames = highestEarningGames?.slice(0, 2).map((game) => ({
        id: game._id || game.id,
        title: game.details?.name || game.name || game.title || 'Game',
        category: game.details?.category || (typeof game.categories?.[0] === 'string' ? game.categories[0] : 'Action'),
        image: game.images?.banner || game.images?.large_image || game.image || game.square_image,
        earnings: game.rewards?.coins ? `$${game.rewards.coins}` : (game.amount ? `$${game.amount}` : '$5'),
    })) || [];

    // Handle game click - navigate to game details
    const handleGameClick = (game) => {
        // Clear Redux state BEFORE navigation to prevent showing old data
        dispatch({ type: 'games/clearCurrentGameDetails' });

        // Use the id from the API response for navigation
        const gameId = game.id || game._id;
        router.push(`/gamedetails?gameId=${gameId}`);
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
    }, [getScaleClass]);

    // REMOVED: Loading state for better Android UX - show content immediately
    // Games will load in background without blocking UI
    return (
        <div
            className={`flex justify-between   items-center transition-transform p-4  duration-200 ease-in-out`}

        >
            <section className="flex flex-col w-full max-w-[335px] justify-center items-start gap-2.5 mx-auto ">
                <h3 className="font-semibold text-[#F4F3FC] text-[16px] opacity-[100%]">Highest Earning Games</h3>
                <div
                    className="flex items-center gap-[15px] w-full overflow-hidden pb-4"
                >
                    <div className="flex items-center gap-[15px] w-full">
                        {processedGames.length > 0 ? processedGames.map((game) => (
                            <article key={game.id} className="relative w-40 min-h-[320px] flex-shrink-0 cursor-pointer hover:scale-105 transition-all duration-200" onClick={() => handleGameClick(game)}>
                                <img
                                    className="absolute w-40 h-[180px] top-0 left-0 object-fit rounded-[20px]"
                                    src={game.image || game.square_image || '/placeholder-game.png'}
                                    alt={game.title || 'Game Image'}
                                />

                                <div className="flex flex-col w-[154px] gap-2 absolute top-[200px] left-0">
                                    <div className="flex flex-col ">
                                        <h4 className="font-semibold text-[#FFFFFF] text-[16px]">
                                            {String(game.title || 'Game').split(' - ')[0]}
                                        </h4>



                                        <div className="text-[#FFFFFF] mb-2 font-normal text-[13px]">{String(game.category || 'Action')}</div>
                                        <div
                                            className="relative w-[154px] h-[60px] rounded-[10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)]"
                                            data-model-id="2255:6425"
                                            role="banner"
                                            aria-label="Earn rewards banner"
                                        >
                                            <div className="absolute top-1.5 left-[9px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[normal]">
                                                Earn upto {String(game.earnings || '$5')}
                                            </div>

                                            <img
                                                className="absolute w-[20px] h-[20px] top-[7px] left-[124px] aspect-[0.97]"
                                                alt="Dollar coin icon"
                                                src="/dollor.png"
                                            />

                                            <div className="absolute h-[13px] top-[34px] left-[9px] [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-[13px] whitespace-nowrap">
                                                and 100
                                            </div>

                                            <img
                                                className="absolute w-5 h-[18px] top-7.5 left-[74px]"
                                                alt="XP points icon"
                                                src="/xp.svg"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </article>
                        )) : (
                            <div className="w-full flex flex-col items-center justify-center py-6 px-4">

                                <h4 className="[font-family:'Poppins',Helvetica] font-semibold text-[#F4F3FC] text-[14px] text-center mb-2">
                                    No Games Available
                                </h4>
                                <p className="[font-family:'Poppins',Helvetica] font-normal text-white text-[12px] text-center opacity-90">
                                    Check back later for new earning opportunities!
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    )
}
