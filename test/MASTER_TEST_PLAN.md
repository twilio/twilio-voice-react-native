# Master test plan

The canonical test procedure for this repository. When asked to "run the tests", "run a
regression", "run the full test suite" or anything equivalent, run **this plan**, in tier order,
and report using the status vocabulary in section 3.

The cases themselves live in `test/MASTER_TEST_CASES.md`; this document owns how and where they run.
Suite-to-case mapping is in that file's section 9.3.

Current phase: **Android emulators only.** iOS and physical devices are deferred by decision, not
by oversight; see section 9.

## 1 Scope

| Dimension | Covered now | Deferred |
| --- | --- | --- |
| Platform | Android emulator | iOS simulator, iOS physical, Android physical |
| App type | bare React Native (`test/app`), Expo (`test/expo`) | - |
| Call direction | outgoing | incoming, which needs real FCM (section 9.1) |
| Harness | Appium | Detox, being retired |

## 2 Test tiers

Tiers run in order. A tier that fails stops the run unless the failure is an already-recorded
Blocked item.

| Tier | Name | What it proves | Needs credentials |
| --- | --- | --- | --- |
| T0 | Static | typecheck, lint, API report, no forbidden imports | no |
| T1 | Unit | 100 percent coverage, no exempt files | no |
| T2 | Build | both apps compile for every API level in the matrix | no |
| T3 | Launch smoke | app installs, launches, native module reachable, real native SDK version returned | no |
| T4 | Functional e2e | registration, audio devices, call state machine, call message, preflight | yes |
| T5 | Call e2e | real outgoing calls end to end against a live Twilio account | yes |

T0 through T3 are runnable with no secrets. That boundary is deliberate: a credential outage must
not make the whole plan unrunnable.

## 2a Running the plan unattended

Much of this plan is long-running: cold Expo builds, emulator boots, and the full matrix all take
minutes each, and several run in the background.

**Check any background job at least every 3 minutes.** Do not start a long job and go quiet until
it finishes. Report progress, surface the first sign of failure rather than waiting for the exit
code, and say which job you are waiting on and why. A job that has produced no new output for
several minutes is itself worth reporting.

The naming here (T0 to T5) is local to this document. It is not an industry convention.

## 3 Status vocabulary

Use these exactly. Do not soften a result to make a run look green.

- **Pass** - the exact workflow ran and its assertion succeeded
- **Fail** - ran, did not meet expectation
- **Blocked** - an unresolved dependency prevented running
- **Not run** - not exercised in this run
- **Limitation** - ran, exposed a confirmed constraint

Never report Pass when a shorter proxy ran instead, when an assertion is unimplemented, or when a
tier was skipped.

## 4 Test matrix

Two independent axes. Android API level applies to both app types; the Expo SDK axis applies only
to the Expo app.

### 4.1 Android API levels

All images are `google_apis` arm64-v8a, chosen over `google_apis_playstore` because they carry Play
Services, so FCM is testable, and stay rootable, so `adb root` can inspect notification state.

| AVD | API | Android | Why this level |
| --- | --- | --- | --- |
| `twilio_api24` | 24 | 7.0 | `minSdkVersion`. Oldest supported environment. **T2 and T3 only**, see 9.6a |
| `twilio_api31` | 31 | 12 | Notification trampoline restriction and foreground-service start limits. Directly relevant to a calling SDK, and to the 1.9.0 design |
| `wv_test` | 34 | 14 | `targetSdkVersion`. Foreground service types, the platform-policy boundary |
| `twilio_api36` | 36 | 16 | Current production target |
| `twilio_api37` | 37 | 17 | Newest, forward-compatibility signal. Ships as `android-37.0` |

Boot headless:

```
emulator -avd <name> -no-window -no-audio -no-snapshot -gpu swiftshader_indirect &
adb wait-for-device
until [ "$(adb shell getprop sys.boot_completed | tr -d '\r')" = "1" ]; do sleep 3; done
```

### 4.2 Expo SDK versions

| Expo SDK | React Native | Why this version |
| --- | --- | --- |
| 52 | 0.76 | Oldest supported. The version the 2.x preview shipped against |
| 54 | 0.81 | Last Expo release supporting the Legacy Architecture |
| 55 | 0.83 | New Architecture becomes mandatory |
| 56 | 0.85 | Recent stable |
| 57 | 0.86 | Current latest |

The config plugin edits generated Kotlin, so an Expo template change is the most likely way it
breaks. Testing across five SDK versions is the point, not incidental coverage. Fixture tests in
`plugin/__tests__` pin templates per SDK; this axis proves the real prebuild.

### 4.3 Bare React Native

One React Native version per run, matching what `test/app` declares. Bare has no template
generation, so it varies only along the API-level axis.

