import * as React from 'react';
import { AudioDevice, Voice } from '@twilio/voice-react-native-sdk';
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
import { waitForVoiceEvent } from '../utilities/wait-for-event';

/**
 * `AudioDevice`, its `Type` enumeration, and the routing that `select()`
 * performs.
 *
 * Attended. The tester plugs in and unplugs a wired headset when prompted.
 *
 * A wired headset is the reason this suite exists. `AudioDevice.Type` gained a
 * `WiredHeadset` member for GA, because Android previously reported a wired
 * headset as `Earpiece` and correct consumer code could have relied on that.
 * Nothing but a device with a headset attached can confirm that the new member
 * is what native now reports, or that selecting the headset actually routes
 * audio to it.
 */

/** How long to wait for the tester to plug in or unplug a headset. */
const MANUAL_ACTION_TIMEOUT_MS = 120_000;

/**
 * Settling delay after selecting an audio device, before the selection is read
 * back. Audio routing is not applied synchronously with the promise.
 */
const SELECT_SETTLE_DELAY_MS = 1_000;

/**
 * Asserts that an `AudioDevice` is well-formed.
 *
 * `type` is asserted to be a member of `AudioDevice.Type`, which includes
 * `Unknown`. The native layer reports device categories the enum does not
 * cover as `Unknown` and carries the raw value in `nativeType`.
 */
const assertAudioDevice = (audioDevice: unknown, description: string) => {
  expect(audioDevice, description).toBeInstanceOf(AudioDevice);
  expect(audioDevice, description).toMatchRecordTypes({
    uuid: 'string',
    type: 'string',
    nativeType: 'string',
    name: 'string',
  });

  const { type, uuid, nativeType } = audioDevice as AudioDevice;

  expect(uuid, `${description}.uuid`).not.toHaveLength(0);
  expect(nativeType, `${description}.nativeType`).not.toHaveLength(0);
  expect(Object.values(AudioDevice.Type), `${description}.type`).toContain(
    type,
  );
};

/**
 * Renders the device list as the mapping this suite exists to record.
 */
const describeAudioDevices = (audioDevices: AudioDevice[]) =>
  audioDevices.map((audioDevice) => ({
    name: audioDevice.name,
    type: audioDevice.type,
    nativeType: audioDevice.nativeType,
  }));

/**
 * Logs an instruction the tester must act on. Prefixed so it stands out in a
 * log that is otherwise machine-shaped.
 */
const prompt = (log: Log, action: string) => {
  log.warn(JSON.stringify({ TESTER_ACTION: action }));
};

/**
 * Prompts the tester and waits for the resulting
 * `Voice.Event.AudioDevicesUpdated`. Resolves `true` when the event arrives.
 *
 * The listener is bound before the prompt is logged, so a tester who acts
 * immediately cannot beat the listener to the event.
 */
const promptAndWaitForUpdate = async (
  voice: Voice,
  log: Log,
  action: string,
): Promise<boolean> => {
  const pendingUpdate = waitForVoiceEvent(
    voice,
    Voice.Event.AudioDevicesUpdated,
    MANUAL_ACTION_TIMEOUT_MS,
  );

  prompt(log, action);

  return (await pendingUpdate) !== null;
};

/**
 * AudioDevice suite.
 *
 * Takes no access token: none of these methods need one.
 */
