# Twilio Voice React Native Expo Test App

## Get started

1. Install dependencies

   ```bash
   yarn install
   ```

3. Prebuild the app for the platform(s) you wish to test on

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

## Why do we have post-prebuild Detox patches?

One of the primary benefits of using Expo is that we can prebuild native files. This means that it is reasonable for an Expo codebase to not track any native files at all. Indeed, a fresh Expo project contains no native files until the prebuild step is performed.

In our CI pipelines, it would be ideal to test that our SDK works out-of-the-box with absolutely no native code changes. Therefore, by not tracking any native code in this codebase, we can more closely replicate a fresh out-of-the-box Expo app experience.

But since Detox requires native code changes, we post-prebuild patch the native files with the necessary changes for Detox to work.
