import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { expect } from '../utilities/expect';
import {
  describeError,
  runSteps,
  summarizeResults,
  type Step,
} from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';
import { waitForCallEvent } from '../utilities/wait-for-event';

/**
 * `Call.Event.QualityWarningsChanged` and the `Call.QualityWarning` values it
 * carries.
 *
 * Places one outgoing call, holds it open, and waits for
 * `constant-audio-input-level`. The Android SDK states the trigger condition
 * (`Call.java:853`): "Audio input level is unchanged for 10 seconds and call is
 * not in muted state."
 *
 * Two consequences. The condition is *unchanged*, not *quiet*, so digital
 * silence - an emulator not fed host audio - is the deterministic case; a real
 * mic in a quiet room has worked but is not guaranteed. And `call.mute(true)`
 * cannot force it, because the SDK suppresses the warning while muted.
 *
 * ENVIRONMENT DEPENDENCY. This is the one suite whose result depends on the
 * host. Read a failure as "no warning was observed" and check the observed
 * entry in the log before treating it as a regression.
 */

/**
 * How long to wait for `Call.Event.Connected` after `voice.connect` resolves.
 */
const CONNECT_TIMEOUT_MS = 30_000;

/**
 * How long to hold the call open waiting for a first quality warning. The
 * warning typically arrives around ten seconds in; this allows generous slack
 * without stretching the suite out.
 */
const WARNING_TIMEOUT_MS = 45_000;

/**
 * How long to wait for `Call.Event.Disconnected` after `call.disconnect()`.
 */
const DISCONNECT_TIMEOUT_MS = 15_000;

/**
 * Taken from the enum, not written as a literal, so re-valuing
 * `Call.QualityWarning` carries this assertion with it.
 *
 * Input-level only, deliberately. Both native SDKs also raise
 * `constant-audio-output-level`, which the enum has no member for and which the
 * iOS wrapper turns into the literal string `"undefined"`. Accepting either
 * value would let this step pass on a platform that cannot name what it raised.
 *
 * TODO: VBLOCKS-TODO - add a `ConstantAudioOutputLevel` member and map it in
 * the iOS wrapper, then expect either warning here.
 */
const EXPECTED_WARNING: string = Call.QualityWarning.ConstantAudioInputLevel;

/**
 * Every value `Call.QualityWarning` declares.
 */
const KNOWN_WARNINGS: string[] = Object.values(Call.QualityWarning);

/**
 * One `QualityWarningsChanged` event, as raised.
 */
type WarningEvent = {
  current: string[];
  previous: string[];
};

/**
 * State the steps share: the call under test, and every warning event it has
 * raised so far.
 */
type Context = {
  call: Call;
  events: WarningEvent[];
};

/**
 * Flattens every warning value seen across every event, deduplicated.
 */
const observedWarnings = (events: WarningEvent[]): string[] => {
  const seen = new Set<string>();

  events.forEach(({ current, previous }) => {
    current.forEach((warning) => seen.add(warning));
    previous.forEach((warning) => seen.add(warning));
  });

  return Array.from(seen);
};

const STEPS: Array<Step<Context>> = [
  {
    name: 'quality-warning-raised',
    description:
      'the call raises at least one Call.Event.QualityWarningsChanged while ' +
      'held open',
    run: async ({ events }, log) => {
      log.info(JSON.stringify({
        eventCount: events.length,
        events,
      }));

      expect(
        events.length > 0,
        'at least one QualityWarningsChanged event was raised within ' +
          `${WARNING_TIMEOUT_MS}ms. If this failed, check whether the host ` +
          'produces constant audio input - see the note at the top of this ' +
          'suite',
      ).toBe(true);
    },
  },
  {
    name: 'quality-warning-event-shape',
    description:
      'both event arguments are arrays of strings, for every event raised',
    run: async ({ events }) => {
      // Guard against a vacuous pass. Without this, an empty `events` array
      // means the loop below asserts nothing and the step reports "passed" -
      // claiming the event shape was verified when no event ever arrived.
      expect(
        events.length > 0,
        'there is at least one event whose shape can be checked',
      ).toBe(true);

      events.forEach(({ current, previous }, index) => {
        expect(current, `event[${index}].currentWarnings`).toBeTypeOf('array');
        expect(previous, `event[${index}].previousWarnings`).toBeTypeOf('array');

        [...current, ...previous].forEach((warning, warningIndex) => {
          expect(
            warning,
            `event[${index}] warning[${warningIndex}]`,
          ).toBeTypeOf('string');
        });
      });
    },
  },
  {
    name: 'constant-audio-warning-observed',
    description:
      'the raised warnings include Call.QualityWarning.ConstantAudioInputLevel ' +
      'by its declared value. The output-level warning is not accepted as a ' +
      'substitute - see the note on EXPECTED_WARNING',
    run: async ({ events }, log) => {
      const observed = observedWarnings(events);

      log.info(JSON.stringify({ observed, expected: EXPECTED_WARNING }));

      expect(
        observed,
        `the observed warnings (${observed.join(', ') || 'nothing'})`,
      ).toContain(EXPECTED_WARNING);
    },
  },
  {
    name: 'first-event-has-empty-previous-warnings',
    description:
      'the first event on a fresh call reports no previous warnings, since ' +
      'there were none before it',
    run: async ({ events }) => {
      const [firstEvent] = events;

      expect(firstEvent, 'the first QualityWarningsChanged event').toBeDefined();
      expect(
        firstEvent.previous,
        'the first event previousWarnings',
      ).toHaveLength(0);
    },
  },
  // KNOWN FAILING on both platforms whenever an output-level warning is
  // observed, which the constant audio makes the common case: the enum has no
  // member for it, so Android's `constant-audio-output-level` and iOS's
  // `"undefined"` both land in `unknown`. Clears with the fix noted on
  // EXPECTED_WARNING. TODO: VBLOCKS-TODO
  {
    name: 'warning-values-are-known',
    description:
      'every warning value the native layer raised is declared by ' +
      'Call.QualityWarning, so a consumer comparing against the enum can match ' +
      'all of them',
    run: async ({ events }, log) => {
      const observed = observedWarnings(events);
      const unknown = observed.filter(
        (warning) => !KNOWN_WARNINGS.includes(warning),
      );

      log.info(JSON.stringify({
        knownWarnings: KNOWN_WARNINGS,
        observed,
        unknown,
      }));

      // A value native raises that the enum cannot name is unmatchable by any
      // consumer. `constant-audio-output-level` on Android and the literal
      // string `"undefined"` on iOS both land here.
      expect(
        unknown,
        'warning values native raised that Call.QualityWarning does not ' +
          `declare (${unknown.join(', ') || 'none'})`,
      ).toHaveLength(0);
    },
  },
];

