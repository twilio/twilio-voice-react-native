// Disable the eslint rule for jest/valid-expect here because we're not actually
// using jest. Jest doesn't work in a RN env and this is a custom wrapper we
// made for e2e testing the RN SDK.
/* eslint-disable jest/valid-expect */

import * as React from 'react';
import { Call, TwilioErrors, Voice } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
import { expect } from '../utilities/expect';
import {
  describeError,
  runSteps,
  statusFromSummary,
  summarizeResults,
  type Step,
} from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';
import { waitForCallEvent } from '../utilities/wait-for-event';

/**
 * In-call control surface of a `Call`: mute, hold, DTMF, stats, feedback, and
 * the getters that report call state.
 *
 * Places exactly one outgoing call and exercises every control against it,
 * rather than a call per variant as the ICE suites do. Steps are ordered but
 * independent, so one broken control does not mask the rest, and any step that
 * mutates call state restores it.
 */

/**
 * How long to wait for `Call.Event.Connected` after `voice.connect` resolves.
 */
const CONNECT_TIMEOUT_MS = 30_000;

/**
 * How long to wait for `Call.Event.Disconnected` after `call.disconnect()`.
 */
const DISCONNECT_TIMEOUT_MS = 15_000;

/**
 * Settling delay after a control that changes the audio session, before the
 * next step reads call state back.
 */
const CONTROL_SETTLE_DELAY_MS = 1_000;

/**
 * DTMF digits sent by the `send-digits` step. Covers the full DTMF alphabet
 * the SDK accepts.
 */
const DTMF_DIGITS = '1234567890*#';

/**
 * Shape of one entry of the `call.getStats()` payload.
 *
 * `getStats()` is typed as resolving with a single `RTCStats.StatsReport`, but
 * both native layers resolve with an *array*, one per peer connection. This
 * asserts what is actually returned.
 *
 * Top level only, and not exhaustively - the nested records may gain fields.
 * `test/app/e2e/common/rtcStatsValidators.ts` covers those in depth.
 *
 * TODO: VBLOCKS-7113 - correct the declared return type to `StatsReport[]` and
 * drop the cast in the `get-stats` step.
 */
const STATS_REPORT_TYPES = {
  iceCandidatePairStats: 'array',
  iceCandidateStats: 'array',
  localAudioTrackStats: 'array',
  peerConnectionId: 'string',
  remoteAudioTrackStats: 'array',
} as const;

/**
 * What the steps run against.
 *
 * `voice` is carried alongside `call` because the audio device surface hangs
 * off `Voice` rather than off `Call`, and asserting it needs a call in progress
 * so the audio session is active.
 */
type CallControlsContext = {
  call: Call;
  voice: Voice;
};

/**
 * Steps run in order against a single connected call.
 */
