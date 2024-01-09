import type { NativeCallMessageInfo } from '../type/CallMessage';

export function createNativeCallMessageInfo(): NativeCallMessageInfo {
  return {
    callMessageContent: 'mock-nativecallmessageinfo-content',
    callMessageContentType: 'mock-nativecallmessageinfo-contentType',
    callMessageType: 'mock-nativecallmessageinfo-messageType',
    callMessageSID: 'mock-nativecallmessageinfo-messageSID',
  };
}
