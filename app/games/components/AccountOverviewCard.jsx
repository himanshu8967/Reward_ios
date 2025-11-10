"use client";
import React from 'react'
import Image from 'next/image'
import { useSelector, useDispatch } from 'react-redux'
import { fetchAccountOverview, claimAccountReward, updateAccountProgress } from '@/lib/redux/slice/accountOverviewSlice'
import ProgressSection from './ProgressSection'

const AccountOverviewCard = ({ userStats = null, className = "" }) => {
    // Get data from Redux store
    const dispatch = useDispatch();
    const { data: accountData, status, error } = useSelector((state) => state.accountOverview);

    // Loading and error states from Redux
    const isLoading = status === 'loading';
    const hasError = status === 'failed';

    /**
     * Format number with commas
     */
    const formatNumber = (num) => {
        return num.toLocaleString();
    };

    /**
     * Calculate progress percentage
     */
    const calculateProgressPercentage = (current, target) => {
        if (target === 0) return 0;
        return Math.min((current / target) * 100, 100);
    };

    // Use dynamic data from API response
    const totalCoins = accountData?.totalEarnings?.coins || 0;
    const totalXP = accountData?.totalEarnings?.xp || 0;
    const gamesPlayed = accountData?.progress?.gamesPlayed?.current || 0;
    const gamesTarget = accountData?.progress?.gamesPlayed?.target || 0;
    const coinsEarned = accountData?.progress?.coinsEarned?.current || 0;
    const coinsTarget = accountData?.progress?.coinsEarned?.target || 0;
    const challengesCompleted = accountData?.progress?.challengesCompleted?.current || 0;
    const challengesTarget = accountData?.progress?.challengesCompleted?.target || 0;

    if (isLoading) {
        return (
            <div className={`flex flex-col w-[335px] max-h-[479px] items-start gap-[16px] relative mx-auto ${className}`}>
                <div className="w-[334px] h-[479px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] relative flex items-center justify-center">
                    <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        <span className="text-white font-semibold">Loading account overview...</span>
                    </div>
                </div>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className={`flex flex-col w-[335px] max-h-[479px] items-start gap-[16px] relative mx-auto ${className}`}>
                <div className="w-[334px] h-[479px] rounded-[20px] overflow-hidden bg-red-900/20 border border-red-500 relative flex items-center justify-center">
                    <div className="text-center p-4">
                        <p className="text-red-400 font-semibold mb-2">Error loading account overview</p>
                        <p className="text-red-300 text-sm mb-4">{error}</p>
                        <button
                            onClick={() => dispatch(fetchAccountOverview())}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col w-[335px] max-h-[479px] items-start justify-center gap-[16px] relative mx-auto ${className}`}>
            <div className="flex flex-col items-start gap-2.5 self-stretch w-full relative">
                <div className="w-[334px] h-[479px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)] relative overflow-x-scroll">
                    <div className="relative w-[334px] h-[479px]">
                        <div className="absolute w-[334px] h-[91px] top-0 left-0">
                            <div className="top-8 left-20 font-bold text-xl leading-6 absolute [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] whitespace-nowrap">
                                My Account Overview
                            </div>
                            <Image
                                className="absolute w-[55px] h-[55px] top-4 left-4"
                                alt="Group"
                                src="https://c.animaapp.com/3mn7waJw/img/group-4@2x.png"
                                width={55}
                                height={55}
                            />
                        </div>

                        {/* Content Background */}
                        <div className="absolute w-[334px] h-[356px] top-[123px] left-0 bg-[#982fbb] rounded-[0px_0px_20px_20px]" />

                        {/* Progress Sections - Dynamic values from backend */}
                        <ProgressSection
                            title={`${gamesPlayed}/${gamesTarget} Games Played`}
                            progress={calculateProgressPercentage(gamesPlayed, gamesTarget)}
                            mainValue={`${accountData?.rewardBadges?.[0]?.reward?.coins || 0}`}
                            bonusValue={`+${accountData?.rewardBadges?.[0]?.reward?.xp || 0}`}
                            top="top-[138px]"
                            showBorder={true}
                        />

                        <ProgressSection
                            title={`${coinsEarned}/${coinsTarget} Coins Earned (Daily)`}
                            progress={calculateProgressPercentage(coinsEarned, coinsTarget)}
                            mainValue={`${accountData?.rewardBadges?.[1]?.reward?.coins || 0}`}
                            bonusValue={`+${accountData?.rewardBadges?.[1]?.reward?.xp || 0}`}
                            top="top-[253px]"
                            showBorder={true}
                        />

                        <ProgressSection
                            title={`${challengesCompleted}/${challengesTarget} Challenges Finished (Daily)`}
                            progress={calculateProgressPercentage(challengesCompleted, challengesTarget)}
                            mainValue={`${accountData?.rewardBadges?.[2]?.reward?.coins || 0}`}
                            bonusValue={`+${accountData?.rewardBadges?.[2]?.reward?.xp || 0}`}
                            top="top-[368px]"
                            showBorder={false}
                        />

                        {/* Header Background */}
                        <div className="absolute w-[334px] h-12 top-[78px] left-0 bg-[#80279e]" />

                        {/* Total Earnings Badge - Dynamic values from backend */}
                        <div className="left-36 flex w-[87px] h-[30px] items-center gap-[169px] absolute top-[87px]">
                            <div className="relative w-[87px] h-[30px]">
                                <div className="relative h-[29px] rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-2">
                                    <div className="flex items-center gap-1">
                                        <div className="font-semibold text-[18px] leading-[normal] [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] top-2 left-10">
                                            {formatNumber(totalCoins)}
                                        </div>
                                        <Image
                                            className="w-[23px] h-[23px] top-[5px] left-[48]"
                                            alt="Coin"
                                            src="https://c.animaapp.com/3mn7waJw/img/image-3937-4@2x.png"
                                            width={20}
                                            height={20}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Balance Badge - Dynamic values from backend */}
                        <div className="left-[236px] flex w-[90px] h-[30px] items-center gap-[169px] absolute top-[87px]">
                            <div className="relative w-[90px] h-[30px]">
                                <div className="relative h-[29px] rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-center px-2">
                                    <div className="flex items-center gap-1">
                                        <div className="font-semibold text-[18px] leading-[normal] [font-family:'Poppins',Helvetica] text-[#FFFFFF] tracking-[0] top-2 left-10">

                                            {formatNumber(totalXP)}
                                        </div>
                                        <Image
                                            className="w-[23px] h-[18px] top-[5px] left-[40]"
                                            alt="XP"
                                            src="https://c.animaapp.com/3mn7waJw/img/pic-7.svg"
                                            width={18}
                                            height={18}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Earnings Label */}
                        <div className="absolute top-[89px] left-5 [font-family:'Poppins',Helvetica] font-normal text-[#FFFFFF] text-[16px] tracking-[0] leading-6 whitespace-nowrap">
                            Total Earnings:
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AccountOverviewCard