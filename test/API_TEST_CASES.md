# Public API test cases

Test cases derived from the exported surface of `@twilio/voice-react-native-sdk` version 1.8.0, as
reported by `api/voice-react-native-sdk.api.md` and the implementations in `src/`. One case per
observable behavior of a public method, event, enum, or validation rule, for Android and iOS.

This document owns per-API cases only. It does not define tiers, credentials, environments, or run
results; those live in `test/MASTER_TEST_PLAN.md`. Scenario cases that are not tied to a specific
API call (network impairment, OS interruptions, device matrices, soak) live in
`test/MASTER_TEST_CASES.md`, which supersedes this file as the single catalog.

## 1 Conventions

**ID scheme:** `API-<AREA>-<nnn>`. IDs are permanent; retired cases keep their ID and are marked
Retired rather than renumbered.

**Platform column:** `A` Android, `I` iOS, `A/I` both. A case marked for one platform only is
either platform-gated in the SDK or depends on a platform-specific host integration.

**Level column:**

| Level | Meaning | Where it runs |
| --- | --- | --- |
| U | Unit, JS layer with the native module mocked | `src/__tests__`, `jest` |
| A | Automated end to end on a device or emulator | `test/appium-orchestrator` suites |
| M | Manual, needs a human, second handset, or hardware the harness cannot drive | recorded in the plan's results log |

**Status vocabulary** for reporting a case: Pass, Fail, Blocked, Not run, Limitation, Characterized.
Defined in `test/MASTER_TEST_PLAN.md` section 3. Pass requires the exact workflow to have been
exercised and its assertion to have succeeded.

**Two-endpoint cases.** Cases that need a second party use the identity pairs and fixed-behavior
TwiML endpoints described in `test/MASTER_TEST_PLAN.md` section 5 (`echo`, `playmusic`,
`readkeys`).

## 2 Public API inventory under test

| Surface | Members covered | Section |
| --- | --- | --- |
| `Voice` class | `connect`, `register`, `unregister`, `getVersion`, `getDeviceToken`, `getCalls`, `getCallInvites`, `getAudioDevices`, `handleFirebaseMessage`, `initializePushRegistry`, `setCallKitConfiguration`, `setIncomingCallContactHandleTemplate`, `showAvRoutePickerView`, `runPreflight`, 5 events | 3, 3.1, 4, 5, 6 |
| `AudioDevice` class | `type`, `nativeType`, `name`, `select`, `Type` enum | 7 |
| `Call` class | 15 methods, 8 events, `State`, `Score`, `Issue`, `QualityWarning` enums | 8, 9 |
| `CallInvite` class | `accept`, `reject`, `isValid`, `sendMessage`, `updateCallerHandle`, 4 getters, 5 events, `State` enum | 10 |
| `CallMessage`, `IncomingCallMessage`, `OutgoingCallMessage` | construction, validation, `Sent` and `Failure` events | 11 |
| `PreflightTest` class | 7 methods, 5 events, `Report`, `RTCSample`, `CallQuality`, `State` | 12 |
| `RTCStats` namespace | `StatsReport` shape returned by `Call.getStats` | 13 |
| `TwilioErrors` namespace | 4 SDK error classes, `TwilioError`, 12 generated namespaces | 14 |
| Types and options | `IceServer`, `IceTransportPolicy`, `AudioCodec`, `CallKit.ConfigurationOptions`, `CustomParameters` | 4, 6, 12 |
| Expo config plugin | `app.plugin.js`, props `apsEnvironment`, `microphoneUsageDescription` | 15 |

`CallInvite.isValid` is marked `@alpha` in the API report. Its cases are recorded but its contract
is not yet fixed, so a divergence is Characterized rather than Fail.

## 3 Voice construction, version, and device token

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-VOICE-001 | Construct `Voice` | `new Voice()` | Instance created; a native event listener is bound to the `voice` scope; `voice_setExpoVersion` is invoked once | A/I | U, A |
| API-VOICE-002 | Expo version reported in an Expo app | Run in an Expo development build, construct `Voice` | `voice_setExpoVersion` receives the host Expo SDK version, read from either a classic manifest `sdkVersion` or `extra.expoClient.sdkVersion` | A/I | U, A |
| API-VOICE-003 | Expo version undefined in a bare app | Run in `test/app`, construct `Voice` | `voice_setExpoVersion` receives `undefined`; no throw | A/I | U, A |
| API-VOICE-004 | Malformed Expo manifest | Manifest present but unparseable | `getExpoVersion` returns `undefined`; construction still succeeds | A/I | U |
| API-VOICE-005 | Multiple `Voice` instances | Construct two instances, raise one native event | Each instance receives the event; no cross-instance interference or duplicate emission on a single instance | A/I | U |
| API-VOICE-006 | Unknown native voice event type | Emit a `voice` scope event with an unrecognized `type` | Throws `Error` naming the unknown type; no silent drop | A/I | U |
| API-VOICE-007 | `getVersion` returns the native SDK version | Call `getVersion()` | Resolves with the non-empty version string of the underlying native SDK, not the React Native package version. Values differ per platform by design | A/I | A |
| API-VOICE-008 | `getDeviceToken` on Android | Register push, call `getDeviceToken()` | Resolves with the current FCM registration token | A | A |
| API-VOICE-009 | `getDeviceToken` on iOS | Call `initializePushRegistry()` or wire the app's own PushKit handler, then `getDeviceToken()` | Resolves with the PushKit VoIP token | I | A |
| API-VOICE-010 | `getDeviceToken` before push is available | Call before FCM or PushKit has produced a token | Rejects with a `TwilioError`; the rejection is not a raw `TypeError` and does not crash | A/I | A |

### 3.1 Registration

