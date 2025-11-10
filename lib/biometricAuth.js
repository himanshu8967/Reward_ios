/**
 * Biometric Authentication Helper
 * Handles Face ID / Touch ID authentication for login
 * Uses capacitor-native-biometric for proven Android/iOS support
 *
 * COMPLETE IMPLEMENTATION FOLLOWING OFFICIAL DOCUMENTATION:
 * https://www.npmjs.com/package/capacitor-native-biometric
 *
 * Features Implemented:
 * 1. isAvailable() - Check if biometric is available
 * 2. verifyIdentity() - Authenticate with biometric
 * 3. setCredentials() - Store credentials securely
 * 4. getCredentials() - Retrieve stored credentials
 * 5. deleteCredentials() - Delete stored credentials
 */

import { Capacitor } from "@capacitor/core";
import { Device } from "@capacitor/device";
import { NativeBiometric, BiometryType } from "capacitor-native-biometric";

// Server identifier for credential storage
const CREDENTIAL_SERVER = "com.jackson.app";

/**
 * Check if biometric authentication is available on this device
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{isAvailable: boolean, biometryType: number, biometryTypeName: string, errorCode?: number}>}
 */
export async function checkBiometricAvailability() {
  console.log("🔍 [BIOMETRIC-LIB] checkBiometricAvailability() called");

  try {
    console.log("🔍 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
    console.log("🔍 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());

    // Only available on native platforms
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, returning unavailable"
      );
      return {
        isAvailable: false,
        biometryType: BiometryType.NONE,
        biometryTypeName: "none",
        errorCode: -1,
      };
    }

    console.log("🔍 [BIOMETRIC-LIB] Calling NativeBiometric.isAvailable()...");

    // Call the plugin's isAvailable method
    const result = await NativeBiometric.isAvailable();

    console.log("✅ [BIOMETRIC-LIB] Raw result:", JSON.stringify(result));

    // Map biometry type to human-readable names
    // BiometryType values: 0=NONE, 1=TOUCH_ID, 2=FACE_ID, 3=FINGERPRINT, 4=FACE_AUTHENTICATION, 5=IRIS_AUTHENTICATION
    const biometryTypeNames = {
      [BiometryType.NONE]: "none",
      [BiometryType.TOUCH_ID]: "touchid",
      [BiometryType.FACE_ID]: "faceid",
      [BiometryType.FINGERPRINT]: "fingerprint",
      [BiometryType.FACE_AUTHENTICATION]: "face",
      [BiometryType.IRIS_AUTHENTICATION]: "iris",
    };

    const biometryTypeName =
      biometryTypeNames[result.biometryType] || "unknown";

    console.log("✅ [BIOMETRIC-LIB] Biometric available:", result.isAvailable);
    console.log(
      "✅ [BIOMETRIC-LIB] Biometry type:",
      result.biometryType,
      `(${biometryTypeName})`
    );

    // IMPORTANT: On Android, the plugin only returns the PRIMARY biometric type
    // If fingerprint (type 3) is returned, face unlock (type 4) might also be available
    // Android's BiometricPrompt will show all available options when verifyIdentity() is called
    // So we should indicate that face unlock might be available even if fingerprint is primary
    const platform = Capacitor.getPlatform();
    let hasFaceUnlock = false;
    let hasFingerprint = false;

    if (platform === "android") {
      // On Android, if fingerprint is detected, face unlock might also be available
      // The plugin only returns the primary type, but Android supports multiple biometrics
      if (result.biometryType === BiometryType.FINGERPRINT) {
        hasFingerprint = true;
        // Note: Face unlock might be available but not detected as primary
        // Android's BiometricPrompt will show all available options when verifyIdentity() is called
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Fingerprint detected as primary (type 3)."
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: Face unlock (type 4) may also be available but NOT detected as primary."
        );
        console.log("⚠️ [BIOMETRIC-LIB] Android: HOW PRIMARY IS DETERMINED:");
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: The plugin checks biometric features in HARDCODED ORDER:"
        );
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: 1. Fingerprint FIRST (if found, sets as primary)"
        );
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: 2. Face auth SECOND (only primary if fingerprint not found)"
        );
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: 3. Iris auth THIRD (only primary if neither found)"
        );
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: This is NOT set by Android settings or user preferences!"
        );
        console.log(
          "⚠️ [BIOMETRIC-LIB] Android: It's a PLUGIN LIMITATION - hardcoded order in plugin code."
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: When verifyIdentity() is called, Android's BiometricPrompt will show ALL available biometrics."
        );
        console.log(
          "ℹ️ [BIOMETRIC-LIB] Android: So you can still USE face unlock even if it's not detected as primary."
        );
      } else if (result.biometryType === BiometryType.FACE_AUTHENTICATION) {
        hasFaceUnlock = true;
        console.log(
          "✅ [BIOMETRIC-LIB] Android: Face unlock detected as primary (type 4)."
        );
      }
    } else if (platform === "ios") {
      if (result.biometryType === BiometryType.FACE_ID) {
        hasFaceUnlock = true;
        console.log("✅ [BIOMETRIC-LIB] iOS: Face ID detected (type 2).");
      } else if (result.biometryType === BiometryType.TOUCH_ID) {
        hasFingerprint = true;
        console.log("✅ [BIOMETRIC-LIB] iOS: Touch ID detected (type 1).");
      }
    }

    return {
      isAvailable: result.isAvailable || false,
      biometryType: result.biometryType,
      biometryTypeName,
      errorCode: result.errorCode,
      // Additional info for Android
      hasFaceUnlock:
        platform === "android" && hasFingerprint ? "maybe" : hasFaceUnlock,
      hasFingerprint,
      platform,
    };
  } catch (error) {
    console.error(
      "❌ [BIOMETRIC-LIB] Error checking biometric availability:",
      error
    );
    return {
      isAvailable: false,
      biometryType: BiometryType.NONE,
      biometryTypeName: "none",
      errorCode: error.code || -1,
      errorMessage: error.message,
    };
  }
}

