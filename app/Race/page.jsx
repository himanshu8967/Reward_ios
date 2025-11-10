"use client";
import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Race } from "./components/Race";
import { HomeIndicator } from "../../components/HomeIndicator";

const RacePage = () => {
    const router = useRouter();
    const [showTooltip, setShowTooltip] = useState(false);
    const tooltipRef = useRef(null);
    return (
        <div
            className="relative w-full min-h-screen bg-black pb-[150px]"
            onClick={() => setShowTooltip(false)}
        >
            {/* Header */}
            <div className="absolute w-full h-[49px] top-0 left-0 z-10 px-5">
                <div className="absolute top-[1px] left-5 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                    App Version: V0.0.1
                </div>
            </div>
            <header className="flex flex-col w-[375px] items-start gap-2 px-5 py-3 absolute top-[30px] left-0">
                <nav className="items-center gap-4 self-stretch w-full rounded-[32px] flex relative flex-[0_0_auto]">
                    <button
                        aria-label="Go back"
                        onClick={() => {
                            router.back();
                        }}
                    >
                        <svg
                            className="relative w-6 h-6 text-white cursor-pointer transition-transform duration-150 active:scale-95"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth={2.2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                        >
                            <path
                                d="M15 18l-6-6 6-6"
                                stroke="currentColor"
                                strokeWidth={2}
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                fill="none"
                            />
                        </svg>
                    </button>

                    <h1 className="relative w-[255px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xl tracking-[0] leading-5">
                        Race
                    </h1>

                    <button aria-label="Messages">
                        <img
                            className="relative w-6 h-6 mt-[-65182.00px] mr-[-15123.00px]"
                            alt="Messages chat"
                            src="/img/messages-chat.png"
                        />
                    </button>
                    {/* Show a clickable info icon that opens a tooltip modal */}
                    <button
                        aria-label="More information about Race"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowTooltip(!showTooltip);
                        }}
                        className="ml-2 focus:outline-none"
                        type="button"
                    >
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd"
                                d="M19.6004 9.99844C19.6004 12.5445 18.589 14.9863 16.7886 16.7867C14.9883 18.587 12.5465 19.5984 10.0004 19.5984C7.45431 19.5984 5.01252 18.587 3.21217 16.7867C1.41182 14.9863 0.400391 12.5445 0.400391 9.99844C0.400391 7.45236 1.41182 5.01056 3.21217 3.21021C5.01252 1.40986 7.45431 0.398438 10.0004 0.398438C12.5465 0.398438 14.9883 1.40986 16.7886 3.21021C18.589 5.01056 19.6004 7.45236 19.6004 9.99844ZM11.2004 5.19844C11.2004 5.5167 11.074 5.82192 10.8489 6.04697C10.6239 6.27201 10.3187 6.39844 10.0004 6.39844C9.68213 6.39844 9.37691 6.27201 9.15186 6.04697C8.92682 5.82192 8.80039 5.5167 8.80039 5.19844C8.80039 4.88018 8.92682 4.57495 9.15186 4.34991C9.37691 4.12487 9.68213 3.99844 10.0004 3.99844C10.3187 3.99844 10.6239 4.12487 10.8489 4.34991C11.074 4.57495 11.2004 4.88018 11.2004 5.19844ZM8.80039 8.79844C8.48213 8.79844 8.17691 8.92487 7.95186 9.14991C7.72682 9.37495 7.60039 9.68018 7.60039 9.99844C7.60039 10.3167 7.72682 10.6219 7.95186 10.847C8.17691 11.072 8.48213 11.1984 8.80039 11.1984V14.7984C8.80039 15.1167 8.92682 15.4219 9.15186 15.647C9.37691 15.872 9.68213 15.9984 10.0004 15.9984H11.2004C11.5187 15.9984 11.8239 15.872 12.0489 15.647C12.274 15.4219 12.4004 15.1167 12.4004 14.7984C12.4004 14.4802 12.274 14.175 12.0489 13.9499C11.8239 13.7249 11.5187 13.5984 11.2004 13.5984V9.99844C11.2004 9.68018 11.074 9.37495 10.8489 9.14991C10.6239 8.92487 10.3187 8.79844 10.0004 8.79844H8.80039Z"
                                fill="#8B92DF" />
                        </svg>
                    </button>
                    {showTooltip && (
                        <div
                            ref={tooltipRef}
                            className="absolute top-[34px] right-[-8px] z-50 w-[320px] bg-black/95 backdrop-blur-sm rounded-[12px] px-4 py-3 shadow-2xl border border-gray-600/50 animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal">
                                <div className="text-center text-gray-200">
                                    Race is a competition feature! Compete with other users by finishing tasks. The faster you complete, the higher you'll place and the better rewards you can win. Keep an eye on your progress and see if you can reach the top!
                                </div>
                            </div>
                            <div className="absolute top-[-8px] right-[25px] w-4 h-4 bg-black/95 border-t border-l border-gray-600/50 transform rotate-45"></div>
                        </div>
                    )}
                </nav>
            </header>

            {/* Main Content */}
            <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 pt-24 px-4">
                <Race />
            </div>

            {/* Home Indicator */}
            <HomeIndicator activeTab="home" />
        </div>
    );
};

export default RacePage;
