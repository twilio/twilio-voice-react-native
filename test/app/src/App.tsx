import * as React from 'react';
import {
  Button,
  FlatList,
  ListRenderItemInfo,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVoice } from './hook';
import type { EventLogItem } from './type';
import Dialer from './Dialer';
import Grid from './Grid';

import { generateAccessToken } from './tokenUtility';

let token = '';
if (!token.length) {
  token = generateAccessToken();
}

export default function App() {
  const {
    registered,
    sdkVersion,
    events,
    callInfo,
    callMethod,
    recentCallInvite,
    connectHandler,
    preflightTestHandler,
    preflightTestMethods,
    registerHandler,
    unregisterHandler,
    logAudioDevicesHandler,
    selectAudioDeviceHandler,
    getCallsHandler,
    getCallInvitesHandler,
  } = useVoice(token);

  const headerComponent = React.useMemo(
    () => (
      <Grid
        gridComponents={[
          [
            <Text testID="sdk_version">SDK Version: {String(sdkVersion)}</Text>,
            <Text>Registered: {String(registered)}</Text>,
          ],
        ]}
      />
    ),
    [sdkVersion, registered]
  );

  const callComponent = React.useMemo(
    () => (
      <Grid
        gridComponents={[
          [
            <Text>Call From: {String(callInfo?.from)}</Text>,
            <Text>Call To: {String(callInfo?.to)}</Text>,
          ],
          [<Text>Call State: {String(callInfo?.state)}</Text>],
          [<Text>Call SID: {String(callInfo?.sid)}</Text>],
        ]}
      />
    ),
    [callInfo]
  );

  const preflightTestButtons = React.useMemo(() => (
    <Grid horizontalGapSize={5} verticalGapSize={5} gridComponents={[
      [
        <Button onPress={preflightTestHandler} title="Start Preflight" />,
        <Button onPress={preflightTestMethods.stop} title="Stop Preflight" />,
      ],
      [
        <Button onPress={preflightTestMethods.getStartTime} title="getStartTime" />,
        <Button onPress={preflightTestMethods.getEndTime} title="getEndTime" />,
      ],
      [
        <Button onPress={preflightTestMethods.getCallSid} title="getCallSid" />,
        <Button onPress={preflightTestMethods.getState} title="getState" />,
      ],
      [
        <Button onPress={preflightTestMethods.getLatestSample} title="getLatestSample" />,
        <Button onPress={preflightTestMethods.getReport} title="getReport" />,
      ],
    ]} />
    ), [preflightTestHandler, preflightTestMethods]);

  const callInviteComponent = React.useMemo(
    () => (
      <Grid
        gridComponents={[
          [
            <Text>Call Invite From: {String(recentCallInvite?.from)}</Text>,
            <Text>Call Invite To: {String(recentCallInvite?.to)}</Text>,
          ],
          [<Text>Call Invite SID: {String(recentCallInvite?.callSid)}</Text>],
        ]}
      />
    ),
    [recentCallInvite]
  );

  const eventLogItemRender = React.useCallback(
    (info: ListRenderItemInfo<EventLogItem>) => (
      <Text>{info.item.content + '\n'}</Text>
    ),
    []
  );

  const [eventLogFormat, setEventLogFormat] = React.useState(true);

  const getOngoingButtons = React.useMemo(
    () => [
      <Button title={'Get Calls'} onPress={getCallsHandler} />,
      <Button title={'Get Call Invites'} onPress={getCallInvitesHandler} />,
    ],
    [getCallsHandler, getCallInvitesHandler]
  );

  const registrationButtons = React.useMemo(
    () => [
      <Button title={'Register'} onPress={registerHandler} />,
      <Button title={'Unregister'} onPress={unregisterHandler} />,
    ],
    [registerHandler, unregisterHandler]
  );

  const audioDeviceButtons = React.useMemo(
    () => [
      <Button title={'Log Audio Devices'} onPress={logAudioDevicesHandler} />,
      <Button
        title={'Select Next Audio Device'}
        onPress={selectAudioDeviceHandler}
      />,
    ],
    [logAudioDevicesHandler, selectAudioDeviceHandler]
  );

  return (
    <SafeAreaView style={styles.expand}>
      <View style={styles.padded}>
        <Text testID="app_info">App Info</Text>
        {headerComponent}
      </View>
      <View style={styles.padded}>
        <Text>Call Info</Text>
        {callComponent}
      </View>
      <View style={styles.padded}>
        <Text>Call Invite</Text>
        {callInviteComponent}
      </View>
      <View style={composedStyles.events}>
        <View style={styles.eventsButtons}>
          <Text>Events</Text>
          <Button
            title="Toggle Log Format"
            onPress={() => setEventLogFormat((_f) => !_f)}
          />
        </View>
        <View style={composedStyles.eventsList}>
          {eventLogFormat ? (
            <FlatList
              testID="event_log"
              data={events}
              renderItem={eventLogItemRender}
            />
          ) : (
            <Text testID="event_log" style={styles.eventLog}>
              {JSON.stringify(events)}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.padded}>
        <Grid
          verticalGapSize={5}
          gridComponents={[
            [
              <Dialer
                callInfo={callInfo}
                callMethod={callMethod}
                onConnect={connectHandler}
                recentCallInvite={recentCallInvite}
              />,
            ],
            [preflightTestButtons],
            registrationButtons,
            audioDeviceButtons,
            getOngoingButtons,
          ]}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  expand: {
    flex: 1,
  },
  eventsList: {
    backgroundColor: 'rgba(0, 0, 0, .15)',
  },
  padded: {
    padding: 5,
  },
  eventsButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventLog: {
    fontSize: 9,
  },
});

const composedStyles = {
  events: [styles.expand, styles.padded],
  eventsList: [styles.expand, styles.eventsList],
};
