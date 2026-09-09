import type { TestStatus } from '../test-suites';
import { delay } from './delay';
import { describeError, type Log } from './run-steps';
import { safelySettlePromise } from './safely-settle-promise';

/**
 * Runs whole suites back to back in one app launch.
 *
 * `run-steps.ts` is the runner for the steps *within* a suite. This is the
 * runner for the suites themselves, used by `src/test-suites/unattended-all.ts`
 * and `src/test-suites/attended-all.ts` so neither collection needs an app
 * restart between every suite it runs.
 *
 * Deliberately knows nothing about any particular suite. It takes whatever it
 * is handed and reports what happened. `unattended-all` and `attended-all` are
 * suites like any other from `src/app/index.tsx`'s point of view - it does not
 * know, and this module does not care, that a suite calling into here is
 * itself running several others.
 *
 * This is the weaker of the two ways to run every suite. Each suite here shares
 * the one `Voice` instance that lives for the life of the app, so listeners and
 * audio routing carry across suite boundaries. The stronger approach is to
 * drive suites from `test/appium-orchestrator`, relaunching the app between
 * each.
 */

/**
 * Fallback timeout for a suite that does not specify its own.
 *
 * Every suite passed to `runSuites` today specifies its own `timeoutMs`,
 * sized from that suite's own internal timeout constants or its observed
 * duration. This default exists for a suite added without one, not as a value
 * anything currently relies on.
 *
 * `outgoing-call` is the one suite with no internal ceiling of its own - its
 * docblock records that the TwiML it waits on is not guaranteed to hang up -
 * so until it has a timeout of its own (VBLOCKS-7138), whatever timeout it is
 * given here is the only thing bounding it.
 */
export const SUITE_TIMEOUT_MS = 180_000;

/**
 * Pause between suites, so the audio session and any call state settle before
 * the next suite starts.
 *
 * A caller running attended suites should pass a longer value: the tester
 * needs time to read one suite's closing summary before the next suite's
 * first prompt appears.
 */
export const INTER_SUITE_DELAY_MS = 3_000;

/**
 * A suite as the runner sees it. `perform` never rejects in practice, because
 * every suite settles its own errors, but the runner does not rely on that.
 *
 * `timeoutMs` overrides the default passed to `runSuites` for this suite
 * alone. Suites vary enormously in their own worst case - an attended suite
 * that waits on a tester can need ten to thirty times what a self-driving
 * suite needs - so one shared value across every suite in a run is not
 * meaningful.
 */
export type RunnableSuite = {
  id: string;
  perform: () => Promise<void>;
  timeoutMs?: number;
};

/**
 * What one suite settled on.
 *
 * `timeout` is distinct from `failure` on purpose. A suite that never settles
 * is a different problem from one that ran and reported failures, and the
 * summary should not conflate them.
 */
export type SuiteOutcome = TestStatus | 'timeout' | 'error';

export type SuiteResult = {
  id: string;
  outcome: SuiteOutcome;
  note?: string;
  durationMs: number;
};

/**
 * Races a suite against the timeout. Resolves either way, never rejects.
 *
 * The losing promise is abandoned rather than cancelled, because a suite has no
 * cancellation mechanism. A timed-out suite keeps running in the background and
 * may still write to the log, which is why the summary records the timeout
 * rather than the suite's own eventual status.
 */
const runOneSuite = async (
  suite: RunnableSuite,
  readStatus: (id: string) => TestStatus,
  timeoutMs: number,
  log: Log,
): Promise<SuiteResult> => {
  const startedAt = Date.now();

  log.info(JSON.stringify({
    message: 'starting suite',
    suite: suite.id,
    startedAt: new Date(startedAt).toISOString(),
  }));

  // Tagged rather than raced against a sentinel value, so the winner narrows.
  const settled = await Promise.race([
    safelySettlePromise(Promise.resolve().then(suite.perform)).then(
      (result) => ({ kind: 'settled' as const, result }),
    ),
    delay(timeoutMs).then(() => ({ kind: 'timeout' as const })),
  ]);

  const durationMs = Date.now() - startedAt;

  if (settled.kind === 'timeout') {
    return {
      id: suite.id,
      outcome: 'timeout',
      note: `the suite did not settle within ${timeoutMs}ms`,
      durationMs,
    };
  }

  if (settled.result.status === 'rejected') {
    return {
      id: suite.id,
      outcome: 'error',
      note: describeError(settled.result.error),
      durationMs,
    };
  }

  // A suite reports its result by setting its own status rather than by
  // resolving with one, so the outcome is read back rather than returned.
  return { id: suite.id, outcome: readStatus(suite.id), durationMs };
};

/**
 * Runs every suite in order. Never rejects.
 *
 * A suite that fails, throws or times out is recorded and the run continues.
 * One broken suite must not cost the others.
 */
export const runSuites = async (
  suites: RunnableSuite[],
  readStatus: (id: string) => TestStatus,
  log: Log,
  defaultTimeoutMs: number = SUITE_TIMEOUT_MS,
  interSuiteDelayMs: number = INTER_SUITE_DELAY_MS,
): Promise<SuiteResult[]> => {
  const results: SuiteResult[] = [];

  for (const [index, suite] of suites.entries()) {
    const timeoutMs = suite.timeoutMs ?? defaultTimeoutMs;
    const result = await runOneSuite(suite, readStatus, timeoutMs, log);

    results.push(result);

    log.info(JSON.stringify({
      completedSuite: result.id,
      outcome: result.outcome,
      note: result.note,
      durationMs: result.durationMs,
      progress: `${index + 1}/${suites.length}`,
    }));

    if (index < suites.length - 1) {
      await delay(interSuiteDelayMs);
    }
  }

  return results;
};

/**
 * Logs the closing summary and reports whether every suite succeeded.
 *
 * The caveat is part of the summary rather than only the documentation, because
 * whoever reads a failure here needs it at that moment.
 */
export const summarizeSuiteResults = (
  results: SuiteResult[],
  log: Log,
): { succeeded: boolean } => {
  const notSucceeded = results.filter((r) => r.outcome !== 'success');

  log.info(JSON.stringify({
    suiteSummary: {
      total: results.length,
      succeeded: results.length - notSucceeded.length,
      failed: notSucceeded.length,
    },
    results: results.map((r) => ({
      suite: r.id,
      outcome: r.outcome,
      durationMs: r.durationMs,
      note: r.note,
    })),
    caveat:
      'every suite in this run shared one Voice instance, so listeners and ' +
      'audio routing carry across suite boundaries. Re-run a failing suite ' +
      'on its own before acting on the failure.',
  }));

  return { succeeded: notSucceeded.length === 0 };
};