`register` and `unregister` perform no JS-layer argument validation. Every rejection therefore
originates in the native layer and arrives through the promise-settling path, so these cases also
exercise that mapping.

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-REG-001 | Register with a valid token | `register(token)` with a token carrying a Voice grant and a push credential configured | Resolves; `Voice.Event.Registered` is raised; the device subsequently receives invites | A/I | A |
| API-REG-002 | Unregister | `unregister(token)` after a successful register | Resolves; `Voice.Event.Unregistered` is raised | A/I | A |
| API-REG-003 | No invites after unregister | Unregister, then place a call to that identity | No invite is delivered; the caller receives the configured no-answer or failure behavior | A/I | A |
| API-REG-004 | Register with an expired token | `register` with an expired token | Rejects with an `AuthorizationErrors` class; `Registered` is not raised | A/I | A |
| API-REG-005 | Register with a malformed token | `register('not-a-jwt')` | Rejects with an `AuthorizationErrors` class | A/I | A |
| API-REG-006 | Register with a token missing a Voice grant | Mint a token with no `VoiceGrant` | Rejects with `AuthorizationErrors.AccessTokenGrantsInvalid` | A/I | A |
| API-REG-007 | Register with a non-string token | Pass a number, `null`, or `undefined` | Rejects with an SDK error class, not a raw `TypeError` and not a native crash. The JS layer does not validate this argument, so the assertion is on the native rejection path | A/I | A |
| API-REG-008 | Register twice with the same token | Call `register` twice | Second call resolves; a single registration results; invites are delivered once | A/I | A |
| API-REG-009 | Register with a refreshed token | Register, mint a new token for the same identity, register again | Resolves; the device stays reachable across the change with no gap that drops an invite | A/I | A |
| API-REG-010 | Unregister without registering | Call `unregister` on a fresh instance | Resolves, or rejects with a `TwilioError`. Behavior recorded rather than assumed | A/I | A |
| API-REG-011 | Register with no network | Enable airplane mode, then `register` | Rejects with a `GeneralErrors` or `RegistrationErrors` class within the SDK timeout; no indefinite pending promise | A/I | A |
| API-REG-012 | Register with no push credential on the account | Use an account with no FCM or APNs credential registered with Twilio | Rejects, or resolves while no push is ever delivered. The distinction matters for diagnosis and must be recorded | A/I | A |
| API-REG-013 | Register when FCM is unreachable | Android device or image that cannot obtain an FCM token | Rejects with an error naming the token failure; no crash | A | A |
| API-REG-014 | Register on iOS before the push registry exists | `register` before `initializePushRegistry` and with no app-owned PushKit handler | Rejects, or resolves while no VoIP token exists. Behavior recorded | I | A |
| API-REG-015 | `Registered` handler type guard | Deliver a `registered` event payload with a mismatched type | Throws the guard `Error`; no event emitted | A/I | U |
| API-REG-016 | `Unregistered` handler type guard | Same for `unregistered` | Throws the guard `Error` | A/I | U |

## 4 Voice.connect and option validation

`connect` validates synchronously and throws before reaching the native layer, so the invalid-input
cases below assert a thrown error, not a rejected promise.

### 4.1 Happy paths and platform-specific options

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-CONN-001 | Connect with token only | `connect(token)` with a valid access token | Resolves with a `Call`; `getState()` is `Connecting`; resolution does not imply the call was answered | A/I | A |
| API-CONN-002 | Connect with custom params | `connect(token, { params: { To: '+1...', foo: 'bar' } })` | Params reach the TwiML application; readable on the far end | A/I | A |
| API-CONN-003 | Empty params object | `connect(token, { params: {} })` | Resolves; no params sent | A/I | U, A |
| API-CONN-004 | `contactHandle` shown in call history | `connect(token, { contactHandle: 'QA Handle' })` | Value appears as the CallKit contact handle and in iOS call history | I | M |
| API-CONN-005 | Empty `contactHandle` | `connect(token, { contactHandle: '' })` | Native layer receives `Default Contact`; that string appears in iOS call history | I | U, M |
| API-CONN-006 | `contactHandle` omitted | `connect(token)` | Native layer receives `Default Contact` | I | U |
| API-CONN-007 | `contactHandle` on Android | `connect(token, { contactHandle: 'X' })` on Android | No effect; call proceeds normally. Documented as unsupported on Android | A | U, A |
| API-CONN-008 | `notificationDisplayName` on Android | `connect(token, { notificationDisplayName: 'QA Caller' })` | Value appears in the ongoing-call notification | A | M |
| API-CONN-009 | Empty `notificationDisplayName` | Pass `''` | Treated as if `undefined`; default notification content used | A | U, M |
| API-CONN-010 | `notificationDisplayName` on iOS | Pass the option on iOS | Ignored; no error. Documented as unsupported on iOS | I | U |
| API-CONN-011 | Custom `iceServers` accepted | `connect` with a valid TURN server list | Call connects; `getStats()` reports a candidate pair using the supplied server | A/I | A |
| API-CONN-012 | `iceTransportPolicy: Relay` | Connect with `Relay` and valid TURN credentials | Call connects; the selected candidate pair is a relay pair | A/I | A |
| API-CONN-013 | `iceTransportPolicy: All` | Connect with `All` | Call connects; host, srflx, or relay candidates may be selected | A/I | A |
| API-CONN-014 | `iceTransportPolicy: Relay` with unusable TURN | Connect with `Relay` and unreachable TURN | Call fails with a `ConnectFailure` carrying a media or connection error, within the SDK's ICE timeout. No indefinite hang | A/I | A |
| API-CONN-015 | Unsupported platform | Invoke `connect` where `Platform.OS` is neither `android` nor `ios` | Throws `UnsupportedPlatformError` naming the platform | A/I | U |

### 4.2 Argument validation

Every case expects a thrown `TwilioErrors.InvalidArgumentError`. The point of the case is that the
error is the documented class with a message naming the offending argument, not a raw `TypeError`.

| ID | Invalid input | Expected message content | Platform | Level |
| --- | --- | --- | --- | --- |
| API-CONN-020 | `token` is not a string (number, `undefined`, `null`, object) | `Argument "token" must be of type "string"` | A/I | U |
| API-CONN-021 | `contactHandle` is not a string | names `contactHandle` | A/I | U |
| API-CONN-022 | `params` is `null` | names `params`, requires a non-null object. Regression case: `typeof null === 'object'` previously produced a raw `TypeError` | A/I | U |
| API-CONN-023 | `params` is a non-object (string, number, boolean) | names `params` | A/I | U |
| API-CONN-024 | A `params` value is not a string | `Voice.ConnectOptions.params["<key>"] must be of type string`, naming the specific key | A/I | U |
| API-CONN-025 | `iceServers` is not an array | names `iceServers` | A/I | U |
| API-CONN-026 | An `iceServer` entry is `null` or a non-object | `"iceServer" must be a non-null object` | A/I | U |
| API-CONN-027 | `iceServer.username` present but not a string | names `username` | A/I | U |
| API-CONN-028 | `iceServer.password` present but not a string | names `password` | A/I | U |
| API-CONN-029 | `iceServer.serverUrl` present but not a string | names `serverUrl` | A/I | U |
| API-CONN-030 | `iceServer` has `username` without `password` | states the accepted shapes: `{ serverUrl }` or `{ username, password, serverUrl }` | A/I | U |
| API-CONN-031 | `iceServer` has `password` without `username` | same as above | A/I | U |
| API-CONN-032 | `iceServer` has credentials but no `serverUrl` | same as above | A/I | U |
| API-CONN-033 | `iceServer` is `{}` | same as above | A/I | U |
| API-CONN-034 | `iceServer` is `{ serverUrl }` only | Accepted, no throw. Boundary case for the rule above | A/I | U |
| API-CONN-035 | `iceTransportPolicy` is a string outside `relay` and `all` | states the two accepted values | A/I | U |
| API-CONN-036 | `iceTransportPolicy` is not a string | same as above | A/I | U |
| API-CONN-037 | An invalid token passed together with invalid ICE options | The token error is thrown first and no native call is made, so validation order is fixed rather than incidental | A/I | U |

