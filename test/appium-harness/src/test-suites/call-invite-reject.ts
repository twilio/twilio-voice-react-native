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
import {
  waitForCallEvent,
  waitForVoiceEvent,
} from '../utilities/wait-for-event';

/**
 * The failure path of `CallInvite.reject`.
 *
 * Attended. The tester places two calls to this client when prompted.
 *
 * `reject()` used to await the native promise directly. The native layer
 * reports a failure by resolving with a rejection envelope rather than by
 * rejecting, so a failed reject resolved and the caller could not tell. The
 * call now goes through `settleNativePromise`, so a native failure surfaces.
 * That path only exists at the bridge, so no mock reaches it.
 */

/** How long to wait for the tester to place a call. */
const MANUAL_ACTION_TIMEOUT_MS = 120_000;

/** How long to wait for `Call.Event.Disconnected` during teardown. */
const DISCONNECT_TIMEOUT_MS = 15_000;

/**
 * How long to let the native `Rejected` event arrive before the invite state is
 * read back. The event is what moves the state, and it arrives over the bridge
 * rather than with the promise.
 */
const REJECTED_SETTLE_DELAY_MS = 2_000;

/** Lets the system call UI settle between the two calls this suite needs. */
const SETTLE_DELAY_MS = 3_000;

/**
 * How long to wait for `CallInvite.Event.Accepted` after `accept()` resolves.
 *
 * This is a same-process bridge round trip, not a wait on a human, so it
 * should land in milliseconds under normal conditions. Bounded well below
 * `MANUAL_ACTION_TIMEOUT_MS` so a native regression here is reported as a
 * fast, clear failure rather than a two-minute hang.
 *
 * Not a nicety: `_state` only becomes `Accepted` once this event is
 * processed, so `reject-after-accept` cannot safely call `reject()` until it
 * has landed. See the KNOWN CRASH note below.
 */
const ACCEPTED_EVENT_TIMEOUT_MS = 5_000;

/**
 * Binds a `CallInvite` listener by event name.
 *
 * `Call`, `Voice`, `OutgoingCallMessage` and `PreflightTest` all declare a
 * generic `on(event, listener)` overload. `CallInvite` does not, so a value of
 * type `CallInvite.Event` matches none of its overloads. This cast is the whole
 * workaround, and works at runtime because the underlying emitter does not
 * care.
 *
 * TODO: VBLOCKS-7135 - add the generic overload and `Listener.Generic` to
 * `CallInvite`, then drop this cast.
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
 * Races one `CallInvite` event against a timeout. Resolves `true` if the
 * event landed first, `false` on timeout. Always unbinds its listener.
 */
const waitForInviteEvent = (
  callInvite: CallInvite,
  eventName: CallInvite.Event,
  timeoutMs: number,
): Promise<boolean> => new Promise((resolve) => {
  let settled = false;

  const settle = (didRaise: boolean) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    offInvite(callInvite, eventName, onEvent);
    resolve(didRaise);
  };

  const timeoutId = setTimeout(() => settle(false), timeoutMs);

  function onEvent() {
    settle(true);
  }

  onInvite(callInvite, eventName, onEvent);
});

/**
 * Logs an instruction the tester must act on.
 */
const prompt = (log: Log, action: string) => {
  log.warn(JSON.stringify({ TESTER_ACTION: action }));
};

/**
 * Prompts the tester and waits for the resulting `CallInvite`.
 *
 * The listener is bound before the prompt is logged, so a tester who acts
 * immediately cannot beat the listener to the event.
 */
const waitForInvite = async (
  voice: Voice,
  log: Log,
  action: string,
): Promise<CallInvite | null> => {
  const pendingInvite = waitForVoiceEvent(
    voice,
    Voice.Event.CallInvite,
    MANUAL_ACTION_TIMEOUT_MS,
  );

  prompt(log, action);

  const inviteArgs = await pendingInvite;

  return inviteArgs === null ? null : (inviteArgs[0] as CallInvite);
};

/**
 * CallInvite reject suite.
 */
