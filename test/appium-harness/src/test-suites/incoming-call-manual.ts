import * as React from 'react';
import { Platform } from 'react-native';
import {
  Call,
  CallInvite,
  TwilioErrors,
  Voice,
} from '@twilio/voice-react-native-sdk';
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
import { waitForCallEvent, waitForVoiceEvent } from '../utilities/wait-for-event';

/**
 * Incoming call paths, on both platforms. Manual: the tester places each call
 * and drives the system call UI.
 *
 * Variant names use three actors: `native` is the system call UI - an Android
 * notification or the iOS CallKit screen - `js` is the SDK API, and `remote` is
 * the far end. The paths and the events they assert are identical on both
 * platforms, and have been run green on both.
 *
 * `incoming-call-test-manual` runs all nine paths in order, each waiting for its
 * own incoming call.
 *
 * Android's `VoiceService.acceptCall`/`rejectCall` emit the same JS events
 * whether the trigger was the system UI or `callInvite.accept()`/`reject()`,
 * with the JS path additionally resolving the stored promise; iOS behaves the
 * same way in practice. So the observable difference between the two is exactly
 * whether a promise settles, and an app that only awaits the promise will miss
 * every accept driven from the system UI.
 */

/** The system call UI, by the name the tester will recognise. */
const SYSTEM_UI = Platform.OS === 'ios' ? 'CallKit screen' : 'notification';

/** How long to wait for the tester to place a call or act on the call UI. */
const MANUAL_ACTION_TIMEOUT_MS = 120_000;

/** Lets the audio session settle before the suite ends. */
const SETTLE_DELAY_MS = 2_000;

/**
 * How long teardown waits for `Call.Event.Disconnected` after ending a call a
 * failed variant left connected. Short, because no tester action is involved.
 */
const TEARDOWN_DISCONNECT_TIMEOUT_MS = 10_000;

type Context = {
  voice: Voice;
  callInvite: CallInvite;
  log: Log;
};

type Variant = {
  /** Printed for the tester before the call is placed. */
  setup: string;
  run: (context: Context) => Promise<void>;
};

/**
 * Logs an instruction the tester must act on. Prefixed so it stands out in a
 * log that is otherwise machine-shaped.
 */
const prompt = (log: Log, action: string) => {
  log.warn(JSON.stringify({ TESTER_ACTION: action }));
};

/**
 * Binds and unbinds a `CallInvite` listener by event name.
 *
 * `Call`, `Voice`, `OutgoingCallMessage` and `PreflightTest` all declare a
 * generic `on(event, listener)` overload; `CallInvite` does not, so a value of
 * type `CallInvite.Event` matches none of its overloads. These two casts are
 * the whole workaround, and work at runtime because the underlying emitter
 * does not care.
 *
 * TODO: VBLOCKS-7135 - add the generic overload and `Listener.Generic` to
 * `CallInvite`, then drop these casts.
 */
type LooseListener = (...args: any[]) => void;

const onInvite = (
  callInvite: CallInvite,
  eventName: CallInvite.Event,
  listener: LooseListener,
) => {
  (callInvite.on as unknown as (e: string, l: LooseListener) => void)(
    eventName,
    listener,
  );
};

const offInvite = (
  callInvite: CallInvite,
  eventName: CallInvite.Event,
  listener: LooseListener,
) => {
  (callInvite.off as unknown as (e: string, l: LooseListener) => void)(
    eventName,
    listener,
  );
};

/**
 * Waits for one `CallInvite` event, resolving with its arguments or `null` on
 * timeout. Always unbinds.
 */
const waitForInviteEvent = (
  callInvite: CallInvite,
  eventName: CallInvite.Event,
  timeoutMs: number,
): Promise<any[] | null> => new Promise((resolve) => {
  let settled = false;

  const settle = (args: any[] | null) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    offInvite(callInvite, eventName, onEvent);
    resolve(args);
  };

  const timeoutId = setTimeout(() => settle(null), timeoutMs);

  function onEvent(...args: any[]) {
    settle(args);
  }

  onInvite(callInvite, eventName, onEvent);
});

/**
 * Waits for `CallInvite.Event.Accepted` and asserts it carried a `Call`.
 *
 * This is the only way to obtain a `Call` when the accept came from the system
 * call UI - there is no promise to await.
 */