### 4.3 Rejection paths from the native layer

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-CONN-040 | Expired access token | `connect` with an expired token | Rejects with an `AuthorizationErrors` class; `error.code`, `description`, `explanation`, `causes`, and `solutions` are populated | A/I | A |
| API-CONN-041 | Malformed access token | `connect` with a non-JWT string | Rejects with an `AuthorizationErrors` class | A/I | A |
| API-CONN-042 | Token missing a Voice grant | `connect` with a token that has no `VoiceGrant` | Rejects with `AuthorizationErrors.AccessTokenGrantsInvalid` | A/I | A |
| API-CONN-043 | Invalid TwiML application SID | Mint a token pointing at a non-existent application | Rejects or raises `ConnectFailure` with `TwiMLErrors.InvalidApplicationSid` | A/I | A |
| API-CONN-044 | Microphone permission denied | Deny the microphone permission, then `connect` | Rejects or raises `ConnectFailure` with `UserMediaErrors.PermissionDeniedError`; no crash | A/I | A |
| API-CONN-045 | No network | Enable airplane mode, then `connect` | Rejects or raises `ConnectFailure` with a `GeneralErrors` or `SignalingErrors` class within the SDK timeout | A/I | A |
| API-CONN-046 | Native rejection mapped by name | Native layer rejects with `InvalidArgumentError` or `InvalidStateError` name | The JS promise rejects with the matching SDK error class; any other name maps to `UnexpectedNativeError` with `miscellaneousInfo` preserved | A/I | U |

## 5 Voice call and invite inventories

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-INV-001 | `getCalls` with no calls | Call on a fresh instance | Resolves with an empty `ReadonlyMap` | A/I | A |
| API-INV-002 | `getCalls` during an active call | Connect, then call `getCalls()` | Map contains one entry keyed by the call's uuid; the value's `getSid()` matches the live call | A/I | A |
| API-INV-003 | `getCalls` excludes finished calls | Connect, disconnect, wait for `Disconnected`, then call `getCalls()` | The finished call is absent | A/I | A |
| API-INV-004 | `getCalls` with two concurrent calls | Establish one call, accept a second | Both entries present with distinct uuids | A/I | M |
| API-INV-005 | `getCallInvites` with none pending | Call on a fresh instance | Resolves with an empty map | A/I | A |
| API-INV-006 | `getCallInvites` with a pending invite | Receive an invite, do not settle it, call `getCallInvites()` | Map contains the invite; `getState()` is `Pending` | A/I | A |
| API-INV-007 | `getCallInvites` excludes settled invites | Accept or reject an invite, then call `getCallInvites()` | The settled invite is absent | A/I | A |
| API-INV-008 | Inventory recovery after app relaunch | Receive an invite, kill and relaunch the app, call `getCallInvites()` | Behavior is documented and consistent: either the invite is recoverable or the map is empty. Characterized, not Pass or Fail, until the contract is stated | A/I | M |

## 6 Platform-gated Voice methods

Each of these methods throws `UnsupportedPlatformError` on the platform it does not support, except
`showAvRoutePickerView`, which no-ops on Android.

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-PLAT-001 | `handleFirebaseMessage` with a Twilio payload | Opt out of the built-in messaging service, deliver a Twilio push to the app's own service, pass it in | Resolves `true`; the corresponding `Voice.Event.CallInvite` is raised | A | A |
| API-PLAT-002 | `handleFirebaseMessage` with a non-Twilio payload | Pass an unrelated FCM message | Resolves `false`; no invite raised; no crash | A | A |
| API-PLAT-003 | `handleFirebaseMessage` with a malformed payload | Pass a Twilio-shaped payload with missing or corrupt fields | Rejects with a `TwilioError`; no crash | A | A |
| API-PLAT-004 | `handleFirebaseMessage` while the built-in service is active | Do not opt out, then call | Rejects, or the invite is delivered exactly once. A duplicate invite is a Fail | A | A |
| API-PLAT-005 | `handleFirebaseMessage` on iOS | Call on iOS | Rejects with `UnsupportedPlatformError` stating Android only | I | U |
| API-PLAT-006 | `initializePushRegistry` on iOS | Call at app launch | Resolves; `getDeviceToken` subsequently returns a PushKit token; incoming pushes are surfaced with the app backgrounded or terminated | I | A |
| API-PLAT-007 | `initializePushRegistry` called twice | Call twice in one process | Second call resolves without duplicating registry handlers; incoming invites are raised once | I | A |
| API-PLAT-008 | `initializePushRegistry` on Android | Call on Android | Rejects with `UnsupportedPlatformError` stating iOS only | A | U |
| API-PLAT-009 | `initializePushRegistry` alongside an app-owned PushKit handler | App implements its own handler and also calls this | Documented conflict behavior; invites are not delivered twice. See `docs/applications-own-pushkit-handler.md` | I | M |
| API-PLAT-010 | `setCallKitConfiguration` applied | Set icon template, ringtone, `callKitIncludesCallsInRecents: false`, `callKitMaximumCallGroups`, `callKitMaximumCallsPerCallGroup`, handle types; then receive a call | System call UI reflects each setting; with recents disabled the call does not appear in the iOS call history | I | M |
| API-PLAT-011 | `setCallKitConfiguration` with a missing asset | Reference a ringtone or icon filename not in the bundle | Rejects, or the system falls back to defaults without crashing. Behavior recorded | I | M |
| API-PLAT-012 | `setCallKitConfiguration` handle types | Configure `Generic`, `PhoneNumber`, and `EmailAddress` in turn | The CallKit handle renders according to the configured type | I | M |
| API-PLAT-013 | `setCallKitConfiguration` on Android | Call on Android | Rejects with `UnsupportedPlatformError` stating iOS only | A | U |
| API-PLAT-014 | `showAvRoutePickerView` on iOS | Call during an active call | The native AV route picker is presented | I | M |
| API-PLAT-015 | `showAvRoutePickerView` on Android | Call on Android | Resolves with no UI. The doc comment says it resolves with `null` while the implementation resolves with `undefined`; record as a Limitation and cross-reference VBLOCKS-5784 | A | U |
| API-PLAT-016 | `setIncomingCallContactHandleTemplate` substitution | Set `'Foo ${DisplayName}'`, receive an invite whose TwiML params include `DisplayName: 'Bar'` | Android notification title and iOS CallKit handle read `Foo Bar` | A/I | M |
| API-PLAT-017 | Template unset | Call with no argument after having set a template | Default notification and contact-handle behavior is restored | A/I | M |
| API-PLAT-018 | Template set to empty string | Pass `''` | Treated the same as `undefined` | A/I | U, M |
| API-PLAT-019 | Template referencing an absent param | Set a template naming a param the invite does not carry | No crash; the substitution is empty or the placeholder is left literal. Behavior recorded | A/I | M |

