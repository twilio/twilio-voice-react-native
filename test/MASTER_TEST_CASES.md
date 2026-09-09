# Master test cases

The single catalog of test cases for a mobile VoIP application built on the Twilio Voice React
Native SDK, covering Android and iOS. It merges two inputs:

1. **API-derived cases** - one case per observable behavior of the SDK's exported surface at
   version 1.8.0, taken from `api/voice-react-native-sdk.api.md` and the implementations in `src/`.
   Detailed steps and the full argument-validation matrices live in `test/API_TEST_CASES.md`.
2. **Platform and scenario cases** - a mobile VoIP and WebRTC suite covering call lifecycle, audio
   routing, network behavior, OS interruptions, push notifications, permissions, backgrounding,
   reliability, and device and OS compatibility.

This file is the catalog of record. `test/MASTER_TEST_PLAN.md` remains the procedure: tiers,
environments, credentials, and run results. Do not record results here.

## 1 Scope

| Dimension | In scope | Out of scope |
| --- | --- | --- |
| Platforms | Android, iOS | web, desktop |
| App types | bare React Native, Expo with the config plugin | Expo Go, which cannot load this native code |
| Call directions | outgoing, incoming, client to client, client to PSTN | conferencing features not exposed by this SDK |
| Layers | JS public API, native binding, signaling, media, OS integration | Twilio server-side behavior beyond what the SDK observes |

What this catalog does not cover: TwiML application logic, the customer's token-minting service,
and any Twilio Console configuration. Those are preconditions, listed per case where relevant.

## 2 How the two sources were merged

**Deduplication rule.** Where a scenario case and an API case assert the same thing, they are one
case here, and both source IDs appear in the Source column. Example: mute behavior appears once as
`CTRL-001`, sourced from `TC-026` and `API-CALL-009`.

**Split rule.** A scenario case that the SDK exposes through more than one API is split so each has
its own assertion. Example: the source suite's single audio-routing case becomes separate cases for
enumeration, selection, the `AudioDevicesUpdated` event, and handle stability.

**Preserved rule.** API cases with no scenario counterpart, chiefly argument validation and native
payload guards, are preserved as their own rows because they are the cheapest cases to run and the
ones a refactor breaks first.

Every source ID maps to at least one case here. Section 9 is the reverse index.

## 3 Columns and conventions

| Column | Meaning |
| --- | --- |
| ID | `<DOMAIN>-<nnn>`. Permanent; a retired case keeps its ID and is marked Retired |
| Test case | What is being verified |
| Expected result | The assertion. A case without a checkable assertion is not a case |
| P | Priority, section 4 |
| Plat | `A` Android, `I` iOS, `A/I` both |
| Lvl | `U` unit with the native module mocked, `A` automated on device or emulator, `M` manual |
| Source | Origin IDs. `API-*` refers to `test/API_TEST_CASES.md`; `TC-*`, `AND-*`, `IOS-*`, `TW-*`, `PSTN-*` refer to the scenario suite |

**Row detail.** Scenario rows carry their own steps inline. API rows carry the assertion only; their
steps, invalid-input tables, and expected error messages are in `test/API_TEST_CASES.md` under the
same ID. That keeps one definition per case rather than two that can drift.

**Status vocabulary** when reporting a run: Pass, Fail, Blocked, Not run, Limitation, Characterized.
Defined in `test/MASTER_TEST_PLAN.md` section 3. Pass requires that the exact workflow ran and its
assertion succeeded. A shorter proxy, a simulator standing in for hardware, or an unimplemented
assertion is not a Pass.

## 4 Priority and the automation tiers

| P | Definition | Runs in |
| --- | --- | --- |
| P0 | A failure makes the product unusable for its primary purpose: place a call, receive a call, hear audio, end a call | PR on every change |
| P1 | A failure breaks a documented feature or a common real-world condition: routing, reconnection, push lifecycle, DTMF, messages, preflight | Nightly |
| P2 | Environment-specific or long-running coverage: device matrix, impairment sweeps, enterprise networks, soak | Release, Soak, Compatibility |
| P3 | Characterized behavior with no fixed product expectation, kept so a change is noticed | Release |

| Tier | Contents | Cadence |
| --- | --- | --- |
| PR | All P0, plus every `U` level case | Every pull request |
| Nightly | PR set plus all P1 | Nightly on the emulator and simulator matrix |
| Release | All P0 to P2 on the physical device matrix in section 5 | Per release candidate |
| Soak | `STRESS-*` | Weekly and per release candidate |
| Compatibility | Full catalog against a new Android or iOS major version, and against each native SDK upgrade | On each platform or SDK bump |

Rationale for weighting: incoming-call reliability, push lifecycle, CallKit and Android telecom
integration, audio routing, call-state races, network transitions, background and terminated
behavior, long-call stability, device and OS compatibility, and native SDK upgrade regressions
account for most field defects in mobile VoIP. Basic connect-and-hear-audio testing does not reach
them. The tier assignments above follow that weighting rather than API surface area.

## 5 Environment matrix

### 5.1 Android

| Axis | Coverage |
| --- | --- |
| API levels, emulator | 24 (`minSdkVersion`), 26, 29, 31, 33, 34 (`targetSdkVersion`), 35, 36, 37 |
| API levels, required minimum for a release | 26, 31, 33, 34, 36 |
| Physical devices | Google Pixel, Samsung Galaxy on One UI, Motorola, OnePlus; add Xiaomi when the user population includes it |
| App types | bare React Native, Expo across the supported Expo SDK versions recorded in `README.md` |

Android-specific areas that need explicit attention because behavior varies by level and by
manufacturer: foreground service types and start restrictions, notification permission on API 33
and above, notification trampoline restrictions on API 31 and above, Bluetooth runtime permissions,
audio focus, Doze, battery optimization, manufacturer background restrictions, and process
recreation.

Known environment constraints, both from the current harness rather than the product: Appium's
UiAutomator2 driver requires API 26 or above, so API 24 carries build and launch coverage only; and
the `google_apis` emulator image for API 37 cannot obtain an FCM token, reproducibly, so
push-dependent cases are Blocked on that level and covered at 31, 34, and 36.

### 5.2 iOS

| Axis | Coverage |
| --- | --- |
| iOS versions | oldest supported, previous major, current major; current beta when compatibility qualification is in scope |
| Physical devices | an older supported iPhone, a mainstream current-generation iPhone, a current Pro-class iPhone |
| Simulator | permitted for `U` and non-audio `A` cases only. CallKit, PushKit, and audio-route cases require hardware |

iOS-specific areas: CallKit, PushKit, `AVAudioSession` activation and interruption recovery, lock
screen behavior, Bluetooth and AirPods routing, app termination, and background execution.

### 5.3 Network conditions

Applied with a link conditioner or an impairment proxy: clean Wi-Fi, LTE, 5G, 10 percent loss,
20 percent loss, 300 ms one-way latency, jitter, constrained bandwidth, UDP blocked so only TURN
over TCP or TLS remains, IPv4-only, IPv6-only, and symmetric NAT.

## 6 Case catalog

### 6.1 Registration and device tokens (REG)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| REG-001 | Register for incoming calls | Launch, sign in, mint an access token, call `register(token)` | Registration succeeds, `Registered` raised, device receives invites | P0 | A/I | A | TC-001, API-REG-001 |
| REG-002 | Unregister | Register, then `unregister(token)`, then place a call to that identity | `Unregistered` raised; no invite delivered | P0 | A/I | A | API-REG-002, API-REG-003 |
| REG-003 | Register with an expired or malformed token | Launch with an expired or non-JWT token, register | Fails with an `AuthorizationErrors` class; the app can surface guidance and retry with a fresh token; no crash | P0 | A/I | A | TC-002, API-REG-004, API-REG-005 |
| REG-004 | Register with a token missing a Voice grant | Mint a token with no `VoiceGrant`, register | `AccessTokenGrantsInvalid` | P1 | A/I | A | API-REG-006 |
| REG-005 | Token expires while the app is running | Keep the app running past token expiry with the app's refresh active | Re-registration happens with no gap that drops an invite; an active call is not disrupted | P1 | A/I | M | TC-003, API-REG-009 |
| REG-006 | Register twice with the same token | Call `register` twice, then send one invite | Idempotent; the invite arrives once | P1 | A/I | A | API-REG-008 |
| REG-007 | Unregister without a prior register | Call `unregister` on a fresh instance | Resolves or rejects consistently; behavior recorded rather than assumed | P3 | A/I | A | API-REG-010 |
| REG-008 | Register with no network | Airplane mode, then register | Rejects within the SDK timeout; no promise left pending | P1 | A/I | A | API-REG-011 |
| REG-009 | Register with a non-string token | Pass a number, `null`, or `undefined` | An SDK error class, not a raw `TypeError` or native crash | P2 | A/I | A | API-REG-007 |
| REG-010 | Account has no push credential | Use an account with no FCM or APNs credential registered with Twilio | The failure is distinguishable from a device-side token failure | P1 | A/I | A | API-REG-012 |
| REG-011 | Device cannot obtain an FCM token | Run on a device or image whose Play Services cannot reach FCM | Rejects naming the token failure; no crash | P1 | A | A | API-REG-013 |
| REG-012 | Register on iOS with no push registry | Register before `initializePushRegistry` and with no app-owned PushKit handler | Behavior recorded; no silent success that never receives pushes | P1 | I | A | API-REG-014 |
| REG-013 | `getDeviceToken` returns the platform push token | Register push, then call `getDeviceToken()` | FCM registration token on Android, PushKit VoIP token on iOS | P1 | A/I | A | API-VOICE-008, API-VOICE-009 |
| REG-014 | `getDeviceToken` before a token exists | Call before push has produced a token | Rejects with a `TwilioError`; no crash | P2 | A/I | A | API-VOICE-010 |
| REG-015 | `getVersion` reports the native SDK version | Call `getVersion()` | Non-empty native version string, distinct from the React Native package version | P2 | A/I | A | API-VOICE-007 |
| REG-016 | Registration event type guards | Deliver `registered` and `unregistered` payloads with mismatched types | Throws rather than emitting a wrong-shaped event | P2 | A/I | U | API-REG-015, API-REG-016 |
| REG-017 | SDK-level error event | Force a registration failure with no call in progress | `Voice.Event.Error` delivers a `TwilioError` with a populated code | P1 | A/I | A | API-ERR-006 |
| REG-018 | `Voice` construction and Expo detection | Construct `Voice` in an Expo build and in a bare build | Native events bound once; the Expo SDK version is reported in an Expo app and `undefined` in a bare app | P2 | A/I | U, A | API-VOICE-001 to API-VOICE-005 |
| REG-019 | Unknown native voice event type | Emit an unrecognized event type on the voice scope | Throws naming the type; no silent drop | P2 | A/I | U | API-VOICE-006 |

