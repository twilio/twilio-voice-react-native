1.4.0 (In Progress)
===================

## Changes

### Platform Specific Changes

#### Android

- Updated the Twilio Voice Android SDK dependency to `6.7.1`.

#### iOS

- Updated the Twilio Voice iOS SDK dependency to `6.12.1`.


1.3.0 (Dec 10, 2024)
====================

## Changes

- Added a new API for customizing the displayed name for incoming calls in CallKit on iOS.
  See `voice.setIncomingCallContactHandleTemplate` and the associated API docs for more information.

- Added a new API for customizing the displayed name for outgoing, incoming, and answered call notifications on Android.
  See `voice.setIncomingCallContactHandleTemplate` and `voice.connect` for more information.

## Fixes

- Fixed a scenario where posting feedback for a call with the `Echo` issue would not post correctly to Twilio Insights.

1.2.1 (Oct 31, 2024)
====================

## Features

### Platform Specific Features

#### Android

- Added opt-out functionality for the built-in Firebase Messaging service.
  Please see [this document](/docs/out-of-band-firebase-messaging-service.md) for more details.

## Fixes

### Platform Specific Fixes

#### Android

- Fixed crash issue where system restarts service without an Intent (intent == null).


1.2.0 (Sep 16, 2024)
====================

## Changes

### Call Message Events (GA)

The Call Message Events feature in the Twilio Voice React Native SDK, previously released in `1.0.0` as Beta, is promoted to Generally Available (GA).

- **(Breaking)** The error code for attempting to send a call message with a payload size exceeding maximum limits has changed from `31209` to `31212`.

- The behavior of `call.sendMessage` has been changed to support future `contentType`s.
  Please see the [API Docs](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.callmessage_interface.md) for more information.

### Platform Specific Changes

#### Android

- Now pulling version `6.6.2` of the Twilio Voice Android SDK.

#### iOS

- Now pulling version `6.11.2` of the Twilio Voice iOS SDK.

1.1.1 (Aug 28, 2024)
====================

## Changes

### Platform Specific Changes

#### Android

- Bumped `minSdkVersion` to `23` to match the latest versions of React Native.

## Fixes

### Platform Specific Fixes

#### Android

- Fixed crash issue on API 34 when activity is not running in background or foreground and an incoming call is received.

- Fixed some RTCStats members not available on Android. Specifically, `mos`, `bytesSent`, and `bytesReceived`.

1.1.0 (Aug 20, 2024)
====================

## Features

### Platform Specific Features

#### Android

- Added support for Android 34.

- The SDK now gracefully handles missing microphone permissions on the Android platform.
  When using the Javascript API, `callInvite.accept()` and `voice.connect()` will now reject with error `PermissionsError` and code `31401`.
  When accepting an incoming call through the native notification, the analogous `31401` error can be caught by attaching a listener to `voice.on(Voice.Event.Error, ...)`. See the following example:
  ```ts
  voice.on(Voice.Event.Error, (error) => {
    // handle error
    if (error.code === 31401) {
      // show the end-user that they did not give the app the proper permissions
    }
  });
  ```

## Fixes

### Platform Specific Fixes

#### iOS

- Resolved an issue where Call Messages were not being constructed with the specified `contentType` or `messageType`.

- Resolved an issue where some `OutgoingCallMessage.Event.Failure` events were not being raised due to a race condition.

## Changes

### Call Message Events (Beta)

- **(Breaking)** Removed `CallMessage.MessageType` and `CallMessage.ContentType` enumerations and types. These types have been replaced by `string`.

- **(Breaking)** Simplified the `Call` and `CallInvite` APIs for sending call messages. `Call.sendMessage` and `CallInvite.sendMessage` now take a plain-JS object, or interface, as a parameter.

The following is an example of the updated API considering the above changes.

For outgoing calls:
```ts
const call = await voice.connect(...);
const outgoingCallMessage = await call.sendMessage({
  content: { foo: 'bar' },
  contentType: 'application/json',
  messageType: 'user-defined-message',
});
```

For call invites:
```ts
voice.on(Voice.Event.CallInvite, (callInvite) => {
  const outgoingCallMessage = await callInvite.sendMessage({
    content: { foo: 'bar' },
    contentType: 'application/json',
    messageType: 'user-defined-message',
  });
});
```