**T4 and T5 run against the Expo harness only, deliberately.** Below the binding the two app types
execute identical code: one `TwilioVoiceReactNativePackage`, one
`TwilioVoiceReactNativeModule`, one proxy layer. The difference between them is entirely in how
the host app is wired, by hand for bare and by the config plugin for Expo, and T2 and T3 already
exercise that on bare across all five API levels: the app builds, the proxies run, and the native
module is instantiated.

What a second harness would add is coverage of the SDK's behaviour under a bare React Native
runtime rather than an Expo one. That is not nothing, but it is small next to the cost of a second
harness carrying twelve duplicated suites, which is the duplication this release exists to remove.
The harness's `src/` has no Expo imports, so if this is revisited the port is a bare entry point
plus replacing `expo-router`, not a rewrite.

Stated so the gap is a decision with a reason rather than an omission. What is not covered: a bare
app's runtime behaviour during a live call, on any API level.

### 4.4 Combination count

| Tier | Combinations | Why |
| --- | --- | --- |
| T0, T1 | 1 | Version-independent |
| T2 | 6 | **One build per app variant, not per API level.** `minSdkVersion` is 24, so a single APK installs on every level in 4.1. 1 bare plus 5 Expo SDKs |
| T3, T4, T5 | 30 | 5 API levels x 6 app variants. Install and run only; no rebuild |

Build once, run everywhere. Rebuilding per API level would be five times the work for no coverage.

### 4.5 Making a full pass affordable

Measured on the development machine, an Apple M4 Pro with 12 cores and 48 GiB.

**Restrict the ABI.** Builds compile native code for `arm64-v8a`, `armeabi-v7a`, `x86` and
`x86_64` by default, and every emulator here is arm64. Pass the flag rather than hardcoding it in
`gradle.properties`, because hosted CI runners use x86_64 emulators:

```
./gradlew :app:assembleDebug -PreactNativeArchitectures=arm64-v8a
```

**Parallelise the runs, not the builds.**

| Work | Concurrency | Limit |
| --- | --- | --- |
| Emulators | 5 | About 3 GiB each when running |
| Appium servers | one per device | Ports from 4723 upward |
| Gradle builds | 2 | Each daemon wants 4 to 6 GiB and already parallelises across modules internally |
| npm install and prebuild | 4 to 5 | Network and disk bound |

Boot emulators on distinct ports and address each with `adb -s`:

```
emulator -avd twilio_api24 -port 5554 -no-window -no-audio -no-snapshot &
emulator -avd twilio_api31 -port 5556 -no-window -no-audio -no-snapshot &
```

The 30 runs are the slow half, and they are independent, so fanning them across five devices is
close to a fivefold saving. The 6 builds are largely serial.

**Do not overlap the two phases.** Observed 2026-09-09: five emulators plus concurrent Gradle work
exhausted memory and the operating system killed the emulators mid-run, taking the job with them.
Each Gradle daemon also survives its build and keeps holding heap, and five had accumulated. Run
`./gradlew --stop` before booting the emulator fleet, and build with at most two emulators up.

When time-boxed, the required subset is bare, Expo 52 and Expo 57, on API 24, 34 and 37. That
covers both ends of both axes. Record explicitly which combinations ran and which did not, using
the vocabulary in section 3.

## 5 Credentials

**Source of truth:** `/Users/csantos/Desktop/gitrepos/twilio-voicejs-app`

- `.env` (gitignored there) holds `ACCOUNT_SID`, `AUTH_TOKEN`, `API_KEY`, `API_SECRET`,
  `ENVIRONMENT`, with a prod set active and a stage set commented out.
- `public/tokenUrls.json` and `public/stage.tokenUrls.json` hold the TwiML Application SIDs and
  the identity pairs the suites dial between, for example `csantos` calling `csantos2`, plus
  fixed-behavior endpoints `echo`, `playmusic` and `readkeys`.
- `server.js` exposes `GET /token?identity=<id>&twimlAppSid=<AP...>` on port 3030, returning an
  access token with a `VoiceGrant`. `npm start` runs `source .env && node server.js`.

Rules:

1. **Never print credential values** into a terminal, log, commit, or report. Print variable names
   and set/unset status only. This rule exists because it was violated once.
2. Never copy `.env` into this repository. Read it, export it, use it.
3. The account in use is **production**. Prefer a test subaccount when one exists; until then keep
   call volume low and clean up test calls.
4. `test/app/src/tokenUtility.ts` imports `./e2e-tests-token` and `./e2e-preflightTest-token`,
   which are gitignored and must be generated before T4. Generate them from `API_KEY` and
   `API_SECRET` rather than by hand.

Required for T4 and T5: `ACCOUNT_SID`, `AUTH_TOKEN`, `CLIENT_IDENTITY`.

## 6 Suite inventory

Both app types run the same suites. A suite is not complete until it passes on every AVD in
section 4, for both apps.

