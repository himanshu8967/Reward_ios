"use client";
import React from "react";
import { useRouter } from "next/navigation";
import { GoalProgressSection } from "./components/GoalProgressSection";
import { TaskListSection } from "./components/TaskListSection";
import { BannerSection } from "./components/BannerSection";
import { HomeIndicator } from "@/components/HomeIndicator";
import { Header } from "./components/Header";


export default function AchieveGoalsPage() {
    const router = useRouter();

    return (
        <div className="flex flex-col overflow-x-hidden w-full h-full gap-4 items-center justify-center px-4 pb-3 pt-1 bg-black max-w-[390px] mx-auto relative">
            <Header />
            <GoalProgressSection />
            <TaskListSection />
            <BannerSection />
        </div>
    );
}