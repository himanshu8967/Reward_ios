"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
    checkBiometricAvailability,
    authenticateWithBiometric,
    hasBiometricCredentials,
    getBiometricType,
} from "@/lib/biometricAuth";
import { Capacitor } from "@capacitor/core";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Biometric Login Button Component
 * Uses capacitor-native-biometric properly following documentation
 * Flow: Check availability -> Verify identity -> Retrieve credentials -> Login
 */
export default function BiometricLoginButton({ onSuccess, onError }) {
    const [biometryType, setBiometryType] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [hasCredentials, setHasCredentials] = useState(false);
    const { refreshSession } = useAuth();

    useEffect(() => {
        checkAvailabilityAndCredentials();
    }, []);

    const checkAvailabilityAndCredentials = async () => {
        try {
            // Step 1: Check if biometric is available on device
            const availability = await checkBiometricAvailability();
            console.log("🔍 [LOGIN-BTN] Biometric availability:", availability);

            if (!availability.isAvailable) {
                console.log("⚠️ [LOGIN-BTN] Biometric not available");
                setBiometryType("none");
                return;
            }

            // Set the biometry type for display
            setBiometryType(availability.biometryTypeName);
            console.log("✅ [LOGIN-BTN] Biometry type:", availability.biometryTypeName);

            // Step 2: Check if user has stored credentials
            const credentialsExist = await hasBiometricCredentials();
            setHasCredentials(credentialsExist);
            console.log("🔍 [LOGIN-BTN] Has stored credentials:", credentialsExist);
        } catch (error) {
            console.error("❌ [LOGIN-BTN] Error checking availability:", error);
        }
    };

    const handleBiometricLogin = async () => {
        if (!Capacitor.isNativePlatform()) {
            onError?.("Biometric login is only available on the mobile app.");
            return;
        }

        setIsAuthenticating(true);

        try {
            console.log("🔐 [LOGIN-BTN] Starting biometric login flow...");

            // Check if credentials are stored
            if (!hasCredentials) {
                console.warn("⚠️ [LOGIN-BTN] No credentials stored");
                onError?.("Biometric login is not set up. Please sign in manually once to enable biometric login.");
                setIsAuthenticating(false);
                return;
            }

            // Complete biometric authentication flow
            // This will: Check availability -> Verify identity -> Retrieve credentials
            const authResult = await authenticateWithBiometric({
                reason: "Login to your Jackson account securely",
                title: "Biometric Login",
                subtitle: "Verify your identity to log in",
                description: "Use your biometric to access your account",
            });

            console.log("🔐 [LOGIN-BTN] Authentication result:", {
                success: authResult.success,
                hasUsername: !!authResult.username,
                hasPassword: !!authResult.password,
                biometryType: authResult.biometryTypeName,
            });

            if (!authResult.success) {
                console.error("❌ [LOGIN-BTN] Authentication failed:", authResult.error);
                onError?.(authResult.error || "Biometric authentication failed");
                setIsAuthenticating(false);
                return;
            }

            // Verify we have credentials
            if (!authResult.username || !authResult.password) {
                console.error("❌ [LOGIN-BTN] No credentials retrieved");
                onError?.("Failed to retrieve your credentials. Please sign in manually.");
                setIsAuthenticating(false);
                return;
            }

            console.log("✅ [LOGIN-BTN] Biometric authentication successful, restoring session...");

            // The password field contains a JSON string with token and user data
            let authToken = null;
            let userData = null;

            try {
                // Parse the stored credential payload
                const credentialPayload = JSON.parse(authResult.password);
                authToken = credentialPayload.token;
                userData = credentialPayload.user;
                console.log("✅ [LOGIN-BTN] Parsed credentials successfully");
            } catch (parseError) {
                console.error("❌ [LOGIN-BTN] Failed to parse credentials:", parseError);
                // Fallback: try to use as plain token and get user from localStorage
                authToken = authResult.password;
                try {
                    const storedUser = localStorage.getItem("user");
                    if (storedUser) {
                        userData = JSON.parse(storedUser);
                        console.log("✅ [LOGIN-BTN] Using fallback user data from localStorage");
                    }
                } catch (e) {
                    console.error("❌ [LOGIN-BTN] Failed to get user from localStorage:", e);
                }
            }

            // Verify we have both token and user data
            if (!authToken || !userData) {
                console.error("❌ [LOGIN-BTN] Missing token or user data");
                onError?.("Failed to retrieve your account data. Please sign in manually.");
                setIsAuthenticating(false);
                return;
            }

            // Refresh the session with retrieved credentials
            const refreshResult = await refreshSession({
                token: authToken,
                user: userData,
            });

            if (refreshResult?.ok) {
                console.log("✅ [LOGIN-BTN] Session restored successfully!");
                onSuccess?.({
                    token: authToken,
                    user: userData
                });
            } else {
                console.error("❌ [LOGIN-BTN] Session refresh failed");
                onError?.("Failed to restore your session. Please sign in manually.");
            }
        } catch (error) {
            console.error("❌ [LOGIN-BTN] Biometric login error:", error);
            onError?.(error.message || "Biometric login failed. Please try again.");
        } finally {
            setIsAuthenticating(false);
        }
    };

    // Button is always visible now (removed the auto-hide logic)

    return (
        <button
            onClick={handleBiometricLogin}
            disabled={isAuthenticating}
            className="relative w-[58.1px] h-11 rounded-[12px] border border-gray-600 bg-black/10 backdrop-blur-sm cursor-pointer flex items-center justify-center hover:bg-black/20 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            type="button"
            aria-label="Sign in with Biometric"
        >
            {isAuthenticating ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
                <div className="w-[20px] h-[20px] flex items-center justify-center">
                    <Image
                        className="w-7 h-[30px] object-cover"
                        alt="Apple logo"
                        src="https://c.animaapp.com/2Y7fJDnh/img/image-3961@2x.png"
                        width={28}
                        height={30}
                    />
                </div>
            )}
        </button>
    );
}