/**
 * Verify identity using biometric authentication
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @param {Object} options - Authentication options
 * @param {string} options.reason - Reason for authentication
 * @param {string} options.title - Title for prompt
 * @param {string} options.subtitle - Subtitle for prompt
 * @param {string} options.description - Description for prompt
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function verifyBiometricIdentity(options = {}) {
  console.log("🔐 [BIOMETRIC-LIB] verifyBiometricIdentity() called");
  console.log("🔐 [BIOMETRIC-LIB] Options:", JSON.stringify(options));

  try {
    // Check if biometric is available first
    const availability = await checkBiometricAvailability();

    if (!availability.isAvailable) {
      console.log("❌ [BIOMETRIC-LIB] Biometric not available");
      return {
        success: false,
        error: "Biometric authentication not available on this device",
      };
    }

    const {
      reason = "For easy log in",
      title = "Log in",
      subtitle = "Authenticate to continue",
      description = "Use your biometric to verify your identity",
    } = options;

    console.log("🔐 [BIOMETRIC-LIB] Calling verifyIdentity...");
    console.log("🔐 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());

    if (Capacitor.getPlatform() === "android") {
      console.log("ℹ️ [BIOMETRIC-LIB] Android: BiometricPrompt is being shown");
      console.log(
        "⚠️ [BIOMETRIC-LIB] Android: PLUGIN LIMITATION - The plugin may only show the PRIMARY biometric type"
      );
      console.log(
        "⚠️ [BIOMETRIC-LIB] Android: Even if face unlock is enrolled, it may not appear in the prompt"
      );
      console.log(
        "ℹ️ [BIOMETRIC-LIB] Android: This is because the plugin doesn't configure setAllowedAuthenticators()"
      );
      console.log(
        "ℹ️ [BIOMETRIC-LIB] Android: The plugin only uses the primary biometric type (fingerprint in this case)"
      );
      console.log(
        "💡 [BIOMETRIC-LIB] Android: To show all biometric types, the plugin would need to be updated"
      );
    }

    // Call verifyIdentity - it resolves on success, rejects on failure
    // NOTE: On Android, the plugin may only show the PRIMARY biometric type (fingerprint)
    // Even if face unlock is enrolled, it may not appear in the BiometricPrompt
    // This is a limitation of the plugin - it doesn't configure setAllowedAuthenticators()
    await NativeBiometric.verifyIdentity({
      reason,
      title,
      subtitle,
      description,
    });

    console.log("✅ [BIOMETRIC-LIB] Biometric verification successful!");
    console.log(
      "✅ [BIOMETRIC-LIB] User authenticated using biometric (fingerprint or face unlock)"
    );

    return {
      success: true,
      biometryType: availability.biometryType,
      biometryTypeName: availability.biometryTypeName,
    };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Biometric verification failed:", error);
    return {
      success: false,
      error: error.message || "Biometric authentication failed",
      errorCode: error.code,
    };
  }
}

/**
 * Store user credentials securely using native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @param {Object} credentials - User credentials
 * @param {string} credentials.username - Username (email or phone)
 * @param {string} credentials.password - Password (or auth token)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function setCredentials(credentials) {
  console.log("💾 [BIOMETRIC-LIB] setCredentials() called");
  console.log("💾 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
  console.log("💾 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());
  console.log("💾 [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);
  console.log("💾 [BIOMETRIC-LIB] Username:", credentials.username);
  console.log(
    "💾 [BIOMETRIC-LIB] Password length:",
    credentials.password?.length || 0
  );

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback"
      );
      // Fallback to localStorage for web
      localStorage.setItem("biometric_username", credentials.username);
      localStorage.setItem("biometric_password", credentials.password);
      return { success: true };
    }

    const { username, password } = credentials;

    if (!username || !password) {
      console.error("❌ [BIOMETRIC-LIB] Missing username or password");
      return {
        success: false,
        error: "Username and password are required",
      };
    }

    console.log(
      "💾 [BIOMETRIC-LIB] Saving credentials to native secure storage..."
    );
    console.log(
      "💾 [BIOMETRIC-LIB] Calling NativeBiometric.setCredentials()..."
    );

    // Save credentials using the native biometric plugin
    await NativeBiometric.setCredentials({
      username,
      password,
      server: CREDENTIAL_SERVER,
    });

    console.log(
      "✅ [BIOMETRIC-LIB] NativeBiometric.setCredentials() completed"
    );
    console.log("✅ [BIOMETRIC-LIB] Credentials saved successfully");
    console.log("✅ [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);
    console.log("✅ [BIOMETRIC-LIB] Username saved:", username);
    console.log("✅ [BIOMETRIC-LIB] Password length saved:", password.length);

    // Note: We don't verify credentials here because getCredentials() requires
    // biometric authentication, which would prompt the user unnecessarily during save.
    // Credentials will be verified when the user attempts to use biometric login.

    return { success: true };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Failed to save credentials:", error);
    console.error("❌ [BIOMETRIC-LIB] Error message:", error.message);
    console.error("❌ [BIOMETRIC-LIB] Error code:", error.code);
    console.error(
      "❌ [BIOMETRIC-LIB] Full error:",
      JSON.stringify(error, null, 2)
    );
    return {
      success: false,
      error: error.message || "Failed to save credentials",
      errorCode: error.code,
    };
  }
}

/**
 * Retrieve stored credentials from native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{success: boolean, username?: string, password?: string, error?: string}>}
 */
