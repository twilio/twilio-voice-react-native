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

Once the package has been installed to your React Native application, there are further steps that you will need to take for both iOS and Android platforms. Please see the supporting documentation below.

## Choosing your setup

One package supports both application types. Which setup steps you follow depends on how your app
is built.

| Your app | What to do |
| --- | --- |
| Expo | Add the config plugin. See [Expo setup](./docs/expo/app-config.md) |
| Framework-less (bare) React Native | Wire the native files once by hand. See the Getting Started guides below |

Expo apps require a [development build](https://docs.expo.dev/develop/development-builds/introduction/);
Expo Go is not supported, because this library contains native code that Expo Go does not include.

## Compatibility

| SDK version | Bare React Native | Expo | New Architecture |
| --- | --- | --- | --- |
| 1.8.0 | supported | supported, via the config plugin | supported |
| 2.0.0-preview.x | **not supported**, required forking the SDK | supported | supported |
| 1.7.0 and earlier | supported | not supported | 1.6.0 and later |

Verified for 1.8.0, on Android:

| Configuration | Versions exercised |
| --- | --- |
| Expo SDK | 52, 54, 55, 56, 57 |
| React Native, through those Expo versions | 0.76.9, 0.81.5, 0.83.10, 0.85.3, 0.86.3 |
| React Native, bare | 0.83.6 |
| Android API level | 31, 33, 34, 36, 37 |

`minSdkVersion` remains 24. Expo 53 was not exercised. Versions outside this list are expected to
work but are untested.

On iOS, 1.8.0 updates the native Twilio Voice iOS SDK and fixes three defects in audio device
selection and `Voice.connect` error handling; see [CHANGELOG.md](./CHANGELOG.md). The Expo config
plugin's iOS mods and outgoing calls were exercised on physical hardware. Incoming calls and
registration were not: both need a PushKit VoIP token, which requires an `aps-environment`
entitlement the test signing identity could not issue.

The 2.x preview line is discontinued. It made Expo work by replacing the Android binding, which
removed bare React Native support. 1.8.0 delivers the same Expo support additively, so bare
applications upgrade with no code change and Expo applications add one plugin entry.

If you are on `2.0.0-preview.x`, see the migration notes in [CHANGELOG.md](./CHANGELOG.md).

## 1.x Documentation

### Getting Started

#### iOS
Learn how to get started for the [iOS platform](/docs/getting-started-ios.md).

#### Android
Learn how to get started for the Android platform if you are using [Java](/docs/getting-started-android-java.md) or [Kotlin](/docs/getting-started-android-kotlin.md).

### Migration Guide
If you are migrating from a version of the Twilio Voice React Native SDK `< 1.0.0.beta.4` to a version `>= 1.0.0.beta.4`, please see [this](/docs/migration-guide-beta.4.md) document.

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
