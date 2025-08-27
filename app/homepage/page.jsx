"use client"; // <-- THIS IS THE ONLY LINE YOU NEED TO ADD
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext"; // Ensure path is correct
import { getProfile, getProfileStats, getHomeDashboard } from "@/lib/api";
import { HomeIndicator } from "../../components/HomeIndicator"; //
import { WelcomeOffer } from "../../components/WelcomeOffer";
import { XPPointsModal } from "../../components/XPPointsModal";
import { RaceModal } from "../../components/RaceModel";

export const Frame = () => {
  const [showTooltip, setShowTooltip] = useState(false);
  const tooltipRef = useRef(null);


  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  // Data for action buttons
  const actionButtons = [
    {
      id: 1,
      src: "https://c.animaapp.com/DfFsihWg/img/group-2@2x.png",
      alt: "Close",
      position: "left-0",
    },
    {
      id: 2,
      src: "https://c.animaapp.com/DfFsihWg/img/group-4@2x.png",
      alt: "Refresh",
      position: "left-24",
    },
    {
      id: 3,
      src: "https://c.animaapp.com/DfFsihWg/img/group-3@2x.png",
      alt: "Download",
      position: "left-48",
    },
  ];

  return (
    <main className="relative w-[335px] h-[549px]" data-model-id="2035:14588">
      {/* Action buttons section */}
      <section
        className="absolute w-[254px] h-[62px] top-[492px] left-10"
        aria-label="Action buttons"
      >
        {actionButtons.map((button) => (
          <button
            key={button.id}
            className={`${button.position} absolute w-[62px] h-[62px] top-0 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full`}
            aria-label={button.alt}
          >
            <img className="w-full h-full" alt={button.alt} src={button.src} />
          </button>
        ))}
      </section>

      {/* Main game card */}
      <article className="absolute w-[335px] h-[429px] top-0 left-0 rounded-[12px_12px_0px_0px]">
        {/* Background frames */}
        <img
          className="absolute w-52 h-[244px] top-[51px] left-[73px]"
          alt=""
          src="https://c.animaapp.com/DfFsihWg/img/frame-2.svg"
          role="presentation"
        />

        <img
          className="absolute w-52 h-[244px] top-[51px] left-[73px]"
          alt=""
          src="https://c.animaapp.com/DfFsihWg/img/frame-3.svg"
          role="presentation"
        />

        {/* Main card container */}
        <div className="absolute w-[335px] h-[429px] top-0 left-0 rounded-[12px_12px_0px_0px] overflow-hidden shadow-[0px_27.92px_39.88px_#4d0d3399] bg-[linear-gradient(180deg,rgba(95,14,58,1)_0%,rgba(16,8,25,1)_100%)]">
          {/* Game content section */}
          <section className="absolute w-[302px] h-[303px] top-[102px] left-[18px]">
            <img
              className="absolute w-[300px] h-[300px] top-[3px] left-0 aspect-[1]"
              alt="Orbitfall game artwork showing colorful spaceships and cosmic elements"
              src="https://c.animaapp.com/DfFsihWg/img/image-3930@2x.png"
            />

            <img
              className="absolute w-[210px] h-10 top-[15px] left-11 aspect-[5.2]"
              alt="Orbitfall game logo"
              src="https://c.animaapp.com/DfFsihWg/img/image-3931@2x.png"
            />

            {/* View count badge */}
            <div className="absolute w-[74px] h-[25px] top-0 left-[228px]">
              <div className="relative w-[72px] h-[25px] bg-[#ffffff4f] rounded-[5.32px] backdrop-blur-[2.66px] backdrop-brightness-[100%] [-webkit-backdrop-filter:blur(2.66px)_brightness(100%)]">
                <img
                  className="absolute w-[13px] h-2.5 top-2 left-[7px]"
                  alt="Views icon"
                  src="https://c.animaapp.com/DfFsihWg/img/vector.svg"
                />

                <span className="absolute top-[3px] left-[25px] [font-family:'Poppins',Helvetica] font-bold text-white text-[13px] tracking-[0] leading-[normal]">
                  10.4 K
                </span>
              </div>
            </div>
          </section>

          {/* Header message */}
          <header className="absolute w-[334px] h-[88px] -top-0.5 left-0">
            <div className="relative w-[335px] h-[87px] top-px bg-[#442a3b] rounded-[10px_10px_0px_0px]">
              <p className="absolute w-[304px] top-3.5 left-[15px] [font-family:'Poppins',Helvetica] font-normal text-white text-base text-center tracking-[0] leading-5">
                Please start downloading games from below suggestions &amp;
                start earning now!
              </p>
            </div>
          </header>
        </div>
      </article>

      {/* Bottom earnings section */}
      <>
        <footer className="absolute w-[335px] h-[51px] top-[429px] left-0 rounded-[0px_0px_10px_10px] overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,0.5)_0%,rgba(113,106,231,0.5)_100%)]">
          <div className="relative w-[300px] h-10 top-[5px] left-3">
            <p className="absolute top-0 left-0 [font-family:'Poppins',Helvetica] font-normal text-white text-[13px] tracking-[0] leading-[normal]">
              <span className="font-light">Complete Only 10 Tasks to </span>

              <span className="font-semibold">
                Earn upto 100
                .&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&amp;
                <br />
                10
              </span>
            </p>

            <img
              className="absolute w-[18px] h-5 top-px left-[265px] aspect-[0.97]"
              alt="Currency symbol"
              src="https://c.animaapp.com/DfFsihWg/img/image-3937@2x.png"
            />

            <img
              className="absolute w-[22px] h-5 top-[21px] left-[15px]"
              alt="Reward icon"
              src="https://c.animaapp.com/DfFsihWg/img/pic.svg"
            />
          </div>
          {/* --- ICON BUTTON ADDED HERE --- */}
          <button
            onClick={toggleTooltip}
            className="absolute w-8 h-8 top-[12px] right-[-4px] z-20 cursor-pointer hover:opacity-80 transition-opacity duration-200 rounded-tr-lg  rounded-bl-lg overflow-hidden "
            aria-label="More information"
          >

            <svg width="33" height="34" viewBox="0 0 33 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0L25 0C29.4183 0 33 3.58172 33 8V34H8C3.58172 34 0 30.4183 0 26L0 0Z" fill="#6E6069" />
              <path fillRule="evenodd" clipRule="evenodd" d="M26.8949 16.8292C26.8949 19.7148 25.7823 22.4821 23.802 24.5225C21.8216 26.5629 19.1356 27.7092 16.3349 27.7092C13.5342 27.7092 10.8482 26.5629 8.86786 24.5225C6.88747 22.4821 5.7749 19.7148 5.7749 16.8292C5.7749 13.9437 6.88747 11.1763 8.86786 9.1359C10.8482 7.0955 13.5342 5.94922 16.3349 5.94922C19.1356 5.94922 21.8216 7.0955 23.802 9.1359C25.7823 11.1763 26.8949 13.9437 26.8949 16.8292ZM17.6549 11.3892C17.6549 11.7499 17.5158 12.0958 17.2683 12.3509C17.0207 12.6059 16.685 12.7492 16.3349 12.7492C15.9848 12.7492 15.6491 12.6059 15.4015 12.3509C15.154 12.0958 15.0149 11.7499 15.0149 11.3892C15.0149 11.0285 15.154 10.6826 15.4015 10.4276C15.6491 10.1725 15.9848 10.0292 16.3349 10.0292C16.685 10.0292 17.0207 10.1725 17.2683 10.4276C17.5158 10.6826 17.6549 11.0285 17.6549 11.3892ZM15.0149 15.4692C14.6648 15.4692 14.3291 15.6125 14.0815 15.8676C13.834 16.1226 13.6949 16.4685 13.6949 16.8292C13.6949 17.1899 13.834 17.5358 14.0815 17.7909C14.3291 18.0459 14.6648 18.1892 15.0149 18.1892V22.2692C15.0149 22.6299 15.154 22.9758 15.4015 23.2309C15.6491 23.4859 15.9848 23.6292 16.3349 23.6292H17.6549C18.005 23.6292 18.3407 23.4859 18.5883 23.2309C18.8358 22.9758 18.9749 22.6299 18.9749 22.2692C18.9749 21.9085 18.8358 21.5626 18.5883 21.3076C18.3407 21.0525 18.005 20.9092 17.6549 20.9092V16.8292C17.6549 16.4685 17.5158 16.1226 17.2683 15.8676C17.0207 15.6125 16.685 15.4692 16.3349 15.4692H15.0149Z" fill="white" fillOpacity="0.6" />
            </svg>

          </button>
        </footer>

        {showTooltip && (
          <div
            ref={tooltipRef}
            className="absolute top-[480px] right-[-12px] z-50 w-[320px] bg-black/95 backdrop-blur-sm rounded-[12px] px-4 py-3 shadow-2xl animate-fade-in"
          >
            <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal">

              <div className="text-center  text-gray-200">
                As a new user, you can undo as many times as needed.
              </div>
            </div>
            <div className="absolute top-[-8px] right-[25px] w-4 h-4 bg-black/95 transform rotate-45"></div>
          </div>
        )}
      </>
    </main>
  );
};
const Homepage = () => {
  return (
    <div
      className="relative w-full min-h-screen bg-black pb-[170px]"
      data-model-id="972:9945"
    >
      <div className="absolute w-full h-[49px] top-0 left-0 z-10 px-5">
        <div className="absolute top-[37px] left-5 [font-family:'Poppins',Helvetica] font-normal text-white text-[10px] tracking-[0] leading-3 whitespace-nowrap">
          App Version: V0.0.1
        </div>
      </div>
      <HeaderSection />
      <MainContentSection />

      <HomeIndicator activeTab="home" />
    </div>
  );
};

