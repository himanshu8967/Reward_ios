"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../contexts/AuthContext";
import Image from "next/image";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

const Spinner = () => (
  <div className="border-gray-500 h-16 w-16 animate-spin rounded-full border-4 border-t-[#af7de6]" />
);

// A simple SVG checkmark for the success state
const SuccessIcon = () => (
  <svg
    className="h-16 w-16 text-green-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

// A simple SVG error icon for the failure state
const ErrorIcon = () => (
  <svg
    className="h-16 w-16 text-red-400"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { handleSocialAuthCallback, user, isLoading } = useAuth();

  // State to manage UI: 'processing', 'success', or 'error'
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const [authCompleted, setAuthCompleted] = useState(false);

  useEffect(() => {
    const processAuth = async () => {
      // Get all URL parameters for debugging
      const token = searchParams.get("token");
      const authError =
        searchParams.get("message") || searchParams.get("error");
      const provider = searchParams.get("provider");
      const userId = searchParams.get("userId");

      console.log("🔐 [Auth Callback] Processing authentication:", {
        hasToken: !!token,
        tokenLength: token?.length || 0,
        authError,
        provider,
        userId,
        isNative: Capacitor.isNativePlatform(),
        allParams: Object.fromEntries(searchParams.entries()),
      });

      // Handle native platform deep link redirect
      if (Capacitor.isNativePlatform()) {
        let deepLink = "com.jackson.app://auth/callback";
        if (token) {
          deepLink += `?token=${encodeURIComponent(token)}`;
          if (provider) deepLink += `&provider=${encodeURIComponent(provider)}`;
          if (userId) deepLink += `&userId=${encodeURIComponent(userId)}`;
        } else {
          const message = authError || "Authentication token not found.";
          deepLink += `?message=${encodeURIComponent(message)}`;
        }
        console.log(
          "📱 [Auth Callback] Processing deep link redirect:",
          deepLink
        );

        // For mobile apps, we need to:
        // 1. Close the Capacitor Browser
        // 2. Redirect to the deep link which will be caught by the app's deep link handler

        try {
          // Close the browser FIRST
          await Browser.close();
          console.log("✅ [Auth Callback] Browser closed successfully");

          // Wait a bit for browser to fully close, then redirect to deep link
          setTimeout(() => {
            console.log(
              "📱 [Auth Callback] Redirecting to deep link:",
              deepLink
            );
            try {
              // Try to redirect to deep link
              window.location.href = deepLink;

              // Fallback: If deep link doesn't work, try using App plugin
              setTimeout(() => {
                // If we're still here after 1 second, the deep link might not have worked
                // Try alternative method using App.openUrl if available
                if (
                  typeof window !== "undefined" &&
                  window.Capacitor &&
                  window.Capacitor.Plugins &&
                  window.Capacitor.Plugins.App
                ) {
                  window.Capacitor.Plugins.App.openUrl({ url: deepLink }).catch(
                    (err) => {
                      console.error(
                        "❌ [Auth Callback] Failed to open deep link via App plugin:",
                        err
                      );
                    }
                  );
                }
              }, 1000);
            } catch (redirectError) {
              console.error(
                "❌ [Auth Callback] Failed to redirect to deep link:",
                redirectError
              );
              setErrorMessage("Failed to redirect to app. Please try again.");
              setStatus("error");
            }
          }, 500); // Increased delay to ensure browser is fully closed
        } catch (closeError) {
          console.warn(
            "⚠️ [Auth Callback] Browser close error (may already be closed):",
            closeError
          );
          // Even if closing fails, try to redirect to deep link
          setTimeout(() => {
            console.log(
              "📱 [Auth Callback] Attempting deep link redirect after close error"
            );
            window.location.href = deepLink;
          }, 300);
        }
        return;
      }

      // Handle errors from backend
      if (authError) {
        console.error("❌ [Auth Callback] Authentication error:", authError);
        setErrorMessage(authError || "An unknown error occurred.");
        setStatus("error");
        setTimeout(() => router.replace("/login"), 4000);
        return;
      }

      // Process token if available
      if (token) {
        try {
          console.log("✅ [Auth Callback] Token received, processing...");
          const result = await handleSocialAuthCallback(token);
          if (result.ok) {
            console.log("✅ [Auth Callback] Authentication successful");
            setStatus("success");
            setAuthCompleted(true);
            // Wait for auth state to be fully set before redirecting
            // This prevents the login page from flashing
          } else {
            console.error(
              "❌ [Auth Callback] Authentication failed:",
              result.error
            );
            setErrorMessage(
              result.error ||
                "Failed to process authentication. Please try again."
            );
            setStatus("error");
            setTimeout(() => router.replace("/login"), 4000);
          }
        } catch (error) {
          console.error(
            "❌ [Auth Callback] Exception during authentication:",
            error
          );
          setErrorMessage(
            error.message || "An unexpected error occurred. Please try again."
          );
          setStatus("error");
          setTimeout(() => router.replace("/login"), 4000);
        }
      } else {
        console.error("❌ [Auth Callback] No token found in URL parameters");
        setErrorMessage(
          "Authentication token not found. Redirecting to login..."
        );
        setStatus("error");
        setTimeout(() => router.replace("/login"), 3000);
      }
    };

    processAuth();
  }, [router, searchParams, handleSocialAuthCallback]);

  // Wait for auth state to be ready before redirecting
  useEffect(() => {
    if (authCompleted && !isLoading && user) {
      // Small delay to ensure state is fully propagated
      const redirectTimer = setTimeout(() => {
        router.replace("/location");
      }, 500);
      return () => clearTimeout(redirectTimer);
    }
  }, [authCompleted, isLoading, user, router]);

  // Helper function to render content based on status
  const renderContent = () => {
    switch (status) {
      case "success":
        return (
          <>
            <SuccessIcon />
            <h1 className="text-2xl font-semibold text-white mt-4">Success!</h1>
            <p className="text-neutral-400 mt-2">
              Welcome! Setting up your account...
            </p>
            <p className="text-neutral-500 text-sm mt-1">
              Please wait, we&apos;re almost there...
            </p>
          </>
        );
      case "error":
        return (
          <>
            <ErrorIcon />
            <h1 className="text-2xl font-semibold text-red-400 mt-4">
              Authentication Failed
            </h1>
            <p className="text-neutral-400 mt-2 text-center">{errorMessage}</p>
          </>
        );
      case "processing":
      default:
        return (
          <>
            <Spinner />
            <h1 className="text-2xl font-semibold text-white mt-4">
              Authenticating...
            </h1>
            <p className="text-neutral-400 mt-2">
              Please wait while we securely sign you in.
            </p>
          </>
        );
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#272052] overflow-x-hidden">
      <div className="relative w-full min-h-screen bg-[#272052] flex justify-center items-center">
        <div className="absolute w-[375px] h-[1061px] bg-[#272052] overflow-hidden">
          <div className="absolute w-[470px] h-[883px] -top-32 -left-3.5">
            <div className="absolute w-[358px] h-[358px] top-0 left-7 bg-[#af7de6] rounded-[179px] blur-[250px]" />
            <Image
              className="absolute w-[83px] h-[125px] top-[140px] left-3.5"
              alt="Front shapes"
              src="https://c.animaapp.com/bkGH9LUL/img/front-shapes@2x.png"
              width={83}
              height={125}
            />
            <Image
              className="absolute w-[18px] h-[275px] top-[160px] left-[371px]"
              alt="Saly"
              src="https://c.animaapp.com/bkGH9LUL/img/saly-16@2x.png"
              width={18}
              height={275}
            />
          </div>
        </div>

        {/* Centered Content Box */}
        <div className="relative z-10 w-[314px] flex flex-col items-center justify-center p-6 [font-family:'Poppins',Helvetica]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen w-full bg-[#272052] flex justify-center items-center">
          <div className="border-gray-500 h-16 w-16 animate-spin rounded-full border-4 border-t-[#af7de6]" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
