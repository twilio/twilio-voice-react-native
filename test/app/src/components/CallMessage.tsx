import { CallMessage } from '@twilio/voice-react-native-sdk';
import * as React from 'react';
import { Button } from 'react-native';
import Grid from '../Grid';
import type { BoundCallMethod, BoundCallInvite } from '../type';

export enum CallMessageContext {
  Call = 'Call',
  CallInvite = 'CallInvite',
}

interface CallMessageComponentProps {
  context: CallMessageContext;
  callMethod?: BoundCallMethod | null;
  recentCallInvite?: BoundCallInvite | null;
  sendMessageNoOp: () => void;
}

const MESSAGE_CONTENT_EXCEEDING_MAX_PAYLOAD_SIZE = Array(10000)
  .fill('foobar')
  .join('');

export default function CallMessageComponent({
  context,
  callMethod,
  recentCallInvite,
  sendMessageNoOp,
}: CallMessageComponentProps) {
  const validMessageContent =
    context === CallMessageContext.Call
      ? 'This is a message from a Call'
      : 'This is a message from a Call Invite';

  const validMessage = new CallMessage({
    content: validMessageContent,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  });

  const handleSendValidMessage = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(validMessage)
      : recentCallInvite?.sendMessage(validMessage);
  };

  const largeMessage = new CallMessage({
    content: MESSAGE_CONTENT_EXCEEDING_MAX_PAYLOAD_SIZE,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  });

  const handleSendLargeMessage = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(largeMessage)
      : recentCallInvite?.sendMessage(largeMessage);
  };

  return (
    <Grid
      gridComponents={[
        [
          <Button
            title="Send Valid Message"
            onPress={handleSendValidMessage || sendMessageNoOp}
          />,
          <Button
            title="Send Large Message"
            onPress={handleSendLargeMessage || sendMessageNoOp}
          />,
        ],
      ]}
    />
  );
}
