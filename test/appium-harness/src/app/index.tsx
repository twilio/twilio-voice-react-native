import * as React from 'react';
import { Button, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoice } from '../hooks/useVoice';
import { useLogging } from '../hooks/useLogging';
import { useOutgoingCallTest } from '../test-suites/outgoing-call';
import { TestStatus } from '../test-suites';

export const Application = () => {
  const [token, setToken] = React.useState<string>('');
  const [testSuiteId, setTestSuiteId] = React.useState<string>('');
  const [testStatus, setTestStatus] = React.useState<TestStatus>('not-started');

  const voice = useVoice();
  const logging = useLogging();

  const outgoingCallTest =
    useOutgoingCallTest(token, voice, logging, setTestStatus);

  const performTest = React.useCallback(() => {
    switch (testSuiteId) {
      case 'outgoing-call-test': {
        return outgoingCallTest.perform();
      }
      default: {
        return;
      }
    }
  }, [outgoingCallTest.perform, testSuiteId]);

  return <SafeAreaView>
    <Text>Twilio Access Token</Text>
    <TextInput
      testID='textInput_token'
      placeholder='Enter Token'
      secureTextEntry={true}
      onChangeText={setToken}
    />

    <Text>Test Suite ID</Text>
    <TextInput
      testID='textInput_testSuiteId'
      placeholder='Enter Test Suite ID'
      onChangeText={setTestSuiteId}
    />

    <Text>Test Suite Status</Text>
    <Text testID='text_testSuiteStatus'>
      {testStatus}
    </Text>

    <Button
      testID='button_startTestSuite'
      title='Start Test Suite'
      onPress={performTest}
    />

    <Text>Test Suite Output</Text>
    <Text>{JSON.stringify(logging.logEntries, null, 2)}</Text>
  </SafeAreaView>
};

export default Application;