const STEPS: Array<Step<CallControlsContext>> = [
  {
    name: 'getters-while-connected',
    description:
      'the getters report a connected call once Call.Event.Connected has ' +
      'been raised',
    run: async ({ call }) => {
      expect(call.getState(), 'call.getState()').toBe(Call.State.Connected);
      expect(call.getSid(), 'call.getSid()').toBeTypeOf('string');
      expect(
        call.getInitialConnectedTimestamp(),
        'call.getInitialConnectedTimestamp()'
      ).toBeInstanceOf(Date);
      expect(
        call.getCustomParameters(),
        'call.getCustomParameters()'
      ).toBeTypeOf('object');

      // `from` and `to` are only populated for a call placed with those
      // parameters, so they are asserted on only when present.
      const from = call.getFrom();
      if (typeof from !== 'undefined') {
        expect(from, 'call.getFrom()').toBeTypeOf('string');
      }

      const to = call.getTo();
      if (typeof to !== 'undefined') {
        expect(to, 'call.getTo()').toBeTypeOf('string');
      }
    },
  },
  {
    // Consider a clean-up mechanism for this one when the suite fails mid-run.
    // TODO: VBLOCKS-7138
    name: 'mute',
    description:
      'mute(true) then mute(false) resolve with the new muted status, and ' +
      'isMuted() agrees with it',
    run: async ({ call }) => {
      expect(await call.mute(true), 'call.mute(true)').toBe(true);
      expect(call.isMuted(), 'call.isMuted() while muted').toBe(true);

      await delay(CONTROL_SETTLE_DELAY_MS);

      expect(await call.mute(false), 'call.mute(false)').toBe(false);
      expect(call.isMuted(), 'call.isMuted() while unmuted').toBe(false);
    },
  },
  {
    // Consider a clean-up mechanism for this one when the suite fails mid-run.
    // TODO: VBLOCKS-7138
    name: 'hold',
    description:
      'hold(true) then hold(false) resolve with the new hold status, and ' +
      'isOnHold() agrees with it',
    run: async ({ call }) => {
      expect(await call.hold(true), 'call.hold(true)').toBe(true);
      expect(call.isOnHold(), 'call.isOnHold() while on hold').toBe(true);

      await delay(CONTROL_SETTLE_DELAY_MS);

      expect(await call.hold(false), 'call.hold(false)').toBe(false);
      expect(call.isOnHold(), 'call.isOnHold() while off hold').toBe(false);
    },
  },
  {
    name: 'send-digits',
    description: 'sendDigits resolves for every DTMF digit the SDK accepts',
    run: async ({ call }) => {
      await call.sendDigits(DTMF_DIGITS);
    },
  },
  {
    name: 'get-stats',
    description:
      'getStats resolves with WebRTC stats reports for the ongoing call',
    run: async ({ call }) => {
      const stats = await call.getStats();

      // See the note on STATS_REPORT_TYPES: the runtime payload is an array,
      // whereas the declared return type is a single report.
      const reports = stats as unknown as unknown[];

      expect(reports, 'call.getStats()').toBeTypeOf('array');
      expect(
        reports.length > 0,
        'call.getStats() returned at least one report'
      ).toBe(true);

      reports.forEach((report, index) => {
        expect(report, `call.getStats()[${index}]`).toMatchRecordTypes(
          STATS_REPORT_TYPES
        );
      });
    },
  },
  // Placed after `get-stats` so the stats above are read from a call that has
  // not been re-routed mid-suite.
  //
  // iOS only. On Android selecting regenerates every device uuid, so the uuid
  // read back never matches the one selected. That bug is already reported by
  // the `select-audio-device` step of `voice-api-test`, and repeating it here
  // would turn `call-controls-test` red on Android for a defect that is
  // already tracked.
  // TODO: VBLOCKS-7133
  {
    name: 'select-audio-device-while-connected',
    description:
      'selecting each audio device during a connected call is reflected by ' +
      'getAudioDevices',
    platforms: ['ios'],
    run: async ({ voice }, log) => {
      const initial = await voice.getAudioDevices();

      // The restore runs in a `finally` because audio routing is device-wide
      // state that outlives this suite. Without it, a mid-loop assertion
      // failure would leave the device on whatever was selected last, and
      // every later call would run through that route.
      try {
        for (const audioDevice of initial.audioDevices) {
          await audioDevice.select();
          await delay(CONTROL_SETTLE_DELAY_MS);

          const { selectedDevice } = await voice.getAudioDevices();

          log.info(
            JSON.stringify({
              selected: audioDevice.name,
              reported: selectedDevice?.name,
            })
          );

          // The device names are in the label because the orchestrator reports
          // only the last few failing entries, so the `log.info` above does not
          // reach the run summary and a bare uuid pair says nothing about
          // which route the session actually settled on.
          expect(
            selectedDevice?.uuid,
            `the device selected after selecting "${audioDevice.name}" ` +
              `(reported "${selectedDevice?.name}")`
          ).toBe(audioDevice.uuid);
        }
      } finally {
        const { selectedDevice: originallySelected } = initial;

        if (typeof originallySelected !== 'undefined') {
          const original = initial.audioDevices.find(
            (audioDevice) => audioDevice.uuid === originallySelected.uuid
          );

          // Swallowed deliberately: this is cleanup, and letting it throw here
          // would replace the assertion failure that brought us into the
          // `finally` with a less useful one.
          await safelySettlePromise(original?.select() ?? Promise.resolve());
        }
      }
    },
  },
  {
    name: 'post-feedback',
    description: 'postFeedback resolves for a valid score and issue',
    run: async ({ call }) => {
      await call.postFeedback(Call.Score.Five, Call.Issue.AudioLatency);
    },
  },
  {
    name: 'post-feedback-invalid-score',
    description:
      'postFeedback rejects with an InvalidArgumentError for a score outside ' +
      'the Call.Score enum, without reaching native',
    run: async ({ call }) => {
      const result = await safelySettlePromise(
        call.postFeedback(6 as Call.Score, Call.Issue.AudioLatency)
      );

      expect(result.status, 'postFeedback with an invalid score').toBe(
        'rejected'
      );
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'postFeedback rejection reason'
      ).toBeInstanceOf(TwilioErrors.InvalidArgumentError);
    },
  },
  {
    name: 'post-feedback-invalid-issue',
    description:
      'postFeedback rejects with an InvalidArgumentError for an issue ' +
      'outside the Call.Issue enum, without reaching native',
    run: async ({ call }) => {
      const result = await safelySettlePromise(
        call.postFeedback(Call.Score.Five, 'not-an-issue' as Call.Issue)
      );

      expect(result.status, 'postFeedback with an invalid issue').toBe(
        'rejected'
      );
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'postFeedback rejection reason'
      ).toBeInstanceOf(TwilioErrors.InvalidArgumentError);
    },
  },
];

