import * as React from 'react';
import { PreflightTest } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { REPORT_TYPES, SAMPLE_TYPES } from './preflight-test';
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
 * The `PreflightTest` getters read before the value they report exists.
 *
 * `preflight-test` covers a completed run. This suite covers everything before
 * that point.
 *
 * `getReport` and `getLatestSample` resolve with an all-zero-valued object
 * before the `PreflightTest` has a real one to report, because that is what
 * the native layer itself reports for "not ready" on both platforms. The SDK
 * passes that object through rather than translating it into `undefined`, so
 * this suite asserts the all-zero object is what actually arrives. Only
 * `getEndTime` resolves with `undefined` before the `PreflightTest` ends, and
 * nothing else exercises the `undefined` half of that return type.
 *
 * Whether Android can report a partial report before the test completes is
 * settled by `get-report-after-first-sample`.
 */

/**
 * How long to wait for the first `PreflightTest.Event.Sample`. A preflight test
 * has to connect and place a test call before it can sample.
 */
const FIRST_SAMPLE_TIMEOUT_MS = 60_000;

/**
 * How long to wait for a terminal event after `stop()`.
 */
const TERMINAL_TIMEOUT_MS = 30_000;

/**
 * How long to let the native `Rejected` style events settle before reading
 * state back. Derived from the terminal timeout so the two stay in step.
 */
const STATE_SETTLE_DELAY_MS = 1_000;

/**
 * How a `PreflightTest` settled, from this suite's point of view.
 */
type TerminalOutcome = 'completed' | 'failed' | 'timeout';

/**
 * Records the events a `PreflightTest` raises and exposes the two waits this
 * suite needs.
 *
 * Listeners are bound eagerly, immediately after `runPreflight` resolves. The
 * `PreflightTest` constructor flushes buffered native events on a `setTimeout`,
 * so a listener bound later would miss them.
 */
const observePreflightTest = (preflightTest: PreflightTest, log: Log) => {
  const samples: PreflightTest.RTCSample[] = [];

  // The definite-assignment assertions are load-bearing. A Promise executor
  // runs synchronously, so both are assigned before anything can read them,
  // but TypeScript does not track assignments made inside a callback.
  let resolveFirstSample!: (didSample: boolean) => void;
  const firstSample = new Promise<boolean>((resolve) => {
    resolveFirstSample = resolve;
  });

  let resolveTerminal!: (outcome: TerminalOutcome) => void;
  const terminal = new Promise<TerminalOutcome>((resolve) => {
    resolveTerminal = resolve;
  });

  Object.values(PreflightTest.Event).forEach((eventName) => {
    preflightTest.on(eventName, (...args: any[]) => {
      log.info(JSON.stringify({ eventName, argCount: args.length }));
    });
  });

  preflightTest.on(PreflightTest.Event.Sample, (sample) => {
    samples.push(sample);
    resolveFirstSample(true);
  });

  preflightTest.on(PreflightTest.Event.Completed, () => {
    // Resolved defensively so that a run which completes without ever
    // sampling fails the sample step rather than hanging the suite.
    resolveFirstSample(false);
    resolveTerminal('completed');
  });

  preflightTest.on(PreflightTest.Event.Failed, () => {
    resolveFirstSample(false);
    resolveTerminal('failed');
  });

  const withTimeout = <T,>(
    promise: Promise<T>,
    timeoutMs: number,
    fallback: T,
  ): Promise<T> =>
    Promise.race([promise, delay(timeoutMs).then(() => fallback)]);

  return {
    samples,
    waitForFirstSample: (timeoutMs: number) =>
      withTimeout(firstSample, timeoutMs, false),
    waitForTerminal: (timeoutMs: number) =>
      withTimeout<TerminalOutcome>(terminal, timeoutMs, 'timeout'),
  };
};

/**
 * PreflightTest early-state suite.
 *
 * Takes the preflight access token, the same one `preflight-test` uses.
 */
