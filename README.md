
# React Native Project Setup

This document provides step-by-step instructions to set up the React Native project for other users to get started.

---

## 1. Prerequisites

Ensure the following tools are installed on your system:
- Node.js
- Yarn
- Watchman
- React Native CLI
- Xcode (for iOS development)
- Android Studio (for Android development)

---

## 2. Project Setup Steps

### Step 1: Clone the Repository
```bash
git clone https://github.com/MuhammadShahidRaza/React-Native-Boilerplate.git
cd <project-folder>
```

### Step 2: Copy Required Files and Folders
- Copy the following into the project root:
  - `src` folder
  - `babel.config.js`
  - `commitlint.config.js`
  - `declarations.d.ts`
  - `eslint.config.js`
  - `metro.config.js`
  - `.prettierrc.js`
  - `App.tsx`
  - `.env` files
- Copy the `.husky` folder.
- Copy the `Font` folder unzip that , open the xcode and paste in the project folder.
- Copy the `updateBuildGradle.js` file.

### Step 3: Install Dependencies

#### Main Dependencies:
```bash
yarn add react-native-reanimated react-native-safe-area-context react-native-screens react-native-skeleton-placeholder formik @reduxjs/toolkit i18next react-native-dotenv react-i18next react-native-svg react-native-toast-message react-native-vector-icons react-redux yup react-native-permissions react-native-phone-number-input react-native-image-crop-picker axios @react-navigation/native-stack @react-navigation/native @react-native-async-storage/async-storage @react-native-community/geolocation react-native-linear-gradient @notifee/react-native
```

#### Development Dependencies:
```bash
yarn add -D @commitlint/cli @commitlint/config-conventional @types/react-native-vector-icons @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-plugin-module-resolver eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native globals husky lint-staged metro-react-native-babel-preset react-native-codegen react-native-svg-transformer typescript-eslint
```

### Step 4: Update Project Files

1. **`index.js`**:
   Add the following line:
   ```javascript
   import './src/i18n';
   ```

2. **`android/app/src/main/res/values/strings.xml`**:
   Add any required map keys or other configuration values.

3. **Change App Icons**:
   Use [EasyAppIcon](https://easyappicon.com) to generate and replace the app icons.

4. **`tsconfig.json`**:
   Replace or update with the provided `tsconfig.json` file.

5. **`package.json`**:
   Add these scripts:
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

## 5. Configure iOS

### `Podfile`

- **Before** this line:
  Remove All Above code

  ```ruby
  (platform :ios, min_ios_version_supported)
  prepare_react_native_project!
  ```
 And Add:
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
  
- Add permissions (which required for your app):
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

### `Info.plist`

Add the following:
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

## 6. Final Steps

### Run the Build Gradle Update Script
```bash
node updateBuildGradle.js
```


### Run the Build Gradle Update Script
```bash
npx react-native-asset
```

---

Build the Project

For iOS:

yarn pod && yarn ios

For Android:

yarn debugAndroid

Your project is now ready for development!
