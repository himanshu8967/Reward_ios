"use client";
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHomepageData } from "@/hooks/useHomepageData";
import { HomeIndicator } from "../../components/HomeIndicator";
import HeaderSection from "./components/HeaderSection";
import RewardProgress from "./components/RewardProgress";
import XPTierTracker from "./components/XPTierTracker";
import MostPlayedGames from "./components/MostPlayedGames";
import WelcomeOfferSection from "./components/WelcomeOfferSection";
import GameCard from "./components/GameCard";
import VipBanner from "./components/VipBanner";
import RaceSection from "./components/RaceSection";
import StreakSection from "./components/StreakSection";

const Homepage = () => {
  const { token, user } = useAuth();

  const {
    stats,
    hasStats,
  } = useHomepageData(token, user);



  return (
    <div
      className="relative w-full min-h-screen bg-black pb-[150px] animate-fade-in"
    >
      <div className="absolute w-full h-[49px] z-10 px-8">
        <div className="absolute top-[10px] left-6 [font-family:'Poppins',Helvetica] font-normal text-white text-[10px] tracking-[0] leading-3 whitespace-nowrap">
          App Version: V0.0.1
        </div>
      </div>
      <div className="flex flex-col w-full max-w-[375px] mx-auto items-center gap-6 pt-36 px-4 ">
        <HeaderSection />
        {hasStats && <RewardProgress stats={stats} />}
        {hasStats && <XPTierTracker stats={stats} token={token} />}
        <MostPlayedGames />
        <WelcomeOfferSection />
        <GameCard />
        <VipBanner />
        <RaceSection />
        <StreakSection />
      </div>
      <HomeIndicator activeTab="home" />
    </div>
  );
};

export default Homepage;