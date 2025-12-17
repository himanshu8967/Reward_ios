package com.jackson.app;

import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.util.concurrent.Executor;

/**
 * Native BiometricPrompt Plugin for Jackson App
 * 
 * Uses androidx.biometric.BiometricPrompt with BIOMETRIC_STRONG
 * Tied to device hardware trust zone (TEE - Trusted Execution Environment)
 * 
 * Official Documentation:
 * - API Reference: https://developer.android.com/reference/androidx/biometric/BiometricPrompt
 * - Guide: https://developer.android.com/identity/sign-in/biometric-auth
 * - Security: https://source.android.com/docs/security/features/biometric
 * 
 * Security Levels:
 * - BIOMETRIC_STRONG (Class 3): Hardware-backed, anti-spoofing, TEE
 * - BIOMETRIC_WEAK (Class 2): Software-based
 * - DEVICE_CREDENTIAL (Class 1): PIN/Pattern/Password
 * 
 * @author Jackson App Team
 */
@CapacitorPlugin(name = "NativeBiometricPrompt")
public class NativeBiometricPlugin extends Plugin {
    
    private static final String TAG = "🔐 NativeBiometric";
    
    /**
     * Check if biometric authentication is available on this device
     * Uses BIOMETRIC_STRONG for hardware trust zone security (Class 3)
     * 
     * This method checks:
     * 1. If device has biometric hardware
     * 2. If biometric hardware is currently available
     * 3. If user has enrolled biometrics
     * 
     * @param call Capacitor plugin call
     */
    @PluginMethod
    public void isAvailable(PluginCall call) {
        Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
        Log.d(TAG, "║        isAvailable() - Checking Biometric Status           ║");
        Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
        
        try {
            Log.d(TAG, "📱 Device Info:");
            Log.d(TAG, "   • Model: " + Build.MODEL);
            Log.d(TAG, "   • Manufacturer: " + Build.MANUFACTURER);
            Log.d(TAG, "   • Android Version: " + Build.VERSION.SDK_INT + " (" + Build.VERSION.RELEASE + ")");
            Log.d(TAG, "   • Security Patch: " + Build.VERSION.SECURITY_PATCH);
            
            BiometricManager biometricManager = BiometricManager.from(getContext());
            Log.d(TAG, "✅ BiometricManager instance created");
            
            // Check for BIOMETRIC_STRONG (Class 3) - Hardware Trust Zone
            Log.d(TAG, "🔍 Checking BIOMETRIC_STRONG (Class 3 / Hardware TEE)...");
            int canAuthenticate = biometricManager.canAuthenticate(
                BiometricManager.Authenticators.BIOMETRIC_STRONG
            );
            
            Log.d(TAG, "📊 canAuthenticate() returned: " + canAuthenticate);
            
            JSObject result = new JSObject();
            
            switch (canAuthenticate) {
                case BiometricManager.BIOMETRIC_SUCCESS:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ✅ BIOMETRIC_SUCCESS - Class 3 Biometrics Available!      ║");
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    Log.d(TAG, "   • Hardware trust zone (TEE) is available");
                    Log.d(TAG, "   • Biometric data is enrolled");
                    Log.d(TAG, "   • Ready for BIOMETRIC_STRONG authentication");
                    
                    int biometryType = getBiometryType();
                    String biometryTypeName = getBiometryTypeName(biometryType);
                    
                    Log.d(TAG, "   • Biometry Type: " + biometryType + " (" + biometryTypeName + ")");
                    
                    result.put("isAvailable", true);
                    result.put("biometryType", biometryType);
                    result.put("biometryTypeName", biometryTypeName);
                    result.put("errorCode", 0);
                    result.put("message", "Biometric authentication available (hardware trust zone)");
                    result.put("securityLevel", "BIOMETRIC_STRONG");
                    result.put("securityClass", 3);
                    result.put("hardwareTEE", true);
                    break;
                    
                case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ❌ BIOMETRIC_ERROR_NO_HARDWARE                            ║");
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    Log.d(TAG, "   • This device does not have biometric hardware");
                    Log.d(TAG, "   • Cannot use Face ID or Fingerprint");
                    
                    result.put("isAvailable", false);
                    result.put("biometryType", 0);
                    result.put("biometryTypeName", "none");
                    result.put("errorCode", 1);
                    result.put("message", "No biometric hardware available on this device");
                    result.put("hardwareTEE", false);
                    break;
                    
                case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ⚠️ BIOMETRIC_ERROR_HW_UNAVAILABLE                         ║");
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    Log.d(TAG, "   • Biometric hardware exists but is currently unavailable");
                    Log.d(TAG, "   • May be in use by another app or temporarily disabled");
                    
                    result.put("isAvailable", false);
                    result.put("biometryType", getBiometryType());
                    result.put("biometryTypeName", getBiometryTypeName(getBiometryType()));
                    result.put("errorCode", 2);
                    result.put("message", "Biometric hardware is currently unavailable. Try again later.");
                    result.put("hardwareTEE", true);
                    result.put("temporarilyUnavailable", true);
                    break;
                    
                case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ⚠️ BIOMETRIC_ERROR_NONE_ENROLLED                          ║");
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    Log.d(TAG, "   • Biometric hardware exists");
                    Log.d(TAG, "   • But NO biometric data is enrolled");
                    Log.d(TAG, "   • User needs to set up Face ID or Fingerprint in Settings");
                    
                    result.put("isAvailable", false);
                    result.put("biometryType", getBiometryType());
                    result.put("biometryTypeName", getBiometryTypeName(getBiometryType()));
                    result.put("errorCode", 3);
                    result.put("message", "No biometric enrolled. Please set up Face ID or Fingerprint in Settings > Security > Biometrics.");
                    result.put("hardwareTEE", true);
                    result.put("canEnroll", true);
                    break;
                    
                case BiometricManager.BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ⚠️ BIOMETRIC_ERROR_SECURITY_UPDATE_REQUIRED               ║");
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    Log.d(TAG, "   • A security update is required");
                    Log.d(TAG, "   • User needs to update their device");
                    
                    result.put("isAvailable", false);
                    result.put("biometryType", 0);
                    result.put("biometryTypeName", "none");
                    result.put("errorCode", 4);
                    result.put("message", "Security update required. Please update your device.");
                    result.put("securityUpdateRequired", true);
                    break;
                    
                default:
                    Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                    Log.d(TAG, "║  ❓ UNKNOWN STATUS: " + canAuthenticate);
                    Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                    
                    result.put("isAvailable", false);
                    result.put("biometryType", 0);
                    result.put("biometryTypeName", "none");
                    result.put("errorCode", canAuthenticate);
                    result.put("message", "Unknown biometric status: " + canAuthenticate);
                    break;
            }
            
            // Add device info for debugging
            result.put("androidVersion", Build.VERSION.SDK_INT);
            result.put("androidRelease", Build.VERSION.RELEASE);
            result.put("deviceModel", Build.MODEL);
            result.put("manufacturer", Build.MANUFACTURER);
            result.put("securityPatch", Build.VERSION.SECURITY_PATCH);
            
            Log.d(TAG, "📤 Returning result: " + result.toString());
            call.resolve(result);
            
        } catch (Exception e) {
            Log.e(TAG, "╔════════════════════════════════════════════════════════════╗");
            Log.e(TAG, "║  ❌ EXCEPTION in isAvailable()                             ║");
            Log.e(TAG, "╚════════════════════════════════════════════════════════════╝");
            Log.e(TAG, "   • Exception: " + e.getClass().getSimpleName());
            Log.e(TAG, "   • Message: " + e.getMessage());
            e.printStackTrace();
            
            JSObject error = new JSObject();
            error.put("isAvailable", false);
            error.put("biometryType", 0);
            error.put("biometryTypeName", "none");
            error.put("errorCode", -99);
            error.put("message", "Exception: " + e.getMessage());
            error.put("exceptionType", e.getClass().getSimpleName());
            call.resolve(error);
        }
    }
    
