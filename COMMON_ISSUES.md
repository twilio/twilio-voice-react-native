# Common Issues

* Expo is supported from 1.8.0 through a config plugin. See [Expo setup](./docs/expo/app-config.md). A [development build](https://docs.expo.dev/develop/development-builds/introduction/) is required; Expo Go is not supported, because this library contains native code that Expo Go does not include.

* Running the example app on Android using `yarn run android` may fail if the emulator is still starting up. When this happens, you can re-run the app once the emulator is fully started.

* Please note that the Twilio Voice React Native SDK is tightly integrated with the iOS CallKit framework. This provides the best call and audio experience, and requires the application to be run on a physical device. The SDK will not work on an iOS simulator.
