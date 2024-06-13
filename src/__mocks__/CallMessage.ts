import { Constants } from '../constants';
import type { NativeCallMessageInfo } from '../type/CallMessage';
import { createNativeErrorInfo } from './Error';

export function createNativeCallMessageInfo(): NativeCallMessageInfo {
  return {
    content: { key1: 'mock-nativecallmessageinfo-content' },
    contentType: 'application/json',
    messageType: 'user-defined-message',
    voiceEventSid: 'mock-nativecallmessageinfo-voiceEventSid',
  };
}

export function createNativeCallMessageInfoSid(
  voiceEventSid: string
): NativeCallMessageInfo {
  return {
    content: { key1: 'mock-nativecallmessageinfo-content' },
    contentType: 'application/json',
    messageType: 'user-defined-message',
    voiceEventSid,
  };
}

export const mockCallMessageNativeEvents = {
  failure: {
    name: Constants.CallEventMessageFailure,
    nativeEvent: {
      type: Constants.CallEventMessageFailure,
      [Constants.VoiceEventSid]: '123',
      error: createNativeErrorInfo(),
    },
  },
  sent: {
    name: Constants.CallEventMessageSent,
    nativeEvent: {
      type: Constants.CallEventMessageSent,
      [Constants.VoiceEventSid]: '456',
    },
  },
};
