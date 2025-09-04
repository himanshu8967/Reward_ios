"use client";
import React from "react";
import { useRouter, usePathname } from "next/navigation";

export const HomeIndicator = ({ activeTab }) => {
  const router = useRouter();
  const pathname = usePathname();

  // Auto-detect active tab based on current pathname if not explicitly provided
  const getActiveTab = () => {
    if (activeTab) return activeTab;

    if (pathname === "/homepage") return "home";
    if (pathname === "/games") return "games";
    if (pathname === "/wallet") return "wallet";
    if (pathname === "/cash-coach") return "cash";

    return "home"; // default fallback
  };

  const currentActiveTab = getActiveTab();

  const handleTabClick = (tabId, route) => {
    // Only navigate if a route is provided
    if (route) {
      router.push(route);
    }
  };

  // Helper function to apply distinct styles to active/inactive icons
  const getActiveIconStyle = (tabId) => {
    if (currentActiveTab === tabId) {
      // For active icons: Make them much brighter to stand out
      return { filter: 'brightness(1.8)' };
    }
    // For inactive icons: Make them slightly dimmer and transparent, matching inactive text
    return { filter: 'brightness(0.7) opacity(0.7)' };
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[9999]"
      data-model-id="730:32095"
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Main Container - Center aligned for all devices */}
      <div className="flex justify-center items-end w-full">
        <div className="w-full max-w-[375px] h-[100px] relative">

          {/* Background of the navbar */}
          <div className="absolute bottom-0 left-0 right-0 bg-black w-full h-[78px]"></div>

          {/* Home indicator line at the very bottom */}
          <div className="absolute bottom-[5px] left-1/2 transform -translate-x-1/2 w-[135px] h-[5px] bg-white rounded-[100px]"></div>

          {/* Navigation items container (buttons) */}
          <div className="absolute bottom-0 left-0 right-0 h-[78px] flex items-center justify-center px-6">
            <div className="flex items-center justify-between w-full max-w-[320px] relative">

              {/* Home Button */}
              <button
                className={`
                  group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                onClick={() => handleTabClick("home", "/homepage")}
                aria-label="Navigate to Home"
                aria-current={currentActiveTab === "home" ? "page" : undefined}
                tabIndex={0}
              >
                {/* Active Tab Glow Effect (Figma style) - Adjusted */}
                {currentActiveTab === "home" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10" // Icon above glow
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/home.svg"
                  role="presentation"
                  style={getActiveIconStyle("home")} // Apply active/inactive style
                />
                <span className={`text-[10px] font-normal z-10 ${currentActiveTab === "home" ? "text-white" : "text-[#ffffffb2]"}`}> {/* Text above glow */}
                  Home
                </span>
                {/* Active Dot below the tab */}
                {currentActiveTab === "home" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </button>

              {/* Games Button */}
              <button
                className={`
                  group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                onClick={() => handleTabClick("games", "/games")}
                aria-label="Navigate to My Games"
                aria-current={currentActiveTab === "games" ? "page" : undefined}
                tabIndex={0}
              >
                {/* Active Tab Glow Effect (Figma style) - Adjusted */}
                {currentActiveTab === "games" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-[35px] h-[16px] z-10" // Icon above glow
                  alt=""
                  src="/game.png"
                  role="presentation"
                  style={getActiveIconStyle("games")} // Apply active/inactive style
                />
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "games" ? "text-white" : "text-[#ffffffb2]"}`}> {/* Text above glow */}
                  My Games
                </span>
                {/* Active Dot below the tab */}
                {currentActiveTab === "games" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </button>

              {/* Center More Button - Half outside navbar */}
              {/* This button is intentionally not given an active state glow/dot */}
              <button
                className="flex flex-col items-center cursor-pointer focus:outline-none rounded-full absolute -top-[42px] left-1/2 transform -translate-x-1/2"
                onClick={() => handleTabClick("more", null)}
                aria-label="More options"
                tabIndex={0}
              >
                <img
                  className="w-[62px] h-[62px]"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/more.svg"
                  role="presentation"
                // No active style for 'more' button as per design, it's a fixed element
                />
              </button>

              {/* Wallet Button */}
              <button
                className={`
                  group flex flex-col  ml-4 items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                // onClick={() => handleTabClick("wallet", "/wallet")} // Uncommented onClick
                aria-label="Navigate to My Wallet"
                aria-current={currentActiveTab === "wallet" ? "page" : undefined}
                tabIndex={0}
              >
                {/* Active Tab Glow Effect (Figma style) - Adjusted */}
                {currentActiveTab === "wallet" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <div className="w-6 h-6 relative z-10"> {/* Container for image above glow */}
                  <img
                    className="absolute w-5 h-[18px] top-[3px] left-0.5"
                    alt=""
                    src="https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png"
                    role="presentation"
                    style={getActiveIconStyle("wallet")} // Apply active/inactive style
                  />
                </div>
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "wallet" ? "text-white" : "text-[#ffffffb2]"}`}> {/* Text above glow */}
                  My Wallet
                </span>
                {/* Active Dot below the tab */}
                {currentActiveTab === "wallet" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </button>

              {/* Cash Coach Button */}
              <button
                className={`
                  group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative
                `}
                // onClick={() => handleTabClick("cash", "/cash-coach")} // Uncommented onClick
                aria-label="Navigate to Cash Coach"
                aria-current={currentActiveTab === "cash" ? "page" : undefined}
                tabIndex={0}
              >
                {/* Active Tab Glow Effect (Figma style) - Adjusted */}
                {currentActiveTab === "cash" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10" // Icon above glow
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/money.svg"
                  role="presentation"
                  style={getActiveIconStyle("cash")} // Apply active/inactive style
                />
                <span className={`text-[10px] font-normal text-center whitespace-nowrap z-10 ${currentActiveTab === "cash" ? "text-white" : "text-[#ffffffb2]"}`}> {/* Text above glow */}
                  Cash Coach
                </span>
                {/* Active Dot below the tab */}
                {currentActiveTab === "cash" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </button>

            </div>
          </div>

        </div>
      </div>
    </nav>
  );
};