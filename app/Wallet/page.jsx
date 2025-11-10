"use client";
import React from "react";
import MyEarningCard from "./Components/MyEarningCard";
import { HighestEarningGame } from "./Components/HighestEarningGame";
import TransactionHistory from "./Components/TransactionHistory";
import { VipMember } from "./Components/VipMember";
import { WithdrawalOption } from "./Components/WithdrawalOption";
import { Conversion } from "./Components/Conversion";
import { HomeIndicator } from "../../components/HomeIndicator";
import WalletHeader from "./Components/WalletHeader";
import SpinWin from "../myprofile/components/SpinWin";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useVipStatus } from "@/hooks/useVipStatus";
import { useAuth } from "@/contexts/AuthContext";


export default function WalletPage() {
  const router = useRouter();
  const { token } = useAuth();

  const {
    detailsStatus,
    statsStatus,
    error,
  } = useSelector((state) => state.profile);

  // VIP status using custom hook
  const { vipStatus, isLoading: vipLoadingStatus } = useVipStatus();


  // Get wallet screen data from Redux store
  const { walletScreen } = useSelector((state) => state.walletTransactions);
  const coinBalance = walletScreen?.wallet?.balance || 0;
  const balance = coinBalance || 0;

  const handleVipUpgrade = () => {
    router.prefetch("/BuySubscription");
    router.push("/BuySubscription");
  };

  const isLoading = detailsStatus === 'loading' || statsStatus === 'loading' || vipLoadingStatus === 'loading';
  const hasFailed = detailsStatus === 'failed' || statsStatus === 'failed' || vipLoadingStatus === 'failed';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-white text-xl">
        Loading Wallet...
      </div>
    );
  }
  if (hasFailed) {
    return (
      <div className="min-h-screen bg-black flex justify-center items-center text-red-500 text-xl">
        Error: {error || "Failed to load data. Please try again later."}
      </div>
    );
  }



  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-black flex justify-center">
      <div className="w-full max-w-md min-h-screen flex flex-col items-center bg-black pb-6">
        <WalletHeader balance={balance} appVersion="V0.1.1" token={token} />
        <MyEarningCard token={token} />
        <TransactionHistory />
        <HighestEarningGame />
        <SpinWin />
        <Conversion />
        <WithdrawalOption />
        <VipMember vipStatus={vipStatus} handleVipUpgrade={handleVipUpgrade} />
        <HomeIndicator activeTab="wallet" />
      </div>
    </div>
  );
}