1.0.0-beta.1 (March 10, 2023)
=============================

## Changes
- The integration testing app formerly under `example/` has been renamed/moved to `test/app/`.
- The React Native dependency within the integration testing app has been updated from `0.63.4` to `0.66.5`.

### API Changes
- The `voice.connect` method now has the following function signature
  ```ts
  voice.connect(token: string, options?: Voice.ConnectOptions);

  interface Voice.ConnectOptions {
    contactHandle?: string;
    params?: Record<string, string>;
  }
  ```
  Not passing an options object or leaving any member of the options object undefined will result in those options using default values.
  See the API documentation for descriptions of options [here](https://github.com/twilio/twilio-voice-react-native/blob/1.0.0-beta.1/docs/voice-react-native-sdk.md).

## Features

- The SDK now exports error classes and emits error objects specific to an error code. See the below code snippet for usage.
  ```ts
  import { TwilioErrors } from '@twilio/voice-react-native-sdk';
  // ...
  voice.on(Voice.Event.Error, (error: TwilioErrors.TwilioError) => {
    if (error instanceof TwilioErrors.AuthorizationErrors.AccessTokenInvalid) {
      // Update your UI to reflect an invalid access token.
    }

    // Alternatively, your application logic can use the error code.

    if (error.code === 20101) {
      // Update your UI to reflect an invalid access token.
    }
  });
  ```
  See (TODO LINK TO DOCS) for all error classes.

## Fixes

- Fixed an issue where some types on the `Call` and `Voice` classes were being incorrectly exported. Types and references to `addEventListener` are instead now correctly exported as `addListener`.
- Fixed an issue where available audio devices were sometimes incorrectly emitted and returned by the SDK on Android platforms. This occurs more frequently in development environments when the JS bundle is reloaded, but could happen in production environments as well.
- Fixed a warning that occurred on more recent versions of React Native when the SDK constructed a `NativeEventEmitter`.
- Fixed an issue where devices running Android 12+ encountered crashes when receiving an incoming call or making an outgoing call.

1.0.0-preview.1 (September 1, 2022)
===================================

- This is the initial preview release of Twilio Voice React Native SDK. Please check out the [README](README.md) for more details.
