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

const token = '';

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
  } = useVoice(token);

  const headerComponents = React.useMemo(
    () => [
      [
        <Text>SDK Version: {String(sdkVersion)}</Text>,
        <Text>Registered: {String(registered)}</Text>,
      ],
    ],
    [sdkVersion, registered]
  );

  const callGridComponents = React.useMemo(
    () => [
      [
        <Text>From: {String(callInfo?.from)}</Text>,
        <Text>To: {String(callInfo?.to)}</Text>,
      ],
      [<Text>State: {String(callInfo?.state)}</Text>],
      [<Text>SID: {String(callInfo?.sid)}</Text>],
    ],
    [callInfo]
  );

  const callInviteComponents = React.useMemo(
    () => [
      [
        <Text>From: {String(recentCallInvite?.from)}</Text>,
        <Text>To: {String(recentCallInvite?.to)}</Text>,
      ],
      [<Text>Call SID: {String(recentCallInvite?.callSid)}</Text>],
    ],
    [recentCallInvite]
  );

  const eventLogItemRender = React.useCallback(
    (info: ListRenderItemInfo<EventLogItem>) => (
      <Text>{info.item.content + '\n'}</Text>
    ),
    []
  );

  const registrationButton = React.useMemo(() => {
    const [title, handler] = registered
      ? ['Unregister', unregisterHandler]
      : ['Register', registerHandler];
    return <Button title={title} onPress={handler} />;
  }, [registerHandler, registered, unregisterHandler]);

  return (
    <SafeAreaView style={styles.expand}>
      <View style={styles.padded}>
        <Text>App Info</Text>
        <Grid gridComponents={headerComponents} />
      </View>
      <View style={styles.padded}>
        <Text>Call Info</Text>
        <Grid gridComponents={callGridComponents} />
      </View>
      <View style={styles.padded}>
        <Text>Call Invite</Text>
        <Grid gridComponents={callInviteComponents} />
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
            [registrationButton],
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
