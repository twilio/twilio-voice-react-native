import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { UseTestSuite } from '../test-suites';
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
      log.error(JSON.stringify(connectResult.error));
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

    call.on(Call.Event.ConnectFailure, () => {
      setTestStatus('failure');
    });

    call.on(Call.Event.Disconnected, (error) => {
      if (error) {
        setTestStatus('failure');
      } else {
        setTestStatus('success');
      }
    });

  }, [voice, log, token, setTestStatus]);

  return { perform };
}
