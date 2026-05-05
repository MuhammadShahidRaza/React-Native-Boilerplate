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

## Before you run: avoid these mistakes

Most broken builds and “Firebase works on my machine” issues come from **skipping or mixing up native config**. Read this block once before `yarn android` / `yarn ios`.

### Firebase — use **your** app’s files (not the template’s)

1. In the [Firebase Console](https://console.firebase.google.com/), open **your** project and register apps that match **your** Android `applicationId` and **iOS bundle identifier**.
2. Download and place **your own** config files (do **not** reuse another team’s JSON/plist or assume the repo’s placeholders are valid for production):

   | Platform | File | Typical path in this repo |
   |----------|------|---------------------------|
   | Android | `google-services.json` | `android/app/google-services.json` |
   | iOS | `GoogleService-Info.plist` | `ios/<YourTargetFolder>/GoogleService-Info.plist` (e.g. `ios/snlift/` until you rename) |

3. If you **do not** use the same Firebase project as whoever maintained the boilerplate, **replace** any bundled or example plist/JSON — wrong `GOOGLE_APP_ID` / bundle ID pairs cause cryptic native errors.
4. After **`yarn rename-app`** or any change to package name / bundle ID, download **fresh** `google-services.json` and `GoogleService-Info.plist` from Firebase again.
5. **Never commit** real Firebase keys or keystores. The repo’s **`.gitignore`** documents which paths stay local; keep secrets in your password manager / CI secrets.

### Env and URLs

- Fill **`.env.development`** (and `.env.production` / `.env.staging` locally if you use them) with **your** API URLs, map keys, Stripe publishable keys, OAuth client IDs, etc. Template values are not your backend.
- **`Info.plist`** may contain **example** URL schemes or IDs for Google Sign-In — replace with **your** OAuth client configuration when you wire auth.

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
   - **Firebase:** add **your** `google-services.json` and `GoogleService-Info.plist` — see [Before you run: avoid these mistakes](#before-you-run-avoid-these-mistakes) (users often skip this and hit native errors).

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

Keep **`google-services.json`**, **`GoogleService-Info.plist`**, keystores, and API secrets **out of git**; use your team’s secure storage. For paths and the usual copy-paste errors, see **[Before you run: avoid these mistakes](#before-you-run-avoid-these-mistakes)** above.

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

Use this when you want **concrete blocks** to drop into a fresh or existing React Native app. The snippets below mirror **`package.json`**, **`ios/Podfile`**, and **`ios/snlift/Info.plist`** in **this** repository; if anything drifts, those files are the source of truth.

### `package.json` — scripts and `lint-staged`

Merge into your `package.json` (avoid duplicate keys). CocoaPods here expects **`bundle exec pod install`** in `pod` / `debugIos`. **`postinstall`** runs **`patch-package`** (see **`patches/`**).

```json
"scripts": {
  "build": "yarn version:bump:patch && cd android && ./gradlew assembleRelease && cd .. && yarn open-apk",
  "build:fast": "cd android && ./gradlew assembleRelease -PreactNativeArchitectures=arm64-v8a && cd .. && yarn open-apk",
  "build:clean": "cd android && ./gradlew clean && ./gradlew assembleRelease && cd .. && yarn open-apk",
  "version:bump:patch": "node scripts/bump-version.js patch",
  "version:bump:minor": "node scripts/bump-version.js minor",
  "version:bump:major": "node scripts/bump-version.js major",
  "release:android": "yarn version:bump:patch && yarn build",
  "release:android:aab": "yarn version:bump:patch && yarn aab",
  "release:ios": "yarn version:bump:patch",
  "aab": "yarn version:bump:patch && cd android && ./gradlew bundleRelease && cd .. && yarn open-bundle",
  "aab:clean": "cd android && ./gradlew clean && ./gradlew bundleRelease && cd ..",
  "debugAndroid": "yarn android",
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
  "bundle": "yarn version:bump:patch && cd android && ./gradlew bundleRelease && cd .. && yarn open-bundle",
  "ios": "react-native run-ios",
  "pod": "cd ios && bundle exec pod install && cd ..",
  "pod:reset": "cd ios && pod deintegrate && pod setup && bundle exec pod install && cd ..",
  "ios:clean": "cd ios && rm -rf ~/Library/Caches/CocoaPods && rm -rf Pods && rm -rf ~/Library/Developer/Xcode/DerivedData/* && yarn pod",
  "ios:debug": "yarn pod && yarn ios",
  "ios:bundle:assets": "react-native bundle --entry-file index.js --platform ios --dev false --bundle-output ios/main.jsbundle --assets-dest ios",
  "postinstall": "patch-package",
  "rename-app": "node scripts/rename-app.js",
  "replace-icons": "node scripts/replace-app-icons.js"
},
"lint-staged": {
  "./src/**/*.{js,jsx,ts,tsx}": [
    "yarn format",
    "yarn lint"
  ]
}
```

### iOS — update the `Podfile`

- **Before** `platform :ios, min_ios_version_supported` and `prepare_react_native_project!`, add **`node_require`** and load React Native plus **react-native-permissions** (same as **`ios/Podfile`** here):

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

- This repo sets **`ENV['RCT_NEW_ARCH_ENABLED'] = '1'`** before the platform line (New Architecture on).

- **After** `prepare_react_native_project!`, declare permissions. **This repository** currently enables the subset below; uncomment or add handlers from [react-native-permissions](https://github.com/zoontek/react-native-permissions) as needed:

  ```ruby
  setup_permissions([
      # 'AppTrackingTransparency',
      # 'Bluetooth',
      # 'Calendars',
      # 'CalendarsWriteOnly',
      'Camera',
      # 'Contacts',
      # 'FaceID',
      # 'LocationAccuracy',
      'LocationAlways',
      'LocationWhenInUse',
      'MediaLibrary',
      # 'Microphone',
      # 'Motion',
      'Notifications',
      'PhotoLibrary',
      # 'PhotoLibraryAddOnly',
      # 'Reminders',
      # 'Siri',
      # 'SpeechRecognition',
      # 'StoreKit',
  ])
  ```

- **Also aligned in this repo’s `Podfile`:** `pre_install` forces **RNFB** pods to **static libraries** (Firebase + New Arch / `use_frameworks`), **`pod 'react-native-maps/Google'`**, **`use_frameworks! :linkage => :static`** when `USE_FRAMEWORKS` is unset, **`$RNFirebaseAsStaticFramework = true`**, and **`post_install`** patches Stripe’s **`StripeSwiftInterop.h`** for newer Xcode, sets **`CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES`**, **`EXCLUDED_ARCHS[sdk=iphonesimulator*]=x86_64`**, and **`fmt`** to **C++17**. Copy those blocks only if your stack matches.

### iOS — `Info.plist`

Add or adjust keys in **`ios/snlift/Info.plist`** (rename the folder when you rename the app). Strings below match **this** project; tailor copy for your product.

```xml
<key>NSAppleMusicUsageDescription</key>
<string>$(PRODUCT_NAME) requires access to your music library to enhance your experience with music features.</string>
<key>NSCameraUsageDescription</key>
<string>$(PRODUCT_NAME) needs access to your camera to allow you to capture and upload photo.</string>
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) requires access to your location to provide location-based services even when the app is in the background.</string>
<key>NSLocationWhenInUseUsageDescription</key>
<string>$(PRODUCT_NAME) needs your location to show nearby restaurants, hotels.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>$(PRODUCT_NAME) requires access to your photo library to allow you to select and upload photo.</string>
<key>RCTNewArchEnabled</key>
<true/>
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
    <string>PoppinsBold.ttf</string>
    <string>PoppinsMedium.ttf</string>
    <string>PoppinsRegular.ttf</string>
    <string>PoppinsSemiBold.ttf</string>
</array>
```

The checked-in plist also includes **alternate app icons** (`CFBundleIcons` / `UIApplicationSupportsAlternateIcons`), **Google URL schemes**, **Firebase Crashlytics** collection flag, **ATS**, and **background modes** (`fetch`, `remote-notification`); open **`ios/snlift/Info.plist`** for the full file.

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
| Firebase / wrong bundle ID / “Default FirebaseApp is not configured” | Use **your** `google-services.json` + `GoogleService-Info.plist`; match package name / bundle ID to Firebase; see [Before you run: avoid these mistakes](#before-you-run-avoid-these-mistakes) |
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
- `patches` folder (so **`patch-package`** applies; e.g. **`@computools/react-native-dynamic-app-icon`**)  
- `babel.config.js`, `commitlint.config.js`, `declarations.d.ts`, `eslint.config.js`, `metro.config.js`, `.prettierrc.js`  
- `App.tsx`  
- `.env` files (and add `.env.production` / `.env.staging` locally as needed)  
- `.husky` folder  
- **Font** folder (unzip; add fonts in Xcode / Android as required)

### Dependencies

Do **not** rely on stale one-line `yarn add` lists. Merge this repository’s **`dependencies`** and **`devDependencies`** from **`package.json`**, keep **`engines.node`** (currently **≥ 22.11**), then run **`yarn`** so versions and native modules stay consistent.

### Update project files (classic steps)

1. **`index.js`** — at the top (before other app imports):

   ```javascript
   import 'react-native-get-random-values';
   import './src/i18n';
   ```

2. **`android/app/src/main/res/values/strings.xml`** — add map keys and other native strings as required.

3. **App icons** — e.g. [EasyAppIcon](https://easyappicon.com) to generate assets.

4. **`tsconfig.json`** — align with this repo’s TypeScript config.

5. **`package.json` scripts** — use the **Appendix** block in this README, or copy the full **`scripts`** / **`lint-staged`** / **`postinstall`** sections from this repo’s **`package.json`**.

### iOS: Podfile & `Info.plist`

Full **`node_require`**, **`setup_permissions`**, **New Architecture**, **Maps / Firebase / Stripe `post_install`**, and **`Info.plist`** snippets are in the [Appendix](#appendix-copy-paste-setup-for-new--merged-projects). Compare your **`ios/<App>/Info.plist`** with **`ios/snlift/Info.plist`** here (URL schemes, background modes, alternate icons, etc.).

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