| Suite | Tier | Covers |
| --- | --- | --- |
| `voice` | T4 | SDK version, audio devices, device token, registration state |
| `registration` | T4 | register, unregister, token lifecycle |
| `call` | T5 | connect, ringing, connected, mute, hold, disconnect, call stats |
| `callMessage` | T5 | user-defined messages in both directions during a call |
| `preflightTest` | T5 | preflight run, report shape, rejection paths |
| `iceServers` | T5 | custom ICE servers and transport policy on connect and accept |
| `audioDevice` | T4 | device enumeration, selection, `nativeType` |
| `incoming` | T5 | **Blocked**, see 9.1 |

## 7 Running the plan

```
# T0
yarn lint && yarn typecheck && yarn check:api

# T1
yarn test --coverage

# T2, per app, per API level
(cd test/app  && yarn && cd android && ./gradlew :app:assembleDebug)
(cd test/expo && yarn && npx expo prebuild --clean -p android && cd android && ./gradlew :app:assembleDebug)

# T3
adb install -r <apk> && adb shell monkey -p <applicationId> 1
# assert the smoke line appears in logcat and reports a real native SDK version

# T4/T5
export ACCOUNT_SID=... AUTH_TOKEN=... CLIENT_IDENTITY=...   # from section 5, never echoed
node test/appium-orchestrator/index.mjs
```

Environment prerequisites, verified 2026-09-09: JDK 17.0.19 via `JAVA_HOME=$(brew --prefix
openjdk@17)`, Gradle 8.10.2, Android SDK platforms 34/35/36, build-tools 34/35/36, NDK 26.1 and
27.1, watchman, CocoaPods 1.17.0.

Expo apps require `npx expo prebuild --clean` after switching branches. Without `--clean` the SDK
can be registered as two Gradle projects that race on the same output directory; diagnose with
`./gradlew projects | grep -i twilio`.

## 8 Exit criteria per iteration

An iteration is complete only when all of the following hold, and each is reported with evidence
rather than asserted:

1. T0 clean.
2. T1 at 100 percent statements, branches, functions and lines, with no exempt files and a
   threshold enforced in the Jest config so regressions fail CI.
3. T2 green for both apps on every API level in section 4.
4. T3 green for both apps on every AVD, with the smoke line showing a real native SDK version.
5. T4 and T5 green for both apps on every AVD, except items listed in section 9.
6. Every public API has a doc comment and the API report is regenerated.
7. Documentation audited for correctness against the code as it now stands.
8. Findings from the code audit are either fixed or recorded with a proposed fix.
9. The results table in section 10 is updated for this run.

## 9 Known blocked items

Recorded so they are never silently reported as passing.

**9.1 Incoming calls.** Partially resolved 2026-09-09.

Device-side FCM now works: a real `google-services.json` for project `voicejs-softphone` is in
place, and `getDeviceToken` and `register` both pass. `voice-api-test` and `registration-test`
went from failing to fully passing.

Still blocked: the Twilio account has no push credential, so Twilio cannot send a push even
though the device can receive one. That needs an FCM service account key, which
`google-services.json` does not carry; it lives in the Firebase console under Cloud Messaging.
Until one exists and is registered with Twilio, `incoming-ice-test` and the manual incoming suite
cannot run.

**API 37 and FCM: the earlier limitation did not reproduce.** On 2026-09-09 every FCM token
request on API 37 failed with `SERVICE_NOT_AVAILABLE` while API 31, 34 and 36 succeeded against
the same Firebase project and APK, and that was recorded here as a property of the image's Play
Services build.

On 2026-09-10 it did not reproduce. The same AVD `twilio_api37`, the same
`system-images/android-37.0/google_apis/arm64-v8a` image and the same project obtained a token:
`registration-test` and `voice-api-test` both passed, and API 37 scored Pass 8, Fail 1, Blocked 2,
identical to the other three levels.

Nothing local changed between the two runs, so the earlier failure was transient, most likely on
the Google side, rather than an image limitation. Treat API 37 as a full member of the matrix. If
`SERVICE_NOT_AVAILABLE` returns, record it as flaky rather than as a property of the image.

**The app's `applicationId` must match a client declared in `google-services.json`.** The supplied
file declares five; the harness uses `com.twiliovoicereactnativereferenceapp`. Set it in
`test/appium-harness/secrets.json`, which is gitignored. A mismatch fails at run time with
`FIS_AUTH_ERROR`, which reads as a broken SDK rather than a configuration error.

**9.2 iOS.** Partially resolved 2026-09-10.

Xcode 26.6 is installed, the SDK compiles for iOS with no errors or warnings against the iOS 26.5
SDK and TwilioVoice 6.13.6, and signing works: Apple Development certificate under the personal
team, device registered, profile issued, and a signed Release build installs on hardware.

**Bare React Native cannot build for iOS under Xcode 26.** `test/app` is React Native 0.77.0 and
vendors fmt 11.0.2, whose consteval calls in `format-inl.h` that toolchain rejects. The Expo
harness is React Native 0.83.6, which drops the fmt pod entirely and builds cleanly, so this is a
React Native version limit rather than anything about the SDK. The upstream `FMT_CONSTEVAL`
workaround was tried in the Podfile and did not take, and was reverted rather than left in a
customer-facing example. The fix is to raise `test/app`'s React Native version.