### 6.2 Permissions (PERM)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PERM-001 | Microphone permission granted | Fresh install, place a call, allow the microphone | Call proceeds with two-way audio | P0 | A/I | M | TC-004 |
| PERM-002 | Microphone permission denied | Deny at the prompt, then place a call | `UserMediaErrors.PermissionDeniedError` surfaced through rejection or `ConnectFailure`; the app shows guidance; no crash | P0 | A/I | A | TC-005, API-CONN-044 |
| PERM-003 | Microphone permission permanently denied | Deny with "Don't ask again" on Android, or deny then revisit on iOS | The app directs the user to OS settings rather than re-prompting in a loop | P1 | A/I | M | TC-006 |
| PERM-004 | Microphone revoked during a call | Revoke the permission in OS settings while a call is connected | The call ends or mutes according to platform behavior; the app does not crash and reports a usable state | P1 | A/I | M | new |
| PERM-005 | Notification permission denied on Android 13 and above | Deny `POST_NOTIFICATIONS`, then receive an incoming call | Documented degradation: the invite still reaches the app, and the absence of a notification is handled without crashing | P1 | A | M | new |
| PERM-006 | Bluetooth permission denied | Deny `BLUETOOTH_CONNECT` on Android 12 and above, then attach a headset | Bluetooth devices are absent from enumeration; earpiece and speaker still work; no crash | P1 | A | M | new |
| PERM-007 | Microphone usage description present | Inspect the built iOS app | `NSMicrophoneUsageDescription` is present, either from the app config or the plugin default | P1 | I | A | API-EXPO-002, API-EXPO-004 |

### 6.3 Outgoing calls (OUT)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OUT-001 | Outgoing PSTN call | Dial a valid E.164 number | `Connecting`, then `Ringing` when signalled, then `Connected`; two-way audio | P0 | A/I | A | TC-007, API-CONN-001 |
| OUT-002 | Outgoing client-to-client call | Call another registered identity | The far end receives an invite and both sides establish audio | P0 | A/I | A | TC-008 |
| OUT-003 | Custom parameters reach the application | Connect with `params`, then with an empty object, and read them on the far end | Values arrive intact and are readable through `getCustomParameters`; an empty object sends no params | P1 | A/I | A | API-CONN-002, API-CONN-003, API-CALL-007 |
| OUT-004 | `connect` resolution does not imply answer | Connect and inspect state before the far end answers | Promise resolves with a `Call` in `Connecting`; documented semantics | P1 | A/I | A | API-CONN-001 |
| OUT-005 | Invalid or unroutable destination | Dial an invalid number | `ConnectFailure` with a populated error code; the UI resets | P0 | A/I | A | TC-009, PSTN-009 |
| OUT-006 | Remote party rejects | Place a call and reject on the far end | The caller reaches `Disconnected` promptly with the rejection reason available | P0 | A/I | A | TC-010 |
| OUT-007 | Remote party does not answer | Let it ring to timeout | Ends cleanly with the configured no-answer result; no stuck `Ringing` state | P0 | A/I | A | TC-011 |
| OUT-008 | Cancel before answer | Call `disconnect()` while `Connecting` | Setup is cancelled; no orphaned call on the far end | P1 | A/I | A | API-CALL-030 |
| OUT-009 | iOS contact handle | Connect with `contactHandle`, then with `''`, then omitted | The supplied value appears as the CallKit handle and in call history; empty or omitted yields `Default Contact` | P1 | I | U, M | API-CONN-004 to API-CONN-006 |
| OUT-010 | Android notification display name | Connect with `notificationDisplayName`, then with `''` | The value appears in the ongoing-call notification; empty behaves as unset | P1 | A | M | API-CONN-008, API-CONN-009 |
| OUT-011 | Cross-platform options are inert | Pass `contactHandle` on Android and `notificationDisplayName` on iOS | Ignored with no error, as documented | P2 | A/I | U | API-CONN-007, API-CONN-010 |
| OUT-012 | Contact handle template | Set a template containing a parameter placeholder, then receive a call carrying that parameter | The Android notification title and the iOS CallKit handle render the substituted value; unsetting restores default behavior | P1 | A/I | M | API-PLAT-016 to API-PLAT-019 |
| OUT-013 | Expired token on connect | Connect with an expired token | Rejects with an `AuthorizationErrors` class carrying description, explanation, causes, and solutions | P0 | A/I | A | API-CONN-040 to API-CONN-042 |
| OUT-014 | Invalid TwiML application | Connect with a token pointing at a non-existent application | `TwiMLErrors.InvalidApplicationSid` | P1 | A/I | A | API-CONN-043 |
| OUT-015 | Connect with no network | Airplane mode, then connect | Fails within the SDK timeout with a general or signaling error | P0 | A/I | A | API-CONN-045, TC-047 |
| OUT-016 | Unsupported platform | Invoke `connect` where the platform is neither Android nor iOS | `UnsupportedPlatformError` naming the platform | P2 | A/I | U | API-CONN-015 |
| OUT-017 | Connect argument validation | Exercise every invalid input in `test/API_TEST_CASES.md` section 4.2 | Each throws `InvalidArgumentError` naming the offending argument; never a raw `TypeError` | P1 | A/I | U | API-CONN-020 to API-CONN-037 |
| OUT-018 | Concurrent outgoing attempts | Call `connect` twice in quick succession | Documented behavior: both calls exist and are independently addressable, or the second is rejected. No shared-state corruption | P1 | A/I | M | new |

### 6.4 Incoming calls (INC)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| INC-001 | Incoming call, app foregrounded | Place an inbound call with the app open | `Voice.Event.CallInvite` raised promptly with a `Pending` invite; incoming UI appears | P0 | A/I | A | TC-012, API-CI-001 |
| INC-002 | Incoming call, app backgrounded | Background the app, then place an inbound call | The system call UI or notification appears and the call can be answered | P0 | A/I | M | TC-016 |
| INC-003 | Incoming call, app terminated | Force-stop the app, then place an inbound call | Push wakes the app; the invite is surfaced and can be answered | P0 | A/I | M | TC-017 |
| INC-004 | Accept | Accept a pending invite | Resolves with a `Call`; `Accepted` raised; two-way audio; invite state `Accepted` | P0 | A/I | A | TC-013, API-CI-003 |
| INC-005 | Reject | Reject a pending invite | `Rejected` raised; state `Rejected`; the caller observes the rejection; local UI clears | P0 | A/I | A | TC-014, API-CI-010 |
| INC-006 | Caller cancels before answer | Caller hangs up while the invite is pending | `Cancelled` raised; incoming UI disappears; no stale invite remains addressable | P0 | A/I | A | TC-015, API-CI-014, API-CI-015 |
| INC-007 | Invite metadata | Read the getters on a pending invite | `getCallSid`, `getFrom`, `getTo`, and `getCustomParameters` are populated and match what the caller sent | P1 | A/I | A | API-CI-002 |
| INC-008 | Duplicate invite delivery | Deliver the same push twice | One call UI, one `Call` object, one `CallInvite`. A second is a Fail | P0 | A/I | A | TC-018, AND-005, IOS-004 |
| INC-009 | Two simultaneous inbound invites | Send invite A, then invite B before A is settled | Behavior matches product policy - second queued, rejected, or displayed - and both are individually addressable with events routed by call SID | P1 | A/I | M | TC-019, API-CI-018 |
| INC-010 | Inbound invite during an active call | Establish call A, then send invite B | Configured busy behavior applies; call A's audio and state are unaffected | P1 | A/I | M | TC-020 |
| INC-011 | Accept a second invite while a call is active | Accept B while A is connected | Both calls exist with distinct uuids; audio focus follows platform policy; `getCalls` reports both | P1 | A/I | M | API-INV-004 |
| INC-012 | Accept with custom ICE options | Accept with `iceServers` and `iceTransportPolicy` | Call connects; the candidate pair reflects the supplied configuration | P1 | A/I | A | API-CI-004, API-CI-005 |
| INC-013 | Accept ICE option validation | Accept with each invalid ICE shape | `InvalidArgumentError` before any native call | P1 | A/I | U | API-CI-006 |
| INC-014 | Notification tapped | Tap the incoming-call notification | `NotificationTapped` raised once; the app can foreground its call UI | P1 | A | M | API-CI-016 |
| INC-015 | Caller handle updated before answer | On iOS, update the caller handle after the invite is reported to CallKit, then repeat the call after accepting | The system incoming-call screen shows the new handle. The post-accept call is documented as out of the intended window; its behavior is recorded rather than assumed | P1 | I | M | API-CI-021, API-CI-022 |
| INC-016 | Caller handle update on Android | Call the iOS-only method on Android | `UnsupportedPlatformError` | P2 | A | U | API-CI-023 |
| INC-017 | Invite validity check | Call `isValid` on pending, cancelled, and post-relaunch invites | Distinguishes answerable from expired invites without throwing. Alpha API, so a divergence is Characterized | P2 | A/I | A | API-CI-024 to API-CI-026 |
| INC-018 | Malformed native invite event | Deliver a non-object, `null`, or SID-less invite event | Throws a `TwilioError` naming the defect; no silent drop | P2 | A/I | U | API-CI-019, API-CI-020 |
| INC-019 | Pending invite inventory | Query `getCallInvites` with none, one pending, and after settling | Empty, then the pending invite, then empty again | P1 | A/I | A | API-INV-005 to API-INV-007 |
| INC-020 | Invite recovery after relaunch | Receive an invite, relaunch, query the inventory | Documented and consistent behavior; recorded as Characterized until the contract is stated | P2 | A/I | M | API-INV-008 |