## 7 Audio devices

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-AUD-001 | `getAudioDevices` shape | Call with no call in progress | Resolves with `{ audioDevices, selectedDevice? }`; every entry has `uuid`, `type`, `nativeType`, `name` | A/I | A |
| API-AUD-002 | `selectedDevice` omitted | Native layer reports no selected device | The returned object has no `selectedDevice` key rather than `selectedDevice: undefined` | A/I | U |
| API-AUD-003 | Enumeration includes earpiece and speaker | Call on a handset with no accessory attached | Both an `Earpiece` and a `Speaker` device are listed | A/I | A |
| API-AUD-004 | `select` switches the route | Call `select()` on the speaker device during a call | Resolves; audio is heard from the speaker; a subsequent `getAudioDevices` reports it as selected | A/I | M |
| API-AUD-005 | `AudioDevicesUpdated` on selection | Bind the event, then `select()` a different device | Event raised with the full device list and the new `selectedDevice` | A/I | A |
| API-AUD-006 | `uuid` stability across updates | Capture a device's `uuid`, trigger an update by selecting a device, re-enumerate | The same physical device keeps the same `uuid`, so a previously held handle remains selectable. Regression case: the uuid was regenerated on every update prior to 1.8.0 | A | A |
| API-AUD-007 | `select` on a stale handle | Hold a device object, disconnect that device, call `select()` | Rejects with a `TwilioError`; no crash | A/I | M |
| API-AUD-008 | Bluetooth device appears | Pair and connect a Bluetooth headset | `AudioDevicesUpdated` is raised; a device of type `Bluetooth` is listed with a `name` matching the accessory | A/I | M |
| API-AUD-009 | Bluetooth device removed | Disconnect the headset during a call | `AudioDevicesUpdated` is raised; the Bluetooth entry is gone; the route falls back without dropping the call | A/I | M |
| API-AUD-010 | `nativeType` on iOS | Inspect `nativeType` for each device | Values correspond to `AVAudioSessionPort` constants | I | A |
| API-AUD-011 | `nativeType` on Android | Inspect `nativeType` for each device | Values correspond to AudioSwitch class names | A | A |
| API-AUD-012 | Unrecognized device type | Native layer reports a device type the SDK does not map | `type` is `AudioDevice.Type.Unknown` and `nativeType` carries the raw value | A/I | U |
| API-AUD-013 | Repeated route changes | Switch route 20 times in a row during a call | No crash, no silence, no stuck audio session; every switch raises one event | A/I | M |

## 8 Call methods

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-CALL-001 | `getState` after connect | Inspect immediately after `connect` resolves | `Connecting` | A/I | A |
| API-CALL-002 | `getState` transitions | Observe through a full call | `Connecting` then `Ringing` when the far end signals ringing, then `Connected`, then `Disconnected` | A/I | A |
| API-CALL-003 | `getSid` before and after connect | Read on the returned object, then after `Connected` | `undefined` until the native layer supplies it, then a `CA` prefixed SID | A/I | A |
| API-CALL-004 | `getFrom` and `getTo` | Read after `Connected` | Match the call's signalled parties; `undefined` before native info arrives | A/I | A |
| API-CALL-005 | `getInitialConnectedTimestamp` | Read before and after `Connected` | `undefined` before; a `Date` after, within a few seconds of the observed connect time | A/I | A |
| API-CALL-006 | Timestamp is not reset by later events | Note the value, trigger a reconnect, read again | The value continues to reflect the first connect | A/I | M |
| API-CALL-007 | `getCustomParameters` | Connect with params, read on the far-end `Call` | Returns a `Record` with the sent params | A/I | A |
| API-CALL-008 | `getCustomParameters` mutation | Mutate the returned object, read again | Behavior recorded. The getter returns the internal record, so mutation is visible on subsequent reads. Characterized; treat as a hardening candidate rather than a Fail | A/I | U |
| API-CALL-009 | `mute(true)` | Call during a `Connected` call | Resolves `true`; `isMuted()` is `true`; the far end hears nothing from this side | A/I | A |
| API-CALL-010 | `mute(false)` | Unmute | Resolves `false`; `isMuted()` is `false`; audio resumes without a perceptible gap beyond the product threshold | A/I | A |
| API-CALL-011 | `isMuted` before native info | Read on a freshly constructed `Call` before the native layer reports state | `undefined`, not `false` | A/I | U |
| API-CALL-012 | Repeated mute toggling | Toggle 20 times | Each call resolves with the requested state; final state matches the last call | A/I | A |
| API-CALL-013 | `hold(true)` | Call during a `Connected` call | Resolves `true`; `isOnHold()` is `true`; media is suspended per product behavior | A/I | A |
| API-CALL-014 | `hold(false)` | Take off hold | Resolves `false`; two-way audio returns | A/I | A |
| API-CALL-015 | `isOnHold` before native info | Read before native state arrives | `undefined` | A/I | U |
| API-CALL-016 | `sendDigits` single digit | Send `'1'` against the `readkeys` endpoint | Resolves; the far end reports the digit | A/I | A |
| API-CALL-017 | `sendDigits` sequence | Send `'1234567890'` | Resolves; all digits are received in order | A/I | A |
| API-CALL-018 | `sendDigits` with `*` and `#` | Send `'*#'` | Resolves; both are received | A/I | A |
| API-CALL-019 | `sendDigits` while muted | Mute, then send digits | Digits are still delivered. DTMF is signalled out of band from the audio path | A/I | A |
| API-CALL-020 | `sendDigits` with invalid characters | Send `'abc'` or `''` | Rejects with a `TwilioError`, or the native layer ignores the invalid characters. Behavior recorded per platform, since the JS layer performs no validation on this argument | A/I | A |
| API-CALL-021 | `sendDigits` before `Connected` | Send while still `Connecting` | Rejects with a `TwilioError` rather than silently dropping | A/I | A |
| API-CALL-022 | `getStats` during a call | Call after `Connected` | Resolves with a `StatsReport`; see section 13 for field assertions | A/I | A |
| API-CALL-023 | `getStats` before `Connected` | Call while `Connecting` | Rejects, or resolves with empty arrays. Behavior recorded | A/I | A |
| API-CALL-024 | `postFeedback` valid | `postFeedback(Call.Score.Five, Call.Issue.AudioLatency)` after a call | Resolves | A/I | A |
| API-CALL-025 | `postFeedback` with `NotReported` | `postFeedback(Call.Score.NotReported, Call.Issue.NotReported)` | Resolves | A/I | U, A |
| API-CALL-026 | `postFeedback` invalid score | Pass `7`, `-1`, `'5'`, or `undefined` | Throws `InvalidArgumentError` naming `score` and referencing `Call.Score` | A/I | U |
| API-CALL-027 | `postFeedback` invalid issue | Pass a string outside `Call.Issue` | Throws `InvalidArgumentError` naming `issue` and referencing `Call.Issue` | A/I | U |
| API-CALL-028 | Every `Call.Score` and `Call.Issue` member is accepted | Iterate all six scores and all seven issues | Each combination resolves; the native layer receives the mapped native value | A/I | U |
| API-CALL-029 | `disconnect` on a connected call | Call during a `Connected` call | Resolves; `Disconnected` is raised with no error; the far end sees the hangup | A/I | A |
| API-CALL-030 | `disconnect` while `Connecting` | Call before the call is answered | Resolves; the call setup is cancelled cleanly, with no orphaned call on the far end | A/I | A |
| API-CALL-031 | `disconnect` twice | Call, wait for `Disconnected`, call again | Rejects with a `TwilioError`, or resolves as a no-op. No crash, no duplicate `Disconnected` | A/I | A |
| API-CALL-032 | Methods on a disconnected call | After `Disconnected`, call `mute`, `hold`, `sendDigits`, `getStats` | Each rejects with a `TwilioError`; no crash | A/I | A |

