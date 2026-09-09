import * as React from 'react';
import type { TestStatus, UseTestSuite } from '../test-suites';
import { useVoiceApiTest } from './voice-api';
import { useErrorsTest } from './errors';
import { useRegistrationTest } from './registration';
import { useOutgoingCallTest } from './outgoing-call';
import { useCallControlsTest } from './call-controls';
import { useRtcStatsTest } from './rtc-stats';
import { useCallMessageTest } from './call-message';
import { useQualityWarningsTest } from './quality-warnings';
import { useConnectOptionsTest } from './connect-options';
import { useIceTest } from './outgoing-ice';
import { usePreflightEarlyStateTest } from './preflight-test-early-state';
import { usePreflightTest } from './preflight-test';
import { describeError } from '../utilities/run-steps';
import {
  runSuites,
  summarizeSuiteResults,
  type RunnableSuite,
} from '../utilities/run-suites';

/**
 * Runs every unattended suite, back to back, in one app launch.
 *
 * A suite here, not a special case `src/app/index.tsx` knows about. It is a
 * `UseTestSuite` like any other: it constructs the twelve suites it runs the
 * same way `index.tsx` constructs every other suite, and it reports its
 * result through the `setTestStatus` it is handed, exactly once, at the end.
 * `index.tsx` registers it in its dispatch map the same way it registers
 * `voice-api` or `outgoing-call`, and never needs to know this suite is
 * itself running twelve others.
 *
 * That means the twelve nested suite hooks below are constructed twice on
 * every render: once here, once directly in `index.tsx` for a standalone run.
 * That is safe. None of these hooks keep any state beyond a memoized
 * `perform`, and both instances close over the same shared `token`, `voice`
 * and `logging` values that `index.tsx` constructs once and passes down, so
 * the two instances of a given suite are interchangeable, and only one of
 * them is ever actually invoked in a given run.
 *
 * This is the weaker of the two ways to run every suite: every suite here
 * shares the one `Voice` instance that lives for the life of the app, so
 * listeners and audio routing carry across suite boundaries. The stronger
 * approach is to drive suites from `test/appium-orchestrator`, relaunching
 * the app between each.
 */

/**
 * How long each suite may run before the runner gives up on it and moves on.
 *
 * Drawn from each suite's own internal timeout constants, or from its
 * observed duration across two recorded `unattended-all` runs.
 *
 * `outgoing-call` is deliberately left generous: its own docblock records
 * that it has no timeout of its own (VBLOCKS-7138), so whatever value it is
 * given here is the only thing bounding it.
 */
const SUITE_TIMEOUTS_MS = {
  'voice-api': 60_000,
  'errors': 90_000,
  'registration': 60_000,
  'outgoing-call': 180_000,
  'call-controls': 90_000,
  'rtc-stats': 90_000,
  'call-message': 90_000,
  'quality-warnings': 120_000,
  'connect-options': 120_000,
  'outgoing-ice': 240_000,
  'preflight-test-early-state': 180_000,
  'preflight-test': 240_000,
} as const;

type UnattendedSuiteId = keyof typeof SUITE_TIMEOUTS_MS;

/**
 * Run order: fastest and call-free first so a failure surfaces early rather
 * than after twenty minutes, and the longest suite last.
 */
const SUITE_ORDER: UnattendedSuiteId[] = [
  'voice-api',
  'errors',
  'registration',
  'outgoing-call',
  'call-controls',
  'rtc-stats',
  'call-message',
  'quality-warnings',
  'connect-options',
  'outgoing-ice',
  'preflight-test-early-state',
  'preflight-test',
];

