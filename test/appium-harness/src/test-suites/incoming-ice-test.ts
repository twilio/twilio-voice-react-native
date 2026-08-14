import * as React from 'react';
import { Platform } from 'react-native';
import { Call, CallInvite, IceTransportPolicy, Voice } from '@twilio/voice-react-native-sdk';
import type { useLogging } from '../hooks/useLogging';
import type { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

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
 * What a variant is expected to settle on.
 */
type Expectation =
  | typeof CALL_INVITE_ACCEPT_REJECTED
  | typeof CALL_DISCONNECTED_WITHOUT_ERROR;

type TestVariant = {
  description: string;
  options: CallInvite.AcceptOptions;
  expectation: Expectation;
};

const BOGUS_ICE_SERVER = {
  serverUrl: 'turn:127.0.0.1:3478',
  username: 'x',
  password: 'y',
};

/**
 * Fill this in with a real TURN server to run the `valid-*` variant. Twilio's
 * Network Traversal Service will hand these out. Left unfilled, that variant
 * is skipped.
 *
 * Revisit with VBLOCKS-7045 when we generate proper ICE server creds.
 */
const VALID_ICE_SERVER = {
  serverUrl: 'TODO',
  username: 'TODO',
  password: 'TODO',
};

/**
  * Revisit with VBLOCKS-7045, after valid ICE server generation is
  * implemented.
  */
const HAS_VALID_ICE_SERVER = VALID_ICE_SERVER.serverUrl !== 'TODO';

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
 * How long to wait for `callInvite.accept()` to settle. A bad ICE combo may
 * still have to exhaust real ICE gathering/connectivity checks before the
 * native side gives up and rejects.
 */
const ACCEPT_SETTLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

/**
 * How long to wait for `Call.Event.Disconnected` once a call has been
 * accepted. This is entirely tester-paced - it fires once the far end hangs
 * up - so it gets a generous window rather than anything tied to network
 * timing.
 *
 * Revist with VBLOCKS-7044 when we can automate incoming calls.
 */
const CALL_DISCONNECT_EVENT_TIMEOUT_MS = 2 * 60 * 1000; // 2 minutes

/**
 * Pause between variants so CallKit and the audio session settle before the
 * next call is accepted.
 */
const INTER_VARIANT_DELAY_MS = 3_000;

const VARIANTS = {
  'baseline-no-options': {
    description: 'no ICE options at all; should connect',
    options: {},
    expectation: CALL_DISCONNECTED_WITHOUT_ERROR,
  },
  'relay-policy-only': {
    description:
      'relay policy, no servers; should fail to connect because there are ' +
      'no relay candidates to use. Isolates the transport policy path from ' +
      'server parsing on the accept side',
    options: { iceTransportPolicy: IceTransportPolicy.Relay },
    expectation: CALL_INVITE_ACCEPT_REJECTED,
  },
  'bogus-servers-relay-policy': {
    description:
      'unreachable turn server, relay-only policy; should fail to connect. ' +
      'The decisive variant: proves the accept-path ICE builder still ' +
      'applies servers and policy',
    options: {
      iceServers: [BOGUS_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: CALL_INVITE_ACCEPT_REJECTED,
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
 */
type Actual =
  | Expectation
  /**
   * no `Voice.Event.CallInvite` arrived before the manual dial-in window closed
   */
  | 'call-invite-timeout'
  /**
   * `callInvite.accept()` itself never settled
   */
  | 'call-invite-accept-settle-timeout'
  /**
   * the call was accepted, but later ended with a `Disconnected` that carried
   * an error
   */
  | 'call-disconnected-with-error'
  /**
   * the call was accepted, but no `Disconnected` was raised
   */
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
 * arrives before `timeoutMs`. Always cleans up its listener.
 */
const waitForNextCallInvite = (
  voice: Voice,
  timeoutMs: number,
  log: ReturnType<typeof useLogging>['log'],
): Promise<CallInvite | null> =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      voice.off(Voice.Event.CallInvite, onCallInvite);
      resolve(null);
    }, timeoutMs);

    function onCallInvite(callInvite: CallInvite) {
      clearTimeout(timeoutId);
      resolve(callInvite);
    }

    voice.once(Voice.Event.CallInvite, onCallInvite);

    log.info(JSON.stringify({
      message: 'bound once callInvite listener',
    }));
  });

/**
 * Invoking `callInvite.accept` can have these results.
 */
type CallInviteAcceptResult =
  | { settled: 'resolved'; call: Call }
  | { settled: 'rejected'; error: unknown }
  | { settled: 'timeout' };

/**
  * Attempt to invoke and settle `callInvite.accept`.
  */
const acceptCallInvite = (
  callInvite: CallInvite,
  options: CallInvite.AcceptOptions,
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
    (call) => settle({ settled: 'resolved', call }),
    (error) => settle({ settled: 'rejected', error }),
  );
});

