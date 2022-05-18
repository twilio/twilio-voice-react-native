# twilio-voice-react-native

Twilio Voice React Native SDK

## Installation

```sh
npm install twilio-voice-react-native
```

### Android Installation

* For incoming call, you need to create a push credential. Follow the details [here](https://github.com/twilio/voice-quickstart-android/blob/master/Docs/manage-push-credentials.md) to get started.
* You need to download the file `google-services.json` from the Firebase console and place it under `/app` directory for registration for incoming call to work.

## Building Constants

The following `npm` command will build the constants files for each platform.
This step needs to be done if a constant is changed or added, or if a constant
language-template is changed.

```sh
npm run build:constants
```

## Usage

```js
import { Voice } from "twilio-voice-react-native";

const token = ...;
const voice = new Voice();
await voice.register(token);
const call = await voice.connect(...);
```

## Running the Example App

Please ensure that your development environment is set up properly for React Native.

See this page for more information: [React Native Docs](https://reactnative.dev/docs/0.63/environment-setup).

All dependencies under `React Native Native CLI Quickstart` need to be installed to run the example app.

After cloning this repository, please run `yarn` (see this page for more information [Yarn Getting Started](https://yarnpkg.com/getting-started)) to bootstrap the project.

Then, the example app can be started using `yarn example android` or `yarn example ios`.

## Contributing

See the [contributing guide](CONTRIBUTING.md) to learn how to contribute to the repository and the development workflow.

## License

MIT
