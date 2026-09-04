import * as React from 'react';
import { Call, RTCStats } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { delay } from '../utilities/delay';
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
 * `call.getStats()` and the `RTCStats.StatsReport` objects it resolves with.
 *
 * Places one outgoing call, lets it run long enough to gather stats, and reads
 * the reports.
 *
 * Worth running on a device rather than under Jest for one reason. The unit
 * test mocks in `src/__mocks__/common.ts` are the only encoding of the native
 * contract in the Jest layer, and they were never verified against native, so
 * a mocked payload proves nothing about the shape native actually sends. The
 * two things this suite asserts, that native sends a list rather than a single
 * report and that native spells the receive counters correctly, are exactly the
 * two things a mock cannot establish.
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
 * How long to let the call run before the first read, so that the peer
 * connection has gathered candidate pairs and track stats. A read taken
 * immediately after `Connected` can report empty arrays.
 */
const STATS_SETTLE_DELAY_MS = 5_000;

/**
 * The five top-level members of `RTCStats.StatsReport`.
 */
const STATS_REPORT_TYPES = {
  iceCandidatePairStats: 'array',
  iceCandidateStats: 'array',
  localAudioTrackStats: 'array',
  peerConnectionId: 'string',
  remoteAudioTrackStats: 'array',
} as const;

/**
 * Members of `RTCStats.IceCandidatePairStats` this suite asserts on. The two
 * receive counters are the renamed members. The rest are asserted alongside
 * them so that a report missing everything fails here rather than passing a
 * check that only looks for absent misspellings.
 */
const ICE_CANDIDATE_PAIR_STATS_TYPES = {
  bytesReceived: 'number',
  bytesSent: 'number',
  requestsReceived: 'number',
  requestsSent: 'number',
  responsesReceived: 'number',
  responsesSent: 'number',
  state: 'string',
  transportId: 'string',
} as const;

/**
 * The names `RTCStats.IceCandidatePairStats` carried before the rename. Native
 * never emitted these, so a report that carries one means the rename was
 * applied to the wrong layer.
 */
const ICE_CANDIDATE_PAIR_MISSPELLINGS = [
  'requestsReceieved',
  'responsesRecieved',
] as const;

/**
 * Members of `RTCStats.RemoteAudioTrackStats` this suite asserts on.
 */
const REMOTE_AUDIO_TRACK_STATS_TYPES = {
  bytesReceived: 'number',
  codec: 'string',
  packetsReceived: 'number',
  ssrc: 'string',
} as const;

/**
 * The name `RTCStats.RemoteTrackStats` carried before the rename.
 */
const REMOTE_AUDIO_TRACK_MISSPELLINGS = ['bytesRecieved'] as const;

/**
 * Members of `RTCStats.LocalAudioTrackStats` this suite asserts on. Nothing
 * here was renamed. These are asserted so that a report whose local track
 * stats are empty is caught rather than quietly skipped.
 */
const LOCAL_AUDIO_TRACK_STATS_TYPES = {
  bytesSent: 'number',
  codec: 'string',
  packetsSent: 'number',
  ssrc: 'string',
} as const;

/**
 * Reads a stats member the declared type does not name.
 *
 * The misspelled members were removed from `RTCStats`, so reading one off a
 * typed value is a compile error. Asserting the misspellings are absent is what
 * proves native emits the corrected spelling, rather than proving only that the
 * TypeScript interface was edited, so the read goes through a record view.
 */
const asRecord = (value: unknown): Record<string, unknown> =>
  value as Record<string, unknown>;

