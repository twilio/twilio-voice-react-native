import * as React from 'react';
import type { TestStatus, UseTestSuite } from '../test-suites';
import { useAudioDeviceTest } from './audio-device';
import { useCallInviteRejectTest } from './call-invite-reject';
import { useIncomingIceTest } from './incoming-ice';
import { useIncomingCallManualTest } from './incoming-call-manual';
import { describeError } from '../utilities/run-steps';
import {
  runSuites,
  summarizeSuiteResults,
  type RunnableSuite,
} from '../utilities/run-suites';

/**
 * Runs every attended suite, back to back, in one app launch.
 *
 * The tester still has to be present for every suite and act on every prompt
 * either way. What this removes is retyping the suite id and relaunching the
 * app between the four of them.
 *
 * A suite here, not a special case `src/app/index.tsx` knows about, for the
 * same reason and in the same shape as `unattended-all.ts` - see that file's
 * docblock for why constructing the nested suites twice per render is safe.
 */

/**
 * How long each suite may run before the runner gives up on it and moves on.
 * Drawn from each suite's own internal timeout constants.
 *
 * `incoming-ice` is deliberately not sized to its own worst case. Its source
 * carries a documented 15 minute per-variant ceiling for a rare native hang,
 * which across four variants would be 72 minutes. Reporting a timeout at 20
 * minutes if that hang occurs is judged the better outcome for a runner
 * meant to be started and left running, even though a person still has to be
 * present for the suite itself.
 */
const SUITE_TIMEOUTS_MS = {
  'audio-device': 600_000,
  'call-invite-reject': 600_000,
  'incoming-ice': 1_200_000,
  'incoming-call-manual': 1_800_000,
} as const;

type AttendedSuiteId = keyof typeof SUITE_TIMEOUTS_MS;

/**
 * Run order: fewest calls first, so a problem surfaces before the tester has
 * invested time in the longer suites.
 *
 * - `audio-device` needs the tester to plug in and unplug a wired headset, no
 *   calls.
 * - `call-invite-reject` needs the tester to place two calls.
 * - `incoming-ice` needs the tester to dial in once per variant, four calls.
 * - `incoming-call-manual` needs the tester to place nine calls.
 */
const SUITE_ORDER: AttendedSuiteId[] = [
  'audio-device',
  'call-invite-reject',
  'incoming-ice',
  'incoming-call-manual',
];

/**
 * Pause between suites, longer than `unattended-all`'s. The tester needs
 * time to read one suite's closing summary before the next suite's first
 * `TESTER_ACTION` prompt appears in the log.
 */
const INTER_SUITE_DELAY_MS = 10_000;

export const useAttendedAllTest: UseTestSuite = (
  token,
  voiceContext,
  logging,
  setTestStatus,
) => {
  /**
   * The last status each nested suite reported, by suite id. See
   * `unattended-all.ts` for why this is read back rather than returned.
   */
  const statusesRef = React.useRef<Record<string, TestStatus>>({});

  const recordStatusFor = (id: AttendedSuiteId) => (status: TestStatus) => {
    statusesRef.current[id] = status;
  };

  const audioDeviceTest =
    useAudioDeviceTest(token, voiceContext, logging, recordStatusFor('audio-device'));
  const callInviteRejectTest =
    useCallInviteRejectTest(token, voiceContext, logging, recordStatusFor('call-invite-reject'));
  const incomingIceTest =
    useIncomingIceTest(token, voiceContext, logging, recordStatusFor('incoming-ice'));
  const incomingCallManualTest =
    useIncomingCallManualTest(token, voiceContext, logging, recordStatusFor('incoming-call-manual'));

  const performs: Record<AttendedSuiteId, () => Promise<void>> = {
    'audio-device': audioDeviceTest.perform,
    'call-invite-reject': callInviteRejectTest.perform,
    'incoming-ice': incomingIceTest.perform,
    'incoming-call-manual': incomingCallManualTest.perform,
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
        undefined,
        INTER_SUITE_DELAY_MS,
      );

      const { succeeded } = summarizeSuiteResults(results, logging.log);

      setTestStatus(succeeded ? 'success' : 'failure');
    } catch (error) {
      // `runSuites` does not reject, so reaching here means the runner
      // itself broke rather than one of the four suites.
      logging.log.error(JSON.stringify({
        message: 'the attended-all runner threw',
        note: describeError(error),
      }));
      setTestStatus('failure');
    }
    // `performs` is rebuilt every render from the four nested `.perform`
    // identities below, so listing those is equivalent to listing `performs`.
  }, [
    audioDeviceTest.perform,
    callInviteRejectTest.perform,
    incomingIceTest.perform,
    incomingCallManualTest.perform,
    logging.log,
    setTestStatus,
  ]);

  return { perform };
}
