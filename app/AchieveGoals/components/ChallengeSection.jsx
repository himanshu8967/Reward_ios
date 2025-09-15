import React from "react";

export const ChallengeSection = () => {
    const surveyProviders = [
        {
            id: 1,
            name: "Ayet Studios",
            logo: "/ayet.png",
            logoWidth: 65,
            logoHeight: 65,
            logoTop: 24,
            logoLeft: 18,
            textTop: 97,
            textLeft: 21,
            position: "left-0",
        },
        {
            id: 2,
            name: "CPX Research",
            logo: "/research.png",
            logoWidth: 70,
            logoHeight: 51,
            logoTop: 31,
            logoLeft: 41,
            textTop: 90,
            textLeft: 37,
            position: "left-[203px]",
        },
    ];

    return (
        <section className="flex flex-col w-full  items-center justify-center px-4 mb-36 gap-2.5 relative flex-[0_0_auto]">
            <div className="relative w-[335px] h-[190px]">
                <header className="relative mb-2 w-full h-6">
                    <h2 className="flex justify-between items-center  [font-family:'Poppins',Helvetica] font-semibold text-[#FFFFFF] text-[16px] tracking-[0] leading-[normal]">
                        Earn $20 🤑 by doing surveys for 5 days
                    </h2>
                </header>
                <div className="w-[335px] h-[190px]">
                    <div className="relative w-[339px] h-[190px]">
                        <div className="absolute w-[339px] h-40 top-[11px] left-0">
                            {surveyProviders.map((provider) => (
                                <div
                                    key={provider.id}
                                    className={`absolute w-[132px] h-40 top-0 ${provider.position} bg-[url(https://c.animaapp.com/31YGFzxZ/img/rectangle-74@2x.png)] bg-cover bg-[50%_50%]`}
                                >
                                    <div
                                        className="absolute [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-5"
                                        style={{
                                            top: `${provider.textTop}px`,
                                            left: `${provider.textLeft}px`,
                                        }}
                                    >
                                        {provider.name.split(" ").map((word, index) => (
                                            <React.Fragment key={index}>
                                                {word}
                                                {index < provider.name.split(" ").length - 1 && <br />}
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    <img
                                        className="absolute"
                                        style={{
                                            width: `${provider.logoWidth}px`,
                                            height: `${provider.logoHeight}px`,
                                            top: `${provider.logoTop}px`,
                                            left: `${provider.logoLeft}px`,
                                            aspectRatio: provider.logoWidth / provider.logoHeight,
                                        }}
                                        alt={`${provider.name} logo`}
                                        src={provider.logo}
                                    />
                                </div>
                            ))}
                        </div>

                        <img
                            className="absolute w-[165px] h-[190px] top-0 left-[79px] object-cover"
                            alt="BitLabs survey provider background"
                            src="https://c.animaapp.com/31YGFzxZ/img/rectangle-73-1@2x.png"
                        />

                        <div className="absolute w-[61px] h-6 top-[123px] left-[130px]">
                            <div className="absolute top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                                BitLabs
                            </div>
                        </div>

                        <img
                            className="absolute w-20 h-[78px] top-[39px] left-[119px] aspect-[1.03]"
                            alt="BitLabs logo"
                            src="/bitlab.png"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};
