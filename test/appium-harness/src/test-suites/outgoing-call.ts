import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { UseTestSuite } from '../test-suites';
import {
  describeError,
  statusFromSummary,
  summarizeResults,
} from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

type CallEvent = { eventName: Call.Event; args: any[] };

/**
 * How long to stay connected before hanging up. Long enough for media to be
 * flowing and a quality-warning cycle to be observed, short enough to keep the
 * suite quick.
 */
const CONNECTED_HOLD_MS = 5_000;

/**
 * Ceiling for the whole suite, comfortably under the orchestrator's per-suite
 * timeout so a failure here is reported with detail rather than as an opaque
 * orchestrator timeout. Resolves VBLOCKS-7138.
 */
const OUTGOING_CALL_TIMEOUT_MS = 60_000;

export const useOutgoingCallTest: UseTestSuite = (
  token,
  { voice },
  { log },
  setTestStatus,
) => {
  const perform = React.useCallback(async () => {
    setTestStatus('in-progress');

    const raisedCallEvents: CallEvent[] = [];

    const connectResult = await safelySettlePromise(voice.connect(token));
    if (connectResult.status === 'rejected') {
      const errorMessage = connectResult.error instanceof Error
        ? JSON.stringify({
            name: connectResult.error.name,
            message: connectResult.error.message,
            cause: connectResult.error.cause,
            stack: connectResult.error.stack,
          })
        : String(connectResult.error);

      log.error(errorMessage);
      setTestStatus('failure');
      return;
    }

    const call = connectResult.value;

    const bindOnCallEvent = (eventName: Call.Event) => (...args: any[]) => {
      const callEvent = { eventName, args };
      log.info(JSON.stringify(callEvent));
      raisedCallEvents.push(callEvent);
    };

    Object.values(Call.Event).forEach((eventName) => {
      call.on(eventName, bindOnCallEvent(eventName));
    });

    let settled = false;

    const settle = (outcome: 'passed' | 'failed', note?: string) => {
      if (settled) {
        return;
      }
      settled = true;

      log.info(JSON.stringify({
        raisedEvents: raisedCallEvents.map(({ eventName }) => eventName),
      }));

      const { failed, blocked } = summarizeResults(
        [{ step: 'outgoing-call', outcome, note }],
        log,
      );

      setTestStatus(statusFromSummary({ failed, blocked }));
    };

    call.on(Call.Event.ConnectFailure, (error) => {
      settle('failed', `connect failure: ${describeError(error)}`);
    });

    call.on(Call.Event.Disconnected, (error) => {
      if (error) {
        settle('failed', `disconnected with error: ${describeError(error)}`);
        return;
      }
      settle('passed');
    });

    /**
     * Hang up once the call is up, rather than waiting for the far end to.
     *
     * Observed: the TwiML endpoint echoes indefinitely and never hangs up, so
     * the call stayed connected and the suite ran until the orchestrator's
     * ceiling, presenting as a product hang. Ending the call here makes the
     * suite independent of far-end behaviour, which is what call-controls-test
     * already does.
     */
    call.once(Call.Event.Connected, () => {
      setTimeout(() => {
        if (!settled) {
          void safelySettlePromise(call.disconnect());
        }
      }, CONNECTED_HOLD_MS);
    });

    /**
     * Backstop, so a call that never reaches Connected, or never raises
     * Disconnected after disconnect(), fails with a readable note rather than
     * running out the orchestrator's clock.
     */
    setTimeout(() => {
      settle(
        'failed',
        `call did not disconnect within ${OUTGOING_CALL_TIMEOUT_MS}ms; raised: ` +
          `${raisedCallEvents.map(({ eventName }) => eventName).join(', ') || 'nothing'}`,
      );
    }, OUTGOING_CALL_TIMEOUT_MS);

  }, [voice, log, token, setTestStatus]);

  return { perform };
}
