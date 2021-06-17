import * as React from 'react';

import { Button, StyleSheet, View, Text } from 'react-native';
import { Voice, RegistrationChannel } from 'twilio-voice-react-native';

const voice = new Voice('token');

export default function App() {
  const [sdkVersion, setSdkVersion] = React.useState<string>('unknown');
  const [registered, setRegistered] = React.useState<boolean>(false);
  const [call, setCall] = React.useState<Call | undefined>();

  const disconnectHandler = React.useCallback(() => {
    console.log(call);
    call?.disconnect();
  }, [call]);

  const connectHandler = React.useCallback(() => {
    voice.connect().then(setCall);
  }, []);

  const registerHandler = React.useCallback(() => {
    voice.register('foobar-device-token', RegistrationChannel.FCM);
  }, []);

  React.useEffect(() => {
    voice.getVersion().then(setSdkVersion);
    voice.on(Voice.Event.Registered, () => setRegistered(true));
  }, []);

  return (
    <View style={styles.container}>
      <Text>SDK Version: {sdkVersion}</Text>
      <Button title="Connect" onPress={connectHandler} />
      <Button title="Disconnect" onPress={disconnectHandler} />
      <Button title="Register" onPress={registerHandler} />
      <Text>Registered: {String(registered)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
