import * as React from 'react';
import { Platform } from 'react-native';
import { Call, Voice } from '@twilio/voice-react-native-sdk';
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
import { waitForCallEvent } from '../utilities/wait-for-event';

/**
 * `Voice.ConnectOptions` and the call registry that a live call appears in.
 *
 * `outgoing-ice.ts` covers `iceServers` and `iceTransportPolicy`, so this suite
 * takes the rest - `params`, `contactHandle`, `notificationDisplayName` - plus
 * `voice.getCalls()` against a live call, which `voice-api` can only check
 * while empty. Each variant places its own call and tears it down.
 *
 * Those three options only have observable effects outside the app: `params`
 * reach the TwiML application, `contactHandle` sets CallKit UI, and
 * `notificationDisplayName` sets an Android notification title. So what is
 * asserted is that each is accepted and the call still connects with it
 * applied - worth having, because these cross the bridge as strings into native
 * code that formats UI with them.
 *
 * TODO: VBLOCKS-7136 - verify `params` are actually delivered, which needs the
 * TwiML side to echo them back (the relay server the detox suites use).
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
 * Pause between variants, so the audio session and, on iOS, CallKit settle
 * before the next call is placed.
 */
const INTER_VARIANT_DELAY_MS = 3_000;

/**
 * Custom TwiML parameters used by the `params` variants. Values are strings
 * because the JS layer rejects anything else.
 */
const TWIML_PARAMS = {
  harnessAlpha: 'one',
  harnessBeta: 'two',
};

type Variant = {
  name: string;
  description: string;
  platforms?: Array<typeof Platform.OS>;
  options: Voice.ConnectOptions;
  /**
   * Assertions to run against the connected call. Every variant asserts that
   * the call connected; this is for anything specific to the variant.
   */
  assert?: (
    call: Call,
    voice: Voice,
    log: Log,
  ) => Promise<void>;
};

/**
 * This suite keeps its own loop rather than using `runSteps`: each variant
 * places and tears down its own call, so the per-variant work is not a single
 * assertion block. It reuses the shared result type, naming the entry `step` so
 * the summary the orchestrator reads has the same shape as every other suite.
 */
type VariantResult = StepResult;

const VARIANTS: Variant[] = [
  {
    name: 'baseline-no-options',
    description: 'no options at all; establishes the control for the rest',
    options: {},
  },
  {
    name: 'params',
    description:
      'custom TwiML params are accepted and the call still connects with them ' +
      'applied',
    options: { params: TWIML_PARAMS },
  },
  {
    name: 'params-empty-object',
    description:
      'an explicitly empty params object behaves like omitting it. Worth ' +
      'covering separately because the JS layer defaults params to {} and then ' +
      'iterates it, so the empty case takes a different path through the ' +
      'validation loop',
    options: { params: {} },
  },
  {
    name: 'params-do-not-populate-custom-parameters',
    description:
      'params passed to connect do NOT appear in call.getCustomParameters(). ' +
      'Custom parameters are populated only from an associated CallInvite, so ' +
      'an outgoing call reports none. This asserts the behaviour rather than ' +
      'the intuition, because the names invite the opposite assumption',
    options: { params: TWIML_PARAMS },
    assert: async (call, _voice, log) => {
      const customParameters = call.getCustomParameters();

      log.info(JSON.stringify({ customParameters }));

      expect(customParameters, 'call.getCustomParameters()').toBeTypeOf(
        'object',
      );
      expect(
        Object.keys(customParameters),
        'call.getCustomParameters() keys on an outgoing call',
      ).toHaveLength(0);
    },
  },
  {
    name: 'contact-handle-ios',
    description:
      'a contactHandle is accepted on iOS and the call connects. The handle ' +
      'itself is CallKit UI and is not observable from here',
    platforms: ['ios'],
    options: { contactHandle: 'Harness Contact' },
  },
  {
    name: 'contact-handle-empty-string-ios',
    description:
      'an empty contactHandle is replaced with "Default Contact" by the JS ' +
      'layer rather than being passed through, so the call still connects',
    platforms: ['ios'],
    options: { contactHandle: '' },
  },
  {
    name: 'notification-display-name-android',
    description:
      'a notificationDisplayName is accepted on Android and the call ' +
      'connects. The notification title itself is system UI and is not ' +
      'observable from here',
    platforms: ['android'],
    options: { notificationDisplayName: 'Harness Call' },
  },
  {
    name: 'live-call-appears-in-get-calls',
    description:
      'voice.getCalls() reports the ongoing call, keyed by uuid, with a Call ' +
      'object whose sid and state match the one connect returned',
    options: {},
    assert: async (call, voice, log) => {
      const calls = await voice.getCalls();

      log.info(JSON.stringify({
        size: calls.size,
        sids: Array.from(calls.values()).map((entry) => entry.getSid()),
        expectedSid: call.getSid(),
      }));

      expect(calls, 'voice.getCalls()').toBeInstanceOf(Map);
      expect(
        calls.size > 0,
        'voice.getCalls() reports at least one call while one is up',
      ).toBe(true);

      const match = Array.from(calls.values()).find(
        (entry) => entry.getSid() === call.getSid(),
      );

      expect(
        match,
        'voice.getCalls() contains a call whose sid matches the connected call',
      ).toBeDefined();

      // The registry hands back freshly constructed `Call` objects rather than
      // the instance `connect` returned, so identity is not asserted - only
      // that the state it reports agrees.
      expect(
        (match as Call).getState(),
        'the registry entry state',
      ).toBe(Call.State.Connected);
    },
  },
  {
    name: 'live-call-does-not-appear-in-get-call-invites',
    description:
      'an outgoing call does not show up in voice.getCallInvites(), which ' +
      'tracks pending incoming invites only',
    options: {},
    assert: async (_call, voice, log) => {
      const callInvites = await voice.getCallInvites();

      log.info(JSON.stringify({ size: callInvites.size }));

      expect(callInvites, 'voice.getCallInvites()').toBeInstanceOf(Map);
      expect(
        callInvites.size,
        'voice.getCallInvites().size while an outgoing call is up',
      ).toBe(0);
    },
  },
];

