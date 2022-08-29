import type { NativeCallInviteInfo } from '../type/CallInvite';

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
