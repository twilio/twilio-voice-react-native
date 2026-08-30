import * as React from 'react';
import {
  AudioDevice,
  CallKit,
  TwilioErrors,
  Voice,
} from '@twilio/voice-react-native-sdk';
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

/**
 * The `Voice` surface that does not involve placing or receiving a call, plus
 * `AudioDevice`.
 *
 * Every step is fast and places no call, so this is the one suite that runs
 * unattended anywhere. It is also where platform divergence gets asserted: some
 * methods are iOS-only and reject with `UnsupportedPlatformError` on Android,
 * one is Android-only, and one is a documented no-op on Android.
 *
 * Steps are independent, and anything a step changes on the device it changes
 * back.
 */

/**
 * Settling delay after selecting an audio device, before the selection is read
 * back.
 */
const AUDIO_DEVICE_SETTLE_DELAY_MS = 1_000;

/**
 * Template used by the contact-handle step. Unset again before the step
 * returns.
 */
const CONTACT_HANDLE_TEMPLATE = 'Harness ${DisplayName}';

/**
 * A complete, valid CallKit configuration. Values are the SDK defaults where
 * the documentation names one, so applying it leaves the device as it was.
 */
const CALLKIT_CONFIGURATION: CallKit.ConfigurationOptions = {
  callKitIconTemplateImageData: '',
  callKitIncludesCallsInRecents: true,
  callKitMaximumCallGroups: 2,
  callKitMaximumCallsPerCallGroup: 5,
  callKitRingtoneSound: '',
  callKitSupportedHandleTypes: [
    CallKit.HandleType.Generic,
    CallKit.HandleType.PhoneNumber,
  ],
};

/**
 * Asserts that an `AudioDevice` is well-formed.
 *
 * `type` is asserted to be a member of `AudioDevice.Type`, which includes
 * `Unknown`: the native layer reports device categories the enum does not
 * cover as `Unknown` and carries the raw value in `nativeType`.
 */
