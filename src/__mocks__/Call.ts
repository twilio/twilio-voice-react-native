import type { NativeCallInfo } from '../type/Call';

export function createDefaultMockNativeCallInfo(): NativeCallInfo {
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
