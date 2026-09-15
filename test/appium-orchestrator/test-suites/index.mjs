// @ts-check

'use strict';

import { writeFileSync } from 'node:fs';

/**
 * @import { TestOrchestratorSetup } from './setup.mjs'
 */
import { setupTestOrchestrator } from './setup.mjs';
import { safelySettlePromise } from '../utilities/safely-settle-promise.mjs';

/**
 * Suites implemented by the harness app, and whether the orchestrator can drive
 * them unattended.
 *
 * `automated`  runs in a normal unattended pass.
 * `blocked`    cannot run yet; the reason is reported rather than silently skipped.
 * `manual`     requires a human and is never attempted here.
 *
 * Keep in step with the `suites` record in the harness app's `src/app/index.tsx`.
 */
const SUITES = [
  { id: 'voice-api-test', kind: 'automated' },
  { id: 'registration-test', kind: 'automated' },
  { id: 'errors-test', kind: 'automated' },
  { id: 'connect-options-test', kind: 'automated' },
  { id: 'outgoing-call-test', kind: 'automated' },
  { id: 'call-controls-test', kind: 'automated' },
  { id: 'call-message-test', kind: 'automated' },
  { id: 'preflight-test', kind: 'automated' },
  { id: 'ice-test', kind: 'automated' },
  {
    id: 'incoming-ice-test',
    kind: 'blocked',
    reason: 'incoming calls need a real FCM push credential',
  },
  {
    id: 'quality-warnings-test',
    kind: 'blocked',
    reason: 'needs deterministic host audio input',
  },
  {
    id: 'incoming-call-test-manual',
    kind: 'manual',
    reason: 'requires a human to answer the call',
  },
];

/**
 * Per-suite ceiling.
 *
 * Generous because the call suites place several real calls, each with ring,
 * connect, exercise and disconnect. At 180 seconds outgoing-call-test and
 * ice-test were cut off mid-suite and reported as timeouts, which reads like a
 * product hang rather than a harness limit.
 */
const SUITE_TIMEOUT_MS = parseInt(process.env.SUITE_TIMEOUT_MS || '', 10) || 600000;

/**
 * Restart the app so the JavaScript runtime is clean.
 *
 * The harness refuses to start a second suite in the same runtime: `performTest`
 * returns early unless status is `not-started`. Terminating force-stops the
 * process, so activating again gives a fresh runtime and a clean status.
 *
 * @param {TestOrchestratorSetup['driver']} driver
 */
async function restartApp(driver) {
  // `capabilities` is what the server returned and `requestedCapabilities` is
  // what the session asked for. The returned set wins where it carries the
  // identifier, and the requested set fills the gap when Sauce Labs does not
  // echo the identifier back. A missing identifier fails every suite in the
  // run, because `restartApp` runs before each one.
  const caps = /** @type {Record<string, any>} */ ({
    ...(driver.requestedCapabilities || {}),
    ...(driver.capabilities || {}),
  });
  const appId =
    caps['appium:appPackage'] ||
    caps.appPackage ||
    caps['appium:bundleId'] ||
    caps.bundleId;

  if (!appId) {
    throw new Error('cannot restart the app: no appPackage or bundleId capability');
  }

  await driver.terminateApp(appId);
  await driver.activateApp(appId);
}

/**
 * Hide the software keyboard, ignoring the case where none is shown.
 *
 * @param {TestOrchestratorSetup['driver']} driver
 */
async function hideKeyboardIfPresent(driver) {
  try {
    if (!(await driver.isKeyboardShown())) {
      return;
    }

    if (driver.isIOS) {
      // The generic hideKeyboard always fails on iOS with "Did not know how to
      // dismiss the keyboard", and webdriverio retries it three times, so each
      // call site costs about fifteen seconds. The harness inputs have no
      // return key and no accessory bar, so name the dismiss keys explicitly
      // and tap outside the keyboard if none of them exist.
      try {
        await driver.execute('mobile: hideKeyboard', {
          keys: ['Done', 'Return', 'return', 'Dismiss'],
        });
        return;
      } catch {
        const { width } = await driver.getWindowSize();
        await driver.execute('mobile: tap', { x: Math.floor(width / 2), y: 80 });
        return;
      }
    }

    await driver.hideKeyboard();
  } catch {
    // Not all drivers implement this, and "no keyboard" is not an error here.
  }
}

