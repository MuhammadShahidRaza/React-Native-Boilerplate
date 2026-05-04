# React Native Boilerplate

A production-oriented **React Native 0.85** starter with navigation, Redux, i18n, Firebase, maps, Stripe, sockets, and shared scripts for Android/iOS builds.

Pick **one** path below: start from this repo, or fold the boilerplate into a project you already have.

---

## Prerequisites

| Tool | Notes |
|------|--------|
| **Node.js** | **≥ 22.11** (see `package.json` → `engines`) |
| **Yarn** | Package manager used by this repo |
| **Watchman** | Recommended on macOS for Metro |
| **Xcode** | iOS builds and Simulator |
| **Android Studio** | Android SDK, emulator, and JDK as required by RN 0.85 |
| **Ruby + Bundler** | iOS: `cd ios && bundle install` then `bundle exec pod install` |

Official environment help: [React Native – Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment).

---

## Choose your setup

### Option A — Use this repo as your app (recommended)

Best when you want a **new app** or are happy to start from this folder structure.

1. **Clone**

   ```bash
   git clone https://github.com/MuhammadShahidRaza/React-Native-Boilerplate.git
   cd React-Native-Boilerplate
   ```

2. **Install JavaScript dependencies**

   ```bash
   yarn
   ```

3. **Environment files**

   - Copy `.env.development` and adjust values for your API, maps, Stripe, OAuth, etc.
   - Add **`.env.production`** and **`.env.staging`** locally if you use those modes (they are gitignored).  
   - Env is loaded via `react-native-dotenv` and **`APP_ENV`** (see `babel.config.js`). Do **not** commit real secrets.

4. **iOS — CocoaPods**

   ```bash
   cd ios && bundle install && bundle exec pod install && cd ..
   ```

5. **Run**

   - Metro: `yarn start`
   - Android: `yarn android` (device/emulator with USB debugging or emulator running)
   - iOS: `yarn ios` or `yarn debugIos` (runs pod install then iOS)

6. **Optional — branding**

   - Rename the app: `yarn rename-app` (see `scripts/rename-app.js` for behavior).
   - Replace icons: `yarn replace-icons` (see `scripts/replace-app-icons.js`).