const STEPS: Array<Step<Call>> = [
  {
    name: 'get-stats-resolves-with-an-array',
    // The cardinality is the assertion. `getStats` was declared as resolving
    // with a single report until the GA correction, while the native layer
    // resolves with one entry per peer connection.
    //
    // A call has a single peer connection, so this array is expected to hold
    // one entry. The count is still asserted as non-empty rather than as
    // exactly one, because the array is what the API promises and the number
    // of entries is not.
    description: 'getStats resolves with a non-empty array of reports',
    run: async (call, log) => {
      const reports = await call.getStats();

      log.info(JSON.stringify({
        reportCount: reports.length,
        peerConnectionIds: reports.map((report) => report.peerConnectionId),
      }));

      expect(reports, 'call.getStats()').toBeTypeOf('array');
      expect(
        reports.length > 0,
        'call.getStats() returned at least one report',
      ).toBe(true);
    },
  },
  {
    name: 'stats-report-shape',
    // Top level only. `peerConnectionId` is additionally asserted to be
    // non-empty, because it is what identifies which peer connection a report
    // describes.
    description: 'every report matches the RTCStats.StatsReport shape',
    run: async (call) => {
      const reports = await call.getStats();

      reports.forEach((report, index) => {
        expect(report, `getStats()[${index}]`).toMatchRecordTypes(
          STATS_REPORT_TYPES,
        );
        expect(
          report.peerConnectionId,
          `getStats()[${index}].peerConnectionId`,
        ).not.toHaveLength(0);
      });
    },
  },
  {
    name: 'ice-candidate-pair-stats-field-names',
    // Asserts both halves of the rename. The corrected names are present, and
    // the misspellings they replaced are absent. The absence half is what
    // proves native emits the corrected spelling, rather than proving only
    // that the TypeScript interface was edited.
    description:
      'iceCandidatePairStats uses the corrected receive counter names',
    run: async (call, log) => {
      const reports = await call.getStats();

      let pairCount = 0;

      reports.forEach((report, reportIndex) => {
        report.iceCandidatePairStats.forEach((pair, pairIndex) => {
          pairCount += 1;

          const label =
            `getStats()[${reportIndex}].iceCandidatePairStats[${pairIndex}]`;

          expect(pair, label).toMatchRecordTypes(
            ICE_CANDIDATE_PAIR_STATS_TYPES,
          );

          const record = asRecord(pair);

          ICE_CANDIDATE_PAIR_MISSPELLINGS.forEach((misspelling) => {
            expect(
              record[misspelling],
              `${label}.${misspelling}`,
            ).toBeUndefined();
          });
        });
      });

      log.info(JSON.stringify({ iceCandidatePairCount: pairCount }));

      expect(
        pairCount > 0,
        'the call reported at least one ICE candidate pair',
      ).toBe(true);
    },
  },
  {
    name: 'remote-audio-track-stats-field-names',
    // As with the candidate pairs, the absent misspelling is the half that
    // carries the evidence.
    description: 'remoteAudioTrackStats uses the corrected bytesReceived name',
    run: async (call, log) => {
      const reports = await call.getStats();

      let trackCount = 0;

      reports.forEach((report, reportIndex) => {
        report.remoteAudioTrackStats.forEach((track, trackIndex) => {
          trackCount += 1;

          const label =
            `getStats()[${reportIndex}].remoteAudioTrackStats[${trackIndex}]`;

          expect(track, label).toMatchRecordTypes(
            REMOTE_AUDIO_TRACK_STATS_TYPES,
          );

          const record = asRecord(track);

          REMOTE_AUDIO_TRACK_MISSPELLINGS.forEach((misspelling) => {
            expect(
              record[misspelling],
              `${label}.${misspelling}`,
            ).toBeUndefined();
          });
        });
      });

      log.info(JSON.stringify({ remoteAudioTrackCount: trackCount }));

      expect(
        trackCount > 0,
        'the call reported at least one remote audio track',
      ).toBe(true);
    },
  },
  {
    name: 'local-audio-track-stats-field-names',
    // Nothing here was renamed. This runs so that a report whose local track
    // stats are empty is caught rather than quietly skipped.
    description: 'localAudioTrackStats reports bytesSent and packetsSent',
    run: async (call, log) => {
      const reports = await call.getStats();

      let trackCount = 0;

      reports.forEach((report, reportIndex) => {
        report.localAudioTrackStats.forEach((track, trackIndex) => {
          trackCount += 1;

          expect(
            track,
            `getStats()[${reportIndex}].localAudioTrackStats[${trackIndex}]`,
          ).toMatchRecordTypes(LOCAL_AUDIO_TRACK_STATS_TYPES);
        });
      });

      log.info(JSON.stringify({ localAudioTrackCount: trackCount }));

      expect(
        trackCount > 0,
        'the call reported at least one local audio track',
      ).toBe(true);
    },
  },
  // KNOWN FAILING on both platforms: RTCStats.IceCandidatePairState holds
  // SCREAMING_SNAKE values while both native platforms emit camelCase, so
  // every comparison against the enum is false.
  // VBLOCKS-TODO: this drift has no ticket yet. File one and replace this
  // marker with the number.
  {
    name: 'ice-candidate-pair-state-is-a-known-value',
    // A consumer comparing a reported state against the enum has to be able to
    // match one. Only the states a connected call actually reaches are
    // observable here, so this cannot confirm every member.
    description:
      'every reported state is a member of RTCStats.IceCandidatePairState',
    run: async (call, log) => {
      const reports = await call.getStats();

      const observedStates = new Set<string>();

      reports.forEach((report) => {
        report.iceCandidatePairStats.forEach((pair) => {
          observedStates.add(String(pair.state));
        });
      });

      const knownStates: string[] = Object.values(
        RTCStats.IceCandidatePairState,
      );

      log.info(JSON.stringify({
        observedStates: Array.from(observedStates),
        knownStates,
      }));

      Array.from(observedStates).forEach((state) => {
        expect(knownStates, `the observed state "${state}"`).toContain(state);
      });
    },
  },
  {
    name: 'get-stats-is-stable',
    // Catches a native layer that allocates a new peer connection record per
    // read.
    //
    // Low yield in practice. A call has a single peer connection and reports a
    // constant id for it, so today this cannot fail. Kept generic rather than
    // pinned to the count and id that are actually observed, because neither
    // is part of a contract this SDK publishes, and pinning them would go red
    // on a change underneath that breaks nothing a consumer relies on.
    description: 'two consecutive reads report the same peerConnectionIds',
    run: async (call) => {
      const first = await call.getStats();
      const second = await call.getStats();

      const firstIds = first
        .map((report) => report.peerConnectionId)
        .sort();
      const secondIds = second
        .map((report) => report.peerConnectionId)
        .sort();

      expect(
        secondIds,
        'the peerConnectionIds of the second read',
      ).toStrictEqual(firstIds);
    },
  },
];

/**
 * RTCStats suite.
 */
export const useRtcStatsTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
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

    const didConnect = await waitForCallEvent(
      call,
      Call.Event.Connected,
      CONNECT_TIMEOUT_MS,
    );

    if (!didConnect) {
      fail(
        'the call never raised Call.Event.Connected',
        `waited ${CONNECT_TIMEOUT_MS}ms`,
      );
      await safelySettlePromise(call.disconnect());
      return;
    }

    await delay(STATS_SETTLE_DELAY_MS);

    const results = await runSteps(STEPS, call, log);

    const pendingDisconnect = waitForCallEvent(
      call,
      Call.Event.Disconnected,
      DISCONNECT_TIMEOUT_MS,
    );

    const disconnectResult = await safelySettlePromise(call.disconnect());

    if (disconnectResult.status === 'rejected') {
      results.push({
        step: 'disconnect',
        outcome: 'failed',
        note: describeError(disconnectResult.error),
      });
    } else {
      const didDisconnect = await pendingDisconnect;

      results.push({
        step: 'disconnect',
        outcome: didDisconnect ? 'passed' : 'failed',
        note: didDisconnect
          ? undefined
          : `no Disconnected event within ${DISCONNECT_TIMEOUT_MS}ms`,
      });
    }

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
