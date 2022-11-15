import type { NativeCallInfo } from '../../../src/type/Call';
import { Constants } from '../../../src/constants';
import { createNativeErrorInfo } from './Error';

export function createNativeCallInfo(): NativeCallInfo {
  return {
    uuid: 'mock-nativecallinfo-uuid',
    customParameters: {
      'mock-nativecallinfo-custom-parameter-key1':
        'mock-nativecallinfo-custom-parameter-value1',
      'mock-nativecallinfo-custom-parameter-key2':
        'mock-nativecallinfo-custom-parameter-value2',
    },
    from: 'mock-nativecallinfo-from',
    isMuted: false,
    isOnHold: false,
    sid: 'mock-nativecallinfo-sid',
    to: 'mock-nativecallinfo-to',
  };
}

/**
 * Reusable default native call events.
 */
export const mockCallNativeEvents = {
  connected: {
    name: Constants.CallEventConnected,
    nativeEvent: {
      type: Constants.CallEventConnected,
      call: createNativeCallInfo(),
    },
  },
  connectFailure: {
    name: Constants.CallEventConnectFailure,
    nativeEvent: {
      type: Constants.CallEventConnectFailure,
      call: createNativeCallInfo(),
      error: createNativeErrorInfo(),
    },
  },
  disconnected: {
    name: Constants.CallEventDisconnected,
    nativeEvent: {
      type: Constants.CallEventDisconnected,
      call: createNativeCallInfo(),
    },
  },
  disconnectedWithError: {
    name: `${Constants.CallEventDisconnected} with error`,
    nativeEvent: {
      type: Constants.CallEventDisconnected,
      call: createNativeCallInfo(),
      error: createNativeErrorInfo(),
    },
  },
  reconnected: {
    name: Constants.CallEventReconnected,
    nativeEvent: {
      type: Constants.CallEventReconnected,
      call: createNativeCallInfo(),
    },
  },
  reconnecting: {
    name: Constants.CallEventReconnecting,
    nativeEvent: {
      type: Constants.CallEventReconnecting,
      call: createNativeCallInfo(),
      error: createNativeErrorInfo(),
    },
  },
  ringing: {
    name: Constants.CallEventRinging,
    nativeEvent: {
      type: Constants.CallEventRinging,
      call: createNativeCallInfo(),
    },
  },
  qualityWarningsChanged: {
    name: Constants.CallEventQualityWarningsChanged,
    nativeEvent: {
      type: Constants.CallEventQualityWarningsChanged,
      call: createNativeCallInfo(),
      currentWarnings: [
        'mock-callqualitywarningschangedevent-nativeevent-currentwarnings',
      ],
      previousWarnings: [
        'mock-callqualitywarningschangedevent-nativeevent-previouswarnings',
      ],
    },
  },
};
