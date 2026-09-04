import * as React from 'react';
import {
  AudioCodecType,
  IceTransportPolicy,
  PreflightTest,
  TwilioErrors,
  Voice,
} from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
import { expect } from '../utilities/expect';
import {
  describeError,
  summarizeResults,
  type Log,
  type StepResult,
} from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

/**
 * `voice.runPreflight` and the `PreflightTest` object it resolves with.
 *
 * The suite runs in three phases:
 *
 * 1. Option validation. `runPreflight` rejects out of the JS validation layer
 *    before reaching native, so these variants cost nothing and need no
 *    network.
 * 2. A full successful run: the `Connected` -> `Sample` -> `Completed`
 *    sequence, the report handed to `Completed`, and every public method of
 *    `PreflightTest` read against the running and then completed test.
 * 3. `stop()`, which ends a second, separate run early and should surface as a
 *    `Failed` event and a `Failed` state.
 *
 * Note that this suite needs an access token with preflight grants, which is
 * not necessarily the token the call suites use - see
 * `getPreflightTestToken` in `src/utilities/token/get-token.ts`.
 */

/**
 * How long to wait for `PreflightTest.Event.Connected` after `runPreflight`
 * resolves.
 */
const CONNECTED_TIMEOUT_MS = 30_000;

/**
 * How long to wait for `PreflightTest.Event.Completed`. A preflight test places
 * a real test call and gathers samples for its full duration before reporting.
 */
const COMPLETED_TIMEOUT_MS = 120_000;

/**
 * How long to wait for `PreflightTest.Event.Failed` after `stop()`.
 */
const FAILED_TIMEOUT_MS = 30_000;

/**
 * How long to let the stopped-run phase gather samples before stopping it, so
 * that `stop()` interrupts a test that is actually underway.
 */
const RUN_BEFORE_STOP_MS = 5_000;

/**
 * Pause between phases, so a completed or stopped test is fully torn down
 * before the next one starts. Native rejects a second concurrent preflight
 * test.
 */
const INTER_PHASE_DELAY_MS = 3_000;

const BOGUS_ICE_SERVER = {
  serverUrl: 'turn:127.0.0.1:3478',
  username: 'x',
  password: 'y',
};

/**
 * Options that JS validation should refuse, before `runPreflight` ever reaches
 * native. Mirrors the `invalid-*` variants of `ice-test.ts`, extended with the
 * `preferredAudioCodecs` validation that is unique to preflight options.
 */
const INVALID_OPTIONS = {
  'invalid-policy-string': {
    description: 'unrecognized iceTransportPolicy; should reject',
    options: { iceTransportPolicy: 'not-a-policy' } as any,
  },
  'invalid-servers-not-an-array': {
    description: 'iceServers is not an array; should reject',
    options: { iceServers: 'nope' } as any,
  },
  'invalid-server-null': {
    description: 'iceServers contains null; should reject',
    options: { iceServers: [null] } as any,
  },
  'invalid-server-missing-server-url': {
    description: 'iceServer has credentials but no serverUrl; should reject',
    options: { iceServers: [{ username: 'x', password: 'y' }] } as any,
  },
  'invalid-server-partial-credentials': {
    description: 'iceServer has a username but no password; should reject',
    options: {
      iceServers: [{ serverUrl: BOGUS_ICE_SERVER.serverUrl, username: 'x' }],
    } as any,
  },
  'invalid-codecs-not-an-array': {
    description: 'preferredAudioCodecs is not an array; should reject',
    options: { preferredAudioCodecs: 'nope' } as any,
  },
  'invalid-codec-type': {
    description:
      'preferredAudioCodecs contains an unrecognized codec type; should reject',
    options: { preferredAudioCodecs: [{ type: 'not-a-codec' }] } as any,
  },
  // KNOWN FAILING: `validateAudioCodec` guards on `typeof` alone, and
  // `typeof null === 'object'`, so this throws a TypeError rather than
  // rejecting. The ice server validator handles null correctly.
  // TODO: VBLOCKS-7137
  'invalid-codec-null': {
    description: 'preferredAudioCodecs contains null; should reject',
    options: { preferredAudioCodecs: [null] } as any,
  },
} satisfies Record<string, { description: string; options: any }>;

