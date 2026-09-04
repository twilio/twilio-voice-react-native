import * as React from 'react';
import { Button, Platform, Text, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useVoice } from '../hooks/useVoice';
import { useLogging } from '../hooks/useLogging';
import { useAudioDeviceTest } from '../test-suites/audio-device';
import { useCallControlsTest } from '../test-suites/call-controls';
import { useCallInviteRejectTest } from '../test-suites/call-invite-reject';
import { useCallMessageTest } from '../test-suites/call-message';
import { useConnectOptionsTest } from '../test-suites/connect-options';
import { useErrorsTest } from '../test-suites/errors';
import { useIncomingCallManualTest } from '../test-suites/incoming-call-manual';
import { useOutgoingCallTest } from '../test-suites/outgoing-call';
import { useIceTest } from '../test-suites/outgoing-ice';
import { useIncomingIceTest } from '../test-suites/incoming-ice';
import { usePreflightTest } from '../test-suites/preflight-test';
import { usePreflightEarlyStateTest } from '../test-suites/preflight-test-early-state';
import { useQualityWarningsTest } from '../test-suites/quality-warnings';
import { useRegistrationTest } from '../test-suites/registration';
import { useRtcStatsTest } from '../test-suites/rtc-stats';
import { useVoiceApiTest } from '../test-suites/voice-api';
import { TestStatus } from '../test-suites';
import { getToken } from '../utilities/token/get-token';
import { getDefaultTestSuiteId } from '../utilities/config/get-config';

/**
 * NOTE: VBLOCKS-6582
 * As part of increasing code coverage, consider refactoring the command-bus
 * so that instead of starting whole test suites via the bus
 * ("outgoing-call-test"), we use more granular commands such as
 * "call.connect(...)".
 */

type UNATTENDED_TEST_SUITE_ID =
  | 'audio-device'
  | 'call-controls'
  | 'call-invite-reject'
  | 'call-message'
  | 'preflight-test'
  | 'preflight-test-early-state'
  | 'registration-test'
  | 'quality-warnings-test'
  | 'rtc-stats-test'
  | 'outgoing-call-test'
  | 'incoming-ice-test'
  | 'voice-api-test'
  | 'errors-test'
  | 'connect-options-test'
  | 'ice-test';

type ATTENDED_TEST_SUITE_ID =
  | 'incoming-call-manual'

