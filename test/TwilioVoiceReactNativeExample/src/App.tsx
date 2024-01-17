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
            <Text>SDK Version: {String(sdkVersion)}</Text>,
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
            <Text>From: {String(callInfo?.from)}</Text>,
            <Text>To: {String(callInfo?.to)}</Text>,
          ],
          [<Text>State: {String(callInfo?.state)}</Text>],
          [<Text>SID: {String(callInfo?.sid)}</Text>],
        ]}
      />
    ),
    [callInfo]
  );

  const callInviteComponent = React.useMemo(
    () => (
      <Grid
        gridComponents={[
          [
            <Text>From: {String(recentCallInvite?.from)}</Text>,
            <Text>To: {String(recentCallInvite?.to)}</Text>,
          ],
          [<Text>Call SID: {String(recentCallInvite?.callSid)}</Text>],
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
        <Text>App Info</Text>
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
        <Text>Events</Text>
        <View style={composedStyles.eventsList}>
          <FlatList data={events} renderItem={eventLogItemRender} />
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
});

const composedStyles = {
  events: [styles.expand, styles.padded],
  eventsList: [styles.expand, styles.eventsList],
};