const RewardProgress = ({ stats }) => {
  const rewardGoal = 6000;

  const currentProgress = stats?.currentXP ?? 0;
  const pointsNeeded = Math.max(0, rewardGoal - currentProgress);

  const progressPercentage = Math.min(
    (currentProgress / rewardGoal) * 100,
    100
  );

  const pointsData = {
    currentPoints: currentProgress,
    targetPoints: rewardGoal,
    pointsNeeded: pointsNeeded,
    currentLevel: stats?.tier ?? 2,
    nextLevel: (stats?.tier ?? 2) + 1,
  };

  return (
    <div
      className="relative w-full max-w-[375px] mx-auto h-[135px]"
      data-model-id="1151:33569"
    >
      <div className="relative w-full h-[135px]">
        <div className="absolute w-full h-[135px] top-0 left-0">
          <div className="relative w-full h-[135px] bg-black rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.8),2.48px_2.48px_18.58px_#3b3b3b80,-1.24px_-1.24px_16.1px_#825700]">
            <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[0_0_30px_8px_rgba(255,215,0,0.06)]" />
            <div className="absolute w-[calc(100%-34px)] max-w-[302px] h-[25px] top-[79px] left-[17px]">
              <div className="absolute w-full h-[25px] top-0 left-0">
                <div className="w-full h-[25px]">
                  <div className="relative w-full h-[25px]">
                    {/* Progress bar background */}
                    <div className="absolute w-full h-full rounded-full overflow-hidden ring-1 ring-[#8b7332] bg-gradient-to-r from-[#4a3c1a] to-[#6b5424] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_-1px_0_rgba(0,0,0,0.25)]"></div>

                    {/* Progress bar fill */}
                    <div
                      className="absolute h-full rounded-full bg-gradient-to-r from-[#ffd700] via-[#ffed4e] to-[#f4d03f] shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]"
                      style={{
                        width: `${(pointsData.currentPoints / pointsData.targetPoints) *
                          100
                          }%`,
                      }}
                    ></div>
                    {/* Current level indicator */}
                    <div className="absolute w-[24px] h-[24px] top-0.5 left-[3px] bg-[#ffd700] rounded-full border-2 border-[#b8860b] flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_3px_rgba(255,215,0,0.25)]">
                      <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#815c23] text-[12px] tracking-[0.02px] leading-[normal]">
                        {pointsData.currentLevel}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="absolute top-1 left-1/2 -translate-x-1/2  opacity-80 [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[12px] tracking-[0.02px] leading-[normal]">
                <span className="text-[#685512] tracking-[0]">
                  {pointsData.currentPoints}
                </span>

                <span className="text-[#8d741b80] tracking-[0]">
                  /{pointsData.targetPoints}
                </span>
              </p>
            </div>

            <header className="absolute w-[calc(100%-40px)] max-w-[299px] h-[42px] top-[19px]  left-5">
              <div className="relative  w-full h-[42px]">
                <div className="absolute w-full h-[21px] top-0 left-0">
                  <h1 className="absolute w-full top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-lg sm:text-xl tracking-[-0.37px] leading-[27.2px] truncate">
                    Hurry! Earn {pointsData.pointsNeeded} more &amp; Claim
                  </h1>
                </div>

                <p className="absolute w-full top-[27px] left-0 [font-family:'Poppins',Helvetica] font-semibold text-[#ffffff99] text-sm tracking-[0.02px] leading-[normal] truncate">
                  {pointsData.pointsNeeded} Points until your next reward
                </p>
              </div>
            </header>
          </div>
        </div>

        <div className="absolute w-[24px] h-[24px] top-[78.5px] right-[20px] bg-[#ffd700] rounded-full border-2 border-[#b8860b] flex items-center justify-center shadow-[0_2px_6px_rgba(0,0,0,0.35),0_0_0_3px_rgba(255,215,0,0.25)]">
          <div className="[font-family:'Poppins',Helvetica] font-semibold text-[#815c23] text-[12px] tracking-[0.02px] leading-[normal]">
            3
          </div>
        </div>

        <img
          className="absolute w-3 mt-1 h-[11px] top-[81px] left-[125px]"
          alt="Star icon"
          src="https://c.animaapp.com/FQEXnMXW/img/vector.svg"
        />
      </div>
    </div>
  );
};