/**
 * Results from listening for the call disconnected event.
 */
type CallDisconnectResult =
  | { settled: 'call-disconnected-without-error' }
  | { settled: 'disconnected-with-error', error: unknown }
  | { settled: 'timeout' };

/**
 * Listen for a call disconnect event here by binding a timeout race.
 *
 * Timeout if the call disconnect event does not arrive in the appropriate
 * time.
 */
const listenForCallDisconnect = (
  call: Call
) => new Promise<CallDisconnectResult>(
  (resolve) => {
    let settled = false;

    const settle = (terminal: CallDisconnectResult) => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timeoutId);
      resolve(terminal);
    };

    const timeoutId = setTimeout(() => {
      settle({ settled: 'timeout' });
    }, CALL_DISCONNECT_EVENT_TIMEOUT_MS);

    call.on(Call.Event.Disconnected, (error) => {
      settle(error
        ? { settled: 'disconnected-with-error', error }
        : { settled: CALL_DISCONNECTED_WITHOUT_ERROR });
    });
  });

/**
  * Runs a single variant to a terminal outcome. Never rejects.
  */
const runVariant = async (
  variantName: VariantName,
  voice: Voice,
  log: ReturnType<typeof useLogging>['log']
): Promise<VariantResult> => {
  const { description, options, expectation } = VARIANTS[variantName];

  /**
    * Revisit with VBLOCKS-7045 when we generate proper ICE server creds.
    */
  if (requiresValidIceServer(variantName) && !HAS_VALID_ICE_SERVER) {
    return {
      variant: variantName,
      outcome: 'skipped',
      expected: expectation,
      actual: null,
      note: 'VALID_ICE_SERVER is not filled in',
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

  const redactedLog =
    JSON.stringify({
      waitingForCallInvite: variantName,
      description,
      expectation,
      options,
      message:
        `place a call to this client now; waiting up to ` +
        `${WAIT_FOR_CALL_INVITE_TIMEOUT_MS}ms`,
    })
    .replaceAll(VALID_ICE_SERVER.serverUrl, '<REDACTED>')
    .replaceAll(VALID_ICE_SERVER.password, '<REDACTED>')
    .replaceAll(VALID_ICE_SERVER.username, '<REDACTED>');

  log.info(redactedLog);

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
    options
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

  const callDisconnectPromise = listenForCallDisconnect(call);

  /**
    * Revisit with VBLOCKS-7044 when we can automate incoming calls.
    */
  log.info(JSON.stringify({
    message: 'call connected; hang up from the far end now to conclude ' +
      `this variant. Waiting up to ${CALL_DISCONNECT_EVENT_TIMEOUT_MS}ms`,
  }));

  const callDisconnect = await callDisconnectPromise;

  if (callDisconnect.settled === 'timeout') {
    return settleVariant(
      'call-disconnect-timeout',
      'call did not receive disconnect event within ' +
        `${CALL_DISCONNECT_EVENT_TIMEOUT_MS}ms`,
    );
  }

  if (callDisconnect.settled === 'disconnected-with-error') {
    return settleVariant(
      'call-disconnected-with-error',
      `call disconnected with error ${String(callDisconnect.error)}`,
    );
  }

  // Whatever happened, make sure the call is torn down before the next
  // variant waits for another one. A no-op if it already disconnected.
  await safelySettlePromise(call.disconnect());

  return settleVariant('call-disconnected-without-error');
};

/**
 * Incoming call invite ICE options test suite.
 */
export const useIncomingIceTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    if (Platform.OS === 'ios') {
      await voice.initializePushRegistry();

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
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