### 6.5 Call lifecycle and state machine (LIFE)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| LIFE-001 | Call state progression | Record `getState()` and every event through an answered call | Valid sequence only: `Connecting`, `Ringing` when signalled, `Connected`, `Disconnected`. No repeats, no backward transitions | P0 | A/I | A | TW-001, API-CEV-001, API-CEV-020, API-CALL-001, API-CALL-002 |
| LIFE-002 | Invite state progression | Drive an invite through each terminal state | `Pending` to exactly one of `Accepted`, `Rejected`, `Cancelled` | P0 | A/I | A | TW-002 |
| LIFE-003 | Local hangup | Tap End on a connected call | Media stops, the Twilio call disconnects, `Disconnected` raised with no error, UI resets | P0 | A/I | A | TC-021, API-CALL-029, API-CEV-004 |
| LIFE-004 | Remote hangup | Far end ends the call | `Disconnected` raised promptly; local call state clears | P0 | A/I | A | TC-022, API-CEV-005 |
| LIFE-005 | Duplicate accept | Accept the same invite twice | Second accept throws `InvalidStateError`; no second `Call` object | P0 | A/I | U, A | TW-003, API-CI-007 |
| LIFE-006 | Accept after cancellation | Let the caller cancel, then accept | `InvalidStateError`; no phantom active call | P0 | A/I | A | TW-004, API-CI-009 |
| LIFE-007 | Reject after cancellation | Let the caller cancel, then reject | `InvalidStateError`; no crash | P1 | A/I | A | TW-005, API-CI-013 |
| LIFE-008 | Disconnect during connect | Call `disconnect()` while `Connecting` | Clean termination; no orphaned far-end call; `Disconnected` raised once | P0 | A/I | A | TW-006, API-CALL-030 |
| LIFE-009 | Concurrent SDK events | Drive mute, hold, a call message, and a route change within the same second | Application state stays deterministic; every event is delivered once; no lost or duplicated state | P1 | A/I | M | TW-007 |
| LIFE-010 | Accept and reject after the opposite terminal state | Accept then reject, and reject then accept | Each second call throws `InvalidStateError`; the first outcome stands | P1 | A/I | U, A | API-CI-008, API-CI-012 |
| LIFE-011 | Duplicate reject | Reject the same invite twice | Second call throws `InvalidStateError` | P1 | A/I | U, A | API-CI-011 |
| LIFE-012 | Disconnect twice | Disconnect, wait for `Disconnected`, disconnect again | Rejects or no-ops; no crash and no second `Disconnected` | P1 | A/I | A | API-CALL-031 |
| LIFE-013 | Methods on a disconnected call | Call `mute`, `hold`, `sendDigits`, `getStats` after `Disconnected` | Each rejects with a `TwilioError`; no crash | P1 | A/I | A | API-CALL-032 |
| LIFE-014 | No events after a terminal state | Keep a completed call's listeners bound for 30 seconds | No further events emitted on that object | P1 | A/I | A | API-CEV-019 |
| LIFE-015 | Event routing between concurrent calls | Establish two calls, raise an event for one | Only the matching `Call` emits, gated by uuid | P0 | A/I | U | API-CEV-013 |
| LIFE-016 | State readable inside every listener | Assert `getState()` inside each event listener | The state matches the event that is firing | P1 | A/I | U | API-CEV-018 |
| LIFE-017 | Late listener binding | Bind a `Connected` listener after the call has already connected | Not invoked retroactively; the app must read `getState()`. Documented, recorded as Characterized | P2 | A/I | A | API-CEV-016 |
| LIFE-018 | `on` and `addListener` are aliases | Bind the same event with both | Both listeners are invoked | P2 | A/I | U | API-CEV-017 |
| LIFE-019 | Unknown or mismatched native call event | Deliver an unrecognized type, then a payload whose type does not match its handler | Throws in both cases; no wrong-shaped event is emitted | P2 | A/I | U | API-CEV-014, API-CEV-015 |
| LIFE-020 | Call identity fields | Read `getSid`, `getFrom`, `getTo` before and after `Connected` | `undefined` before native info arrives, populated after; the SID is `CA` prefixed | P1 | A/I | A | API-CALL-003, API-CALL-004 |
| LIFE-021 | Initial connected timestamp | Read before connect, after connect, and after a reconnect | `undefined`, then a `Date` matching the connect time, and unchanged by a later reconnect | P1 | A/I | A, M | API-CALL-005, API-CALL-006 |
| LIFE-022 | Active call inventory | Query `getCalls` with none, one active, and after disconnect | Empty, then one keyed entry matching the live call, then empty | P1 | A/I | A | API-INV-001 to API-INV-003 |
| LIFE-023 | Custom parameter record ownership | Mutate the record returned by `getCustomParameters`, read again | Behavior recorded. The getter returns the internal record, so the mutation is visible. Characterized, a hardening candidate | P3 | A/I | U | API-CALL-008 |
| LIFE-024 | Connect failure never reaches connected | Force a setup failure | `ConnectFailure` raised once with a populated code; `Connected` never raised | P0 | A/I | A | API-CEV-003 |
| LIFE-025 | Ringing before connected | Call an endpoint that signals ringing | `Ringing` raised before `Connected`, exactly once | P1 | A/I | A | API-CEV-002 |

### 6.6 Call controls (CTRL)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CTRL-001 | Mute the local microphone | Mute during a connected call | Resolves `true`; `isMuted()` is `true`; the far end hears no local speech | P0 | A/I | A | TC-026, API-CALL-009 |
| CTRL-002 | Unmute | Unmute | Resolves `false`; audio resumes without a gap beyond the product threshold | P0 | A/I | A | TC-027, API-CALL-010 |
| CTRL-003 | Repeated mute toggling | Toggle 20 times | Every call resolves with the requested state; the final state matches the last call | P1 | A/I | A | API-CALL-012 |
| CTRL-004 | Mute state before native info | Read `isMuted()` on a freshly constructed call | `undefined`, not `false` | P2 | A/I | U | API-CALL-011 |
| CTRL-005 | Hold | Put a connected call on hold | Resolves `true`; `isOnHold()` is `true`; media is suspended per product behavior | P1 | A/I | A | API-CALL-013 |
| CTRL-006 | Resume from hold | Take the call off hold | Resolves `false`; two-way audio returns | P1 | A/I | A | API-CALL-014 |
| CTRL-007 | Hold state before native info | Read `isOnHold()` before native state arrives | `undefined` | P2 | A/I | U | API-CALL-015 |
| CTRL-008 | Hold both ends | Both parties hold, then release in each order | No stuck one-way audio; both directions recover | P1 | A/I | M | new |
| CTRL-009 | Post call feedback | Post a valid score and issue after a call | Resolves | P1 | A/I | A | API-CALL-024 |
| CTRL-010 | Post feedback with `NotReported` | Post `NotReported` for both arguments | Resolves | P2 | A/I | U, A | API-CALL-025 |
| CTRL-011 | Post feedback with invalid arguments | Pass an out-of-range score or an unknown issue | `InvalidArgumentError` naming the argument and referencing the enum | P1 | A/I | U | API-CALL-026, API-CALL-027 |
| CTRL-012 | Every score and issue value accepted | Iterate all six scores and seven issues | Each combination resolves and maps to its native value | P2 | A/I | U | API-CALL-028 |

