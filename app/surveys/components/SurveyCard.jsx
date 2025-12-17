import React from 'react'

const SurveyCard = React.memo(({
    survey,
    showBorder = true,
    className = "",
    onClick,
    isEmpty = false,
    isCompleted = false
}) => {
    if (!survey && !isEmpty) return null;

    const handleClick = (e) => {
        if (onClick && !isCompleted) {
            onClick(survey, e)
        }
    }

    // Empty state component
    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center w-full py-8 px-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                    No Surveys Available
                </h3>
                <p className="text-gray-400 text-sm text-center mb-4 max-w-[280px]">
                    Check back later for new survey opportunities to earn XP and coins!
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Earn coins and XP with every survey!</span>
                </div>
            </div>
        )
    }

    // Determine if survey is internal or third-party
    const isInternal = survey.id && !survey.url;
    const isThirdParty = survey.url || survey.amount_currency;

    // Get reward information
    let coins = 0;
    let xp = 0;
    let rewardText = "";

    if (isInternal && survey.reward) {
        coins = survey.reward.coins || 0;
        xp = survey.reward.xp || 0;
        if (coins > 0 && xp > 0) {
            rewardText = `Earn ${coins} Coins + ${xp} XP`;
        } else if (coins > 0) {
            rewardText = `Earn ${coins} Coins`;
        } else if (xp > 0) {
            rewardText = `Earn ${xp} XP`;
        }
    } else if (isThirdParty && survey.amount) {
        const amount = survey.amount || 0;
        const currency = survey.amount_currency || "$";
        rewardText = `Earn ${currency}${amount}`;
        // Convert to approximate coins (you may need to adjust conversion rate)
        coins = Math.round(amount * 10); // Assuming $1 = 10 coins
    }

    // Get estimated time
    const estimatedTime = survey.estimatedTime || survey.length || 5;

    // Get title
    const title = survey.title || survey.name || "Survey";

    // Get category and difficulty - format as per requirement
    const category = survey.category || (isThirdParty ? "External" : "Survey");
    const difficulty = survey.difficulty || null;

    const stats = [];
    if (coins > 0) {
        stats.push({
            value: coins,
            icon: "https://c.animaapp.com/3btkjiTJ/img/image-3937@2x.png",
            iconAlt: "Coin",
        });
    }
    if (xp > 0) {
        stats.push({
            value: xp,
            icon: "https://c.animaapp.com/3btkjiTJ/img/pic.svg",
            iconAlt: "XP",
        });
    }

    return (
        <header
            className={`flex items-center justify-between py-4 px-0 border-b border-[#4d4d4d] ${isCompleted ? 'opacity-60' : 'cursor-pointer hover:opacity-90'} transition-opacity ${className}`}
            data-model-id="2035:3315"
            onClick={handleClick}
        >
            {/* Left Section - Survey Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Survey Icon/Image */}
                <div className="w-[55px] h-[55px] rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    {survey.image || survey.thumbnail ? (
                        <img
                            className="w-full h-full object-cover"
                            alt={`${title} survey icon`}
                            src={survey.image || survey.thumbnail}
                            onError={(e) => {
                                e.target.style.display = 'none';
                            }}
                        />
                    ) : (
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    )}
                </div>

                {/* Survey Details */}
                <div className="flex flex-col flex-1 min-w-0">
                    {/* Survey Title */}
                    <h1 className="[font-family:'Poppins',Helvetica] font-bold text-white text-base leading-tight truncate">
                        {title}
                    </h1>
                    {/* Display fields one by one with labels */}
                    <div className="flex flex-col gap-[2px] mt-[2px]">
                        {category && (
                            <div className="flex items-center gap-1.5">
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-400 text-[12px] leading-tight">
                                    Category:
                                </span>
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-300 text-[12px] leading-tight">
                                    {category}
                                </span>
                            </div>
                        )}
                        {difficulty && (
                            <div className="flex items-center gap-1.5">
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-400 text-[12px] leading-tight">
                                    Difficulty:
                                </span>
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-300 text-[12px] leading-tight">
                                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                </span>
                            </div>
                        )}
                        {estimatedTime && (
                            <div className="flex items-center gap-1.5">
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-400 text-[12px] leading-tight">
                                    Estimated Time:
                                </span>
                                <span className="[font-family:'Poppins',Helvetica] font-light text-gray-300 text-[12px] leading-tight">
                                    {estimatedTime} min
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Stats - AC2: Each card must show reward amount */}
                    {stats.length > 0 && (
                        <div className="flex gap-2 mt-1" role="list" aria-label="Survey rewards">
                            {stats.map((stat, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-center w-14 h-[29px] rounded-[10px] bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)] relative"
                                    role="listitem"
                                >
                                    <span className="[font-family:'Poppins',Helvetica] font-medium text-white text-sm leading-5">
                                        {stat.value}
                                    </span>
                                    <img
                                        className="w-4 h-4 ml-1"
                                        alt={stat.iconAlt}
                                        src={stat.icon}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                    {/* Third-party reward text - AC2: Show reward amount */}
                    {isThirdParty && survey.amount && stats.length === 0 && (
                        <div className="flex items-center mt-1">
                            <span className="[font-family:'Poppins',Helvetica] font-medium text-purple-400 text-sm">
                                {rewardText}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Right Section - Start/Completed Button */}
            <div className="flex-shrink-0 ml-5">
                {isCompleted ? (
                    <button
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-gray-600 cursor-not-allowed opacity-60"
                        type="button"
                        aria-label="Survey completed"
                        disabled
                    >
                        <svg className="w-[15px] h-[15px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm">
                            Done
                        </span>
                    </button>
                ) : (
                    <button
                        className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] cursor-pointer hover:opacity-90 transition-opacity"
                        type="button"
                        aria-label={`Start ${title} survey`}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (onClick) {
                                onClick(survey, e);
                            }
                        }}
                    >
                        <svg className="w-[15px] h-[15px] text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm">
                            Start
                        </span>
                    </button>
                )}
            </div>
        </header>
    )
});

SurveyCard.displayName = 'SurveyCard';

export default SurveyCard

