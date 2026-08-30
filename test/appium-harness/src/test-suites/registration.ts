import * as React from 'react';
import { TwilioErrors, Voice } from '@twilio/voice-react-native-sdk';
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
import { waitForVoiceEvent } from '../utilities/wait-for-event';

/**
 * `voice.register` / `voice.unregister` and the `Voice` events they raise.
 *
 * Otherwise registration is only exercised as a precondition inside
 * `incoming-ice-test.ts`, where a registration failure reports itself as an ICE
 * variant timing out. Covering it here means a regression names itself.
 *
 * Waits for no incoming call, so it runs unattended. Always ends unregistered,
 * whatever happened in between, because `register`/`unregister` mutate
 * device-wide state that outlives the suite.
 */

/**
 * How long to wait for `Voice.Event.Registered` / `Unregistered` after the
 * corresponding promise resolves.
 */
const EVENT_TIMEOUT_MS = 15_000;

/**
 * Pause between registration operations, so native has settled before the next
 * one is issued.
 */
const SETTLE_DELAY_MS = 2_000;

/**
 * How long to allow an undocumented operation to settle before treating the
 * silence as a failure. Only used where a hang is a plausible outcome.
 */
const SETTLE_TIMEOUT_MS = 15_000;

/**
 * Tokens that are structurally wrong rather than merely unauthorized. Neither
 * `register` nor `unregister` performs any JS-side validation - both hand the
 * token straight to native - so these exercise the native rejection path and
 * the error mapping on the way back.
 */
const MALFORMED_TOKEN = 'not-a-jwt';
const EMPTY_TOKEN = '';

/**
 * What the steps in this suite work against.
 */
type Context = {
  voice: Voice;
  token: string;
};

/**
 * Describes a `TwilioError` in full, including the fields the generated error
 * classes are supposed to populate.
 */
const describeTwilioError = (error: unknown) => {
  if (!(error instanceof TwilioErrors.TwilioError)) {
    return { isTwilioError: false, error: describeError(error) };
  }

  return {
    isTwilioError: true,
    name: error.name,
    code: error.code,
    message: error.message,
    description: error.description,
    causeCount: error.causes?.length,
    solutionCount: error.solutions?.length,
  };
};