const awaitAccepted = async (
  callInvite: CallInvite,
  log: Log,
): Promise<Call> => {
  const args = await waitForInviteEvent(
    callInvite,
    CallInvite.Event.Accepted,
    MANUAL_ACTION_TIMEOUT_MS,
  );

  expect(args, 'CallInvite.Event.Accepted was raised').not.toBeNull();

  const [call] = args as any[];

  expect(call, 'the Call carried by Accepted').toBeInstanceOf(Call);
  expect(callInvite.getState(), 'callInvite.getState()').toBe(
    CallInvite.State.Accepted,
  );

  // The Call is built from invite info with no `state`, so it starts as
  // Connecting and is corrected by later native events.
  log.info(JSON.stringify({
    callSid: call.getSid(),
    stateAtAccept: call.getState(),
  }));

  return call;
};

/**
 * Binds the `Disconnected` listener without awaiting it. `call.disconnect()`
 * only awaits the native promise - the event arrives separately, and `Call`
 * does not replay it - so a suite that ends the call itself must bind before
 * disconnecting or risk missing the event entirely.
 */
const watchForDisconnect = (call: Call): Promise<boolean> =>
  waitForCallEvent(call, Call.Event.Disconnected, MANUAL_ACTION_TIMEOUT_MS);

/**
 * Asserts the call ends cleanly, however it was ended. Takes the pending watch
 * so the caller controls when the listener was bound.
 */
const assertDisconnected = async (
  call: Call,
  pendingDisconnect: Promise<boolean>,
  log: Log,
) => {
  const didDisconnect = await pendingDisconnect;

  log.info(JSON.stringify({ didDisconnect, state: call.getState() }));

  expect(didDisconnect, 'Call.Event.Disconnected was raised').toBe(true);
  expect(call.getState(), 'call.getState() after disconnect').toBe(
    Call.State.Disconnected,
  );
};

/**
 * The tester-driven form: nothing can end the call until the tester acts, so
 * binding and awaiting in one step is safe.
 */
const awaitDisconnected = (call: Call, log: Log) =>
  assertDisconnected(call, watchForDisconnect(call), log);

/**
 * Accepts through JS and asserts both signals: the promise resolves *and* the
 * event fires, agreeing on the call sid.
 */
const acceptFromJs = async (callInvite: CallInvite, log: Log): Promise<Call> => {
  const acceptedEvent = waitForInviteEvent(
    callInvite,
    CallInvite.Event.Accepted,
    MANUAL_ACTION_TIMEOUT_MS,
  );

  const call = await callInvite.accept();

  const args = await acceptedEvent;

  log.info(JSON.stringify({
    promiseCallSid: call.getSid(),
    eventRaised: args !== null,
  }));

  expect(call, 'the Call accept() resolved with').toBeInstanceOf(Call);
  expect(args, 'CallInvite.Event.Accepted was also raised').not.toBeNull();

  const [eventCall] = args as any[];
  expect(eventCall.getSid(), 'the sid the event reported').toBe(call.getSid());

  return call;
};

