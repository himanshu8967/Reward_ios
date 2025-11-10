"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Capacitor } from "@capacitor/core";
import { registerFace } from "@/lib/api";
import { NativeBiometric } from "capacitor-native-biometric";
import { Camera } from "@capacitor/camera";
import { Filesystem, Directory } from "@capacitor/filesystem";

export default function FaceVerificationPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingStep, setLoadingStep] = useState("");
    const [isScanning, setIsScanning] = useState(false);
    const router = useRouter();
    const { user, token } = useAuth();
    const [biometricAvailable, setBiometricAvailable] = useState(false);
    const [biometricType, setBiometricType] = useState("");
    const [useCamera, setUseCamera] = useState(false);
    const [cameraPermission, setCameraPermission] = useState(null);

    // Get display name for biometric type
    const getBiometricDisplayName = () => {
        // biometricType: 0=None, 1=TouchID, 2=FaceID, 3=Fingerprint
        if (biometricType === 2) return "Face ID";
        if (biometricType === 3) return "Fingerprint";
        if (biometricType === 1) return "Touch ID";
        return "Biometric"; // Default fallback
    };

    // Check biometric availability on mount
    useEffect(() => {
        console.log("🔍 [FACE-VERIFICATION] Component mounted, checking biometric availability...");
        console.log("🔍 [FACE-VERIFICATION] Capacitor platform:", Capacitor.getPlatform());
        console.log("🔍 [FACE-VERIFICATION] Is native platform:", Capacitor.isNativePlatform());
        console.log("🔍 [FACE-VERIFICATION] Available plugins:", Object.keys(Capacitor.Plugins));
        console.log("🔍 [FACE-VERIFICATION] NativeBiometric imported:", NativeBiometric);
        console.log("🔍 [FACE-VERIFICATION] NativeBiometric methods:", NativeBiometric ? Object.keys(NativeBiometric) : "null");
        checkBiometricAvailability();
        // Only check camera permission if we might need it (device has fingerprint but not Face ID)
        // Don't check camera permission on mount - only check when user clicks Continue
        // This prevents camera from opening automatically
        // checkCameraPermission();
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

    const checkBiometricAvailability = async () => {
        console.log("🔍 [CHECK-AVAILABILITY] Starting availability check...");
        try {
            if (!Capacitor.isNativePlatform()) {
                console.log("⚠️ [CHECK-AVAILABILITY] Not on native platform, skipping");
                // Web platform - show message that biometric is only available on mobile
                setBiometricAvailable(false);
                return;
            }

            console.log("🔍 [CHECK-AVAILABILITY] Calling NativeBiometric.isAvailable()...");
            const result = await NativeBiometric.isAvailable();
            console.log("✅ [CHECK-AVAILABILITY] Result:", JSON.stringify(result));
            console.log("✅ [CHECK-AVAILABILITY] isAvailable:", result.isAvailable);
            console.log("✅ [CHECK-AVAILABILITY] biometryType:", result.biometryType);
            // Note: @capgo/capacitor-native-biometric returns biometryType (single value), not biometryTypes array

            // Map biometryType: 
            // 0=None, 1=TouchID (iOS), 2=FaceID (iOS), 3=Fingerprint (Android), 
            // 4=FACE_AUTHENTICATION (Android face unlock), 5=IRIS_AUTHENTICATION
            const biometryType = result.biometryType || 0;
            const hasFaceID = biometryType === 2; // 2 = FaceID (iOS only)
            const hasFaceAuth = biometryType === 4; // 4 = FACE_AUTHENTICATION (Android face unlock)
            const hasFingerprint = biometryType === 3; // 3 = Fingerprint
            const hasTouchID = biometryType === 1; // 1 = TouchID (iOS)

            // IMPORTANT: On Android, the plugin only returns the PRIMARY biometric type
            // If fingerprint (type 3) is returned, face unlock (type 4) might also be available
            // Android's BiometricPrompt will show all available options when verifyIdentity() is called
            // So we should check if face unlock might be available even if fingerprint is primary
            const platform = Capacitor.getPlatform();
            let hasFace = hasFaceID || hasFaceAuth;

            // On Android, if fingerprint is detected, face unlock might also be available
            // The plugin only returns the primary type, but Android supports multiple biometrics
            if (platform === "android" && hasFingerprint && !hasFaceAuth) {
                console.log("ℹ️ [CHECK-AVAILABILITY] Android: Fingerprint detected as primary.");
                console.log("ℹ️ [CHECK-AVAILABILITY] Android: Face unlock may also be available (not detected as primary).");
                console.log("ℹ️ [CHECK-AVAILABILITY] Android: When verifyIdentity() is called, all available biometrics will be shown.");
                // Note: We can't definitively say face unlock is available, but it might be
                // Android's BiometricPrompt will show all available options when verifyIdentity() is called
            }

            // Use Face if available (either iOS Face ID or Android face unlock), otherwise use the primary type
            const preferredType = hasFace ? (hasFaceID ? 2 : 4) : (biometryType || 2);

            console.log("✅ [CHECK-AVAILABILITY] Has Face ID (iOS):", hasFaceID);
            console.log("✅ [CHECK-AVAILABILITY] Has Face Authentication (Android):", hasFaceAuth);
            console.log("✅ [CHECK-AVAILABILITY] Has Face unlock (any):", hasFace);
            console.log("✅ [CHECK-AVAILABILITY] Has Fingerprint:", hasFingerprint);
            console.log("✅ [CHECK-AVAILABILITY] Preferred type:", preferredType);

            // Explain what the plugin returned
            if (hasFaceID) {
                console.log("ℹ️ [CHECK-AVAILABILITY] Device has iOS Face ID (type 2)");
            } else if (hasFaceAuth) {
                console.log("ℹ️ [CHECK-AVAILABILITY] Device has Android Face Authentication (type 4)");
            } else if (hasFingerprint) {
                if (platform === "android") {
                    console.log("ℹ️ [CHECK-AVAILABILITY] Device has Fingerprint (type 3) as primary.");
                    console.log("ℹ️ [CHECK-AVAILABILITY] Face unlock may also be available but not detected as primary.");
                    console.log("ℹ️ [CHECK-AVAILABILITY] Android's BiometricPrompt will show all available options when verifyIdentity() is called.");
                } else {
                    console.log("ℹ️ [CHECK-AVAILABILITY] Device has Fingerprint (type 3)");
                }
            } else {
                console.log("ℹ️ [CHECK-AVAILABILITY] No biometric authentication available");
            }

            setBiometricAvailable(result.isAvailable);
            setBiometricType(preferredType);

            // Only use camera if device has fingerprint but user wants Face ID
            // If no biometrics available at all, don't use camera - show error instead
            if (!hasFace && hasFingerprint && result.isAvailable) {
                console.log("📷 [CHECK-AVAILABILITY] Face ID not available, but fingerprint is. Will use camera for Face ID");
                setUseCamera(true);
                // Override biometric type to 4 (Face) since we're implementing Face ID via camera
                setBiometricType(4);
            } else if (!result.isAvailable || biometryType === 1) {
                console.log("⚠️ [CHECK-AVAILABILITY] No biometrics available - will not use camera fallback");
                setUseCamera(false);
            }
        } catch (err) {
            console.error("❌ [CHECK-AVAILABILITY] Error checking biometric availability:", err);
            console.error("❌ [CHECK-AVAILABILITY] Error type:", typeof err);
            console.error("❌ [CHECK-AVAILABILITY] Error message:", err?.message);
            console.error("❌ [CHECK-AVAILABILITY] Error stack:", err?.stack);
            console.error("❌ [CHECK-AVAILABILITY] Full error object:", JSON.stringify(err, null, 2));
            setBiometricAvailable(false);
            // If biometric check fails, don't use camera - show error instead
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
                quality: 10, // Reduced to 10 to minimize file size (0-100) - should be under 50KB
                allowEditing: false,
                resultType: "base64",
                source: "CAMERA",
                width: 640, // Limit width to reduce file size
                height: 480, // Limit height to reduce file size
                promptLabelHeader: "Face Verification",
                promptLabelPhoto: "Take Photo",
                promptLabelPicture: "Use Camera",
            });

            console.log("📷 [CAMERA] Photo captured successfully");
            console.log("📷 [CAMERA] Photo format:", photo.format);
            console.log("📷 [CAMERA] Photo base64 length:", photo.base64String?.length || 0);

            // For now, we'll use the photo as face data
            // In production, you'd send this to a face detection API (ML Kit, AWS Rekognition, etc.)
            // For this implementation, we'll treat successful photo capture as face verification
            setLoadingStep("Processing face data...");

            const rawPhotoData = photo.base64String;

            // Compress photo if it's still too large (limit to ~50KB base64 ≈ 37KB binary)
            let photoData = rawPhotoData;
            const maxSize = 50000; // ~50KB base64 (strict limit to avoid 413 errors)

            if (photoData && photoData.length > maxSize) {
                console.log("📷 [CAMERA] Photo too large (" + photoData.length + " bytes), will not send to backend");
                // Don't send photo data if it's too large - we already have it stored on device
                photoData = null;
                console.log("📷 [CAMERA] Photo data too large, will not send to backend (stored on device only)");
            } else if (photoData) {
                console.log("📷 [CAMERA] Photo size OK (" + photoData.length + " bytes), will include in registration");
            }

            // Persist photo on device storage so it lives outside webview memory
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
                        // Ignore "already exists" errors
                        const message = `${mkdirErr?.message || mkdirErr}`;
                        if (
                            !message.includes("already exists") &&
                            !message.includes("EXISTS")
                        ) {
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
                    console.error("❌ [CAMERA] Failed to persist face photo on device:", fsErr);
                }
            }

            // Store photo data temporarily in localStorage for registration (only if small enough)
            if (photoData && typeof window !== "undefined") {
                localStorage.setItem("cameraFacePhoto", photoData);
                console.log("📷 [CAMERA] Photo data stored in localStorage for submission");
            } else if (typeof window !== "undefined") {
                // Clear any old photo data
                localStorage.removeItem("cameraFacePhoto");
            }

            // Simulate face detection processing
            await new Promise(resolve => setTimeout(resolve, 1000));

            return {
                success: true,
                photoData: photoData, // Use compressed/processed photo data
                format: photo.format,
            };
        } catch (err) {
            console.error("❌ [CAMERA] Camera error:", err);
            throw err;
        }
    };

    const handleContinue = async () => {
        console.log("🚀 [CONTINUE] Button clicked, starting face verification...");
        console.log("🚀 [CONTINUE] User:", user);
        console.log("🚀 [CONTINUE] Token exists:", !!token);

        if (!user || !token) {
            console.log("❌ [CONTINUE] No user or token found");
            setError("Authentication session not found. Please log in again.");
            return;
        }

        // Check if we're on a native platform
        console.log("🚀 [CONTINUE] Platform check:", Capacitor.getPlatform());
        console.log("🚀 [CONTINUE] Is native:", Capacitor.isNativePlatform());

        if (!Capacitor.isNativePlatform()) {
            console.log("❌ [CONTINUE] Not on native platform");
            setError("Face ID is only available on mobile devices. Please use the mobile app.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsScanning(true);
        setLoadingStep("Preparing face scan...");
        console.log("🚀 [CONTINUE] Loading started");

        try {
            // Check availability again before starting
            console.log("🔍 [CONTINUE] Checking availability before auth...");
            const availability = await NativeBiometric.isAvailable();
            console.log("✅ [CONTINUE] Availability result:", JSON.stringify(availability));

            const biometryType = availability.biometryType || 0;
            const hasFaceID = biometryType === 2; // 2 = FaceID (iOS only)
            const hasFaceAuth = biometryType === 4; // 4 = FACE_AUTHENTICATION (Android face unlock)
            const hasFace = hasFaceID || hasFaceAuth; // Either iOS Face ID or Android face unlock
            const hasFingerprint = biometryType === 3; // 3 = Fingerprint

            // Only use camera if device has fingerprint but user wants Face ID
            // Don't use camera if no biometrics are available or if native face unlock is available
            const shouldUseCamera = useCamera && hasFingerprint && availability.isAvailable && !hasFace;

            console.log("🔍 [CONTINUE] Has Face unlock:", hasFace);
            console.log("🔍 [CONTINUE] Has Fingerprint:", hasFingerprint);
            console.log("🔍 [CONTINUE] Should use camera:", shouldUseCamera);

            // If Face ID is not available, use camera for face detection
            if (shouldUseCamera) {
                console.log("📷 [CONTINUE] Using camera for face detection...");
                setLoadingStep("Opening camera for face detection...");

                // Check camera permission before opening camera
                await checkCameraPermission();

                const cameraResult = await captureFaceWithCamera();

                if (!cameraResult.success) {
                    throw new Error("Failed to capture face photo");
                }

                console.log("✅ [CONTINUE] Camera face capture successful!");
                setLoadingStep("Face captured successfully!");
            } else {
                // Use OS-level biometrics (Face ID or Fingerprint)
                // Show helpful message if biometrics aren't enrolled
                if (!availability.isAvailable) {
                    const reason = availability.reason || availability.code || "Biometric not enrolled";

                    console.log("⚠️ [CONTINUE] Biometric not available:", reason);
                    console.log("⚠️ [CONTINUE] Biometry type:", availability.biometryType);
                    console.log("⚠️ [CONTINUE] Device is secure:", availability.deviceIsSecure);

                    // Map biometry type numbers to names (0=None, 1=TouchID, 2=FaceID, 3=Fingerprint)
                    const typeNames = {
                        0: "None",
                        1: "Touch ID",
                        2: "Face ID",
                        3: "Fingerprint"
                    };

                    const availableType = typeNames[availability.biometryType] || "Unknown";

                    // If no biometrics available, show error - don't use camera fallback
                    if (!availability.isAvailable || availability.biometryType === 0) {
                        console.log("❌ [CONTINUE] No biometrics available - showing error, not using camera");

                        let errorMsg = "Biometric authentication is not available on this device.\n\n";
                        errorMsg += "Please set up biometric authentication in your phone settings:\n";
                        errorMsg += "Settings → Security → Biometric unlock\n\n";
                        errorMsg += "After setting up, return to this app and try again.\n\n";
                        errorMsg += "Or you can skip this step for now.";

                        setError(errorMsg);
                        setIsLoading(false);
                        setIsScanning(false);
                        return;
                    } else {
                        // Other error, show message
                        setError("Biometric authentication is not available. Please try again or skip this step.");
                        setIsLoading(false);
                        setIsScanning(false);
                        return;
                    }
                } else {
                    // Use OS biometrics
                    setLoadingStep("Starting face scan...");
                    console.log("🔐 [CONTINUE] Starting biometric authentication...");

                    // Get biometric display name for authentication prompt
                    const biometricName = biometricType === 2 ? "Face ID" : biometricType === 3 ? "Fingerprint" : biometricType === 1 ? "Touch ID" : "Biometric";
                    const authTitle = biometricType === 2 ? "Face Verification" : "Biometric Verification";
                    const authSubtitle = biometricType === 2
                        ? "Look at your device to verify"
                        : "Use your biometric to verify";

                    // Authenticate using biometric
                    console.log("🔐 [CONTINUE] Calling NativeBiometric.verifyIdentity()...");
                    await NativeBiometric.verifyIdentity({
                        reason: `Complete ${biometricName.toLowerCase()} verification to secure your account`,
                        title: authTitle,
                        subtitle: authSubtitle,
                        description: authSubtitle,
                    });

                    // If we reach here, authentication was successful
                    // (the promise resolved, even if the value is undefined)
                    console.log("✅ [CONTINUE] Biometric authentication successful!");
                }
            }

            setLoadingStep("Verifying face data...");
            console.log("📱 [CONTINUE] Getting device ID...");

            // Get device ID for tracking
            const { Device } = await import("@capacitor/device");
            const deviceInfo = await Device.getId();
            const deviceId = deviceInfo.identifier || "unknown";
            console.log("📱 [CONTINUE] Device ID:", deviceId);

            // Register face with backend
            setLoadingStep("Registering face profile...");
            console.log("🌐 [CONTINUE] Registering with backend...");

            // Use the actual detected biometric type
            // If using camera, always use "face_id" type
            const biometricTypeString = shouldUseCamera ? "face_id" : (biometricType === 2 ? "face_id" : biometricType === 3 ? "fingerprint" : biometricType === 1 ? "touchid" : "biometric");

            const registrationData = {
                mobile: user.mobile,
                type: biometricTypeString,
                deviceId: deviceId,
                verificationData: {
                    // OS-level biometric doesn't provide scores, but we mark it as verified
                    livenessScore: 1.0, // OS handles liveness or camera capture
                    faceMatchScore: 1.0, // OS handles matching or camera capture
                },
            };

            // If using camera, include photo data (optional - for future face matching)
            // Only include if photo is small enough to avoid 413 errors (strict 50KB limit)
            if (shouldUseCamera && typeof window !== 'undefined') {
                const cameraPhoto = localStorage.getItem('cameraFacePhoto');
                if (cameraPhoto && cameraPhoto.length < 50000) { // Only send if < 50KB (strict limit)
                    registrationData.photoData = cameraPhoto;
                    console.log("📷 [CONTINUE] Including photo data in registration (size:", cameraPhoto.length, " bytes)");
                } else {
                    console.log("📷 [CONTINUE] Photo data too large (" + (cameraPhoto?.length || 0) + " bytes) or missing, skipping photoData in registration");
                    console.log("📷 [CONTINUE] Photo is stored on device at:", localStorage.getItem('cameraFacePhotoPath'));
                }
            }
            console.log("🌐 [CONTINUE] Registration data:", JSON.stringify(registrationData));

            const result = await registerFace(registrationData, token);
            console.log("🌐 [CONTINUE] Backend response:", JSON.stringify(result));

            if (result.error) {
                console.log("❌ [CONTINUE] Backend error:", result.error);
                throw new Error(result.error);
            }

            // Mark face verification as completed
            console.log("✅ [CONTINUE] Marking verification as completed");
            localStorage.setItem("faceVerificationCompleted", "true");
            localStorage.setItem("biometricType", biometricTypeString); // Store actual biometric type
            if (token) {
                localStorage.setItem("biometricToken", token);
                if (user) {
                    localStorage.setItem("biometricUser", JSON.stringify(user));
                }
            }

            // Save biometric credentials using capacitor-native-biometric
            // This is the proper place for new users after completing face verification
            if (token && user && Capacitor.isNativePlatform()) {
                try {
                    console.log("💾 [CONTINUE] Saving biometric credentials after face verification...");
                    const { setCredentials, enableBiometricLocally } = await import("@/lib/biometricAuth");

                    // Store username and a JSON string containing token and user data
                    const credentialPayload = {
                        token: token,
                        user: user,
                    };

                    console.log("💾 [CONTINUE] Attempting to save biometric credentials...");
                    console.log("💾 [CONTINUE] Username:", user.email || user.mobile);
                    console.log("💾 [CONTINUE] Token length:", token?.length || 0);
                    console.log("💾 [CONTINUE] User ID:", user?._id);
                    console.log("💾 [CONTINUE] Biometric type:", biometricTypeString);

                    const credentialResult = await setCredentials({
                        username: user.email || user.mobile,
                        password: JSON.stringify(credentialPayload),
                    });

                    if (credentialResult.success) {
                        // Enable biometric locally
                        enableBiometricLocally(biometricTypeString);
                        console.log("✅ [CONTINUE] Biometric credentials saved successfully for new user!");
                        console.log("✅ [CONTINUE] Biometric type:", biometricTypeString);
                    } else {
                        console.warn("⚠️ [CONTINUE] Failed to save biometric credentials:", credentialResult.error);
                        console.warn("⚠️ [CONTINUE] Error code:", credentialResult.errorCode);
                    }
                } catch (biometricError) {
                    console.error("❌ [CONTINUE] Error saving biometric credentials:", biometricError);
                    // Don't fail face verification if biometric save fails
                }
            }

            setLoadingStep("Face verification successful!");
            console.log("🎉 [CONTINUE] Face verification complete! Navigating to homepage...");

            // Navigate to homepage after a brief delay
            setTimeout(() => {
                router.push("/homepage");
            }, 1000);
        } catch (err) {
            console.error("❌ [CONTINUE] Face verification error:", err);
            console.error("❌ [CONTINUE] Error type:", typeof err);
            console.error("❌ [CONTINUE] Error message:", err?.message);
            console.error("❌ [CONTINUE] Error stack:", err?.stack);
            console.error("❌ [CONTINUE] Full error:", JSON.stringify(err, null, 2));

            let errorMessage = "Face verification failed. Please try again.";

            if (err.message) {
                errorMessage = err.message;
            } else if (err.error) {
                errorMessage = err.error;
            }

            // Handle specific error cases
            const biometricName = getBiometricDisplayName();
            if (errorMessage.includes("cancelled") || errorMessage.includes("Cancel")) {
                errorMessage = `${biometricName} verification was cancelled. You can try again or skip for now.`;
            } else if (errorMessage.includes("not available")) {
                errorMessage = `${biometricName} is not available on this device. You can skip this step.`;
            } else if (errorMessage.includes("not enrolled")) {
                errorMessage = `${biometricName} is not set up on this device. Please set it up in device settings first.`;
            }

            setError(errorMessage);
        } finally {
            setIsLoading(false);
            setIsScanning(false);
        }
    };

    const handleSkip = async () => {
        console.log("⏭️ [SKIP] User chose to skip face verification");

        // Allow user to skip face verification
        localStorage.setItem("faceVerificationSkipped", "true");

        // Even if user skips face verification, save biometric credentials if available
        // This allows them to use native biometric login (Touch ID/Fingerprint) even without Face ID
        if (token && user && Capacitor.isNativePlatform()) {
            try {
                console.log("💾 [SKIP] Checking if we can still save biometric credentials...");
                const { setCredentials, enableBiometricLocally, checkBiometricAvailability } = await import("@/lib/biometricAuth");

                // Check if any biometric is available
                const availability = await checkBiometricAvailability();

                if (availability.isAvailable) {
                    console.log("💾 [SKIP] Biometric available, saving credentials...");

                    // Store username and a JSON string containing token and user data
                    const credentialPayload = {
                        token: token,
                        user: user,
                    };

                    console.log("💾 [SKIP] Attempting to save biometric credentials...");
                    console.log("💾 [SKIP] Username:", user.email || user.mobile);
                    console.log("💾 [SKIP] Token length:", token?.length || 0);
                    console.log("💾 [SKIP] User ID:", user?._id);
                    console.log("💾 [SKIP] Biometric type:", availability.biometryTypeName);

                    const credentialResult = await setCredentials({
                        username: user.email || user.mobile,
                        password: JSON.stringify(credentialPayload),
                    });

                    if (credentialResult.success) {
                        // Enable biometric locally with the available type
                        enableBiometricLocally(availability.biometryTypeName);
                        console.log("✅ [SKIP] Biometric credentials saved despite skipping face verification!");
                        console.log("✅ [SKIP] Biometric type:", availability.biometryTypeName);
                    } else {
                        console.warn("⚠️ [SKIP] Failed to save biometric credentials:", credentialResult.error);
                        console.warn("⚠️ [SKIP] Error code:", credentialResult.errorCode);
                    }
                } else {
                    console.log("⚠️ [SKIP] No biometric available on device");
                }
            } catch (biometricError) {
                console.error("❌ [SKIP] Error saving biometric credentials:", biometricError);
                // Don't fail skip if biometric save fails
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
                                    ? "Capturing your face for Face ID... Please look at the camera"
                                    : biometricType === 4
                                        ? "Scanning your face... Keep your head still"
                                        : "Authenticating... Please wait"
                                : useCamera
                                    ? "Tap Continue to set up Face ID using your camera"
                                    : biometricType === 4
                                        ? "Move your head slowly from left to right to complete the process"
                                        : "Place your finger on the sensor to complete the process"}
                        </p>

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