## 9 Call events and state machine

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-CEV-001 | `Connected` | Place a call and let the far end answer | Raised once with no arguments; `getState()` is `Connected` when the listener runs | A/I | A |
| API-CEV-002 | `Ringing` | Place a call to an endpoint that signals ringing, for example with `answerOnBridge` | Raised once before `Connected`; `getState()` is `Ringing` | A/I | A |
| API-CEV-003 | `ConnectFailure` | Place a call that cannot be set up, for example with an invalid application SID | Raised once with a `TwilioError` whose `code` is populated; `Connected` is never raised | A/I | A |
| API-CEV-004 | `Disconnected` without error, local hangup | Call `disconnect()` | Raised once with no error argument | A/I | A |
| API-CEV-005 | `Disconnected` without error, remote hangup | Far end hangs up | Raised once; local state clears within the product threshold | A/I | A |
| API-CEV-006 | `Disconnected` with error | Force a media or signaling failure mid-call, for example airplane mode | Raised with a `TwilioError` argument | A/I | A |
| API-CEV-007 | `Reconnecting` | Interrupt the network briefly during a call | Raised with a `TwilioError` describing the cause; `getState()` is `Reconnecting` | A/I | M |
| API-CEV-008 | `Reconnected` | Restore the network within the SDK's reconnect window | Raised with no arguments; `getState()` returns to `Connected`; two-way audio resumes | A/I | M |
| API-CEV-009 | Reconnect exhausted | Keep the network down past the reconnect window | `Disconnected` is raised with an error; no indefinite `Reconnecting` state | A/I | M |
| API-CEV-010 | `QualityWarningsChanged` raised | Degrade the network to produce jitter, loss, or RTT above threshold | Raised with `(current, previous)` arrays drawn from `Call.QualityWarning` | A/I | A |
| API-CEV-011 | `QualityWarningsChanged` cleared | Restore the network | Raised again with the warning absent from `current` and present in `previous` | A/I | A |
| API-CEV-012 | `MessageReceived` | Far end sends a call message during the call | Raised with an `IncomingCallMessage`; see section 11 | A/I | A |
| API-CEV-013 | Event gating by uuid | Establish two concurrent calls, raise an event for one | Only the matching `Call` object emits; the other emits nothing | A/I | U |
| API-CEV-014 | Unknown call event type | Emit a `call` scope event with an unrecognized type | Throws `Error` naming the type | A/I | U |
| API-CEV-015 | Handler and type mismatch | Deliver a payload whose type does not match the handler for it | Throws the guard `Error` rather than emitting a wrong-shaped event | A/I | U |
| API-CEV-016 | Listener bound after the event | `connect`, wait past `Connected`, then bind a `Connected` listener | The listener is not invoked retroactively; the app must read `getState()`. Documented behavior, recorded as Characterized | A/I | A |
| API-CEV-017 | `on` and `addListener` equivalence | Bind the same event with both | Both listeners are invoked; the two methods are aliases | A/I | U |
| API-CEV-018 | State on every event | Assert `getState()` inside each event listener | State matches the event: `Ringing` on ringing, `Connected` on connected and reconnected, `Reconnecting` on reconnecting, `Disconnected` on disconnected and connect failure | A/I | U |
| API-CEV-019 | No `Connected` after `Disconnected` | Complete a call, then keep the object bound for 30 seconds | No further events on that object | A/I | A |
| API-CEV-020 | Event ordering for a normal call | Record every event of an answered call | Order is `Ringing` when signalled, then `Connected`, then `Disconnected`, with no repeats | A/I | A |

