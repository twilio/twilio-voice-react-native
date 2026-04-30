import * as React from 'react';
import { Button, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoice } from '../hooks/useVoice';
import { useLogging } from '../hooks/useLogging';
import { useOutgoingCallTest } from '../test-suites/outgoing-call';

export const Application = () => {
  const [token, setToken] = React.useState<string>('');
  const voice = useVoice();
  const logging = useLogging();

  const outgoingCallTest = useOutgoingCallTest(token, voice, logging);

  return <SafeAreaView>
    <Text>Twilio Access Token</Text>
    <TextInput
      testID='textInput_token'
      placeholder='Enter Token'
      secureTextEntry={true}
      onChangeText={setToken}
    />

    <Text>Test Suite Status</Text>
    <Text testID='text_testSuiteStatus'>
      {outgoingCallTest.status}
    </Text>

    <Button
      testID='button_startTestSuite'
      title='Start Test Suite'
      onPress={outgoingCallTest.perform}
    />

    <Text>Test Suite Output</Text>
    <Text>{JSON.stringify(logging.logEntries, null, 2)}</Text>
  </SafeAreaView>
};

export default Application;