type InvalidOptionName = keyof typeof INVALID_OPTIONS;

/**
 * Options for the successful run of phase 2. Explicit rather than empty, so
 * that the accepted shape of every option field is exercised too.
 */
const VALID_OPTIONS: PreflightTest.Options = {
  iceTransportPolicy: IceTransportPolicy.All,
  preferredAudioCodecs: [{ type: AudioCodecType.Opus }],
};

/**
 * Top-level report fields whose types do not vary. `callQuality` and
 * `isTurnRequired` are nullable and are asserted on separately.
 *
 * Only the top level is checked. The nested per-candidate, per-sample and
 * per-warning records are covered in depth by the detox suite at
 * `test/app/e2e/suites/preflightTest.test.ts`.
 */
export const REPORT_TYPES = {
  callSid: 'string',
  edge: 'string',
  iceCandidateStats: 'array',
  networkTiming: 'object',
  samples: 'array',
  selectedEdge: 'string',
  selectedIceCandidatePairStats: 'object',
  stats: 'object',
  testTiming: 'object',
  warnings: 'array',
  warningsCleared: 'array',
} as const;

/**
 * Fields of an `RTCSample`, as carried by `PreflightTest.Event.Sample` and
 * returned by `getLatestSample()`.
 */
export const SAMPLE_TYPES = {
  audioInputLevel: 'number',
  audioOutputLevel: 'number',
  bytesReceived: 'number',
  bytesSent: 'number',
  codec: 'string',
  jitter: 'number',
  mos: 'number',
  packetsLost: 'number',
  packetsLostFraction: 'number',
  packetsReceived: 'number',
  packetsSent: 'number',
  rtt: 'number',
  timestamp: 'number',
} as const;

/**
 * What a `PreflightTest` settled on, and any payload the event carried.
 */
type TerminalOutcome =
  | { settled: 'completed'; report: PreflightTest.Report }
  | { settled: 'failed'; error: unknown }
  | { settled: 'timeout' };

/**
 * Records the event sequence a `PreflightTest` raises and exposes promises for
 * the points the suite needs to wait on.
 *
 * Listeners are bound eagerly, immediately after `runPreflight` resolves,
 * because `Connected` can be raised as soon as the call stack empties - the
 * `PreflightTest` constructor flushes buffered native events on a
 * `setTimeout`. Waiting to bind until a step needs the event would drop it.
 */
const observePreflightTest = (
  preflightTest: PreflightTest,
  log: Log,
) => {
  const raisedEvents: PreflightTest.Event[] = [];
  const samples: PreflightTest.RTCSample[] = [];

  // The definite-assignment assertions are load-bearing: a Promise executor
  // runs synchronously, so both are assigned before anything can read them, but
  // TypeScript does not track assignments made inside a callback and would
  // otherwise report them as used before assigned.
  let resolveConnected!: (didConnect: boolean) => void;
  const connected = new Promise<boolean>((resolve) => {
    resolveConnected = resolve;
  });

  let resolveTerminal!: (outcome: TerminalOutcome) => void;
  const terminal = new Promise<TerminalOutcome>((resolve) => {
    resolveTerminal = resolve;
  });

  /**
   * `raisedEvents` as it stood at the terminal event. The listeners stay bound
   * for the life of the object, so `raisedEvents` keeps growing after
   * `Completed`; ordering assertions read this snapshot instead.
   */
  let raisedEventsAtTerminal: PreflightTest.Event[] | undefined;

  const settleTerminal = (outcome: TerminalOutcome) => {
    raisedEventsAtTerminal = [...raisedEvents];
    resolveTerminal(outcome);
  };

  Object.values(PreflightTest.Event).forEach((eventName) => {
    preflightTest.on(eventName, (...args: any[]) => {
      raisedEvents.push(eventName);
      log.info(JSON.stringify({ eventName, args }));
    });
  });

  preflightTest.on(PreflightTest.Event.Connected, () => {
    resolveConnected(true);
  });

  preflightTest.on(PreflightTest.Event.Sample, (sample) => {
    samples.push(sample);
  });

  preflightTest.on(PreflightTest.Event.Completed, (report) => {
    // `Connected` precedes `Completed`, but resolve it defensively so a
    // missing `Connected` fails its own step rather than hanging the suite.
    resolveConnected(false);
    settleTerminal({ settled: 'completed', report });
  });

  preflightTest.on(PreflightTest.Event.Failed, (error) => {
    resolveConnected(false);
    settleTerminal({ settled: 'failed', error });
  });

  /**
   * Races a promise against a timeout, resolving with `fallback` if the
   * timeout wins. Listeners stay bound either way - the test object is
   * discarded at the end of its phase.
   */
  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T,
  ): Promise<T> =>
    Promise.race([
      promise,
      delay(timeoutMs).then(() => fallback),
    ]);

  return {
    // A function because the snapshot does not exist until the terminal event
    // lands. The live `raisedEvents` is deliberately not exposed.
    getRaisedEventsAtTerminal: () => raisedEventsAtTerminal ?? [],
    samples,
    waitForConnected: (timeoutMs: number) =>
      withTimeout(connected, timeoutMs, false),
    waitForTerminal: (timeoutMs: number) =>
      withTimeout<TerminalOutcome>(terminal, timeoutMs, { settled: 'timeout' }),
  };
};

