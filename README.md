# Twilio Voice React Native SDK

[![NPM](https://img.shields.io/npm/v/%40twilio/voice-react-native-sdk.svg?color=blue)](https://www.npmjs.com/package/%40twilio/voice-react-native-sdk)

**_WARNING - PLEASE READ:_**

This is a Pilot release.

That means:
- The SDK and associated open source repo are offered as-is. While we take professional pride in all releases, including Pilots, there may be vulnerabilities or bugs present that we’re not yet aware of. 
- We’ve targeted this release to “power users”; documentation is sparse and code samples non-existent. These will come in later (public) releases.
- Although rare in practice, we reserve the right to introduce breaking API changes in future releases before ultimately going stable/GA.
- We will tear out the embedded example app and replace it with a proper Quickstart in our first public release. As such, we do not plan to invest any time into fixing or enhancing the current example app.
- Traditional Twilio Support channels and resources are not available to help. 
- We welcome your feedback and SDK bug reports (note: non-example app bugs) via the [issues](https://github.com/twilio/twilio-voice-react-native/issues) page.

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

Please check out the following if you are new to Twilio's Programmable Voice or React Native. Also, please checkout our [common issues](COMMON_ISSUES.md) page or contact [help@twilio.com](mailto:help@twilio.com) if you need technical support.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

## Prerequisites

### Incoming Calls

To allow for incoming calls, you need to create a push credential for [Android](https://github.com/twilio/voice-quickstart-android/blob/master/Docs/manage-push-credentials.md) and [iOS](https://github.com/twilio/voice-quickstart-ios#6-create-a-push-credential-with-your-voip-service-certificate). Additionally, for Android, you need to download the `google-services.json` file from the Firebase console and place it under `/app` directory.

### Access Tokens

An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

## Installation

The package is available through [npm](https://www.npmjs.com/package/@twilio/voice-react-native-sdk).

```sh
yarn add @twilio/voice-react-native-sdk
```

## Usage

The following simple example demonstrates how to make and receive calls. You will need to implement your own `getAccessToken()` method for it to work properly. Please see [Access Tokens](#access-tokens) section for more details or check out the [iOS](https://github.com/twilio/voice-quickstart-ios) and [Android](https://github.com/twilio/voice-quickstart-android) quickstart for examples on how to generate the tokens.
For more information on the Voice React Native SDK API, refer to the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/1.0.0-preview.1/docs/voice-react-native-sdk.md) or try running the [example app](example).

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

## License

See [LICENSE](LICENSE)