export const useAudioDeviceTest: UseTestSuite = (
  _token,
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

    const initial = await safelySettlePromise(voice.getAudioDevices());

    if (initial.status === 'rejected') {
      log.error(JSON.stringify({
        message: 'voice.getAudioDevices rejected',
        note: describeError(initial.error),
      }));
      setTestStatus('failure');
      return;
    }

    const originallySelected = initial.value.selectedDevice;

    // Audio routing is device-wide state that outlives this suite, so the
    // restore runs whatever happens above it. Without the restore, a failure
    // partway through would leave the device on whatever was selected last and
    // every later call, here and in the call suites, would run through that
    // route.
    try {
      await step('enumerate-audio-devices', () => {
        const { audioDevices, selectedDevice } = initial.value;

        expect(audioDevices, 'audioDevices').toBeTypeOf('array');
        expect(
          audioDevices.length > 0,
          'the device reports at least one audio device',
        ).toBe(true);

        audioDevices.forEach((audioDevice, index) => {
          assertAudioDevice(audioDevice, `audioDevices[${index}]`);
        });

        if (typeof selectedDevice !== 'undefined') {
          assertAudioDevice(selectedDevice, 'selectedDevice');
          expect(
            audioDevices.map((audioDevice) => audioDevice.uuid),
            'the selected device appears in audioDevices',
          ).toContain(selectedDevice.uuid);
        }
      });

      // Not an assertion. This is the record that shows what each platform maps
      // its native device categories onto, which is what changed for Android
      // wired headsets.
      await step('log-native-type-mapping', () => {
        log.info(JSON.stringify({
          audioDeviceMapping: describeAudioDevices(initial.value.audioDevices),
        }));
      });

      const didPlugIn = await promptAndWaitForUpdate(
        voice,
        log,
        'plug a wired headset into this device now',
      );

      await step('audio-devices-updated-after-plug-in', () => {
        expect(
          didPlugIn,
          'Voice.Event.AudioDevicesUpdated was raised within ' +
            `${MANUAL_ACTION_TIMEOUT_MS}ms of the prompt`,
        ).toBe(true);
      });

      // Settled rather than awaited directly. This sits inside a
      // `try`/`finally` with no `catch`, so an unguarded rejection would
      // escape `perform`, and nothing awaits `perform`, which would leave the
      // status at `in-progress` with no summary.
      const withHeadset = await safelySettlePromise(voice.getAudioDevices());

      const wiredHeadset = withHeadset.status === 'resolved'
        ? withHeadset.value.audioDevices.find(
            (audioDevice) => audioDevice.type === AudioDevice.Type.WiredHeadset,
          )
        : undefined;

      await step('wired-headset-is-reported', () => {
        expect(
          withHeadset.status,
          'getAudioDevices() with a headset attached',
        ).toBe('resolved');

        log.info(JSON.stringify({
          audioDeviceMappingWithHeadset: withHeadset.status === 'resolved'
            ? describeAudioDevices(withHeadset.value.audioDevices)
            : undefined,
        }));

        expect(
          wiredHeadset,
          `an audio device of type "${AudioDevice.Type.WiredHeadset}"`,
        ).toBeDefined();
      });

      // KNOWN FAILING on iOS: the device record stores the UID of the
      // AVAudioSessionPortHeadphones output port, while selectAudioDevice:
      // searches availableInputs, so the lookup cannot succeed. The native
      // layer does report the failure, returning NO at
      // `ios/TwilioVoiceReactNative.m:342`. The failure is invisible here
      // because `select()` discards it, not because native reported success.
      // TODO: VBLOCKS-7140 for the lookup, VBLOCKS-7139 for the discarded
      // rejection.
      await step('select-wired-headset', async () => {
        expect(wiredHeadset, 'the wired headset').toBeDefined();

        await wiredHeadset!.select();
        await delay(SELECT_SETTLE_DELAY_MS);

        // Safe to await directly: this runs inside `step`, which settles the
        // promise and records a rejection as a failed step.
        const { selectedDevice } = await voice.getAudioDevices();

        log.info(JSON.stringify({
          selected: wiredHeadset!.name,
          reported: selectedDevice?.name,
          reportedType: selectedDevice?.type,
        }));

        expect(
          selectedDevice?.type,
          'the selected device type after selecting the wired headset',
        ).toBe(AudioDevice.Type.WiredHeadset);
      });

      const didUnplug = await promptAndWaitForUpdate(
        voice,
        log,
        'unplug the wired headset now',
      );

      await step('audio-devices-updated-after-unplug', () => {
        expect(
          didUnplug,
          'Voice.Event.AudioDevicesUpdated was raised within ' +
            `${MANUAL_ACTION_TIMEOUT_MS}ms of the prompt`,
        ).toBe(true);
      });

      await step('wired-headset-is-removed', async () => {
        // Safe to await directly: this runs inside `step`.
        const { audioDevices } = await voice.getAudioDevices();

        log.info(JSON.stringify({
          audioDeviceMappingAfterUnplug: describeAudioDevices(audioDevices),
        }));

        expect(
          audioDevices.map((audioDevice) => audioDevice.type),
          'the reported device types after unplugging',
        ).not.toContain(AudioDevice.Type.WiredHeadset);
      });

      // KNOWN FAILING on both platforms: select() awaits the native promise
      // directly, and the native layer reports failure by resolving with a
      // rejection envelope, so a failed selection resolves.
      // TODO: VBLOCKS-7139
      await step('select-a-removed-device-rejects', async () => {
        expect(wiredHeadset, 'the wired headset').toBeDefined();

        const result = await safelySettlePromise(wiredHeadset!.select());

        log.info(JSON.stringify({
          selectRemovedDevice: result.status,
          note: result.status === 'rejected'
            ? describeError(result.error)
            : undefined,
        }));

        expect(
          result.status,
          'select() on a device that is no longer connected',
        ).toBe('rejected');
      });
    } finally {
      if (typeof originallySelected !== 'undefined') {
        // The devices are re-read rather than reused from `initial`, and are
        // matched on name and type rather than on uuid. Android's
        // `AudioSwitchManager.start` clears its device map and assigns a fresh
        // `UUID.randomUUID()` to every device on every AudioSwitch update, and
        // this suite deliberately causes two of those updates by having the
        // tester plug in and unplug a headset. Every uuid in `initial` is
        // therefore dead by the time this runs, so a uuid match would select
        // nothing and leave the following suites on the headset route.
        const current = await safelySettlePromise(voice.getAudioDevices());

        const original = current.status === 'resolved'
          ? current.value.audioDevices.find(
            (audioDevice) =>
              audioDevice.name === originallySelected.name &&
              audioDevice.type === originallySelected.type,
          )
          : undefined;

        // Swallowed deliberately. This is cleanup, and letting it throw here
        // would replace the assertion failure that brought us into the
        // `finally` with a less useful one.
        await safelySettlePromise(original?.select() ?? Promise.resolve());

        // `select()` cannot report a failed selection (VBLOCKS-7139), so the
        // restore is logged rather than asserted. A later suite running on an
        // unexpected route is otherwise very hard to trace back to here.
        log.info(JSON.stringify({
          restoredAudioDevice: original?.name ?? 'not-found',
          expected: originallySelected.name,
        }));
      }
    }

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [voice, log, setTestStatus]);

  return { perform };
}
