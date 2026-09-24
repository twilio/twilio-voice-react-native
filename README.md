# Twilio Voice React Native SDK
[![NPM](https://img.shields.io/npm/v/%40twilio/voice-react-native-sdk.svg?color=blue)](https://www.npmjs.com/package/%40twilio/voice-react-native-sdk) [![CircleCI](https://dl.circleci.com/status-badge/img/gh/twilio/twilio-voice-react-native/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/twilio/twilio-voice-react-native/tree/main)

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

- [Documentation](https://www.twilio.com/docs/voice/sdks/react-native)
- [API Reference](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md)
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)

Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

## Installation
The package is available through [npm](https://www.npmjs.com/package/@twilio/voice-react-native-sdk).

```sh
yarn add @twilio/voice-react-native-sdk
```

If you are using Expo, install with `npx expo install` instead, so the version is resolved against
your Expo SDK.

```sh
npx expo install @twilio/voice-react-native-sdk
```

Once the package has been installed to your React Native application, there are further steps that you will need to take for both iOS and Android platforms. Please see the supporting documentation below.

## Prerequisites

These apply to every application, Expo and framework-less (bare) alike.

- A Twilio **Push Credential** for each platform you support. Incoming calls do not arrive without
  one. The [iOS](https://github.com/twilio/voice-quickstart-ios) and
  [Android](https://github.com/twilio/voice-quickstart-android) voice quickstarts cover the Apple
  VoIP certificate and the Firebase project these are built from.
- A server that vends
  [access tokens](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice).
- If you support iOS, a physical device to place or receive calls. CallKit and PushKit are
  unavailable in the iOS simulator, though the SDK itself loads and runs there.

## Choosing your setup

One package supports both application types. Which setup steps you follow depends on how your app
is built. The prerequisites above apply either way.

| Your app | What to do |
| --- | --- |
| Expo | Add the config plugin. See [Expo setup](./docs/expo/app-config.md). The plugin applies the native wiring during `expo prebuild` |
| Framework-less (bare) React Native | Wire the native files once by hand. See the Getting Started guides below |

Expo apps require a [development build](https://docs.expo.dev/develop/development-builds/introduction/);
Expo Go is not supported, because this library contains native code that Expo Go does not include.

## Compatibility

| SDK version | Bare React Native | Expo | New Architecture |
| --- | --- | --- | --- |
| 1.8.0 and later | supported | supported, via the config plugin | supported |
| 2.0.0-preview.x | **not supported**, required forking the SDK | supported | supported |
| 1.7.0 and earlier | supported | **not supported** | 1.6.0 and later |

If you are on `2.0.0-preview.x`, see the [migration notes](https://github.com/twilio/twilio-voice-react-native/blob/latest/CHANGELOG.md#migrating-from-200-previewx).

Verified for 1.8.0:

| Configuration | Versions exercised |
| --- | --- |
| Expo SDK | 52, 53, 54, 55, 56, 57 |
| React Native, through those Expo versions | 0.76.9, 0.79.6, 0.81.5, 0.83.10, 0.85.3, 0.86.3 |
| React Native, bare | 0.83.6 |
| Android API level | 24, 31, 34, 36, 37 |
| iOS | 26.6.1 |

`minSdkVersion` remains 24. Versions outside this list are expected to work but are untested.

## Documentation

### Getting Started

> These guides cover framework-less (bare) React Native end to end.
>
> **Using Expo?** The [Prerequisites](#prerequisites) above apply to you too. The config plugin
> handles the rest during `expo prebuild`, so skip the Xcode capabilities, the Google Services
> Gradle changes and the `MainActivity`/`MainApplication` wiring. See
> [Expo setup](./docs/expo/app-config.md).

#### iOS
Learn how to get started for the [iOS platform](/docs/getting-started-ios.md).

#### Android
Learn how to get started for the Android platform if you are using [Java](/docs/getting-started-android-java.md) or [Kotlin](/docs/getting-started-android-kotlin.md).

### Customizing Notifications
To customize the appearance and content of your application's notifications, please see [this](/docs/customize-notifications.md) document.

### Outgoing Call Ringback Tone
To enable your application to play a ringback tone while making an outgoing call, please see [this](/docs/play-outgoing-call-ringback-tone.md) document.

### Out-of-band PushKit Handling
To have your application implement or use its own `PushKit` delegate module, please see [this](/docs/applications-own-pushkit-handler.md) document.

### Out-of-band Firebase Messaging Service
To have your application implement or use a different `FirebaseMessagingService` (such as OneSignal or RNFirebase), please see [this](/docs/out-of-band-firebase-messaging-service.md) document.

## Issues and Support
Please check out our [common issues](/COMMON_ISSUES.md) page or file any issues you find here on Github. For general inquiries related to the Voice SDK you can file a support ticket.

Please ensure that you are not sharing any [Personally Identifiable Information(PII)](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii) or sensitive account information (API keys, credentials, etc.) when reporting an issue.

Please check out our [known issues](/KNOWN_ISSUES.md) for known bugs and workarounds.

## Related
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License
See [LICENSE](/LICENSE)
