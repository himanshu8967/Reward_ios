"use client";
import React, { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { fetchFinancialGoals } from "@/lib/redux/slice/cashCoachSlice";
import { EarningsOverviewSection } from "./components/EarningsOverviewSection";
import { GoalsAndTargetsSection } from "./components/GoalsAndTargetsSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { PageHeader } from "@/components/PageHeader";

export default function CashCoachPage() {
    const dispatch = useDispatch();
    const router = useRouter();
    const { token } = useAuth();
    const { status, error } = useSelector((state) => state.cashCoach);

    // Audio ref for coin sound effect
    const audioRef = useRef(null);

    // Get wallet screen data from Redux store for coin balance
    const { walletScreen } = useSelector((state) => state.walletTransactions);
    const coinBalance = walletScreen?.wallet?.balance || 0;

    useEffect(() => {
        if (token && status === 'idle') {
            dispatch(fetchFinancialGoals(token));
        }
    }, [dispatch, token, status]);

    // Initialize audio element when component mounts
    useEffect(() => {
        // Ensure audio is ready to play
        if (audioRef.current) {
            audioRef.current.volume = 0.7; // Set volume (0.0 to 1.0)
            audioRef.current.load();
        }
    }, []);

    if (status === 'loading' || status === 'idle') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Loading Your Coach...
                </div>
            </div>
        );
    }

    if (status === 'failed') {
        return (
            <div className="w-full h-screen bg-black flex flex-col justify-center items-center">
                <div className="text-white text-center text-lg font-medium">
                    Error: {error}
                </div>
            </div>
        );
    }

    // Function to play coin sound effect
    const playCoinSound = () => {
        try {
            if (audioRef.current) {
                // Reset audio to beginning
                audioRef.current.currentTime = 0;
                // Play the sound
                const playPromise = audioRef.current.play();

                if (playPromise !== undefined) {
                    playPromise
                        .then(() => {
                            // Audio playing successfully
                            console.log("Coin sound playing");
                        })
                        .catch(error => {
                            // Autoplay was prevented or other error
                            console.log("Audio play failed:", error);
                            // Try to play again after user interaction
                            if (audioRef.current) {
                                audioRef.current.play().catch(err => {
                                    console.log("Retry audio play failed:", err);
                                });
                            }
                        });
                }
            }
        } catch (error) {
            console.log("Sound effect error:", error);
        }
    };

    // Handle coin balance click to navigate to Wallet
    const handleCoinBalanceClick = () => {
        // Play coin sound when user clicks on coin balance
        playCoinSound();
        router.push("/Wallet");
    };

    // Coin balance component for header
    const CoinBalance = () => (
        <button
            onClick={handleCoinBalanceClick}
            className="h-9 rounded-3xl bg-[linear-gradient(180deg,rgba(158,173,247,0.4)_0%,rgba(113,106,231,0.4)_100%)] flex items-center px-2.5 hover:opacity-80 transition-opacity duration-200 cursor-pointer"
            type="button"
            aria-label="Navigate to Wallet"
        >
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-white text-lg [font-family:'Poppins',Helvetica] font-semibold leading-[normal] break-all">
                    {coinBalance || 0}
                </span>
                <img
                    className="w-[23px] h-6 flex-shrink-0"
                    alt="Coin"
                    src="/dollor.png"
                />
            </div>
        </button>
    );

    return (
        <div className="flex flex-col overflow-x-hidden w-full h-full items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto relative">
            {/* App Version */}
            <div className="absolute top-[1px] left-3 w-full h-[40px] z-10">
                <div className="absolute top-[10px] left-1 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                    App Version: V0.0.1
                </div>
            </div>
            <div className="mt-[26px] w-full">
                <PageHeader
                    title="Cash Coach"
                    rightElement={<CoinBalance />}
                    showBack={false}
                />
            </div>
            <EarningsOverviewSection />
            <GoalsAndTargetsSection />
            <HomeIndicator />

            {/* Audio element for coin sound effect */}
            <audio
                ref={audioRef}
                preload="auto"
                src="/spinning-coin-on-table-352448.mp3"
            />
        </div>
    );
}