/**
 * Drive one suite to completion.
 *
 * @param {TestOrchestratorSetup['accessToken']} accessToken
 * @param {TestOrchestratorSetup['driver']} driver
 * @param {TestOrchestratorSetup['testElements']} testElements
 * @param {string} suiteId
 */
async function runSuite(accessToken, driver, testElements, suiteId) {
  await testElements.textInput.token.waitForExist({ timeout: 30000, interval: 1000 });
  await testElements.textInput.token.setValue(accessToken, { mask: true });

  /**
   * Dismiss the keyboard between fields.
   *
   * On iOS the software keyboard covers the lower half of the screen, and the
   * suite-id field ended up behind it: the token was typed, the suite id was
   * silently not, and the app then sat at `not-started` because `performTest`
   * had no suite to run. It reads as the app ignoring the start button.
   * Harmless on Android, where the field stays reachable.
   */
  await hideKeyboardIfPresent(driver);

  await testElements.textInput.testSuiteId.waitForExist({ timeout: 10000, interval: 500 });
  await testElements.textInput.testSuiteId.setValue(suiteId);

  await hideKeyboardIfPresent(driver);

  await testElements.button.startTestSuite.waitForExist();
  await testElements.button.startTestSuite.click();

  const TERMINAL = ['success', 'failure', 'blocked'];

  // Guard against a suite that fails so fast it never reports in-progress.
  await driver.waitUntil(
    async () => {
      const status = await testElements.text.testSuiteStatus.getText();
      return status === 'in-progress' || TERMINAL.includes(status);
    },
    { timeout: 15000, interval: 500, timeoutMsg: `${suiteId} never left not-started` }
  );

  await driver.waitUntil(
    async () => TERMINAL.includes(await testElements.text.testSuiteStatus.getText()),
    { timeout: SUITE_TIMEOUT_MS, interval: 2000, timeoutMsg: `${suiteId} timed out` }
  );

  const finalStatus = await testElements.text.testSuiteStatus.getText();
  if (finalStatus === 'failure') {
    throw new Error(`${suiteId} reported failure: ${await failingSteps(testElements)}`);
  }
  return finalStatus;
}

/**
 * Summarise why a suite failed, from the log the harness renders on screen.
 *
 * Without this a failure is reported as the bare word "failure", which says
 * nothing about which step broke. Only the failing entries are kept, because
 * a passing suite's log runs to thousands of characters.
 *
 * @param {TestOrchestratorSetup['testElements']} testElements
 * @returns {Promise<string>}
 */
async function failingSteps(testElements) {
  try {
    const raw = await testElements.text.testSuiteOutput.getText();
    const entries = JSON.parse(raw);
    if (!Array.isArray(entries)) {
      return 'log was not an array';
    }

    const failures = entries
      .map((entry) => {
        try {
          return JSON.parse(entry?.body ?? '');
        } catch {
          return entry?.body;
        }
      })
      .filter((body) => body && (body.outcome === 'failed' || body.error || body.message))
      .filter((body) => body.outcome !== 'passed')
      .map((body) =>
        typeof body === 'string' ? body : JSON.stringify(body)
      );

    if (failures.length === 0) {
      return 'no failing entry in the on-screen log';
    }
    // Keep the report readable; the full log is written to the results file.
    return failures.slice(-3).join(' | ').slice(0, 600);
  } catch (error) {
    return `could not read the on-screen log: ${String(error)}`;
  }
}