const XpTierTracker = ({ stats }) => {
  const [isXPModalOpen, setIsXPModalOpen] = useState(false);

  // Define XP goals for each tier. These would ideally come from a config or API.
  const tierGoals = { junior: 0, mid: 5000, senior: 10000 };
  const currentXp = stats?.currentXP ?? 2592;
  const totalXpGoal = tierGoals.senior;

  // Calculate progress percentage
  const progressPercentage = Math.min((currentXp / totalXpGoal) * 100, 100);

  const progressData = {
    title: "You're off to a great start!",
    currentXP: currentXp,
    totalXP: totalXpGoal,
    levels: ["Junior", "Mid-level", "Senior"],
    progressPercentage: progressPercentage,
  };

  return (
    <div
      className="flex flex-col items-center relative"
      data-model-id="4001:7762"
    >
      <section className="relative w-[335px] h-[169px] bg-black rounded-[10px] border border-solid border-neutral-700">
        <div className="absolute w-[304px] h-6 top-[84px] left-3.5">
          <div className="relative w-full h-6">
            {/* Progress bar background */}
            <div className="absolute w-full h-[19px] top-0.5 left-0 bg-[#373737] rounded-[32px] border-4 border-solid border-[#ffffff33]" />

            {/* Progress bar fill */}
            <div
              className="absolute h-[11px] top-1.5 left-1 bg-gradient-to-r from-[#FFD700] to-[#FFA500] rounded-[32px]"
              style={{
                width: `${Math.min((progressData.progressPercentage / 100) * 288, 288)}px`,
              }}
            />

            {/* Current progress indicator */}
            <div
              className="absolute w-6 h-6 top-0 bg-white rounded-full border-2 border-[#FFD700]"
              style={{
                left: `${Math.min((progressData.progressPercentage / 100) * 278, 278)}px`,
              }}
            />

          </div>
        </div>

        <h2 className="absolute w-[210px] h-6 top-4 left-[62px] [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-6">
          {progressData.title}
        </h2>

        <button
          className="absolute w-10 h-8 top-[15px] left-4 cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setIsXPModalOpen(true)}
          aria-label="Open XP Points information"
        >
          <img
            className="w-full h-full"
            alt="XP icon"
            src="https://c.animaapp.com/mHRmJGe1/img/pic.svg"
          />
        </button>

        <div className="absolute w-[153px] h-[21px] top-[113px] left-[18px] flex items-center">
          <div className="font-medium text-[#d2d2d2] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
            {progressData.currentXP.toLocaleString()}
          </div>

          <img
            className="w-5 h-[18px] mx-1"
            alt="XP points icon"
            src="https://c.animaapp.com/mHRmJGe1/img/pic-1.svg"
          />

          <div className="font-medium text-[#dddddd] leading-[normal] [font-family:'Poppins',Helvetica] text-sm tracking-[0]">
            out of {progressData.totalXP.toLocaleString()}
          </div>
        </div>

        <nav className="absolute w-[303px] h-[15px] top-[63px] left-4">
          {progressData.levels.map((level, index) => (
            <div
              key={level}
              className={`h-3.5 font-normal text-white leading-[14px] whitespace-nowrap absolute -top-px [font-family:'Poppins',Helvetica] text-sm tracking-[0] ${index === 0
                ? "left-0"
                : index === 1
                  ? "left-[114px]"
                  : "left-[259px]"
                }`}
            >
              {level}
            </div>
          ))}
        </nav>


      </section>

      <XPPointsModal
        isOpen={isXPModalOpen}
        onClose={() => setIsXPModalOpen(false)}
      />
    </div>
  );
};
// --- THIS IS THE FULLY IMPLEMENTED HEADER COMPONENT ---
const HeaderSection = () => {
  const router = useRouter();
  const { user, token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          // Fetch profile and balance in parallel
          const [profileData, walletData] = await Promise.all([
            getProfile(token),
            getProfileStats(token),
          ]);
          setProfile(profileData);
          setBalance(walletData.balance);
        } catch (error) {
          console.error("Failed to fetch header data:", error);
          // Set to empty objects to use fallbacks
          setProfile({});
          setBalance(null);
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    } else if (user) {
      // Handle case where auth is loaded but no token (should not happen in protected routes)
      setIsLoading(false);
    }
  }, [token, user]);

  const handleProfileClick = () => {
    router.push("/myprofile");
  };
  const handleWalletClick = () => router.push("/wallet"); // Example route, adjust as needed

  // Use fetched first name or fallback from user context or a generic greeting
  const firstName = profile?.firstName || user?.firstName || "there";
  const greeting = `Hi ${firstName}! 👋`;

  return (
    <header className="absolute top-[66px] left-0 w-full px-5 bg-transparent z-20">
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-3">
          <button
            className="relative w-12 h-12 cursor-pointer hover:opacity-80 transition-opacity duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 z-50 rounded-full overflow-hidden flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleProfileClick();
            }}
            type="button"
            aria-label="Go to My Profile"
          >
            <img
              className="w-12 h-12 pointer-events-none rounded-full object-cover"
              alt="Profile"
              src={
                profile?.profile?.avatar ||
                "https://c.animaapp.com/xCaMzUYh/img/group-4-1@2x.png"
              }
              crossOrigin="anonymous"
              onError={(e) => {
                console.log("Avatar failed to load, falling back to default");
                e.target.src =
                  "https://c.animaapp.com/xCaMzUYh/img/group-4-1@2x.png";
              }}
            />
          </button>
          <div className="flex flex-col items-start gap-1 flex-1 min-w-0">
            <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-lg tracking-[-0.37px] leading-[22px] truncate w-full max-w-[160px]">
              <div className="flex items-baseline ...">
                <span className="flex-shrink-0">Hi!&nbsp;</span>
                <span className="truncate">{firstName}</span>
                <span className="flex-shrink-0">👋</span>
              </div>
            </div>
            <div className="[font-family:'Poppins',Helvetica] font-light text-white text-sm tracking-[-0.17px] leading-[18px] opacity-60">
              Welcome back
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-[87px] h-9 rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center justify-between px-2.5">
            <div className="text-white text-lg [font-family:'Poppins',Helvetica] font-semibold leading-[normal]">
              {balance || 0}
            </div>
            <img
              className="w-[23px] h-6"
              alt="Image"
              src="https://c.animaapp.com/xCaMzUYh/img/image-3937-3@2x.png"
            />
          </div>
        </div>
      </div>
    </header>
  );
};

