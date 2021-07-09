import * as React from 'react';

import {
  Button,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  Call,
  CallInvite,
  CanceledCallInvite,
  Voice,
} from 'twilio-voice-react-native';

const voice = new Voice();

const token = '';

const noOp = () => {};

interface CallMethod {
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

interface BoundCallInvite {
  accept: () => void;
  callSid: string;
  from: string;
  to: string;
  reject: () => void;
}

const getCallInfo = (call: Call) =>
  Promise.all([call.getFrom(), call.getSid(), call.getState(), call.getTo()]);

export default function App() {
  const [registered, setRegistered] = React.useState<boolean>(false);
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [digits, setDigits] = React.useState<string>('');
  const [callInfo, setCallInfo] = React.useState<CallInfo | undefined>();
  const [callInvites, setCallInvites] = React.useState<Array<BoundCallInvite>>(
    []
  );
  const [callMethods, setCallMethods] = React.useState<
    CallMethod | undefined
  >();
  const [events, setEvents] = React.useState<
    Array<{ id: string; content: string }>
  >([]);
  const [isCallOnHold, setIsCallOnHold] = React.useState<boolean>(false);
  const [isCallMuted, setIsCallMuted] = React.useState<boolean>(false);
  const [outgoingTo, setOutgoingTo] = React.useState<string>('');

  const handleCall = React.useCallback(async (call: Call) => {
    const [from, sid, state, to] = await getCallInfo(call);

    Object.values(Call.Event).forEach((callEvent) => {
      call.on(callEvent, async () => {
        const [_from, _sid, _state, _to] = await getCallInfo(call);

        setEvents((_events) => [
          ..._events,
          {
            id: `${_events.length}`,
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
      sendDigits: (_digits: string) => () => call.sendDigits(_digits),
    });

    setCallInfo({ from, sid, state, to });
  }, []);

  const connectHandler = React.useCallback(async () => {
    const call = await voice.connect(token, {
      recipientType: 'client',
      To: outgoingTo,
    });
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

  const callInviteAcceptHandler = React.useCallback(async () => {
    if (!callInvites.length) {
      return;
    }

    const callInvite = callInvites[callInvites.length - 1];
    const call = await callInvite.accept();
    handleCall(call);
  }, [handleCall, callInvites]);

  const callInviteRejectHandler = React.useCallback(async () => {
    if (!callInvites.length) {
      return;
    }

    const callInvite = callInvites[callInvites.length - 1];
    const call = await callInvite.reject();
    handleCall(call);
  }, [handleCall, callInvites]);

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);

    voice.on(Voice.Event.CallInvite, async (_callInvite: CallInvite) => {
      const [_callSid, _from, _to] = await Promise.all([
        _callInvite.getCallSid(),
        _callInvite.getFrom(),
        _callInvite.getTo(),
      ]);

      setCallInvites((_callInvites) => [
        ..._callInvites,
        {
          accept: () => _callInvite.accept(),
          callSid: _callSid,
          from: _from,
          to: _to,
          reject: () => _callInvite.reject(),
        },
      ]);

      setEvents((_events) => [
        ..._events,
        {
          id: `${_events.length}`,
          content: `Call invite: ${_callSid}`,
        },
      ]);
    });

    voice.on(
      Voice.Event.CanceledCallInvite,
      async (_canceledCallInvite: CanceledCallInvite) => {
        const _callSid = await _canceledCallInvite.getCallSid();

        setCallInvites((_callInvites) =>
          _callInvites.filter(({ callSid }) => callSid !== _callSid)
        );

        setEvents((_events) => [
          ..._events,
          {
            id: `${_events.length}`,
            content: `Canceled call invite: ${_callSid}`,
          },
        ]);
      }
    );
  }, []);

  const recentCallInvite = React.useMemo(
    () =>
      callInvites.length ? callInvites[callInvites.length - 1] : undefined,
    [callInvites]
  );

  const button = React.useMemo(() => {
    if (callMethods && callInfo?.state !== 'DISCONNECTED') {
      return <Button title="Disconnect" onPress={callMethods.disconnect} />;
    }

    if (recentCallInvite) {
      return (
        <View>
          <Button title="Accept" onPress={callInviteAcceptHandler} />
          <Button title="Reject" onPress={callInviteRejectHandler} />
        </View>
      );
    }

    return <Button title="Connect" onPress={connectHandler} />;
  }, [callMethods, callInfo, connectHandler, recentCallInvite]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text>SDK Version: {String(sdkVersion)}</Text>
        <Text>Registered: {String(registered)}</Text>
      </View>
      <View style={styles.padded}>
        <Text>Call Info</Text>
        <Text>From: {String(callInfo?.from)}</Text>
        <Text>To: {String(callInfo?.to)}</Text>
        <Text>State: {String(callInfo?.state)}</Text>
        <Text>SID: {String(callInfo?.sid)}</Text>
      </View>
      <View style={styles.padded}>
        <Text>Call Invite</Text>
        <Text>Call SID: {String(recentCallInvite?.callSid)}</Text>
        <Text>From: {String(recentCallInvite?.from)}</Text>
        <Text>To: {String(recentCallInvite?.to)}</Text>
      </View>
      <View style={styles.eventsContainer}>
        <Text>Events</Text>
        <FlatList
          style={styles.eventsList}
          data={events}
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
        <View style={styles.input}>
          <Text>Digits: </Text>
          <TextInput
            style={styles.textInput}
            value={digits}
            onChangeText={(text) => setDigits(text)}
          />
          <Button
            title="Send"
            onPress={callMethods?.sendDigits(digits) || noOp}
          />
        </View>
      </View>
      <View>
        <View style={styles.padded}>{button}</View>
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
        <View style={styles.padded}>
          {registered ? (
            <Button title="Unregister" onPress={unregisterHandler} />
          ) : (
            <Button title="Register" onPress={registerHandler} />
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  padded: {
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