### 6.7 DTMF and PSTN interoperability (PSTN)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PSTN-001 | Digits 0 through 9 | Send each digit individually against a digit-reporting endpoint | Every digit is received exactly once, in order | P0 | A/I | A | PSTN-001, API-CALL-016 |
| PSTN-002 | Star and pound | Send `*` and `#` | Both are received | P1 | A/I | A | PSTN-002, API-CALL-018 |
| PSTN-003 | Rapid sequence | Send `1234567890#` in one call | All characters are received in order with no drops | P1 | A/I | A | PSTN-003, API-CALL-017 |
| PSTN-004 | IVR navigation | Navigate a multi-level IVR using DTMF | Each menu level responds to the sent digits | P1 | A/I | M | PSTN-004 |
| PSTN-005 | DTMF while muted | Mute, then send digits | Digits are still delivered; DTMF is signalled out of band from the audio path | P1 | A/I | A | PSTN-005, API-CALL-019 |
| PSTN-006 | International PSTN number | Dial a valid international E.164 number | Call connects with two-way audio | P1 | A/I | M | PSTN-006 |
| PSTN-007 | Toll-free number | Dial a toll-free number | Call connects with two-way audio | P2 | A/I | M | PSTN-007 |
| PSTN-008 | Busy destination | Dial a busy destination | `ClientErrors.BusyHere` or `SIPServerErrors.BusyEverywhere` surfaced; UI resets | P1 | A/I | A | PSTN-008 |
| PSTN-009 | Invalid destination | Dial an unroutable number | Failure with a populated error code; UI resets | P0 | A/I | A | PSTN-009, TC-009 |
| PSTN-010 | Caller ID presentation | Place a call with a configured caller ID | The far end shows the expected caller ID | P1 | A/I | M | PSTN-010 |
| PSTN-011 | Invalid DTMF characters | Send letters or an empty string | Rejects, or the native layer drops the invalid characters. Behavior recorded per platform; the JS layer does not validate this argument | P2 | A/I | A | API-CALL-020 |
| PSTN-012 | DTMF before connected | Send digits while `Connecting` | Rejects rather than silently dropping | P2 | A/I | A | API-CALL-021 |

### 6.8 Call messages (MSG)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| MSG-001 | Send a user-defined message from a call | Send with object content during a connected call | Resolves with an `OutgoingCallMessage`; `Sent` raised; SID populated | P1 | A/I | A | API-MSG-001 |
| MSG-002 | Receive on the far end | Send from A to B during a connected call | B's call raises `MessageReceived` with matching content, content type, message type, and a SID | P1 | A/I | A | API-MSG-005, API-CEV-012 |
| MSG-003 | Bidirectional exchange | Both parties send and receive within one call | Every message delivered once in each direction, with matching SIDs on send and receive | P1 | A/I | A | API-MSG-020 |
| MSG-004 | Content encoding | Send object content, then string content | Object content is JSON-stringified once; string content passes through unchanged | P1 | A/I | U | API-MSG-003, API-MSG-004 |
| MSG-005 | Default content type | Omit `contentType` | `application/json` is used | P2 | A/I | U | API-MSG-002 |
| MSG-006 | Send from a pending invite | Send from a `CallInvite` on each platform | The far end receives the message on both. On iOS the call records that the path routes through the call message native method rather than an invite-specific one | P1 | A/I | A | API-MSG-006, API-MSG-007 |
| MSG-007 | Message argument validation | Omit content, pass `null` content, a non-string `messageType`, a non-string `contentType` | Each throws `InvalidArgumentError` naming the field | P1 | A/I | U | API-MSG-008 to API-MSG-011 |
| MSG-008 | Unsupported message type | Send a message type outside the accepted set | `CallMessageEventTypeInvalidError` through rejection or the `Failure` event | P1 | A/I | A | API-MSG-012 |
| MSG-009 | Payload over the size limit | Send content larger than the documented maximum | `PayloadSizeExceededError` on `Failure`; the call is unaffected | P1 | A/I | A | API-MSG-013 |
| MSG-010 | Message rate exceeded | Send faster than the documented rate limit | `RateExceededError` on `Failure`; the call is unaffected | P1 | A/I | A | API-MSG-014 |
| MSG-011 | Send in an invalid call state | Send before `Connected` and after `Disconnected` | Rejects, or `Failure` carries `CallMessageUnexpectedStateError` | P1 | A/I | A | API-MSG-015 |
| MSG-012 | Event routing by voice event SID | Send two messages, raise `Sent` for one SID | Only the matching object emits | P2 | A/I | U | API-MSG-016 |
| MSG-013 | Unknown message event type | Deliver an unrecognized type on the call message scope | Throws naming the type | P2 | A/I | U | API-MSG-017 |
| MSG-014 | Failure payload shape | Force a failure | The listener receives a `TwilioError` with a populated code | P1 | A/I | A | API-MSG-018 |
| MSG-015 | SID absent before send completes | Construct an incoming message with no voice event SID | `getSid()` returns `undefined`, not an empty string | P2 | A/I | U | API-MSG-019 |
| MSG-016 | Receive a message on a pending invite | Caller sends a message before the invite is answered | The invite raises `MessageReceived` with an incoming message; accepting afterwards still works | P1 | A/I | A | API-CI-017 |

### 6.9 Audio and media (AUD)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| AUD-001 | Two-way audio | Establish a call between two real endpoints and speak in both directions | Both parties hear intelligible audio with no unexpected clipping or dropout | P0 | A/I | M | TC-025 |
| AUD-002 | Device enumeration | Call `getAudioDevices` with no accessory attached | Returns the device list and the selected device; an earpiece and a speaker are both present; every entry carries `uuid`, `type`, `nativeType`, `name` | P0 | A/I | A | API-AUD-001, API-AUD-003 |
| AUD-003 | No selected device reported | Native layer reports no selection | The result omits the `selectedDevice` key rather than setting it to `undefined` | P2 | A/I | U | API-AUD-002 |
| AUD-004 | Speaker on and off | Select speaker, then earpiece, during a call | Audio switches route each time; the selected device is reflected on re-enumeration | P0 | A/I | M | TC-028, API-AUD-004 |
| AUD-005 | Selection raises the update event | Bind `AudioDevicesUpdated`, then select a different device | Event raised with the full list and the new selection | P1 | A/I | A | API-AUD-005 |
| AUD-006 | Bluetooth headset connected before the call | Pair and connect, then place a call | Call audio uses the headset according to routing policy; a `Bluetooth` device is listed with the accessory name | P1 | A/I | M | TC-029, API-AUD-008 |
| AUD-007 | Bluetooth connected during a call | Connect the headset mid-call | Audio transfers without dropping the call; an update event is raised | P1 | A/I | M | TC-030 |
| AUD-008 | Bluetooth disconnected during a call | Disconnect the headset mid-call | Route falls back to speaker or earpiece; the call survives; the Bluetooth entry disappears | P1 | A/I | M | TC-031, API-AUD-009 |
| AUD-009 | Wired headset insertion and removal | Insert then remove during a call | Route updates in both directions with no silence | P1 | A/I | M | TC-032 |
| AUD-010 | Bluetooth SCO audio | Place a call over a Bluetooth headset and speak in both directions | Bidirectional audio works over SCO | P1 | A | M | TC-033 |
| AUD-011 | AirPods during an active call | Connect AirPods mid-call and speak | Both the output route and the microphone switch correctly | P1 | I | M | TC-034 |
| AUD-012 | Repeated route changes | Switch route 20 times during one call | No crash, no silence, no stuck audio session; one event per switch | P1 | A/I | M | TC-035, API-AUD-013 |
| AUD-013 | Severe input amplitude | Drive the microphone with a very loud source | The media path does not crash; metrics and logging stay coherent | P2 | A/I | M | TC-036 |
| AUD-014 | Low microphone input | Speak at a very low level | Audio remains functional; degradation is reported through quality metrics rather than failing the call | P2 | A/I | M | TC-037 |
| AUD-015 | Background noise | Place a call in a noisy environment | Call remains stable; echo cancellation and noise suppression behave as configured | P2 | A/I | M | TC-038 |
| AUD-016 | Echo | Run an echo test on speaker at high volume | Echo stays within the product threshold | P2 | A/I | M | TC-039 |
| AUD-017 | Handle stability across updates | Capture a device `uuid`, trigger an update by selecting a device, re-enumerate | The same physical device keeps its `uuid`, so a held handle stays selectable. Regression case for a defect present through 1.7.0 | P1 | A | A | API-AUD-006 |
| AUD-018 | Selection on a stale handle | Hold a device object, remove that device, select it | Rejects with a `TwilioError`; no crash | P2 | A/I | M | API-AUD-007 |
| AUD-019 | Native device type passthrough | Inspect `nativeType` per platform | iOS values correspond to `AVAudioSessionPort` constants; Android values correspond to AudioSwitch class names | P2 | A/I | A | API-AUD-010, API-AUD-011 |
| AUD-020 | Unrecognized device type | Native layer reports a type the SDK does not map | `type` is `Unknown` and `nativeType` carries the raw value | P2 | A/I | U | API-AUD-012 |
| AUD-021 | AV route picker on iOS | Call `showAvRoutePickerView` during a call | The native picker is presented | P1 | I | M | API-PLAT-014 |
| AUD-022 | AV route picker on Android | Call the same method on Android | Resolves with no UI. The doc comment states `null` while the implementation resolves `undefined`; recorded as a Limitation | P3 | A | U | API-PLAT-015 |
| AUD-023 | Ringback tone on outgoing calls | Configure ringback per the SDK doc, place a call | Ringback plays until the far end answers, then stops | P2 | A/I | M | new |
| AUD-024 | Audio after an interrupted route change | Change route while the call is reconnecting | Route change either applies or fails cleanly; audio returns after reconnection | P2 | A/I | M | new |

