import * as React from 'react';
import {
  Button,
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useVoice } from './hook';
import type { EventLogItem } from './type';
import Grid from './Grid';

import { generatePreflightAccessToken } from './tokenUtility';

let token = '';
if (!token.length) {
  token = generatePreflightAccessToken();
}

export const PreflightTestSuite = () => {
  const {
    events,
    preflightTestHandler,
    invalidTokenPreflightTestHandler,
    preflightTestMethods,
  } = useVoice(token);

  const eventLogItemRender = React.useCallback(
    (info: ListRenderItemInfo<EventLogItem>) => (
      <Text>{info.item.content + '\n'}</Text>
    ),
    []
  );

  const [eventLogFormat, setEventLogFormat] = React.useState(true);

  const preflightTestButtons = React.useMemo(() => (
    <Grid horizontalGapSize={5} verticalGapSize={5} gridComponents={[
      [<Button onPress={preflightTestHandler} title="Start Preflight" />],
      [<Button onPress={preflightTestMethods.stop} title="Stop Preflight" />],
      [<Button onPress={invalidTokenPreflightTestHandler} title="Invalid Preflight" />],
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
    ), [preflightTestHandler, invalidTokenPreflightTestHandler, preflightTestMethods]);

  return (
    <View style={styles.expand}>
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
            [preflightTestButtons],
          ]}
        />
      </View>
    </View>
  );
};

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
