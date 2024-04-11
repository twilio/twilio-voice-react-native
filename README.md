# Twilio Voice React Native SDK

[![NPM](https://img.shields.io/npm/v/%40twilio/voice-react-native-sdk.svg?color=blue)](https://www.npmjs.com/package/%40twilio/voice-react-native-sdk) [![CircleCI](https://dl.circleci.com/status-badge/img/gh/twilio/twilio-voice-react-native/tree/main.svg?style=shield)](https://dl.circleci.com/status-badge/redirect/gh/twilio/twilio-voice-react-native/tree/main)

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

- [Documentation](https://www.twilio.com/docs/voice/sdks/react-native)
- [API Reference](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md)
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)

Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

## Issues and Support
Please check out our [common issues](COMMON_ISSUES.md) page or file any issues you find here on Github. For general inquiries related to the Voice SDK you can file a support ticket. Please ensure that you are not sharing any [Personally Identifiable Information(PII)](https://www.twilio.com/docs/glossary/what-is-personally-identifiable-information-pii) or sensitive account information (API keys, credentials, etc.) when reporting an issue.

## Access Tokens

An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

## Installation

The package is available through [npm](https://www.npmjs.com/package/@twilio/voice-react-native-sdk).

```sh
yarn add @twilio/voice-react-native-sdk
```

## Getting Started

Please see this document on getting set up for your target platform: [Getting Started](docs/getting-started.md).

## Usage

The following example demonstrates how to make and receive calls. You will need to implement your own `getAccessToken()` method for it to work properly. Please see [Access Tokens](#access-tokens) section for more details or check out the [iOS](https://github.com/twilio/voice-quickstart-ios) and [Android](https://github.com/twilio/voice-quickstart-android) quickstart for examples on how to generate the tokens.
For more information on the Voice React Native SDK API, refer to the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md) or see our [Reference App](https://github.com/twilio/twilio-voice-react-native-app).

```ts
import { Voice } from '@twilio/voice-react-native-sdk';

const token = getAccessToken();
const voice = new Voice();

// Allow incoming calls
await voice.register(token);

// Handle incoming calls
voice.on('callInvite', (callInvite) => {
  callInvite.accept();
});

// Make an outgoing call
const call = await voice.connect(token, params);
```

### Ringtone

To use a custom ringtone for outgoing calls, please see the documentation located at [docs/play-outgoing-call-ringback-tone.md](./docs/play-outgoing-call-ringback-tone.md).

## Related

- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)
- [Use your application's own iOS PushKit handler](docs/applications-own-pushkit-handler.md)

## Examples

- [Play outgoing call ringback tone](docs/play-outgoing-call-ringback-tone.md)
- [Customize the appearance of notifications](docs/customize-notifications.md)

## License

See [LICENSE](LICENSE)