### 6.10 Network, ICE, and signaling behavior (NET)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| NET-001 | Call over Wi-Fi | Place a call on clean Wi-Fi | Connects and remains stable for the call duration | P0 | A/I | A | TC-041 |
| NET-002 | Call over LTE or 5G | Place a call on cellular data | Connects and remains stable | P0 | A/I | M | TC-042 |
| NET-003 | Wi-Fi to cellular handoff | Disable Wi-Fi mid-call with cellular available | The call either migrates and recovers, raising `Reconnecting` then `Reconnected`, or fails cleanly with an error. No silent one-way audio | P1 | A/I | M | TC-043 |
| NET-004 | Cellular to Wi-Fi handoff | Re-enable Wi-Fi mid-call | Same as above | P1 | A/I | M | TC-044 |
| NET-005 | Brief network loss, 2 seconds | Drop the link for 2 seconds | Call recovers; `Reconnecting` then `Reconnected`; no UI corruption | P1 | A/I | M | TC-045, API-CEV-007, API-CEV-008 |
| NET-006 | Extended network loss, 10 to 30 seconds | Drop the link for 10 to 30 seconds | Either reconnects within the SDK window or disconnects with an error. No indefinite `Reconnecting` | P1 | A/I | M | TC-046, API-CEV-009 |
| NET-007 | Airplane mode during a call | Enable airplane mode mid-call | The call disconnects with a populated error; state clears | P0 | A/I | A | TC-047, API-CEV-006 |
| NET-008 | High latency | Apply 300 ms one-way latency | The call connects or degrades predictably; RTT in stats reflects the added latency | P1 | A/I | M | TC-048 |
| NET-009 | Packet loss, 5 percent | Apply 5 percent loss | Voice remains usable; `packetsLost` in stats is non-zero | P1 | A/I | M | TC-049 |
| NET-010 | Packet loss, 10 to 20 percent | Apply 10 to 20 percent loss | The app stays stable and surfaces degraded quality through `QualityWarningsChanged` | P1 | A/I | M | TC-050, API-CEV-010 |
| NET-011 | Jitter | Apply jitter | Media stays stable within product limits; jitter appears in stats | P1 | A/I | M | TC-051 |
| NET-012 | Low bandwidth | Constrain bandwidth below the codec's comfortable rate | Media adapts; no crash | P1 | A/I | M | TC-052 |
| NET-013 | UDP blocked | Block UDP so only TURN over TCP or TLS remains | The call connects over the fallback path; the active candidate pair reports the relay protocol | P1 | A/I | M | TC-053 |
| NET-014 | Restricted enterprise network | Run behind a restrictive firewall and proxy | Connectivity succeeds through the supported ICE and TURN path, or fails with an actionable error | P2 | A/I | M | TC-054 |
| NET-015 | IPv4-only network | Place a call on an IPv4-only network | The call works | P2 | A/I | M | TC-055 |
| NET-016 | IPv6 network | Place a call on an IPv6 network | The call works | P2 | A/I | M | TC-056 |
| NET-017 | NAT traversal | Place a call from behind a typical home NAT | ICE negotiation succeeds | P1 | A/I | M | TC-057 |
| NET-018 | Symmetric NAT | Place a call from behind symmetric NAT | TURN relay establishes media | P1 | A/I | M | TC-058 |
| NET-019 | ICE failure | Force ICE to fail, for example `Relay` policy with unreachable TURN | A media or connection error is raised within the SDK timeout and recorded; no indefinite hang | P1 | A/I | A | TW-008, API-CONN-014 |
| NET-020 | Signaling disconnect | Interrupt signaling while the call is up | The SDK transitions through `Reconnecting` and then to a terminal state; the app is never left in an unknown state | P1 | A/I | M | TW-009 |
| NET-021 | Media connection failure | Block media while leaving signaling intact | The user is given a meaningful failure state rather than a connected call with no audio | P1 | A/I | M | TW-010 |
| NET-022 | Custom ICE servers on connect and accept | Connect and accept with a valid TURN list | Both paths connect; the candidate pair reflects the supplied server | P1 | A/I | A | API-CONN-011, API-CI-004 |
| NET-023 | Relay transport policy | Connect and accept with `Relay` and valid TURN | Media flows over a relay candidate pair | P1 | A/I | A | API-CONN-012, API-CI-005, API-STAT-005 |
| NET-024 | All transport policy | Connect with `All` | Connects; any candidate type may be selected | P2 | A/I | A | API-CONN-013 |
| NET-025 | Quality warnings raised and cleared | Degrade the network, then restore it | `QualityWarningsChanged` fires with the warning in `current`, then again with it moved to `previous` | P1 | A/I | A | API-CEV-010, API-CEV-011 |

### 6.11 Call statistics (STATS)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STATS-001 | Report shape | Call `getStats` on a connected call | Returns `peerConnectionId` plus the local audio, remote audio, ICE candidate, and ICE candidate pair collections | P1 | A/I | A | API-CALL-022, API-STAT-001 |
| STATS-002 | Counters advance | Take two reports 5 seconds apart | Sent and received byte and packet counters increase on both the local and remote track stats | P1 | A/I | A | API-STAT-002, API-STAT-003 |
| STATS-003 | Active candidate pair | Inspect the pair collection | Exactly one entry is the active pair, in `STATE_SUCCEEDED`, with local and remote addresses populated | P1 | A/I | A | API-STAT-004 |
| STATS-004 | Candidate enumeration | Inspect the candidate collection | Entries carry type, address, port, protocol, priority, transport, remote flag, deleted flag, and url | P2 | A/I | A | API-STAT-006 |
| STATS-005 | Stats under impairment | Apply 10 percent loss, then read stats | `packetsLost` is non-zero and the reported MOS degrades against a clean baseline | P1 | A/I | M | API-STAT-007 |
| STATS-006 | Stats after reconnection | Force a reconnect, then read stats | A report is still returned; the active pair may have changed | P2 | A/I | M | API-STAT-008 |
| STATS-007 | Stats before connected | Call `getStats` while `Connecting` | Rejects or returns empty collections; behavior recorded | P2 | A/I | A | API-CALL-023, API-STAT-001 |
| STATS-008 | Public field names are stable | Compare the returned object against the API report | Field names match the committed report, including the misspelled received-bytes field on remote track stats, which is part of the public surface | P2 | A/I | U | API-STAT-003, API-ERR-008 |

### 6.12 Android push and FCM lifecycle (PUSH-A)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PUSH-A-001 | Push while foregrounded | Deliver an incoming-call push with the app open | The invite is processed exactly once | P0 | A | A | AND-001 |
| PUSH-A-002 | Push while backgrounded | Background the app, deliver a push | The incoming call appears promptly | P0 | A | M | AND-002 |
| PUSH-A-003 | Push while the app is killed | Force-stop the app, deliver a push | The app handles the incoming call correctly and it can be answered | P0 | A | M | AND-003 |
| PUSH-A-004 | Delayed push | Deliver a push for an invite that has already been cancelled or expired | The invite is not presented as answerable; any UI shown is dismissed | P0 | A | M | AND-004 |
| PUSH-A-005 | Duplicate push | Deliver the same push twice | One invite, one call UI | P0 | A | A | AND-005, INC-008 |
| PUSH-A-006 | Invalid push payload | Deliver a malformed or non-Twilio payload | Ignored safely; no crash. Through the out-of-band path this resolves `false` for a non-Twilio message and rejects for a malformed Twilio-shaped one | P1 | A | A | AND-006, API-PLAT-002, API-PLAT-003 |
| PUSH-A-007 | FCM token rotation | Force a token refresh | The app re-registers with the new token and continues to receive invites | P1 | A | M | AND-007 |
| PUSH-A-008 | Reinstall | Uninstall, reinstall, register | A new push token is obtained and registration works | P1 | A | M | AND-008 |
| PUSH-A-009 | Battery optimization enabled | Leave the app subject to battery optimization, then deliver a push after idle time | Incoming-call reliability is characterized for this configuration; the observed behavior is recorded per manufacturer | P1 | A | M | AND-009 |
| PUSH-A-010 | Doze mode | Put the device into Doze, then deliver a push | Incoming-call behavior is recorded; a high-priority VoIP push is expected to be delivered | P1 | A | M | AND-010 |
| PUSH-A-011 | Background restrictions enabled | Enable background restriction for the app, then deliver a push | Documented platform limitation is handled without a crash and with a diagnosable state | P1 | A | M | AND-011 |
| PUSH-A-012 | Out-of-band messaging service | Opt out of the built-in service and pass pushes through `handleFirebaseMessage` | Resolves `true` and the invite is raised. See `docs/out-of-band-firebase-messaging-service.md` | P1 | A | A | API-PLAT-001 |
| PUSH-A-013 | Out-of-band path while the built-in service is active | Do not opt out, then call `handleFirebaseMessage` | Rejects, or the invite is delivered exactly once. A duplicate invite is a Fail | P1 | A | A | API-PLAT-004 |
| PUSH-A-014 | Firebase message handling on iOS | Call `handleFirebaseMessage` on iOS | `UnsupportedPlatformError` naming Android as the only supported platform | P2 | I | U | API-PLAT-005 |
| PUSH-A-015 | Application id matches the Firebase configuration | Build with an application id absent from `google-services.json`, then register | The failure is diagnosable as a configuration error rather than presenting as a broken SDK | P2 | A | M | new |
| PUSH-A-016 | Foreground service during a call | Place and receive calls on API 31 and above, then on API 34 and above | The ongoing-call foreground service starts with the correct type and is not blocked by the platform's start restrictions | P1 | A | M | new |
| PUSH-A-017 | Notification trampoline restriction | Tap the incoming-call notification on API 31 and above | The app's call UI is brought forward without violating the trampoline restriction | P1 | A | M | new |