/**
 * Runs one variant: places a call with its options, waits for `Connected`,
 * runs its assertions, and tears the call down. Never rejects.
 */
const runVariant = async (
  variant: Variant,
  voice: Voice,
  token: string,
  log: Log,
): Promise<VariantResult> => {
  if (variant.platforms && !variant.platforms.includes(Platform.OS)) {
    return {
      step: variant.name,
      outcome: 'skipped',
      note: `only runs on ${variant.platforms.join(', ')}`,
    };
  }

  log.info(JSON.stringify({
    running: variant.name,
    description: variant.description,
    options: variant.options,
  }));

  const connectResult = await safelySettlePromise(
    voice.connect(token, variant.options),
  );

  if (connectResult.status === 'rejected') {
    return {
      step: variant.name,
      outcome: 'failed',
      note: `voice.connect rejected: ${describeError(connectResult.error)}`,
    };
  }

  const call = connectResult.value;

  Object.values(Call.Event).forEach((eventName) => {
    call.on(eventName, (...args: any[]) => {
      log.info(JSON.stringify({ variant: variant.name, eventName, args }));
    });
  });

  const didConnect = await waitForCallEvent(
    call,
    Call.Event.Connected,
    CONNECT_TIMEOUT_MS,
  );

  if (!didConnect) {
    await safelySettlePromise(call.disconnect());
    return {
      step: variant.name,
      outcome: 'failed',
      note:
        'call did not raise Call.Event.Connected within ' +
        `${CONNECT_TIMEOUT_MS}ms`,
    };
  }

  const assertResult = variant.assert
    ? await safelySettlePromise(variant.assert(call, voice, log))
    : { status: 'resolved' as const };

  // Tear down whatever the assertions did, so the next variant starts with no
  // call up - which several of them assert against.
  const disconnectedPromise = waitForCallEvent(
    call,
    Call.Event.Disconnected,
    DISCONNECT_TIMEOUT_MS,
  );
  await safelySettlePromise(call.disconnect());
  await disconnectedPromise;

  if (assertResult.status === 'rejected') {
    return {
      step: variant.name,
      outcome: 'failed',
      note: describeError(assertResult.error),
    };
  }

  return { step: variant.name, outcome: 'passed' };
};

/**
 * Connect options suite.
 */
export const useConnectOptionsTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const results: VariantResult[] = [];

    for (const variant of VARIANTS) {
      const result = await runVariant(variant, voice, token, log);

      results.push(result);

      log.info(JSON.stringify({
        completed: result.step,
        outcome: result.outcome,
        note: result.note,
        progress: `${results.length}/${VARIANTS.length}`,
      }));

      await delay(INTER_VARIANT_DELAY_MS);
    }

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
