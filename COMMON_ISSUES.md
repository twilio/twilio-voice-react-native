# Common Issues

* Expo applications require a development build or an EAS build. The SDK contains native code and cannot run in Expo Go. See [Configuring your Expo app](/docs/expo/app-config.md).

* Running the example app on Android using `yarn run android` may fail if the emulator is still starting up. When this happens, you can re-run the app once the emulator is fully started.

* Please note that the Twilio Voice React Native SDK is tightly integrated with the iOS CallKit framework. This provides the best call and audio experience, and requires the application to be run on a physical device. The SDK will not work on an iOS simulator.