Two things remain blocked.

**Simulator: `Voice.connect()` never settles.** The resolver stored by `voice_connect_ios` is
invoked only inside `performVoiceCallWithUUID`, the CallKit delegate callback, which a simulator
never delivers. Twilio created zero calls across a 30 minute run, so nothing is pending on the
network side either. No iOS suite has passed on a simulator. Suites that do not place calls were
not separated out; they should be, since the ones that avoid CallKit have no reason to fail.

**A device running iOS 16 or earlier cannot be an Appium target under Xcode 26.** On-device
testing goes through CoreDevice, which requires iOS 17. Measured on an iPhone 7 Plus, iOS 15.8.3:
`xcodebuild -showdestinations` lists the device for the app project and omits it for
WebDriverAgentRunner, `xcodebuild test` fails with "Logic Testing Unavailable", and `devicectl`
reports the device `unavailable`. WebDriverAgent's own deployment target is 15.0, so this is not a
minimum-OS filter. Install and launch still work, which is why
`EXPO_PUBLIC_AUTORUN_SUITE` exists: it runs one suite on launch without a driver.

Automated iOS device coverage therefore requires iOS 17 or later hardware.

**Unrelated defect found while diagnosing this.** `connect()` cannot reject when CallKit refuses
the transaction: the `requestTransaction` error branch in
`ios/TwilioVoiceReactNative+CallKit.m` logs and cleans up but never calls the stored rejecter, so
the JavaScript promise stays pending. This affects real devices, not only simulators, and is why
the failure presents as a hang rather than an error.

**9.3 Physical devices.** Deferred by decision. A Samsung handset on One UI is the intended target,
for issues #587 and #604, which emulators cannot reproduce.

**9.4 Bluetooth audio routing and real audio quality.** Not reproducible on an emulator.

**9.5 `quality-warnings` suite.** Needs deterministic host audio input.

**9.6a API 24 cannot run T4 or T5.** Appium's UiAutomator2 driver supports Android 8.0, API 26,
and above; on API 24 it refuses the session with "UIAutomator2 only supports Android 8.0 (Oreo)
and above". This is a driver constraint, not a product limitation.

API 24 therefore carries T2 and T3 only, which it passes: the SDK builds against `minSdkVersion`
24 and initialises on it. Functional and call coverage on the oldest supported Android would need
a different driver, Espresso for instance, and is not attempted.

**9.5a `PreflightTest.Event.Completed` is not raised, on either platform.** Observed 2026-09-09 on an
emulator at API 34. A preflight run reaches `Connected` and emits samples continuously, 127 of
them in one run, but never raises `Completed`, so `PreflightTest.getReport()` is unreachable
through the documented path.

Ruled out: the wait being too short, probed at both 120 and 300 seconds with sampling still in
progress at each; and the far end holding the call open, since pointing the TwiML application at
one that ends the call changed nothing. Every other assertion in the suite passes, 16 of 17.

Additional evidence for whoever picks this up. The React Native binding is not the problem:
`PreflightTestListenerProxy.serializePreflightCompletedEvent` exists and is wired, so if the
native SDK invoked `onPreflightCompleted` the event would reach JavaScript. And every native
telemetry payload observed during these runs carries `"preflight": false`, alongside
`direction: OUTGOING`, which suggests the native layer is treating the run as an ordinary
outgoing call rather than a preflight one. That would explain the absent completion directly.

**Reproduced on iOS 2026-09-10**, on an iPhone 16 Pro Max running iOS 26.6.1, so this is not
Android-specific. Same signature on both: the call connects, `connected-event`,
`get-state-while-connected`, `get-call-sid-while-connected` and `get-start-time-while-connected`
all pass, and only completion never arrives. Four runs in one session, Android API 31, API 34 and
iOS, every one timing out at the 120 second wait.

The iOS binding is wired too: `ios/TwilioVoiceReactNative+PreflightTest.m` emits
`PreflightTestEventTypeValueCompleted`. Neither binding is reached, so the native callback is not
firing on either platform. Two candidates remain and this repository cannot separate them: the
native Twilio Voice SDKs do not complete the test, or the account and TwiML application are not
provisioned so the backend marks these calls as preflight, which is what `"preflight": false`
points at. That needs someone with backend access.

Also ruled out 2026-09-10: a token minted against the wrong TwiML application. `e2e.env` sets
`OUTGOING_APPLICATION_SID` and `PREFLIGHT_OUTGOING_APPLICATION_SID` to the same SID, so the token
already carries the application the harness intends.

Not yet checked on iOS, which cannot be built on this machine. Needs a product decision on whether
Android preflight is expected to self-complete or to require `stop()`, and most likely a question
for the Voice Android SDK team rather than this repository.

