import { Platform } from 'react-native';
import { safelySettlePromise } from './safely-settle-promise';

/**
 * The shared step runner.
 *
 * Every suite had grown the same four things: a `StepResult` type, a
 * `describeError` helper, a `runStep` that logs the step and settles its
 * promise, and a closing block that partitions the results and logs a summary.
 * Six copies meant six chances for the log format to drift, which matters here
 * because the orchestrator reads these entries.
 *
 * What is deliberately *not* here: the suites that place a call per variant
 * (`connect-options.ts`, `ice-test.ts`, `incoming-ice-test.ts`) keep their own
 * loops. Their per-variant work is connect / assert / tear down rather than a
 * single assertion block, so folding them in would mean a runner with enough
 * options to be worse than the duplication. `connect-options.ts` still shares
 * `describeError`, `StepResult` and `summarizeResults`; the two ICE suites
 * predate this module and hand-roll all three, so their summaries key failures
 * by `variant` with `expected`/`actual` rather than by `step` - anything
 * parsing these entries has to handle both shapes.
 */

/**
 * The logging surface a suite hands to its steps. Declared structurally rather
 * than as `ReturnType<typeof useLogging>['log']` so that this module does not
 * depend on the hooks, and so suites can stop repeating that type expression.
 */
export type Log = {
  info: (body: string) => void;
  warn: (body: string) => void;
  error: (body: string) => void;
};

export type StepOutcome = 'passed' | 'failed' | 'skipped';

export type StepResult = {
  step: string;
  outcome: StepOutcome;
  note?: string;
};

/**
 * One step of a suite.
 *
 * `C` is whatever the suite's steps need to work against - a `Call`, a
 * `{ voice, token }` pair, a call plus collected events. Keeping it generic is
 * what lets one runner serve every step-based suite.
 */
export type Step<C> = {
  name: string;
  description: string;
  /**
   * Platforms this step runs on. Omit to run everywhere. A step that does not
   * apply is reported as `skipped` rather than silently absent, so the summary
   * still accounts for it.
   */
  platforms?: Array<typeof Platform.OS>;
  run: (context: C, log: Log) => Promise<void>;
};

/**
 * Serializes a thrown value for a step note or log entry.
 */
export const describeError = (error: unknown): string =>
  error instanceof Error ? `${error.name}: ${error.message}` : String(error);

/**
 * Runs a single step to a result. Never rejects.
 *
 * A step reports failure by throwing - usually from an `expect` - and this is
 * where that becomes a recorded result instead of an aborted suite.
 */
export const runStep = async <C>(
  step: Step<C>,
  context: C,
  log: Log,
): Promise<StepResult> => {
  if (step.platforms && !step.platforms.includes(Platform.OS)) {
    return {
      step: step.name,
      outcome: 'skipped',
      note: `only runs on ${step.platforms.join(', ')}`,
    };
  }

  log.info(JSON.stringify({
    running: step.name,
    description: step.description,
  }));

  // `Promise.resolve().then(...)` so that a `run` that throws synchronously
  // becomes a failed step instead of rejecting `runStep`. A rejected `runStep`
  // rejects `runSteps` and then the suite's `perform`, and nothing awaits
  // `perform`, so the status would be left at `in-progress` with no summary.
  const result = await safelySettlePromise(
    Promise.resolve().then(() => step.run(context, log)),
  );

  if (result.status === 'rejected') {
    return {
      step: step.name,
      outcome: 'failed',
      note: describeError(result.error),
    };
  }

  return { step: step.name, outcome: 'passed' };
};

/**
 * Runs every step in order against one shared context, logging progress as it
 * goes. Never rejects: a failing step is recorded and the run continues, so one
 * broken control does not mask the rest.
 */
export const runSteps = async <C>(
  steps: Array<Step<C>>,
  context: C,
  log: Log,
): Promise<StepResult[]> => {
  const results: StepResult[] = [];

  for (const step of steps) {
    const result = await runStep(step, context, log);

    results.push(result);

    log.info(JSON.stringify({
      completed: result.step,
      outcome: result.outcome,
      note: result.note,
      progress: `${results.length}/${steps.length}`,
    }));
  }

  return results;
};

/**
 * Logs the closing summary and reports the counts.
 *
 * Returns the counts rather than setting the test status itself: a suite may
 * have its own reasons to fail beyond the step results - a connect that never
 * happened, a teardown that misbehaved - and should stay in charge of that
 * decision.
 */
export const summarizeResults = (
  results: StepResult[],
  log: Log,
): { passed: number; failed: number; skipped: number } => {
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
    failed: failed.map((r) => ({ step: r.step, note: r.note })),
    skipped: skipped.map((r) => r.step),
  }));

  return {
    passed: passed.length,
    failed: failed.length,
    skipped: skipped.length,
  };
};
