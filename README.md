# React Native Project Setup Guide

This document provides step-by-step instructions to integrate the React Native boilerplate into your existing project folder. Follow these steps to quickly set up the necessary files and dependencies.
---



## 1. Prerequisites

Before starting, ensure you have the following tools installed on your system:

- **Node.js** – [Download Node.js](https://nodejs.org/)
- **Yarn** – [Install Yarn](https://yarnpkg.com/getting-started/install)
- **Watchman** – [Install Watchman](https://facebook.github.io/watchman/docs/install)
- **React Native CLI** – [Install React Native CLI](https://reactnative.dev/docs/environment-setup)
- **Xcode** – [Download Xcode from the App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (for iOS development)
- **Android Studio** – [Download Android Studio](https://developer.android.com/studio) (for Android development)

---

## 2. Project Setup Steps

### Step 1: Clone the Repository
First, clone the React Native boilerplate project to your local machine:

```bash
git clone https://github.com/MuhammadShahidRaza/React-Native-Boilerplate.git
cd <project-folder>
```

### Step 2: Copy Required Files and Folders

Copy the following files and folders into the root of your project directory:

- **`src` folder**
- **`babel.config.js`**
- **`commitlint.config.js`**
- **`declarations.d.ts`**
- **`eslint.config.js`**
- **`metro.config.js`**
- **`.prettierrc.js`**
- **`App.tsx`**
- **`.env` files**
- **`.husky` folder**
- **`Font` folder** (unzip and open in Xcode to paste in the project folder)
- **`updateBuildGradle.js` file**

### Step 3: Install Dependencies

#### Main Dependencies

Run the following command to install the main dependencies:

```bash
yarn add react-native-reanimated react-native-safe-area-context react-native-screens react-native-skeleton-placeholder formik @reduxjs/toolkit i18next react-native-dotenv react-i18next react-native-svg react-native-toast-message react-native-vector-icons react-redux yup react-native-permissions react-native-phone-number-input react-native-image-crop-picker axios @react-navigation/native-stack @react-navigation/native @react-native-async-storage/async-storage @react-native-community/geolocation react-native-linear-gradient @notifee/react-native
```

#### Development Dependencies

Run the following command to install the development dependencies:

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional @types/react-native-vector-icons @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-plugin-module-resolver eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native globals husky lint-staged metro-react-native-babel-preset react-native-codegen react-native-svg-transformer typescript-eslint
```

### Step 4: Update Project Files

1. **`index.js`**  
   Add the following line at the top:
   ```javascript
   import './src/i18n';
   ```

2. **`android/app/src/main/res/values/strings.xml`**  
   Add any required map keys or other configuration values as needed.

3. **Change App Icons**  
   Use [EasyAppIcon](https://easyappicon.com) to generate and replace the app icons in your project.

4. **`tsconfig.json`**  
   Replace or update with the provided `tsconfig.json` file.

5. **`package.json`**  
   Add these scripts under the `"scripts"` section:

   ```json
   "scripts": {
       "build": "cd android && ./gradlew clean && ./gradlew assembleRelease",
       "aab": "cd android && ./gradlew clean && ./gradlew bundleRelease",
       "debugAndroid": "cd android && ./gradlew clean && cd .. && yarn android",
       "debugIos": "cd ios && pod install && cd .. && yarn ios",
       "prepare": "husky",
       "format": "prettier --write ./src",
       "simulators": "xcrun simctl list devices",
       "lint": "eslint .",
       "start": "react-native start",
       "test": "jest",
       "clean": "rm -rf node_modules && yarn cache clean && yarn",
       "android": "react-native run-android",
       "reverse": "adb reverse tcp:8081 tcp:8081",
       "devices": "adb devices && yarn reverse",
       "android:clean": "cd android && ./gradlew clean",
       "android:bundle:assets": "react-native bundle --platform android --dev false --entry-file index.js --bundle-output android/app/src/main/assets/index.android.bundle --assets-dest android/app/src/main/res",
       "open-apk": "open ./android/app/build/outputs/apk/",
       "signing": "cd android && ./gradlew signingReport && cd ..",
       "open-bundle": "open ./android/app/build/outputs/bundle",
       "build:prod": "yarn android:clean && cd android && ./gradlew assembleRelease && yarn open-apk",
       "bundle": "cd android && ./gradlew bundleRelease && open-bundle",
       "ios": "react-native run-ios",
       "pod": "cd ios && pod install && cd ..",
       "pod:reset": "cd ios && pod deintegrate && pod setup && pod install && cd ..",
       "ios:clean": "cd ios && rm -rf ~/Library/Caches/CocoaPods && rm -rf Pods && rm -rf ~/Library/Developer/Xcode/DerivedData/* && yarn pod",
       "ios:debug": "pod && yarn ios",
       "ios:bundle:assets": "react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios"
   },
   "lint-staged": {
       "./src/**/*.{js,jsx,ts,tsx}": [
           "yarn format",
           "yarn lint"
       ]
   }
   ```

---

## 3. Configure iOS

### Update the `Podfile`

- **Before** this line:
  ```ruby
  (platform :ios, min_ios_version_supported)
  prepare_react_native_project!
  ```

  Add the following code to resolve the React Native dependencies:

  ```ruby
  def node_require(script)
    # Resolve script with node to allow for hoisting
    require Pod::Executable.execute_command('node', ['-p',
      "require.resolve(
        '#{script}',
        {paths: [process.argv[1]]},
      )", __dir__]).strip
  end

  node_require('react-native/scripts/react_native_pods.rb')
  node_require('react-native-permissions/scripts/setup.rb')
  ```

- **After** this line:
  ```ruby
  (platform :ios, min_ios_version_supported)
  prepare_react_native_project!
  ```

  Add the required permissions for your app:

  ```ruby
  setup_permissions([
      'AppTrackingTransparency',
      'Bluetooth',
      'Calendars',
      'CalendarsWriteOnly',
      'Camera',
      'Contacts',
      'FaceID',
      'LocationAccuracy',
      'LocationAlways',
      'LocationWhenInUse',
      'MediaLibrary',
      'Microphone',
      'Motion',
      'Notifications',
      'PhotoLibrary',
      'PhotoLibraryAddOnly',
      'Reminders',
      'Siri',
      'SpeechRecognition',
      'StoreKit',
  ])
  ```

### Update `Info.plist`

Add the following keys to the `Info.plist`:

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) needs your location to show nearby practitioners.</string>
<key>UIAppFonts</key>
<array>
    <string>AntDesign.ttf</string>
    <string>Entypo.ttf</string>
    <string>EvilIcons.ttf</string>
    <string>Feather.ttf</string>
    <string>FontAwesome.ttf</string>
    <string>FontAwesome5_Brands.ttf</string>
    <string>FontAwesome5_Regular.ttf</string>
    <string>FontAwesome5_Solid.ttf</string>
    <string>FontAwesome6_Brands.ttf</string>
    <string>FontAwesome6_Regular.ttf</string>
    <string>FontAwesome6_Solid.ttf</string>
    <string>Foundation.ttf</string>
    <string>Ionicons.ttf</string>
    <string>MaterialIcons.ttf</string>
    <string>MaterialCommunityIcons.ttf</string>
    <string>SimpleLineIcons.ttf</string>
    <string>Octicons.ttf</string>
    <string>Zocial.ttf</string>
    <string>Fontisto.ttf</string>
    <string>GorditaBlack.otf</string>
    <string>GorditaBold.otf</string>
    <string>GorditaLight.otf</string>
    <string>GorditaMedium.otf</string>
    <string>GorditaRegular.otf</string>
</array>
```

---

## 4. Final Steps

### Run the Gradle Update Script
To update your Gradle configuration, run:

```bash
node updateBuildGradle.js
```

### Generate Assets

Run the following command to generate the necessary assets:

```bash
npx react-native-asset
```

---

### Run the Build 


### For iOS:

yarn debugIos

### For Android:

yarn debugAndroid

Your project is now ready for development!

