# Twilio Voice React Native SDK End to End Testing

## Prerequisites

You will need to install `applesimutils` and `detox-cli`

```
brew tap wix/brew
brew install applesimutils
npm install -g detox-cli
```

## Local credentials

```
  // to be added later
```


Before running the tests, you should run this project.

For testing on Android, if you are running this service on your localhost, don't forget to call `reverseTcpPort` function every time the emulator device booted up, otherwise this service won't be reachable from Android Emulator.

```ts
beforeAll(async () => {
    await device.launchApp();
    await device.reverseTcpPort(7000);
});
```

# iOS

Before testing, a test binary should be build by running:

```
yarn build:test:ios

# or

detox build -c ios
```

And to run the tests:

```
yarn test:ios

# or

detox test -c ios
```

By default, this will run the emulator specified in `.detoxrc.json`, but **it won't be visible**.
If you want to see the device, open `Simulator` app manually before running test.

# Android

Before testing, a test binary should be build by running:

```
yarn build:test:android

# or

detox build -c android
```

And to run the tests:

```
yarn test:android

# or

detox test -c android
```

By default, this will run the emulator specified in `.detoxrc.json`, but **it won't be visible**.
If you want to see the device, open `Simulator` app manually before running test.

For Android Emulators, it is advised to use AOSP images rather than Google ones. https://github.com/wix/Detox/blob/master/docs/Introduction.AndroidDevEnv.md#android-aosp-emulators

# Parametrized test running

```
  // to be added later
```

