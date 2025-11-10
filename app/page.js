"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AppLoader() {
  const router = useRouter();

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    const hasCompletedOnboarding =
      localStorage.getItem("onboardingComplete") === "true";
    const onboardingInProgressData = localStorage.getItem("onboarding-storage");
    const permissionsAccepted =
      localStorage.getItem("permissionsAccepted") === "true";
    const locationCompleted =
      localStorage.getItem("locationCompleted") === "true";
    const faceVerificationCompleted =
      localStorage.getItem("faceVerificationCompleted") === "true";
    const faceVerificationSkipped =
      localStorage.getItem("faceVerificationSkipped") === "true";

    if (storedUserString) {
      try {
        const user = JSON.parse(storedUserString);

        // Check if this is a new signup (onboarding not complete) or existing user login
        const isNewSignup = !hasCompletedOnboarding;

        if (!permissionsAccepted) {
          router.replace("/permissions");
          return; // Stop further execution
        }

        // Condition 2: Accepted permissions, but has not completed the location step.
        if (!locationCompleted) {
          router.replace("/location");
          return; // Stop further execution
        }

        // Condition 3: Only show face verification for NEW SIGNUPS, not for login
        // Existing users who log in should skip face verification and go directly to homepage
        if (
          isNewSignup &&
          !faceVerificationCompleted &&
          !faceVerificationSkipped
        ) {
          router.replace("/face-verification");
          return; // Stop further execution
        }

        router.replace("/homepage");
        return;
      } catch (e) {
        // If parsing fails, redirect to login
        router.replace("/login");
      }
    } else if (onboardingInProgressData) {
      try {
        const onboardingState = JSON.parse(onboardingInProgressData);
        const state = onboardingState?.state;

        // Check if there's valid state to resume from.
        if (state) {
          if (!state.ageRange) {
            router.replace("/select-age");
          } else if (!state.gender) {
            router.replace("/select-gender");
          } else if (
            !state.gamePreferences ||
            state.gamePreferences.length === 0
          ) {
            router.replace("/game-preferences"); // Step 3
          } else if (!state.gameStyle) {
            router.replace("/game-styles"); // Step 4
          } else if (!state.gameHabit) {
            router.replace("/player-type"); // Step 5
          } else {
            router.replace("/player-type");
          }
          return;
        }
      } catch (e) {
        // If parsing fails, it's safer to start over.
        console.error("Failed to parse onboarding data, starting over.", e);
        router.replace("/welcome");
      }
    } else if (hasCompletedOnboarding) {
      router.replace("/login");
    } else {
      // Default for brand new users.
      router.replace("/welcome");
    }
  }, [router]);

  // Industry standard: No loading screen, just redirect immediately
  // The native splash screen handles the visual feedback
  return null;
}
