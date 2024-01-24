import { Constants } from '../constants';
import type { NativeCallMessageInfo } from '../type/CallMessage';
import { createNativeErrorInfo } from './Error';

export function createNativeCallMessageInfo(): NativeCallMessageInfo {
  return {
    callMessageContent: 'mock-nativecallmessageinfo-content',
    callMessageContentType: 'mock-nativecallmessageinfo-contentType',
    callMessageType: 'mock-nativecallmessageinfo-messageType',
    callMessageSID: 'mock-nativecallmessageinfo-messageSID',
  };
}

export const mockCallMessageNativeEvents = {
  sent: {
    name: Constants.CallEventMessageSent,
    nativeEvent: {
      type: Constants.CallEventMessageSent,
      callMessageSID: 'mock-nativecallmessageinfo-messageSID',
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
