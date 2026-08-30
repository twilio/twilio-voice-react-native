import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { UseTestSuite } from '../test-suites';
import { describeError, summarizeResults } from '../utilities/run-steps';
import { safelySettlePromise } from '../utilities/safely-settle-promise';

type CallEvent = { eventName: Call.Event; args: any[] };

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

      const { failed } = summarizeResults(
        [{ step: 'outgoing-call', outcome, note }],
        log,
      );

      setTestStatus(failed === 0 ? 'success' : 'failure');
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

  }, [voice, log, token, setTestStatus]);

  return { perform };
}