### 6.13 iOS push, PushKit, and CallKit (PUSH-I)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PUSH-I-001 | VoIP push while foregrounded | Deliver a VoIP push with the app open | The invite is processed exactly once | P0 | I | M | IOS-001 |
| PUSH-I-002 | VoIP push while backgrounded | Background the app, deliver a push | The CallKit incoming call screen is shown | P0 | I | M | IOS-002 |
| PUSH-I-003 | VoIP push with the app terminated | Force-quit the app, deliver a push | The app wakes and reports the incoming call to CallKit within the platform deadline | P0 | I | M | IOS-003 |
| PUSH-I-004 | Duplicate PushKit payload | Deliver the same payload twice | One CallKit call, one invite | P0 | I | M | IOS-004, INC-008 |
| PUSH-I-005 | Expired invite | Deliver a push for an invite that has already been cancelled | The CallKit UI is never shown as active, or is dismissed immediately | P0 | I | M | IOS-005 |
| PUSH-I-006 | PushKit token rotation | Force a VoIP token change | Registration updates and invites continue to arrive | P1 | I | M | IOS-006 |
| PUSH-I-007 | Reinstall | Uninstall, reinstall, register | The PushKit token and registration recover | P1 | I | M | IOS-007 |
| PUSH-I-008 | Answer from CallKit | Answer from the system call screen | The Twilio invite is accepted and CallKit state stays synchronized with the SDK call state | P0 | I | M | IOS-008 |
| PUSH-I-009 | Reject from CallKit | Reject from the system call screen | The invite is rejected and the CallKit transaction completes | P0 | I | M | IOS-009 |
| PUSH-I-010 | End from the lock screen | End an active call from the lock screen | The Twilio call disconnects and the app observes `Disconnected` | P0 | I | M | IOS-010 |
| PUSH-I-011 | SDK-owned push registry | Call `initializePushRegistry` at launch, then deliver pushes in each app state | Invites are surfaced in foreground, background, and terminated states | P0 | I | A | API-PLAT-006 |
| PUSH-I-012 | Push registry initialized twice | Call `initializePushRegistry` twice | No duplicate handlers; invites arrive once | P1 | I | A | API-PLAT-007 |
| PUSH-I-013 | Push registry on Android | Call the iOS-only method on Android | `UnsupportedPlatformError` | P2 | A | U | API-PLAT-008 |
| PUSH-I-014 | Application-owned PushKit handler | Implement the app's own handler alongside the SDK, per `docs/applications-own-pushkit-handler.md` | Invites are delivered once; the documented conflict behavior holds | P1 | I | M | API-PLAT-009 |
| PUSH-I-015 | CallKit configuration applied | Configure the icon, ringtone, recents inclusion, call group maxima, and handle types, then receive a call | The system UI reflects each setting; with recents disabled the call is absent from call history | P1 | I | M | API-PLAT-010 |
| PUSH-I-016 | CallKit configuration with a missing asset | Reference a ringtone or icon filename absent from the bundle | Rejects, or the system falls back to defaults without crashing; behavior recorded | P2 | I | M | API-PLAT-011 |
| PUSH-I-017 | CallKit handle types | Configure generic, phone number, and email handle types in turn | The handle renders per the configured type | P2 | I | M | API-PLAT-012 |
| PUSH-I-018 | CallKit configuration on Android | Call the iOS-only method on Android | `UnsupportedPlatformError` | P2 | A | U | API-PLAT-013 |
| PUSH-I-019 | Multiple calls in the CallKit group | Configure call group maxima, then exceed them | Behavior matches the configuration; excess calls are handled per the configured limit rather than crashing | P2 | I | M | new |

### 6.14 OS interruptions and app lifecycle (OSI)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| OSI-001 | Cellular call arrives during a VoIP call | Receive a GSM or PSTN call while a VoIP call is connected | Behavior follows the OS audio-focus and CallKit policy; on returning to the VoIP call, audio recovers or the call ends cleanly with a reported state | P0 | A/I | M | TC-059 |
| OSI-002 | Alarm fires during a call | Trigger an alarm mid-call | The call remains stable; the audio state recovers after the alarm is dismissed | P1 | A/I | M | TC-060 |
| OSI-003 | Voice assistant activated | Invoke Siri or Google Assistant mid-call | The interruption is handled cleanly and audio returns afterward | P1 | A/I | M | TC-061 |
| OSI-004 | Another media app starts playback | Start music playback mid-call | Audio focus behavior matches platform guidelines; the call is not silently left without audio | P1 | A/I | M | TC-062 |
| OSI-005 | Screen locked during a call | Lock the screen mid-call | The call continues with audio intact | P0 | A/I | M | TC-063 |
| OSI-006 | Screen unlocked | Unlock after locking | The call UI restores correctly with accurate state | P0 | A/I | M | TC-064 |
| OSI-007 | App backgrounded during a call | Background the app mid-call | The call continues; on Android the ongoing-call notification is present | P0 | A/I | M | TC-065 |
| OSI-008 | App returned to the foreground | Foreground the app after backgrounding | Existing call state is restored from the SDK, including mute, hold, route, and duration | P0 | A/I | M | TC-066 |
| OSI-009 | OS terminates the app during a call | Force the process to be killed mid-call | The far end sees the call end within the expected interval; on relaunch the app shows no phantom active call | P1 | A/I | M | TC-067 |
| OSI-010 | Low-memory event | Apply memory pressure during a call | No avoidable crash; call state is not corrupted | P1 | A/I | M | TC-068 |
| OSI-011 | Android process and activity recreation | Start a call, background the app, enable "Don't keep activities", return to the app | The UI reconstructs state from the SDK call model and does not create a duplicate call | P1 | A | M | AND-012 |
| OSI-012 | iOS audio session interruption recovery | Start a call, trigger an OS audio interruption, end it, continue speaking | The audio session reactivates and two-way audio returns without reconnecting the call | P0 | I | M | IOS-011 |
| OSI-013 | Incoming invite during backgrounding transition | Deliver an invite exactly while the app is moving between foreground and background | The invite is delivered once and is answerable; no duplicate or lost invite | P1 | A/I | M | new |
| OSI-014 | Device rotation and configuration change during a call | Rotate the device and change the system font size mid-call | The call continues; the UI rebinds to the same call object | P2 | A/I | M | new |

### 6.15 Preflight (PRE)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| PRE-001 | Run a preflight test | `runPreflight(token)` | Resolves with a test object; `Connected` raised; samples follow | P1 | A/I | A | API-PRE-001 |
| PRE-002 | Completion and report | Let a run finish | `Completed` raised with a report. **Currently Fail on Android**, where `Completed` is not raised; see section 10 | P1 | A/I | A | API-PRE-002 |
| PRE-003 | Report field coverage | Inspect the report | All documented members present, including edge selection, network and test timing, samples, aggregate jitter, MOS and RTT, call quality, TURN requirement, and warning collections | P1 | A/I | A | API-PRE-003 to API-PRE-005 |
| PRE-004 | Sample shape | Capture a sample | All 13 documented fields present, with a numeric timestamp | P1 | A/I | U, A | API-PRE-006 |
| PRE-005 | Failure path | Run with an expired token | `Failed` raised with a populated error code; no `Completed` | P1 | A/I | A | API-PRE-007 |
| PRE-006 | Quality warning during a run | Degrade the network during a run | `QualityWarning` raised with current and previous warning arrays | P1 | A/I | A | API-PRE-008 |
| PRE-007 | State progression | Poll state through a run | `connecting`, `connected`, then `completed` or `failed` | P1 | A/I | A | API-PRE-009 |
| PRE-008 | Accessors during and after a run | Call the call SID, start time, end time, latest sample, and report accessors at each stage | Each resolves with a documented value or `undefined`; none throws | P1 | A/I | A | API-PRE-010 to API-PRE-014 |
| PRE-009 | Stop a run | Call `stop()` mid-run, then again | First resolves and sampling ceases; the second rejects or no-ops without crashing | P1 | A/I | A | API-PRE-015, API-PRE-016 |
| PRE-010 | Listener binding race on iOS | Bind listeners immediately after `runPreflight` resolves | Early events are still delivered; the iOS path defers its native event flush for this reason | P1 | I | U, A | API-PRE-017 |
| PRE-011 | Concurrent preflight tests | Start a second run while the first is active | Documented behavior: rejected, or both run with events routed by uuid | P2 | A/I | A | API-PRE-018, API-PRE-019 |
| PRE-012 | Malformed native preflight payloads | Deliver each malformed event shape | Each throws `InvalidStateError` identifying the event, field, expected type, and actual type | P2 | A/I | U | API-PRE-020, API-PRE-021 |
| PRE-013 | Preflight options accepted | Run with ICE servers, transport policy, and preferred audio codecs | Resolves; the report and samples reflect the requested configuration and codec | P1 | A/I | A | API-PRE-022, API-PRE-023 |
| PRE-014 | Preflight option validation | Exercise every invalid option shape | Each throws `InvalidArgumentError` naming the field, including a null codec entry | P1 | A/I | U | API-PRE-024 to API-PRE-028 |
| PRE-015 | Preflight with no network | Run in airplane mode | `Failed` with a connection error within the SDK timeout | P1 | A/I | A | API-PRE-029 |
| PRE-016 | Preflight during an active call | Start a preflight while a call is connected | Documented behavior: rejected, or both proceed with the live call's audio unaffected | P2 | A/I | M | API-PRE-030 |

