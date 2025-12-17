package com.jackson.app;

import android.os.Bundle;
import android.util.Log;
import android.webkit.WebView;
import androidx.core.splashscreen.SplashScreen;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    
    private static final String TAG = "🚀 MainActivity";
    
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
        Log.d(TAG, "║           MainActivity.onCreate() - Starting               ║");
        Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
        
        // Register Native BiometricPrompt Plugin FIRST (before super.onCreate)
        // This plugin uses androidx.biometric.BiometricPrompt with BIOMETRIC_STRONG
        // Tied to device hardware trust zone (TEE)
        Log.d(TAG, "🔐 Registering NativeBiometricPlugin...");
        registerPlugin(NativeBiometricPlugin.class);
        Log.d(TAG, "✅ NativeBiometricPlugin registered successfully");
        
        // Hide the action bar before splash screen
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        
        // Install the splash screen
        SplashScreen splashScreen = SplashScreen.installSplashScreen(this);
        
        super.onCreate(savedInstanceState);
        
        // Hide the action bar again after super.onCreate
        if (getSupportActionBar() != null) {
            getSupportActionBar().hide();
        }
        
        // Configure WebView to hide scrollbars after initialization
        try {
            // Use post to ensure WebView is initialized
            getWindow().getDecorView().post(new Runnable() {
                @Override
                public void run() {
                    try {
                        WebView webView = getBridge().getWebView();
                        if (webView != null) {
                            // Completely disable horizontal and vertical scrollbars
                            webView.setVerticalScrollBarEnabled(false);
                            webView.setHorizontalScrollBarEnabled(false);
                            // Set scrollbar style to hide overlay
                            webView.setScrollBarStyle(WebView.SCROLLBARS_INSIDE_OVERLAY);
                            // Disable overscroll bounce effect (over-scroll mode)
                            webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);
                        }
                    } catch (Exception e) {
                        // Ignore if WebView is not available
                    }
                }
            });
        } catch (Exception e) {
            // Ignore if bridge is not available yet
        }
        
        // Keep the splash screen visible for a minimum duration
        splashScreen.setKeepOnScreenCondition(() -> {
            // You can add conditions here to control when to hide the splash screen
            // For now, we'll let it show for a minimum duration
            return false; // This will hide the splash screen immediately after the app loads
        });
    }
}