## 10 CallInvite

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-CI-001 | Invite delivered | Place a call to this registered identity | `Voice.Event.CallInvite` raised with a `CallInvite` whose `getState()` is `Pending` | A/I | A |
| API-CI-002 | Getters populated | Read `getCallSid`, `getFrom`, `getTo`, `getCustomParameters` on a pending invite | All return values; `getCallSid` is a `CA` prefixed SID; custom params match what the caller sent | A/I | A |
| API-CI-003 | `accept` | Accept a pending invite | Resolves with a `Call`; `CallInvite.Event.Accepted` is raised with a `Call`; invite state becomes `Accepted`; two-way audio established | A/I | A |
| API-CI-004 | `accept` with `iceServers` | Accept with a valid TURN list | Call connects; the candidate pair reflects the supplied server | A/I | A |
| API-CI-005 | `accept` with `iceTransportPolicy: Relay` | Accept with `Relay` and valid TURN | Call connects over a relay candidate pair | A/I | A |
| API-CI-006 | `accept` ICE validation | Accept with each invalid `iceServers` or `iceTransportPolicy` shape from section 4.2 | Throws `InvalidArgumentError` with the same messages as `connect`; no native call is made | A/I | U |
| API-CI-007 | `accept` twice | Accept, then accept the same invite again | Second call throws `InvalidStateError` naming the current state `accepted` and the expected state `pending`. No second `Call` is created | A/I | U, A |
| API-CI-008 | `accept` after `reject` | Reject, then accept | Throws `InvalidStateError` | A/I | U, A |
| API-CI-009 | `accept` after `Cancelled` | Let the caller cancel, then accept | Throws `InvalidStateError`; no phantom call is created | A/I | A |
| API-CI-010 | `reject` | Reject a pending invite | Resolves; `Rejected` event raised; state becomes `Rejected`; the caller observes the rejection | A/I | A |
| API-CI-011 | `reject` twice | Reject, then reject again | Second call throws `InvalidStateError` | A/I | U, A |
| API-CI-012 | `reject` after `accept` | Accept, then reject | Throws `InvalidStateError`; the active call is unaffected | A/I | U, A |
| API-CI-013 | `reject` after `Cancelled` | Let the caller cancel, then reject | Throws `InvalidStateError`; no crash | A/I | A |
| API-CI-014 | `Cancelled` with no error | Caller hangs up before the invite is settled | `Cancelled` raised with `undefined`; state becomes `Cancelled`; the incoming UI clears | A/I | A |
| API-CI-015 | `Cancelled` with an error | Invite cancelled by a failure path | `Cancelled` raised with a `TwilioError` | A/I | A |
| API-CI-016 | `NotificationTapped` | Tap the incoming-call notification | Raised once; the app can bring the call UI forward | A | M |
| API-CI-017 | `MessageReceived` on an invite | Caller sends a call message before the invite is answered | Raised with an `IncomingCallMessage` | A/I | A |
| API-CI-018 | Event gating by call SID | Hold two pending invites, raise an event for one | Only the matching invite emits | A/I | U |
| API-CI-019 | Malformed native invite event | Deliver a non-object, `null`, or SID-less invite event | Throws `TwilioError` with a message naming the defect. No silent drop | A/I | U |
| API-CI-020 | Unknown invite event type | Deliver an unrecognized type | Throws `TwilioError` naming the type | A/I | U |
| API-CI-021 | `updateCallerHandle` before accept | On iOS, after the invite is reported to CallKit, call with a new display name | Resolves; the system incoming-call screen shows the new handle | I | M |
| API-CI-022 | `updateCallerHandle` after accept | Call once the invite has been accepted | Behavior recorded. The API is documented for use before acceptance | I | M |
| API-CI-023 | `updateCallerHandle` on Android | Call on Android | Rejects with `UnsupportedPlatformError` stating iOS only | A | U |
| API-CI-024 | `isValid` on a pending invite | Call on a live pending invite | Resolves `true`. Alpha API; a divergence is Characterized | A/I | A |
| API-CI-025 | `isValid` on a cancelled invite | Let the caller cancel, then call | Resolves `false` | A/I | A |
| API-CI-026 | `isValid` on a stale invite after relaunch | Recover an invite after an app restart and call | Resolves without throwing; the value distinguishes answerable from expired invites | A/I | M |

## 11 Call messages

`CallMessage` is documented as beta. `contentType` defaults to `application/json`; a non-string
`content` is JSON-stringified before it reaches the native layer.

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-MSG-001 | Send from an active call | `call.sendMessage({ content: { a: 1 }, contentType: 'application/json', messageType: 'user-defined-message' })` | Resolves with an `OutgoingCallMessage`; `getSid()` returns the voice event SID; `Sent` event raised | A/I | A |
| API-MSG-002 | Default `contentType` | Omit `contentType` | The native layer receives `application/json`; `getContentType()` returns it | A/I | U |
| API-MSG-003 | Object content is stringified | Pass an object as `content` | The native layer receives the JSON string; `getContent()` returns the string form | A/I | U |
| API-MSG-004 | String content passes through | Pass a string as `content` | Sent unchanged, not double-encoded | A/I | U |
| API-MSG-005 | Receive on the far end | Send from A to B during a call | B's `Call` raises `MessageReceived` with matching `getContent`, `getContentType`, `getMessageType`, and a `getSid` | A/I | A |
| API-MSG-006 | Send from a `CallInvite` on Android | `callInvite.sendMessage(...)` on a pending invite | Resolves; the far end receives the message | A | A |
| API-MSG-007 | Send from a `CallInvite` on iOS | Same on iOS | Resolves; the far end receives the message. The iOS path routes through the call message native method rather than an invite-specific one; cross-reference VBLOCKS-5824. Assert delivery, and record the routing difference | I | A |
| API-MSG-008 | `content` is `undefined` | Omit `content` | Throws `InvalidArgumentError`: content must be defined and not null | A/I | U |
| API-MSG-009 | `content` is `null` | Pass `null` | Throws `InvalidArgumentError` | A/I | U |
| API-MSG-010 | `messageType` is not a string | Pass a number or omit it | Throws `InvalidArgumentError` naming `messageType` | A/I | U |
| API-MSG-011 | `contentType` present but not a string | Pass a number | Throws `InvalidArgumentError` naming `contentType` | A/I | U |
| API-MSG-012 | Unsupported `messageType` | Pass a string outside the accepted set | Rejects, or the `Failure` event carries `AuthorizationErrors.CallMessageEventTypeInvalidError` | A/I | A |
| API-MSG-013 | Payload over the size limit | Send content larger than the documented maximum | `Failure` event carries `AuthorizationErrors.PayloadSizeExceededError`; the call is unaffected | A/I | A |
| API-MSG-014 | Message rate exceeded | Send messages faster than the documented rate limit | `Failure` event carries `AuthorizationErrors.RateExceededError`; the call is unaffected | A/I | A |
| API-MSG-015 | Send in an invalid call state | Send before `Connected` or after `Disconnected` | Rejects, or `Failure` carries `AuthorizationErrors.CallMessageUnexpectedStateError` | A/I | A |
| API-MSG-016 | Event gating by voice event SID | Send two messages, raise a `Sent` event for one SID | Only the matching `OutgoingCallMessage` emits | A/I | U |
| API-MSG-017 | Unknown call message event type | Deliver an unrecognized type on the call message scope | Throws `Error` naming the type | A/I | U |
| API-MSG-018 | `Failure` payload shape | Force a failure | Listener receives a `TwilioError` with `code` populated | A/I | A |
| API-MSG-019 | `IncomingCallMessage.getSid` before native info | Construct without a voice event SID | Returns `undefined`, not an empty string | A/I | U |
| API-MSG-020 | Bidirectional exchange during one call | Both parties send and receive during the same call | Every message is delivered once, in each direction, with matching SIDs on send and receive | A/I | A |