### 6.16 Errors and diagnostics (ERR)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| ERR-001 | Known error code mapping | Raise each documented native error code | The specific generated class is constructed, with code, description, explanation, causes, and solutions populated | P1 | A/I | U | API-ERR-001 |
| ERR-002 | Unknown error code | Raise an unrecognized code | A generic `TwilioError` preserving the code and message; construction does not throw | P1 | A/I | U | API-ERR-002 |
| ERR-003 | Error inheritance | Catch a generated error | It is an instance of its namespace class, `TwilioError`, and `Error` | P2 | A/I | U | API-ERR-003 |
| ERR-004 | Native rejection name mapping | Reject by name with each recognized and one unrecognized name | Maps to `InvalidArgumentError`, `InvalidStateError`, and `UnexpectedNativeError` with native context preserved | P1 | A/I | U | API-ERR-004, API-ERR-005, API-CONN-046 |
| ERR-005 | Error namespace reachability | Enumerate the exported errors namespace from the package entry point | All 12 generated namespaces and the 5 SDK error classes are reachable | P2 | A/I | U | API-ERR-007 |
| ERR-006 | Public API report drift | Run the API check | No diff against the committed report; an unintended public surface change fails the check | P1 | A/I | U | API-ERR-008 |

### 6.17 Application configuration (CFG)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| CFG-001 | Expo plugin, Android prebuild | Add the plugin, prebuild for Android, build | The generated application and activity classes carry the voice wiring; the build succeeds; the native module instantiates at runtime | P0 | A | A | API-EXPO-001 |
| CFG-002 | Expo plugin, iOS prebuild | Prebuild for iOS with defaults | Microphone usage description present; background modes include both audio and voip; the push entitlement defaults to development | P0 | I | A | API-EXPO-002 |
| CFG-003 | Plugin prop overrides | Pass a production push environment and a custom microphone description | Both appear in the generated iOS configuration | P1 | I | A | API-EXPO-003, API-EXPO-004 |
| CFG-004 | App-supplied values win | Set the microphone description and push environment in the app config | The plugin does not overwrite them | P1 | I | A | API-EXPO-005 |
| CFG-005 | Repeated prebuild | Prebuild twice without cleaning | Wiring is not duplicated; the run-once guard holds | P1 | A | A | API-EXPO-006 |
| CFG-006 | Conflicting host override | Pre-place an activity that already overrides a method the plugin inserts | Prebuild fails with an error naming the conflict and pointing at the manual wiring doc. Silently skipping is a Fail | P1 | A | A | API-EXPO-007 |
| CFG-007 | Expo SDK matrix | Prebuild and launch on each supported Expo SDK version | Wiring applies and the native module instantiates on every version exercised | P1 | A | A | API-EXPO-008 |
| CFG-008 | Expo Go rejected clearly | Attempt to run in Expo Go | Fails with a clear message; documented as unsupported | P2 | A/I | M | API-EXPO-009 |
| CFG-009 | Bare app manual wiring | Build a bare app wired by hand, with no plugin | Calls work end to end; the plugin is additive and not required | P0 | A/I | A | API-EXPO-010 |
| CFG-010 | Upgrade from a prior SDK version | Upgrade a bare app from 1.7.0 and an Expo app from the 2.x preview | Bare upgrades with no code change; the Expo path is one plugin entry. See `CHANGELOG.md` | P1 | A/I | M | new |
| CFG-011 | Native SDK version regression | Upgrade the underlying native Voice SDK | `getVersion` reports the new version and the full P0 set still passes | P1 | A/I | A | new |
| CFG-012 | Notification customization | Apply the documented notification customization | Notification content and appearance follow the customization; see `docs/customize-notifications.md` | P2 | A | M | new |

### 6.18 Reliability and stress (STRESS)

| ID | Test case | Steps | Expected result | P | Plat | Lvl | Source |
| --- | --- | --- | --- | --- | --- | --- | --- |
| STRESS-001 | Call soak | Run one continuous call for 2 to 8 hours, sampling every minute | No crash; memory, CPU, and thread counts flat after warm-up; no audio underruns beyond the product threshold; no unexpected disconnect. Record loss, jitter, RTT, ICE state changes, and battery drain | P2 | A/I | M | TC-040, soak |
| STRESS-002 | Outgoing call churn | Connect, hold 10 seconds, disconnect, wait 5 seconds, repeat 100 to 500 times | No crash, no leak, no stale state, and no progressive increase in setup time, memory, or thread count | P2 | A/I | A | TC-023, churn |
| STRESS-003 | Rapid accept and reject | Receive calls repeatedly, alternating accept and reject, at least 50 cycles | The state machine stays valid and responsive; no invite is left addressable after settling | P2 | A/I | A | TC-024 |
| STRESS-004 | Incoming call churn | Generate 100 or more invites mixing accept, reject, remote cancel, timeout, and overlapping invites | No duplicate invites, no lost invites, no orphaned active call, no audio initialization failure. This is the highest-yield case for races around invite tracking and lifecycle | P1 | A/I | A | incoming churn |
| STRESS-005 | Registration churn | Register and unregister 100 times with token refreshes interleaved | No leak; the final state matches the last operation; invites arrive only while registered | P2 | A/I | A | new |
| STRESS-006 | Long call across network transitions | Run a 1 hour call while moving between Wi-Fi and cellular repeatedly | Each transition either recovers or ends the call cleanly; no silent one-way audio | P2 | A/I | M | TC-040, TC-043 |

## 7 Compatibility cases (COMPAT)

These cases are executions of the catalog against a configuration, not new assertions. Each one
names the subset to run and the configuration to run it on.

| ID | Test case | Subset to run | Expected result | P | Plat | Lvl |
| --- | --- | --- | --- | --- | --- | --- |
| COMPAT-001 | Minimum supported Android API level | Build, launch, and every `U` case; plus P0 where the driver allows | The SDK builds against `minSdkVersion` and initialises. Note the current driver constraint at API 24 | P1 | A | A |
| COMPAT-002 | Android API level sweep | All P0 and P1 | Identical results across API 26, 29, 31, 33, 34, 35, 36; deviations recorded per level with a named cause | P1 | A | A |
| COMPAT-003 | New Android major version | Full catalog minus Soak | No new failures against the previous level's baseline | P1 | A | A, M |
| COMPAT-004 | Manufacturer sweep | All P0, plus `AUD-*`, `PUSH-A-009` to `PUSH-A-011`, and `OSI-*` | Push delivery, audio routing, and background behavior recorded per manufacturer. Differences are expected and must be documented rather than treated as a single pass or fail | P2 | A | M |
| COMPAT-005 | iOS version sweep | All P0 and P1 | Identical results across the oldest supported, previous major, and current major iOS | P1 | I | A, M |
| COMPAT-006 | iOS beta qualification | All P0, plus `PUSH-I-*` and `OSI-012` | CallKit, PushKit, and audio session behavior unchanged; regressions reported before the public release | P2 | I | M |
| COMPAT-007 | iPhone hardware sweep | All P0, plus `AUD-*` and `PUSH-I-*` | Audio routing and CallKit behavior consistent across an older supported, a mainstream current, and a Pro-class device | P2 | I | M |
| COMPAT-008 | App type parity | All P0 and P1 | Bare React Native and Expo produce identical results. Below the binding both run the same native code, so a divergence indicates a host-wiring defect | P1 | A/I | A |
| COMPAT-009 | Expo SDK sweep | `CFG-001` to `CFG-007`, plus all P0 | Plugin wiring applies and calls work on every supported Expo SDK version | P1 | A | A |
| COMPAT-010 | Native SDK upgrade | Full catalog minus Soak | No regression against the prior native version; `getVersion` reports the new one | P1 | A/I | A, M |
| COMPAT-011 | React Native version upgrade | All P0 and P1 | No regression. Cover both the Legacy Architecture and the New Architecture where the version supports both | P1 | A/I | A |

## 8 Coverage summary

Counts are of the rows in section 6, generated from this file. They describe catalog size, not
execution status; execution status belongs in `test/MASTER_TEST_PLAN.md`.

| Domain | Cases | Domain | Cases |
| --- | --- | --- | --- |
| REG registration and tokens | 19 | PUSH-A Android push | 17 |
| PERM permissions | 7 | PUSH-I iOS push and CallKit | 19 |
| OUT outgoing calls | 18 | OSI OS interruptions | 14 |
| INC incoming calls | 20 | PRE preflight | 16 |
| LIFE lifecycle and state machine | 25 | ERR errors | 6 |
| CTRL call controls | 12 | CFG app configuration | 12 |
| PSTN DTMF and PSTN | 12 | STRESS reliability | 6 |
| MSG call messages | 16 | AUD audio and media | 24 |
| NET network and signaling | 25 | STATS statistics | 8 |

276 cases in section 6, plus 11 compatibility executions in section 7.

| Cut | Distribution |
| --- | --- |
| Priority | 61 P0, 148 P1, 64 P2, 3 P3 |
| Platform | 214 both, 33 Android only, 29 iOS only |
| Level | 131 automatable on device, 108 manual, 46 unit. Rows carrying two levels are counted in each |

The manual share is concentrated in audio routing, OS interruptions, and push lifecycle, which need
real hardware, a second handset, or an OS-level interruption an emulator cannot produce. Reducing
it requires hardware in the loop rather than more harness code.

## 9 Traceability

### 9.1 Scenario suite to master

