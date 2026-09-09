import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { UseTestSuite } from '../test-suites';
import { describeError, summarizeResults } from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

type CallEvent = { eventName: Call.Event; args: any[] };

/**
 * Places one outgoing call and waits for the far end to end it.
 *
 * `perform` resolves only once the call has settled, which every other suite
 * here also does. That contract is what lets `unattended-all` run suites back
 * to back: the runner treats a resolved `perform` as the suite being finished,
 * so a suite that resolved while still working would have its result read too
 * early and would leave a live call running into the next suite.
 *
 * This suite has no timeout of its own. It expects the default TwiML to hang
 * up eventually, which is not guaranteed. Run under `unattended-all` the
 * runner's per-suite timeout bounds it; run on its own it can wait forever.
 *
 * TODO: VBLOCKS-7138 - give this suite its own timeout so a single-suite run
 * is bounded too.
 */
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

    // The definite-assignment assertion is load-bearing: a Promise executor
    // runs synchronously, so `resolveSettled` is assigned before anything can
    // read it, but TypeScript does not track assignments made inside a
    // callback.
    let resolveSettled!: () => void;
    const settledPromise = new Promise<void>((resolve) => {
      resolveSettled = resolve;
    });

    const settle = (outcome: 'passed' | 'failed', note?: string) => {
      if (settled) {
        return;
      }
      settled = true;

      log.info(JSON.stringify({
        raisedEvents: raisedCallEvents.map(({ eventName }) => eventName),
      }));

      const { failed } = summarizeResults(
        [{ step: 'outgoing-call', outcome, note }],
        log,
      );

      setTestStatus(failed === 0 ? 'success' : 'failure');
      resolveSettled();
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

    // Held open until the call settles, so that resolving `perform` means the
    // suite is finished rather than only that its listeners are bound.
    await settledPromise;
  }, [voice, log, token, setTestStatus]);

  return { perform };
}
