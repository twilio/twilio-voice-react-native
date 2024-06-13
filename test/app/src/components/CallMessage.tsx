import { CallMessage } from '@twilio/voice-react-native-sdk';
import * as React from 'react';
import { Button } from 'react-native';
import Grid from '../Grid';
import type { BoundCallMethod, BoundCallInvite } from '../type';
import { invalidContent } from '../constants';

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

export default function CallMessageComponent({
  context,
  callMethod,
  recentCallInvite,
  sendMessageNoOp,
}: CallMessageComponentProps) {
  const messageContent =
    context === CallMessageContext.Call
      ? 'This is a message from a Call'
      : 'This is a message from a Call Invite';
  const callMessage = new CallMessage({
    content: messageContent,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  });
  const handleSendMessage = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(callMessage)
      : recentCallInvite?.sendMessage(callMessage);
  };

  const callMessageInvalidContent = new CallMessage({
    content: invalidContent,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  });
  const handleTriggerError = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(callMessageInvalidContent)
      : recentCallInvite?.sendMessage(callMessageInvalidContent);
  };

  return (
    <Grid
      gridComponents={[
        [
          <Button
            title={`Send: "${messageContent}"`}
            onPress={handleSendMessage || sendMessageNoOp}
          />,
          <Button
            title={`Trigger ${context} SendMessage Error`}
            onPress={handleTriggerError || sendMessageNoOp}
          />,
        ],
      ]}
    />
  );
}