**9.5b Selecting an audio device outside a call has no effect on iOS.** Observed 2026-09-10 on an
iPhone 16 Pro Max running iOS 26.6.1. `voice-api-test` step 5 of 14:

    selected "Speaker", reported "Speaker"
    selected "iPhone",  reported "Speaker"

The names differ, not only the uuids, so the route genuinely does not move. Two separate causes
were found and only the first is fixed.

Fixed: `selectAudioDevice:` set `AVAudioSessionPortOverrideSpeaker` for the speaker and never
cleared it, so once the speaker had been selected the override stayed latched. That affects a user
who taps speaker and then earpiece during a call. Unverified, because no suite selects an audio
device while a call is up.

Not fixed, and the reason the step still fails: this module never calls `setCategory` or
`setActive`. `TVODefaultAudioDevice` owns the audio session and only configures it during a call,
so a selection made outside a call cannot take effect. Android routes through AudioSwitch, which
is independent of call state, which is why the same suite passes on all four API levels and fails
on iOS.

This is the iOS half of VBLOCKS-7133, whose note in `voice-api.ts` still describes it as Android
only. Deciding whether `AudioDevice.select()` should work outside a call on iOS, and at what cost
to in-call session handling, is an owner decision rather than a test fix.

**9.5c Relay-only ICE fails on iOS most of the time and never on Android.** Unresolved.

Six attempts on an iPhone 16 Pro Max and three on emulators, same Twilio account, credentials
minted per run:

    iOS      Fail 286s, Fail 287s, Pass 231s, Pass 232s, Fail 285s, Fail 287s
    Android  Pass 203s, Pass 205s, Pass 200s

Always the same two steps, `valid-servers-relay-policy` and
`valid-and-bogus-servers-relay-policy`, always `expected connected, actual timeout`. A failing run
takes about 286 seconds against 231 for a passing one, the difference being those two timeouts.
Both app types on iOS behave the same.

The transport is not the variable: one pass was over udp and one over tcp. Stale credentials were
ruled out; the failures continue with credentials minted seconds earlier. The emulator reaches the
network through the host and the phone does not, so TURN reachability from the phone is the
obvious next test and has not been run.

Recorded as open rather than as a defect or as flakiness. Four failures and two passes, with the
passes adjacent in one short window, does not support either label, and the platform split is
consistent.

**9.7 None of the current failures were introduced by this line.** Checked against tag `1.7.0`,
the last shipped 1.x release, on 2026-09-11.

`preflight-test`, Android. `PreflightTestListenerProxy.java`, which emits the completed event, is
byte-identical to 1.7.0. The path that would raise `Completed` has not been touched.

`preflight-test`, iOS. 1.7.0 implemented the delegate as
`preflight:didCompleteWitReport:`, missing the h. `TVOPreflightDelegate.h` in TwilioVoice declares
`preflight:didCompleteWithReport:`, so the 1.7.0 selector matched nothing and completion could
never fire on iOS in that release. This line corrects the spelling. Completion still does not
arrive, so the cause is below this binding, and the change moved the behaviour towards working
rather than away from it.

`voice-api-test` audio selection, 9.5b. 1.7.0 contains the identical `selectAudioDevice:`, setting
`AVAudioSessionPortOverrideSpeaker` with no branch to clear it, and the same arrangement where
`TVODefaultAudioDevice` owns the session. Both halves of 9.5b predate this line.

`ice-test`, 9.5c. `buildTVOIceOptionsWithServers:transportPolicy:` does not exist in 1.7.0. ICE
options are new here, so the suite exercises a feature with no shipped baseline and cannot be a
regression. Whether the feature itself is complete is a separate, open question.

`registration-test`, iOS. Caused by removing `aps-environment` so a personal team could sign the
build, which is a property of this test setup, not of the SDK.

The native Twilio SDK moved from TwilioVoice 6.13.3 to 6.13.6 over the same span, which is the
other thing that changed underneath these suites.

**9.6 Both test apps share one applicationId.** `test/app` and `test/expo` both use
`com.example.twiliovoicereactnative`, so they cannot be installed on the same device at once and
installing one replaces the other. Until this is resolved the two app types must run serially on a
given AVD, with an uninstall between them. Giving the Expo app a distinct applicationId would let
them run in parallel, but the Firebase configuration would then need a client entry for both
package names.

## 10 Results log

One row per full run. Append, do not overwrite.

| Date | Commit | T0 | T1 | T2 | T3 | T4 | T5 | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 2026-09-09 | `b101131` | Pass | Pass | Partial | Pass | Not run | Not run | Bare only |
| 2026-09-09 | `30af047` | Pass | Pass | Partial | Pass | Not run | Not run | Both app types |
| 2026-09-09 | `38acc6b` | Pass | Pass | **Pass** | **Pass** | Not run | Not run | Full 6x5 grid |
| 2026-09-09 | `f1117b6` | Pass | Pass | Pass | Pass | Partial | Partial | T4/T5 first real run, API 34 |
| 2026-09-09 | `HEAD` | Pass | Pass | Pass | Pass | Pass | Pass | Full T4/T5 matrix, dummy Firebase |
| 2026-09-09 | `HEAD+` | Pass | Pass | Pass | Pass | **Pass** | **Pass** | Real Firebase; 8 of 12 suites pass, see below |
| 2026-09-10 | `caef89f` | Pass | Pass | Pass | Pass | Pass | Pass | First iOS device run; bare harness on Android; see below |

