1.0.0-beta.5 (In Progress)
==========================

Twilio Voice React Native SDK has now reached milestone `beta.5`. Included in this version are the following.

## Changes

- Fixed and improved the docstrings for the `Voice` and `Call` listeners. The descriptions of the events and listeners should now point to the correct docstrings.
- The API for `call.getInitialConnectedTimestamp()` has now changed.
  Please see the API documentation [here](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.call_class.getinitialconnectedtimestamp_method.md) for details.
  The method `call.getInitialConnectedTimestamp()` now returns a `Date` object.
  ```ts
  const call = voice.connect(...);
  const date = call.getInitialConnectedTimestamp();
  const millisecondsSinceEpoch = date.getTime();
  ```

## Fixes

### Platform Specific Features

#### Android
- Call timestamp now in RFC-822 format, not stored as a double from epoch

#### iOS
- The call connected timestamp is now in RFC-822 format.
- A new method `CallInvite.updateCallerHandle()` has been added. Use this method to update the caller's name displayed in the iOS system incoming call UI. This method is specific to iOS and unavailable in Android.

1.0.0-beta.4 (Jan 11, 2024)
===========================

Twilio Voice React Native SDK has now reached milestone `beta.4`. Included in this version are the following.

## Fixes

### Platform Specific Features

#### JS
- Fixed an issue with exported types. Typescript language server hinting should now properly prioritize the narrower, more helpful, event-emitter types.
- Narrowed the `CustomParameters` type to `Record<string, string>` instead of `Record<string, any>`.
- Fixed inconsistency with `AudioDevice` typings, preferring `undefined` over `null` for optional values.
- Fixed an issue with `call.isMuted()` and `call.isOnHold()` APIs. They should now always return `boolean | undefined` instead of potentially returning `null`.
- Fixed an issue with `call.getFrom()`, `call.getTo()`, and `call.getSid()` APIs. They should now always return `string | undefined` instead of potentially returning `null`.

#### iOS
- Fixed a bug where the call invite results in a rejected event when the call is hung up by the caller.
- Fixed a bug where the `registered` and `unregistered` events are not fired on iOS.
- Fixed an issue where timestamps emitted by the iOS layer were in the wrong units (seconds instead of milliseconds).

#### Android
- Replace frontline notification images with generic phone images
- In call notifications now display when accepting a call from JS application
- Audio routing for incoming and outgoing calls are now correctly routed
- Internal simplification of call accepted/rejected intent message paths
- Refactored internals & added permissions for Bluetooth and notifications. *Please Note that these changes require changes to the application integrating the SDK. For more information, please refer to the [Beta.4 migration guide](docs/migration-guide-beta.4.md).*


1.0.0-beta.3 (August 26, 2023)
==============================

Twilio Voice React Native SDK has now reached milestone `beta.3`. Included in this version are the following.

## Features

- Added documentation about outgoing call ringback tones.
- Added more call info persistance. The native layers will now persist call state and initial connected timestamps.

### Platform Specific Features

#### iOS
- Applications can now choose to use their own iOS PushKit implementation or delegate the incoming call handling to the SDK's default handler by calling the `Voice.initializePushRegistry()` method, referred henceforth as the "SDK PushKit handler".

  Note that when not using the "SDK PushKit handler", applications will need to notify the SDK upon receiving PushKit device token updates so the SDK can perform registration properly. Applications will also need to notify the SDK upon receiving push notifications so the SDK can report incoming calls to the iOS CallKit framework properly. See [docs/applications-own-pushkit-handler.md](docs/applications-own-pushkit-handler.md) for more details.

#### Android
- Incoming call notifications can now be tapped to bring the application into the foreground.
- Tapping on an incoming call notification will emit an event.
  See `Voice.Event.CallInviteNotificationTapped` for more information.
- Use latest versions of Twilio Voice Android SDK and the Audioswitch libraries.

## Fixes

### Platform Specific Fixes

#### iOS
- Fixed a bug where switching from Bluetooth to the iOS earpiece during a call does not have any effect or error.
- Fixed an issue where audio device types were incorrectly labeled using capitalized descriptions. I.e. `Earpiece` instead of `earpiece`.
- Fixed return value of `Call.mute` and `Call.hold` to return the new mute/hold value. Thanks to our community (@treycucco with PR #164) for this addition!

#### Android
- `IncomingCallService` now specifies foreground service type MICROPHONE on `API >= 30` devices.
  This fixes issues with microphone access for backgrounded apps.
  Note that this change also resulted in the compiled SDK verison being bumped to `33` from `29`.

1.0.0-beta.2 (June 23, 2023)
============================

Twilio Voice React Native SDK has now reached milestone `beta.2`. Included in this version are the following.

## Fixes

- Pinned to a specific version of the Twilio Voice iOS SDK. This fixes issues with some builds failing on iOS platforms.
- Fixed the Intent flags on Android platforms. This fixes issues with the application crashing on newer versions of Android.
- Calls will now persist their state through JS runtimes. Now, if the React Native JS layer encounters a restart, and if your code performs `Voice.getCalls`, the `Call` objects will now have the proper state.

## Features

- Calls will now persist a timestamp (millseconds since epoch) of when they initially receive the `Call.Event.Connected` event.
  See `Call.getInitialConnectedTimestamp`.

1.0.0-beta.1 (March 10, 2023)
=============================

Twilio Voice React Native SDK is now in beta! Please see the following changes with this new release.
Additionally, we are also introducing the new Twilio Voice React Native Reference App as an example implementation of the Twilio Voice React Native SDK and serves to inspire developers who want to leverage the power of Twilio Programmable Voice in their React Native applications. Please see this [page](https://github.com/twilio/twilio-voice-react-native-app) for more details.

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
  See the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/1.0.0-beta.1/docs/voice-react-native-sdk.twilioerrors_namespace.md) for all error classes.

## Fixes

- Fixed an issue where some types on the `Call` and `Voice` classes were being incorrectly exported. Types and references to `addEventListener` are instead now correctly exported as `addListener`.
- Fixed an issue where available audio devices were sometimes incorrectly emitted and returned by the SDK on Android platforms. This occurs more frequently in development environments when the JS bundle is reloaded, but could happen in production environments as well.
- Fixed a warning that occurred on more recent versions of React Native when the SDK constructed a `NativeEventEmitter`.
- Fixed an issue where devices running Android 12+ encountered crashes when receiving an incoming call or making an outgoing call.

1.0.0-preview.1 (September 1, 2022)
===================================

- This is the initial preview release of Twilio Voice React Native SDK. Please check out the [README](README.md) for more details.