export const Application = () => {
  // Intentional that we use the preflight test token by default for all suites
  // here. We're reusing the token generation for the other test apps and the
  // preflight test token works best here.
  const [token, setToken] = React.useState<string>(getToken);
  const [testSuiteId, setTestSuiteId] =
    React.useState<string>(getDefaultTestSuiteId);
  const [testStatus, setTestStatus] = React.useState<TestStatus>('not-started');

  const logging = useLogging();

  const voice = useVoice(logging);

  const audioDeviceTest =
    useAudioDeviceTest(token, voice, logging, setTestStatus);
  const callControlsTest =
    useCallControlsTest(token, voice, logging, setTestStatus);
  const callInviteRejectTest =
    useCallInviteRejectTest(token, voice, logging, setTestStatus);
  const callMessageTest =
    useCallMessageTest(token, voice, logging, setTestStatus);
  const preflightTest =
    usePreflightTest(token, voice, logging, setTestStatus);
  const preflightEarlyStateTest =
    usePreflightEarlyStateTest(token, voice, logging, setTestStatus);
  const voiceApiTest =
    useVoiceApiTest(token, voice, logging, setTestStatus);
  const registrationTest =
    useRegistrationTest(token, voice, logging, setTestStatus);
  const errorsTest =
    useErrorsTest(token, voice, logging, setTestStatus);
  const qualityWarningsTest =
    useQualityWarningsTest(token, voice, logging, setTestStatus);
  const rtcStatsTest =
    useRtcStatsTest(token, voice, logging, setTestStatus);
  const connectOptionsTest =
    useConnectOptionsTest(token, voice, logging, setTestStatus);
  const outgoingCallTest =
    useOutgoingCallTest(token, voice, logging, setTestStatus);
  const iceTest =
    useIceTest(token, voice, logging, setTestStatus);
  const incomingIceTest =
    useIncomingIceTest(token, voice, logging, setTestStatus);
  const incomingCallManualTest =
    useIncomingCallManualTest(token, voice, logging, setTestStatus);

  const performTest = React.useCallback(() => {
    if (testStatus !== 'not-started') {
      logging.log.error(JSON.stringify({
        message: 'test state not clean, to run another test refresh the JS ' +
          'runtime by closing and reopening the app, or restarting the JS ' +
          'runtime through the Metro bundler',
      }));
      return;
    }

    if (token.length === 0) {
      logging.log.error(JSON.stringify({
        message: 'no token, either bundle one or pass it via the UI'
      }));
      setTestStatus('failure');
      return;
    }

    const suites: Record<TEST_SUITE_ID, () => Promise<void>> = {
      'incoming-call-test-manual': incomingCallManualTest.perform,
      'audio-device-test': audioDeviceTest.perform,
      'call-controls-test': callControlsTest.perform,
      'call-invite-reject-test': callInviteRejectTest.perform,
      'call-message-test': callMessageTest.perform,
      'preflight-test': preflightTest.perform,
      'preflight-early-state-test': preflightEarlyStateTest.perform,
      'voice-api-test': voiceApiTest.perform,
      'registration-test': registrationTest.perform,
      'errors-test': errorsTest.perform,
      'quality-warnings-test': qualityWarningsTest.perform,
      'rtc-stats-test': rtcStatsTest.perform,
      'connect-options-test': connectOptionsTest.perform,
      'outgoing-call-test': outgoingCallTest.perform,
      'ice-test': iceTest.perform,
      'incoming-ice-test': incomingIceTest.perform,
    };

    // `hasOwnProperty` rather than a plain lookup so that a suite id naming an
    // inherited `Object.prototype` member - `toString`, `valueOf`,
    // `constructor` - does not resolve to that member and skip the guard below.
    const perform = Object.prototype.hasOwnProperty.call(suites, testSuiteId)
      ? (suites[testSuiteId as TEST_SUITE_ID] as
          | (() => Promise<void>)
          | undefined)
      : undefined;

    if (typeof perform === 'undefined') {
      logging.log.error(JSON.stringify({
        message: `invalid suite passed "${testSuiteId}"`,
      }));
      setTestStatus('failure');
      return;
    }

    // Logged before the suite runs so the log records which suite produced it.
    // A log file that was named incorrectly can still be identified from this
    // entry rather than by reading the suite's steps and inferring the suite
    // from them.
    logging.log.info(JSON.stringify({
      message: 'starting test suite',
      testSuiteId,
      platform: Platform.OS,
      startedAt: new Date().toISOString(),
    }));

    // Consider cleaning up all the suite-specific rejections and handle them
    // all here via a safelySettlePromise.
    // Also consider adding a generic timeout-race here so no test hangs
    // indefinitely.
    //
    // TODO: VBLOCKS-7138
    return perform();
  }, [
    audioDeviceTest.perform,
    callControlsTest.perform,
    callInviteRejectTest.perform,
    callMessageTest.perform,
    preflightTest.perform,
    preflightEarlyStateTest.perform,
    voiceApiTest.perform,
    registrationTest.perform,
    errorsTest.perform,
    qualityWarningsTest.perform,
    rtcStatsTest.perform,
    connectOptionsTest.perform,
    outgoingCallTest.perform,
    iceTest.perform,
    incomingIceTest.perform,
    incomingCallManualTest.perform,
    logging.log,
    setTestStatus,
    testSuiteId,
  ]);

  return (
    <SafeAreaView>
      <Text>Twilio Access Token</Text>
      <TextInput
        testID='textInput_token'
        placeholder='Enter Token'
        secureTextEntry={true}
        value={token}
        onChangeText={setToken}
      />

      <Text>Test Suite ID</Text>
      <TextInput
        testID='textInput_testSuiteId'
        placeholder='Enter Test Suite ID'
        value={testSuiteId}
        onChangeText={(text) => setTestSuiteId(text)}
      />

      <Text>Test Suite Status</Text>
      <Text testID='text_testSuiteStatus'>
        {testStatus}
      </Text>

      <Button
        testID='button_startTestSuite'
        title='Start Test Suite'
        disabled={testStatus !== 'not-started'}
        onPress={performTest}
      />

      <Text>Test Suite Output</Text>
      <Text>{JSON.stringify(logging.logEntries, null, 2)}</Text>
    </SafeAreaView>
  );
};

export default Application;