/**
 * @param {Array<{ id: string, status: string, detail?: string, seconds?: number }>} results
 * @param {{ platform: string, avd?: string }} context
 */
const report = (results, context) => {
  const width = Math.max(...results.map((r) => r.id.length), 10);
  console.log('');
  console.log(`platform: ${context.platform}${context.avd ? `  avd: ${context.avd}` : ''}`);
  console.log('');
  for (const r of results) {
    const seconds = r.seconds === undefined ? '' : `${r.seconds}s`;
    console.log(
      `  ${r.id.padEnd(width)}  ${r.status.padEnd(8)} ${seconds.padStart(5)}  ${r.detail || ''}`
    );
  }

  const counts = results.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, /** @type {Record<string, number>} */ ({}));

  console.log('');
  console.log(
    Object.entries(counts)
      .map(([k, v]) => `${k}: ${v}`)
      .join('  ')
  );

  return results.some((r) => r.status === 'Fail') ? 1 : 0;
};

const main = async () => {
  const setupResult = await safelySettlePromise(setupTestOrchestrator());
  if (setupResult.status === 'rejected') {
    console.log('setup failed');
    console.log(setupResult.error);
    return 1;
  }

  const { accessToken, driver, env, testElements } = setupResult.value;

  const requested = env.SUITES
    ? env.SUITES.split(',').map((s) => s.trim()).filter(Boolean)
    : null;

  const selected = requested
    ? SUITES.filter((s) => requested.includes(s.id))
    : SUITES;

  /** @type {Array<{ id: string, status: string, detail?: string, seconds?: number }>} */
  const results = [];

  for (const suite of selected) {
    if (suite.kind !== 'automated' && !requested) {
      results.push({
        id: suite.id,
        status: suite.kind === 'manual' ? 'Not run' : 'Blocked',
        detail: suite.reason,
      });
      continue;
    }

    const started = Date.now();
    const restart = await safelySettlePromise(restartApp(driver));
    if (restart.status === 'rejected') {
      results.push({ id: suite.id, status: 'Fail', detail: `restart: ${restart.error}` });
      continue;
    }

    const outcome = await safelySettlePromise(
      runSuite(accessToken, driver, testElements, suite.id)
    );
    const seconds = Math.round((Date.now() - started) / 1000);

    if (outcome.status === 'rejected') {
      results.push({
        id: suite.id,
        status: 'Fail',
        detail: String(outcome.error?.message || outcome.error),
        seconds,
      });
    } else {
      // A suite whose runnable steps all passed but which could not run some of
      // them reports `blocked`, so the run is not credited as full coverage.
      results.push(
        outcome.value === 'blocked'
          ? {
              id: suite.id,
              status: 'Blocked',
              detail: 'some steps need a dependency this environment lacks',
              seconds,
            }
          : { id: suite.id, status: 'Pass', seconds }
      );
    }
  }

  // Read while the session is open. `deleteSession` below clears it.
  const sessionId = driver.sessionId;

  if (env.USE_SAUCE) {
    const sauceJobResult = results.some((r) => r.status === 'Fail') ? 'failed' : 'passed';
    await safelySettlePromise(driver.execute(`sauce:job-result=${sauceJobResult}`));
  }

  await safelySettlePromise(driver.deleteSession());

  if (process.env.RESULTS_JSON) {
    // A run that produced results but could not write the file should still
    // report those results and still set its own exit code. The failure is
    // announced rather than thrown.
    try {
      writeFileSync(
        process.env.RESULTS_JSON,
        JSON.stringify(
          {
            platform: env.PLATFORM,
            avd: env.AVD || null,
            sessionId: sessionId || null,
            results,
          },
          null,
          2
        )
      );
    } catch (error) {
      console.log(`could not write ${process.env.RESULTS_JSON}: ${String(error)}`);
    }
  }

  return report(results, { platform: env.PLATFORM, avd: env.AVD });
};

main().then((exitCode) => (process.exitCode = exitCode));