**2026-09-09, `b101131`**

- T0 Pass. `tsc --noEmit` clean, `eslint "**/*.{js,ts,tsx}"` clean.
- T1 Pass on execution, 539 tests in 17 suites. **Coverage not yet measured against the 100
  percent target**, so this is not yet the T1 the exit criteria describe.
- T2 Partial. `test/app` builds a 147 MB debug APK on the host toolchain. Only exercised on one
  configuration; the per-API-level matrix in section 4 has not been run, and `test/expo` has not
  been built since the plugin landed.
- T3 Pass, bare app on `twilio_api33` (API 33). Evidence from logcat:
  `VoiceApplicationProxy: onCreate(..) invoked`,
  `VoiceActivityProxy: onCreate(): invoked`,
  `TwilioVoiceReactNativeModule: instantiation of TwilioVoiceReactNativeModule`,
  `Running "TwilioVoiceExampleNewArch" with {"fabric":true}`. New Architecture confirmed.
  Requires Metro plus `adb reverse tcp:8081 tcp:8081`; the debug APK carries no embedded bundle.
- T4 and T5 Not run. The Appium harness has one iOS-shaped suite and no Android capabilities yet.
- Plugin fixture tests: 8 Pass, including three asserting the prebuild fails loudly on an
  `onNewIntent` collision rather than skipping.

**2026-09-10 into 2026-09-11, `caef89f`.** First run on iOS hardware, and first run of the
suites under a bare React Native runtime.

Targets, one full pass of all twelve suites each unless stated.

| Target | App | Pass | Fail | Blocked | Not run |
| --- | --- | --- | --- | --- | --- |
| Android emulator, API 31 | Expo harness | 8 | 1 | 2 | 1 |
| Android emulator, API 34 | Expo harness | 8 | 1 | 2 | 1 |
| Android emulator, API 36 | Expo harness | 8 | 1 | 2 | 1 |
| Android emulator, API 37 | Expo harness | 8 | 1 | 2 | 1 |
| Android emulator, API 34 | **bare** | 8 | 1 | 2 | 1 |
| iPhone 16 Pro Max, iOS 26.6.1 | Expo harness | 5 | 4 | 2 | 1 |
| iPhone 16 Pro Max, iOS 26.6.1 | bare | Blocked, see 9.2 | | | |

`preflight-test` is the only failure on every Android target, at every API level, on both app
types. See 9.5a.

The bare app matches the Expo harness suite for suite on Android, including the call suites, which
closes the gap named in 4.3: a bare app's runtime behaviour during a live call was previously
untested. One native project now hosts either app, selected by `-PentryFile=index.harness.js` on
Gradle or `ENTRY_FILE` on xcodebuild.

The four iOS failures resolve as follows. `voice-api-test` is 9.5b. `registration-test` is not
assessable: `aps-environment` was removed so a personal team could sign the build, so PushKit
issues no token. `preflight-test` is 9.5a. `ice-test` is unresolved, see 9.5c.

Fixed during the run, all iOS: the latched speaker override in `selectAudioDevice:`; `connect()`
never settling when CallKit refuses the start-call transaction; and uuid regeneration for
non-built-in audio devices, which is Inferred rather than Observed because the test hardware
exposed only the earpiece and the speaker.

Harness and runner defects fixed: a failing suite reported the bare word "failure" and now names
the failing step, which produced every diagnosis above; credential minting is shared by all three
runners, having drifted so that only Android minted TURN credentials; `hideKeyboard` cost about
fifteen seconds per call site on iOS; and Metro resolved React Native from the harness's own
`node_modules` when bundling the bare app.

Not done: T4 and T5 per Expo SDK version. T2 and T3 still cover 52, 54, 55, 56 and 57; T4 and T5
ran against the Expo 55 harness only, as in every previous run.

## 11 Related documents

- `test/MASTER_TEST_CASES.md` - the case catalog this plan executes: 276 cases across 18 domains,
  with priorities, platform and level per case, and traceability to the API surface
- `test/API_TEST_CASES.md` - per-API cases with full steps and the argument-validation matrices
- `.claude/audits/1.8.0-implementation-plan.md` - the working plan. Local only; `.claude` is
  covered by a global gitignore
- `proposals/voice/mobile/implementation.md` in `voice-video-sdks-eng-docs` - 1.8.0 and 1.9.0
  mechanics
- `proposals/voice/mobile/expo-support-pivot-proposal.md` - the decision and customer impact
- `CONTRIBUTING.md` - build performance and the Expo prebuild hazard

