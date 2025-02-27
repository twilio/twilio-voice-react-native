# iOS Expo Config Plugin

To properly support iOS in Expo, the SDK needs several permissions to function.
An Expo Config Plugin can be used to add these permissions to the iOS app at the
prebuild phase.

Here is a list of the required permissions and capabilities that the Config
Plugin will have to add to the iOS build:

- Background Modes
  - Audio, AirPlay, and Picture in Picture
  - Voice over IP
- Push Notifications

See this
[guide on Expo Config Plugins](https://docs.expo.dev/config-plugins/introduction/)
for more information.
