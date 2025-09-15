import React from "react";
const goalSteps = [
    {
        id: 1,
        icon: "/goalstep1.svg",
        title: "Complete\n2 Games from Suggestions",
    },
    {
        id: 2,
        icon: "/goalstep2.svg",
        title: "Complete 5 Surveys",
    },
    {
        id: 3,
        icon: "/goalstep3.svg",
        title: "Reach Mid Level",
    },
];

const bottomSteps = [
    {
        id: 4,
        icon: "/goalstep4.svg",
        title: "Complete 1 Game from Race",
    },
    {
        id: 5,
        icon: "/goalstep5.svg",
        title: "Complete 5 Daily Challenges",
    },
];

export const GoalProgressSection = () => {
    return (
        <div
            className="relative  w-[334px] h-[390px] rounded-[20px] overflow-hidden bg-[linear-gradient(103deg,rgba(121,32,207,1)_0%,rgba(205,73,153,1)_80%)]"
        >
            <div className="relative h-[366px]">
                <div className="w-[334px] h-[354px] left-0 absolute top-0">
                    <h1 className="absolute top-[23px] left-6 [font-family:'Poppins',Helvetica] font-bold text-white text-[18px] tracking-[0] leading-6 whitespace-nowrap">
                        Follow the steps
                    </h1>

                    <p className="absolute top-[47px] left-6 [font-family:'Poppins',Helvetica] font-normal text-white text-[14px] tracking-[0] leading-6 whitespace-nowrap">
                        To Achieve Your Goal
                    </p>

                    <div className="absolute w-[212px] h-[29px] top-[76px] left-[25px] rounded-[6px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.6)_0%,rgba(113,106,231,0.6)_100%)]">
                        <span className="absolute top-[3px] left-2 [font-family:'Poppins',Helvetica] font-medium text-white text-[14px] tracking-[0] leading-[normal]">
                            Earn upto 100
                        </span>

                        <img
                            className="absolute w-[19px] h-[18px] top-[4px] left-[104px] aspect-[0.97]"
                            alt="Coin icon"
                            src="/dollor.png"
                        />

                        <span className="absolute h-[21px] top-[3px] left-[124px] [font-family:'Poppins',Helvetica] font-medium text-white text-[14px] tracking-[0] leading-[normal]">
                            and 500
                        </span>

                        <img
                            className="absolute w-[17px] h-[15px] top-1.5 left-[186px]"
                            alt="XP icon"
                            src="/xp.svg"
                        />
                    </div>
                </div>

                <img
                    className="absolute w-[113px] h-3 top-[146px] left-[33px]"
                    alt="Connection line"
                    src="/dot1.svg"
                />

                <img
                    className="absolute w-13 h-[132px] top-[154px] left-[282px]"
                    alt="Connection line"
                    src="/dot3.svg"
                />

                <img
                    className="absolute w-[86px] h-3 top-[152px] left-[163px]"
                    alt="Connection line"
                    src="/dot2.svg"
                />

                <img
                    className="absolute w-[59px] h-4 top-[280px] left-[196px]"
                    alt="Connection line"
                    src="/dot4.svg"
                />

                <img
                    className="absolute w-[71px] h-4 top-[272px] left-[80px]"
                    alt="Connection line"
                    src="/dot5.svg"
                />
                <div className="absolute w-[300px] h-[184px] top-[129px] left-2">
                    {goalSteps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`inline-flex flex-col items-center gap-[5px] absolute top-0 ${index === 0
                                ? "left-0"
                                : index === 1
                                    ? "left-[121px]"
                                    : "left-[226px]"
                                }`}
                        >
                            <img
                                className="relative w-[53px] h-[52.81px]"
                                alt={`Step ${step.id} icon`}
                                src={step.icon}
                            />
                            <div className="relative w-[85px] text-center [font-family:'Poppins',Helvetica] font-normal text-white text-xs tracking-[0] leading-[18px]">
                                {step.title.split("\n").map((line, lineIndex) => (
                                    <React.Fragment key={lineIndex}>
                                        {line}
                                        {lineIndex < step.title.split("\n").length - 1 && <br />}
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="absolute w-[179px] h-28 top-[254px] left-[130px]">
                    {bottomSteps.map((step, index) => (
                        <div
                            key={step.id}
                            className={`flex flex-col w-[74px] items-center gap-[5px] absolute top-0 ${index === 0 ? "left-0" : "left-[105px]"
                                }`}
                        >
                            <img
                                className="relative w-[53px] h-[52.81px]"
                                alt={`Step ${step.id} icon`}
                                src={step.icon}
                            />
                            <p className="relative self-stretch text-center [font-family:'Poppins',Helvetica] font-normal text-white text-xs tracking-[0] leading-[18px]">
                                {step.title}
                            </p>
                        </div>
                    ))}
                </div>
                <img
                    className="absolute w-[86px] h-[86px] top-[264px] left-3 object-contain"
                    alt="Trophy reward"
                    src="/trophy@2x.png"
                />
            </div>
        </div>
    );
};