    /**
     * Verify identity using BiometricPrompt with BIOMETRIC_STRONG
     * This triggers the OS-level biometric authentication dialog
     * Uses hardware trust zone (TEE) for secure authentication
     * 
     * @param call Capacitor plugin call with options:
     *   - title: Prompt title (default: "Face Verification")
     *   - subtitle: Prompt subtitle
     *   - description: Prompt description
     *   - negativeButtonText: Cancel button text
     */
    @PluginMethod
    public void verifyIdentity(PluginCall call) {
        String title = call.getString("title", "Face Verification");
        String subtitle = call.getString("subtitle", "Verify your identity");
        String description = call.getString("description", "Move your head slowly from left to right");
        String negativeButtonText = call.getString("negativeButtonText", "Cancel");
        
        Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
        Log.d(TAG, "║        verifyIdentity() - Starting Authentication          ║");
        Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
        Log.d(TAG, "📋 Prompt Configuration:");
        Log.d(TAG, "   • Title: " + title);
        Log.d(TAG, "   • Subtitle: " + subtitle);
        Log.d(TAG, "   • Description: " + description);
        Log.d(TAG, "   • Negative Button: " + negativeButtonText);
        Log.d(TAG, "   • Security Level: BIOMETRIC_STRONG (Class 3 / TEE)");
        
        getActivity().runOnUiThread(() -> {
            try {
                Log.d(TAG, "🔄 Running on UI thread...");
                
                FragmentActivity activity = (FragmentActivity) getActivity();
                Log.d(TAG, "✅ Got FragmentActivity: " + activity.getClass().getSimpleName());
                
                Executor executor = ContextCompat.getMainExecutor(getContext());
                Log.d(TAG, "✅ Got MainExecutor");
                
                // Create BiometricPrompt with authentication callbacks
                Log.d(TAG, "🔨 Creating BiometricPrompt with AuthenticationCallback...");
                
                BiometricPrompt biometricPrompt = new BiometricPrompt(activity, executor,
                    new BiometricPrompt.AuthenticationCallback() {
                        
                        @Override
                        public void onAuthenticationSucceeded(@NonNull BiometricPrompt.AuthenticationResult result) {
                            super.onAuthenticationSucceeded(result);
                            
                            Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                            Log.d(TAG, "║  ✅ AUTHENTICATION SUCCEEDED!                              ║");
                            Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                            Log.d(TAG, "   • User successfully authenticated");
                            Log.d(TAG, "   • Hardware trust zone (TEE) verified");
                            
                            // Get authentication type
                            int authType = result.getAuthenticationType();
                            Log.d(TAG, "   • Authentication Type Code: " + authType);
                            
                            String authTypeString;
                            String authTypeDescription;
                            
                            if (authType == BiometricPrompt.AUTHENTICATION_RESULT_TYPE_BIOMETRIC) {
                                authTypeString = "biometric";
                                authTypeDescription = "Hardware-backed biometric (TEE verified)";
                                Log.d(TAG, "   • Type: BIOMETRIC (Face ID / Fingerprint)");
                                Log.d(TAG, "   • Security: Hardware Trust Zone (TEE)");
                            } else if (authType == BiometricPrompt.AUTHENTICATION_RESULT_TYPE_DEVICE_CREDENTIAL) {
                                authTypeString = "device_credential";
                                authTypeDescription = "Device credential (PIN/Pattern/Password)";
                                Log.d(TAG, "   • Type: DEVICE_CREDENTIAL (PIN/Pattern/Password)");
                            } else {
                                authTypeString = "unknown";
                                authTypeDescription = "Unknown authentication type: " + authType;
                                Log.d(TAG, "   • Type: UNKNOWN (" + authType + ")");
                            }
                            
                            JSObject response = new JSObject();
                            response.put("success", true);
                            response.put("message", "Biometric authentication successful");
                            response.put("authType", authTypeString);
                            response.put("authTypeCode", authType);
                            response.put("authTypeDescription", authTypeDescription);
                            response.put("securityLevel", "BIOMETRIC_STRONG");
                            response.put("securityClass", 3);
                            response.put("hardwareTEE", true);
                            response.put("timestamp", System.currentTimeMillis());
                            
                            Log.d(TAG, "📤 Resolving with success response");
                            call.resolve(response);
                        }
                        
                        @Override
                        public void onAuthenticationError(int errorCode, @NonNull CharSequence errString) {
                            super.onAuthenticationError(errorCode, errString);
                            
                            String errorType = mapErrorCode(errorCode);
                            boolean isUserCanceled = errorCode == BiometricPrompt.ERROR_USER_CANCELED || 
                                                     errorCode == BiometricPrompt.ERROR_NEGATIVE_BUTTON ||
                                                     errorCode == BiometricPrompt.ERROR_CANCELED;
                            boolean isLockout = errorCode == BiometricPrompt.ERROR_LOCKOUT || 
                                               errorCode == BiometricPrompt.ERROR_LOCKOUT_PERMANENT;
                            
                            Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                            Log.d(TAG, "║  ❌ AUTHENTICATION ERROR                                   ║");
                            Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                            Log.d(TAG, "   • Error Code: " + errorCode);
                            Log.d(TAG, "   • Error Type: " + errorType);
                            Log.d(TAG, "   • Error Message: " + errString);
                            Log.d(TAG, "   • Is User Canceled: " + isUserCanceled);
                            Log.d(TAG, "   • Is Lockout: " + isLockout);
                            
                            if (isLockout) {
                                Log.w(TAG, "   ⚠️ Device is in LOCKOUT state!");
                                if (errorCode == BiometricPrompt.ERROR_LOCKOUT_PERMANENT) {
                                    Log.w(TAG, "   ⚠️ PERMANENT lockout - requires device unlock");
                                } else {
                                    Log.w(TAG, "   ⚠️ TEMPORARY lockout - wait and try again");
                                }
                            }
                            
                            JSObject response = new JSObject();
                            response.put("success", false);
                            response.put("errorCode", errorCode);
                            response.put("errorType", errorType);
                            response.put("errorMessage", errString.toString());
                            response.put("isUserCanceled", isUserCanceled);
                            response.put("isLockout", isLockout);
                            response.put("isLockoutPermanent", errorCode == BiometricPrompt.ERROR_LOCKOUT_PERMANENT);
                            response.put("timestamp", System.currentTimeMillis());
                            
                            Log.d(TAG, "📤 Resolving with error response");
                            call.resolve(response);
                        }
                        
                        @Override
                        public void onAuthenticationFailed() {
                            super.onAuthenticationFailed();
                            
                            Log.d(TAG, "╔════════════════════════════════════════════════════════════╗");
                            Log.d(TAG, "║  ⚠️ AUTHENTICATION FAILED - Biometric Not Recognized       ║");
                            Log.d(TAG, "╚════════════════════════════════════════════════════════════╝");
                            Log.d(TAG, "   • The biometric was not recognized");
                            Log.d(TAG, "   • User can retry - prompt stays open");
                            Log.d(TAG, "   • NOT resolving - waiting for success or error");
                            
                            // Note: Don't resolve here - the prompt stays open for retry
                            // This callback is called when biometric doesn't match
                            // The system will allow the user to try again
                        }
                    });
                
                Log.d(TAG, "✅ BiometricPrompt created successfully");
                
                // Build PromptInfo with BIOMETRIC_STRONG (Class 3 / hardware trust zone)
                Log.d(TAG, "🔨 Building PromptInfo with BIOMETRIC_STRONG...");
                
                BiometricPrompt.PromptInfo promptInfo = new BiometricPrompt.PromptInfo.Builder()
                    .setTitle(title)
                    .setSubtitle(subtitle)
                    .setDescription(description)
                    .setNegativeButtonText(negativeButtonText)
                    // BIOMETRIC_STRONG ensures:
                    // 1. Hardware-backed security (TEE - Trusted Execution Environment)
                    // 2. Class 3 biometric only (highest security)
                    // 3. Anti-spoofing protection
                    // 4. Biometric data never leaves secure enclave
                    .setAllowedAuthenticators(BiometricManager.Authenticators.BIOMETRIC_STRONG)
                    .setConfirmationRequired(true)
                    .build();
                
                Log.d(TAG, "✅ PromptInfo built successfully");
                Log.d(TAG, "🚀 Showing BiometricPrompt dialog...");
                Log.d(TAG, "═══════════════════════════════════════════════════════════════");
                
                // Show the biometric prompt
                biometricPrompt.authenticate(promptInfo);
                
                Log.d(TAG, "✅ BiometricPrompt.authenticate() called - waiting for user...");
                
            } catch (Exception e) {
                Log.e(TAG, "╔════════════════════════════════════════════════════════════╗");
                Log.e(TAG, "║  ❌ EXCEPTION in verifyIdentity()                          ║");
                Log.e(TAG, "╚════════════════════════════════════════════════════════════╝");
                Log.e(TAG, "   • Exception: " + e.getClass().getSimpleName());
                Log.e(TAG, "   • Message: " + e.getMessage());
                e.printStackTrace();
                
                JSObject error = new JSObject();
                error.put("success", false);
                error.put("errorCode", -99);
                error.put("errorType", "exception");
                error.put("errorMessage", "Exception: " + e.getMessage());
                error.put("exceptionType", e.getClass().getSimpleName());
                error.put("timestamp", System.currentTimeMillis());
                call.resolve(error);
            }
        });
    }
    
