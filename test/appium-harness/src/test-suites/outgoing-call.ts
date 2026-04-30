import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { TestStatus, TestSuite } from '../test-suites';

type CallEvent = { eventName: Call.Event; args: any[] };

export const useOutgoingCallTest: TestSuite = (
  token,
  { voice },
  { log }
) => {
  const [status, setStatus] = React.useState<TestStatus>('not-started');

  const perform = React.useCallback(async () => {
    setStatus('in-progress');

    const raisedCallEvents: CallEvent[] = [];

    const call = await voice.connect(token);

    const bindOnCallEvent = (eventName: Call.Event) => (...args: any[]) => {
      const callEvent = { eventName, args };
      log.info(JSON.stringify(callEvent));
      raisedCallEvents.push(callEvent);
    };

    Object.values(Call.Event).forEach((eventName) => {
      call.on(eventName, bindOnCallEvent(eventName));
    });

    call.on(Call.Event.ConnectFailure, (error) => {
      setStatus('failure');
    });

    call.on(Call.Event.Disconnected, (error) => {
      if (error) {
        setStatus('failure');
      } else {
        setStatus('success');
      }
    });

  }, [voice, log, token, setStatus]);

  return { perform, status };
}
