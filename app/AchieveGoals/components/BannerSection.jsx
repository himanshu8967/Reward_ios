import React, { useState } from "react";
import { useRouter } from "next/navigation";

export const BannerSection = () => {
    const [isPressed, setIsPressed] = useState(false);
    const router = useRouter();

    const handleChallengeClick = () => {
        setIsPressed(true);
        setTimeout(() => setIsPressed(false), 150);
        router.push("/dailychallenge");
    };

    return (
        <section
            className="flex flex-col h-full w-full justify-center items-center  mt-2  mb-10 relative"
            role="banner"
            aria-label="Daily Challenge Banner"
        >
            {/* Preload images for fast rendering */}
            <img
                src="/arhievegolasbanner.png"
                alt=""
                className="hidden"
                loading="eager"
                fetchPriority="high"
            />
            <img
                src="/tesurebox.png"
                alt=""
                className="hidden"
                loading="eager"
                fetchPriority="high"
            />
            <div className="relative w-full max-w-[340px] h-[176px]">
                <div
                    className="relative w-full max-w-[335px] h-full border border-white/30 rounded-[22px] overflow-hidden bg-cover bg-center bg-no-repeat bg-black"
                    style={{ backgroundImage: "url('/arhievegolasbanner.png')" }}
                >

                    <h2 className="absolute w-[204px] top-[19px] left-4 [font-family:'Poppins',Helvetica] font-bold text-white text-[18px] tracking-[-0.18px] leading-[normal]">
                        Complete Daily Challenges
                    </h2>

                    <div className="absolute w-[97px] h-[97px] top-[19px] right-4">
                        <img
                            className="w-full h-full object-cover"
                            alt="Treasure chest with golden coins"
                            src="/tesurebox.png"
                            loading="eager"
                            fetchPriority="high"
                        />
                    </div>

                    <div className="absolute w-[90px] h-[33px] top-[78px] left-4 rounded-[10px] overflow-hidden bg-[linear-gradient(107deg,rgba(200,117,251,1)_0%,rgba(16,4,147,1)_100%)]">
                        <div className="absolute inset-0 flex items-center justify-center [font-family:'Poppins',Helvetica] font-medium text-white text-[16px] tracking-[0] leading-5 whitespace-nowrap">
                            Earn $20
                        </div>
                    </div>

                    <div className="absolute bottom-0 left-0 w-full h-[46px] rounded-b-[22px] bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] flex items-center justify-center">
                        <button
                            className={`[font-family:'Poppins',Helvetica] font-semibold text-white text-[14px] tracking-[-0.14px] leading-[normal] cursor-pointer transition-transform duration-150 hover:scale-105  focus:ring-opacity-50 ${isPressed ? "transform scale-95" : ""
                                }`}
                            onClick={handleChallengeClick}
                            aria-label="Check daily challenge to earn rewards"
                            type="button"
                        >
                            Check Challenge
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
};