7. **More copy-paste setup** (scripts, Podfile, `Info.plist`) — see [Appendix](#appendix-copy-paste-setup-for-new--merged-projects) below.

---

### Option B — Merge into an existing React Native project

Use this when you already have an RN app and want **this boilerplate’s `src`, tooling, and patterns**.

1. **Copy** into your project root (adjust paths as needed):

   - `src/`
   - `scripts/`
   - Config: `babel.config.js`, `commitlint.config.js`, `declarations.d.ts`, `eslint.config.js`, `metro.config.js`, `.prettierrc.js`
   - `App.tsx`, `index.js` patterns, `app.json` / native names as required
   - `.husky/`
   - **Env**: start from `.env.development` and create `.env.production` / `.env.staging` locally

2. **Dependencies**  
   Do **not** paste outdated one-line `yarn add` lists. Instead, **merge** the `dependencies` and `devDependencies` from this repo’s `package.json` into yours, resolve version conflicts, then run:

   ```bash
   yarn
   ```

3. **Entry file**  
   At the **top** of your `index.js` (before other app imports):

   ```javascript
   import 'react-native-get-random-values';
   import './src/i18n';
   ```

4. **iOS**

   - Align your **Podfile** and **Info.plist** with this repo. For ready-made snippets (Ruby helpers, `setup_permissions`, font entries), use the [Appendix](#appendix-copy-paste-setup-for-new--merged-projects) below, then compare with **`ios/Podfile`** here for Firebase, Maps, and New Architecture settings.
   - Run: `cd ios && bundle install && bundle exec pod install`

5. **Android**

   - Merge Gradle settings as needed; if this repo includes helper scripts (e.g. `scripts/updateBuildGradle.js`), run them only after reviewing what they change.

6. **Assets**

   ```bash
   npx react-native-asset
   ```

7. **Fonts**  
   Add custom fonts to the native projects (Android `fonts` / iOS target membership) and list them under **UIAppFonts** on iOS.

---

## Environment variables (overview)

Variables are read through **`@env`** (see `babel.config.js`). Typical keys (placeholders only—set real values locally):

| Area | Example keys |
|------|----------------|
| API | `API_BASE_URL`, `SOCKET_BASE_URL`, `IMAGE_URL` |
| Stripe | `PUBLISHABLE_STRIPE_KEY` |
| Google / Apple sign-in | `WEB_CLIENT_ID`, `IOS_CLIENT_ID`, `ANDROID_CLIENT_ID`, Apple-related `APPLE_*` |
| Maps | `MAP_API_KEY`, `ANDROID_MAP_KEYS`, `IOS_MAP_KEYS`, `MAP_KEYS` |
| Feature flags | `IS_ALPHA_PHASE`, `OFFLINE_ACCESS` |
| Other | Zendesk channels, etc. |

Keep **`google-services.json`**, **`GoogleService-Info.plist`**, keystores, and API secrets **out of git**; use your team’s secure storage.

---

## Useful scripts

| Command | Purpose |
|---------|---------|
| `yarn start` | Metro bundler |
| `yarn android` | Run on Android device/emulator |
| `yarn ios` | Run on iOS Simulator / device |
| `yarn debugIos` | `pod install` + iOS run |
| `yarn pod` | `bundle exec pod install` in `ios/` |
| `yarn lint` / `yarn format` | ESLint / Prettier (`src/`) |
| `yarn test` | Jest |
| `yarn build` / `yarn build:fast` | Android release APK (see scripts for version bump behavior) |
| `yarn aab` | Android App Bundle |
| `yarn signing` | Android signing report |
| `yarn rename-app` / `yarn replace-icons` | App name and icon tooling |

Full list: see **`package.json` → `scripts`**.

---

## Appendix: copy-paste setup for new / merged projects

Use this when you want **concrete blocks** to drop into a fresh or existing React Native app. Always reconcile with the files in **this repository** (`package.json`, `ios/Podfile`) for the latest behavior.

### `package.json` — scripts and `lint-staged`

Merge into your `package.json` (avoid duplicate keys). If you use Bundler for CocoaPods, keep **`bundle exec pod install`** in `pod` / `debugIos` as below.

```json
"scripts": {
  "build": "cd android && ./gradlew clean && ./gradlew assembleRelease",
  "aab": "cd android && ./gradlew clean && ./gradlew bundleRelease",
  "debugAndroid": "cd android && ./gradlew clean && cd .. && yarn android",
  "debugIos": "cd ios && bundle exec pod install && cd .. && yarn ios",
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
  "bundle": "cd android && ./gradlew bundleRelease && yarn open-bundle",
  "ios": "react-native run-ios",
  "pod": "cd ios && bundle exec pod install && cd ..",
  "pod:reset": "cd ios && pod deintegrate && pod setup && bundle exec pod install && cd ..",
  "ios:clean": "cd ios && rm -rf ~/Library/Caches/CocoaPods && rm -rf Pods && rm -rf ~/Library/Developer/Xcode/DerivedData/* && yarn pod",
  "ios:debug": "yarn pod && yarn ios",
  "ios:bundle:assets": "react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios"
},
"lint-staged": {
  "./src/**/*.{js,jsx,ts,tsx}": [
    "yarn format",
    "yarn lint"
  ]
}
```

**Note:** The boilerplate in this repo also ships **extra** scripts (version bumps, `build:fast`, `aab`, `rename-app`, `replace-icons`, `patch-package` postinstall, etc.). For a **1:1** match, merge from this repo’s **`package.json`** instead of only the block above.

### iOS — update the `Podfile`

- **Before** this line:

  ```ruby
  (platform :ios, min_ios_version_supported)
  prepare_react_native_project!
  ```

  Add the following so Ruby can resolve React Native and **react-native-permissions** scripts:

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

  Declare the permissions your app needs (remove entries you do not use):

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

Then open **`ios/Podfile`** in this repository and align **Maps**, **Firebase**, **`pre_install`**, **`use_frameworks!`**, and **`ENV['RCT_NEW_ARCH_ENABLED']`** if you use the same stack.

### iOS — `Info.plist`

Add or adjust keys in **`ios/<YourApp>/Info.plist`**. Customize the location string for your product:

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

### Optional — Gradle helper

If you copied **`scripts/updateBuildGradle.js`**, run it only after you understand what it changes:

```bash
node scripts/updateBuildGradle.js
```

---

## Docs and quality

- **Testing & performance** (FlatList, Jest paths, etc.): [TESTING_GUIDE_DETAILED.md](./TESTING_GUIDE_DETAILED.md)
- **User interface (mockups & design reference)**: [docs/ui-reference/README.md](./docs/ui-reference/README.md) — rides, parcels, food, activity, and cart flows with screenshots
- **Git hooks**: Husky + lint-staged run on staged files; commit messages use Commitlint (conventional commits).

---

## Troubleshooting (short)

| Issue | What to try |
|-------|-------------|
| Metro cache | `yarn start --reset-cache` |
| Android can’t reach Metro | `yarn reverse` (or `adb reverse tcp:8081 tcp:8081`) |
| iOS pod errors | `yarn pod:reset` or clean DerivedData + `yarn pod` |
| Wrong env loaded | Set **`APP_ENV`** / use the correct `.env.*` file for your build |
| Node version errors | Use Node **≥ 22.11** as in `engines` |
| Android `computools_react-native-dynamic-app-icon` Kotlin errors (`currentActivity`, etc.) | This repo includes **`patches/@computools+react-native-dynamic-app-icon+1.0.1.patch`** (applied by `patch-package` on `yarn install`). Clean Android: `cd android && ./gradlew clean`. |

---

## Classic integration guide (original boilerplate checklist)

Same content as the historical “React Native Project Setup Guide”; use together with **Option A / B** and the **Appendix** above so nothing is missed when merging into another repo.

### Prerequisites (links)

- **Node.js** – [Download Node.js](https://nodejs.org/)
- **Yarn** – [Install Yarn](https://yarnpkg.com/getting-started/install)
- **Watchman** – [Install Watchman](https://facebook.github.io/watchman/docs/install)
- **React Native CLI / environment** – [Set up your environment](https://reactnative.dev/docs/set-up-your-environment)
- **Xcode** – [App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12) (iOS)
- **Android Studio** – [Android Studio](https://developer.android.com/studio) (Android)

### Clone

```bash
git clone https://github.com/MuhammadShahidRaza/React-Native-Boilerplate.git
cd <project-folder>
```

### Copy into an existing project (file / folder list)

Copy into the **root** of the target app:

- `src` folder  
- `scripts` folder  
- `babel.config.js`, `commitlint.config.js`, `declarations.d.ts`, `eslint.config.js`, `metro.config.js`, `.prettierrc.js`  
- `App.tsx`  
- `.env` files (and add `.env.production` / `.env.staging` locally as needed)  
- `.husky` folder  
- **Font** folder (unzip; add fonts in Xcode / Android as required)

### Optional: one-line dependency installs (reference only)

Prefer merging this repo’s **`package.json`** and running **`yarn`**. If you need the old one-liners for comparison:

**Main (example — versions will drift):**

```bash
yarn add react-native-reanimated react-native-safe-area-context react-native-screens react-native-skeleton-placeholder formik @reduxjs/toolkit i18next react-native-dotenv react-i18next react-native-svg react-native-toast-message react-native-vector-icons react-redux yup react-native-permissions react-native-phone-number-input react-native-image-crop-picker axios @react-navigation/native-stack @react-navigation/native @react-native-async-storage/async-storage @react-native-community/geolocation react-native-linear-gradient @notifee/react-native
```

**Dev (example):**

```bash
yarn add -D @commitlint/cli @commitlint/config-conventional @types/react-native-vector-icons @typescript-eslint/eslint-plugin @typescript-eslint/parser babel-plugin-module-resolver eslint-config-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-native globals husky lint-staged metro-react-native-babel-preset react-native-codegen react-native-svg-transformer typescript-eslint
```

### Update project files (classic steps)

1. **`index.js`** — at the top (before other app imports):

   ```javascript
   import 'react-native-get-random-values';
   import './src/i18n';
   ```

2. **`android/app/src/main/res/values/strings.xml`** — add map keys and other native strings as required.

3. **App icons** — e.g. [EasyAppIcon](https://easyappicon.com) to generate assets.

4. **`tsconfig.json`** — align with this repo’s TypeScript config.

5. **`package.json` scripts** — use the **Appendix** block in this README, or copy the full **`scripts`** section from this repo’s `package.json`.

### iOS: Podfile & `Info.plist`

Full **Ruby `node_require`**, **`setup_permissions`**, and **`UIAppFonts` / location usage** snippets are in the [Appendix](#appendix-copy-paste-setup-for-new--merged-projects). Match **`ios/Podfile`** in this repo for Firebase, Maps, New Architecture, and `pre_install` when applicable.

### Final native steps

```bash
node scripts/updateBuildGradle.js
```

(Review what the script changes before running.)

```bash
npx react-native-asset
```

Run the app:

```bash
yarn debugIos
# or
yarn debugAndroid
```

---

## License / support

Use and adapt this boilerplate for your product. For bugs or improvements, open an issue or PR on the GitHub repository.