const VARIANTS = {
  'native-accept-native-disconnect': {
    setup: `accept from the ${SYSTEM_UI}, then hang up from the ${SYSTEM_UI}`,
    run: async ({ callInvite, log }) => {
      prompt(log, `tap ACCEPT in the ${SYSTEM_UI}`);
      const call = await awaitAccepted(callInvite, log);

      prompt(log, `tap the hang-up action in the ongoing-call ${SYSTEM_UI}`);
      await awaitDisconnected(call, log);
    },
  },
  'native-accept-js-disconnect': {
    setup: `accept from the ${SYSTEM_UI}; the suite hangs up`,
    run: async ({ callInvite, log }) => {
      prompt(log, `tap ACCEPT in the ${SYSTEM_UI}`);
      const call = await awaitAccepted(callInvite, log);

      await delay(SETTLE_DELAY_MS);

      const pendingDisconnect = watchForDisconnect(call);
      await call.disconnect();
      await assertDisconnected(call, pendingDisconnect, log);
    },
  },
  'native-accept-remote-disconnect': {
    setup: `accept from the ${SYSTEM_UI}, then hang up the far end`,
    run: async ({ callInvite, log }) => {
      prompt(log, `tap ACCEPT in the ${SYSTEM_UI}`);
      const call = await awaitAccepted(callInvite, log);

      prompt(log, 'hang up from the far end (or let the TwiML pause expire)');
      await awaitDisconnected(call, log);
    },
  },
  'js-accept-native-disconnect': {
    setup: `the suite accepts; hang up from the ${SYSTEM_UI}`,
    run: async ({ callInvite, log }) => {
      const call = await acceptFromJs(callInvite, log);

      prompt(log, `tap the hang-up action in the ongoing-call ${SYSTEM_UI}`);
      await awaitDisconnected(call, log);
    },
  },
  'js-accept-js-disconnect': {
    setup: 'the suite accepts and hangs up; no tester action after the call',
    run: async ({ callInvite, log }) => {
      const call = await acceptFromJs(callInvite, log);

      await delay(SETTLE_DELAY_MS);

      const pendingDisconnect = watchForDisconnect(call);
      await call.disconnect();
      await assertDisconnected(call, pendingDisconnect, log);
    },
  },
  'js-accept-remote-disconnect': {
    setup: 'the suite accepts; hang up the far end',
    run: async ({ callInvite, log }) => {
      const call = await acceptFromJs(callInvite, log);

      prompt(log, 'hang up from the far end (or let the TwiML pause expire)');
      await awaitDisconnected(call, log);
    },
  },
  'native-reject': {
    setup: `reject from the ${SYSTEM_UI}`,
    run: async ({ callInvite, log }) => {
      prompt(log, `tap DECLINE in the ${SYSTEM_UI}`);

      const args = await waitForInviteEvent(
        callInvite,
        CallInvite.Event.Rejected,
        MANUAL_ACTION_TIMEOUT_MS,
      );

      expect(args, 'CallInvite.Event.Rejected was raised').not.toBeNull();
      expect(callInvite.getState(), 'callInvite.getState()').toBe(
        CallInvite.State.Rejected,
      );
    },
  },
  'js-reject': {
    setup: 'the suite rejects; no tester action after the call',
    run: async ({ callInvite, log }) => {
      const rejectedEvent = waitForInviteEvent(
        callInvite,
        CallInvite.Event.Rejected,
        MANUAL_ACTION_TIMEOUT_MS,
      );

      await callInvite.reject();

      const args = await rejectedEvent;

      log.info(JSON.stringify({ eventRaised: args !== null }));

      expect(args, 'CallInvite.Event.Rejected was also raised').not.toBeNull();
      expect(callInvite.getState(), 'callInvite.getState()').toBe(
        CallInvite.State.Rejected,
      );
    },
  },
  'remote-cancel': {
    setup: 'hang up the far end before accepting or rejecting',
    run: async ({ callInvite, log }) => {
      prompt(log, `hang up the far end without touching the ${SYSTEM_UI}`);

      const args = await waitForInviteEvent(
        callInvite,
        CallInvite.Event.Cancelled,
        MANUAL_ACTION_TIMEOUT_MS,
      );

      expect(args, 'CallInvite.Event.Cancelled was raised').not.toBeNull();

      const [error] = args as any[];

      log.info(JSON.stringify({
        error: typeof error === 'undefined' ? undefined : describeError(error),
        code: error instanceof TwilioErrors.TwilioError ? error.code : undefined,
      }));

      expect(error, 'the error Cancelled carried').toBeInstanceOf(
        TwilioErrors.GeneralErrors.CallCancelledError,
      );
      expect(
        (error as TwilioErrors.TwilioError).code,
        'the error code',
      ).toBe(31008);

      expect(callInvite.getState(), 'callInvite.getState()').toBe(
        CallInvite.State.Cancelled,
      );
    },
  },
} satisfies Record<string, Variant>;

type VariantName = keyof typeof VARIANTS;

/**
 * Asserts the invite's getters before any action is taken on it.
 */
const assertPendingInvite = (callInvite: CallInvite, log: Log) => {
  log.info(JSON.stringify({
    callSid: callInvite.getCallSid(),
    from: callInvite.getFrom(),
    to: callInvite.getTo(),
    state: callInvite.getState(),
    customParameters: callInvite.getCustomParameters(),
  }));

  expect(callInvite.getCallSid(), 'getCallSid()').toBeTypeOf('string');
  expect(callInvite.getCallSid(), 'getCallSid()').not.toHaveLength(0);
  expect(callInvite.getFrom(), 'getFrom()').toBeTypeOf('string');
  expect(callInvite.getTo(), 'getTo()').toBeTypeOf('string');
  expect(callInvite.getCustomParameters(), 'getCustomParameters()').toBeTypeOf(
    'object',
  );
  expect(callInvite.getState(), 'getState()').toBe(CallInvite.State.Pending);
};

/**
 * Ends a call left over by a failed variant. Never rejects.
 *
 * A variant that fails partway can leave the accepted call connected. The
 * suite then prompts for the next incoming call while the device is still in a
 * call, so every remaining variant fails for a reason unrelated to what it
 * tests. The realistic trigger is the tester not acting on the system call UI
 * before `MANUAL_ACTION_TIMEOUT_MS` expires.
 *
 * The result is not recorded as a step. This is teardown, not coverage, and the
 * variant has already been recorded as failed.
 */
