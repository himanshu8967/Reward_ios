"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { usePathname, useRouter } from "next/navigation";

const MoreMenu = ({ onClose }) => {
  const router = useRouter();

  const menuItems = [
    {
      id: 1,
      icon: "https://c.animaapp.com/vuiLipjk/img/vector.svg",
      label: "Daily Challenges",
      iconWidth: "w-5",
      iconHeight: "h-[18px]",
      marginTop: "mt-[45px]",
      marginLeft: "ml-[53px]",
      labelWidth: "w-14",
      href: "/dailychallenge",
    },

    {
      id: 3,
      icon: "https://c.animaapp.com/vuiLipjk/img/group@2x.png",
      label: "Daily Rewards",
      iconWidth: "w-[20px]",
      iconHeight: "h-[20px]",
      marginTop: "mt-11",
      marginLeft: "",
      labelWidth: "w-[52px]",
      href: "/Daily-Reward",
    },
  ];

  const handleMenuClick = (href) => {
    onClose(); // Close the menu
    router.push(href); // Navigate to the page
  };

  return (
    <nav
      className="w-full h-[100px] flex justify-end items-end relative"
      data-model-id="2035:12830"
      role="navigation"
      aria-label="More menu options"
    >
      <div
        className="flex flex-row justify-center items-end gap-6 pr- relative z-10"
        style={{
          position: "absolute",
          bottom: "28px",
          right: "12%",
          width: "auto",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.id}
            className="
              flex flex-col items-center justify-center
              w-[60px] h-[60px]
              bg-black rounded-full border border-solid border-[#474747]
              shadow-[0px_0px_11px_#d8d8d840] cursor-pointer
              hover:border-[#5a5a5a] transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#5a5a5a] 
              focus:ring-offset-2 focus:ring-offset-black
            "
            aria-label={item.label}
            type="button"
            onClick={() => handleMenuClick(item.href)}
            style={{
              minWidth: "60px",
              minHeight: "60px",
              borderRadius: "50%",
              aspectRatio: "1/1",
              padding: "6px 3px 3px 3px",
            }}
          >
            <img
              className={`relative ${item.iconWidth} ${item.iconHeight}`}
              alt=""
              src={item.icon}
              aria-hidden="true"
            />
            <span
              className={`relative max-w-[54px] [font-family:'Poppins',Helvetica] font-normal text-[#ffffffb2] text-[8px] text-center tracking-[-0.17px] leading-tight mt-0.5 px-0.5`}
              style={{
                wordWrap: "break-word",
                overflowWrap: "break-word",
              }}
            >
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export const HomeIndicator = ({ activeTab }) => {
  const pathname = usePathname();
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMoreMenu(false);
      }
    };

    if (showMoreMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMoreMenu]);

  const getActiveTab = () => {
    if (activeTab) return activeTab;
    if (pathname === "/homepage" || pathname === "/homepage/") return "home";
    if (pathname === "/games" || pathname === "/games/") return "games";
    if (pathname === "/Wallet" || pathname === "/Wallet/") return "wallet";
    if (pathname === "/cash-coach" || pathname === "/cash-coach/") return "cash";
    return "home";
  };
  const currentActiveTab = getActiveTab();

  const getActiveIconStyle = (tabId) => {
    if (currentActiveTab === tabId) {
      return { filter: 'brightness(1.8)' };
    }
    return { filter: 'brightness(0.7) opacity(0.7)' };
  };


  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full z-[9999]"
      data-model-id="730:32095"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="w-full">
        <div className="w-full h-[100px] relative">
          <div className="absolute bottom-0 left-0 right-0 bg-black w-full h-[78px]"></div>
          <div className="absolute bottom-[5px] left-1/2 transform -translate-x-1/2 w-[135px] h-[5px] bg-white rounded-[100px]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[78px] flex items-center justify-between px-4">
            <div className="flex items-center justify-between w-full relative">

              <Link
                href="/homepage"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to Home"
                aria-current={currentActiveTab === "home" ? "page" : undefined}
              >
                {currentActiveTab === "home" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/home.svg"
                  role="presentation"
                  style={getActiveIconStyle("home")}
                />
                <span className={`text-[10px] font-normal z-10 ${currentActiveTab === "home" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Home
                </span>
                {currentActiveTab === "home" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <Link
                href="/games"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative -ml-14"
                aria-label="Navigate to My Games"
                aria-current={currentActiveTab === "games" ? "page" : undefined}
              >
                {currentActiveTab === "games" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-[35px] h-[16px] z-10"
                  alt=""
                  src="/game.png"
                  role="presentation"
                  style={getActiveIconStyle("games")}
                />
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "games" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Games
                </span>
                {currentActiveTab === "games" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <div ref={menuRef} className="flex flex-col items-center cursor-pointer focus:outline-none rounded-full absolute -top-[42px] left-1/2 transform -translate-x-1/2 z-30">
                <button
                  className="flex flex-col items-center justify-center w-[62px] h-[62px] rounded-full focus:outline-none relative transition-all duration-300 hover:opacity-80"
                  aria-label="Open more options"
                  tabIndex={0}
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  type="button"
                >
                  <img
                    className="w-[62px] h-[62px]"
                    alt=""
                    src="https://c.animaapp.com/Tbz6Qwwg/img/more.svg"
                    role="presentation"
                  />
                </button>

                {/* More Menu - positioned above the middle button, shifted very far left */}
                {showMoreMenu && (
                  <div className="absolute bottom-[36px] left-1/2 transform -translate-x-[200%] z-40">
                    <MoreMenu onClose={() => setShowMoreMenu(false)} />
                  </div>
                )}

              </div>

              <Link
                href="/Wallet"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative -mr-16"
                aria-label="Navigate to My Wallet"
                aria-current={currentActiveTab === "wallet" ? "page" : undefined}
              >
                {currentActiveTab === "wallet" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <div className="w-6 h-6 relative z-10">
                  <img
                    className="absolute w-5 h-[18px] top-[3px] left-0.5"
                    alt=""
                    src="https://c.animaapp.com/Tbz6Qwwg/img/wallet@2x.png"
                    role="presentation"
                    style={getActiveIconStyle("wallet")}
                  />
                </div>
                <span className={`text-[10px] font-normal text-center z-10 ${currentActiveTab === "wallet" ? "text-white" : "text-[#ffffffb2]"}`}>
                  My Wallet
                </span>
                {currentActiveTab === "wallet" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

              <Link
                href="/cash-coach"
                className="group flex flex-col items-center gap-1 cursor-pointer focus:outline-none rounded-lg p-1 min-w-[50px] relative"
                aria-label="Navigate to Cash Coach"
                aria-current={currentActiveTab === "cash" ? "page" : undefined}
              >
                {currentActiveTab === "cash" && (
                  <div className="absolute bottom-[6px] left-1/2 transform -translate-x-1/2 w-[60px] h-[12px] bg-[#AF7DE6] blur-sm rounded-full opacity-40 z-0" />
                )}
                <img
                  className="w-6 h-6 z-10"
                  alt=""
                  src="https://c.animaapp.com/Tbz6Qwwg/img/money.svg"
                  role="presentation"
                  style={getActiveIconStyle("cash")}
                />
                <span className={`text-[10px] font-normal text-center whitespace-nowrap z-10 ${currentActiveTab === "cash" ? "text-white" : "text-[#ffffffb2]"}`}>
                  Cash Coach
                </span>
                {currentActiveTab === "cash" && (
                  <div className="absolute w-1 h-1 -bottom-1 left-1/2 transform -translate-x-1/2 bg-[#8b92de] rounded-full z-10" />
                )}
              </Link>

            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};