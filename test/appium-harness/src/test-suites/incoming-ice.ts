import * as React from 'react';
import { Platform } from 'react-native';
import { Call, CallInvite, IceTransportPolicy, Voice } from '@twilio/voice-react-native-sdk';
import type { useLogging } from '../hooks/useLogging';
import type { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
import { safelySettlePromise } from '../utilities/safely-settle-promise';
import { getIceServer, NO_ICE_SERVER } from '../utilities/token/get-token';
import { waitForVoiceEvent } from '../utilities/wait-for-event';

/**
 * `callInvite.accept()` rejected.
 */
const CALL_INVITE_ACCEPT_REJECTED = 'call-invite-accept-rejected';

/**
 * `callInvite.accept()` resolved, and the call later ended with
 * `Call.Event.Disconnected` carrying no error.
 */
const CALL_DISCONNECTED_WITHOUT_ERROR = 'call-disconnected-without-error';

/**
 * `callInvite.accept()` resolved, the call connected, and it later raised
 * `Call.Event.ConnectFailure` rather than disconnecting cleanly.
 *
 * This is Android's actual behavior for a bad ICE combo, confirmed on-device,
 * and is why this suite carries separate `-ios` and `-android` variants for
 * every ICE combo that fails: see the docblock below.
 */
const CALL_CONNECT_FAILURE = 'call-connect-failure-event-raised';

/**
 * What a variant is expected to settle on.
 *
 * On the accept side, unlike `outgoing-ice.ts` (outgoing calls, where
 * `voice.connect()` resolves before any ICE outcome is known and
 * `Call.Event.Connected` / `ConnectFailure` fire afterward and are reliably
 * observed), iOS's *promise itself* is the connect/fail signal:
 *
 * - `answerCallInvite:completion:`'s callback
 *   (`ios/TwilioVoiceReactNative+CallKit.m:115-141`) is only invoked from
 *   `callDidConnect:` (resolve) or `call:didFailToConnectWithError:`
 *   (reject) - so by the time `callInvite.accept()` settles, the outcome is
 *   already decided.
 * - `callDidConnect:` emits `Call.Event.Connected` over the bridge *before*
 *   resolving the promise (`+CallKit.m:421-428`), but the JS `Call` object
 *   isn't constructed - and doesn't subscribe to native events - until
 *   `accept()` resolves (`src/CallInvite.tsx:474`, `src/Call.tsx:474`). The
 *   event is unrecoverably missed, every time, by construction. It is not a
 *   race that can be fixed by attaching listeners sooner.
 * - On a bad ICE combo, `acceptWithOptions:` still returns a non-nil
 *   `TVOCall` (a nil return would hit a different, throwaway completion
 *   handler that never settles the JS promise at all - see
 *   `+CallKit.m:365-371` - and a hang, not a rejection, is not what's
 *   observed). Instead `call:didFailToConnectWithError:` fires and rejects
 *   the promise directly; the `Call` object never reaches JS.
 *
 * On iOS, then, there is nothing to gain from racing `Connected` /
 * `ConnectFailure` for a rejected accept - only `Disconnected`, and only
 * after a successful `accept()`, is ever observable there.
 *
 * Android diverges from this, confirmed on-device rather than assumed:
 * `accept()` resolves even for a bad ICE combo, the call connects, and only
 * afterward does `Call.Event.ConnectFailure` fire instead of a clean
 * `Disconnected`. Tracked as VBLOCKS-7047. Because the two platforms settle a
 * failing ICE combo through genuinely different signals - a rejected promise
 * on iOS, a later event on Android - a single variant cannot correctly assert
 * both. Each ICE combo that is expected to fail is therefore split into an
 * `-ios` variant, expecting `CALL_INVITE_ACCEPT_REJECTED`, and an `-android`
 * variant, expecting `CALL_CONNECT_FAILURE`, each restricted to its platform
 * via `TestVariant.platforms`.
 */
type Expectation =
  | typeof CALL_INVITE_ACCEPT_REJECTED
  | typeof CALL_DISCONNECTED_WITHOUT_ERROR
  | typeof CALL_CONNECT_FAILURE;

type TestVariant = {
  description: string;
  options: CallInvite.AcceptOptions;
  expectation: Expectation;
  /**
   * Restricts this variant to the named platforms. Omit to run on both.
   * A variant excluded this way is reported as `skipped`, not silently
   * absent, so the suite's summary still accounts for it.
   */
  platforms?: Array<typeof Platform.OS>;
};

const BOGUS_ICE_SERVER = {
  serverUrl: 'turn:127.0.0.1:3478',
  username: 'x',
  password: 'y',
};

/**
 * Read from a gitignored local module. Without it the `valid-*` variant is
 * skipped. See `getIceServer` in `src/utilities/token/get-token.ts`.
 *
 * Revisit with VBLOCKS-7045 when we generate proper ICE server creds.
 */
const VALID_ICE_SERVER = getIceServer();

const HAS_VALID_ICE_SERVER =
  VALID_ICE_SERVER.serverUrl !== NO_ICE_SERVER.serverUrl;

/**
 * How long to wait, per variant, for a human to place a call into this client
 * from outside the harness (Twilio Console, another client, a REST call).
 *
 * This suite does not automate call origination.
 *
 * Revisit with VBLOCKS-7044 when we can automate incoming calls.
 */
const WAIT_FOR_CALL_INVITE_TIMEOUT_MS = 60_000;

/**
 * How long to wait for `callInvite.accept()` to settle. Only relevant on iOS,
 * where a bad ICE combo settles the promise itself: it may still have to
 * exhaust real ICE gathering/connectivity checks before the native side gives
 * up and rejects. On Android `accept()` resolves regardless of the ICE combo,
 * so this window is not exercised there - see the docblock above
 * `Expectation`.
 */
const ACCEPT_SETTLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * How long to wait for a call's terminal event - `Disconnected` or, on
 * Android, `ConnectFailure` - once a call has been accepted. Mostly
 * tester-paced for the variants expecting `Disconnected`, which fires once
 * the far end hangs up, so it gets a generous window rather than anything
 * tied to network timing. The `-android` variants expecting `ConnectFailure`
 * do not depend on the tester and typically settle well inside this window.
 *
 * Revisit with VBLOCKS-7044 when we can automate incoming calls.
 */
const CALL_DISCONNECT_EVENT_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * General-purpose settling delay. Used both between variants (so CallKit and
 * the audio session settle before the next call is accepted) and once after
 * registration completes.
 */
const INTER_VARIANT_DELAY_MS = 3_000;

const VARIANTS = {
  'baseline-no-options': {
    description: 'no ICE options at all; should connect',
    options: {},
    expectation: CALL_DISCONNECTED_WITHOUT_ERROR,
  },
  'relay-policy-only-ios': {
    description:
      'relay policy, no servers; should fail to connect because there are ' +
      'no relay candidates to use. Isolates the transport policy path from ' +
      'server parsing on the accept side. iOS: accept() rejects',
    options: { iceTransportPolicy: IceTransportPolicy.Relay },
    expectation: CALL_INVITE_ACCEPT_REJECTED,
    platforms: ['ios'],
  },
  'relay-policy-only-android': {
    description:
      'relay policy, no servers; should fail to connect because there are ' +
      'no relay candidates to use. Isolates the transport policy path from ' +
      'server parsing on the accept side. Android: accept() resolves, the ' +
      'call connects, then ConnectFailure fires - see VBLOCKS-7047',
    options: { iceTransportPolicy: IceTransportPolicy.Relay },
    expectation: CALL_CONNECT_FAILURE,
    platforms: ['android'],
  },
  'bogus-servers-relay-policy-ios': {
    description:
      'unreachable turn server, relay-only policy; should fail to connect. ' +
      'The decisive variant: proves the accept-path ICE builder still ' +
      'applies servers and policy. iOS: accept() rejects',
    options: {
      iceServers: [BOGUS_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: CALL_INVITE_ACCEPT_REJECTED,
    platforms: ['ios'],
  },
  'bogus-servers-relay-policy-android': {
    description:
      'unreachable turn server, relay-only policy; should fail to connect. ' +
      'The decisive variant: proves the accept-path ICE builder still ' +
      'applies servers and policy. Android: accept() resolves, the call ' +
      'connects, then ConnectFailure fires - see VBLOCKS-7047',
    options: {
      iceServers: [BOGUS_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: CALL_CONNECT_FAILURE,
    platforms: ['android'],
  },
  'valid-servers-relay-policy': {
    description: 'real turn server, relay-only policy; should connect',
    options: {
      iceServers: [VALID_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: CALL_DISCONNECTED_WITHOUT_ERROR,
  },
} satisfies Record<string, TestVariant>;

type VariantName = keyof typeof VARIANTS;

/**
 * What a variant actually settled on.
 *
 * - `call-invite-timeout`: no `Voice.Event.CallInvite` arrived before the
 *   manual dial-in window closed.
 * - `call-invite-accept-settle-timeout`: `callInvite.accept()` itself never
 *   settled. A known native hang exists on the `CXAnswerCallAction` failure
 *   path (see the NOTE at `answerCallInvite:` in CallKit.m) that this would
 *   surface.
 * - `call-disconnected-with-error`: the call was accepted, but later ended
 *   with a `Disconnected` that carried an error - i.e. it did not go cleanly.
 * - `call-disconnect-timeout`: the call was accepted, but neither
 *   `Disconnected` nor `ConnectFailure` was raised before the wait window
 *   closed.
 */
type Actual =
  | Expectation
  | 'call-invite-timeout'
  | 'call-invite-accept-settle-timeout'
  | 'call-disconnected-with-error'
  | 'call-disconnect-timeout';

type VariantResult = {
  variant: VariantName;
  outcome: 'passed' | 'failed' | 'skipped';
  expected: Expectation | null;
  actual: Actual | null;
  note?: string;
};

const requiresValidIceServer = (variant: VariantName) =>
  variant.startsWith('valid-');

/**
 * Waits for the next incoming call invite, or resolves with `null` if none
 * arrives before `timeoutMs`.
 */
const waitForNextCallInvite = async (
  voice: Voice,
  timeoutMs: number,
  log: ReturnType<typeof useLogging>['log'],
): Promise<CallInvite | null> => {
  log.info(JSON.stringify({
    message: 'bound callInvite listener',
  }));

  const args = await waitForVoiceEvent(voice, Voice.Event.CallInvite, timeoutMs);

  return args ? (args[0] as CallInvite) : null;
};

/**
 * Invoking `callInvite.accept` can have these results.
 */
type CallInviteAcceptResult =
  | { settled: 'resolved'; call: Call }
  | { settled: 'rejected'; error: unknown }
  | { settled: 'timeout' };

/**
 * Attempt to invoke and settle `callInvite.accept`.
 *
 * If `accept()` settles after the timeout has already elapsed, the variant
 * has already moved on and nothing is listening for the result anymore. A
 * late resolution is disconnected immediately, rather than orphaned - this
 * suite should never leave a live call on the device.
 */
const acceptCallInvite = (
  callInvite: CallInvite,
  options: CallInvite.AcceptOptions,
  log: ReturnType<typeof useLogging>['log'],
) => new Promise<CallInviteAcceptResult>((resolve) => {
  let settled = false;

  const settle = (result: CallInviteAcceptResult) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    resolve(result);
  };

  const timeoutId = setTimeout(() => {
    settle({ settled: 'timeout' });
  }, ACCEPT_SETTLE_TIMEOUT_MS);

  callInvite.accept(options).then(
    (call) => {
      if (settled) {
        log.info(JSON.stringify({
          message:
            `callInvite.accept resolved with call ${call.getSid()} after ` +
            'its variant already timed out; disconnecting it',
        }));
        safelySettlePromise(call.disconnect());
        return;
      }
      settle({ settled: 'resolved', call });
    },
    (error) => {
      if (settled) {
        log.info(JSON.stringify({
          message:
            'callInvite.accept rejected after its variant already timed ' +
            `out: ${String(error)}`,
        }));
        return;
      }
      settle({ settled: 'rejected', error });
    },
  );
});

/**
 * Results from listening for a call's terminal event.
 *
 * Races `Disconnected` and `ConnectFailure` together, rather than only
 * `Disconnected`, because an accepted call can still end via `ConnectFailure`
 * on Android for a bad ICE combo - see the docblock above `Expectation`.
 * Listening for only `Disconnected` would report every such call as a
 * `call-disconnect-timeout` after the full wait window, rather than as what
 * actually happened.
 */
type CallTerminalResult =
  | { settled: typeof CALL_DISCONNECTED_WITHOUT_ERROR }
  | { settled: 'disconnected-with-error', error: unknown }
  | { settled: typeof CALL_CONNECT_FAILURE, error: unknown }
  | { settled: 'timeout' };

/**
 * Listen for a call's terminal event here by binding a timeout race.
 *
 * Timeout if neither event arrives in the appropriate time.
 */
const listenForCallTerminalEvent = (
  call: Call
) => new Promise<CallTerminalResult>(
  (resolve) => {
    let settled = false;

    const settle = (terminal: CallTerminalResult) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      call.off(Call.Event.Disconnected, onDisconnected);
      call.off(Call.Event.ConnectFailure, onConnectFailure);
      resolve(terminal);
    };

    const timeoutId = setTimeout(() => {
      settle({ settled: 'timeout' });
    }, CALL_DISCONNECT_EVENT_TIMEOUT_MS);

    function onDisconnected(error: unknown) {
      settle(error
        ? { settled: 'disconnected-with-error', error }
        : { settled: CALL_DISCONNECTED_WITHOUT_ERROR });
    }

    function onConnectFailure(error: unknown) {
      settle({ settled: CALL_CONNECT_FAILURE, error });
    }

    call.on(Call.Event.Disconnected, onDisconnected);
    call.on(Call.Event.ConnectFailure, onConnectFailure);
  });

/**
 * Runs a single variant to a terminal outcome. Never rejects.
 */
const runVariant = async (
  variantName: VariantName,
  voice: Voice,
  log: ReturnType<typeof useLogging>['log']
): Promise<VariantResult> => {
  // Widened to `TestVariant` explicitly. `VARIANTS` is checked with
  // `satisfies` rather than annotated, so each entry keeps its own narrow
  // literal type - a union of differently-typed `platforms` arrays, one per
  // variant, rather than the single `Array<typeof Platform.OS> | undefined`
  // `TestVariant` declares. `.includes()` below needs the latter.
  const { description, options, expectation, platforms }: TestVariant =
    VARIANTS[variantName];

  if (requiresValidIceServer(variantName) && !HAS_VALID_ICE_SERVER) {
    return {
      variant: variantName,
      outcome: 'skipped',
      expected: expectation,
      actual: null,
      note: 'VALID_ICE_SERVER is not filled in',
    };
  }

  if (platforms && !platforms.includes(Platform.OS)) {
    return {
      variant: variantName,
      outcome: 'skipped',
      expected: expectation,
      actual: null,
      note: `only runs on ${platforms.join(', ')}`,
    };
  }

  /**
   * Compares what happened against what the variant expected.
   */
  const settleVariant = (
    actual: Actual,
    note?: string,
  ): VariantResult => ({
    variant: variantName,
    outcome: actual === expectation ? 'passed' : 'failed',
    expected: expectation,
    actual,
    note,
  });

  log.info(JSON.stringify({
    waitingForCallInvite: variantName,
    description,
    expectation,
    options,
    message:
      `place a call to this client now; waiting up to ` +
      `${WAIT_FOR_CALL_INVITE_TIMEOUT_MS}ms`,
  }));

  const callInvite = await waitForNextCallInvite(
    voice,
    WAIT_FOR_CALL_INVITE_TIMEOUT_MS,
    log,
  );

  if (!callInvite) {
    return settleVariant(
      'call-invite-timeout',
      'no incoming call was received before the manual dial-in window ' +
        'closed',
    );
  }

  log.info(JSON.stringify({
    message: 'got incoming callInvite',
  }));

  /**
   * Attempt to invoke and settle `callInvite.accept`.
   *
   * Can result in:
   * - a successful resolution with a call object
   * - a rejection with an error
   * - a timeout where callInvite.accept timed out
   */
  const callInviteAcceptedPromise = await acceptCallInvite(
    callInvite,
    options,
    log,
  );

  if (callInviteAcceptedPromise.settled === 'timeout') {
    return settleVariant(
      'call-invite-accept-settle-timeout',
      `callInvite.accept did not settle within ${ACCEPT_SETTLE_TIMEOUT_MS}ms`,
    );
  }

  if (callInviteAcceptedPromise.settled === 'rejected') {
    return settleVariant(
      CALL_INVITE_ACCEPT_REJECTED,
      `callInvite.accept rejected: ${String(callInviteAcceptedPromise.error)}`,
    );
  }

  const call = callInviteAcceptedPromise.call;

  log.info(JSON.stringify({
    message: `established incoming call ${call.getSid()}`,
  }));

  // Diagnostic logging
  Object.values(Call.Event).forEach((eventName) => {
    call.on(eventName, (...args: any[]) => {
      log.info(JSON.stringify({ variant: variantName, eventName, args }));
    });
  });

  const callTerminalPromise = listenForCallTerminalEvent(call);

  log.info(JSON.stringify({
    message: 'call connected; hang up from the far end now to conclude ' +
      `this variant. Waiting up to ${CALL_DISCONNECT_EVENT_TIMEOUT_MS}ms`,
  }));

  const callTerminal = await callTerminalPromise;

  // Whatever happened, make sure the call is torn down before the next
  // variant waits for another one. A no-op if it already disconnected
  // cleanly or with an error, or already ended via ConnectFailure; ends a
  // call that's still up if we timed out waiting for a terminal event.
  await safelySettlePromise(call.disconnect());

  if (callTerminal.settled === 'timeout') {
    return settleVariant(
      'call-disconnect-timeout',
      'call did not receive a terminal event within ' +
        `${CALL_DISCONNECT_EVENT_TIMEOUT_MS}ms`,
    );
  }

  if (callTerminal.settled === 'disconnected-with-error') {
    return settleVariant(
      'call-disconnected-with-error',
      `call disconnected with error ${String(callTerminal.error)}`,
    );
  }

  if (callTerminal.settled === CALL_CONNECT_FAILURE) {
    return settleVariant(
      CALL_CONNECT_FAILURE,
      `call raised ConnectFailure: ${String(callTerminal.error)}`,
    );
  }

  return settleVariant(CALL_DISCONNECTED_WITHOUT_ERROR);
};

/**
 * Incoming call invite ICE options test suite.
 */
export const useIncomingIceTest: UseTestSuite = (
  token,
  { voice },
  { log, setMasks },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    setMasks(HAS_VALID_ICE_SERVER ? [
      VALID_ICE_SERVER.serverUrl,
      VALID_ICE_SERVER.username,
      VALID_ICE_SERVER.password,
    ] : []);

    if (Platform.OS === 'ios') {
      // Guarded like the register call below: nothing awaits `perform`, so an
      // unguarded rejection would leave the status at `in-progress`.
      const pushRegistryResult = await safelySettlePromise(
        voice.initializePushRegistry(),
      );
      if (pushRegistryResult.status === 'rejected') {
        log.error(JSON.stringify({
          message: 'voice.initializePushRegistry rejected',
          error: String(pushRegistryResult.error),
        }));
        setTestStatus('failure');
        return;
      }

      log.info(JSON.stringify({
        message: 'ios push registry initialized',
      }));
    }

    // Properly register for incoming calls
    const registerResult = await safelySettlePromise(voice.register(token));
    if (registerResult.status === 'rejected') {
      log.error(JSON.stringify({
        message: 'voice.register rejected',
        error: String(registerResult.error),
      }));
      setTestStatus('failure');
      return;
    }
    log.info(JSON.stringify({
      message: 'registered successfully',
    }));

    // Let registration settle with a manual wait here
    await delay(INTER_VARIANT_DELAY_MS);

    const variantNames = Object.keys(VARIANTS) as VariantName[];

    const results: VariantResult[] = [];

    for (const variantName of variantNames) {
      const result = await runVariant(variantName, voice, log);

      results.push(result);

      log.info(JSON.stringify({
        completed: result.variant,
        outcome: result.outcome,
        expected: result.expected,
        actual: result.actual,
        note: result.note,
        progress: `${results.length}/${variantNames.length}`,
      }));

      await delay(INTER_VARIANT_DELAY_MS);
    }

    await safelySettlePromise(voice.unregister(token));

    const passed = results.filter((r) => r.outcome === 'passed');
    const failed = results.filter((r) => r.outcome === 'failed');
    const skipped = results.filter((r) => r.outcome === 'skipped');

    log.info(JSON.stringify({
      summary: {
        total: results.length,
        passed: passed.length,
        failed: failed.length,
        skipped: skipped.length,
      },
      failed: failed.map((r) => ({
        variant: r.variant,
        expected: r.expected,
        actual: r.actual,
        note: r.note,
      })),
      skipped: skipped.map((r) => r.variant),
    }));

    setTestStatus(failed.length === 0 ? 'success' : 'failure');
  }, [token, voice, log, setMasks, setTestStatus]);

  return { perform };
}