/**
 * Asserts the top-level shape of a completed report.
 */
const assertReport = (report: PreflightTest.Report) => {
  expect(report, 'report').toMatchRecordTypes(REPORT_TYPES);
  expect(report.callSid, 'report.callSid').not.toHaveLength(0);
  expect(report.edge, 'report.edge').not.toHaveLength(0);

  // A successful run rates the call, but a run that gathered too few samples
  // reports a null quality rather than failing.
  if (report.callQuality !== null) {
    expect(
      Object.values(PreflightTest.CallQuality),
      'report.callQuality',
    ).toContain(report.callQuality);
  }

  // Null when there were no selected ICE candidates.
  if (report.isTurnRequired !== null) {
    expect(report.isTurnRequired, 'report.isTurnRequired').toBeTypeOf(
      'boolean',
    );
  }
};

/**
 * Phase 1. Each invalid option set should be refused by JS validation with an
 * `InvalidArgumentError`, without reaching native.
 */
const runValidationPhase = async (
  voice: Voice,
  token: string,
  log: Log,
): Promise<StepResult[]> => {
  const results: StepResult[] = [];

  for (const name of Object.keys(INVALID_OPTIONS) as InvalidOptionName[]) {
    const { description, options } = INVALID_OPTIONS[name];

    log.info(JSON.stringify({ running: name, description, options }));

    const result = await safelySettlePromise(
      voice.runPreflight(token, options),
    );

    if (result.status === 'resolved') {
      // Validation let it through. Stop the test so it does not occupy the
      // native slot the later phases need.
      await safelySettlePromise(result.value.stop());
      results.push({
        step: name,
        outcome: 'failed',
        note: 'runPreflight resolved instead of rejecting',
      });
      continue;
    }

    const isInvalidArgumentError =
      result.error instanceof TwilioErrors.InvalidArgumentError;

    results.push({
      step: name,
      outcome: isInvalidArgumentError ? 'passed' : 'failed',
      note: isInvalidArgumentError
        ? undefined
        : 'expected an InvalidArgumentError but got ' +
          describeError(result.error),
    });
  }

  return results;
};

/**
 * Phase 2. A full run to `Completed`, then the report and every public method
 * of the completed test.
 */