const endCallAfterFailure = async (
  call: Call | null,
  variantName: VariantName,
  log: Log,
) => {
  if (call === null || call.getState() === Call.State.Disconnected) {
    return;
  }

  log.warn(JSON.stringify({
    variant: variantName,
    message: 'variant failed with the call still connected, disconnecting it ' +
      'so the following variants start from a clean state',
  }));

  const pendingDisconnect = waitForCallEvent(
    call,
    Call.Event.Disconnected,
    TEARDOWN_DISCONNECT_TIMEOUT_MS,
  );

  const disconnectResult = await safelySettlePromise(call.disconnect());

  if (disconnectResult.status === 'rejected') {
    log.warn(JSON.stringify({
      variant: variantName,
      message: 'teardown call.disconnect rejected',
      note: describeError(disconnectResult.error),
    }));
  }

  const didDisconnect = await pendingDisconnect;

  log.info(JSON.stringify({
    variant: variantName,
    teardownDidDisconnect: didDisconnect,
    teardownState: call.getState(),
  }));
};

/**
 * Runs one variant end to end: waits for an invite, checks its getters, then
 * hands off to the variant. Never rejects.
 *
 * Each variant needs its own incoming call, so the wait happens per variant
 * rather than once for the suite.
 */
const runVariant = async (
  variantName: VariantName,
  voice: Voice,
  log: Log,
): Promise<StepResult[]> => {
  const variant = VARIANTS[variantName];

  prompt(log, `place a call to this client now - ${variant.setup}`);

  const inviteArgs = await waitForVoiceEvent(
    voice,
    Voice.Event.CallInvite,
    MANUAL_ACTION_TIMEOUT_MS,
  );

  if (inviteArgs === null) {
    return [
      {
        step: variantName,
        outcome: 'failed',
        note: `no CallInvite arrived within ${MANUAL_ACTION_TIMEOUT_MS}ms`,
      },
    ];
  }

  const callInvite = inviteArgs[0] as CallInvite;

  // Tracks the accepted `Call` so the failure path below can end it. Every
  // accept path raises `CallInvite.Event.Accepted` with the `Call`, whether the
  // accept came from the system call UI or from `callInvite.accept()`, so this
  // one listener covers both without the variants having to report the call
  // back.
  let acceptedCall: Call | null = null;

  Object.values(CallInvite.Event).forEach((eventName) => {
    onInvite(callInvite, eventName, (...args: any[]) => {
      if (eventName === CallInvite.Event.Accepted && args[0] instanceof Call) {
        acceptedCall = args[0];
      }
      log.info(JSON.stringify({
        variant: variantName,
        inviteEvent: eventName,
        argCount: args.length,
      }));
    });
  });

  const results: StepResult[] = [];

  const inviteCheck = await safelySettlePromise(
    Promise.resolve().then(() => assertPendingInvite(callInvite, log)),
  );
  results.push(
    inviteCheck.status === 'rejected'
      ? {
          step: `${variantName}/pending-invite-getters`,
          outcome: 'failed',
          note: describeError(inviteCheck.error),
        }
      : { step: `${variantName}/pending-invite-getters`, outcome: 'passed' },
  );

  const variantResult = await safelySettlePromise(
    variant.run({ voice, callInvite, log }),
  );
  results.push(
    variantResult.status === 'rejected'
      ? {
          step: variantName,
          outcome: 'failed',
          note: describeError(variantResult.error),
        }
      : { step: variantName, outcome: 'passed' },
  );

  if (variantResult.status === 'rejected') {
    await endCallAfterFailure(acceptedCall, variantName, log);
  }

  return results;
};

export const useIncomingCallManualTest: UseTestSuite = (
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

    if (Platform.OS === 'ios') {
      // Guarded like every other failure path here: nothing awaits `perform`,
      // so an unguarded rejection would leave the status at `in-progress`.
      const pushRegistryResult = await safelySettlePromise(
        voice.initializePushRegistry(),
      );
      if (pushRegistryResult.status === 'rejected') {
        fail(
          'voice.initializePushRegistry rejected',
          describeError(pushRegistryResult.error),
        );
        return;
      }
    }

    const variantNames = Object.keys(VARIANTS) as VariantName[];

    const registerResult = await safelySettlePromise(voice.register(token));
    if (registerResult.status === 'rejected') {
      fail('voice.register rejected', describeError(registerResult.error));
      return;
    }

    log.info(JSON.stringify({
      running: 'all variants',
      count: variantNames.length,
    }));

    const results: StepResult[] = [];

    for (const [index, name] of variantNames.entries()) {
      results.push(...await runVariant(name, voice, log));

      log.info(JSON.stringify({
        completedVariant: name,
        progress: `${index + 1}/${variantNames.length}`,
      }));

      // Let the audio session and system call UI settle before the next invite.
      if (index < variantNames.length - 1) {
        await delay(SETTLE_DELAY_MS);
      }
    }

    await safelySettlePromise(voice.unregister(token));

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
