# Using the 2.x Twilio Voice React Native SDK with framework-less (bare) React Native applications

The Twilio Voice React Native SDK out-of-the-box supports only Expo applications as of version `2.0.0-preview.1`. In order to use the Twilio Voice React Native SDK in framework-less (bare) React Native applications, our team has written this guide to help users who wish to fork this repo and modify their fork for usage in a bare RN app.

# Common Changes for supporting both iOS and Android

- Modify `src/common.ts`:

  1. Remove this import:
  ```typescript
  import { requireNativeModule } from 'expo-modules-core';
  ```

  2. Remove the existing exports:
  ```typescript
  export const NativeModule: TwilioVoiceReactNativeType =
    Platform.OS === 'android'
      ? requireNativeModule('TwilioVoiceExpoModule')
      : ReactNative.NativeModules.TwilioVoiceReactNative;

  export const NativeEventEmitter =
    Platform.OS === 'android'
      ? new ReactNative.NativeEventEmitter()
      : new ReactNative.NativeEventEmitter(NativeModule);
  ```

  3. Add the following exports:
  ```typescript
  export const NativeModule: TwilioVoiceReactNativeType =
    ReactNative.NativeModules.TwilioVoiceReactNative;

  export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
    NativeModule
  );
  ```

## Android specific changes

- Remove the `react-native.config.js` file from the root folder of your fork.

- Remove these files from your `android/src/main/java/com/twiliovoicereactnative/` folder:

  ```
  ExpoActivityLifecycleListener.kt
  ExpoApplicationLifecycleListener.kt
  ExpoModule.kt
  ExpoPackage.kt
  ```

- Modify `android/build.gradle`:

  Remove this line from the gradle file.
  ```gradle
  implementation project(':expo-modules-core')
  ```

- Follow the Android getting started guide as usual for Bare RN apps. This includes adding the Google Services gradle plugin into both your root gradle build file, your app gradle build file, and adding the proxies and hooks to your `MainApplication` and `MainActivity`.

- If you see an error similar to:

  ```
  voice_getVersion` is null
  ```

  Please try a gradle build clean to force the RN CLI to autolink the RN SDK package again.

