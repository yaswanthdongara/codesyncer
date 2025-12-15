# Android Build Setup Guide

To build the Android app (`.apk`), you need to install the Android SDK. Follow these steps:

## 1. Install Android Studio
1.  Download **Android Studio** from: [https://developer.android.com/studio](https://developer.android.com/studio)
2.  Run the installer. Keep all default options selected (ensure "Android Virtual Device" is checked).

## 2. Install SDK Components
1.  Open Android Studio.
2.  On the Welcome screen, click **More Actions** > **SDK Manager**.
3.  In the **SDK Platforms** tab, check the box for the latest Android version (e.g., Android 14 or 15).
4.  In the **SDK Tools** tab, check the following:
    *   **Android SDK Build-Tools**
    *   **Android SDK Command-line Tools (latest)**
    *   **Android Emulator**
    *   **Android SDK Platform-Tools**
5.  Click **Apply** and wait for the download to finish.

## 3. Accept Licenses
Once installed, open your terminal (PowerShell or CMD) and run:
```bash
flutter doctor --android-licenses
```
Type `y` for every license agreement to accept them.

## 4. Build the App
Now you can build the APK:
```bash
flutter build apk --release
```
The file will be located at: `build/app/outputs/flutter-apk/app-release.apk`
