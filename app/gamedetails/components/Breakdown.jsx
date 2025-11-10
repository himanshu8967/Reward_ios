import React from "react";
import { useSelector } from "react-redux";

export const Breakdown = ({ game, sessionCoins = 0, sessionXP = 0 }) => {
    // Get wallet balance and in-progress games from Redux state
    const walletScreen = useSelector((state) => state.walletTransactions.walletScreen);
    const inProgressGames = useSelector((state) => state.games.inProgressGames);
    const balance = walletScreen?.wallet?.balance || 0;

    // Show actual number of games installed
    const gamesInstalled = inProgressGames ? inProgressGames.length : 0;

    // Calculate total earnings from all completed tasks across all installed games
    const calculateTotalEarnings = () => {
        if (!game?.goals) return 0;

        const completedGoals = game.goals.filter(goal => goal.completed === true);
        const totalEarnings = completedGoals.reduce((sum, goal) => sum + (goal.amount || 0), 0);

        return totalEarnings;
    };

    const totalEarnings = calculateTotalEarnings();

    const breakdownItems = [
        {
            id: 1,
            label: "Game Install",
            points: gamesInstalled, // Show actual number of games installed
            bonus: `+${gamesInstalled}`, // Show actual games installed
            bgColor: "bg-[linear-gradient(180deg,rgba(220,195,34,1)_0%,rgba(80,50,146,0.7)_100%)] ", // Same gradient as LevelsSection for "Install The Game"
            textColor: "text-white",
            vectorLeft: "https://c.animaapp.com/OGuKwK7i/img/vector-4235-2.svg",
            vectorRight: "https://c.animaapp.com/OGuKwK7i/img/vector-4234-2.svg",
            pic: "https://c.animaapp.com/OGuKwK7i/img/pic-2.svg",
        },
        {
            id: 2,
            label: "My Earnings",
            points: totalEarnings, // Show total earnings from all completed tasks
            bonus: `+${1}`, // Show total earnings
            bgColor: "bg-[linear-gradient(180deg,rgba(255,0,238,0.4)_0%,rgba(113,106,231,0.4)_100%)] ",
            textColor: "text-white",
            vectorLeft: "https://c.animaapp.com/OGuKwK7i/img/vector-4235-3.svg",
            vectorRight: "https://c.animaapp.com/OGuKwK7i/img/vector-4234-3.svg",
            pic: "https://c.animaapp.com/OGuKwK7i/img/pic-3.svg",
        }
    ];

    return (
        <div
            className="relative w-[342px] h-[220px] mt-6 bg-black rounded-2xl overflow-hidden border border-solid border-[#80e76a]"
            data-model-id="3212:8288"
        >
            <h1 className="absolute top-5 left-[17px] [font-family:'Poppins',Helvetica] font-bold text-white text-xl tracking-[0] leading-[normal]">
                Point Breakdown
            </h1>

            <div className="inline-flex items-center absolute top-12 left-[17px]">
                <p className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-light text-white text-xs tracking-[0] leading-[normal]">
                    Total earnings from completed tasks
                </p>
            </div>

            <div className="flex flex-col w-[302px] items-start gap-4 absolute top-[82px] left-4">
                {breakdownItems.map((item) => (
                    <div
                        key={item.id}
                        className={`${item.bgColor} relative self-stretch w-full h-10 rounded-[10px] flex items-center justify-between px-3`}
                    >
                        {/* Left side - Label */}
                        <div className="[font-family:'Poppins',Helvetica] font-bold text-white text-sm tracking-[0] leading-[normal]">
                            {item.label}
                        </div>

                        {/* Right side - Points and Coin */}
                        <div className="flex items-center gap-2">
                            <div className={`${item.textColor} [font-family:'Poppins',Helvetica] font-semibold text-sm tracking-[0] leading-[normal]`}>
                                {item.points}
                            </div>
                            <img
                                className="w-[23px] h-6 aspect-[0.97]"
                                alt="Coin icon"
                                src="https://c.animaapp.com/OGuKwK7i/img/image-3937-6@2x.png"
                            />
                        </div>

                        {/* Bottom decoration with XP badge */}
                        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-0 w-[89px] h-[22px]">
                            <div className="relative w-full h-full">
                                <div className="absolute top-0 left-[18px] w-[52px] h-[22px] bg-[#201f59] rounded-[4px_4px_0px_0px] shadow-[0px_0px_4px_#fef47e33]" />

                                <img
                                    className="absolute top-0.5 left-0 w-[19px] h-5"
                                    alt="Left decoration"
                                    src={item.vectorLeft}
                                />

                                <img
                                    className="absolute top-[3px] left-[70px] w-[18px] h-[19px]"
                                    alt="Right decoration"
                                    src={item.vectorRight}
                                />

                                <div className="absolute w-[calc(100%_-_71px)] top-px left-[26px] h-5 font-medium text-[13px] flex items-center justify-center [font-family:'Poppins',Helvetica] text-white tracking-[0] leading-[normal]">
                                    {item.bonus}
                                </div>

                                <img
                                    className="absolute top-1 left-[46px] w-4 h-[13px]"
                                    alt="XP icon"
                                    src={item.pic}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

