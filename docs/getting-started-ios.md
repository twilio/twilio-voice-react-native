# Getting Started on iOS

Please check out the following if you are new to Twilio's Programmable Voice or React Native.

- [Programmable Voice](https://www.twilio.com/docs/voice/sdks)
- [React Native](https://reactnative.dev/docs/getting-started)

When following the React Native environment setup guide, please ensure that "React Native CLI" is selected.

## iOS

Please note that the Twilio Voice React Native SDK is tightly integrated with the iOS CallKit framework. This provides the best call and audio experience, and requires the application to be run on a physical device. The SDK will not work on an iOS simulator.

Firstly, create a Bundle Identifier (Bundle ID) through the Apple Developer Portal. Then, create a Provisioning Profile for that Bundle ID and add physical devices to that profile. Those devices will also need to be registered to the developer account.

For incoming call push notifications, create a VoIP certificate through the Apple Developer Portal. Then, use the VoIP certificate to create a Push Credential in the Twilio Console. This Push Credential will be used as part of vending access tokens, and will enable a device to receive incoming calls.

For more information on Apple Push Notification Service, please see the Twilio Programmable Voice iOS Quickstart:
https://github.com/twilio/voice-quickstart-ios

### Capabilities

In Xcode, your application will need to define the following capabilities in order to make outgoing calls and receive incoming calls.

- Background Modes
  - Audio, AirPlay, and Picture in Picture
  - Voice over IP

- Push Notifications

## Wrapping Up
Once the above has been implemented in your application, the Twilio Voice React Native SDK is ready for usage on iOS platforms.

### Access Tokens
An Access Token is required to make outgoing calls or receive incoming calls. Please check out this [page](https://www.twilio.com/docs/iam/access-tokens#create-an-access-token-for-voice) for more details on creating Access Tokens.

For more details on access tokens, please see the [iOS](https://github.com/twilio/voice-quickstart-ios) and [Android](https://github.com/twilio/voice-quickstart-android) quickstart for examples.

### Usage
The following example demonstrates how to make and receive calls. You will need to implement your own `getAccessToken()` method.

For more information on the Voice React Native SDK API, refer to the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.md) or see our [Reference App](https://github.com/twilio/twilio-voice-react-native-app).

```ts
import { Voice } from '@twilio/voice-react-native-sdk';

const token = getAccessToken(); // you will need to implement this method for your use case

const voice = new Voice();

// Allow incoming calls
await voice.initializePushRegistry(); // only necessary on ios
await voice.register(token);

// Handle incoming calls
voice.on(Voice.Event.CallInvite, (callInvite) => {
  callInvite.accept();
});

// Make an outgoing call
const call = await voice.connect(token, params);
```