**2026-09-09, `30af047`**

Both app types verified from a single published artifact.

- T1 Pass and now **measured**: 100 percent statements, branches, functions and lines, threshold
  enforced in the Jest config. 605 tests in 20 suites. The previously unmeasured real figure was
  97.35 percent statements and 94.14 percent branches.
- T2 Pass on API 33 for both apps. `test/app` 147 MB, `test/expo` 207 MB. The other three AVDs in
  section 4 are still Not run, so the matrix remains incomplete.
- T3 Pass for both apps on `twilio_api33`.
  - Bare: `VoiceApplicationProxy.onCreate`, `VoiceActivityProxy.onCreate`,
    `TwilioVoiceReactNativeModule` instantiation, `fabric:true`.
  - Expo: the same three markers plus `Bridgeless mode is enabled` and `fabric:true`, with zero
    fatal exceptions. The config plugin's wiring executed at runtime, not just at prebuild.
- Expo autolinking resolves the single React Native binding on SDK 52 with no
  `expo-module.config.json`: `packageInstance: 'new TwilioVoiceReactNativePackage()'`.
- `./gradlew projects` lists one `:twilio_voice-react-native-sdk`. The duplicate-project race is
  gone.
- T4 and T5 still Not run. Appium has no Android capabilities yet.

Incident during this run: an `lsof -ti tcp:8081 | xargs kill -9` intended for Metro also killed
`netsimd`, the emulator's network daemon, taking the emulator down. Identify the owning process
before killing anything on that port.

**2026-09-09, `38acc6b`, full matrix**

T2 Pass, 6 of 6 builds. T3 Pass, 30 of 30 combinations.

| App variant | Expo | React Native | Build | APK | api24 | api31 | api34 | api36 | api37 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| bare | - | 0.77.0 | 11s | 46 MB | Pass | Pass | Pass | Pass | Pass |
| expo 52 | 52.0.49 | 0.76.9 | 82s | 162 MB | Pass | Pass | Pass | Pass | Pass |
| expo 54 | 54.0.37 | 0.81.5 | 162s | 148 MB | Pass | Pass | Pass | Pass | Pass |
| expo 55 | 55.0.31 | 0.83.10 | 138s | 158 MB | Pass | Pass | Pass | Pass | Pass |
| expo 56 | 56.0.21 | 0.85.3 | 128s | 169 MB | Pass | Pass | Pass | Pass | Pass |
| expo 57 | 57.0.20 | 0.86.3 | 54s | 58 MB | Pass | Pass | Pass | Pass | Pass |

Pass here means all three markers observed: `VoiceApplicationProxy.onCreate`,
`VoiceActivityProxy.onCreate`, and `TwilioVoiceReactNativeModule` instantiation, with no fatal
exception. Every Expo variant additionally passed nine assertions on the generated Kotlin at
prebuild.

Expo 57 and bare were built arm64-only; the rest were built before that flag was added, which is
why their build times and APK sizes are three to four times larger.

Five emulators ran concurrently at about 14 GiB total. A whole app variant across all five API
levels completes in 5 to 11 seconds wall clock.

T4 and T5 Not run. The orchestrator now supports Android and iterates all twelve suites, but the
Appium harness APK has not been built and no Appium server has been started.

Three harness defects were found and fixed during this run, none of them in the product. Each
would have produced a misleading result rather than an obvious failure:

1. `monkey -c android.intent.category.LAUNCHER` silently failed to launch on four of five API
   levels while reporting success, so those levels recorded false failures. Replaced with an
   explicit `am start` against the resolved launcher component.
2. `expo-template-blank-typescript@sdk-57` could not resolve, because this environment proxies npm
   through an Artifactory virtual registry that mirrors versions but not dist-tags, and the public
   registry is unreachable. The scaffold now resolves the version from the version list.
3. A stale Metro left running from `test/expo` served port 8081 to the bare app, which then failed
   to resolve `./index` from the wrong project and never instantiated the native module. Kill
   Metro and clear `adb reverse` between app variants.

**2026-09-09, `f1117b6`, first real T4 and T5 run**

Expo harness on `wv_test`, API 34. Six suites Pass, three Fail, two Blocked, one Not run. Every
failure is attributed.

| Suite | Result | Steps | Note |
| --- | --- | --- | --- |
| `errors-test` | Pass | 7/7 | |
| `connect-options-test` | Pass | 9/9 | |
| `outgoing-call-test` | Pass | 1/1 | Places and ends a real call |
| `call-controls-test` | Pass | 9/9 | Mute, hold, disconnect on a live call |
| `call-message-test` | Pass | 9/9 | |
| `ice-test` | Pass | 18/18 | Includes real TURN credentials |
| `voice-api-test` | Fail | 10/14, 3 skipped | One step, `get-device-token`, blocked on 9.1 |
| `registration-test` | Fail | 2/8 | All failures blocked on 9.1 |
| `preflight-test` | Fail | 16/17 | One step, the product finding in 9.5a |
| `incoming-ice-test` | Blocked | | 9.1 |
| `quality-warnings-test` | Blocked | | 9.5 |
| `incoming-call-test-manual` | Not run | | Needs a human |

