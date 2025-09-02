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

  const navigationItems = [
    {
      id: "home",
      icon: "https://c.animaapp.com/Tbz6Qwwg/img/home.svg",
      label: "Home",
      route: "/homepage",
    },
    {
      id: "games",
      icon: "/Games.svg",
      label: "My Games",
      route: "/games",
    },
    {
      id: "more",
      icon: "https://c.animaapp.com/Tbz6Qwwg/img/more.svg",
      label: "",
      isCenter: true,
      route: null,
    },
    {
      id: "wallet",
      icon: "https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png",
      label: "My Wallet",
      // route: "/wallet",
    },
    {
      id: "cash",
      icon: "https://c.animaapp.com/Tbz6Qwwg/img/money.svg",
      label: "Cash Coach",
      // route: "/cash-coach",
    },
  ];

  const handleTabClick = (tabId, route) => {
    if (route) {
      router.push(route);
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full h-[130px] z-[9999]"
      data-model-id="730:32095"
      role="navigation"
      aria-label="Main navigation"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
      }}
    >
      {/* Background overlay covering only bottom half */}
      <div className="absolute bottom-0 left-0 right-0 bg-black w-full h-[78px]"></div>

      <div className="relative h-[120px] -top-px z-10">
        <div className="relative h-[120px] -top-px z-10 flex justify-center">
          <div
            className="w-[135px] h-[5px] mt-30 bg-white rounded-[100px]"
            role="presentation"
            aria-hidden="true"
          />
        </div>


        <div className="absolute w-full max-w-[375px] h-20 top-9 left-1/2 transform -translate-x-1/2">
          <div className="relative h-[113px] -top-5">

            <div className=" absolute w-full h-[60px] top-6 left-0 bg-[#000000] "></div>

            <button
              className="flex flex-col w-[60px] items-center gap-2 absolute top-[39px] left-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
              onClick={() => handleTabClick("home", "/homepage")}
              aria-label="Navigate to Home"
              tabIndex={0}
            >
              <img
                className="relative w-6 h-6"
                alt=""
                src="https://c.animaapp.com/Tbz6Qwwg/img/home.svg"
                role="presentation"
              />

              <span className={`relative w-fit [font-family:'Poppins',Helvetica] font-normal text-[10px] tracking-[-0.17px] leading-[normal] ${currentActiveTab === "home" ? "text-white" : "text-[#ffffffb2]"}`}>
                Home
              </span>

              {currentActiveTab === "home" && (
                <div
                  className="absolute w-1 h-1 top-[51px] left-[26px] bg-[#8b92de] rounded-sm"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              className="flex flex-col w-[60px] items-center gap-3 absolute top-[43px] left-[87px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
              onClick={() => handleTabClick("games", "/games")}
              aria-label="Navigate to My Games"
              aria-current={currentActiveTab === "games" ? "page" : undefined}
              tabIndex={0}
            >
              <img
                className="relative w-[35px] h-[16.28px] bg-transparent"
                alt=""
                src="/game.png"
                role="presentation"
              // style={{ filter: 'bri', background: 'transparent' }}
              />

              <span className={`relative self-stretch [font-family:'Poppins',Helvetica] font-normal text-[10px] text-center tracking-[-0.17px] leading-[normal] ${currentActiveTab === "games" ? "text-white" : "text-[#ffffffb2]"}`}>
                My Games
              </span>

              {currentActiveTab === "games" && (
                <div
                  className="absolute w-1 h-1 top-[47px] left-[26px] bg-[#8b92de] rounded-sm"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              className="flex flex-col w-[62px] items-center gap-[12.4px] absolute top-[-10px] left-40 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
              onClick={() => handleTabClick("more", null)}
              aria-label="More options"
              tabIndex={0}
            >
              <img
                className="relative w-[62px] h-[62px]"
                alt=""
                src="https://c.animaapp.com/Tbz6Qwwg/img/more.svg"
                role="presentation"
              />
            </button>

            <button
              className="flex flex-col w-[60px] items-center gap-2 absolute top-[39px] left-[229px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
              onClick={() => handleTabClick("wallet", null)}
              aria-label="Navigate to My Wallet"
              tabIndex={0}
            >
              <div className="relative w-6 h-6">
                <img
                  className="absolute w-5 h-[18px] top-[3px] left-0.5"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png"
                  role="presentation"
                />
              </div>

              <span className={`relative w-fit [font-family:'Poppins',Helvetica] font-normal text-[10px] text-center tracking-[-0.17px] leading-[normal] ${currentActiveTab === "wallet" ? "text-white" : "text-[#ffffffb2]"}`}>
                My Wallet
              </span>

              {currentActiveTab === "wallet" && (
                <div
                  className="absolute w-1 h-1 top-[51px] left-[26px] bg-[#8b92de] rounded-sm"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </button>

            <button
              className="flex flex-col w-[60px] items-center gap-2 absolute top-[39px] left-[300px] cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded-lg p-1"
              onClick={() => handleTabClick("cash", null)}
              aria-label="Navigate to Cash Coach"
              tabIndex={0}
            >
              <img
                className="relative w-6 h-6"
                alt=""
                src="https://c.animaapp.com/Tbz6Qwwg/img/money.svg"
                role="presentation"
              />

              <span className={`relative w-fit ml-[-0.50px] mr-[-0.50px] [font-family:'Poppins',Helvetica] font-normal text-[10px] text-center tracking-[-0.17px] leading-[13px] whitespace-nowrap ${currentActiveTab === "cash" ? "text-white" : "text-[#ffffffb2]"}`}>
                Cash Coach
              </span>

              {currentActiveTab === "cash" && (
                <div
                  className="absolute w-1 h-1 top-[51px] left-[26px] bg-[#8b92de] rounded-sm"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};