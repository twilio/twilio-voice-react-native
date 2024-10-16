import * as React from 'react';
import { Button, Text, View } from 'react-native';
import { Call, Voice } from '@twilio/voice-react-native-sdk';
import { generateAccessToken } from '../tokenUtility';

type TestStatus = 'not-started' | 'running' | 'success' | 'failed';

type TestHook = () => { status: TestStatus; run: () => Promise<void> };

async function settlePromise<T>(
  p: Promise<T>
): Promise<{ result: 'ok' | 'err'; value: T }> {
  return p
    .then((value) => ({ result: 'ok' as const, value }))
    .catch((value) => ({ result: 'err' as const, value }));
}

const useOutgoingCallTest: TestHook = () => {
  const testId = React.useMemo(() => Date.now(), []);
  const voice = React.useMemo(() => new Voice(), []);
  const accessToken = React.useMemo(() => generateAccessToken(), []);

  const [status, setStatus] = React.useState<TestStatus>(() => 'not-started');

  const run = React.useCallback(async () => {
    setStatus('running');

    const call = await voice.connect(accessToken);

    const connectedPromise = new Promise<'connected'>((resolve) => {
      call.on(Call.Event.Connected, () => {
        console.log(testId, 'call event connected');
        resolve('connected');
      });
    });

    const connectFailurePromise = new Promise<'connectFailure'>((resolve) => {
      call.on(Call.Event.ConnectFailure, (error) => {
        console.log(testId, 'call event connectFailure', error);
        resolve('connectFailure');
      });
    });

    const callStatus = await Promise.any([
      connectedPromise,
      connectFailurePromise,
    ]);

    if (callStatus === 'connectFailure') {
      setStatus('failed');
      return;
    }

    await new Promise((resolve) => {
      setTimeout(resolve, 5000);
    });

    const disconnectResult = await settlePromise(call.disconnect());
    if (disconnectResult.result === 'err') {
      setStatus('failed');
      console.log(testId, 'disconnect promise failed', disconnectResult.value);
      return;
    }

    setStatus('success');
  }, [accessToken, testId, voice]);

  return { run, status };
};

export default function OutgoingCallTest() {
  const { run, status } = useOutgoingCallTest();

  return (
    <View>
      <Text accessible={true} accessibilityLabel="testName">
        outgoingCallTest
      </Text>
      <Button accessibilityLabel="runTest" title="Run Test" onPress={run} />
      <Text accessible={true} accessibilityLabel="testStatus">
        {status}
      </Text>
    </View>
  );
}
