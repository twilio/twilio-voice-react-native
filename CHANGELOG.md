1.8.0 (In Progress)
===================

Expo support arrives additively. Framework-less ("bare") React Native
applications are unaffected and upgrade with no code change; Expo applications
add one config plugin entry. This supersedes the `2.0.0-preview.x` line, which
delivered the same capability by replacing the Android binding and in doing so
removed bare React Native support. Those preview versions are discontinued.

## Features

### Expo

- Expo applications are supported through a config plugin. Add
  `"@twilio/voice-react-native-sdk"` to `plugins` in your app config and run
  `expo prebuild`. See the [Expo setup guide](/docs/expo/app-config.md).

  A [development build](https://docs.expo.dev/develop/development-builds/introduction/)
  is required. Expo Go is not supported, because this library contains native
  code that Expo Go does not include.

  Set `android.googleServicesFile` in your app config. Expo installs your
  `google-services.json` and applies the Google Services Gradle plugin from it,
  and incoming calls will not reach the device without it.

  Verified on Expo SDK 52, 54, 55, 56 and 57.

### ICE configuration

- Added support for custom ICE servers and ICE transport policy on outgoing
  calls started with `Voice.connect`, via the new `iceServers` and
  `iceTransportPolicy` options.

- The same two options are supported when accepting an incoming call with
  `CallInvite.accept`.

### AudioDevice

- Added `AudioDevice.nativeType`, which exposes the audio device type exactly as
  reported by the native layer, alongside the well-known `AudioDevice.type`.

## Changes

- Updated the native Twilio Voice SDK dependencies.

  - Twilio Voice Android SDK upgraded from `6.7.1` to `6.10.3`.

  - Twilio Voice iOS SDK upgraded from `6.13.3` to `6.13.6`.

- Errors raised by native methods are now consistently surfaced as
  `TwilioErrors` subclasses. Previously this applied to some methods but not
  others: `Voice.connect` and `CallInvite.accept` already constructed a typed
  error, while methods such as `Call.mute`, `Call.disconnect` and
  `Voice.getVersion` let the underlying React Native bridge error propagate.

  This changes what those methods throw. Where the native layer reports a
  Twilio error code, the error is the matching `TwilioErrors` subclass and
  `code` carries that code, as before. Where it reports a failure without a
  code, the error is now an `InvalidStateError`, an `InvalidArgumentError` or
  an `UnexpectedNativeError`, and `code` on those three is `undefined` --
  1.7.0 gave the React Native bridge's generic `'EUNSPECIFIED'` there.

  Applications that read the bridge's undocumented `error.userInfo` property,
  or that relied on `code` being present, should read `error.message` and
  branch on `instanceof` instead:

  ```ts
  import { InvalidStateError } from '@twilio/voice-react-native-sdk';

  try {
    await call.mute(true);
  } catch (error) {
    if (error instanceof InvalidStateError) {
      // the call was not in a state that can be muted
    }
  }
  ```

- Updated the local TypeScript version used by the library.

## Fixes

- Fixed the Expo SDK version being absent from call insights metadata.

  `Voice` records the version natively during construction. That call was
  fire-and-forget, so a call, registration or preflight test started shortly
  after construction could reach the native layer first. On iOS the native SDK
  memoizes publisher metadata on the first insights event, so a miss there
  persisted for the rest of the application session. `connect`, `register`,
  `unregister`, `runPreflight` and `initializePushRegistry` now wait for the
  version to be recorded. Failing to record it can no longer reject any of
  them.

  Separately, the version was not reported at all for applications running an
  over-the-air update, whose manifests nest the app config under
  `extra.expoClient` rather than carrying `sdkVersion` at the top level.

  `CallInvite.accept` now waits for it as well, and the config plugin records
  the version in the built application -- as Android manifest meta-data and as
  an iOS `Info.plist` key -- so that an incoming call on a cold start reports
  it too. That path runs before the application's JavaScript has constructed
  `Voice`, so no amount of waiting in JavaScript could have covered it.

- Fixed an unresolved native module surfacing as a `TypeError` naming a
  property rather than an error naming the cause. Importing the SDK into an
  application whose native code is missing -- not rebuilt since the dependency
  was added, `pod install` not run, or running in Expo Go -- now throws an
  `InvalidStateError` listing what to check. React Native raises its own
  invariant for this on iOS but not on Android, so on Android the first symptom
  came from wherever the module was first read.

- Fixed `new Voice()` being able to throw. Recording the Expo SDK version is
  telemetry and is documented as never preventing a call, registration or
  preflight test, but a synchronous failure from the native binding propagated
  out of the constructor rather than being swallowed.

### Platform Specific Fixes

#### Android

- Fixed `Call.hold` and `Call.mute` returning an incorrect value.

- Fixed `CallInvite.sendMessage`.

- Fixed null pointer exception crashes that could occur when accepting or
  rejecting invalid `CallInvite`s from the native notification.

- Fixed `AudioDevice.uuid` changing whenever the available audio devices were
  re-evaluated, which happens when a device is selected. An application that
  selected a device and then compared `selectedDevice.uuid` against the device
  it had selected saw a mismatch even though the correct device was active. A
  device now keeps its `uuid` for as long as it remains available.

- Fixed audio device types being misreported in release builds where a code
  shrinker had renamed the underlying AudioSwitch classes.

- Fixed `getAudioDevices` dropping a device when two devices of the same type
  reported the same name, which two headsets of the same model do. The two
  shared one `uuid`, so the list returned one entry short and the `uuid` that
  went missing was no longer accepted by `selectAudioDevice`. Selecting a
  device triggers a re-evaluation, so the list shrank immediately after a
  selection.

#### iOS

- Fixed `PreflightTest` rejection paths.

- Fixed `Voice.connect` never settling when CallKit rejected the start-call
  transaction, for example while another call was already active. The promise
  stayed pending for the lifetime of the application, so the caller saw a hang
  rather than an error. It now rejects with the reason CallKit reported.

  The same promise is now owned by whichever path settles it first, keyed by
  the call's UUID. Previously the resolver was stored only after the CallKit
  transaction had already started, so a fast failure could still find no
  resolver and hang; the success path did not clear it, so a later failure
  could settle an already-settled promise; and it was read and written from two
  queues without synchronization.

- Fixed `Voice.connect` never settling when the Twilio Voice iOS SDK declined
  to create the call. It now rejects with an `InvalidStateError`.

- Fixed `AudioDevice.uuid` changing whenever the available audio devices were
  re-evaluated, the same defect fixed on Android above. A device now keeps its
  `uuid` for as long as it remains available.

- Fixed the speaker output override never being cleared. After the speaker had
  been selected once, selecting any other device moved only the input, so audio
  kept playing out of the speaker and `getAudioDevices` correctly reported
  `Speaker` as the active route.

## Migrating from 2.0.0-preview.x

- Reinstall from npm as `@twilio/voice-react-native-sdk@1.8.0`. The version
  number moves backwards, so no consumer upgrades into it by default.

- If you were using Expo, replace any manual `Info.plist`, entitlements and
  Google Services configuration with the config plugin entry described above.

- If you were using bare React Native, you were required to fork this SDK. Delete
  the fork and install from npm. Forking stopped you receiving native SDK and
  security updates, and is no longer necessary.

1.7.0 (October 8, 2025)
=======================

## Features

### PreflightTest

- You can now perform a `PreflightTest` to help evaluate the quality of calls made on a device ahead of time. Please see this documentation for more details: [Mobile SDK PreflightTest](https://www.twilio.com/docs/voice/sdks/mobile-preflight-test).

## Changes

### Platform Specific Changes

#### iOS

- Updated the Twilio Voice iOS SDK version to `6.13.3`. This update fixes a Bluetooth device type deprecation warning when building with Xcode 26.

## Fixes

- The call contact handle template feature now caches the set value. This fixes an issue where the handle template value would be `null` when an incoming call was received and the React Native JS runtime was not initialized or was restarted by the OS.

1.6.1 (July 7, 2025)
====================

## Changes

### Platform Specific Changes

#### Android

- Added Bluetooth permissions to the Twilio Voice RN SDK manifest.

## Fixes

### Platform Specific Fixes

#### Android

- Updated Audioswitch library to version `1.2.2`. This should fix missing Bluetooth audio devices on Android platforms.

1.6.0 (June 18, 2025)
=====================

## Features

- Added support for React Native applications using the New Architecture. If you are migrating your app from the Old Architecture to the New Architecture, and are already using the Twilio Voice React Native SDK, you will need to adjust your `MainApplication.java` file. Please see the updated Getting Started docs for [Java](/docs/getting-started-android-java.md) or [Kotlin](/docs/getting-started-android-kotlin.md).

  - If you are encountering this error:
  `java.lang.IllegalArgumentException: You can call getDefaultReactHost only with instances of DefaultReactNativeHost` when attempting to use this SDK with a NewArch application, please update your application logic in accordance with our updated Android Getting Started guides as linked above.

1.5.0 (April 2, 2025)
===================

## Fixes

### Platform Specific Fixes

#### Android

- Updated the RNModule methods to invoke all Voice Service API methods from only
  the main thread.


1.4.0 (Feb 11, 2025)
====================

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
