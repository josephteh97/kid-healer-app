# 阳光小屋 (Sunshine House) - Launch & Build Manual

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Launch for Development](#launch-for-development)
3. [Build for Web Deployment](#build-for-web-deployment)
4. [Build Android APK (Debug)](#build-android-apk-debug)
5. [Build Android APK (Signed Release)](#build-android-apk-signed-release)
6. [Build Android App Bundle (AAB) for Google Play](#build-android-app-bundle-aab-for-google-play)
7. [Build for iOS](#build-for-ios)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Minimum Version | Check Command | Download |
|----------|----------------|---------------|----------|
| Node.js | 20.x | `node -v` | https://nodejs.org |
| npm | 9.x | `npm -v` | Comes with Node.js |
| Git | 2.x | `git --version` | https://git-scm.com |

### For Android APK/AAB

| Software | Minimum Version | Download |
|----------|----------------|----------|
| Java JDK | 17 | https://adoptium.net |
| Android Studio | 2023+ | https://developer.android.com/studio |
| Android SDK | API 33+ | Install via Android Studio SDK Manager |

### For iOS (Mac only)

| Software | Minimum Version | Download |
|----------|----------------|----------|
| Xcode | 15+ | Mac App Store |
| CocoaPods | 1.14+ | `sudo gem install cocoapods` |

---

## Launch for Development

Run the app locally in a browser with hot-reload:

```bash
# 1. Install dependencies (first time only, or after pulling new changes)
npm install

# 2. Start development server
npm run dev
```

Open http://localhost:3000 in your browser. Changes to source files will reload automatically.

---

## Build for Web Deployment

Build static files that can be hosted on any web server (Nginx, Vercel, Netlify, GitHub Pages, etc.):

```bash
# 1. Build production bundle
npm run build

# 2. Preview the build locally (optional)
npm run preview
```

Output goes to `dist/` folder. Upload the contents of `dist/` to your hosting provider.

### Deploy to GitHub Pages (example)

```bash
# Install gh-pages helper
npm install -D gh-pages

# Add to package.json scripts:
#   "deploy": "gh-pages -d dist"

npm run build
npx gh-pages -d dist
```

### Deploy to Vercel/Netlify

- Connect your GitHub repo
- Set build command: `npm run build`
- Set output directory: `dist`
- Deploy

---

## Build Android APK (Debug)

A debug APK can be installed directly on any Android device for testing. It does not require signing.

### Step 1: Install Java JDK 17

Download from https://adoptium.net and install. Verify:

```bash
java -version
# Should show: openjdk version "17.x.x"
```

Set `JAVA_HOME` environment variable:
- **Windows**: System Properties > Environment Variables > New System Variable
  - Name: `JAVA_HOME`
  - Value: `C:\Program Files\Eclipse Adoptium\jdk-17.x.x-hotspot` (your actual path)
- **Mac/Linux**: Add to `~/.bashrc` or `~/.zshrc`:
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 17)
  ```

### Step 2: Install Android Studio

1. Download from https://developer.android.com/studio
2. During setup, install:
   - Android SDK (API 33 or 34)
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
3. Set `ANDROID_HOME` environment variable:
   - **Windows**: `C:\Users\<you>\AppData\Local\Android\Sdk`
   - **Mac**: `~/Library/Android/sdk`
   - **Linux**: `~/Android/Sdk`

### Step 3: Build the Web App and Sync to Android

```bash
# Build web assets
npm run build

# Sync web assets into the Android project
npx cap sync android
```

### Step 4: Build APK via Command Line

```bash
# Navigate to android directory
cd android

# Build debug APK (Windows)
gradlew.bat assembleDebug

# Build debug APK (Mac/Linux)
./gradlew assembleDebug

# Go back to project root
cd ..
```

The debug APK will be at:
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 4 (Alternative): Build APK via Android Studio

```bash
# Open the project in Android Studio
npx cap open android
```

Then in Android Studio:
1. Wait for Gradle sync to finish
2. Menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
3. Click "locate" in the notification to find the APK

### Step 5: Install on Device

Transfer `app-debug.apk` to your Android phone and open it to install. You may need to enable "Install from unknown sources" in Settings.

Or install via USB with adb:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Build Android APK (Signed Release)

A signed release APK is required for distribution outside Google Play (e.g., sharing directly, uploading to APKPure).

### Step 1: Generate a Signing Key (one time only)

```bash
keytool -genkey -v -keystore sunshine-house.keystore -alias sunshine-house -keyalg RSA -keysize 2048 -validity 10000
```

You will be prompted for a password and identity info. **Save the keystore file and password securely. If you lose them, you cannot update the app.**

### Step 2: Configure Signing in Gradle

Edit `android/app/build.gradle`, add inside the `android { }` block:

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file('../../sunshine-house.keystore')
            storePassword 'YOUR_PASSWORD'
            keyAlias 'sunshine-house'
            keyPassword 'YOUR_PASSWORD'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

> **Security note**: Do not commit passwords to git. Use environment variables or a `keystore.properties` file that is in `.gitignore`.

### Step 3: Build Signed Release APK

```bash
npm run build
npx cap sync android
cd android

# Windows
gradlew.bat assembleRelease

# Mac/Linux
./gradlew assembleRelease

cd ..
```

Output:
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## Build Android App Bundle (AAB) for Google Play

Google Play requires AAB format (not APK).

```bash
npm run build
npx cap sync android
cd android

# Windows
gradlew.bat bundleRelease

# Mac/Linux
./gradlew bundleRelease

cd ..
```

Output:
```
android/app/build/outputs/bundle/release/app-release.aab
```

### Upload to Google Play

1. Go to https://play.google.com/console
2. Create a developer account ($25 one-time fee)
3. Create a new app
4. Fill in store listing (name, description, screenshots, icon)
5. Go to **Production** > **Create new release**
6. Upload `app-release.aab`
7. Submit for review

---

## Build for iOS

> Requires a Mac with Xcode installed.

### Step 1: Add iOS Platform

```bash
npx cap add ios
```

### Step 2: Build and Sync

```bash
npm run build
npx cap sync ios
```

### Step 3: Open in Xcode

```bash
npx cap open ios
```

### Step 4: Build and Run

1. Select a simulator or connected device
2. Click the Play button, or **Product** > **Archive** for a release build
3. To distribute via App Store: **Product** > **Archive** > **Distribute App**

> An Apple Developer account ($99/year) is required for App Store distribution.

---

## Troubleshooting

### `npm run build` fails with "Node.js version" error

Vite 5 requires Node.js 18+. This project uses Vite 5.4.x which works with Node 20.16+. Upgrade Node.js if needed.

### esbuild version mismatch

```
Host version "X" does not match binary version "Y"
```

Fix:
```bash
rm -rf node_modules
npm install
```

### `cap sync` fails

Make sure you built the web app first:
```bash
npm run build
npx cap sync android
```

### Android build fails with "SDK not found"

Create `android/local.properties` with your SDK path:
```properties
# Windows
sdk.dir=C:\\Users\\<you>\\AppData\\Local\\Android\\Sdk

# Mac
sdk.dir=/Users/<you>/Library/Android/sdk
```

### Gradle build fails with Java errors

Ensure `JAVA_HOME` points to JDK 17. Android Gradle Plugin 8.x requires JDK 17.

### App shows blank white screen on Android

Check that `dist/` has the built files and you ran `npx cap sync android` after `npm run build`.

### Port 3000 already in use

```bash
# Find and kill the process (Windows)
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Or change the port in vite.config.js
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Install dependencies | `npm install` |
| Start dev server | `npm run dev` |
| Build for production | `npm run build` |
| Preview production build | `npm run preview` |
| Sync to Android | `npx cap sync android` |
| Open Android Studio | `npx cap open android` |
| Build debug APK | `cd android && gradlew.bat assembleDebug` |
| Build release APK | `cd android && gradlew.bat assembleRelease` |
| Build AAB for Play Store | `cd android && gradlew.bat bundleRelease` |
| Sync to iOS | `npx cap sync ios` |
| Open Xcode | `npx cap open ios` |
