import type { NativeCancelledCallInviteInfo } from '../type/CallInvite';

export function createNativeCancelledCallInviteInfo(): NativeCancelledCallInviteInfo {
  return {
    callSid: 'mock-nativecancelledcallinviteinfo-callsid',
    from: 'mock-nativecancelledcallinviteinfo-from',
    to: 'mock-nativecancelledcallinviteinfo-to',
  };
}