- Added new error codes. See the following table for details:
  | Error Code | Description |
  | --- | --- |
  | 31210 | Raised when a Call Message is sent with an invalid message type. |
  | 31211 | Raised when attempting to send a Call Message before the Call/CallInvite is ready to send messages. This can typically happen when the Call/CallInvite is not yet in a ringing state. |

1.0.0 (Mar 25, 2024)
====================

Twilio Voice React Native SDK has now reached milestone `1.0.0` and is Generally
Available (GA). Included in this version are the following.

## Features

### Call Message Events (Beta)

- Allow sending and receiving "user-defined" messages during an ongoing Voice Call and during a pending Call Invite.
- To send a CallMessage, and handle `sent` and `failure` cases:
```ts
const message = new CallMessage({
   content: { key1: 'This is a messsage from the parent call' },
   contentType: CallMessage.ContentType.ApplicationJson,
   messageType: CallMessage.MessageType.UserDefinedMessage
});
const outgoingCallMessage: OutgoingCallMessage = await call.sendMessage(message);

outgoingCallMessage.addListener(OutgoingCallMessage.Event.Failure, (error) => {
   // outgoingCallMessage failed, handle error
});

outgoingCallMessage.addListener(OutgoingCallMessage.Event.Sent, () => {
    // outgoingCallMessage sent
});
```
- To `receive` a CallMessage:
```ts
call.addListener(Call.Event.MessageReceived, (message: CallMessage) => {
  // callMessage received
});
```
- Related docs: https://www.twilio.com/docs/voice/sdks/call-message-events

## Fixes

- Fixed and improved the docstrings for the `Voice` and `Call` listeners. The descriptions of the events and listeners should now point to the correct docstrings.
- Call quality warning events should now properly pass arguments to listener functions.

## Changes

- The API for `call.getInitialConnectedTimestamp()` has now changed.
  Please see the API documentation [here](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.call_class.getinitialconnectedtimestamp_method.md) for details.
  The method `call.getInitialConnectedTimestamp()` now returns a `Date` object.
  ```ts
  const call = voice.connect(...);
  const date = call.getInitialConnectedTimestamp();
  const millisecondsSinceEpoch = date.getTime();
  ```

- The API for Call Invite events has now changed.

  The following events have been moved from the `Voice` class to the `CallInvite` class:
  - `Voice#callInviteAccepted` is now `CallInvite#accepted`
  - `Voice#callInviteRejected` is now `CallInvite#rejected`
  - `Voice#callInviteNotificationTapped` is now `CallInvite#notificationTapped`
  - `Voice#cancelledCallInvite` is now `CallInvite#cancelled`

  Please see the `Voice` class API documentation [here](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.voice_class.md) for details.

  Please see the `CallInvite` class API documentation [here](https://github.com/twilio/twilio-voice-react-native/blob/latest/docs/api/voice-react-native-sdk.callinvite_class.md) for details.

- Call Notifications can be customized on Android.

  The following features regarding a call notificaiton can now be modified
  - incoming/outgoing/answered call notification tray icon
  - name of caller/or recipient

  The incoming/outgoing/answered call notification tray icon can be changed by adding a drawable resources with the following id to your application
  - `incoming_call_small_icon` for incoming call notifications
  - `answered_call_small_icon` for answered call notifications
  - `outgoing_call_small_icon` for outgoing call notifications

  The name of the caller/or recipient of a call in the notification can be set by adding the following string resources with the following ids to your application.
  - `incoming_call_caller_name_text` for incoming call notifications
  - `outgoing_call_caller_name_text` for outgoing call notifications
  - `answered_call_caller_name_text` for answered call notifications
  NOTE: For `incoming_call_caller_name_text` & `answered_call_caller_name_text`, the substring `${from}` will be replaced with the caller and for `outgoing_call_caller_name_text`, the substring `${to}` will be replaced with the recipient of the call (if available, defaulting to "unknown").

- Custom functionality around the `displayName` TwiML parameter has been removed.

  In previous versions of the SDK, passing a custom TwiML parameter `displayName` would override the notification on Android platforms. Now, this functionality has been removed and notification customization is handled with the above features.

### Platform Specific Changes

#### Android
- Call timestamp now in simplified ISO-8601 format, not stored as a double from epoch.
- Uses system provided notification styles for incoming & ongoing calls. This insures visual consistency between devices.
- Fixed issue where call records were not being removed after call was ended.


#### iOS
- The call connected timestamp is now in simplified ISO-8601 format.
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
