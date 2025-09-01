"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LoadingScreen from "@/components/LoadingScreen";

export default function AppLoader() {
  const router = useRouter();
  const [loadingMessage, setLoadingMessage] = useState("Loading App...");

  useEffect(() => {
    const storedUserString = localStorage.getItem("user");
    const hasCompletedOnboarding =
      localStorage.getItem("onboardingComplete") === "true";
    const onboardingInProgressData = localStorage.getItem("onboarding-storage");
    const permissionsAccepted =
      localStorage.getItem("permissionsAccepted") === "true";
    const locationCompleted =
      localStorage.getItem("locationCompleted") === "true";

    if (storedUserString) {
      try {
        const user = JSON.parse(storedUserString);
        if (user && user.firstName) {
          setLoadingMessage(`Welcome back, ${user.firstName}!`);
        } else {
          setLoadingMessage("Resuming your session...");
        }

        if (!permissionsAccepted) {
          router.replace("/permissions");
          return; // Stop further execution
        }

        // Condition 2: Accepted permissions, but has not completed the location step.
        if (!locationCompleted) {
          router.replace("/location");
          return; // Stop further execution
        }
        router.replace("/homepage");
        return;
      } catch (e) {
        setLoadingMessage("Resuming your session...");
      }
    } else if (onboardingInProgressData) {
      try {
        const onboardingState = JSON.parse(onboardingInProgressData);
        const state = onboardingState?.state;

        // Check if there's valid state to resume from.
        if (state) {
          setLoadingMessage("Resuming your setup...");
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

  return <LoadingScreen message={loadingMessage} />;
}