| Source | Master | Source | Master | Source | Master |
| --- | --- | --- | --- | --- | --- |
| TC-001 | REG-001 | TC-024 | STRESS-003 | TC-047 | NET-007, OUT-015 |
| TC-002 | REG-003 | TC-025 | AUD-001 | TC-048 | NET-008 |
| TC-003 | REG-005 | TC-026 | CTRL-001 | TC-049 | NET-009 |
| TC-004 | PERM-001 | TC-027 | CTRL-002 | TC-050 | NET-010 |
| TC-005 | PERM-002 | TC-028 | AUD-004 | TC-051 | NET-011 |
| TC-006 | PERM-003 | TC-029 | AUD-006 | TC-052 | NET-012 |
| TC-007 | OUT-001 | TC-030 | AUD-007 | TC-053 | NET-013 |
| TC-008 | OUT-002 | TC-031 | AUD-008 | TC-054 | NET-014 |
| TC-009 | OUT-005, PSTN-009 | TC-032 | AUD-009 | TC-055 | NET-015 |
| TC-010 | OUT-006 | TC-033 | AUD-010 | TC-056 | NET-016 |
| TC-011 | OUT-007 | TC-034 | AUD-011 | TC-057 | NET-017 |
| TC-012 | INC-001 | TC-035 | AUD-012 | TC-058 | NET-018 |
| TC-013 | INC-004 | TC-036 | AUD-013 | TC-059 | OSI-001 |
| TC-014 | INC-005 | TC-037 | AUD-014 | TC-060 | OSI-002 |
| TC-015 | INC-006 | TC-038 | AUD-015 | TC-061 | OSI-003 |
| TC-016 | INC-002 | TC-039 | AUD-016 | TC-062 | OSI-004 |
| TC-017 | INC-003 | TC-040 | STRESS-001, STRESS-006 | TC-063 | OSI-005 |
| TC-018 | INC-008 | TC-041 | NET-001 | TC-064 | OSI-006 |
| TC-019 | INC-009 | TC-042 | NET-002 | TC-065 | OSI-007 |
| TC-020 | INC-010 | TC-043 | NET-003, STRESS-006 | TC-066 | OSI-008 |
| TC-021 | LIFE-003 | TC-044 | NET-004 | TC-067 | OSI-009 |
| TC-022 | LIFE-004 | TC-045 | NET-005 | TC-068 | OSI-010 |
| TC-023 | STRESS-002 | TC-046 | NET-006 | | |

| Source | Master | Source | Master |
| --- | --- | --- | --- |
| AND-001 to AND-011 | PUSH-A-001 to PUSH-A-011, same order | IOS-001 to IOS-010 | PUSH-I-001 to PUSH-I-010, same order |
| AND-005 | also INC-008 | IOS-004 | also INC-008 |
| AND-012 | OSI-011 | IOS-011 | OSI-012 |
| TW-001 | LIFE-001 | TW-006 | LIFE-008 |
| TW-002 | LIFE-002 | TW-007 | LIFE-009 |
| TW-003 | LIFE-005 | TW-008 | NET-019 |
| TW-004 | LIFE-006 | TW-009 | NET-020 |
| TW-005 | LIFE-007 | TW-010 | NET-021 |
| PSTN-001 to PSTN-010 | retained with the same IDs in section 6.7 | Call soak | STRESS-001 |
| Call churn | STRESS-002 | Incoming call churn | STRESS-004 |
| Automation matrix | section 4 tiers | Priority areas | section 4 rationale |
| Android version and manufacturer lists | section 5.1, COMPAT-002, COMPAT-004 | iOS version and device lists | section 5.2, COMPAT-005, COMPAT-007 |

Every scenario-suite ID maps to at least one case here. Nothing was dropped.

### 9.2 API surface to master

All 260 IDs in `test/API_TEST_CASES.md` appear in the Source column of section 6, verified by
matching the ID sets rather than by inspection.

| API section | Master domain |
| --- | --- |
| 3 construction, version, device token | REG |
| 3.1 registration | REG |
| 4 connect and option validation | OUT, NET |
| 5 call and invite inventories | LIFE, INC |
| 6 platform-gated methods | PUSH-A, PUSH-I, AUD, OUT, INC |
| 7 audio devices | AUD |
| 8 call methods | CTRL, PSTN, LIFE, STATS |
| 9 call events and state machine | LIFE, NET, MSG |
| 10 CallInvite | INC, LIFE, MSG |
| 11 call messages | MSG |
| 12 PreflightTest | PRE |
| 13 statistics | STATS |
| 14 errors | ERR, REG |
| 15 Expo config plugin | CFG, PERM |

### 9.3 Existing automated suites to master domains

Suite ids are taken from `SUITES` in `test/appium-orchestrator/test-suites/index.mjs`, which is the
executable list. `test/MASTER_TEST_PLAN.md` section 6 describes the same suites by shorter logical
names.

| Suite id | Kind | Master cases covered |
| --- | --- | --- |
| `voice-api-test` | automated | REG-013 to REG-015, REG-018, AUD-002 |
| `registration-test` | automated | REG-001 to REG-012, REG-016 |
| `errors-test` | automated | ERR-001 to ERR-005 |
| `connect-options-test` | automated | OUT-003, OUT-009 to OUT-011, OUT-017 |
| `outgoing-call-test` | automated | OUT-001, OUT-004, LIFE-001, LIFE-003 |
| `call-controls-test` | automated | CTRL-001 to CTRL-007, LIFE-003, LIFE-013, STATS-001 to STATS-004 |
| `call-message-test` | automated | MSG-001 to MSG-005 |
| `preflight-test` | automated | PRE-001 to PRE-009, PRE-013, PRE-014 |
| `ice-test` | automated | NET-022 to NET-024, OUT-017 |
| `incoming-ice-test` | blocked | INC-012, INC-013 |
| `quality-warnings-test` | blocked | NET-025 |
| `incoming-call-test-manual` | manual | INC-001 to INC-006 |
| unit suites in `src/__tests__` and `plugin/__tests__` | automated | every `U` level case, and CFG-001 to CFG-007 at the fixture level |

Domains with no automated suite today: PERM, OSI, PSTN, AUD beyond enumeration, PUSH-A, PUSH-I,
STRESS, and CFG beyond the plugin fixtures. Those cases are manual, blocked, or unimplemented, not
passing.

## 10 Findings that change expected results

A known defect must not be reported as a pass, and a case must not be rewritten to match current
behavior. The evidence and issue references are in `test/API_TEST_CASES.md` section 16 and
`test/MASTER_TEST_PLAN.md` section 9. Affected cases here:

| Finding | Master cases | Status |
| --- | --- | --- |
| Preflight completion is not raised on Android, so the report is unreachable through the documented path. Observed at API 31, 34, 36, and 37; not yet exercised on iOS | PRE-002, PRE-003 | Fail on Android |
| The AV route picker's documented Android resolution value differs from the implementation | AUD-022 | Limitation |
| Sending a message from an invite on iOS routes through the call message native method | MSG-006 | Characterized |
| The custom parameter getter returns the internal record rather than a copy | LIFE-023 | Characterized |
| Android API 37 emulator images cannot obtain an FCM token | REG-001 to REG-013, PUSH-A-*, INC-001 to INC-003 | Blocked on that level; covered at 31, 34, and 36 |
| The UiAutomator2 driver requires API 26 or above | every `A` level case on API 24 | Blocked by driver constraint, not a product limitation |
| iOS cannot currently be built on the development machine | every `I` level case | Not run, deferred by decision |
| The Twilio account used for testing has no push credential | INC-*, PUSH-A-*, PUSH-I-* | Blocked until a credential is registered |

## 11 Known coverage gaps

Stated as decisions with reasons rather than omissions.

1. **Physical devices.** No case in this catalog has been executed on physical Android or iOS
   hardware in the current environment. The audio, Bluetooth, CallKit, and manufacturer cases
   cannot be satisfied by an emulator or simulator, so `AUD-*`, `PUSH-I-*`, `OSI-*`, and
   `COMPAT-004`, `COMPAT-006`, `COMPAT-007` are Not run rather than passing.
2. **Two-party audio verification.** Cases asserting intelligible audio need a second endpoint and
   a way to measure the received signal. Until that exists, `AUD-001`, `AUD-013` to `AUD-016`
   remain manual.
3. **Network impairment.** No impairment harness is wired in, so `NET-008` to `NET-018` are
   manual. Automating them needs a link conditioner or proxy under the test runner's control.
4. **Incoming calls end to end.** Blocked on a push credential rather than on missing cases.
   `STRESS-004`, the highest-yield reliability case, depends on it.
5. **Soak and churn.** No long-running job exists yet. `STRESS-*` are defined but Not run.

## 12 Related documents

| Document | Purpose |
| --- | --- |
| `test/API_TEST_CASES.md` | Per-API cases with full steps, validation matrices, and expected error messages |
| `test/MASTER_TEST_PLAN.md` | Tiers, environment matrix, credentials, run procedure, results log |
| `api/voice-react-native-sdk.api.md` | The generated public API report the API cases derive from |
| `docs/api/` | Generated per-member API reference |
| `docs/expo/app-config.md` | Config plugin setup and props |
| `docs/out-of-band-firebase-messaging-service.md` | Android out-of-band push handling |
| `docs/applications-own-pushkit-handler.md` | iOS app-owned PushKit handling |
| `docs/customize-notifications.md` | Android notification customization |
| `docs/play-outgoing-call-ringback-tone.md` | Outgoing ringback configuration |
| `KNOWN_ISSUES.md`, `COMMON_ISSUES.md` | Issues to check before filing a defect from a failing case |
