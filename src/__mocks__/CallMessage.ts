import { CallMessage } from '../CallMessage';
import { Constants } from '../constants';
import type { NativeCallMessageInfo } from '../type/CallMessage';
import { createNativeErrorInfo } from './Error';

export function createNativeCallMessageInfo(): NativeCallMessageInfo {
  return {
    content: { key1: 'mock-nativecallmessageinfo-content' },
    contentType: CallMessage.ContentType.ApplicationJson,
    messageType: CallMessage.MessageType.UserDefinedMessage,
    voiceEventSid: 'mock-nativecallmessageinfo-voiceEventSid',
  };
}

export const mockCallMessageNativeEvents = {
  sent: {
    name: Constants.CallEventMessageSent,
    nativeEvent: {
      type: Constants.CallEventMessageSent,
    },
  },
  failure: {
    name: Constants.CallEventMessageFailure,
    nativeEvent: {
      type: Constants.CallEventMessageFailure,
      error: createNativeErrorInfo(),
    },
  },
};
