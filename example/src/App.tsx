import * as React from 'react';

import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Call, CallInvite, Voice } from 'twilio-voice-react-native';

const voice = new Voice();

const token = '';

const noOp = () => {};

interface CallMethods {
  disconnect: () => void;
  hold: () => void;
  mute: () => void;
  sendDigits: (digits: string) => void;
}

interface CallInfo {
  from: string;
  to: string;
  state: string;
  sid: string;
}

const getCallInfo = (call: Call) =>
  Promise.all([call.getFrom(), call.getSid(), call.getState(), call.getTo()]);

export default function App() {
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [registered, setRegistered] = React.useState<boolean>(false);
  const [callMethods, setCallMethods] = React.useState<
    CallMethods | undefined
  >();
  const [callInfo, setCallInfo] = React.useState<CallInfo | undefined>();
  const [callEvents, setCallEvents] = React.useState<
    Array<{ id: string; content: string }>
  >([]);
  const [outgoingTo, setOutgoingTo] = React.useState<string>('');
  const [isCallOnHold, setIsCallOnHold] = React.useState<boolean>(false);
  const [isCallMuted, setIsCallMuted] = React.useState<boolean>(false);

  const handleCall = React.useCallback(async (call: Call) => {
    const [from, sid, state, to] = await getCallInfo(call);

    Object.values(Call.Event).forEach((callEvent) => {
      call.on(callEvent, async () => {
        const [_from, _sid, _state, _to] = await getCallInfo(call);

        setCallEvents((_callEvents) => [
          ..._callEvents,
          {
            id: `${_callEvents.length}`,
            content: `${_sid}: ${callEvent}`,
          },
        ]);

        setCallInfo({
          from: _from,
          sid: _sid,
          state: _state,
          to: _to,
        });
      });
    });

    setCallMethods({
      disconnect: () => call.disconnect(),
      hold: () => {
        setIsCallOnHold((_isCallOnHold) => {
          call.hold(!_isCallOnHold);
          return !_isCallOnHold;
        });
      },
      mute: () => {
        setIsCallMuted((_isCallMuted) => {
          call.mute(!_isCallMuted);
          return !_isCallMuted;
        });
      },
      sendDigits: (digits: string) => call.sendDigits(digits),
    });

    setCallInfo({ from, sid, state, to });
  }, []);

  const connectHandler = React.useCallback(async () => {
    const call = await voice.connect(token, { to: outgoingTo });
    handleCall(call);
  }, [handleCall, outgoingTo]);

  const registerHandler = React.useCallback(() => {
    voice.register(token).then(() => {
      setRegistered(true);
      console.log('registered');
    });
  }, []);

  const unregisterHandler = React.useCallback(() => {
    voice.unregister(token).then(() => {
      setRegistered(false);
      console.log('unregistered');
    });
  }, []);

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);
    voice.on(Voice.Event.Registered, () => setRegistered(true));
    voice.on(Voice.Event.CallInvite, (_callInvite: CallInvite) => {
      // handling call invite
      // const call = callInvite.accept();
      // handleCall(call);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text>SDK Version: {String(sdkVersion)}</Text>
        <Text>Registered: {String(registered)}</Text>
      </View>
      {callInfo ? (
        <View>
          <Text>Call Info</Text>
          <Text>From: {String(callInfo.from)}</Text>
          <Text>To: {String(callInfo.to)}</Text>
          <Text>State: {String(callInfo.state)}</Text>
          <Text>Sid: {String(callInfo.sid)}</Text>
        </View>
      ) : null}
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
          {!callMethods || callInfo?.state === 'DISCONNECTED' ? (
            <Button title="Connect" onPress={connectHandler} />
          ) : (
            <Button title="Disconnect" onPress={callMethods.disconnect} />
          )}
        </View>
        <View style={styles.buttonContainer}>
          <View style={styles.halfButton}>
            <Button
              disabled={!callMethods}
              title={isCallMuted ? 'Unmute' : 'Mute'}
              onPress={callMethods?.mute || noOp}
            />
          </View>
          <View style={styles.halfButton}>
            <Button
              disabled={!callMethods}
              title={isCallOnHold ? 'Unhold' : 'Hold'}
              onPress={callMethods?.hold || noOp}
            />
          </View>
        </View>
        <View style={styles.button}>
          {registered ? (
            <Button title="Unregister" onPress={unregisterHandler} />
          ) : (
            <Button title="Register" onPress={registerHandler} />
          )}
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
  buttonContainer: {
    flexDirection: 'row',
  },
  halfButton: {
    flex: 1,
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
