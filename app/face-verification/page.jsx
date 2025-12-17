"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
import { registerFace, toggleBiometric } from "@/lib/api";
import { NativeBiometric } from "capacitor-native-biometric";
import { Camera } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";

// Import the new Native BiometricPrompt plugin (uses androidx.biometric.BiometricPrompt)
import {
    checkNativeBiometric,
    verifyWithNativeBiometric,
    getBiometricErrorMessage,
    canRetryBiometric,
} from "@/lib/nativeBiometricPrompt";

export default function FaceVerificationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingStep, setLoadingStep] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const router = useRouter();
    const { user, token } = useAuth();
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState("");
    const [biometricTypeName, setBiometricTypeName] = useState("none");
    const [useCamera, setUseCamera] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(null);
    const [securityLevel, setSecurityLevel] = useState(null);
    const [hardwareTEE, setHardwareTEE] = useState(false);

    // Get display name for biometric type
    const getBiometricDisplayName = () => {
        // biometricType: 0=None, 1=TouchID, 2=FaceID, 3=Fingerprint, 4=Face (Android), 5=Iris
        if (biometricType === 2) return "Face ID";
        if (biometricType === 3) return "Fingerprint";
        if (biometricType === 4) return "Face Unlock";
        if (biometricType === 5) return "Iris";
        if (biometricType === 1) return "Touch ID";
        return "Biometric"; // Default fallback
    };

    // Check biometric availability on mount
    useEffect(() => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║  🚀 [FACE-VERIFICATION] Component Mounted                  ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("📱 [FACE-VERIFICATION] Platform Info:");
        console.log("   • Platform:", Capacitor.getPlatform());
        console.log("   • Is Native:", Capacitor.isNativePlatform());
        console.log("   • Available Plugins:", Object.keys(Capacitor.Plugins));
        
        checkBiometricAvailability();
    }, []);

    const checkCameraPermission = async () => {
        console.log("📷 [CAMERA] Checking camera permission...");
        try {
            if (!Capacitor.isNativePlatform()) {
                console.log("⚠️ [CAMERA] Not on native platform, skipping");
                return;
            }

            const permission = await Camera.checkPermissions();
            console.log("📷 [CAMERA] Permission status:", JSON.stringify(permission));
            setCameraPermission(permission.camera);
        } catch (err) {
            console.error("❌ [CAMERA] Error checking camera permission:", err);
        }
    };

    /**
     * Check biometric availability using the native BiometricPrompt plugin
     * This uses androidx.biometric.BiometricPrompt with BIOMETRIC_STRONG
     * which ensures hardware trust zone (TEE) security
     */
    const checkBiometricAvailability = async () => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║  🔍 [CHECK-AVAILABILITY] Starting Biometric Check          ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        
        try {
            if (!Capacitor.isNativePlatform()) {
                console.log("⚠️ [CHECK-AVAILABILITY] Not on native platform");
                console.log("   • Web browsers don't support native biometrics");
                setBiometricAvailable(false);
                return;
            }

            const platform = Capacitor.getPlatform();
            console.log("📱 [CHECK-AVAILABILITY] Platform:", platform);

            // Use the native BiometricPrompt plugin for Android
            if (platform === "android") {
                console.log("🔐 [CHECK-AVAILABILITY] Using Native BiometricPrompt (androidx.biometric)");
                console.log("   • Security Level: BIOMETRIC_STRONG (Class 3)");
                console.log("   • Hardware Trust Zone: TEE");
                
                const result = await checkNativeBiometric();
                
                console.log("📊 [CHECK-AVAILABILITY] Native BiometricPrompt Result:");
                console.log("   • Is Available:", result.isAvailable);
                console.log("   • Biometry Type:", result.biometryType, `(${result.biometryTypeName})`);
                console.log("   • Security Level:", result.securityLevel);
                console.log("   • Security Class:", result.securityClass);
                console.log("   • Hardware TEE:", result.hardwareTEE);
                console.log("   • Error Code:", result.errorCode);
                console.log("   • Message:", result.message);
                
                if (result.androidVersion) {
                    console.log("📱 [CHECK-AVAILABILITY] Device Info:");
                    console.log("   • Android:", result.androidVersion, `(${result.androidRelease})`);
                    console.log("   • Device:", result.manufacturer, result.deviceModel);
                    console.log("   • Security Patch:", result.securityPatch);
                }
                
                setBiometricAvailable(result.isAvailable);
                setBiometricType(result.biometryType);
                setBiometricTypeName(result.biometryTypeName);
                setSecurityLevel(result.securityLevel);
                setHardwareTEE(result.hardwareTEE || false);
                
                // Check if user can enroll biometrics
                if (result.canEnroll) {
                    console.log("💡 [CHECK-AVAILABILITY] User can enroll biometrics in Settings");
                }
                
                // Don't use camera fallback for Android native biometrics
                setUseCamera(false);
                
            } else {
                // For iOS, use the existing capacitor-native-biometric plugin
                console.log("🍎 [CHECK-AVAILABILITY] Using capacitor-native-biometric for iOS");
                
                const result = await NativeBiometric.isAvailable();
                console.log("✅ [CHECK-AVAILABILITY] iOS Result:", JSON.stringify(result));
                
                const biometryType = result.biometryType || 0;
                const hasFaceID = biometryType === 2;
                const hasTouchID = biometryType === 1;
                
                console.log("   • Has Face ID:", hasFaceID);
                console.log("   • Has Touch ID:", hasTouchID);
                
                setBiometricAvailable(result.isAvailable);
                setBiometricType(biometryType);
                setBiometricTypeName(hasFaceID ? "face" : hasTouchID ? "touchid" : "none");
                setUseCamera(false);
            }
            
        } catch (err) {
            console.error("╔════════════════════════════════════════════════════════════╗");
            console.error("║  ❌ [CHECK-AVAILABILITY] Error                             ║");
            console.error("╚════════════════════════════════════════════════════════════╝");
            console.error("   • Error:", err);
            console.error("   • Message:", err?.message);
            console.error("   • Stack:", err?.stack);
            
            setBiometricAvailable(false);
            setUseCamera(false);
        }
    };

    const captureFaceWithCamera = async () => {
        console.log("📷 [CAMERA] Starting camera-based face detection...");

        try {
            // Request camera permission if not granted
            if (cameraPermission !== "granted") {
                console.log("📷 [CAMERA] Requesting camera permission...");
                const permission = await Camera.requestPermissions({ permissions: ["camera"] });
                console.log("📷 [CAMERA] Permission result:", JSON.stringify(permission));

                if (permission.camera !== "granted") {
                    throw new Error("Camera permission denied. Please enable camera access in app settings.");
                }
                setCameraPermission(permission.camera);
            }

            setLoadingStep("Opening camera...");
            console.log("📷 [CAMERA] Opening camera...");

            // Capture photo using camera with lower quality and size to reduce file size
            const photo = await Camera.getPhoto({
                quality: 10,
                allowEditing: false,
                resultType: "base64",
                source: "CAMERA",
                width: 640,
                height: 480,
                promptLabelHeader: "Face Verification",
                promptLabelPhoto: "Take Photo",
                promptLabelPicture: "Use Camera",
            });

            console.log("📷 [CAMERA] Photo captured successfully");
            console.log("📷 [CAMERA] Photo format:", photo.format);
            console.log("📷 [CAMERA] Photo base64 length:", photo.base64String?.length || 0);

            setLoadingStep("Processing face data...");

            const rawPhotoData = photo.base64String;
            let photoData = rawPhotoData;
            const maxSize = 50000;

            if (photoData && photoData.length > maxSize) {
                console.log("📷 [CAMERA] Photo too large, not sending to backend");
                photoData = null;
            }

            // Persist photo on device storage
            if (Capacitor.isNativePlatform() && rawPhotoData) {
                try {
                    const folder = "face-verification";
                    try {
                        await Filesystem.mkdir({
                            path: folder,
                            directory: Directory.Data,
                            recursive: true,
                        });
                    } catch (mkdirErr) {
                        const message = `${mkdirErr?.message || mkdirErr}`;
                        if (!message.includes("already exists") && !message.includes("EXISTS")) {
                            throw mkdirErr;
                        }
                    }

                    const fileName = `face-${Date.now()}.${photo.format || "jpeg"}`;
                    const filePath = `${folder}/${fileName}`;
                    await Filesystem.writeFile({
                        path: filePath,
                        data: rawPhotoData,
                        directory: Directory.Data,
                    });

                    console.log("📷 [CAMERA] Photo saved to device storage:", filePath);

                    if (typeof window !== "undefined") {
                        localStorage.setItem("cameraFacePhotoPath", filePath);
                    }
                } catch (fsErr) {
                    console.error("❌ [CAMERA] Failed to persist face photo:", fsErr);
                }
            }

            if (photoData && typeof window !== "undefined") {
                localStorage.setItem("cameraFacePhoto", photoData);
            } else if (typeof window !== "undefined") {
                localStorage.removeItem("cameraFacePhoto");
            }

            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                photoData: photoData,
                format: photo.format,
            };
        } catch (err) {
            console.error("❌ [CAMERA] Camera error:", err);
            throw err;
        }
    };

    /**
     * Handle Continue button click
     * Uses native BiometricPrompt with BIOMETRIC_STRONG for secure authentication
     */
    const handleContinue = async () => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║  🚀 [CONTINUE] Button Clicked - Starting Verification      ║");
        console.log("╚════════════════════════════════════════════════════════════╝");
        console.log("👤 [CONTINUE] User:", user?.email || user?.mobile);
        console.log("🔑 [CONTINUE] Token exists:", !!token);

        if (!user || !token) {
            console.log("❌ [CONTINUE] No user or token found");
            setError("Authentication session not found. Please log in again.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsScanning(true);
        setLoadingStep("Initializing biometric verification...");

        // Call toggle biometric API
        console.log("🔐 [CONTINUE] Calling toggle biometric API...");
        try {
            const toggleResult = await toggleBiometric(token);
            console.log("🔐 [CONTINUE] Toggle biometric API response:", JSON.stringify(toggleResult));
            
            if (toggleResult.success && toggleResult.data) {
                console.log("✅ [CONTINUE] Biometric enabled:", toggleResult.data.biometric?.enabled);
            } else {
                console.log("⚠️ [CONTINUE] Toggle biometric API error:", toggleResult.error);
            }
        } catch (toggleErr) {
            console.error("❌ [CONTINUE] Toggle biometric API error:", toggleErr);
        }

        // Call setup API
        console.log("🔐 [CONTINUE] Calling biometric setup API...");
        try {
            const setupData = {
                mobile: user?.mobile || "+1234567890",
                type: "face_id",
                verificationData: {
                    livenessScore: 0.95,
                    faceMatchScore: 0.85
                },
                deviceId: "device-12345",
                scanType: "os_face_id"
            };
            
            const setupResult = await registerFace(setupData, token);
            console.log("🔐 [CONTINUE] Setup API response:", JSON.stringify(setupResult));
        } catch (setupErr) {
            console.error("❌ [CONTINUE] Setup API error:", setupErr);
        }

        // Check platform
        console.log("📱 [CONTINUE] Platform:", Capacitor.getPlatform());
        console.log("📱 [CONTINUE] Is Native:", Capacitor.isNativePlatform());

        if (!Capacitor.isNativePlatform()) {
            console.log("❌ [CONTINUE] Not on native platform");
            setError("Biometric verification is only available on mobile devices. Please use the mobile app.");
            setIsLoading(false);
            setIsScanning(false);
            return;
        }

        const platform = Capacitor.getPlatform();
        setLoadingStep("Preparing biometric verification...");

        try {
            // Use Native BiometricPrompt for Android (with BIOMETRIC_STRONG / TEE)
            if (platform === "android") {
                console.log("╔════════════════════════════════════════════════════════════╗");
                console.log("║  🔐 [CONTINUE] Using Native BiometricPrompt (Android)      ║");
                console.log("╚════════════════════════════════════════════════════════════╝");
                console.log("   • API: androidx.biometric.BiometricPrompt");
                console.log("   • Security: BIOMETRIC_STRONG (Class 3)");
                console.log("   • Hardware: Trust Zone (TEE)");
                
                // First check availability
                console.log("🔍 [CONTINUE] Checking biometric availability...");
                const availability = await checkNativeBiometric();
                
                console.log("📊 [CONTINUE] Availability Result:");
                console.log("   • Is Available:", availability.isAvailable);
                console.log("   • Biometry Type:", availability.biometryType, `(${availability.biometryTypeName})`);
                console.log("   • Security Level:", availability.securityLevel);
                console.log("   • Hardware TEE:", availability.hardwareTEE);
                
                if (!availability.isAvailable) {
                    console.log("❌ [CONTINUE] Biometric not available");
                    
                    let errorMsg = availability.message || "Biometric authentication is not available.";
                    
                    if (availability.canEnroll) {
                        errorMsg += "\n\nPlease set up biometric authentication in your device settings:\nSettings → Security → Biometrics";
                    }
                    
                    errorMsg += "\n\nYou can skip this step for now.";
                    
                    setError(errorMsg);
                    setIsLoading(false);
                    setIsScanning(false);
                    return;
                }
                
                // Show biometric prompt
                setLoadingStep("Authenticating with biometric...");
                console.log("🔐 [CONTINUE] Showing BiometricPrompt dialog...");
                console.log("═══════════════════════════════════════════════════════════════");
                console.log("   📱 BiometricPrompt should appear on device now...");
                console.log("   ⏳ Waiting for user to authenticate...");
                
                const verifyResult = await verifyWithNativeBiometric({
                    title: "Face Verification",
                    subtitle: "Verify your identity to secure your account",
                    description: "Move your head slowly from left to right",
                    negativeButtonText: "Cancel"
                });
                
                console.log("═══════════════════════════════════════════════════════════════");
                console.log("📊 [CONTINUE] Verification Result:");
                console.log("   • Success:", verifyResult.success);
                console.log("   • Auth Type:", verifyResult.authType);
                console.log("   • Security Level:", verifyResult.securityLevel);
                console.log("   • Hardware TEE:", verifyResult.hardwareTEE);
                
                if (!verifyResult.success) {
                    console.log("❌ [CONTINUE] Verification failed");
                    console.log("   • Error Code:", verifyResult.errorCode);
                    console.log("   • Error Type:", verifyResult.errorType);
                    console.log("   • Error Message:", verifyResult.errorMessage);
                    console.log("   • Is User Canceled:", verifyResult.isUserCanceled);
                    console.log("   • Is Lockout:", verifyResult.isLockout);
                    
                    const errorMessage = getBiometricErrorMessage(verifyResult);
                    setError(errorMessage);
                    setIsLoading(false);
                    setIsScanning(false);
                    return;
                }
                
                console.log("✅ [CONTINUE] Native BiometricPrompt authentication successful!");
                console.log("   • Verified with hardware trust zone (TEE)");
                console.log("   • Security Class 3 (BIOMETRIC_STRONG)");
                
            } else {
                // iOS - use existing capacitor-native-biometric
                console.log("🍎 [CONTINUE] Using capacitor-native-biometric for iOS");
                
                const availability = await NativeBiometric.isAvailable();
                console.log("✅ [CONTINUE] iOS Availability:", JSON.stringify(availability));
                
                if (!availability.isAvailable) {
                    setError("Biometric authentication is not available. Please try again or skip this step.");
                    setIsLoading(false);
                    setIsScanning(false);
                    return;
                }
                
                setLoadingStep("Starting face scan...");
                console.log("🔐 [CONTINUE] Calling NativeBiometric.verifyIdentity()...");
                
                await NativeBiometric.verifyIdentity({
                    reason: "Complete verification to secure your account",
                    title: "Face Verification",
                    subtitle: "Verify your identity",
                    description: "Look at your device to verify",
                });
                
                console.log("✅ [CONTINUE] iOS Biometric authentication successful!");
            }

            // Common success flow for both platforms
            setLoadingStep("Verifying biometric data...");
            console.log("📱 [CONTINUE] Getting device ID...");

            const { Device } = await import("@capacitor/device");
            const deviceInfo = await Device.getId();
            const deviceId = deviceInfo.identifier || "unknown";
            console.log("📱 [CONTINUE] Device ID:", deviceId);

            // Register with backend
            setLoadingStep("Registering biometric profile...");
            console.log("🌐 [CONTINUE] Registering with backend...");

            const biometricTypeString = biometricTypeName === "face" ? "face_id" : 
                                       biometricTypeName === "fingerprint" ? "fingerprint" : 
                                       biometricTypeName === "touchid" ? "touchid" : "biometric";

            const registrationData = {
                mobile: user.mobile,
                type: biometricTypeString,
                deviceId: deviceId,
                verificationData: {
                    livenessScore: 1.0,
                    faceMatchScore: 1.0,
                    securityLevel: securityLevel || "BIOMETRIC_STRONG",
                    hardwareTEE: hardwareTEE,
                },
            };

            console.log("🌐 [CONTINUE] Registration data:", JSON.stringify(registrationData));

            const result = await registerFace(registrationData, token);
            console.log("🌐 [CONTINUE] Backend response:", JSON.stringify(result));

            if (result.error) {
                console.log("❌ [CONTINUE] Backend error:", result.error);
                throw new Error(result.error);
            }

            // Mark verification as completed
            console.log("✅ [CONTINUE] Marking verification as completed");
            localStorage.setItem("faceVerificationCompleted", "true");
            localStorage.setItem("biometricType", biometricTypeString);
            localStorage.setItem("biometricSecurityLevel", securityLevel || "BIOMETRIC_STRONG");
            localStorage.setItem("biometricHardwareTEE", String(hardwareTEE));
            
            if (token) {
                localStorage.setItem("biometricToken", token);
                if (user) {
                    localStorage.setItem("biometricUser", JSON.stringify(user));
                }
            }

            // Save biometric credentials
            if (token && user && Capacitor.isNativePlatform()) {
                try {
                    console.log("💾 [CONTINUE] Saving biometric credentials...");
                    const { setCredentials, enableBiometricLocally } = await import("@/lib/biometricAuth");

                    const credentialPayload = {
                        token: token,
                        user: user,
                    };

                    console.log("💾 [CONTINUE] Username:", user.email || user.mobile);
                    console.log("💾 [CONTINUE] Token length:", token?.length || 0);

                    const credentialResult = await setCredentials({
                        username: user.email || user.mobile,
                        password: JSON.stringify(credentialPayload),
                    });

                    if (credentialResult.success) {
                        enableBiometricLocally(biometricTypeString);
                        console.log("✅ [CONTINUE] Biometric credentials saved successfully!");
                    } else {
                        console.warn("⚠️ [CONTINUE] Failed to save credentials:", credentialResult.error);
                    }
                } catch (biometricError) {
                    console.error("❌ [CONTINUE] Error saving biometric credentials:", biometricError);
                }
            }

            setLoadingStep("Verification successful!");
            console.log("╔════════════════════════════════════════════════════════════╗");
            console.log("║  🎉 [CONTINUE] Face Verification Complete!                 ║");
            console.log("╚════════════════════════════════════════════════════════════╝");
            console.log("   • Security Level:", securityLevel || "BIOMETRIC_STRONG");
            console.log("   • Hardware TEE:", hardwareTEE);
            console.log("   • Navigating to homepage...");

            setTimeout(() => {
                router.push("/homepage");
            }, 1000);
            
        } catch (err) {
            console.error("╔════════════════════════════════════════════════════════════╗");
            console.error("║  ❌ [CONTINUE] Verification Error                          ║");
            console.error("╚════════════════════════════════════════════════════════════╝");
            console.error("   • Error:", err);
            console.error("   • Message:", err?.message);
            console.error("   • Stack:", err?.stack);

            let errorMessage = "Biometric verification failed. Please try again.";

            if (err.message) {
                errorMessage = err.message;
            }

            const biometricName = getBiometricDisplayName();
            if (errorMessage.includes("cancelled") || errorMessage.includes("Cancel")) {
                errorMessage = `${biometricName} verification was cancelled. You can try again or skip for now.`;
            } else if (errorMessage.includes("not available")) {
                errorMessage = `${biometricName} is not available on this device. You can skip this step.`;
            } else if (errorMessage.includes("not enrolled")) {
                errorMessage = `${biometricName} is not set up. Please set it up in device settings first.`;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsScanning(false);
        }
    };

    const handleSkip = async () => {
        console.log("╔════════════════════════════════════════════════════════════╗");
        console.log("║  ⏭️ [SKIP] User Chose to Skip Face Verification            ║");
        console.log("╚════════════════════════════════════════════════════════════╝");

        localStorage.setItem("faceVerificationSkipped", "true");

        // Try to save biometric credentials even when skipping
        if (token && user && Capacitor.isNativePlatform()) {
            try {
                console.log("💾 [SKIP] Checking if we can save biometric credentials...");
                const { setCredentials, enableBiometricLocally, checkBiometricAvailability } = await import("@/lib/biometricAuth");

                const availability = await checkBiometricAvailability();

                if (availability.isAvailable) {
                    console.log("💾 [SKIP] Biometric available, saving credentials...");

                    const credentialPayload = {
                        token: token,
                        user: user,
                    };

                    const credentialResult = await setCredentials({
                        username: user.email || user.mobile,
                        password: JSON.stringify(credentialPayload),
                    });

                    if (credentialResult.success) {
                        enableBiometricLocally(availability.biometryTypeName);
                        console.log("✅ [SKIP] Biometric credentials saved!");
                    }
                } else {
                    console.log("⚠️ [SKIP] No biometric available on device");
                }
            } catch (biometricError) {
                console.error("❌ [SKIP] Error saving biometric credentials:", biometricError);
            }
        }

        router.push("/homepage");
    };

    const handleGoBack = () => {
        router.back();
    };

    const biometricDisplayName = getBiometricDisplayName();

    return (
        <div className="relative w-screen h-screen bg-[#272052] overflow-hidden">
            <div className="relative w-full max-w-[375px] h-full mx-auto flex flex-col">
                {/* Background blur effect */}
                <div className="absolute w-[300px] h-[300px] top-20 left-1/2 transform -translate-x-1/2 bg-[#af7de6] rounded-full blur-[200px] opacity-60" />

                {/* App Version */}
                <div className="absolute top-[1px] left-3 w-full h-[40px] z-10">
                    <div className="absolute top-[10px] left-3 [font-family:'Poppins',Helvetica] font-light text-[#A4A4A4] text-[10px] tracking-[0] leading-3 whitespace-nowrap">
                        App Version: {process.env.NEXT_PUBLIC_APP_VERSION || "V0.0.1"}
                    </div>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between w-full px-5 pt-12 pb-4 z-10">
                    <button
                        className="w-6 h-6 cursor-pointer"
                        aria-label="Go back"
                        onClick={handleGoBack}
                    >
                        <img
                            className="w-full h-full"
                            alt=""
                            src="https://c.animaapp.com/gGYGC01x/img/arrow-back-ios-new@2x.png"
                        />
                    </button>

                    <h1 className="text-[#FFFFFF] [font-family:'Poppins',Helvetica] mr-20 font-semibold text-xl text-center">
                        {useCamera ? "Face ID Setup" : biometricDisplayName}
                    </h1>

                    <div className="w-6 h-6"></div>
                </div>

                {/* Main content - centered */}
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="flex flex-col items-center text-center max-w-sm">
                        {/* Face scan frame visual cue */}
                        <div className="w-64 h-64 mb-6 flex items-center justify-center relative">
                            <div className="w-full h-full rounded-full border-4 border-[#af7de6] border-dashed flex items-center justify-center">
                                {isScanning ? (
                                    <div className="w-32 h-32 rounded-full bg-[#af7de6] opacity-20 animate-pulse"></div>
                                ) : (
                                    <div className="w-32 h-32 rounded-full border-2 border-[#af7de6] flex items-center justify-center">
                                        <svg
                                            className="w-20 h-20 text-[#af7de6]"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Instruction text */}
                        <p className="text-[#F4F3FC] [font-family:'Poppins',Helvetica] font-normal text-lg leading-relaxed mb-4">
                            {isScanning
                                ? useCamera
                                    ? "Capturing your face... Please look at the camera"
                                    : biometricType === 4 || biometricType === 2
                                        ? "Scanning your face... Keep your head still"
                                        : "Authenticating... Please wait"
                                : useCamera
                                    ? "Tap Continue to set up Face ID using your camera"
                                    : biometricType === 4 || biometricType === 2
                                        ? "Move your head slowly from left to right to complete the process"
                                        : "Place your finger on the sensor to complete the process"}
                        </p>

                        {/* Security Level Badge */}
                        {biometricAvailable && securityLevel && (
                            <div className="flex items-center gap-2 mb-4">
                                <div className="bg-green-900/30 border border-green-500/50 rounded-full px-3 py-1 flex items-center gap-1">
                                    <span className="text-green-400 text-xs">🔒</span>
                                    <span className="text-green-300 text-xs font-medium">{securityLevel}</span>
                                </div>
                                {hardwareTEE && (
                                    <div className="bg-blue-900/30 border border-blue-500/50 rounded-full px-3 py-1">
                                        <span className="text-blue-300 text-xs font-medium">Hardware TEE</span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Progress Indicator */}
                        {isLoading && (
                            <div className="w-full max-w-sm mx-auto mb-4">
                                <div className="bg-gray-800/50 rounded-lg p-3">
                                    <div className="flex items-center justify-center mb-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        <span className="text-white text-sm font-medium">
                                            {loadingStep || "Processing..."}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Biometric availability warning */}
                        {!biometricAvailable && !isLoading && Capacitor.isNativePlatform() && (
                            <div className="w-full max-w-sm mx-auto mb-4">
                                <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3">
                                    <p className="text-yellow-300 text-xs text-center">
                                        {biometricDisplayName} may not be available on this device. You can still proceed or skip this step.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Web platform warning */}
                        {!Capacitor.isNativePlatform() && (
                            <div className="w-full max-w-sm mx-auto mb-4">
                                <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                                    <p className="text-blue-300 text-xs text-center">
                                        {biometricDisplayName} is only available on mobile devices. Please use the mobile app for biometric verification.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="w-full px-6 mb-4">
                        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 max-w-sm mx-auto">
                            <h3 className="text-red-400 font-semibold text-sm mb-2">Verification Error</h3>
                            <div className="text-red-300 text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                                {error}
                            </div>
                            <button
                                onClick={() => setError(null)}
                                className="mt-2 text-red-400 text-xs underline"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                )}

                {/* Bottom buttons */}
                <div className="w-full px-6 pb-8">
                    <div className="w-full max-w-sm mx-auto">
                        <button
                            className="w-full h-12 rounded-xl bg-[linear-gradient(180deg,rgba(158,173,247,1)_0%,rgba(113,106,231,1)_100%)] cursor-pointer transition-opacity duration-200 hover:opacity-90 active:opacity-80 disabled:opacity-50 flex items-center justify-center mb-4"
                            onClick={handleContinue}
                            disabled={isLoading || isScanning}
                        >
                            <span className="[font-family:'Poppins',Helvetica] font-semibold text-white text-base">
                                {isLoading
                                    ? loadingStep || "Processing..."
                                    : isScanning
                                        ? "Scanning..."
                                        : "Continue"}
                            </span>
                        </button>

                        <button
                            onClick={handleSkip}
                            disabled={isLoading || isScanning}
                            className="w-full py-3 [font-family:'Poppins',Helvetica] font-medium text-[#FFFFFF] text-sm text-center hover:text-white transition-colors duration-200 disabled:opacity-50"
                        >
                            Skip for now
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
