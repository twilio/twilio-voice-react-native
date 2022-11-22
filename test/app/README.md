# Twilio Voice React Native Example App

## Prerequisites

- [React Native CLI](https://reactnative.dev/docs/environment-setup)
- [Yarn](https://yarnpkg.com/getting-started)
- Token - Create a file, `e2e-tests-token.ts` under `test/app/src` directory with the following content.
  ```ts
  export const token = 'my-token-goes-here';
  ```

## Setup

1. Clone this repository
  ```sh
  git clone https://github.com/twilio/twilio-voice-react-native.git
  ```
2. Switch to the root directory
  ```sh
  cd twilio-voice-react-native
  ```
3. Install SDK dependencies
  ```sh
  yarn install
  ```
4. Build the constants files for each platform
  ```sh
  yarn run build:constants
  ```
5. Switch to the app directory
  ```sh
  cd test/app
  ```
6. Install app dependencies
  ```sh
  yarn install
  ```
7. Install pods for iOS
  ```sh
  cd ios
  pod install
  ```

## Running the app

Switch to the app directory
```sh
cd test/app
```

Start metro bundler:
```sh
yarn start
```

On a different terminal window, run on Android:
```sh
yarn run android
```

On a different terminal window, run on iOS:
```sh
yarn run ios
```
