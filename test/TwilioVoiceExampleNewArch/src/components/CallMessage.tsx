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
      ? { ahoy: 'This is a message from a Call' }
      : { ahoy: 'This is a message from a Call Invite' };

  const validMessage = {
    content: validMessageContent,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  };

  const handleSendValidMessage = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(validMessage)
      : recentCallInvite?.sendMessage(validMessage);
  };

  const largeMessage = {
    content: MESSAGE_CONTENT_EXCEEDING_MAX_PAYLOAD_SIZE,
    contentType: 'application/json',
    messageType: 'user-defined-message',
  };

  const handleSendLargeMessage = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(largeMessage)
      : recentCallInvite?.sendMessage(largeMessage);
  };

  const invalidContentTypeMessage = {
    content: { foo: 'bar' },
    contentType: 'not a real content type foobar',
    messageType: 'user-defined-message',
  };

  const handleSendInvalidContentType = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(invalidContentTypeMessage)
      : recentCallInvite?.sendMessage(invalidContentTypeMessage);
  };

  const invalidMessageTypeMessage = {
    content: { foo: 'bar' },
    contentType: 'application/json',
    messageType: 'not a real message type foobar',
  };

  const handleSendInvalidMessageType = () => {
    context === CallMessageContext.Call
      ? callMethod?.sendMessage(invalidMessageTypeMessage)
      : recentCallInvite?.sendMessage(invalidMessageTypeMessage);
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
        [
          <Button
            title="Send Invalid Content Type"
            onPress={handleSendInvalidContentType || sendMessageNoOp}
          />,
          <Button
            title="Send Invalid Message Type"
            onPress={handleSendInvalidMessageType || sendMessageNoOp}
          />,
        ],
      ]}
    />
  );
}
