// File: app/components/StatusBarSetter.jsx

"use client";
import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { StatusBar, Style } from "@capacitor/status-bar";
// Recommended: Import the main object from the navigation bar plugin
import { NavigationBar } from "@capgo/capacitor-navigation-bar";

export default function StatusBarSetter() {
    useEffect(() => {
        // Only run on native platforms
        const platform = Capacitor.getPlatform();
        if (platform === "web") return;

        const setBars = async () => {
            try {
                // This is a good practice to keep
                await StatusBar.setOverlaysWebView({ overlay: false });

                // --- STATUS BAR (TOP) ---
                // 1. Set background color to black
                await StatusBar.setBackgroundColor({ color: "#000000" });

                // 2. Set style to Dark for LIGHT icons on a dark background
                await StatusBar.setStyle({ style: Style.Dark });

                // --- NAVIGATION BAR (BOTTOM - Android only) ---
                if (platform === "android") {
                    await NavigationBar.setColor({
                        // 3. Set background color to black
                        color: "#000000",
                        // 4. Set darkButtons to false for LIGHT buttons on a dark background
                        darkButtons: false,
                    });
                }
            } catch (e) {
                console.warn("StatusBar/NavigationBar config failed:", e);
            }
        };

        setBars();
    }, []);

    return null;
}