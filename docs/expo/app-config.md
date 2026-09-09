# Using this library in an Expo app

This library supports Expo through a [config plugin](https://docs.expo.dev/config-plugins/introduction/).
The plugin applies the native wiring the SDK needs during `expo prebuild`, so you do not edit
`MainApplication.kt`, `MainActivity.kt`, `Info.plist` or your entitlements by hand.

The same published package supports both Expo and framework-less (bare) React Native. There is no
separate Expo build and no fork.

## Requirements

- A [development build](https://docs.expo.dev/develop/development-builds/introduction/). **Expo Go
  is not supported**, because this library contains native code that Expo Go does not include.
- Expo SDK 52 or later. Verified on 52, 54, 55, 56 and 57; see the compatibility matrix in the
  README for exactly what was exercised.

## Setup

### 1. Install

```sh
npx expo install @twilio/voice-react-native-sdk
```

### 2. Add the plugin

In `app.json` or `app.config.js`:

```json
{
  "expo": {
    "plugins": ["@twilio/voice-react-native-sdk"]
  }
}
```

### 3. Add your Firebase configuration, for Android

Android push notifications require a Firebase project. Set `android.googleServicesFile` so Expo
installs your `google-services.json` and applies the Google Services Gradle plugin:

```json
{
  "expo": {
    "android": {
      "googleServicesFile": "./google-services.json"
    }
  }
}
```

This is required. Without it, incoming calls will not reach the device.

### 4. Prebuild

```sh
npx expo prebuild --clean
```

Re-run this after changing your app config or after switching branches. Prebuild regenerates the
native projects, so anything you edit inside `android/` or `ios/` by hand is discarded.

## What the plugin does

| Mod | Effect |
| --- | --- |
| `withMainApplication` | Adds a `VoiceApplicationProxy` field, calls `onCreate()` after `super.onCreate()`, and adds an `onTerminate()` override |
| `withMainActivity` | Adds a `VoiceActivityProxy` field with a permission-rationale handler, hooks `onCreate`, and adds `onDestroy` and `onNewIntent` overrides |
| `withInfoPlist` | Sets `NSMicrophoneUsageDescription` and adds `audio` and `voip` to `UIBackgroundModes` |
| `withEntitlementsPlist` | Sets `aps-environment` |

The plugin never overwrites a value you set yourself. `UIBackgroundModes` is merged, not replaced,
and an `NSMicrophoneUsageDescription` or `aps-environment` already present in your app config wins.

## Options

```json
{
  "expo": {
    "plugins": [
      [
        "@twilio/voice-react-native-sdk",
        {
          "apsEnvironment": "production",
          "microphoneUsageDescription": "Acme uses your microphone for calls."
        }
      ]
    ]
  }
}
```

| Option | Default | Purpose |
| --- | --- | --- |
| `apsEnvironment` | `development` | The `aps-environment` entitlement. Set to `production` for release builds |
| `microphoneUsageDescription` | `This app uses the microphone for voice calls.` | The `NSMicrophoneUsageDescription` string shown in the iOS permission prompt |

## If prebuild fails with an override conflict

Android's `MainActivity` and `MainApplication` are generated Kotlin, and Kotlin does not allow two
declarations of the same method. If another config plugin already declares `onNewIntent`,
`onDestroy` or `onTerminate`, this plugin stops with an error naming the method rather than
silently skipping its own wiring.

It fails rather than skipping on purpose. Skipping would produce an app that builds and installs
and then never rings, with nothing in the build output to explain why.

To resolve it, remove this plugin from your `plugins` array and add the wiring by hand. Because
you are then maintaining the native files yourself, also remove `expo prebuild` from your workflow
or move to the [bare workflow](https://docs.expo.dev/bare/overview/). The calls to add are:

```kotlin
// MainApplication.kt
private val voiceApplicationProxy = VoiceApplicationProxy(this)

override fun onCreate() {
  super.onCreate()
  voiceApplicationProxy.onCreate()
  // ... your existing code
}

override fun onTerminate() {
  voiceApplicationProxy.onTerminate()
  super.onTerminate()
}
```

```kotlin
// MainActivity.kt
private val voiceActivityProxy = VoiceActivityProxy(this) { permission ->
  // show your own rationale for the denied permission
}

override fun onCreate(savedInstanceState: Bundle?) {
  super.onCreate(null)
  voiceActivityProxy.onCreate(savedInstanceState)
}

override fun onDestroy() {
  voiceActivityProxy.onDestroy()
  super.onDestroy()
}

override fun onNewIntent(intent: Intent) {
  super.onNewIntent(intent)
  voiceActivityProxy.onNewIntent(intent)
}
```

## Kotlin only

The plugin edits Kotlin, and fails with a clear error on a Java `MainApplication` or
`MainActivity`. Expo templates have been Kotlin since SDK 50.