export async function getCredentials() {
  console.log("🔑 [BIOMETRIC-LIB] getCredentials() called");
  console.log("🔑 [BIOMETRIC-LIB] Platform:", Capacitor.getPlatform());
  console.log("🔑 [BIOMETRIC-LIB] Is native:", Capacitor.isNativePlatform());
  console.log("🔑 [BIOMETRIC-LIB] Server:", CREDENTIAL_SERVER);

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback"
      );
      // Fallback to localStorage for web
      const username = localStorage.getItem("biometric_username");
      const password = localStorage.getItem("biometric_password");

      if (!username || !password) {
        console.log("⚠️ [BIOMETRIC-LIB] No credentials found in localStorage");
        return {
          success: false,
          error: "No credentials found",
        };
      }

      console.log("✅ [BIOMETRIC-LIB] Credentials retrieved from localStorage");
      return {
        success: true,
        username,
        password,
      };
    }

    console.log(
      "🔑 [BIOMETRIC-LIB] Retrieving credentials from native secure storage..."
    );
    console.log(
      "🔑 [BIOMETRIC-LIB] Calling NativeBiometric.getCredentials()..."
    );

    // Retrieve credentials using the native biometric plugin
    const credentials = await NativeBiometric.getCredentials({
      server: CREDENTIAL_SERVER,
    });

    console.log(
      "✅ [BIOMETRIC-LIB] NativeBiometric.getCredentials() completed"
    );
    console.log("✅ [BIOMETRIC-LIB] Credentials retrieved successfully");
    console.log("✅ [BIOMETRIC-LIB] Username:", credentials.username);
    console.log(
      "✅ [BIOMETRIC-LIB] Password length:",
      credentials.password?.length || 0
    );

    return {
      success: true,
      username: credentials.username,
      password: credentials.password,
    };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Failed to retrieve credentials:", error);
    console.error("❌ [BIOMETRIC-LIB] Error message:", error.message);
    console.error("❌ [BIOMETRIC-LIB] Error code:", error.code);
    console.error(
      "❌ [BIOMETRIC-LIB] Full error:",
      JSON.stringify(error, null, 2)
    );
    return {
      success: false,
      error: error.message || "No credentials found",
      errorCode: error.code,
    };
  }
}