    /**
     * Get the type of biometric hardware available on the device
     * 
     * @return Biometry type code:
     *   - 0 = None
     *   - 3 = Fingerprint
     *   - 4 = Face
     */
    private int getBiometryType() {
        Log.d(TAG, "🔍 Detecting biometric hardware type...");
        
        // Check for face authentication (Android 10+ / API 29+)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean hasFace = getContext().getPackageManager()
                .hasSystemFeature("android.hardware.biometrics.face");
            Log.d(TAG, "   • Has face hardware (API 29+): " + hasFace);
            
            if (hasFace) {
                Log.d(TAG, "   ✅ Face authentication hardware detected");
                return 4; // Face
            }
        } else {
            Log.d(TAG, "   • Android version < 10, skipping face check");
        }
        
        // Check for fingerprint
        boolean hasFingerprint = getContext().getPackageManager()
            .hasSystemFeature("android.hardware.fingerprint");
        Log.d(TAG, "   • Has fingerprint hardware: " + hasFingerprint);
        
        if (hasFingerprint) {
            Log.d(TAG, "   ✅ Fingerprint hardware detected");
            return 3; // Fingerprint
        }
        
        // Check for iris (rare)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            boolean hasIris = getContext().getPackageManager()
                .hasSystemFeature("android.hardware.biometrics.iris");
            Log.d(TAG, "   • Has iris hardware: " + hasIris);
            
