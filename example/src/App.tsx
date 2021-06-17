import * as React from 'react';

import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Call, Voice, RegistrationChannel } from 'twilio-voice-react-native';

const voice = new Voice('token');

const noOp = () => {};

interface CallInterface {
  disconnect: () => void;
  hold: () => void;
  mute: () => void;
  sendDigits: (digits: string) => void;
  from: string;
  to: string;
  state: string;
  sid: string;
}

export default function App() {
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [registered, setRegistered] = React.useState<boolean>(false);
  const [callInterface, setCallInterface] = React.useState<
    CallInterface | undefined
  >();
  const [callEvents, setCallEvents] = React.useState<
    Array<{ id: string; content: string }>
  >([]);
  const [outgoingTo, setOutgoingTo] = React.useState<string>('');

  const connectHandler = React.useCallback(() => {
    voice.connect({ to: outgoingTo }).then(async (call) => {
      Object.values(Call.Event).forEach((callEvent) => {
        call.on(callEvent, () => {
          setCallEvents((_callEvents) => [
            ..._callEvents,
            {
              id: `${_callEvents.length}`,
              content: callEvent,
            },
          ]);
        });
      });

      const [from, to, state, sid] = await Promise.all([
        call.getFrom(),
        call.getTo(),
        call.getState(),
        call.getSid(),
      ]);

      setCallInterface({
        disconnect: () => call.disconnect(),
        hold: () => call.hold(),
        mute: () => call.mute(),
        sendDigits: (digits: string) => call.sendDigits(digits),
        from,
        to,
        state,
        sid,
      });
    });
  }, [outgoingTo]);

  const registerHandler = React.useCallback(() => {
    voice.register('foobar-device-token', RegistrationChannel.FCM);
  }, []);

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);
    voice.on(Voice.Event.Registered, () => setRegistered(true));
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>SDK Version {sdkVersion}</Text>
        <Text>Registered: {String(registered)}</Text>
      </View>
      <View style={styles.eventsContainer}>
        <Text>Events</Text>
        <FlatList
          style={styles.eventsList}
          data={callEvents}
          renderItem={(info) => <Text>{info.item.content}</Text>}
        />
      </View>
      <View>
        <View style={styles.input}>
          <Text>To: </Text>
          <TextInput
            style={styles.textInput}
            value={outgoingTo}
            onChangeText={(text) => setOutgoingTo(text)}
          />
        </View>
      </View>
      <View>
        <View style={styles.button}>
          <Button title="Connect" onPress={connectHandler} />
        </View>
        <View style={styles.button}>
          <Button
            title="Disconnect"
            onPress={callInterface?.disconnect || noOp}
          />
        </View>
        <View style={styles.button}>
          <Button title="Register" onPress={registerHandler} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  button: {
    padding: 5,
  },
  eventsContainer: {
    flex: 1,
    padding: 10,
  },
  eventsList: {
    backgroundColor: 'rgba(0, 0, 0, .15)',
    padding: 10,
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  textInput: {
    flex: 1,
    borderWidth: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    paddingTop: 20,
  },
});
