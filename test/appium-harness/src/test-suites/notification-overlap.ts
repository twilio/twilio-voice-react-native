import * as React from 'react';
import { Platform } from 'react-native';
import { CallInvite, Voice } from '@twilio/voice-react-native-sdk';
import type { UseTestSuite } from '../test-suites';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

/**
 * Two concurrent incoming call notifications, and which call invite the
 * *first* notification's Reject button actually acts on.
 *
 * Android builds every notification PendingIntent with request code `0`
 * (`NotificationUtility.constructPendingIntentFor{Activity,Service}`).
 * PendingIntent identity is `(requestCode, Intent.filterEquals(...))`, and
 * `filterEquals` ignores extras - so the second invite's reject intent is
 * identical, by the framework's reckoning, to the first invite's. Combined
 * with `FLAG_UPDATE_CURRENT`, posting the second notification rewrites the
 * first notification's live extras to carry the second call's uuid.
 *
 * The first notification keeps showing caller A (its content was baked in at
 * build time and never re-posted) but its Reject button now rejects call B.
 *
 * This suite does not automate call origination or the notification tap - it
 * waits for a human to place two calls and press one button, then reports
 * which invite the SDK actually rejected. Android-only; iOS routes through
 * CallKit and has no equivalent path.
 *
 * Revisit with VBLOCKS-7044 when we can automate incoming calls.
 */

/**
 * How long to wait for a human to place each call into this client from
 * outside the harness (Twilio Console, another client, a REST call).
 */
const WAIT_FOR_CALL_INVITE_TIMEOUT_MS = 60_000;

/**
 * How long to wait for a human to press Reject on the first notification.
 */
const WAIT_FOR_REJECT_TIMEOUT_MS = 120_000;

type Labelled = { label: 'first' | 'second'; callInvite: CallInvite };

/**
 * Waits for the next incoming call invite, or resolves with `null` if none
 * arrives before `timeoutMs`. Always cleans up its listener.
 */
const waitForNextCallInvite = (
  voice: Voice,
  timeoutMs: number,
): Promise<CallInvite | null> =>
  new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      voice.off(Voice.Event.CallInvite, onCallInvite);
      resolve(null);
    }, timeoutMs);

    function onCallInvite(callInvite: CallInvite) {
      clearTimeout(timeoutId);
      resolve(callInvite);
    }

    voice.once(Voice.Event.CallInvite, onCallInvite);
  });

/**
 * Resolves with whichever of the two invites settles first, and how.
 *
 * Binds `Rejected` and `Accepted` on both invites so that a mis-wired
 * notification button is caught whichever button was pressed - pressing
 * Reject on the first notification and seeing the *second* invite emit
 * `Rejected` is the bug.
 */
const waitForFirstSettledInvite = (
  invites: Labelled[],
  timeoutMs: number,
) => new Promise<
  | { settled: 'rejected' | 'accepted'; label: 'first' | 'second' }
  | { settled: 'timeout' }
>((resolve) => {
  let settled = false;

  const teardown = () => {
    for (const { callInvite } of invites) {
      callInvite.removeAllListeners(CallInvite.Event.Rejected);
      callInvite.removeAllListeners(CallInvite.Event.Accepted);
    }
  };

  const settle = (
    result:
      | { settled: 'rejected' | 'accepted'; label: 'first' | 'second' }
      | { settled: 'timeout' },
  ) => {
    if (settled) {
      return;
    }
    settled = true;
    clearTimeout(timeoutId);
    teardown();
    resolve(result);
  };

  const timeoutId = setTimeout(() => {
    settle({ settled: 'timeout' });
  }, timeoutMs);

  for (const { label, callInvite } of invites) {
    callInvite.on(CallInvite.Event.Rejected, () => {
      settle({ settled: 'rejected', label });
    });
    callInvite.on(CallInvite.Event.Accepted, () => {
      settle({ settled: 'accepted', label });
    });
  }
});

/**
 * Notification overlap test suite.
 */
export const useNotificationOverlapTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    if (Platform.OS !== 'android') {
      log.error(JSON.stringify({
        message: 'notification-overlap-test is Android-only',
      }));
      setTestStatus('failure');
      return;
    }

    const registerResult = await safelySettlePromise(voice.register(token));
    if (registerResult.status === 'rejected') {
      log.error(JSON.stringify({
        message: 'voice.register rejected',
        error: String(registerResult.error),
      }));
      setTestStatus('failure');
      return;
    }

    const invites: Labelled[] = [];

    for (const label of ['first', 'second'] as const) {
      log.info(JSON.stringify({
        message:
          `place the ${label} call to this client now, and do NOT answer or ` +
          `dismiss it; waiting up to ${WAIT_FOR_CALL_INVITE_TIMEOUT_MS}ms`,
      }));

      const callInvite = await waitForNextCallInvite(
        voice,
        WAIT_FOR_CALL_INVITE_TIMEOUT_MS,
      );

      if (!callInvite) {
        log.error(JSON.stringify({
          message: `no ${label} call invite arrived before the window closed`,
        }));
        setTestStatus('failure');
        return;
      }

      log.info(JSON.stringify({
        received: label,
        callSid: callInvite.getCallSid(),
        from: callInvite.getFrom(),
      }));

      invites.push({ label, callInvite });
    }

    const [first, second] = invites;

    log.info(JSON.stringify({
      message:
        'both notifications should now be posted. Press REJECT on the ' +
        'FIRST/older notification (the one showing ' +
        `${first.callInvite.getFrom()}). Waiting up to ` +
        `${WAIT_FOR_REJECT_TIMEOUT_MS}ms`,
      expectRejected: first.callInvite.getCallSid(),
      buggyWouldReject: second.callInvite.getCallSid(),
    }));

    const outcome = await waitForFirstSettledInvite(
      invites,
      WAIT_FOR_REJECT_TIMEOUT_MS,
    );

    if (outcome.settled === 'timeout') {
      log.error(JSON.stringify({
        message: 'no invite settled; was the Reject button pressed?',
      }));
      setTestStatus('failure');
      await safelySettlePromise(voice.unregister(token));
      return;
    }

    const passed =
      outcome.settled === 'rejected' && outcome.label === 'first';

    log.info(JSON.stringify({
      outcome: passed ? 'passed' : 'failed',
      expected: { settled: 'rejected', label: 'first' },
      actual: outcome,
      note: passed
        ? 'the first notification rejected the first call invite'
        : 'the first notification acted on the wrong call invite - this is ' +
          'the PendingIntent request-code collision',
    }));

    // Leave no live invites behind for the next run.
    for (const { callInvite } of invites) {
      await safelySettlePromise(callInvite.reject());
    }
    await safelySettlePromise(voice.unregister(token));

    setTestStatus(passed ? 'success' : 'failure');
  }, [token, voice, log, setTestStatus]);

  return { perform };
};
