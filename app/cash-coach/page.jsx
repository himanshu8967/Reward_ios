"use client";
import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { EarningsOverviewSection } from "./components/EarningsOverviewSection";
import { GoalsAndTargetsSection } from "./components/GoalsAndTargetsSection";
import { FinancialMetricsSection } from "./components/FinancialMetricsSection";
import { HomeIndicator } from "@/components/HomeIndicator";

export default function CashCoachPage() {
    const { status, error } = useSelector((state) => state.cashCoach);

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

    return (
        <div className="flex flex-col overflow-x-hidden  w-full h-full items-center justify-center px-6 pb-3 pt-1 bg-black ">
            <EarningsOverviewSection />
            <GoalsAndTargetsSection />
            <FinancialMetricsSection />
            <HomeIndicator />
        </div>
    );
}