/**
 * Waits for the first `QualityWarningsChanged` event, or resolves `false` on
 * timeout. Events keep accumulating into `events` either way - the listener
 * that collects them is bound for the life of the call, not just for this
 * wait.
 */
const waitForFirstWarning = (
  events: WarningEvent[],
  timeoutMs: number,
): Promise<boolean> => new Promise((resolve) => {
  if (events.length > 0) {
    resolve(true);
    return;
  }

  const startedAt = events.length;
  const pollIntervalMs = 500;

  const intervalId = setInterval(() => {
    if (events.length > startedAt) {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      resolve(true);
    }
  }, pollIntervalMs);

  const timeoutId = setTimeout(() => {
    clearInterval(intervalId);
    resolve(false);
  }, timeoutMs);
});

/**
 * Quality warnings suite.
 */
export const useQualityWarningsTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const events: WarningEvent[] = [];

    const fail = (message: string, note?: string) => {
      log.error(JSON.stringify({ message, note }));
      setTestStatus('failure');
    };

    const connectResult = await safelySettlePromise(voice.connect(token));
    if (connectResult.status === 'rejected') {
      fail('voice.connect rejected', describeError(connectResult.error));
      return;
    }

    const call = connectResult.value;

    // Bound before waiting on `Connected`, so a warning raised early is
    // collected rather than missed. The listener stays bound for the life of
    // the call.
    call.on(
      Call.Event.QualityWarningsChanged,
      (current: any, previous: any) => {
        const event: WarningEvent = {
          current: Array.isArray(current) ? [...current] : [],
          previous: Array.isArray(previous) ? [...previous] : [],
        };
        events.push(event);
        log.info(JSON.stringify({ qualityWarningsChanged: event }));
      },
    );

    Object.values(Call.Event).forEach((eventName) => {
      if (eventName === Call.Event.QualityWarningsChanged) {
        // Already logged above, with its arguments parsed.
        return;
      }
      call.on(eventName, (...args: any[]) => {
        log.info(JSON.stringify({ eventName, args }));
      });
    });

    const didConnect = await waitForCallEvent(
      call,
      Call.Event.Connected,
      CONNECT_TIMEOUT_MS,
    );

    if (!didConnect) {
      await safelySettlePromise(call.disconnect());
      fail(
        'call did not raise Call.Event.Connected',
        `waited ${CONNECT_TIMEOUT_MS}ms`,
      );
      return;
    }

    log.info(JSON.stringify({
      message:
        `established outgoing call ${call.getSid()}; holding it open for up ` +
        `to ${WARNING_TIMEOUT_MS}ms waiting for a quality warning`,
    }));

    const sawWarning = await waitForFirstWarning(events, WARNING_TIMEOUT_MS);

    log.info(JSON.stringify({
      sawWarning,
      eventCount: events.length,
    }));

    const results = await runSteps(STEPS, { call, events }, log);

    const disconnectedPromise = waitForCallEvent(
      call,
      Call.Event.Disconnected,
      DISCONNECT_TIMEOUT_MS,
    );

    await safelySettlePromise(call.disconnect());
    await disconnectedPromise;

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