const runSuccessfulRunPhase = async (
  voice: Voice,
  token: string,
  log: Log,
): Promise<StepResult[]> => {
  const results: StepResult[] = [];

  /**
   * Runs one assertion block as its own step. Never rejects.
   */
  const step = async (name: string, run: () => Promise<void> | void) => {
    const result = await safelySettlePromise(Promise.resolve().then(run));

    results.push(
      result.status === 'rejected'
        ? { step: name, outcome: 'failed', note: describeError(result.error) }
        : { step: name, outcome: 'passed' },
    );

    log.info(JSON.stringify({
      completed: name,
      outcome: results[results.length - 1].outcome,
      note: results[results.length - 1].note,
    }));
  };

  const runResult = await safelySettlePromise(
    voice.runPreflight(token, VALID_OPTIONS),
  );

  if (runResult.status === 'rejected') {
    results.push({
      step: 'run-preflight',
      outcome: 'failed',
      note: `runPreflight rejected: ${describeError(runResult.error)}`,
    });
    return results;
  }

  const preflightTest = runResult.value;

  results.push({ step: 'run-preflight', outcome: 'passed' });

  const observed = observePreflightTest(preflightTest, log);

  await step('connected-event', async () => {
    const didConnect = await observed.waitForConnected(CONNECTED_TIMEOUT_MS);
    expect(didConnect, 'PreflightTest.Event.Connected was raised').toBe(true);
  });

  // Read the methods that should answer while the test is still running.
  await step('get-state-while-connected', async () => {
    expect(await preflightTest.getState(), 'getState()').toBe(
      PreflightTest.State.Connected,
    );
  });

  await step('get-call-sid-while-connected', async () => {
    const callSid = await preflightTest.getCallSid();
    expect(callSid, 'getCallSid()').toBeTypeOf('string');
    expect(callSid, 'getCallSid()').not.toHaveLength(0);
  });

  await step('get-start-time-while-connected', async () => {
    const startTime = await preflightTest.getStartTime();
    expect(startTime, 'getStartTime()').toBeTypeOf('number');
    expect(startTime > 0, 'getStartTime() is a positive timestamp').toBe(true);
  });

  const terminal = await observed.waitForTerminal(COMPLETED_TIMEOUT_MS);

  await step('completed-event', () => {
    expect(terminal.settled, 'preflight test outcome').toBe('completed');
  });

  if (terminal.settled !== 'completed') {
    // Nothing below can be asserted without a completed test. Make sure it is
    // not left running for the next phase.
    await safelySettlePromise(preflightTest.stop());

    log.error(JSON.stringify({
      message: 'preflight test did not complete',
      outcome: terminal.settled,
      note: terminal.settled === 'failed'
        ? describeError(terminal.error)
        : `waited ${COMPLETED_TIMEOUT_MS}ms`,
    }));

    return results;
  }

  await step('sample-events', () => {
    expect(
      observed.samples.length > 0,
      'at least one PreflightTest.Event.Sample was raised',
    ).toBe(true);

    observed.samples.forEach((sample, index) => {
      expect(sample, `sample[${index}]`).toMatchRecordTypes(SAMPLE_TYPES);
    });
  });

  await step('event-order', () => {
    // The snapshot, not the live array: this step runs two awaits after
    // `Completed`, by which point native may have flushed a trailing event.
    const eventsAtTerminal = observed.getRaisedEventsAtTerminal();

    const connectedIndex = eventsAtTerminal.indexOf(
      PreflightTest.Event.Connected,
    );
    const completedIndex = eventsAtTerminal.indexOf(
      PreflightTest.Event.Completed,
    );

    expect(connectedIndex, 'index of the Connected event').toBe(0);
    expect(
      completedIndex,
      'index of the Completed event',
    ).toBe(eventsAtTerminal.length - 1);
  });

  await step('completed-event-report', () => {
    assertReport(terminal.report);
  });

  await step('get-report-after-completed', async () => {
    const report = await preflightTest.getReport();
    // `getReport` resolves with `undefined` when no report is available, so a
    // completed PreflightTest returning a defined report is itself an
    // assertion this suite makes.
    expect(report, 'getReport()').toBeDefined();
    assertReport(report!);
    expect(report!.callSid, 'getReport().callSid').toBe(
      terminal.report.callSid,
    );
  });

  await step('get-state-after-completed', async () => {
    expect(await preflightTest.getState(), 'getState()').toBe(
      PreflightTest.State.Completed,
    );
  });

  await step('get-end-time-after-completed', async () => {
    const endTime = await preflightTest.getEndTime();
    const startTime = await preflightTest.getStartTime();
    // `getEndTime` resolves with `undefined` until the PreflightTest ends, so a
    // completed PreflightTest returning a defined end time is itself an
    // assertion this suite makes.
    expect(endTime, 'getEndTime()').toBeDefined();
    expect(endTime, 'getEndTime()').toBeTypeOf('number');
    expect(
      endTime! >= startTime,
      'getEndTime() is at or after getStartTime()',
    ).toBe(true);
  });

  await step('get-latest-sample-after-completed', async () => {
    const sample = await preflightTest.getLatestSample();
    expect(sample, 'getLatestSample()').toMatchRecordTypes(SAMPLE_TYPES);
  });

  return results;
};