export const usePreflightEarlyStateTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

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

    const runResult = await safelySettlePromise(voice.runPreflight(token, {}));

    if (runResult.status === 'rejected') {
      log.error(JSON.stringify({
        message: 'voice.runPreflight rejected',
        note: describeError(runResult.error),
      }));
      setTestStatus('failure');
      return;
    }

    const preflightTest = runResult.value;

    results.push({ step: 'run-preflight', outcome: 'passed' });

    const observed = observePreflightTest(preflightTest, log);

    // Phase 1. These reads race the first sample, which takes seconds to
    // arrive while each read takes milliseconds, so they run before anything
    // is waited on.
    await step('get-report-before-first-sample', async () => {
      const report = await preflightTest.getReport();
      log.info(JSON.stringify({ reportBeforeFirstSample: report }));
      expect(report, 'getReport() before the test completes').toMatchRecordTypes(
        REPORT_TYPES,
      );
      expect(
        report.callSid,
        'getReport().callSid before the test completes',
      ).toBe('');
      expect(
        report.samples,
        'getReport().samples before the test completes',
      ).toHaveLength(0);
    });

    await step('get-latest-sample-before-first-sample', async () => {
      const sample = await preflightTest.getLatestSample();
      log.info(JSON.stringify({ sampleBeforeFirstSample: sample }));
      expect(
        sample,
        'getLatestSample() before the first sample',
      ).toMatchRecordTypes(SAMPLE_TYPES);
      expect(
        sample.timestamp,
        'getLatestSample().timestamp before the first sample',
      ).toBe(0);
      expect(
        sample.codec,
        'getLatestSample().codec before the first sample',
      ).toBe('');
    });

    await step('get-end-time-before-end', async () => {
      const endTime = await preflightTest.getEndTime();
      log.info(JSON.stringify({ endTimeBeforeEnd: endTime }));
      expect(endTime, 'getEndTime() before the test ends').toBeUndefined();
    });

    await step('get-start-time-before-end', async () => {
      const startTime = await preflightTest.getStartTime();
      expect(startTime, 'getStartTime()').toBeTypeOf('number');
      expect(startTime > 0, 'getStartTime() is a positive timestamp').toBe(
        true,
      );
    });

    await step('get-state-before-first-sample', async () => {
      const state = await preflightTest.getState();
      log.info(JSON.stringify({ stateBeforeFirstSample: state }));
      expect(
        Object.values(PreflightTest.State),
        'getState() before the first sample',
      ).toContain(state);
    });

    // Phase 2. After the first sample the sample getter has a value and the
    // report getter still does not.
    const didSample = await observed.waitForFirstSample(
      FIRST_SAMPLE_TIMEOUT_MS,
    );

    await step('first-sample-event', () => {
      expect(
        didSample,
        'a PreflightTest.Event.Sample was raised within ' +
          `${FIRST_SAMPLE_TIMEOUT_MS}ms`,
      ).toBe(true);
    });

    if (didSample) {
      await step('get-latest-sample-after-first-sample', async () => {
        const sample = await preflightTest.getLatestSample();

        expect(sample, 'getLatestSample()').toMatchRecordTypes(SAMPLE_TYPES);
        expect(
          Number.isFinite(sample.timestamp),
          'getLatestSample().timestamp is a finite number',
        ).toBe(true);
      });

      // The native layer only populates the report once the test completes,
      // so a test that is still running reports the same all-zero report as
      // before the first sample.
      await step('get-report-after-first-sample', async () => {
        const report = await preflightTest.getReport();
        log.info(JSON.stringify({ reportAfterFirstSample: report }));
        expect(
          report,
          'getReport() while the test is still running',
        ).toMatchRecordTypes(REPORT_TYPES);
        expect(
          report.callSid,
          'getReport().callSid while the test is still running',
        ).toBe('');
      });
    }

    // Phase 3. Stopping the test ends it, which is what gives `getEndTime` a
    // value to report.
    const stopResult = await safelySettlePromise(preflightTest.stop());

    results.push(
      stopResult.status === 'rejected'
        ? {
            step: 'stop',
            outcome: 'failed',
            note: describeError(stopResult.error),
          }
        : { step: 'stop', outcome: 'passed' },
    );

    const terminal = await observed.waitForTerminal(TERMINAL_TIMEOUT_MS);

    await step('terminal-event-after-stop', () => {
      expect(terminal, 'the outcome after stop()').toBe('failed');
    });

    await step('get-end-time-after-end', async () => {
      // The end time is written by the native layer as the test tears down,
      // so give that a moment to land before reading.
      await delay(STATE_SETTLE_DELAY_MS);

      const endTime = await preflightTest.getEndTime();
      const startTime = await preflightTest.getStartTime();

      log.info(JSON.stringify({ endTimeAfterEnd: endTime, startTime }));

      expect(endTime, 'getEndTime() after the test ends').toBeDefined();
      expect(endTime, 'getEndTime()').toBeTypeOf('number');
      expect(
        endTime! >= startTime,
        'getEndTime() is at or after getStartTime()',
      ).toBe(true);
    });

    // A stopped test has no documented report contract, so only the shape is
    // asserted. What this records is what a stopped run leaves behind, which
    // may be a real report or the same all-zero report as a running test.
    await step('get-report-after-stop', async () => {
      const report = await preflightTest.getReport();

      log.info(JSON.stringify({ reportAfterStop: report }));

      expect(report, 'getReport() after stop()').toMatchRecordTypes(
        REPORT_TYPES,
      );
    });

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
