import React from 'react'

const GameItemCard = ({
    game,
    showBorder = true,
    className = "",
    onClick,
    isEmpty = false
}) => {
    const handleClick = (e) => {
        if (onClick) {
            onClick(game, e)
        }
    }
    console.log("game", game)
    // Empty state component
    if (isEmpty) {
        return (
            <div className="flex flex-col items-center justify-center w-full py-8 px-4">
                <div className="w-16 h-16 mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2 text-center">
                    No Games Downloaded Yet
                </h3>
                <p className="text-gray-400 text-sm text-center mb-4 max-w-[280px]">
                    Start your gaming journey! Download games to earn rewards and climb the leaderboard.
                </p>
                <div className="flex items-center gap-2 text-purple-400 text-sm">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Earn coins and XP with every game!</span>
                </div>
            </div>
        )
    }

    // Clean game name - remove platform suffix after "-"
    const cleanGameName = game.name.split(' - ')[0].trim();

    // Get genre from game object
    const genre = game.genre || game.category || "Game";

    const stats = [
        {
            value: game.amount || game.score || "0",
            icon: "https://c.animaapp.com/3btkjiTJ/img/image-3937@2x.png",
            iconAlt: "Coin",
        },
        {
            value: game.xp, // Hardcoded XP as requested
            icon: "https://c.animaapp.com/3btkjiTJ/img/pic.svg",
            iconAlt: "XP",
        },
    ];

    return (
        <header
            className={`flex items-center justify-between py-4 px-0 border-b border-[#4d4d4d] cursor-pointer hover:opacity-90 transition-opacity ${className}`}
            data-model-id="2035:3315"
            onClick={handleClick}
        >
            {/* Left Section - Game Info */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Game Image */}
                <div className="w-[55px] h-[55px] rounded-full overflow-hidden flex-shrink-0">
                    <img
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                        alt={`${cleanGameName} game icon`}
                        src={game.image || game.overlayImage || "/placeholder-game.png"}
                        onError={(e) => {
                            e.target.src = "/placeholder-game.png";
                        }}
                        onClick={(e) => {
                            e.stopPropagation(); // Prevent card click
                            if (onClick) {
                                onClick(game, e);
                            }
                        }}
                    />
                </div>

                {/* Game Details */}
                <div className="flex flex-col  flex-1 min-w-0">
                    {/* Game Name */}
                    <h1 className="[font-family:'Poppins',Helvetica] font-bold text-white text-base leading-tight truncate">
                        {cleanGameName}
                    </h1>
                    <h1 className="[font-family:'Poppins',Helvetica] mb-2  mt-[2px] font-light text-white text-[12px] leading-tight truncate">
                        ({genre})
                    </h1>

                    {/* Stats */}
                    <div className="flex gap-2" role="list" aria-label="Game statistics">
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
                </div>
            </div>

            {/* Right Section - Download Button */}
            <div className="flex-shrink-0 ml-5">
                <button
                    className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] cursor-pointer hover:opacity-90 transition-opacity"
                    type="button"
                    aria-label={`Download ${cleanGameName} game`}
                    onClick={(e) => {
                        e.stopPropagation(); // Prevent card click
                        if (game.downloadUrl || game.redirectUrl) {
                            window.open(game.downloadUrl || game.redirectUrl, '_blank');
                        } else if (onClick) {
                            onClick(game, e);
                        }
                    }}
                >
                    <img
                        className="w-[15px] h-[15px]"
                        alt=""
                        src="https://c.animaapp.com/3btkjiTJ/img/download.svg"
                        aria-hidden="true"
                    />
                    <span className="[font-family:'Poppins',Helvetica] font-normal text-white text-sm">
                        Download
                    </span>
                </button>
            </div>
        </header>
    )
}

export default GameItemCard