const assertAudioDevice = (audioDevice: unknown, description: string) => {
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

const STEPS: Array<Step<Voice>> = [
  {
    name: 'get-version',
    description: 'getVersion resolves with the native SDK version',
    run: async (voice) => {
      const version = await voice.getVersion();
      expect(version, 'voice.getVersion()').toBeTypeOf('string');
      expect(version, 'voice.getVersion()').not.toHaveLength(0);
    },
  },
  {
    name: 'get-calls-is-empty',
    description:
      'getCalls resolves with an empty map when no call has been placed',
    run: async (voice) => {
      const calls = await voice.getCalls();
      expect(calls, 'voice.getCalls()').toBeInstanceOf(Map);
      expect(calls.size, 'voice.getCalls().size').toBe(0);
    },
  },
  {
    name: 'get-call-invites-is-empty',
    description:
      'getCallInvites resolves with an empty map when no invite is pending',
    run: async (voice) => {
      const callInvites = await voice.getCallInvites();
      expect(callInvites, 'voice.getCallInvites()').toBeInstanceOf(Map);
      expect(callInvites.size, 'voice.getCallInvites().size').toBe(0);
    },
  },
  {
    name: 'get-audio-devices',
    description:
      'getAudioDevices resolves with well-formed devices and, when the ' +
      'platform reports one, a selected device drawn from that same list',
    run: async (voice) => {
      const { audioDevices, selectedDevice } = await voice.getAudioDevices();

      expect(audioDevices, 'audioDevices').toBeTypeOf('array');
      expect(
        audioDevices.length > 0,
        'the device reports at least one audio device',
      ).toBe(true);

      audioDevices.forEach((audioDevice, index) => {
        expect(audioDevice, `audioDevices[${index}]`).toBeInstanceOf(
          AudioDevice,
        );
        assertAudioDevice(audioDevice, `audioDevices[${index}]`);
      });

      if (typeof selectedDevice !== 'undefined') {
        assertAudioDevice(selectedDevice, 'selectedDevice');
        expect(
          audioDevices.map((audioDevice) => audioDevice.uuid),
          'the selected device appears in audioDevices',
        ).toContain(selectedDevice.uuid);
      }
    },
  },
  // KNOWN FAILING on Android: selecting regenerates every device uuid, so the
  // uuid read back never matches the one selected, and a second select on the
  // same object rejects. Restores the original selection either way.
  // TODO: VBLOCKS-TODO
  {
    name: 'select-audio-device',
    description:
      'selecting each audio device is reflected by getAudioDevices',
    run: async (voice, log) => {
      const initial = await voice.getAudioDevices();

      // The restore runs in a `finally` because audio routing is device-wide
      // state that outlives this suite. Without it, a mid-loop assertion
      // failure would leave the device on whatever was selected last, and every
      // later call - here and in the call suites - would run through that
      // route.
      try {
        for (const audioDevice of initial.audioDevices) {
          await audioDevice.select();
          await delay(AUDIO_DEVICE_SETTLE_DELAY_MS);

          const { selectedDevice } = await voice.getAudioDevices();

          log.info(JSON.stringify({
            selected: audioDevice.name,
            reported: selectedDevice?.name,
          }));

          expect(
            selectedDevice?.uuid,
            `the selected device after selecting "${audioDevice.name}"`,
          ).toBe(audioDevice.uuid);
        }
      } finally {
        const { selectedDevice: originallySelected } = initial;

        if (typeof originallySelected !== 'undefined') {
          const original = initial.audioDevices.find(
            (audioDevice) => audioDevice.uuid === originallySelected.uuid,
          );

          // Swallowed deliberately: this is cleanup, and letting it throw here
          // would replace the assertion failure that brought us into the
          // `finally` with a less useful one.
          await safelySettlePromise(
            original?.select() ?? Promise.resolve(),
          );
        }
      }
    },
  },
  // The bare call to unset the template is documented behaviour.
  // KNOWN FAILING on Android: the Kotlin parameter is non-nullable, so passing
  // no argument dies in type conversion. TODO: VBLOCKS-TODO
  {
    name: 'set-incoming-call-contact-handle-template',
    description:
      'setIncomingCallContactHandleTemplate resolves when setting and unsetting',
    run: async (voice) => {
      await voice.setIncomingCallContactHandleTemplate(
        CONTACT_HANDLE_TEMPLATE,
      );

      // Restores the default notification and contact handle behavior.
      await voice.setIncomingCallContactHandleTemplate();
    },
  },
  {
    name: 'show-av-route-picker-view',
    description:
      'showAvRoutePickerView resolves on iOS, where it shows the picker, and ' +
      'also on Android, where it is a documented no-op rather than a rejection',
    run: async (voice) => {
      await voice.showAvRoutePickerView();
    },
  },
  {
    name: 'initialize-push-registry-ios',
    description: 'initializePushRegistry resolves on iOS',
    platforms: ['ios'],
    run: async (voice) => {
      await voice.initializePushRegistry();
    },
  },
  {
    name: 'initialize-push-registry-android',
    description:
      'initializePushRegistry rejects with an UnsupportedPlatformError on ' +
      'Android',
    platforms: ['android'],
    run: async (voice) => {
      const result = await safelySettlePromise(voice.initializePushRegistry());

      expect(result.status, 'initializePushRegistry on Android').toBe(
        'rejected',
      );
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'the rejection reason',
      ).toBeInstanceOf(TwilioErrors.UnsupportedPlatformError);
    },
  },
  {
    name: 'get-device-token',
    description:
      'getDeviceToken resolves with a string. Ordered after the push ' +
      'registry step, because on iOS the token comes from PushKit and is not ' +
      'available until the registry is initialized. The value is not ' +
      'asserted to be non-empty: whether a token exists yet depends on the ' +
      'push configuration of the build, which this suite does not control',
    run: async (voice, log) => {
      const deviceToken = await voice.getDeviceToken();

      log.info(JSON.stringify({ deviceTokenLength: deviceToken.length }));

      expect(deviceToken, 'voice.getDeviceToken()').toBeTypeOf('string');
    },
  },
  {
    name: 'set-callkit-configuration-ios',
    description: 'setCallKitConfiguration resolves on iOS',
    platforms: ['ios'],
    run: async (voice) => {
      await voice.setCallKitConfiguration(CALLKIT_CONFIGURATION);
    },
  },
  {
    name: 'set-callkit-configuration-android',
    description:
      'setCallKitConfiguration rejects with an UnsupportedPlatformError on ' +
      'Android',
    platforms: ['android'],
    run: async (voice) => {
      const result = await safelySettlePromise(
        voice.setCallKitConfiguration(CALLKIT_CONFIGURATION),
      );

      expect(result.status, 'setCallKitConfiguration on Android').toBe(
        'rejected',
      );
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'the rejection reason',
      ).toBeInstanceOf(TwilioErrors.UnsupportedPlatformError);
    },
  },
  {
    name: 'handle-firebase-message-ios',
    description:
      'handleFirebaseMessage rejects with an UnsupportedPlatformError on iOS',
    platforms: ['ios'],
    run: async (voice) => {
      const result = await safelySettlePromise(
        voice.handleFirebaseMessage({}),
      );

      expect(result.status, 'handleFirebaseMessage on iOS').toBe('rejected');
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'the rejection reason',
      ).toBeInstanceOf(TwilioErrors.UnsupportedPlatformError);
    },
  },
  {
    name: 'handle-firebase-message-android',
    description:
      'handleFirebaseMessage reaches the native layer on Android and settles ' +
      'rather than hanging when handed a message that is not a Twilio Voice ' +
      'push. It resolves with a boolean or rejects depending on how the app ' +
      'is configured, so the only thing asserted is that it did not come ' +
      'back out of the JS platform guard',
    platforms: ['android'],
    run: async (voice, log) => {
      const result = await safelySettlePromise(
        voice.handleFirebaseMessage({ notATwilioMessage: 'true' }),
      );

      log.info(JSON.stringify({
        handleFirebaseMessage: result.status,
        value: result.status === 'resolved'
          ? result.value
          : describeError(result.error),
      }));

      if (result.status === 'resolved') {
        expect(result.value, 'handleFirebaseMessage()').toBeTypeOf('boolean');
        return;
      }

      expect(
        result.error instanceof TwilioErrors.UnsupportedPlatformError,
        'handleFirebaseMessage rejected out of the JS platform guard',
      ).toBe(false);
    },
  },
];

/**
 * Voice non-call API suite.
 *
 * Takes no access token: none of these methods need one.
 */
export const useVoiceApiTest: UseTestSuite = (
  _token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const results = await runSteps(STEPS, voice, log);
    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [voice, log, setTestStatus]);

  return { perform };
}
