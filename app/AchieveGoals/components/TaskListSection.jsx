import React from "react";
const recommendationCards = [
    {
        id: 1,
        backgroundImage: "https://c.animaapp.com/31YGFzxZ/img/image-3992@2x.png",
        viewCount: "10.4 K",

    },
    {
        id: 2,
        backgroundImage: "https://c.animaapp.com/31YGFzxZ/img/13br-evergreens-purpink-newsheader2-1920x1080-339416315-1@2x.png",
        viewCount: "10.4 K",
    },
];

const RecommendationCard = ({ card }) => {
    return (
        <article className="flex flex-col w-[158px] rounded-md overflow-hidden shadow-lg">
            <div className="relative w-[158px] h-[158px]">
                <img
                    className="absolute inset-0 w-full h-full object-cover"
                    alt="Game promotion"
                    src={card.backgroundImage}
                />
                <div className="absolute top-2 right-2 h-[26px] bg-white/20 rounded-[5px] backdrop-blur-sm flex items-center px-2">
                    <img className="w-3.5 h-2.5" alt="views" src="/eye.svg" />
                    <span className="ml-1.5 [font-family:'Poppins',Helvetica] font-bold text-white text-[13px]">
                        {card.viewCount}
                    </span>
                </div>
            </div>
            <div className="flex flex-col h-[71px] p-2  bg-[linear-gradient(180deg,rgba(81,98,182,0.9)_0%,rgba(63,56,184,0.9)_100%)]">
                <p className="[font-family:'Poppins',Helvetica] font-light text-white text-[13px] whitespace-nowrap">
                    Only 10 Tasks
                </p>
                <div className="flex flex-col mt-auto">
                    <div className="flex items-center gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">Earn upto 100</p>
                        <img className="w-[18px] h-[19px]" alt="Coin" src="/dollor.png" />
                    </div>
                    <div className="flex items-center gap-1">
                        <p className="[font-family:'Poppins',Helvetica] font-medium text-white text-[14px]">and 50</p>
                        <img className="w-[21px] h-[16px]" alt="Reward icon" src="/xp.svg" />
                    </div>
                </div>
            </div>
        </article>
    );
};

export const TaskListSection = () => {
    return (
        <section className="flex flex-col  justify-center items-center gap-2 w-full ">
            <header>
                <h2 className="[font-family:'Poppins',Helvetica] font-semibold text-white text-[20px]">
                    💸💸Recommendations💸💸
                </h2>
            </header>
            <div className="flex items-start justify-center gap-3 self-stretch">
                {recommendationCards.map((card) => (
                    <RecommendationCard key={card.id} card={card} />
                ))}
            </div>
        </section>
    );
};