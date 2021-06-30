# twilio-voice-react-native

Twilio Voice React Native SDK

## Installation

```sh
npm install twilio-voice-react-native
```

### Android Installation

* For incoming call, you need to create a push credential. Follow the details [here](https://github.com/twilio/voice-quickstart-android/blob/master/Docs/manage-push-credentials.md) to get started.
* You need to download the file `google-services.json` from the Firebase console and place it under `/app` directory for registration for incoming call to work. 


## Usage

```js
import TwilioVoiceReactNative from "twilio-voice-react-native";

// ...

const result = await TwilioVoiceReactNative.multiply(3, 7);
```

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