const MainContentSection = () => {
  const { token } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [isRaceModalOpen, setIsRaceModalOpen] = useState(false);
  const tooltipRef = useRef(null);

  const toggleTooltip = () => {
    setShowTooltip(!showTooltip);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
        setShowTooltip(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  useEffect(() => {
    if (token) {
      const fetchData = async () => {
        try {
          const data = await getHomeDashboard(token);
          setDashboardData(data);
        } catch (error) {
          console.error(
            "Failed to fetch dashboard data for main content:",
            error
          );
        } finally {
          setIsLoading(false);
        }
      };
      fetchData();
    }
  }, [token]);

  const mostPlayedGames = [
    {
      id: 1,
      name: "Gates of Olympus",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3928@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/oval-1@2x.png",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval.svg",
      borderColor: "#FF69B4",
      isNew: false,
    },
    {
      id: 2,
      name: "CS:Go Rall",
      image: "https://c.animaapp.com/xCaMzUYh/img/layer-30@2x.png",
      bgGradient:
        "linear-gradient(180deg,rgba(50,50,50,1)_0%,rgba(30,30,30,1)_100%)",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval-7.svg",
      borderColor: "#FF69B4",
      isNew: false,
    },
    {
      id: 3,
      name: "Fortnite",
      image: "https://c.animaapp.com/xCaMzUYh/img/image@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/oval-4@2x.png",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval-3.svg",
      borderColor: "#FF69B4",
      isNew: true,
    },
    {
      id: 4,
      name: "Sweet Bonanza",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3926@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/oval-6@2x.png",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval-5.svg",
      borderColor: "#FF69B4",
      isNew: false,
    },
    {
      id: 5,
      name: "Sugar Rush",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-217@2x.png",
      bgGradient:
        "linear-gradient(180deg,rgba(141,173,248,1)_0%,rgba(240,136,249,1)_100%)",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval-2.svg",
      borderColor: "#FF69B4",
      isNew: false,
    },
    {
      id: 6,
      name: "Le Bandit",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-218@2x.png",
      bgGradient:
        "linear-gradient(180deg,rgba(43,113,59,1)_0%,rgba(250,212,39,1)_100%)",
      borderImage: "https://c.animaapp.com/xCaMzUYh/img/oval-8.svg",
      borderColor: "#FF69B4",
      isNew: false,
    },
  ];

  const nonGamingOffers = [
    {
      id: 1,
      name: "Albert- Mobile Banking",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3981@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
      bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
      earnAmount: "Earn upto 100",
    },
    {
      id: 2,
      name: "Chime- Mobile Banking",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3980@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-73-1@2x.png",
      bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-1@2x.png",
      earnAmount: "Earn upto 100",
      provider: "BitLabs",
    },
    {
      id: 3,
      name: "Albert- Mobile Banking",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3982@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74@2x.png",
      bottomBg: "https://c.animaapp.com/xCaMzUYh/img/rectangle-76@2x.png",
      earnAmount: "Earn upto 100",
    },
  ];

  const surveyProviders = [
    {
      id: 1,
      name: "Ayet Studios",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3979@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-2@2x.png",
    },
    {
      id: 2,
      name: "BitLabs",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3974@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-73-3@2x.png",
    },
    {
      id: 3,
      name: "CPX Research",
      image: "https://c.animaapp.com/xCaMzUYh/img/image-3977@2x.png",
      bgImage: "https://c.animaapp.com/xCaMzUYh/img/rectangle-74-2@2x.png",
    },
  ];

  // SKELETON LOADER FOR THE MAIN CONTENT
  if (isLoading) {
    return (
      <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-8 pt-36 px-4">
        <div className="w-full h-[135px] bg-gray-800 rounded-lg animate-pulse"></div>
        <div className="w-full h-[169px] bg-gray-800 rounded-lg animate-pulse"></div>
        {/* Add more skeleton loaders for other sections as needed */}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 pt-36 px-4 relative">
      {dashboardData?.stats && <RewardProgress stats={dashboardData.stats} />}
      {dashboardData?.stats && <XpTierTracker stats={dashboardData.stats} />}
      <div className="flex flex-col items-start gap-4 relative w-full">
        <div className="flex w-full items-center justify-between">
          <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
            Most Played
          </div>
          <div className="[font-family:'Poppins',Helvetica] font-medium text-[#8b92de] text-base tracking-[0] leading-[normal]">
            See All
          </div>
        </div>
        <div className="flex h-[110px] items-start gap-3 w-full overflow-x-auto scrollbar-hide -mx-4 px-4">
          {mostPlayedGames.map((game) => (
            <div
              key={game.id}
              className="items-start inline-flex flex-col gap-1.5 relative flex-[0_0_auto] cursor-pointer hover:scale-105 transition-transform duration-200"
            >
              <div
                className={`relative w-[72px] h-[72px] rounded-full`}
                style={{
                  border: `2px solid ${game.borderColor}`,
                  boxShadow: `0 0 0 1px rgba(255,255,255,0.1), 0 4px 12px rgba(0,0,0,0.3), 0 0 8px ${game.borderColor}40`,
                  background: `url(${game.borderImage})`,
                  backgroundSize: "100% 100%",
                }}
              >
                <div
                  className={`relative w-16 h-16 top-1 left-1 rounded-[32px] shadow-inner ${game.bgGradient
                    ? `bg-[${game.bgGradient}]`
                    : game.bgImage
                      ? `bg-[url(${game.bgImage})] bg-cover bg-[50%_50%]`
                      : "bg-[#00000033]"
                    }`}
                >
                  <img
                    className={`absolute ${game.id === 1
                      ? "w-16 h-[61px] top-[3px] left-0 aspect-[1.05]"
                      : game.id === 2
                        ? "w-10 h-[44px] top-[10px] left-3 aspect-[0.89] object-cover"
                        : game.id === 3
                          ? "w-[67px] h-[58px] top-1.5 left-0"
                          : game.id === 4
                            ? "w-16 h-[49px] top-[15px] left-0 aspect-[1.3] object-cover"
                            : game.id === 5
                              ? "w-[68px] h-[42px] top-[11px] left-0"
                              : "w-12 h-[54px] top-1.5 left-3 aspect-[0.88]"
                      }`}
                    alt="Image"
                    src={game.image}
                  />
                </div>
              </div>
              <div className="relative w-[72px] [font-family:'Poppins',Helvetica] font-medium text-white text-xs text-center tracking-[0] leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                {game.name}
              </div>
              {game.isNew && (
                <div className="absolute w-11 h-4 top-[59px] left-3.5 rounded overflow-hidden bg-[linear-gradient(90deg,rgba(98,58,167,1)_0%,rgba(209,151,248,1)_100%)]">
                  <div className="absolute w-[33px] -top-px left-[5px] [font-family:'Poppins',Helvetica] font-semibold text-white text-xs text-center tracking-[0] leading-4 overflow-hidden text-ellipsis [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                    New
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col items-start gap-4 relative w-full">
        <div className="flex w-full items-center justify-between">
          <p className="text-white [font-family:'Poppins',Helvetica] font-semibold text-xl tracking-[0] leading-[normal] text-nowrap ">
            Fast Fun, Real Rewards!
          </p>
        </div>

        {/* Welcome Offer Component */}
        <div className="relative w-full overflow-visible">
          <WelcomeOffer />
        </div>

        <Frame />
      </div>
      <div className="flex flex-col w-full items-start gap-4 relative">
        <div className="flex w-full items-center justify-between">
          <div className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
            Non- Gaming Offers
          </div>
        </div>
        <div className="relative w-full h-[220px] overflow-hidden">
          <div className="w-full h-[220px] flex justify-center">
            <div className="relative w-full max-w-[375px] h-[220px]">
              <div className="absolute w-full h-[161px] top-[22px] left-0">
                {nonGamingOffers.slice(0, 2).map((offer, index) => (
                  <div
                    key={offer.id}
                    className={`absolute w-[44%] ${index === 0
                      ? "h-40 top-px left-0"
                      : "h-[161px] top-0 right-0"
                      }`}
                  >
                    <img
                      className={`${index === 0
                        ? "w-[80%] h-40 top-0 left-0"
                        : "w-[80%] h-40 top-px right-0"
                        } absolute object-cover`}
                      alt="Rectangle"
                      src={offer.bgImage}
                    />
                    <img
                      className={`w-full h-[57px] ${index === 0
                        ? "top-[103px] left-0"
                        : "top-[104px] left-0"
                        } absolute object-cover`}
                      alt="Rectangle"
                      src={offer.bottomBg}
                    />
                    <div
                      className={`absolute ${index === 0
                        ? "top-[111px] left-[11px]"
                        : "top-28 left-[11px]"
                        } [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-5`}
                    >
                      {offer.name.split(" ").map((word, i) => (
                        <span key={i}>
                          {word}
                          {i === 0 && <br />}
                          {i > 0 && i < offer.name.split(" ").length - 1 && " "}
                        </span>
                      ))}
                    </div>
                    <img
                      className={`absolute ${index === 0
                        ? "w-[62%] h-[102px] top-px left-[3px] aspect-[1.01]"
                        : "w-[62%] h-[104px] top-0 right-[5%] aspect-[1.01]"
                        }`}
                      alt="Image"
                      src={offer.image}
                    />
                    <div
                      className={`w-24 h-[23px] ${index === 0
                        ? "top-[72px] left-2.5"
                        : "top-[73px] left-11"
                        } rounded absolute overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)]`}
                    >
                      <div className="absolute top-[3px] left-1.5 [font-family:'Poppins',Helvetica] font-medium text-white text-[10.2px] tracking-[0] leading-[normal]">
                        {offer.earnAmount}
                      </div>
                      <img
                        className="absolute w-[11px] h-3 top-1.5 left-[78px] aspect-[0.97]"
                        alt="Image"
                        src="https://c.animaapp.com/xCaMzUYh/img/image-3937-1@2x.png"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <img
                className="h-[220px] absolute w-[44%] top-0 left-1/2 -translate-x-1/2 object-cover z-10"
                alt="Rectangle"
                src="https://c.animaapp.com/xCaMzUYh/img/rectangle-73-1@2x.png"
              />
              <img
                className="absolute w-[44%] h-[57px] top-[163px] left-1/2 -translate-x-1/2 object-cover z-10"
                alt="Rectangle"
                src="https://c.animaapp.com/xCaMzUYh/img/rectangle-74-1@2x.png"
              />
              <div className="absolute top-[172px] left-1/2 -translate-x-1/2 [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-5 z-20">
                Chime- Mobile
                <br />
                Banking
              </div>
              <div className="absolute w-[61px] h-6 top-[130px] left-1/2 -translate-x-1/2 z-20">
                <div className="absolute top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                  BitLabs
                </div>
              </div>
              <img
                className="absolute w-[33%] h-[153px] top-px left-1/2 -translate-x-1/2 aspect-[0.81] object-contain z-20"
                alt="Image"
                src="https://c.animaapp.com/xCaMzUYh/img/image-3980@2x.png"
              />
              <div className="w-[32%] h-[29px] top-[127px] left-1/2 -translate-x-1/2 rounded-[10px] absolute overflow-hidden bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] z-20">
                <div className="absolute top-1 left-2 [font-family:'Poppins',Helvetica] font-medium text-white text-[13px] tracking-[0] leading-[normal]">
                  Earn upto 100
                </div>
                <img
                  className="w-[15px] h-[15px] top-[7px] left-[99px] absolute aspect-[0.97]"
                  alt="Image"
                  src="https://c.animaapp.com/xCaMzUYh/img/image-3937-2@2x.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full h-[127px] items-start gap-4 relative">
        <img
          className="h-[127px] relative w-full"
          alt="Race"
          src="https://c.animaapp.com/xCaMzUYh/img/race.svg"
        />
        <img
          className="absolute w-[215px] h-[119px] top-2 left-0"
          alt="Clip path group"
          src="https://c.animaapp.com/xCaMzUYh/img/clip-path-group-1@2x.png"
        />
        <div className="flex flex-col w-[198px] items-start absolute top-[21px] left-[25px]">
          <div className="flex flex-col items-start pt-0 pb-2 px-0 relative self-stretch w-full flex-[0_0_auto]">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-bold text-white text-sm tracking-[0] leading-4 whitespace-nowrap">
              Become a
            </div>
            <div className="relative w-fit ml-[-0.50px] [text-shadow:0px_4px_8px_#1a002f40] [-webkit-text-stroke:0.5px_transparent]  [-webkit-background-clip:text] bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(245,245,245,1)_100%)] bg-clip-text [-webkit-text-fill-color:transparent] [text-fill-color:transparent] [font-family:'Poppins',Helvetica] font-semibold text-transparent text-[32px] tracking-[0] leading-8 whitespace-nowrap">
              VIP Member
            </div>
          </div>
          <div className="inline-flex items-start gap-2.5 px-3.5 py-2 relative flex-[0_0_auto] bg-[#ffdd8f] rounded-xl">
            <div className="relative w-fit mt-[-1.00px] [font-family:'Poppins',Helvetica] font-semibold text-[#736de8] text-[13px] tracking-[0] leading-[normal]">
              Check Plans
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full items-start gap-4 relative">
        <div className="h-36 rounded-[20px] overflow-hidden bg-[linear-gradient(51deg,rgba(88,41,171,1)_0%,rgba(59,41,171,1)_100%)] overflow-x-scroll relative w-full">
          <div className="relative w-[371px] h-[198px] -top-4 left-2">
            <div className="top-[81px] left-1 font-normal absolute [font-family:'Poppins',Helvetica] text-white text-base tracking-[0] leading-6 whitespace-nowrap">
              Take Part & Win
            </div>
            <div className="absolute w-[371px] h-[198px] top-0 left-0">
              <div className="top-[107px] left-1 text-[#fff57f] absolute [font-family:'Poppins',Helvetica] font-semibold text-[26px] tracking-[0] leading-6 whitespace-nowrap">
                Exciting Rewards
              </div>
              <img
                className="absolute w-[198px] h-[198px] top-0 left-[173px] aspect-[1] object-cover"
                alt="Image"
                src="https://c.animaapp.com/xCaMzUYh/img/image-219@2x.png"
              />
              <img
                className="absolute w-[211px] h-[42px] top-[38px] left-0 mix-blend-lighten"
                alt="Banner DON t REMOVE"
                src="https://c.animaapp.com/xCaMzUYh/img/banner---don-t-remove@2x.png"
              />
            </div>
          </div>
          <button
            onClick={() => setIsRaceModalOpen(true)}
            className="absolute w-10 h-9 top-[-3px] right-[-4px] z-20 cursor-pointer hover:opacity-80 transition-opacity duration-200 rounded-tr-lg rounded-bl-lg overflow-hidden "
            aria-label="More information"
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0L28 0C32.4183 0 36 3.58172 36 8V36H8C3.58172 36 0 32.4183 0 28L0 0Z" fill="#2C1D87" />
              <path fillRule="evenodd" clipRule="evenodd" d="M29.52 18.0005C29.52 21.0558 28.3063 23.9859 26.1459 26.1463C23.9854 28.3068 21.0553 29.5205 18 29.5205C14.9447 29.5205 12.0145 28.3068 9.85411 26.1463C7.69369 23.9859 6.47998 21.0558 6.47998 18.0005C6.47998 14.9452 7.69369 12.015 9.85411 9.8546C12.0145 7.69418 14.9447 6.48047 18 6.48047C21.0553 6.48047 23.9854 7.69418 26.1459 9.8546C28.3063 12.015 29.52 14.9452 29.52 18.0005ZM19.44 12.2405C19.44 12.6224 19.2883 12.9886 19.0182 13.2587C18.7482 13.5288 18.3819 13.6805 18 13.6805C17.6181 13.6805 17.2518 13.5288 16.9817 13.2587C16.7117 12.9886 16.56 12.6224 16.56 12.2405C16.56 11.8586 16.7117 11.4923 16.9817 11.2222C17.2518 10.9522 17.6181 10.8005 18 10.8005C18.3819 10.8005 18.7482 10.9522 19.0182 11.2222C19.2883 11.4923 19.44 11.8586 19.44 12.2405ZM16.56 16.5605C16.1781 16.5605 15.8118 16.7122 15.5417 16.9822C15.2717 17.2523 15.12 17.6186 15.12 18.0005C15.12 18.3824 15.2717 18.7486 15.5417 19.0187C15.8118 19.2888 16.1781 19.4405 16.56 19.4405V23.7605C16.56 24.1424 16.7117 24.5086 16.9817 24.7787C17.2518 25.0488 17.6181 25.2005 18 25.2005H19.44C19.8219 25.2005 20.1882 25.0488 20.4582 24.7787C20.7283 24.5086 20.88 24.1424 20.88 23.7605C20.88 23.3786 20.7283 23.0123 20.4582 22.7422C20.1882 22.4722 19.8219 22.3205 19.44 22.3205V18.0005C19.44 17.6186 19.2883 17.2523 19.0182 16.9822C18.7482 16.7122 18.3819 16.5605 18 16.5605H16.56Z" fill="#8B92DF" />
            </svg>

          </button>
        </div>

        <RaceModal
          isOpen={isRaceModalOpen}
          onClose={() => setIsRaceModalOpen(false)}
        />
      </div>
      <div className="flex flex-col w-full items-start gap-4 relative">
        <div className="flex w-full items-center justify-between">
          <p className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
            Get Paid to do Surveys
          </p>
        </div>
        <div className="relative w-full h-[190px] overflow-hidden">
          <div className="w-full h-[190px] flex justify-center">
            <div className="relative w-full max-w-[375px] h-[190px]">
              <div className="absolute w-full h-40 top-[11px] left-0">
                {surveyProviders
                  .filter((_, index) => index !== 1)
                  .map((provider, index) => (
                    <div
                      key={provider.id}
                      className={`absolute w-[35%] h-40 top-0 ${index === 0 ? "left-0" : "right-0"
                        } bg-[url(${provider.bgImage})] bg-cover bg-[50%_50%]`}
                    >
                      <div
                        className={`absolute ${index === 0
                          ? "top-[97px] left-[21px]"
                          : "top-[90px] left-[37px]"
                          } [font-family:'Poppins',Helvetica] font-semibold text-white text-base text-center tracking-[0] leading-5`}
                      >
                        {provider.name.split(" ").map((word, i) => (
                          <span key={i}>
                            {word}
                            {i === 0 && <br />}
                            {i > 0 &&
                              i < provider.name.split(" ").length - 1 &&
                              " "}
                          </span>
                        ))}
                      </div>
                      <img
                        className={`absolute ${index === 0
                          ? "w-[65px] h-[65px] top-6 left-[18px] aspect-[1]"
                          : "w-[70px] h-[51px] top-[31px] left-[41px] aspect-[1.37]"
                          }`}
                        alt="Image"
                        src={provider.image}
                      />
                    </div>
                  ))}
              </div>
              <img
                className="h-[190px] absolute w-[44%] top-0 left-1/2 -translate-x-1/2 object-cover z-10"
                alt="Rectangle"
                src="https://c.animaapp.com/xCaMzUYh/img/rectangle-73-3@2x.png"
              />
              <div className="absolute w-[61px] h-6 top-[123px] left-1/2 -translate-x-1/2 z-20">
                <div className="absolute top-0 left-0 [font-family:'Poppins',Helvetica] font-semibold text-white text-base tracking-[0] leading-[normal]">
                  BitLabs
                </div>
              </div>
              <img
                className="absolute w-20 h-[78px] top-[39px] left-1/2 -translate-x-1/2 aspect-[1.03] object-contain z-20"
                alt="Image"
                src="https://c.animaapp.com/xCaMzUYh/img/image-3974@2x.png"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col w-full items-start gap-4 relative">
        <div className="h-[111px] rounded-[20px] overflow-hidden bg-[linear-gradient(64deg,rgba(41,138,171,1)_0%,rgba(41,171,162,1)_100%)]  relative w-full">

          <div className="relative w-[285px] h-[207px] top-[-73px] left-5">
            <div className="top-[88px] left-0 font-medium absolute [font-family:'Poppins',Helvetica] text-white text-base tracking-[0] leading-6 whitespace-nowrap">
              30 Days Streak
            </div>
            <div className="absolute top-[141px] left-0 [font-family:'Poppins',Helvetica] font-medium text-white text-base tracking-[0] leading-6 whitespace-nowrap">
              if you login daily
            </div>
            <div className="absolute w-[285px] h-[207px] top-0 left-0">
              <div className="top-[114px] left-0 text-[#b3ffac] absolute [font-family:'Poppins',Helvetica] font-semibold text-[26px] tracking-[0] leading-6 whitespace-nowrap">
                Exciting Rewards
              </div>
              <img
                className="absolute w-[66px] h-[207px] top-0 left-[219px] aspect-[0.32]"
                alt="Image"
                src="https://c.animaapp.com/xCaMzUYh/img/image-3995@2x.png"
              />
            </div>
          </div>

          <button
            onClick={toggleTooltip}
            className="absolute w-9 h-9 top-[-3px] right-[-4px] z-20 cursor-pointer hover:opacity-80 transition-opacity duration-200 rounded-tr-lg rounded-bl-lg overflow-hidden "
            aria-label="More information"
          >
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 0L28 0C32.4183 0 36 3.58172 36 8V36H8C3.58172 36 0 32.4183 0 28L0 0Z" fill="#1D8E87" />
              <path fillRule="evenodd" clipRule="evenodd" d="M29.52 18.0005C29.52 21.0558 28.3063 23.9859 26.1459 26.1463C23.9854 28.3068 21.0553 29.5205 18 29.5205C14.9447 29.5205 12.0145 28.3068 9.85411 26.1463C7.69369 23.9859 6.47998 21.0558 6.47998 18.0005C6.47998 14.9452 7.69369 12.015 9.85411 9.8546C12.0145 7.69418 14.9447 6.48047 18 6.48047C21.0553 6.48047 23.9854 7.69418 26.1459 9.8546C28.3063 12.015 29.52 14.9452 29.52 18.0005ZM19.44 12.2405C19.44 12.6224 19.2883 12.9886 19.0182 13.2587C18.7482 13.5288 18.3819 13.6805 18 13.6805C17.6181 13.6805 17.2518 13.5288 16.9817 13.2587C16.7117 12.9886 16.56 12.6224 16.56 12.2405C16.56 11.8586 16.7117 11.4923 16.9817 11.2222C17.2518 10.9522 17.6181 10.8005 18 10.8005C18.3819 10.8005 18.7482 10.9522 19.0182 11.2222C19.2883 11.4923 19.44 11.8586 19.44 12.2405ZM16.56 16.5605C16.1781 16.5605 15.8118 16.7122 15.5417 16.9822C15.2717 17.2523 15.12 17.6186 15.12 18.0005C15.12 18.3824 15.2717 18.7486 15.5417 19.0187C15.8118 19.2888 16.1781 19.4405 16.56 19.4405V23.7605C16.56 24.1424 16.7117 24.5086 16.9817 24.7787C17.2518 25.0488 17.6181 25.2005 18 25.2005H19.44C19.8219 25.2005 20.1882 25.0488 20.4582 24.7787C20.7283 24.5086 20.88 24.1424 20.88 23.7605C20.88 23.3786 20.7283 23.0123 20.4582 22.7422C20.1882 22.4722 19.8219 22.3205 19.44 22.3205V18.0005C19.44 17.6186 19.2883 17.2523 19.0182 16.9822C18.7482 16.7122 18.3819 16.5605 18 16.5605H16.56Z" fill="white" fillOpacity="0.7" />
            </svg>

          </button>


        </div>
        {showTooltip && (
          <div
            ref={tooltipRef}
            className="absolute top-[34px]  -right-[10px] z-50 w-[340px] bg-black/95 backdrop-blur-sm rounded-[12px] px-4 pt-3 pb-2 shadow-2xl animate-fade-in"
          >
            <div className="text-white font-medium text-sm [font-family:'Poppins',Helvetica] leading-normal">
              <div className="text-[#95f2ec] font-semibold mb-1 text-center">
                30 Days Streak
              </div>
              <div className="text-center text-gray-200">
                Complete at least 1 task per day to climb. Missing a day resets you to the last milestone.

              </div>
            </div>
            <div className="absolute top-[-8px] right-[25px] w-4 h-4 bg-black/95 transform rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Homepage;