## 12 PreflightTest

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-PRE-001 | Run with no options | `runPreflight(token)` | Resolves with a `PreflightTest`; `Connected` is raised; `Sample` events follow | A/I | A |
| API-PRE-002 | `Completed` and report | Let the test run to completion | `Completed` raised with a `Report`. **Observed on Android at API levels 31, 34, 36, and 37: `Completed` is never raised**, so this case is a Fail on Android pending the finding in `test/MASTER_TEST_PLAN.md` section 9.5a. Not yet exercised on iOS | A/I | A |
| API-PRE-003 | Report field coverage | Inspect the report from `Completed` or `getReport()` | `callSid`, `edge`, `selectedEdge`, `iceCandidateStats`, `selectedIceCandidatePairStats`, `networkTiming` with `signaling`, `peerConnection`, and `ice` measurements, `testTiming`, `samples`, `stats` with jitter, mos, and rtt min, max, and average, `callQuality`, `isTurnRequired`, `warnings`, `warningsCleared` | A/I | A |
| API-PRE-004 | `callQuality` mapping | Complete a test on a good network | `callQuality` is one of `excellent`, `great`, `good`, `fair`, `degraded`, lower-cased. `null` is permitted when the native layer reports none | A/I | A |
| API-PRE-005 | `warnings` default | Complete a test with no quality warnings | `warnings` and `warningsCleared` are empty arrays, not `undefined` | A/I | U |
| API-PRE-006 | `Sample` event shape | Capture a sample | All 13 documented fields present; `timestamp` is a number, converted from the native string | A/I | U, A |
| API-PRE-007 | `Failed` event | Run with an expired token | `Failed` raised with a `TwilioError` whose `code` is populated; no `Completed` | A/I | A |
| API-PRE-008 | `QualityWarning` event | Degrade the network during a run | Raised with `(current, previous)` arrays of `Call.QualityWarning` values | A/I | A |
| API-PRE-009 | `getState` progression | Poll through a run | `connecting`, then `connected`, then `completed` or `failed` | A/I | A |
| API-PRE-010 | `getCallSid` | Call after `Connected` | Resolves with the preflight call's SID | A/I | A |
| API-PRE-011 | `getStartTime` and `getEndTime` | Call after `Connected`, then after the run ends | Start time is a number; end time is a number after the run ends. Documented as resolving `undefined` before the run ends; assert the actual value and record any divergence | A/I | A |
| API-PRE-012 | `getLatestSample` | Call after at least one `Sample` | Resolves with the most recent sample, matching the last `Sample` event | A/I | A |
| API-PRE-013 | `getLatestSample` before any sample | Call immediately after `Connected` | Resolves `undefined` or rejects. Behavior recorded | A/I | A |
| API-PRE-014 | `getReport` before completion | Call while the test is running | Resolves `undefined` or rejects; does not return a partial report typed as complete | A/I | A |
| API-PRE-015 | `stop` mid-run | Call `stop()` after some samples | Resolves; sampling ceases; the state is no longer `connected` | A/I | A |
| API-PRE-016 | `stop` twice | Call `stop()` again | Rejects with a `TwilioError` or resolves as a no-op; no crash | A/I | A |
| API-PRE-017 | Listener binding race on iOS | Bind listeners synchronously after `runPreflight` resolves | Early events are still delivered. The iOS path defers a native event flush by one turn of the event loop for exactly this reason; Android does not flush | I | U, A |
| API-PRE-018 | Two concurrent preflight tests | Start a second run while the first is active | Documented behavior: rejected, or both run with events routed by uuid to the correct object | A/I | A |
| API-PRE-019 | Event gating by uuid | Deliver an event carrying a different uuid | The object ignores it and emits nothing | A/I | U |
| API-PRE-020 | Missing uuid on a native event | Deliver an event with a non-string uuid | Throws `InvalidStateError` naming the value | A/I | U |
| API-PRE-021 | Malformed native payloads | Deliver a `Completed` with a non-string report, a `Failed` with a non-string message or non-number code, a `Sample` with a non-string sample, a `QualityWarning` with non-array or non-string-element warnings | Each throws `InvalidStateError` identifying the event, the field, the expected type, and the actual type | A/I | U |
| API-PRE-022 | Options: valid ICE and codecs | Run with `iceServers`, `iceTransportPolicy`, and `preferredAudioCodecs: [{ type: 'opus', maxAverageBitrate: 128000 }]` | Resolves; the report reflects the requested configuration; `isTurnRequired` and the selected candidate pair are consistent with the policy | A/I | A |
| API-PRE-023 | Options: PCMU codec | Run with `[{ type: 'pcmu' }]` | Resolves; the samples report the `pcmu` codec | A/I | A |
| API-PRE-024 | Options: `preferredAudioCodecs` not an array | Pass a string | Throws `InvalidArgumentError` naming `preferredAudioCodecs` | A/I | U |
| API-PRE-025 | Options: codec entry is `null` | Pass `[null]` | Throws `InvalidArgumentError` requiring a non-null object. Regression case, tracked as VBLOCKS-7137 | A/I | U |
| API-PRE-026 | Options: codec `type` invalid | Pass a type outside `opus` and `pcmu`, or a non-string | Throws `InvalidArgumentError` listing the two accepted values | A/I | U |
| API-PRE-027 | Options: `maxAverageBitrate` not a number | Pass a string | Throws `InvalidArgumentError` naming `maxAverageBitrate` | A/I | U |
| API-PRE-028 | Options: ICE validation reuse | Pass each invalid ICE shape from section 4.2 | Same errors as `connect`, thrown before the native call | A/I | U |
| API-PRE-029 | Preflight with no network | Run in airplane mode | `Failed` raised with a connection error within the SDK timeout | A/I | A |
| API-PRE-030 | Preflight while a call is active | Start a preflight during a live call | Documented behavior: rejected, or both proceed without affecting the live call's audio | A/I | M |

## 13 Call statistics

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-STAT-001 | Report shape | `getStats()` during a `Connected` call | Returns `peerConnectionId`, `localAudioTrackStats`, `remoteAudioTrackStats`, `iceCandidateStats`, `iceCandidatePairStats` | A/I | A |
| API-STAT-002 | Local track stats | Inspect `localAudioTrackStats[0]` | `codec`, `ssrc`, `trackId`, `timestamp`, `bytesSent`, `packetsSent`, `roundTripTime`, `audioLevel`, `jitter` present; `bytesSent` and `packetsSent` increase between two reads taken 5 seconds apart | A/I | A |
| API-STAT-003 | Remote track stats | Inspect `remoteAudioTrackStats[0]` | `bytesRecieved`, `packetsReceived`, `audioLevel`, `jitter`, `mos` present; byte and packet counts increase between reads. Note the misspelled `bytesRecieved` field name is part of the public API and must not silently change | A/I | A |
| API-STAT-004 | Active candidate pair | Inspect `iceCandidatePairStats` | Exactly one entry has `activeCandidatePair: true`; its `state` is `STATE_SUCCEEDED`; `localCandidateIp` and `remoteCandidateIp` are populated | A/I | A |
| API-STAT-005 | Relay pair under `Relay` policy | Connect with `iceTransportPolicy: Relay`, then read stats | The active pair's `relayProtocol` is populated and the local candidate type is a relay candidate | A/I | A |
| API-STAT-006 | Candidate stats enumeration | Inspect `iceCandidateStats` | Entries carry `candidateType`, `ip`, `port`, `protocol`, `priority`, `transportId`, `isRemote`, `deleted`, `url` | A/I | A |
| API-STAT-007 | Stats under packet loss | Apply 10 percent loss, then read stats | `packetsLost` is non-zero and `mos` degrades relative to a clean baseline | A/I | M |
| API-STAT-008 | Stats after reconnect | Trigger a reconnect, then read stats | A report is still returned; the active candidate pair may differ from the pre-reconnect pair | A/I | M |

