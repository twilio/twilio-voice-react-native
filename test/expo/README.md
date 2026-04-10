# Twilio Voice React Native Expo Test App

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

   If you're performing tests for an RC or a release, consider deleting the
   `node_modules/` folder and pulling fresh dependencies.

   Using the following install flags will ensure that there are no issues with
   the lockfile and that CI will cleanly build the RC or release.

   ```bash
   yarn install --immutable --immutable-cache
   ```

2. Prebuild the app for the platform(s) you wish to test on

  ```bash
  yarn run expo prebuild --clean --platform=android
  ```

  ```bash
  yarn run expo prebuild --clean --platform=ios
  ```

  If you want to run the automated e2e tests, you must patch the Detox changes:

  ```bash
  bash detox/scripts/patch-all.bash
  ```

  See the section below on why we do this.

3. Start the bundler

   ```bash
   yarn run start
   ```

4. Open and run the app in Android Studio or Xcode

  ```bash
  studio android/
  ```

  ```bash
  open ios/TwilioVoiceExpoExample.xcworkspace/
  ```

  Note that you may need to expose the bundler to the Android Virtual Device (AVD):

  ```bash
  adb reverse tcp:8081 tcp:8081
  ```

## Tokens

By default, the test app will expect at least two token files in the `test/expo/constants/` folder.

- `test/expo/constants/e2e-tests-token.ts` for the basic call suite

- `test/expo/constants/e2e-preflightTest-token.ts` for the PreflightTest suite

Each file will need to export a token, like so:
```ts
export const token = '...';
```

Optionally, to leverage the built-in Metro bundler feature for platform-specific files, consider having 4 files:

- `test/expo/constants/e2e-tests-token.android.ts`
- `test/expo/constants/e2e-tests-token.ios.ts`
- `test/expo/constants/e2e-preflightTest-token.android.ts`
- `test/expo/constants/e2e-preflightTest-token.ios.ts`

Note that these `token` files contain secrets and should not be committed to the repo. They are already included in the `.gitignore` file.

This way, you can have the Android tokens minted using FCM push credentials and the iOS tokens minted using APNS push credentials and have to do minimal work when switching between platforms.

## Why do we have post-prebuild Detox patches?

One of the primary benefits of using Expo is that we can prebuild native files. This means that it is reasonable for an Expo codebase to not track any native files at all. Indeed, a fresh Expo project contains no native files until the prebuild step is performed.

In our CI pipelines, it would be ideal to test that our SDK works out-of-the-box with absolutely no native code changes. Therefore, by not tracking any native code in this codebase, we can more closely replicate a fresh out-of-the-box Expo app experience.

Since Detox requires native code changes, we post-prebuild patch the native files with the necessary changes for Detox to work.