const STEPS: Array<Step<Context>> = [
  {
    name: 'initialize-push-registry',
    description:
      'iOS requires the push registry before registering, so that the SDK has ' +
      'a PushKit device token to register with',
    platforms: ['ios'],
    run: async ({ voice }) => {
      await voice.initializePushRegistry();
    },
  },
  {
    name: 'register',
    description:
      'register resolves and Voice.Event.Registered is raised',
    run: async ({ voice, token }, log) => {
      // Bound before `register` is awaited: the event can be raised as soon as
      // native completes, which may be before the promise settles in JS.
      const registeredPromise = waitForVoiceEvent(
        voice,
        Voice.Event.Registered,
        EVENT_TIMEOUT_MS,
      );

      await voice.register(token);

      const registeredArgs = await registeredPromise;

      log.info(JSON.stringify({
        registeredEventRaised: registeredArgs !== null,
      }));

      expect(
        registeredArgs,
        'Voice.Event.Registered was raised within ' +
          `${EVENT_TIMEOUT_MS}ms of register resolving`,
      ).not.toBeNull();
    },
  },
  {
    name: 'register-again-is-idempotent',
    description:
      'registering an already-registered device resolves rather than ' +
      'rejecting, so an app that registers on every foreground does not have ' +
      'to track whether it already did',
    run: async ({ voice, token }, log) => {
      await delay(SETTLE_DELAY_MS);
      await voice.register(token);
      log.info(JSON.stringify({ message: 'second register resolved' }));
    },
  },
  {
    name: 'get-device-token-while-registered',
    description:
      'getDeviceToken resolves with a non-empty string once the device is ' +
      'registered. This is the one point in the suite where a device token is ' +
      'guaranteed to exist, which is why it is asserted here rather than in ' +
      'voice-api-test',
    run: async ({ voice }, log) => {
      const deviceToken = await voice.getDeviceToken();

      log.info(JSON.stringify({ deviceTokenLength: deviceToken.length }));

      expect(deviceToken, 'voice.getDeviceToken()').toBeTypeOf('string');
      expect(deviceToken, 'voice.getDeviceToken()').not.toHaveLength(0);
    },
  },
  {
    name: 'unregister',
    description:
      'unregister resolves and Voice.Event.Unregistered is raised',
    run: async ({ voice, token }, log) => {
      await delay(SETTLE_DELAY_MS);

      const unregisteredPromise = waitForVoiceEvent(
        voice,
        Voice.Event.Unregistered,
        EVENT_TIMEOUT_MS,
      );

      await voice.unregister(token);

      const unregisteredArgs = await unregisteredPromise;

      log.info(JSON.stringify({
        unregisteredEventRaised: unregisteredArgs !== null,
      }));

      expect(
        unregisteredArgs,
        'Voice.Event.Unregistered was raised within ' +
          `${EVENT_TIMEOUT_MS}ms of unregister resolving`,
      ).not.toBeNull();
    },
  },
  {
    name: 'unregister-when-not-registered',
    description:
      'unregistering an already-unregistered device settles rather than ' +
      'hanging. Whether it resolves or rejects is not asserted - it is not ' +
      'documented either way - but that it settles at all is, because an app ' +
      'calling unregister on logout has no reliable way to know its current ' +
      'state and a promise that never settles would hang it',
    run: async ({ voice, token }, log) => {
      await delay(SETTLE_DELAY_MS);

      // Raced against a deadline rather than simply awaited. This is the one
      // step whose expected outcome is undocumented, so a hang is a plausible
      // native behaviour - and without the race it would stall the whole suite
      // indefinitely instead of failing this step.
      const settled = await Promise.race([
        safelySettlePromise(voice.unregister(token)).then(
          (result) => result.status as 'resolved' | 'rejected' | 'timeout',
        ),
        delay(SETTLE_TIMEOUT_MS).then(() => 'timeout' as const),
      ]);

      log.info(JSON.stringify({ settled }));

      expect(
        settled,
        `voice.unregister settled within ${SETTLE_TIMEOUT_MS}ms`,
      ).not.toBe('timeout');
    },
  },
  {
    name: 'register-malformed-token',
    description:
      'registering with a token that is not a JWT rejects with a TwilioError ' +
      'carrying a numeric code, which is the native rejected-with-code path ' +
      'through constructTwilioError',
    run: async ({ voice }, log) => {
      await delay(SETTLE_DELAY_MS);

      const result = await safelySettlePromise(
        voice.register(MALFORMED_TOKEN),
      );

      log.info(JSON.stringify({
        settled: result.status,
        ...(result.status === 'rejected'
          ? { error: describeTwilioError(result.error) }
          : {}),
      }));

      expect(result.status, 'register with a malformed token').toBe('rejected');

      const error = result.status === 'rejected' ? result.error : undefined;

      expect(error, 'the rejection reason').toBeInstanceOf(
        TwilioErrors.TwilioError,
      );

      // A numeric code is what proves the error came back through the
      // code-mapping path rather than as a bare native error. The specific
      // code is not asserted: it depends on how the far end classifies the
      // token, and differs between platforms.
      expect(
        (error as TwilioErrors.TwilioError).code,
        'the error code',
      ).toBeTypeOf('number');
    },
  },
  {
    name: 'register-empty-token',
    description:
      'registering with an empty string rejects. Neither register nor ' +
      'unregister validates its argument in JS, so this reaches native and ' +
      'comes back through the same mapping as any other failure',
    run: async ({ voice }, log) => {
      await delay(SETTLE_DELAY_MS);

      const result = await safelySettlePromise(voice.register(EMPTY_TOKEN));

      log.info(JSON.stringify({
        settled: result.status,
        ...(result.status === 'rejected'
          ? { error: describeTwilioError(result.error) }
          : {}),
      }));

      expect(result.status, 'register with an empty token').toBe('rejected');
    },
  },
];

/**
 * Registration suite.
 */
export const useRegistrationTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    // Log every voice event for context. Unlike the per-step waits, these stay
    // bound for the duration of the suite, and are unbound in the teardown
    // below - `voice` outlives this suite, so anything left bound here would
    // still be logging during the next one.
    const eventLoggers = Object.values(Voice.Event).map((eventName) => {
      const listener = (...args: any[]) => {
        log.info(JSON.stringify({ eventName, args }));
      };
      voice.on(eventName, listener);
      return { eventName, listener };
    });

    const results = await runSteps(STEPS, { voice, token }, log);

    // Always leave the device unregistered, whatever the steps did. The last
    // successful step above already unregistered, but a failure part-way
    // through may have left it registered, and the next suite should not
    // inherit that.
    // Raced for the same reason as the `unregister-when-not-registered` step:
    // the device is already unregistered by now, and a hang here would leave
    // the suite at `in-progress` with no summary.
    const teardownSettled = await Promise.race([
      safelySettlePromise(voice.unregister(token)).then(
        (result) => result.status as 'resolved' | 'rejected' | 'timeout',
      ),
      delay(SETTLE_TIMEOUT_MS).then(() => 'timeout' as const),
    ]);
    log.info(JSON.stringify({
      teardown: 'unregister',
      settled: teardownSettled,
    }));

    eventLoggers.forEach(({ eventName, listener }) => {
      voice.off(eventName, listener);
    });

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