/**
 * Phase 3. `stop()` on a run that is underway should surface as a `Failed`
 * event and leave the test in the `Failed` state.
 */
const runStopPhase = async (
  voice: Voice,
  token: string,
  log: Log,
): Promise<StepResult[]> => {
  const results: StepResult[] = [];

  const runResult = await safelySettlePromise(voice.runPreflight(token));

  if (runResult.status === 'rejected') {
    return [
      {
        step: 'stop-run-preflight',
        outcome: 'failed',
        note: `runPreflight rejected: ${describeError(runResult.error)}`,
      },
    ];
  }

  const preflightTest = runResult.value;
  const observed = observePreflightTest(preflightTest, log);

  const didConnect = await observed.waitForConnected(CONNECTED_TIMEOUT_MS);
  if (!didConnect) {
    await safelySettlePromise(preflightTest.stop());
    return [
      {
        step: 'stop-connected-event',
        outcome: 'failed',
        note:
          'preflight test did not raise Connected within ' +
          `${CONNECTED_TIMEOUT_MS}ms`,
      },
    ];
  }

  // Let it gather samples, so `stop()` interrupts a test in progress rather
  // than one that has barely started.
  await delay(RUN_BEFORE_STOP_MS);

  const stopResult = await safelySettlePromise(preflightTest.stop());

  results.push(
    stopResult.status === 'rejected'
      ? {
          step: 'stop',
          outcome: 'failed',
          note: `stop rejected: ${describeError(stopResult.error)}`,
        }
      : { step: 'stop', outcome: 'passed' },
  );

  const terminal = await observed.waitForTerminal(FAILED_TIMEOUT_MS);

  results.push(
    terminal.settled === 'failed'
      ? { step: 'stop-failed-event', outcome: 'passed' }
      : {
          step: 'stop-failed-event',
          outcome: 'failed',
          note:
            'expected a Failed event after stop but the test settled on ' +
            terminal.settled,
        },
  );

  const stateResult = await safelySettlePromise(preflightTest.getState());

  if (stateResult.status === 'rejected') {
    results.push({
      step: 'stop-state',
      outcome: 'failed',
      note: `getState rejected: ${describeError(stateResult.error)}`,
    });
  } else {
    results.push(
      stateResult.value === PreflightTest.State.Failed
        ? { step: 'stop-state', outcome: 'passed' }
        : {
            step: 'stop-state',
            outcome: 'failed',
            note:
              `expected the state to be "${PreflightTest.State.Failed}" but ` +
              `it is "${stateResult.value}"`,
          },
    );
  }

  return results;
};

/**
 * PreflightTest suite.
 */
export const usePreflightTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const results: StepResult[] = [];

    log.info(JSON.stringify({ phase: 'option-validation' }));
    results.push(...await runValidationPhase(voice, token, log));

    await delay(INTER_PHASE_DELAY_MS);

    log.info(JSON.stringify({ phase: 'successful-run' }));
    results.push(...await runSuccessfulRunPhase(voice, token, log));

    await delay(INTER_PHASE_DELAY_MS);

    log.info(JSON.stringify({ phase: 'stop' }));
    results.push(...await runStopPhase(voice, token, log));

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