export const useCallInviteRejectTest: UseTestSuite = (
  token,
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

    const fail = (message: string, note?: string) => {
      log.error(JSON.stringify({ message, note }));
      summarizeResults(results, log);
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

    const registerResult = await safelySettlePromise(voice.register(token));
    if (registerResult.status === 'rejected') {
      fail('voice.register rejected', describeError(registerResult.error));
      return;
    }

    // Phase 1. Reject twice.
    const firstInvite = await waitForInvite(
      voice,
      log,
      'place a call to this client now, then leave it ringing',
    );

    if (firstInvite === null) {
      fail('no CallInvite arrived', `waited ${MANUAL_ACTION_TIMEOUT_MS}ms`);
      await safelySettlePromise(voice.unregister(token));
      return;
    }

    let rejectedEventRaised = false;
    onInvite(firstInvite, CallInvite.Event.Rejected, () => {
      rejectedEventRaised = true;
    });

    await step('first-reject-resolves', async () => {
      await firstInvite.reject();
    });

    // Called in the same tick as the await above resolves. `_state` is only
    // set to `Rejected` by the handler for the native `Rejected` event, which
    // arrives over the bridge on a later tick, so the second call is still
    // `Pending` in JS and reaches native. On Android native then fails,
    // because the invite is gone. Before this change that native failure
    // resolved silently. Which of the two rejection paths wins is a race, so
    // the assertion is that the call rejected and the log records the path.
    const secondReject = await safelySettlePromise(firstInvite.reject());

    // KNOWN FAILING on iOS: `callInvite_reject` fires the CallKit end-call
    // transaction and resolves without checking that the invite exists or
    // waiting for the transaction result, so no native rejection path exists
    // and only the JS guard can fail. Passes on Android, where
    // `CallInviteModuleProxy.reject` looks up the call record first.
    // TODO: VBLOCKS-7159
    await step('second-reject-rejects', () => {
      const error = secondReject.status === 'rejected'
        ? secondReject.error
        : undefined;

      log.info(JSON.stringify({
        secondReject: secondReject.status,
        rejectionPath: secondReject.status !== 'rejected'
          ? 'none'
          : error instanceof TwilioErrors.InvalidStateError
            ? 'js-guard'
            : 'native',
        note: typeof error === 'undefined' ? undefined : describeError(error),
      }));

      expect(secondReject.status, 'the second reject()').toBe('rejected');
      expect(error, 'the second reject() rejection reason').toBeInstanceOf(
        TwilioErrors.TwilioError,
      );
    });

    await step('state-after-reject', async () => {
      await delay(REJECTED_SETTLE_DELAY_MS);

      expect(firstInvite.getState(), 'getState() after reject()').toBe(
        CallInvite.State.Rejected,
      );
      expect(
        rejectedEventRaised,
        'CallInvite.Event.Rejected was raised',
      ).toBe(true);
    });

    await delay(SETTLE_DELAY_MS);

    // Phase 2. Reject an invite that was already accepted.
    const secondInvite = await waitForInvite(
      voice,
      log,
      'place a second call to this client now, then leave it ringing',
    );

    if (secondInvite === null) {
      results.push({
        step: 'reject-after-accept',
        outcome: 'failed',
        note:
          `no second CallInvite arrived within ${MANUAL_ACTION_TIMEOUT_MS}ms`,
      });

      await safelySettlePromise(voice.unregister(token));

      const { failed } = summarizeResults(results, log);
      setTestStatus(failed === 0 ? 'success' : 'failure');
      return;
    }

    // Bound before `accept()` is called, so a fast bridge round trip cannot
    // raise the event before this is listening for it.
    const pendingAccepted = waitForInviteEvent(
      secondInvite,
      CallInvite.Event.Accepted,
      ACCEPTED_EVENT_TIMEOUT_MS,
    );

    const acceptResult = await safelySettlePromise(secondInvite.accept());

    results.push(
      acceptResult.status === 'rejected'
        ? {
            step: 'accept',
            outcome: 'failed',
            note: describeError(acceptResult.error),
          }
        : { step: 'accept', outcome: 'passed' },
    );

    // KNOWN CRASH on Android, VBLOCKS-7158:
    // `accept()`'s promise resolves before the native `Accepted` event is
    // processed, so `_state` is still `Pending` at that point. Calling
    // `reject()` before `_state` has actually become `Accepted` reaches
    // native on an invite whose call is simultaneously still connecting,
    // which crashes the whole app rather than rejecting. This step only
    // calls `reject()` once `Accepted` has actually been observed, so it
    // exercises the JS guard `reject()` is meant to test instead of racing
    // into the native crash.
    const didAccept = acceptResult.status === 'resolved'
      ? await pendingAccepted
      : false;

    await step('reject-after-accept', async () => {
      expect(
        didAccept,
        `CallInvite.Event.Accepted was raised within ` +
          `${ACCEPTED_EVENT_TIMEOUT_MS}ms of accept() resolving`,
      ).toBe(true);

      const result = await safelySettlePromise(secondInvite.reject());

      expect(result.status, 'reject() on an accepted invite').toBe('rejected');
      expect(
        result.status === 'rejected' ? result.error : undefined,
        'the rejection reason',
      ).toBeInstanceOf(TwilioErrors.InvalidStateError);
    });

    if (acceptResult.status === 'resolved') {
      const call = acceptResult.value;

      const pendingDisconnect = waitForCallEvent(
        call,
        Call.Event.Disconnected,
        DISCONNECT_TIMEOUT_MS,
      );

      await safelySettlePromise(call.disconnect());

      log.info(JSON.stringify({
        teardownDidDisconnect: await pendingDisconnect,
      }));
    }

    await safelySettlePromise(voice.unregister(token));

    const { failed } = summarizeResults(results, log);

    setTestStatus(failed === 0 ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
}
