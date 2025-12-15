"use client";
import OnboardingInitializer from "@/components/OnboardingInitializer";
import useOnboardingStore from "@/stores/useOnboardingStore";
import React from "react";

const TOTAL_STEPS = 5;

const OnboardingLayout = ({ children }) => {
  const currentStep = useOnboardingStore((state) => state.currentStep);

  return (
    <div className="relative w-full h-screen bg-[#272052] overflow-hidden">
      <div className="absolute top-4 sm:top-6 left-0 px-3 sm:px-4 w-full z-10">
        <div className="flex items-center space-x-1.5 sm:space-x-2 mb-1.5 sm:mb-2">
          {[...Array(TOTAL_STEPS)].map((_, i) => {
            const step = i + 1;
            return (
              <div
                key={step}
                className={`h-1 sm:h-1.5 flex-1 rounded-full ${
                  step < currentStep
                    ? "bg-[#8BDFBC]"
                    : step === currentStep
                    ? "bg-[#B4AFFF]"
                    : "bg-gray-200 opacity-50"
                }`}
              />
            );
          })}
        </div>
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <div className="relative flex items-center justify-center w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#9EADF7]">
            <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-[#272052]" />
          </div>
          <span className="text-white text-xs sm:text-sm font-medium">
            Step {currentStep} of {TOTAL_STEPS}
          </span>
        </div>
      </div>

      <OnboardingInitializer>{children}</OnboardingInitializer>
    </div>
  );
};

export default OnboardingLayout;
