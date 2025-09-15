import React from "react";
import { useSelector } from "react-redux";

export const EarningsOverviewSection = () => {
    const summary = useSelector((state) => state.cashCoach.summary) || {};
    const {
        stats
    } = useSelector((state) => state.profile);
    const balance = stats?.balance ?? 0;

    console.log("summary", summary);

    const earningsData = [
        {
            id: 1,
            emoji: "🤑",
            title: "Salary",
            amount: summary.salary ?? 0,
            period: "month",
            hasIcon: true,
            iconSrc: "https://c.animaapp.com/1jLgqlGD/img/polygon-1.svg",
        },
        {
            id: 2,
            emoji: "💸",
            title: "Expense",
            amount: summary.expense ?? 0,
            period: "month",
            hasIcon: true,
            iconSrc: "https://c.animaapp.com/1jLgqlGD/img/polygon-1-1.svg",
        },
        {
            id: 3,
            emoji: "👝",
            title: "Savings",
            amount: summary.savings ?? 0,
            period: "month",
            hasIcon: false,
        },
        {
            id: 4,
            emoji: "📌",
            title: "Goals",
            amount: summary.goals ?? 0,
            period: "month",
            hasIcon: false,
        },
    ];

    const renderCard = (item) => (
        <div
            key={item.id}
            className="flex flex-col h-[124px] items-start justify-between p-4 relative flex-1 grow bg-black rounded-xl border border-solid border-[#515151]"
        >
            <div className="text-3xl">{item.emoji}</div>
            <div className="flex flex-col items-start relative self-stretch w-full">
                {item.hasIcon ? (
                    <div className="flex items-center justify-start gap-2 relative self-stretch w-full">
                        <img
                            className="relative w-3 h-[10.73px]"
                            alt="Indicator"
                            src={item.iconSrc}
                        />
                        <div className="relative [font-family:'Poppins',Helvetica] font-normal text-white text-base">
                            {item.title}
                        </div>
                    </div>
                ) : (
                    <div className="relative self-stretch [font-family:'Poppins',Helvetica] font-normal text-white text-base">
                        {item.title}
                    </div>
                )}

                <p className="relative flex items-center self-stretch [font-family:'Poppins',Helvetica]">
                    <span className="font-semibold text-white text-base">{`$${item.amount}`}</span>
                    <span className="font-normal text-white text-base">/{item.period}</span>
                </p>
            </div>
        </div>
    );

    return (
        <section className="flex flex-col items-start gap-3 self-stretch w-full">
            <div className=" font-normal  w-[334px]  text-[#A4A4A4] text-[10px] leading-3">
                App Version: V0.0.1
            </div>
            <div className="flex items-center justify-between   ">
                <h2 className="text-[#FFFFFF] font-semibold  ml-1 [font-family:'Poppins',Helvetica] text-[20px] my-2"> Cash Coach</h2>
                <div className="w-[87px] h-9 rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between ml-24 px-2.5">
                    <div className="text-white text-lg [font-family:'Poppins',Helvetica] font-semibold leading-[normal]">
                        {balance || 0}
                    </div>
                    <img
                        className="w-[23px] h-6"
                        alt="Image"
                        src="/dollor.png"
                    />
                </div>
            </div>
            <div className="flex w-full items-start justify-center gap-3">
                {earningsData.slice(0, 2).map(renderCard)}
            </div>
            <div className="flex w-full items-start justify-center gap-3">
                {earningsData.slice(2, 4).map(renderCard)}
            </div>
        </section>
    );
};