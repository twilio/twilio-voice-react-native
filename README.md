# Twilio Voice React Native SDK

Twilio's Voice React Native SDK allows you to add real-time voice and PSTN calling to your React Native apps.

Please check out the following if you are new to Twilio's Programmable Voice or React Native. Or contact [help@twilio.com](mailto:help@twilio.com) if you need technical support.

- [Programmable Voice](https://www.twilio.com/docs/voice)
- [React Native](https://reactnative.dev/docs/getting-started)

## Prerequisites

### Incoming Calls

To allow for incoming calls, you need to create a push credential for [Android](https://github.com/twilio/voice-quickstart-android/blob/master/Docs/manage-push-credentials.md) and [iOS](https://github.com/twilio/voice-quickstart-ios#6-create-a-push-credential-with-your-voip-service-certificate). Additionally, for Android, you need to download the `google-services.json` file from the Firebase console and place it under `/app` directory.

### Access Tokens

An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

## Installation

```sh
yarn add @twilio/voice-react-native-sdk
```

## Usage

Please refer to the [API Docs](docs/twilio-voice-react-native.md) for more information. Or try running the [example app](example).

```ts
import { Voice } from '@twilio/voice-react-native-sdk';

const token = getAccessToken();
const voice = new Voice();

// Allow incoming calls
await voice.register(token);

// Make an outgoing call
const call = await voice.connect(token, params);
```

## License

See [LICENSE.md](LICENSE.md)
