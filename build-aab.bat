@echo off
echo 🔧 Building Android App Bundle (AAB) for Jackson App...
echo.

REM Navigate to Android directory
cd android

REM Clean previous builds
echo 🧹 Cleaning previous builds...
call gradlew.bat clean
echo.

REM Build Next.js app first
echo 📦 Building Next.js app...
cd ..
call npm run build
echo.

REM Sync Capacitor
echo 🔄 Syncing Capacitor...
call npx cap sync android
echo.

REM Copy web assets
echo 📱 Copying web assets...
call npx cap copy android
echo.

REM Navigate back to Android directory
cd android

REM Build AAB (Android App Bundle)
echo 📦 Building AAB (Android App Bundle)...
echo This may take a few minutes...
call gradlew.bat bundleRelease
echo.

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✅ AAB build successful!
    echo.
    echo 📍 Your AAB file is located at:
    echo    android\app\build\outputs\bundle\release\app-release.aab
    echo.
    echo 📤 You can upload this file to Google Play Console
    echo.
) else (
    echo.
    echo ❌ AAB build failed!
    echo Please check the error messages above.
    echo.
)

cd ..
pause

















