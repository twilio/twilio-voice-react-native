import * as React from 'react';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNoOp } from './hook';
import type { BoundCallMethod, BoundCallInfo, BoundCallInvite } from './type';
import Grid from './Grid';

interface DialerProps {
  callInfo: BoundCallInfo | null;
  callMethod: BoundCallMethod | null;
  onConnect: (to: string) => Promise<void>;
  recentCallInvite: BoundCallInvite | null;
}

export default function Dialer({
  callInfo,
  callMethod,
  onConnect,
  recentCallInvite,
}: DialerProps) {
  const [digits, setDigits] = React.useState<string>('');
  const [outgoingTo, setOutgoingTo] = React.useState<string>('');

  const sendDigitsNoOp = useNoOp('send digits');
  const disconnectNoOp = useNoOp('disconnect');
  const muteNoOp = useNoOp('mute');
  const holdNoOp = useNoOp('hold');

  const connectHandler = React.useCallback(
    () => onConnect(outgoingTo),
    [onConnect, outgoingTo]
  );

  const activeCall = React.useMemo(
    () => callMethod && callInfo?.state !== 'DISCONNECTED',
    [callMethod, callInfo]
  );

  const callButtons = React.useMemo(
    () => [
      [
        <View style={styles.padded}>
          <Button
            title={callInfo?.isMuted ? 'Unmute' : 'Mute'}
            onPress={callMethod?.mute || muteNoOp}
          />
        </View>,
        <View style={styles.padded}>
          <Button
            title={callInfo?.isOnHold ? 'Unhold' : 'Hold'}
            onPress={callMethod?.hold || holdNoOp}
          />
        </View>,
      ],
    ],
    [callInfo, callMethod, holdNoOp, muteNoOp]
  );

  if (activeCall) {
    return (
      <View style={styles.padded}>
        <View style={styles.input}>
          <Text style={styles.padded}>Digits</Text>
          <TextInput
            style={composedStyles.textBox}
            value={digits}
            onChangeText={setDigits}
          />
          <View style={styles.padded}>
            <Button
              title="Send"
              onPress={callMethod?.sendDigits(digits) || sendDigitsNoOp}
            />
          </View>
        </View>
        <Grid gridComponents={callButtons} />
        <Button
          title="Disconnect"
          onPress={callMethod?.disconnect || disconnectNoOp}
        />
      </View>
    );
  }

  if (recentCallInvite) {
    return (
      <View style={composedStyles.incomingButton}>
        <Button title="Accept" onPress={recentCallInvite.accept} />
        <Button title="Reject" onPress={recentCallInvite.reject} />
      </View>
    );
  }

  return (
    <View style={styles.input}>
      <Text style={styles.padded}>To</Text>
      <TextInput
        style={composedStyles.textBox}
        value={outgoingTo}
        onChangeText={setOutgoingTo}
      />
      <View style={styles.padded}>
        <Button title="Connect" onPress={connectHandler} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  expand: {
    flex: 1,
  },
  padded: {
    padding: 5,
  },
  rowContainer: {
    flexDirection: 'row',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    borderWidth: 0.5,
  },
});

const composedStyles = {
  textBox: [styles.expand, styles.textInput, styles.padded],
  incomingButton: [styles.rowContainer, styles.padded],
};