Real outgoing calls connect, carry media, report quality warnings, and disconnect. That is T5
genuinely exercised, not simulated.

Everything still failing is either the dummy Firebase project (9.1) or the single preflight finding
(9.5a). There is no unexplained failure.

Five defects were found and fixed getting here, three in the product and two in the harness:

- `AudioDevice.uuid` was regenerated on every AudioSwitch update, and selecting a device causes
  one, so the handle `select()` takes was not stable. Present since 1.7.0.
- `Voice.connect` with `params: null` and preflight audio-codec validation with a null codec both
  threw a raw `TypeError` instead of `InvalidArgumentError`, because `typeof null === 'object'`.
  The codec case was tracked as VBLOCKS-7137.
- `outgoing-call-test` waited for a `Disconnected` that nothing would cause, because the TwiML
  endpoint echoes indefinitely. It now hangs up after five seconds. Tracked as VBLOCKS-7138.
- `ice-test` gave up after 60 seconds on variants where the SDK raises `ConnectFailure` between 60
  and 150 seconds, and skipped its `valid-*` variants for want of TURN credentials. Both fixed;
  the suite went from 14 of 18 with 2 skipped to 18 of 18 with none.

**2026-09-09, full T4 and T5 matrix**

Expo harness, four API levels. UiAutomator2 requires API 26 or above, so API 24 is T2 and T3 only
(9.6a). Identical results on every level:

| Suite | api31 | api34 | api36 | api37 |
| --- | --- | --- | --- | --- |
| `errors-test` | Pass | Pass | Pass | Pass |
| `connect-options-test` | Pass | Pass | Pass | Pass |
| `outgoing-call-test` | Pass | Pass | Pass | Pass |
| `call-controls-test` | Pass | Pass | Pass | Pass |
| `call-message-test` | Pass | Pass | Pass | Pass |
| `ice-test` | Pass | Pass | Pass | Pass |
| `voice-api-test` | Blocked | Blocked | Blocked | Blocked |
| `registration-test` | Blocked | Blocked | Blocked | Blocked |
| `incoming-ice-test` | Blocked | Blocked | Blocked | Blocked |
| `quality-warnings-test` | Blocked | Blocked | Blocked | Blocked |
| `preflight-test` | **Fail** | **Fail** | **Fail** | **Fail** |
| `incoming-call-test-manual` | Not run | Not run | Not run | Not run |

Six Pass, four Blocked, one Fail, one Not run, on each level.

**One genuine failure remains across the whole matrix**, and it is the same one everywhere: the
preflight finding in 9.5a. Everything else that does not pass is Blocked on a named external
dependency, three of them on the Firebase project in 9.1.

Real outgoing calls connect, carry media, raise and clear quality warnings, and disconnect, on
Android 12, 14, 16 and 17. `ice-test` exercises real TURN credentials across 18 variants.

Reaching this took fixing three product defects and five harness defects. The harness ones are
worth listing, because each produced a plausible but wrong result rather than an obvious break:

- `testID` without `accessibilityLabel`: every `~` selector missed on Android, so the harness was
  iOS-only at the selector level.
- `DO_CONSOLE_LOG` hardcoded false: a failing suite reported the bare word `failure`, with no step
  and no reason.
- `monkey` reported success while failing to launch the app on four of five API levels.
- Cleanup killed Metro and Appium by process group, and they run in the caller's group, so it also
  killed the loop driving the matrix. The matrix completed exactly one device and vanished, twice,
  with no error.
- A stale Metro from another project served port 8081 and the app fetched the wrong bundle.

**2026-09-09, real Firebase project**

A real `google-services.json` for project `voicejs-softphone` replaced the placeholder. Suite
results per API level:

| API | Pass | Fail | Blocked | Not run |
| --- | --- | --- | --- | --- |
| 31 | 8 | 1 | 2 | 1 |
| 34 | 8 | 1 | 2 | 1 |
| 36 | 8 | 1 | 2 | 1 |
| 37 | 6 | 1 | 4 | 1 |
| 24 | T2 and T3 only, both pass (9.6a) |

`voice-api-test` went from 10 of 14 with a failure to 11 of 11, and `registration-test` from 2 of
8 to 7 of 7. The remaining skips in both are iOS-only steps.

API 37 is lower only because its emulator image cannot reach FCM at all, reproducibly, with
`SERVICE_NOT_AVAILABLE` on every token request while the same APK succeeds on 31, 34 and 36.

**One genuine product failure remains, identically on every level: the preflight finding in
9.5a.** Everything else that does not pass is Blocked on a named external dependency, and each
dependency now has an accurate reason rather than a single catch-all.
