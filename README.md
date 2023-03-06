# Twilio Voice React Native SDK (Beta)

[![NPM](https://img.shields.io/npm/v/%40twilio/voice-react-native-sdk.svg?color=blue)](https://www.npmjs.com/package/%40twilio/voice-react-native-sdk)

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

- [Usage](#usage)
- [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/1.0.0-beta.1/docs/voice-react-native-sdk.md)
- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)

Please check out the following if you are new to Twilio's Programmable Voice or React Native. Also, please checkout our [common issues](COMMON_ISSUES.md) page or contact [help@twilio.com](mailto:help@twilio.com) if you need technical support.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

## Access Tokens

An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

## Installation

The package is available through [npm](https://www.npmjs.com/package/@twilio/voice-react-native-sdk).

```sh
yarn add @twilio/voice-react-native-sdk
```

## Usage

The following example demonstrates how to make and receive calls. You will need to implement your own `getAccessToken()` method for it to work properly. Please see [Access Tokens](#access-tokens) section for more details or check out the [iOS](https://github.com/twilio/voice-quickstart-ios) and [Android](https://github.com/twilio/voice-quickstart-android) quickstart for examples on how to generate the tokens.
For more information on the Voice React Native SDK API, refer to the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/1.0.0-preview.1/docs/voice-react-native-sdk.md) or see our [Reference App](https://github.com/twilio/twilio-voice-react-native-app).

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

## Related

- [Reference App](https://github.com/twilio/twilio-voice-react-native-app)
- [Twilio Voice JS](https://github.com/twilio/twilio-voice.js)
- [Twilio Voice iOS](https://github.com/twilio/voice-quickstart-ios)
- [Twilio Voice Android](https://github.com/twilio/voice-quickstart-android)

## License

See [LICENSE](LICENSE)