/**
 * In-call control test suite.
 */
export const useCallControlsTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

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

    // Tracks whether `Call.Event.Disconnected` was raised before the teardown
    // step binds its own listener. The far end can end the call at any point
    // during `STEPS`, and `Call` does not replay the event, so a listener bound
    // afterwards would never see it.
    let disconnectedRaised = false;

    // Log every event for context when a step misbehaves. Bound before
    // waiting on `Connected` so nothing raised in the meantime is missed.
    Object.values(Call.Event).forEach((eventName) => {
      call.on(eventName, (...args: any[]) => {
        if (eventName === Call.Event.Disconnected) {
          disconnectedRaised = true;
        }
        log.info(JSON.stringify({ eventName, args }));
      });
    });

    const didConnect = await waitForCallEvent(
      call,
      Call.Event.Connected,
      CONNECT_TIMEOUT_MS
    );

    if (!didConnect) {
      await safelySettlePromise(call.disconnect());
      fail(
        'call did not raise Call.Event.Connected',
        `waited ${CONNECT_TIMEOUT_MS}ms`
      );
      return;
    }

    log.info(
      JSON.stringify({
        message: `established outgoing call ${call.getSid()}`,
      })
    );

    const results = await runSteps(STEPS, { call, voice }, log);

    // Teardown doubles as the coverage for `disconnect()` and the state the
    // call settles into, so it is recorded as a step of its own.
    //
    // The far end may have ended the call while `STEPS` was running. In that
    // case `Call.Event.Disconnected` has already been raised and seen by the
    // logger above, `disconnect()` has nothing left to disconnect, and waiting
    // on the event again would only stall for the full timeout. So the step
    // asserts the state the call settled into and reports itself as skipped,
    // because `disconnect()` was not the thing that ended the call.
    if (disconnectedRaised) {
      log.info(
        JSON.stringify({
          message:
            'call was already disconnected before the teardown step; the far ' +
            'end ended the call during STEPS',
        })
      );

      try {
        expect(
          call.getState(),
          'call.getState() after the far end disconnected'
        ).toBe(Call.State.Disconnected);
        results.push({
          step: 'disconnect',
          outcome: 'skipped',
          note:
            'the far end ended the call during STEPS, so call.disconnect() ' +
            'was not exercised',
        });
      } catch (error) {
        results.push({
          step: 'disconnect',
          outcome: 'failed',
          note: describeError(error),
        });
      }

    } else {
      const disconnectedPromise = waitForCallEvent(
        call,
        Call.Event.Disconnected,
        DISCONNECT_TIMEOUT_MS
      );

      const disconnectResult = await safelySettlePromise(call.disconnect());
      const didDisconnect = await disconnectedPromise;

      if (disconnectResult.status === 'rejected') {
        results.push({
          step: 'disconnect',
          outcome: 'failed',
          note: `call.disconnect rejected: ${describeError(
            disconnectResult.error
          )}`,
        });
      } else if (!didDisconnect) {
        results.push({
          step: 'disconnect',
          outcome: 'failed',
          note:
            'call did not raise Call.Event.Disconnected within ' +
            `${DISCONNECT_TIMEOUT_MS}ms`,
        });
      } else {
        try {
          expect(call.getState(), 'call.getState() after disconnect').toBe(
            Call.State.Disconnected
          );
          results.push({ step: 'disconnect', outcome: 'passed' });
        } catch (error) {
          results.push({
            step: 'disconnect',
            outcome: 'failed',
            note: describeError(error),
          });
        }
      }
    }

    const { failed, blocked } = summarizeResults(results, log);

    setTestStatus(statusFromSummary({ failed, blocked }));
  }, [token, voice, log, setTestStatus]);

  return { perform };
};
