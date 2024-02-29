import type {
  NativeCallInviteInfo,
  NativeCancelledCallInviteInfo,
} from '../type/CallInvite';
import { Constants } from '../constants';
import { createNativeErrorInfo } from './Error';
import { createNativeCallMessageInfo } from './CallMessage';

export function createNativeCallInviteInfo(): NativeCallInviteInfo {
  return {
    uuid: 'mock-nativecallinviteinfo-uuid',
    callSid: 'mock-nativecallinviteinfo-callsid',
    customParameters: {
      'mock-nativecallinviteinfo-custom-parameter-key1':
        'mock-nativecallinviteinfo-custom-parameter-value1',
      'mock-nativecallinviteinfo-custom-parameter-key2':
        'mock-nativecallinviteinfo-custom-parameter-value2',
    },
    from: 'mock-nativecallinviteinfo-from',
    to: 'mock-nativecallinviteinfo-to',
  };
}

export function createNativeCancelledCallInviteInfo(): NativeCancelledCallInviteInfo {
  return {
    callSid: 'mock-nativecallinviteinfo-callsid',
    from: 'mock-nativecallinviteinfo-from',
    to: 'mock-nativecallinviteinfo-to',
  };
}

/**
 * Reusable default native callInvite events.
 */
export function createMockNativeCallInviteEvents() {
  return {
    accepted: {
      [Constants.CallInviteEventKeyType]:
        Constants.CallInviteEventTypeValueAccepted,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      callInvite: createNativeCallInviteInfo(),
    },
    notificationTapped: {
      [Constants.CallInviteEventKeyType]:
        Constants.CallInviteEventTypeValueNotificationTapped,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      callInvite: createNativeCallInviteInfo(),
    },
    rejected: {
      [Constants.CallInviteEventKeyType]:
        Constants.CallInviteEventTypeValueRejected,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      callInvite: createNativeCallInviteInfo(),
    },
    cancelled: {
      [Constants.CallInviteEventKeyType]:
        Constants.CallInviteEventTypeValueCancelled,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      cancelledCallInvite: createNativeCancelledCallInviteInfo(),
    },
    cancelledWithError: {
      [Constants.CallInviteEventKeyType]:
        Constants.CallInviteEventTypeValueCancelled,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      cancelledCallInvite: createNativeCancelledCallInviteInfo(),
      error: createNativeErrorInfo(),
    },
    messageReceived: {
      [Constants.CallInviteEventKeyType]: Constants.CallEventMessageReceived,
      [Constants.CallInviteEventKeyCallSid]:
        'mock-nativecallinviteinfo-callsid',
      callMessage: createNativeCallMessageInfo(),
    },
  } as const;
}
