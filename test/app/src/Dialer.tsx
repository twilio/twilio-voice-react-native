import * as React from 'react';
import { Call } from '@twilio/voice-react-native-sdk';
import { Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNoOp } from './hook';
import type { BoundCallMethod, BoundCallInfo, BoundCallInvite } from './type';
import Grid from './Grid';
import CallMessageComponent, {
  CallMessageContext,
} from './components/CallMessage';

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
  const sendMessageNoOp = useNoOp('send messsage');
  const disconnectNoOp = useNoOp('disconnect');
  const muteNoOp = useNoOp('mute');
  const holdNoOp = useNoOp('hold');
  const acceptNoOp = useNoOp('accept');
  const rejectNoOp = useNoOp('reject');
  const postFeedbackNoOp = useNoOp('post feedback');
  const getStatsNoOp = useNoOp('get stats');

  const connectHandler = React.useCallback(
    () => onConnect(outgoingTo),
    [onConnect, outgoingTo]
  );

  const activeCall = React.useMemo(
    () => callMethod && callInfo?.state !== Call.State.Disconnected,
    [callMethod, callInfo]
  );

  const callButtons = React.useMemo(
    () => [
      [
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
        </View>,
      ],
      [
        <Button
          title={callInfo?.isMuted ? 'Unmute' : 'Mute'}
          onPress={callMethod?.mute || muteNoOp}
        />,
        <Button
          title={callInfo?.isOnHold ? 'Unhold' : 'Hold'}
          onPress={callMethod?.hold || holdNoOp}
        />,
      ],
      [
        <Button
          title="Disconnect"
          onPress={callMethod?.disconnect || disconnectNoOp}
        />,
        <Button
          title="Post feedback"
          onPress={
            callMethod?.postFeedback(Call.Score.Four, Call.Issue.ChoppyAudio) ||
            postFeedbackNoOp
          }
        />,
        <Button
          title="Get Stats"
          onPress={callMethod?.getStats || getStatsNoOp}
        />,
      ],
      [
        <CallMessageComponent
          context={CallMessageContext.Call}
          callMethod={callMethod}
          sendMessageNoOp={sendMessageNoOp}
        />,
      ],
    ],
    [
      callInfo?.isMuted,
      callInfo?.isOnHold,
      callMethod,
      digits,
      disconnectNoOp,
      getStatsNoOp,
      holdNoOp,
      muteNoOp,
      postFeedbackNoOp,
      sendDigitsNoOp,
      sendMessageNoOp,
    ]
  );

  const callInviteButtons = React.useMemo(
    () => [
      [
        <Button
          title="Accept"
          onPress={recentCallInvite?.accept || acceptNoOp}
        />,
        <Button
          title="Reject"
          onPress={recentCallInvite?.reject || rejectNoOp}
        />,
      ],
      [
        <CallMessageComponent
          context={CallMessageContext.CallInvite}
          recentCallInvite={recentCallInvite}
          sendMessageNoOp={sendMessageNoOp}
        />,
      ],
    ],
    [acceptNoOp, rejectNoOp, recentCallInvite, sendMessageNoOp]
  );

  if (activeCall) {
    return (
      <Grid
        gridComponents={callButtons}
        horizontalGapSize={5}
        verticalGapSize={5}
      />
    );
  }

  if (recentCallInvite) {
    return (
      <Grid
        gridComponents={callInviteButtons}
        horizontalGapSize={5}
        verticalGapSize={5}
      />
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