/**
 * Delete stored credentials from native biometric secure storage
 * Following documentation: https://www.npmjs.com/package/capacitor-native-biometric
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function deleteCredentials() {
  console.log("🗑️ [BIOMETRIC-LIB] deleteCredentials() called");

  try {
    if (!Capacitor.isNativePlatform()) {
      console.log(
        "⚠️ [BIOMETRIC-LIB] Not native platform, using localStorage fallback"
      );
      // Fallback to localStorage for web
      localStorage.removeItem("biometric_username");
      localStorage.removeItem("biometric_password");
      return { success: true };
    }

    console.log(
      "🗑️ [BIOMETRIC-LIB] Deleting credentials from native secure storage..."
    );

    // Delete credentials using the native biometric plugin
    await NativeBiometric.deleteCredentials({
      server: CREDENTIAL_SERVER,
    });

    console.log("✅ [BIOMETRIC-LIB] Credentials deleted successfully");

    return { success: true };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Failed to delete credentials:", error);
    return {
      success: false,
      error: error.message || "Failed to delete credentials",
    };
  }
}

/**
 * Complete biometric authentication flow for login
 * This is a complete implementation following the documentation
 * Flow: Check availability -> Verify identity -> Retrieve credentials
 * @param {Object} options - Authentication options
 * @returns {Promise<{success: boolean, username?: string, password?: string, biometryType?: number, error?: string}>}
 */
export async function authenticateWithBiometric(options = {}) {
  console.log("🔐 [BIOMETRIC-LIB] authenticateWithBiometric() - Complete Flow");

  try {
    // Step 1: Check if biometric is available
    const availability = await checkBiometricAvailability();

    if (!availability.isAvailable) {
      return {
        success: false,
        error: "Biometric authentication not available",
      };
    }

    console.log(
      "✅ [BIOMETRIC-LIB] Biometric type:",
      availability.biometryTypeName
    );

    // Step 2: Verify identity with biometric
    const verification = await verifyBiometricIdentity({
      reason: options.reason || "Login to your Jackson account",
      title: options.title || "Biometric Login",
      subtitle: options.subtitle || "Authenticate to continue",
      description: options.description || "Use your biometric to log in",
    });

    if (!verification.success) {
      return {
        success: false,
        error: verification.error || "Biometric verification failed",
      };
    }

    console.log("✅ [BIOMETRIC-LIB] Biometric verification successful");

    // Step 3: Retrieve stored credentials
    const credentialsResult = await getCredentials();

    if (!credentialsResult.success) {
      return {
        success: false,
        error: "No saved credentials found. Please login manually first.",
      };
    }

    console.log("✅ [BIOMETRIC-LIB] Complete authentication successful");

    return {
      success: true,
      username: credentialsResult.username,
      password: credentialsResult.password,
      biometryType: availability.biometryType,
      biometryTypeName: availability.biometryTypeName,
    };
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Authentication flow failed:", error);
    return {
      success: false,
      error: error.message || "Authentication failed",
    };
  }
}

/**
 * Get device ID for biometric tracking
 * @returns {Promise<string>}
 */
export async function getDeviceId() {
  try {
    const deviceInfo = await Device.getId();
    return deviceInfo.identifier || "unknown";
  } catch (error) {
    console.error("❌ [BIOMETRIC-LIB] Error getting device ID:", error);
    return "unknown";
  }
}

/**
 * Check if user has biometric credentials stored
 * @returns {Promise<boolean>}
 */
export async function hasBiometricCredentials() {
  try {
    const result = await getCredentials();
    return result.success;
  } catch (error) {
    return false;
  }
}

/**
 * Check if user has biometric enabled locally
 * @returns {boolean}
 */
export function isBiometricEnabledLocally() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("biometricEnabled") === "true";
}

/**
 * Get stored biometric type
 * @returns {string|null} - "faceid", "touchid", "fingerprint", "face", "iris" or null
 */
export function getBiometricType() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("biometricType");
}

/**
 * Enable biometric locally after successful setup
 * @param {string} type - Biometry type name
 */
export function enableBiometricLocally(type) {
  if (typeof window === "undefined") return;
  localStorage.setItem("biometricEnabled", "true");
  localStorage.setItem("biometricType", type);
  localStorage.setItem("faceVerificationCompleted", "true");
  console.log("✅ [BIOMETRIC-LIB] Biometric enabled locally:", type);
}

/**
 * Disable biometric locally and clear credentials
 * @returns {Promise<{success: boolean}>}
 */
export async function disableBiometricLocally() {
  if (typeof window === "undefined") return { success: false };

  // Clear local storage flags
  localStorage.removeItem("biometricEnabled");
  localStorage.removeItem("biometricType");
  localStorage.removeItem("faceVerificationCompleted");

  // Delete stored credentials
  const result = await deleteCredentials();

  console.log("✅ [BIOMETRIC-LIB] Biometric disabled locally");
  return result;
}
