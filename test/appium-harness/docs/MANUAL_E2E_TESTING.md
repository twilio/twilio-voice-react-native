# Manual E2E Testing on Real Devices

How to run the Appium harness test suites by hand against an iOS or Android
device. Each suite is a hook under `test/appium-harness/src/test-suites`.

## Before you start

Use a physical device. The incoming call suites depend on the system call UI,
and `quality-warnings-test` depends on the audio the host feeds the device.

Set `DO_CONSOLE_LOG` to `true` in `src/hooks/useLogging.ts`. That flag gates the
only `console.log` in the logger, and it is `false` by default. With it left
false, suite entries reach the `Test Suite Output` view in the app but never
reach Metro, so there is nothing for a captured log to contain. Revert it before
committing.

Create the local secret modules under
`test/appium-harness/src/utilities/token`. They are gitignored, so they will not
exist in a fresh clone.

| Module | Export | Used by |
| --- | --- | --- |
| `e2e-token.ios.ts` | `token` | Every suite, on iOS |
| `e2e-token.android.ts` | `token` | Every suite, on Android |
| `e2e-tests-ice-server.ts` | `iceServer` | The `valid-*` variants of `ice-test` and `incoming-ice-test` |

Metro resolves the platform suffix, so only the token module for the platform
you are testing has to be present.

The access token is short lived. Generate a fresh one before each session, and
regenerate it if the session runs long. An expired token shows up as a connect
failure in a suite that has nothing to do with tokens.

The ICE server credentials come from Twilio's Network Traversal Service. They
are account scoped and short lived, so do not commit them. If the module is
missing, the `valid-*` variants are skipped rather than failed, and the log
carries `No bundled ICE server`.

## The suites

Run these in order. The unattended suites come first, and the two suites that
need inbound calls come last.

| Order | Suite ID | What it needs from you |
| --- | --- | --- |
| 1 | `preflight-test` | Nothing |
| 2 | `registration-test` | Nothing |
| 3 | `voice-api-test` | Nothing |
| 4 | `errors-test` | Nothing |
| 5 | `outgoing-call-test` | Nothing |
| 6 | `connect-options-test` | Nothing |
| 7 | `call-controls-test` | Nothing |
| 8 | `call-message-test` | Nothing |
| 9 | `ice-test` | ICE credentials, for the `valid-*` variants |
| 10 | `quality-warnings-test` | A host whose audio input is unchanging |
| 11 | `incoming-ice-test` | Four inbound calls, one per variant |
| 12 | `incoming-call-test-manual` | Nine inbound calls, each driven through the system call UI |

Keep a checklist of the suite IDs for the platform you are testing and tick each
one off as it finishes. A full pass is long enough that it is easy to lose track
of which suite produced which log.

## Running one suite

Repeat this loop once per suite.

1. Set the suite. Either type the suite ID into the `Test Suite ID` field on the
   device, or change the `testSuiteId` default in `src/app/index.tsx` so the app
   boots with it selected. Changing the default removes a typed field from every
   iteration, so it is less error prone across a long session. Revert it before
   committing.

2. Confirm the token is fresh. Regenerate the token module if it has expired.

3. Start Metro and capture the output.

   ```
   cd test/appium-harness
   yarn run start | tee "NAME_OF_SUITE-PLATFORM-TIMESTAMP.log"
   ```

   The suites log one JSON object per line, so the Metro output is the full
   record of the run. Put the platform in the file name. Without it, two logs
   from the same suite on different platforms are indistinguishable later.

4. Tap `Start Test Suite` on the device. The first entry logged is a
   `starting test suite` banner carrying the suite ID, the platform and a
   timestamp. Check it against the file name you chose.

5. Wait for `Test Suite Status` to read `success` or `failure`. Each suite logs
   a summary of its passed, failed and skipped steps just before it sets that
   status.

6. Stop Metro and move on.

One log per suite. Do not batch several suites into one log.

If a log turns out to be misnamed, the `starting test suite` banner is the
authority on which suite and platform actually produced it.

## Suites that need an inbound call

Both inbound suites wait for `Voice.Event.CallInvite` and log a line asking you
to place a call. Have the caller ready before you start the suite, because each
wait is bounded.

Place the calls from a second Twilio Voice client. Open a Voice JS test app,
register it, and call the identity in the token the harness is using. Several
variants expect the far end to hang up at a moment of your choosing, and a live
client is the only caller that gives you that control.

Keep the far end on the line long enough for the suite to accept. A far end that
hangs up too early fails the variant waiting to accept, and one that never hangs
up fails the variants expecting a remote disconnect.

`incoming-ice-test` waits up to 60 seconds per variant and has four variants.
The suite accepts and disconnects the call itself, so only place the call. Do
not touch the system call UI during this suite.

`incoming-call-test-manual` waits up to 120 seconds per action and has nine
variants. This is the suite that needs you to drive the system call UI, which is
the CallKit screen on iOS and the notification on Android.

## Running the manual incoming call suite

Run this suite last and set aside an uninterrupted block of time. It runs nine
variants in order, each waiting for its own inbound call.

Watch the log for `{"TESTER_ACTION": "..."}` lines. Those are the prompts, and
they are logged at warn level so they stand out. Each one tells you to place a
call, to accept or decline from the system call UI, or to hang up the far end.

Variant names read as accept path then disconnect path, using three actors.
`native` is the system call UI, `js` is the SDK API, and `remote` is the far
end. So `native-accept-js-disconnect` means you accept from the system call UI
and the suite hangs up through the SDK.

Act promptly. Missing the 120 second window fails that variant. The suite
disconnects a call left over by a failed variant before moving on, so a missed
prompt does not cascade, but you will have to rerun that variant.

## Reviewing the logs

Start from each suite's summary line, then read the failed steps in full. Every
recorded failure carries a note describing what was expected and what happened.

Three outcomes are not regressions.

A step recorded as `skipped` did not run. The `valid-*` ICE variants skip when
no ICE credentials are bundled. The `disconnect` step of `call-controls-test`
skips when the far end ended the call before teardown, which means
`disconnect()` was never exercised on that run.

A `quality-warnings-test` failure depends on the host. The suite waits for
`constant-audio-input-level`, which the SDK raises when the audio input level is
unchanged for ten seconds on an unmuted call. The condition is unchanged rather
than quiet, so digital silence is the deterministic case, and a real microphone
in a quiet room has worked but is not guaranteed. Read a failure as "no warning
was observed" and check the log before filing it.

A connect failure in a suite unrelated to tokens is usually an expired token.

## The other platform

A pass on one platform says nothing about the other, so repeat the pass with a
token generated for that platform. Keep the two sets of logs separate through
the platform segment of the log file name.
