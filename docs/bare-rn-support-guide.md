# Using the Twilio Voice React Native SDK (v2.x) with Bare React Native Applications

As of version `2.0.0-preview.1`, the Twilio Voice React Native SDK officially supports **Expo** applications out of the box. If you're building a **framework-less (bare) React Native** application, some additional steps are required.

This guide walks through the changes needed to fork the SDK and adapt it for use in a bare React Native application on **both iOS and Android**.

## Common Changes (iOS and Android)

### Update `src/common.ts`

1. **Remove Expo dependency import**

  Delete the following line:

  ```typescript
  import { requireNativeModule } from 'expo-modules-core';
  ```

2. **Remove the existing exports**

  Remove this code block:

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

3. **Add bare React Native-compatible exports**

  Replace the removed code block with the following:

  ```typescript
  export const NativeModule: TwilioVoiceReactNativeType =
    ReactNative.NativeModules.TwilioVoiceReactNative;

  export const NativeEventEmitter = new ReactNative.NativeEventEmitter(
    NativeModule
  );
  ```

## Android-Specific changes

### Remove Expo-related configuration and modules

- Delete the `react-native.config.js` file from the root of your fork.

- Remove the following files from the `android/src/main/java/com/twiliovoicereactnative/` folder:

  ```
  ExpoActivityLifecycleListener.kt
  ExpoApplicationLifecycleListener.kt
  ExpoModule.kt
  ExpoPackage.kt
  ```
### Upgrade Gradle dependencies

- Edit the `android/build.gradle` file and remove this line:

  ```gradle
  implementation project(':expo-modules-core')
  ```

### Complete Bare React Native Android setup

Follow the standard Android setup steps for using the Twilio Voice React Native SDK in a **bare React Native app**, including:

- Adding the Google Services Gradle plugin to:
  - The root `build.gradle`.
  - The app `build.gradle`.

- Wiring required hooks and proxies into the following classes:
  - `MainApplication`
  - `MainActivity`

### Troubleshooting

If you encounter an error similar to:

```
voice_getVersion` is null
```

Run a clean task to force the React Native CLI to re-autolink the package:

```
cd android
./gradlew clean
```

Then rebuild the app.

---

With these changes applied, the Twilio Voice React Native SDK should function correctly in a bare React Native application on both iOS and Android.
