# Configuring your Expo app to use this library

The SDK ships an Expo config plugin. Adding it to your app config applies the native
configuration during `expo prebuild`, so there are no native files to edit by hand.

A development build or an EAS build is required. The SDK contains native code and does not
run in Expo Go.

## 1. Add the plugin

In `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["@twilio/voice-react-native-sdk", { "apsEnvironment": "development" }]
    ]
  }
}
```

Plugin options, all optional:

| Option | Default | Purpose |
| --- | --- | --- |
| `apsEnvironment` | `"development"` | iOS `aps-environment` entitlement. Set to `"production"` for production builds. |
| `microphoneUsageDescription` | `"This app uses the microphone for voice calls."` | iOS `NSMicrophoneUsageDescription`. Change this for your use case; it is shown to the user. |
| `googleServicesVersion` | `"4.4.1"` | Version of the Google Services Gradle plugin applied on Android. |

## 2. Android: add your Google Services file

Incoming calls are delivered over FCM, so Android needs a Google Services JSON file from your
Firebase project.

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

For more on Firebase and Push Credentials, see the
[Twilio Programmable Voice Android Quickstart](https://github.com/twilio/voice-quickstart-android#quickstart).

## 3. Prebuild and build

```sh
npx expo prebuild
```

Then create a development build or an EAS build.

## What the plugin applies

You do not need to configure these yourself.

**Android**

- `VoiceApplicationProxy` wiring in `MainApplication` (`onCreate`, `onTerminate`).
- `VoiceActivityProxy` wiring in `MainActivity` (`onCreate`, `onDestroy`, `onNewIntent`),
  including the runtime permission prompts for microphone, Bluetooth and notifications.
- The Google Services Gradle plugin and its classpath.

Required permissions are declared by the library's own manifest and are merged automatically.

**iOS**

- `NSMicrophoneUsageDescription`.
- `UIBackgroundModes` with `audio` and `voip`.
- The `aps-environment` entitlement.

The plugin only edits Kotlin `MainApplication` and `MainActivity` templates, which is what
Expo has generated since SDK 50. Re-running `expo prebuild` is safe; the mods are idempotent.

## Notes

- The SDK is tightly integrated with CallKit on iOS. It requires a physical device and will
  not work on the iOS simulator.
- If you maintain your own `MainApplication` or `MainActivity` outside of prebuild, apply the
  same wiring shown in the [bare React Native Android guide](/docs/getting-started-android-kotlin.md)
  instead of relying on the plugin.
