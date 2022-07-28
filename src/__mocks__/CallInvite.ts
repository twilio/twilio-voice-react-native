import type { NativeCallInviteInfo } from '../type/CallInvite';

export function createDefaultMockNativeCallInviteInfo(): NativeCallInviteInfo {
  return {
    uuid: 'mock-nativecallinviteinfo-uuid',
    callSid: 'mock-nativecallinviteinfo-callsid',
    customParameters: {},
    from: 'mock-nativecallinviteinfo-from',
    to: 'mock-nativecallinviteinfo-to',
  };
}