            if (hasIris) {
                Log.d(TAG, "   ✅ Iris authentication hardware detected");
                return 5; // Iris
            }
        }
        
        Log.d(TAG, "   ❌ No biometric hardware detected");
        return 0; // None
    }
    
    /**
     * Get human-readable name for biometry type
     * 
     * @param type Biometry type code
     * @return Human-readable name
     */
    private String getBiometryTypeName(int type) {
        switch (type) {
            case 4: return "face";
            case 3: return "fingerprint";
            case 5: return "iris";
            default: return "none";
        }
    }
    
    /**
     * Map BiometricPrompt error codes to human-readable types
     * 
     * @param errorCode BiometricPrompt error code
     * @return Human-readable error type
     */
    private String mapErrorCode(int errorCode) {
        switch (errorCode) {
            case BiometricPrompt.ERROR_CANCELED:
                return "canceled";
            case BiometricPrompt.ERROR_USER_CANCELED:
                return "user_canceled";
            case BiometricPrompt.ERROR_NEGATIVE_BUTTON:
                return "negative_button_pressed";
            case BiometricPrompt.ERROR_LOCKOUT:
                return "lockout_temporary";
            case BiometricPrompt.ERROR_LOCKOUT_PERMANENT:
                return "lockout_permanent";
            case BiometricPrompt.ERROR_NO_BIOMETRICS:
                return "no_biometrics_enrolled";
            case BiometricPrompt.ERROR_NO_DEVICE_CREDENTIAL:
                return "no_device_credential";
            case BiometricPrompt.ERROR_HW_NOT_PRESENT:
                return "hardware_not_present";
            case BiometricPrompt.ERROR_HW_UNAVAILABLE:
                return "hardware_unavailable";
            case BiometricPrompt.ERROR_TIMEOUT:
                return "timeout";
            case BiometricPrompt.ERROR_UNABLE_TO_PROCESS:
                return "unable_to_process";
            case BiometricPrompt.ERROR_VENDOR:
                return "vendor_error";
            case BiometricPrompt.ERROR_NO_SPACE:
                return "no_space";
            default:
                return "unknown_error_" + errorCode;
        }
    }
}


