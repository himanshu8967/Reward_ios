"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import SpinWheel from '@/components/SpinWheel';

export default function SpinWheelPage() {
    const router = useRouter();

    const handleBack = () => {
        router.back();
    };

    return (
        <div className="min-h-screen bg-black flex flex-col">
            {/* Header Section */}
            <div className="flex flex-col px-2 pb-2 w-full">
                {/* App Version at Top */}
                <div className="w-full flex justify-start pl-4">
                    <span className="[font-family:'Poppins',Helvetica] font-normal text-[#A4A4A4] text-[10px]">
                        App Version: V0.0.1
                    </span>
                </div>
                {/* Back Button Below Version */}
                <div className="w-full flex justify-start pl-2 pt-4">
                    <button
                        onClick={handleBack}
                        className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors"
                    >
                        <svg
                            width="30"
                            height="30"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                        <span className="text-lg mb-[1px] font-semibold">Spin and Win</span>
                    </button>
                </div>
            </div>

            {/* SpinWheel Component */}
            <div className="flex-1 flex items-center justify-center">
                <SpinWheel />
            </div>
        </div>
    );
}
