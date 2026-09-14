import * as React from 'react';
import {
  Call,
  IceTransportPolicy,
  TwilioErrors,
  Voice,
} from '@twilio/voice-react-native-sdk';
import type { useLogging } from '../hooks/useLogging';
import { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
import { safelySettlePromise } from '../utilities/safely-settle-promise';
import { getIceServer, NO_ICE_SERVER } from '../utilities/token/get-token';

/**
 * `voice.connect` rejects with an `InvalidArgumentError` out of the JS
 * validation layer, before ever reaching native. Paired with
 * `unexpected-voice-connect-rejection`, which is any other rejection reason.
 */
const EXPECTED_VOICE_CONNECT_REJECTION = 'expected-voice-connect-rejection';

/**
 * The terminal `Call.Event`s a variant can settle on. Anything else a call
 * raises along the way (`Ringing`, `Reconnecting`, ...) is logged but is not
 * terminal.
 */
const TERMINAL_CALL_EVENTS = [
  Call.Event.Connected,
  Call.Event.ConnectFailure,
  Call.Event.Disconnected,
] as const;

type TerminalEvent = (typeof TERMINAL_CALL_EVENTS)[number];

/**
 * What a variant is expected to settle on: either a rejection out of the JS
 * layer, or a specific terminal call event.
 */
type Expectation = typeof EXPECTED_VOICE_CONNECT_REJECTION | TerminalEvent;

type TestVariant = {
  description: string;
  options: Voice.ConnectOptions;
  expectation: Expectation;
};

const BOGUS_ICE_SERVER = {
  serverUrl: 'turn:127.0.0.1:3478',
  username: 'x',
  password: 'y',
};

/**
 * Read from a gitignored local module. Without it the `valid-*` variants are
 * skipped. See `getIceServer` in `src/utilities/token/get-token.ts`.
 */
const VALID_ICE_SERVER = getIceServer();

const HAS_VALID_ICE_SERVER =
  VALID_ICE_SERVER.serverUrl !== NO_ICE_SERVER.serverUrl;

/**
 * How long to wait for a variant to settle. Variants expecting a
 * `ConnectFailure` have to wait out ICE gathering and connectivity checks
 * before the SDK gives up, so they need considerably longer.
 */
const TEST_TIMEOUT_MS: Record<Expectation, number> = {
  [EXPECTED_VOICE_CONNECT_REJECTION]: 5_000,
  [Call.Event.Connected]: 30_000,
  [Call.Event.ConnectFailure]: 60_000,
  [Call.Event.Disconnected]: 60_000,
};

/**
 * Pause between variants so CallKit and the audio session settle before the
 * next call is placed.
 */
const INTER_VARIANT_DELAY_MS = 3_000;

const VARIANTS = {
  // --- invalid options, expected to be rejected by JS validation ------------
  // These run first because they never touch the network.
  'invalid-policy-string': {
    description: 'unrecognized iceTransportPolicy; should reject',
    options: { iceTransportPolicy: 'not-a-policy' } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },
  'invalid-servers-not-an-array': {
    description: 'iceServers is not an array; should reject',
    options: { iceServers: 'nope' } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },
  'invalid-server-null': {
    description: 'iceServers contains null; should reject',
    options: { iceServers: [null] } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },
  'invalid-server-missing-server-url': {
    description: 'iceServer has credentials but no serverUrl; should reject',
    options: { iceServers: [{ username: 'x', password: 'y' }] } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },
  'invalid-server-partial-credentials': {
    description: 'iceServer has a username but no password; should reject',
    options: {
      iceServers: [{ serverUrl: BOGUS_ICE_SERVER.serverUrl, username: 'x' }],
    } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },
  'invalid-server-url-wrong-type': {
    description: 'iceServer serverUrl is not a string; should reject',
    options: { iceServers: [{ serverUrl: 1234 }] } as any,
    expectation: EXPECTED_VOICE_CONNECT_REJECTION,
  },

  // --- no ICE options -------------------------------------------------------
  'baseline-no-options': {
    description: 'no ICE options at all; should connect',
    options: {},
    expectation: Call.Event.Connected,
  },

  // --- options that are effectively no-ops ----------------------------------
  'empty-servers': {
    description: 'empty iceServers array, no policy; should connect',
    options: { iceServers: [] },
    expectation: Call.Event.Connected,
  },
  'empty-servers-all-policy': {
    description: 'empty iceServers array, explicit "all" policy; should connect',
    options: { iceServers: [], iceTransportPolicy: IceTransportPolicy.All },
    expectation: Call.Event.Connected,
  },

  // --- policy only, no servers ----------------------------------------------
  'all-policy-only': {
    description: '"all" policy, no servers; should connect',
    options: { iceTransportPolicy: IceTransportPolicy.All },
    expectation: Call.Event.Connected,
  },
  'relay-policy-only': {
    description:
      'relay policy, no servers; should fail to connect because there are ' +
      'no relay candidates to use',
    options: { iceTransportPolicy: IceTransportPolicy.Relay },
    expectation: Call.Event.ConnectFailure,
  },

  // --- bogus servers --------------------------------------------------------
  'bogus-servers-default-policy': {
    description:
      'unreachable turn server, default policy; should connect anyway ' +
      'because non-relay candidates are still allowed',
    options: { iceServers: [BOGUS_ICE_SERVER] },
    expectation: Call.Event.Connected,
  },
  'bogus-servers-all-policy': {
    description:
      'unreachable turn server, explicit "all" policy; should connect anyway',
    options: {
      iceServers: [BOGUS_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.All,
    },
    expectation: Call.Event.Connected,
  },
  'bogus-servers-relay-policy': {
    description:
      'unreachable turn server, relay-only policy; should fail to connect ' +
      'because there is no usable relay candidate',
    options: {
      iceServers: [BOGUS_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: Call.Event.ConnectFailure,
  },
  'bogus-server-url-only-relay-policy': {
    description:
      'unreachable turn server with no credentials, relay-only policy; ' +
      'should fail to connect',
    options: {
      iceServers: [{ serverUrl: BOGUS_ICE_SERVER.serverUrl }],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: Call.Event.ConnectFailure,
  },
  'multiple-bogus-servers-relay-policy': {
    description:
      'several unreachable turn servers, relay-only policy; should fail to ' +
      'connect',
    options: {
      iceServers: [
        BOGUS_ICE_SERVER,
        { serverUrl: 'turn:127.0.0.1:3479', username: 'x', password: 'y' },
        { serverUrl: 'turn:127.0.0.1:3480' },
      ],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: Call.Event.ConnectFailure,
  },

  // --- valid servers (require VALID_ICE_SERVER above) -----------------------
  'valid-servers-relay-policy': {
    description:
      'real turn server, relay-only policy; should connect',
    options: {
      iceServers: [VALID_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: Call.Event.Connected,
  },
  'valid-and-bogus-servers-relay-policy': {
    description:
      'one real and one unreachable turn server, relay-only policy; should ' +
      'connect through the reachable one',
    options: {
      iceServers: [BOGUS_ICE_SERVER, VALID_ICE_SERVER],
      iceTransportPolicy: IceTransportPolicy.Relay,
    },
    expectation: Call.Event.Connected,
  },
} satisfies Record<string, TestVariant>;

type VariantName = keyof typeof VARIANTS;

/**
 * What a variant actually settled on.
 *
 * - `timeout`: nothing terminal was raised before the deadline.
 * - `unexpected-resolution`: `voice.connect` resolved when a rejection was
 *   expected. Note that this is distinct from `Call.Event.Connected` - the call
 *   object was created, but no connection was ever observed.
 * - `unexpected-voice-connect-rejection`: `voice.connect` rejected with
 *   something other than an `InvalidArgumentError`, e.g. an expired token.
 *   Never counts as a pass, otherwise an auth failure would green-light every
 *   `expected-voice-connect-rejection` variant without validating anything.
 */
type Actual =
  | Expectation
  | 'timeout'
  | 'unexpected-resolution'
  | 'unexpected-voice-connect-rejection';

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
 * Races the terminal `Call.Event`s against a timeout. Resolves with whichever
 * lands first.
 */
const waitForTerminalCallEvent = (
  call: Call,
  timeoutMs: number,
): Promise<Actual> => new Promise((resolve) => {
  let settled = false;

  const settle = (terminal: Actual) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    resolve(terminal);
  };

  const timeoutId = setTimeout(() => {
    settle('timeout');
  }, timeoutMs);

  TERMINAL_CALL_EVENTS.forEach((eventName) => {
    call.on(eventName, () => settle(eventName));
  });
});

/**
 * Runs a single variant to a terminal outcome. Never rejects.
 */
const runVariant = async (
  variantName: VariantName,
  voice: Voice,
  token: string,
  log: ReturnType<typeof useLogging>['log'],
): Promise<VariantResult> => {
  const { description, options, expectation } = VARIANTS[variantName];

  if (requiresValidIceServer(variantName) && !HAS_VALID_ICE_SERVER) {
    return {
      variant: variantName,
      outcome: 'skipped',
      expected: expectation,
      actual: null,
      note: 'VALID_ICE_SERVER is not filled in',
    };
  }

  log.info(JSON.stringify({
    running: variantName,
    description,
    expectation,
    options,
  }));

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

  const connectResult = await safelySettlePromise(
    voice.connect(token, options),
  );

  if (connectResult.status === 'rejected') {
    const { error } = connectResult;
    const serializedError = error instanceof Error
      ? `${error.name}: ${error.message}`
      : String(error);

    // Only a validation rejection counts as `EXPECTED_VOICE_CONNECT_REJECTION`.
    // Anything else - most likely an expired or invalid access token - would
    // otherwise pass every `reject` variant while exercising no ICE
    // validation at all.
    const isInvalidArgumentError =
      error instanceof TwilioErrors.InvalidArgumentError;

    return settleVariant(
      isInvalidArgumentError
        ? EXPECTED_VOICE_CONNECT_REJECTION
        : 'unexpected-voice-connect-rejection',
      serializedError,
    );
  }

  const call = connectResult.value;

  if (expectation === EXPECTED_VOICE_CONNECT_REJECTION) {
    // Resolved when validation should have refused the options. Hang up so
    // the call does not linger on the device.
    await safelySettlePromise(call.disconnect());
    return settleVariant(
      'unexpected-resolution',
      'voice.connect resolved instead of rejecting',
    );
  }

  // Log every event, terminal or not. The non-terminal ones (`Ringing`,
  // `Reconnecting`, ...) are useful context when a variant misbehaves.
  Object.values(Call.Event).forEach((eventName) => {
    call.on(eventName, (...args: any[]) => {
      log.info(JSON.stringify({ variant: variantName, eventName, args }));
    });
  });

  // Whichever terminal event lands first wins. Latching matters here: an
  // expected `ConnectFailure` is typically followed by a `Disconnected`, and a
  // `Connected` is followed by one once we hang up below.
  const actual = await waitForTerminalCallEvent(call, TEST_TIMEOUT_MS[expectation]);

  // Whatever happened, make sure the call is torn down before the next
  // variant places another one.
  await safelySettlePromise(call.disconnect());

  return settleVariant(actual);
};

export const useIceTest: UseTestSuite = (
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

    const variantNames = Object.keys(VARIANTS) as VariantName[];

    const results: VariantResult[] = [];

    for (const variantName of variantNames) {
      const result = await runVariant(variantName, voice, token, log);

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