## 14 Errors

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-ERR-001 | Known error code mapping | Have the native layer raise each documented code | The JS error is the specific generated class for that code, with `code`, `description`, `explanation`, `causes`, and `solutions` populated | A/I | U |
| API-ERR-002 | Unknown error code | Raise a code the SDK does not know | A generic `TwilioError` is constructed with the code and message preserved, rather than a throw during construction | A/I | U |
| API-ERR-003 | `instanceof` chain | Catch a generated error | It is an `instanceof` its namespace class, `TwilioError`, and `Error` | A/I | U |
| API-ERR-004 | Native rejection by name | Native rejects with `InvalidArgumentError`, `InvalidStateError`, and an unrecognized name | Maps to `InvalidArgumentError`, `InvalidStateError`, and `UnexpectedNativeError` respectively | A/I | U |
| API-ERR-005 | `UnexpectedNativeError.miscellaneousInfo` | Reject with extra native context | The field carries the native context for diagnosis | A/I | U |
| API-ERR-006 | `Voice.Event.Error` | Force an SDK-level error outside any call, for example a registration failure | Raised with a `TwilioError`; the app is not required to have an active call to receive it | A/I | A |
| API-ERR-007 | Error namespace coverage | Enumerate the exported `TwilioErrors` namespace | All 12 generated namespaces plus `TwilioError`, `InvalidArgumentError`, `InvalidStateError`, `UnexpectedNativeError`, and `UnsupportedPlatformError` are reachable from the package entry point | A/I | U |
| API-ERR-008 | API report drift | Run `yarn check:api` | No diff. The generated error table and the public API report are committed, so an unintended surface change fails the check | A/I | U |

## 15 Expo config plugin

The plugin is a public entry point (`app.plugin.js`) with two documented props. It edits generated
Kotlin, so an Expo template change is the most likely cause of a break.

| ID | Test case | Steps | Expected result | Platform | Level |
| --- | --- | --- | --- | --- | --- |
| API-EXPO-001 | Plugin added with defaults | Add `"@twilio/voice-react-native-sdk"` to `plugins`, run `npx expo prebuild --clean -p android` | Generated `MainApplication` and `MainActivity` carry the voice proxy wiring; the build succeeds | A | A |
| API-EXPO-002 | iOS prebuild | Prebuild for iOS with defaults | `Info.plist` has `NSMicrophoneUsageDescription` and `UIBackgroundModes` containing both `audio` and `voip`; entitlements have `aps-environment: development` | I | A |
| API-EXPO-003 | `apsEnvironment` override | Pass `{ "apsEnvironment": "production" }` | Entitlement is `production` | I | A |
| API-EXPO-004 | `microphoneUsageDescription` override | Pass a custom string | It appears in `Info.plist` and in the runtime permission prompt | I | A |
| API-EXPO-005 | Existing values preserved | Set `NSMicrophoneUsageDescription` and `aps-environment` in the app config, then prebuild | The app's values win; the plugin does not overwrite them | I | A |
| API-EXPO-006 | Repeated prebuild | Prebuild twice without `--clean` | Wiring is not duplicated; the run-once guard holds | A | A |
| API-EXPO-007 | Conflicting `MainActivity` override | Pre-place a `MainActivity` that already overrides a method the plugin inserts, for example `onNewIntent` | Prebuild fails with an error naming the conflicting method and pointing at the manual wiring doc. Failing loudly is the expected result; silently skipping is a Fail | A | A |
| API-EXPO-008 | Expo SDK matrix | Prebuild and launch on each supported Expo SDK | Wiring applies and the native module instantiates on every version. The exercised set is recorded in `README.md` | A | A |
| API-EXPO-009 | Expo Go | Attempt to run in Expo Go | Fails with a clear message. Expo Go cannot load this native code, and that is documented | A/I | M |
| API-EXPO-010 | Bare app unaffected | Build a bare app that does not use the plugin | Manual wiring still works; the plugin is additive and not required | A/I | A |

## 16 Product findings that change expected results

Recorded so a known defect is never reported as a pass, and so a case is not rewritten to match
current behavior. Each has a case above that will change status when the finding is resolved.

| Finding | Affected cases | Status |
| --- | --- | --- |
| `PreflightTest.Event.Completed` is not raised on Android; observed at API 31, 34, 36, and 37. `getReport()` is unreachable through the documented path. Native telemetry reports `preflight: false` for these runs, so the native layer appears to treat them as ordinary outgoing calls | API-PRE-002, API-PRE-003, API-PRE-004, API-PRE-005 | Fail on Android. Not yet exercised on iOS |
| `showAvRoutePickerView` documents an Android resolution value of `null` while the implementation resolves with `undefined` | API-PLAT-015 | Limitation, VBLOCKS-5784 |
| `CallInvite.sendMessage` on iOS routes through the call message native method rather than an invite-specific one | API-MSG-007 | Characterized, VBLOCKS-5824 |
| `Call.getCustomParameters` returns the internal record rather than a copy | API-CALL-008 | Characterized |
| Android API 37 emulator images cannot obtain an FCM token, reproducibly, so registration and device-token cases cannot run there | API-VOICE-008, API-REG-001 to API-REG-013, API-PLAT-001 to API-PLAT-004 | Blocked on that level only; covered at API 31, 34, and 36 |
| Appium's UiAutomator2 driver requires API 26 or above, so API 24 carries build and launch coverage only | every `A` level case | Blocked on API 24 by driver constraint, not a product limitation |
| iOS cannot be built on the current development machine; only CommandLineTools is installed | every `I` level case | Not run, deferred by decision |

## 17 Related documents

- `test/MASTER_TEST_CASES.md` - the single catalog, this file merged with the platform and
  scenario suite
- `test/MASTER_TEST_PLAN.md` - tiers, matrix, credentials, environment, run results
- `api/voice-react-native-sdk.api.md` - the generated public API report these cases are derived from
- `docs/api/` - generated per-member API reference
- `docs/expo/app-config.md` - config plugin setup and props