export const useUnattendedAllTest: UseTestSuite = (
  token,
  voiceContext,
  logging,
  setTestStatus,
) => {
  /**
   * The last status each nested suite reported, by suite id.
   *
   * A nested suite reports its result by calling the recorder it was given
   * below, rather than by resolving `perform` with it, so its terminal status
   * is read back from here once its `perform` resolves.
   */
  const statusesRef = React.useRef<Record<string, TestStatus>>({});

  const recordStatusFor = (id: UnattendedSuiteId) => (status: TestStatus) => {
    statusesRef.current[id] = status;
  };

  const voiceApiTest =
    useVoiceApiTest(token, voiceContext, logging, recordStatusFor('voice-api'));
  const errorsTest =
    useErrorsTest(token, voiceContext, logging, recordStatusFor('errors'));
  const registrationTest =
    useRegistrationTest(token, voiceContext, logging, recordStatusFor('registration'));
  const outgoingCallTest =
    useOutgoingCallTest(token, voiceContext, logging, recordStatusFor('outgoing-call'));
  const callControlsTest =
    useCallControlsTest(token, voiceContext, logging, recordStatusFor('call-controls'));
  const rtcStatsTest =
    useRtcStatsTest(token, voiceContext, logging, recordStatusFor('rtc-stats'));
  const callMessageTest =
    useCallMessageTest(token, voiceContext, logging, recordStatusFor('call-message'));
  const qualityWarningsTest =
    useQualityWarningsTest(token, voiceContext, logging, recordStatusFor('quality-warnings'));
  const connectOptionsTest =
    useConnectOptionsTest(token, voiceContext, logging, recordStatusFor('connect-options'));
  const iceTest =
    useIceTest(token, voiceContext, logging, recordStatusFor('outgoing-ice'));
  const preflightEarlyStateTest =
    usePreflightEarlyStateTest(token, voiceContext, logging, recordStatusFor('preflight-test-early-state'));
  const preflightTest =
    usePreflightTest(token, voiceContext, logging, recordStatusFor('preflight-test'));

  const performs: Record<UnattendedSuiteId, () => Promise<void>> = {
    'voice-api': voiceApiTest.perform,
    'errors': errorsTest.perform,
    'registration': registrationTest.perform,
    'outgoing-call': outgoingCallTest.perform,
    'call-controls': callControlsTest.perform,
    'rtc-stats': rtcStatsTest.perform,
    'call-message': callMessageTest.perform,
    'quality-warnings': qualityWarningsTest.perform,
    'connect-options': connectOptionsTest.perform,
    'outgoing-ice': iceTest.perform,
    'preflight-test-early-state': preflightEarlyStateTest.perform,
    'preflight-test': preflightTest.perform,
  };

  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    try {
      const runnableSuites: RunnableSuite[] = SUITE_ORDER.map((id) => ({
        id,
        perform: performs[id],
        timeoutMs: SUITE_TIMEOUTS_MS[id],
      }));

      const results = await runSuites(
        runnableSuites,
        (id) => statusesRef.current[id] ?? 'not-started',
        logging.log,
      );

      const { succeeded } = summarizeSuiteResults(results, logging.log);

      setTestStatus(succeeded ? 'success' : 'failure');
    } catch (error) {
      // `runSuites` does not reject, so reaching here means the runner
      // itself broke rather than one of the twelve suites.
      logging.log.error(JSON.stringify({
        message: 'the unattended-all runner threw',
        note: describeError(error),
      }));
      setTestStatus('failure');
    }
    // `performs` is rebuilt every render from the twelve nested `.perform`
    // identities below, so listing those is equivalent to listing `performs`
    // and is what the other suites in this codebase already do.
  }, [
    voiceApiTest.perform,
    errorsTest.perform,
    registrationTest.perform,
    outgoingCallTest.perform,
    callControlsTest.perform,
    rtcStatsTest.perform,
    callMessageTest.perform,
    qualityWarningsTest.perform,
    connectOptionsTest.perform,
    iceTest.perform,
    preflightEarlyStateTest.perform,
    preflightTest.perform,
    logging.log,
    setTestStatus,
  ]);

  return { perform };
}
